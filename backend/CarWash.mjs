import { writeFile, readFile } from 'fs/promises';
import  {Weather}  from './Weather.mjs';

export default class CarWash {
    constructor() {
        this.cars=0;
        this.motorcycles=0;
        this.washes =0;
        this.dailyMoney = 0;
        this.simplewash=0;
        this.premiumwash=0;
        this.simpleprice= 10;
        this.premiumprice= 20;
        this.history = [];
        this.overall = 0 ;
    }  
addWash (vehicle , washType ) {
    const validVehicles = ['Car', 'Motorcycle'];
    const validTypes = ['Simple', 'Premium'];
    if (!validVehicles.includes(vehicle)) {
        console.log(`${vehicle} is not a valid vehicle`);
        return;
    }
    if (!validTypes.includes(washType)) {
        console.log(`${washType} is not a valid wash type`);
        return;
    }
    if (vehicle === 'Car' ) {
        this.cars++; 
        this.washes++;
    }
    else if (vehicle === 'Motorcycle') {
        this.motorcycles++;
        this.washes++;
    }      
    else {
        console.log('Not valid Entry')
        return;
    }
    this.fixedPrice(vehicle, washType);

    }


async Show () {
    const todaystring = new Date().toLocaleDateString();
    const pastmoney= this.history.filter(d => d.date !== todaystring);
    const totalpastmoney = pastmoney.reduce((total, entry) => total + entry.money, 0);
    this.overall = totalpastmoney + this.dailyMoney;
    
    let weatherdata = await Weather();
    if (weatherdata === null) {
        console.log("Could not retrieve weather information right now.")
        return }
    
    await this.SaveData();
    return {
        revenue: {
            today : this.dailyMoney,
            past : totalpastmoney,
            total : this.overall
        },
        counts: {
            cars : this.cars,
            motorcycles : this.motorcycles,
            washes : this.washes,
            simplewash : this.simplewash,
            premiumwash : this.premiumwash
        },
        weather: {
            currenttemp : weatherdata.currenttemp,
            tomorrowmin : weatherdata.tomorrowmin,
            tomorrowmax : weatherdata.tomorrowmax,
            wind : weatherdata.wind 
        }
    }
        }


fixedPrice(vehicle, washType) {
     if (washType === 'Simple') {
        this.simplewash++;
        this.dailyMoney += this.simpleprice;
    } else if (washType === 'Premium') {
        this.premiumwash++;
        this.dailyMoney += this.premiumprice;
    }
    else {
        console.log(` ${washType} is Not a Valid Entry` )
    }
}

async SaveData () {
    const todaystring = new Date().toLocaleDateString();
    const Data = {
        money : this.dailyMoney,
        cars : this.cars,
        motorcycles : this.motorcycles,
        washes : this.washes,
        simplewash : this.simplewash,
        premiumwash : this.premiumwash,
        date : todaystring
    }
    try {     
        try {  
        const content = await readFile('wash_stats.json', 'utf-8');
        this.history = JSON.parse(content);
        } catch (e) {
            this.history = [];
        }
        const index = this.history.findIndex(entry => entry.date === todaystring);
        if (index !== -1) {
            this.history[index] = Data; }
            else {
            this.history.push(Data);
        }    
        await writeFile('wash_stats.json', JSON.stringify(this.history, null , 2))
        console.log ("Τα δεδομένα αποθηκεύτηκαν με επιτυχία!")
    } catch(err) {
        console.error("Error Saving File" , err)
    }
}

async LoadData () {
    try {
        const datastring = await readFile('wash_stats.json', 'utf-8'); 
        this.history = JSON.parse(datastring);
        if (this.history.length > 0) {
            const lastEntry = this.history[this.history.length - 1];
            const todaystr=new Date().toLocaleDateString(); 

            if (lastEntry.date === todaystr)  {
                this.dailyMoney = lastEntry.money || 0;
                this.cars = lastEntry.cars || 0;
                this.motorcycles = lastEntry.motorcycles || 0;
                this.washes = lastEntry.washes || 0;
                this.simplewash = lastEntry.simplewash || 0;
                this.premiumwash = lastEntry.premiumwash || 0;
            }
            else {
            this.dailyMoney = 0;
                this.cars = 0;
                this.motorcycles = 0;
                this.washes = 0;
                this.simplewash = 0;
                this.premiumwash = 0;
            }
        console.log ('Τα δεδομένα φορτώθηκαν με επιτυχία')
    }} 
        catch (err){
            console.error('Error Loading File , starting Fresh' , err)
            this.history = [];
        }
    }


async resetData () {
    this.cars = 0;
    this.motorcycles = 0;
    this.washes = 0;
    this.dailyMoney = 0;
    this.simplewash = 0;
    this.premiumwash = 0;
    this.overall = 0;
    await this.SaveData();   
    console.log ('All stats are reset')
}

}

//localStorage.setItem('Total Money' ,this.dailyMoney) in case this was run on a browser


