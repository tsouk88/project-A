import twilio from 'twilio';
import  {Weather}  from './Weather.js';
import CarWash from './CarWash.js';

type Object = {
    dailyrev : number;
    wind : number;
}

export async function sendSMS(message: string) : Promise<void> {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    try {
        await client.messages.create({
    body: message,
    from: 'whatsapp:+14155238886',
    to:`whatsapp:${process.env.OWNER_PHONE}`
        });
    
    }
    catch(error) {
        console.error(`Cannot send SMS , ${error}`)
    }
}

export async function checkRevenue(wash : CarWash): Promise <Object> {
const data = await wash.Show() as any;
const weatherdata = await Weather() as any;
const dailyrev = Number(data.revenue.today);
const wind = Number(weatherdata.wind);
return { dailyrev , wind};
}
