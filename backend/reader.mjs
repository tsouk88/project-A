import fs from 'fs/promises'
const data= './wash_stats.json'

export default async function LoadData() {
    try {
        const info = await fs.readFile(data, 'utf-8');
        const rawinfo = JSON.parse(info);
        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() - 1);
        const week = rawinfo.filter(w => {
            const parts = w.date.split("/"); 
            const isoDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            return isoDate >= startOfWeek;
        });
        const sentences = week.map(t => `Στις ${t.date} είχαμε ${t.cars} αυτοκίνητα και ${t.motorcycles} μηχανές, είχαμε συνολικά  ${t.washes} πλυσίματα εκ των οποίων τα ${t.simplewash} ήταν απλά πλυσίματα και τα ${t.premiumwash} Premium. Τα χρήματα που βγάλαμε ήταν ${t.money}`)
        const finalstring =sentences.join('\n');
        const totalMoney = week.reduce((sum, t) => sum + t.money, 0);
        const totalWashes = week.reduce((sum, t) => sum + t.washes, 0);
        const summary = `\nΣΥΝΟΛΙΚΑ ΕΒΔΟΜΑΔΑΣ: ${totalWashes} πλυσίματα, Έσοδα ${totalMoney}€.`;
        return  finalstring + summary
    } catch (error) {
        console.error('Something went wrong:', error);  
    }   
    }