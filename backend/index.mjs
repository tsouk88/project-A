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
    const fullData = await myWash.Show();
    const weatherInfo = fullData.weather;
    const messageid = req.body.messageid;
    let message = req.body.message;
    if (!message) {
        return res.status(400).json({ error: 'Missing message' });
    }
    try { 
             const currentWeather = await myWash.Show(); 
             const history = await getHistory(messageid);
             const role = `Είσαι βοηθός πλυντηρίου στη Χίο. 
            ΚΑΙΡΟΣ (Context): ${JSON.stringify(weatherInfo)}

            ΟΔΗΓΙΕΣ:
            1. Αν σε ρωτησουν για τον καιρο Απάντησε για τον καιρό.
            2. Αν υπάρχει κράτηση, γράψε "Η κράτηση έγινε!" και μετά ΣΤΑΝΤΑΡ τον πίνακα JSON.

            ΠΑΡΑΔΕΙΓΜΑ ΕΞΟΔΟΥ ΚΡΑΤΗΣΗΣ(ΑΝΤΙΓΡΑΨΕ ΑΥΤΗ ΤΗ ΔΟΜΗ):
             Η κράτηση έγινε!
            [{"tool": "addwash", "vehicle": "Car", "washType": "Premium"}, {"tool": "addwash", "vehicle": "Motorcycle", "washType": "Simple"}]
            ΠΑΡΑΔΕΙΓΜΑ ΕΞΟΔΟΥ ΚΑΙΡΟΥ : Ο καιρός είναι καλός ' 
            αν ο καιρος δεν ειναι Ν/Α γραψε και τη θερμοκρασια που έχει τώρα ή ότι σου ζητησει ο χρήστης
                        ΠΡΟΣΟΧΗ:
            - Μην χρησιμοποιείς \`\`\`json ή \`\`\`.
            - Μην γράφεις οδηγίες μέσα στην απάντηση.
            - Ξεκίνα τον πίνακα [ αμέσως μετά το κείμενο.`;
                      
             const cleanHistory = history.map(item => ({
                                    role: item.role,
                                 parts: [{ text: item.parts[0].text }] 
                                                      }));       
            const currentmessage = `System Instructions: ${role} 
                       Weather Context : ${JSON.stringify(currentWeather.weather)} 
                      User Message: ${message}`;
          cleanHistory.push({ role: "user", parts: [{ text: currentmessage }] });
    
            const aiResponse = await AskGemma(role , cleanHistory);
            if (aiResponse) {
                     if (aiResponse.toLowerCase().includes("addwash" && aiResponse.includes("["))) {
                    const start = aiResponse.indexOf('[');
                    const end = aiResponse.lastIndexOf(']') +1;
                    const part = aiResponse.substring(start, end );
                    const data = JSON.parse(part);                    
                    console.log (data);
                    data.forEach(item =>  {
                        let v = item.vehicle.toLowerCase() === 'motorcycle' ? 'Motorcycle' : 'Car';
                        let rawType = item.washType || item.wash_type || "Simple";
                        let t = rawType.toLowerCase().includes('premium') ? 'Premium' : 'Simple';
                        myWash.addWash(v, t);
                        console.log (`New wash added : ${item.vehicle} ${item.washType}`)
                })
                     await myWash.SaveData();  
                }
                
                     await addHistory(messageid, 'user', message);
                     await addHistory(messageid, 'model', aiResponse);
                     let cleanResponse = aiResponse.split('[')[0].trim();
                    res.json({ response: cleanResponse });
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
