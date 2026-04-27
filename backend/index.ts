import express from 'express';
import cors from 'cors';
import CarWash from './CarWash.js';
import 'dotenv/config';
import AskGemma from './AI/Gemma.js';
import { getHistory , addHistory } from './AI/conversationHistory.js';
import LoadData from './reader.js';
import { sendSMS , checkRevenue} from './agent.js'
import { appendFile } from 'node:fs/promises';
import { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';

const app = express();
app.use(express.json());
app.use(cors());
const port = 3001;
const myWash = new CarWash();
await myWash.LoadData();
const limiter = rateLimit ({
    windowMs: 15 * 60 * 1000 ,
    max: 100,
    message: 'Too many requests'
})
app.use(limiter);
async function logError(error: unknown, context: string) {
    const timestamp = new Date().toLocaleString("el-GR", { timeZone: "Europe/Athens" });
    const message = `${timestamp} - ERROR in ${context}: ${error}\n`;
    await appendFile('app.log', message);
    console.error(message);
}

app.get('/', (req:Request, res:Response) => {
  res.send('CarWash API is Online');
});
app.get('/info' , ((req:Request, res:Response) => {
    res.send('The Carwash is always open 24/7')
}))
app.post('/API/add-wash', async (req:Request, res:Response) => {
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
app.post('/AI/chat' , async (req:Request, res:Response) => {
    const messageid = req.body.messageid;
    let message = req.body.message;
    if (!message) {
        return res.status(400).json({ error: 'Missing message' });
    }
    try { 
             const history = await getHistory(messageid);         
             const role = `Είσαι βοηθός πλυντηρίου αυτοκινήτων στη Χίο.
                            Μπορείς να:
                            - Απαντάς σε γενικές ερωτήσεις για το πλυντήριο
                            - Ενημερώνεις για τον καιρό όταν σε ρωτάνε, χρησιμοποιεις μονο στοιχεια που σου δινονται για τον καιρο
                            - Καταχωρείς κρατήσεις πλύσης χωρις να ρωρας λεπτομέρειες
                            ΣΤΑΤΙΣΤΙΚΑ - αν ο χρήστης ρωτήσει για stats/έσοδα/πλυσίματα:
                                Διάβασε τα δεδομένα που σου δίνω και απάντησε με φυσικό κείμενο.
                                ΠΑΡΑΔΕΙΓΜΑ: "Συνολικά είχατε 21 πλυσίματα και 300€ έσοδα."
                                Μην επιστρέφεις JSON για στατιστικά.
                            
                            ΚΡΑΤΗΣΕΙΣ - αν ο χρήστης κάνει κράτηση για ΠΟΛΛΑ οχήματα:
                            Γράψε ΕΝΑ αντικείμενο στο array ΓΙΑ ΚΑΘΕ όχημα ξεχωριστά.
                            - Μην γράφεις τίποτε άλλο
                            - Μην επαναλαμβάνεις οδηγίες
                            Χρησιμοποίησε "Motorcycle" για μηχανή και "Car" για αυτοκίνητο στο JSON.
                            Χρησιμοποίησε Simple ή Premium washtype στο JSON.
                            ΠΑΡΑΔΕΙΓΜΑ για "1 αυτοκίνητο simple και 1 μηχανή premium":
                            Η κράτηση έγινε!
                            [{"tool": "addwash", "vehicle": "Car", "washType": "Simple"}, {"tool": "addwash", "vehicle": "Motorcycle", "washType": "Premium"}]

                            ΠΑΡΑΔΕΙΓΜΑ για "1 αυτοκίνητο premium":
                            Η κράτηση έγινε!
                            [{"tool": "addwash", "vehicle": "Car", "washType": "Premium"}]

                            ΠΡΟΣΟΧΗ:
                            - Μην χρησιμοποιείς \`\`\`json
                            - Ξεκίνα τον πίνακα [ αμέσως μετά το κείμενο`;
                      
             const cleanHistory = history.map(item => ({
                                    role: item.role,
                                 parts: [{ text: item.parts[0].text }] 
                                                      }));
            const cleanMessage = message.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();  
            const weatherkeywords = ['καιρος', 'θερμοκρασια', 'αυριο', 'weather', 'temp', 'temperature', 'αερα']                                                
            const statskeywords = ['stats' , 'statistics' , 'εσοδα' , 'στατιστικα' , 'money' , 'ημερομηνια' , 'date' , 'λεφτα' , 'revenue' ]
            if (weatherkeywords.some(k => cleanMessage.includes(k))) { 
                const data = await myWash.Show() as any;
                const weatherInfo = `Τρέχουσα θερμοκρασία: ${data.weather.currenttemp}°C
                                     Αύριο: ${data.weather.tomorrowmin}°C - ${data.weather.tomorrowmax}°C
                                     Άνεμος: ${data.weather.wind} km/h`;   
                cleanHistory.push({ role: "user", parts: [{ text: message + '\n\nΚΑΙΡΟΣ:\n' + weatherInfo }] });   
                } else if (statskeywords.some(k => cleanMessage.includes(k))) {
                   const data = await LoadData();
                    cleanHistory.push({ role: "user", parts: [{ text: message + '\n\nΔΕΔΟΜΕΝΑ:\n' + data }] });
                } else {
                     cleanHistory.push({ role: "user", parts: [{ text: message }] });
                            }                                                                                           
            const aiResponse = await AskGemma(role , cleanHistory);
            if (aiResponse) {
                     if (aiResponse.toLowerCase().includes("addwash") && aiResponse.includes("[")) {
                    const start = aiResponse.lastIndexOf('[{"tool"');
                    const end = aiResponse.lastIndexOf(']') + 1;
                    const part = aiResponse.substring(start, end);
                    console.log('Trying to parse:', part);
                    try {
                        const data = JSON.parse(part);
                        console.log (data);
                        data.forEach((item:any) =>  {
                        let v = item.vehicle.toLowerCase() === 'motorcycle' ? 'Motorcycle' : 'Car';
                        let rawType = item.washType || item.wash_type || "Simple";
                        let t = rawType.toLowerCase().includes('premium') ? 'Premium' : 'Simple';
                        myWash.addWash(v, t);
                        console.log (`New wash added : ${item.vehicle} ${item.washType}`)
                })
                     await myWash.SaveData();  
                    }
                catch(error) {
                         await logError(error, '/AI/chat');
                       
                    }
                     }}
                     if (!aiResponse) return;
                     await addHistory(messageid, 'user', message);
                     await addHistory(messageid, 'model', aiResponse);
                     let cleanResponse = aiResponse
                        .replace(/\[\s*\]/g, '')  
                        .split('[')[0]             
                        .trim();
                    res.json({ response: cleanResponse });
              
            }
        
        catch (error) {
            await logError(error, '/AI/chat');
           res.status(500).json({ error: 'Failed to talk with Gemma' });
        }
    })
app.post('/AI/agent', async (req:Request, res:Response)  => {
    try {
    const now = new Date();
    const hours = now.getHours();
    const todaystr= new Date().toLocaleString("el-GR", { timeZone: "Europe/Athens" }); 
    if (hours !== 23) {
       const response = todaystr + ' - Time is not right now , will check back later'
       await appendFile('app.log' ,response + '\n' );
       res.json(response);
      return ;
    }
        const data = await checkRevenue(myWash);
        const thoughts: any[] = [{ time: todaystr, revenue: data.dailyrev, wind: data.wind }];
        if (data.dailyrev < 50 && data.wind <=20) {
            await sendSMS('Τα έσοδα είναι χαμηλά και ο καιρός καλός')
            thoughts.push({[todaystr] : 'Η αποστολή ολοκληρώθηκε'});
        }
        if (data.wind > 20) {
            const thought = `Aκύρωση SMS λόγω καιρού`;
            thoughts.push({[todaystr]: thought})
        }
        if (data.dailyrev > 50) {
            const thought = 'Ακύρωση SMS λόγω εσόδων';
            thoughts.push({[todaystr] : thought});
        }
        const logentry = JSON.stringify(thoughts);
        await appendFile('app.log' ,logentry + '\n' );
        res.json(thoughts);
     }
    catch(err) {
       console.error(err) 
       res.status(500).send('Internal Server Error');
    }
    })
app.get('/API/stats' , async (req:Request, res:Response) => {
    try {
    const data = await myWash.Show();
    res.json(data);
    } catch (error) {
       await logError(error, '/API/stats');
        res.status(500).send('Internal Server Error');
    }
})
app.get('/reset' , async (req:Request, res:Response) =>{
    try {
        await myWash.resetData();
        res.send('Everything is reset')
    } catch (error){
        console.error ('Cannot reset right now ' , error)
        res.status(500).send('Internal Server Error');
    }
    })
app.get('/API/money' , async (req:Request, res:Response) => {
    try {
        const data = await myWash.Show() as any;
        res.json(data.revenue);
    } catch (error) {
        console.error('Something went wrong:', error);
        res.status(500).send('Internal Server Error');
    }   })   
 app.get('/API/weather' , async (req:Request, res:Response) => {
    try {
        const data = await myWash.Show() as any;
        res.json(data.weather);
    } catch (error) {
        console.error('Something went wrong:', error);
        res.status(500).send('Internal Server Error');
    }   })   
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  setInterval(async () => {
    try {
        const todaystr =new Date().toLocaleString("el-GR", { timeZone: "Europe/Athens" });
        await fetch(`http://localhost:${port}/AI/agent`, { 
                method: 'POST' 
            });
            console.log('Agent wake up call sent');
            const saveonfile=todaystr + ' - Agent wake up call sent' ;
            await appendFile('app.log' ,saveonfile + '\n' );
             }
        catch (err){
            console.error(`Somethin went wrong , ${err}`)
        }    
  }, 1800000);
});
