import twilio from 'twilio';
import  {Weather}  from './Weather.mjs';

export async function sendSMS(message) {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    try {
        const info = await client.messages.create({
    body: message,
    from: 'whatsapp:+14155238886',
    to:`whatsapp:${process.env.OWNER_PHONE}`
        });
    
    }
    catch(error) {
        console.error(`Cannot send SMS , ${error}`)
    }
}

export async function checkRevenue(wash) {
const data = await wash.Show();
const weatherdata = await Weather();
const dailyrev = Number(data.revenue.today);
const wind = Number(weatherdata.wind);
return { dailyrev , wind};
}
