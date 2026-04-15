import express from 'express';
import CarWash from './CarWash.mjs';
import 'dotenv/config';
import AskGemma from './AI/Gemma.mjs';
import { getHistory , addHistory } from './AI/conversationHistory.mjs';

const app = express();
app.use(express.json());
const port = 3000;
const myWash = new CarWash();
await myWash.LoadData();
app.get('/', (req, res) => {
  res.send('CarWash API is Online');
});
app.get('/info' , (req, res) => {
    res.send('The Carwash is always open 24/7')
});
app.post('/API/add-wash', async (req, res) => {
    const { vehicle, washType } = req.body;
    const validvehicles = ['Car', 'Motorcycle'];
    const validtypes = ['Simple', 'Premium'];
        if (!validvehicles.includes(vehicle) || !validtypes.includes(washType)) {
            return res.status(400).json({ error: 'Invalid vehicle or wash type' , 
                received: { vehicle, washType },
                allowed: { vehicles: validvehicles, washType: validtypes } });
        }

    if (!vehicle || !washType) {
        return res.status(400).json({ error: 'Missing vehicle or washType' });
    }
    try {
        myWash.addWash(vehicle, washType);
        await myWash.SaveData();
        res.status(201).json({ 
            message: 'Wash recorded successfully',
            data: { vehicle, washType }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save wash' });
    }
});
app.post('/AI/chat' , async (req,res) => {
    const messageid = req.body.messageid;
    let message = req.body.message;
    if (!message) {
        return res.status(400).json({ error: 'Missing message' });
    }
    let history = await getHistory(messageid);
    const role = `Είσαι ο βοηθός του πλυντηρίου αυτοκινήτων στη Χίο. 
                ΣΚΟΠΟΣ: Να μαζέψεις 2 πληροφορίες: 1. Όχημα (Car/Motorcycle) και 2. Τύπο (Simple/Premium).
                ΚΑΝΟΝΕΣ:
                  - Αν ο χρήστης πει "μηχανή" ή "μοτοσυκλέτα", θεώρησέ το "Motorcycle".
                  - Αν ο χρήστης πει "αυτοκίνητο" ή "αμάξι", θεώρησέ το "Car".
                  - ΑΝ ΛΕΙΠΕΙ κάποια πληροφορία, ΡΩΤΑ μόνο γι' αυτήν.
                  - ΑΝ ΕΧΕΙΣ ΚΑΙ ΤΑ ΔΥΟ, κλείσε το ραντεβού και γράψε ΟΠΩΣΔΗΠΟΤΕ στο τέλος: {"tool" : "addwash" , "vehicle" : "Car ή Motorcycle" , "washType" : "Simple ή Premium"}
                Απάντα πάντα στα Ελληνικά.`;   
    let currentmessage = message ;
    if (history.length === 0) {
        currentmessage = `System Instructions: ${role} \n\n User Message: ${message}`;
    }
    history.push({ role: "user", parts: [{ text: currentmessage }] });
    
    try { 
            const aiResponse = await AskGemma(role , history);
            if (aiResponse) {
            if (aiResponse.toLowerCase().includes("addwash")) {
                try {
                    const start = aiResponse.indexOf('{');
                    const end = aiResponse.lastIndexOf('}') +1;
                    const part = aiResponse.substring(start, end );
                    const data = JSON.parse(part);
                    console.log (data);
                    myWash.addWash(data.vehicle, data.washType);
                    await myWash.SaveData();
                    console.log (`New wash added : ${data.vehicle} ${data.washType}`);
                }
                catch (e) {
                    console.error(`AI sent something different , ${e}`)
                }
                
            }
            await addHistory(messageid, 'user', currentmessage);
            await addHistory(messageid, 'model', aiResponse);
            let cleanResponse = aiResponse.split('{')[0].trim();
            res.json({ response: cleanResponse });
             
             } else {
            res.status(500).json({ error: 'Gemma sent an empty response' });
             }
        }
        catch (error) {
            console.error(error);
           res.status(500).json({ error: 'Failed to talk with Gemma' });
        }
    })
  
app.get('/API/stats' , async (req,res) => {
    try {
    const data = await myWash.Show();
    res.json(data);
    } catch (error) {
        console.error('Something went wrong:', error);
        res.status(500).send('Internal Server Error');
    }
})
app.get('/reset' , async (req,res) =>{
    try {
        await myWash.resetData();
        res.send('Everything is reset')
    } catch (error){
        console.error ('Cannot reset right now ' , error)
        res.status(500).send('Internal Server Error');
    }
    })
app.get('/API/money' , async (req , res) => {
    try {
        const data = await myWash.Show();
        res.json(data.revenue);
    } catch (error) {
        console.error('Something went wrong:', error);
        res.status(500).send('Internal Server Error');
    }   })   
 app.get('/API/weather' , async (req , res) => {
    try {
        const data = await myWash.Show();
        res.json(data.weather);
    } catch (error) {
        console.error('Something went wrong:', error);
        res.status(500).send('Internal Server Error');
    }   })   
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
