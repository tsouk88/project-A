import { writeFile, readFile } from 'fs/promises';
import  {Weather}  from './Weather.mjs';

class CarWash {
    constructor() {
        this.cars=0;
        this.motorcycles=0;
        this.washes24h =0;
        this.dailyMoney = 0;
        this.simplewash=0;
        this.premiumwash=0;
        this.simpleprice= 10;
        this.premiumprice= 20;
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
        this.washes24h++;
    }
    else if (vehicle === 'Motorcycle') {
        this.motorcycles++;
        this.washes24h++;
    }      
    else {
        console.log('Not valid Entry')
        return;
    }
    this.fixedPrice(vehicle, washType);

    }


async Show () {
    console.log(`Today we had ${this.cars} cars and ${this.motorcycles} motorcycles.`);
    console.log(`We gathered ${this.dailyMoney}€ today. `);
    console.log(`People used ${this.simplewash} Simple Washes and ${this.premiumwash} Premium Washes  `)
    let weatherdata = await Weather();
    if (weatherdata === null) {
        console.log("Could not retrieve weather information right now.")
        return }
    if (weatherdata.currenttemp !== null) {
        if (weatherdata.currenttemp > 15) {
            console.log(`Temperature right now is ${weatherdata.currenttemp} Celsius , it's kinda hot`);
        } else {
            console.log(`Temperature right now is ${weatherdata.currenttemp} Celsius , it's kinda cold`);
        }
        if (weatherdata.wind > 30) {
            console.log(`Watchout: Wind at (${weatherdata.wind} km/h)!`);
        }
        console.log(`Tomorrow will have max ${weatherdata.tomorrowmax} Celsius and min ${weatherdata.tomorrowmin} Celsius.`)
    } else {
        console.log("Could not retrieve weather information right now.");
    }
    await this.SaveData();
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
    const Data = {
        money : this.dailyMoney,
        cars : this.cars,
        motorcycles : this.motorcycles,
        washes24h : this.washes24h,
        simplewash : this.simplewash,
        premiumwash : this.premiumwash,
        date : new Date().toLocaleDateString()
    }
    try {       
        await writeFile('wash_stats.json', JSON.stringify(Data, null , 2))
        console.log ("Τα δεδομένα αποθηκεύτηκαν με επιτυχία!")
    } catch(err) {
        console.error("Error Saving File" , err)
    }
}

async LoadData () {
    try {
        const dataString = await readFile('wash_stats.json', 'utf-8'); 
        const SaveData = JSON.parse(dataString);
        this.dailyMoney = SaveData.money || 0;
        this.cars = SaveData.cars || 0;
        this.motorcycles = SaveData.motorcycles || 0;
        this.washes24h = SaveData.washes24h || 0;
        this.simplewash = SaveData.simplewash || 0;
        this.premiumwash = SaveData.premiumwash || 0   
        console.log ('Τα δεδομένα φορτώθηκαν με επιτυχία')} 
        catch (err){
            console.error('Error Loading File , starting Fresh' , err)
        }
    }


}

const myStation = new CarWash(); 

async function start (){
    try {
        await myStation.LoadData();
        myStation.addWash('Car', 'Premium'); 
        myStation.addWash('Motorcycle', 'Simple');
        myStation.addWash('Car', 'Premium'); 
        myStation.addWash('Motorcycle', 'Simple'); 
        myStation.addWash('Car', 'Premium'); 
        myStation.addWash('Motorcycle', 'Simple'); 
        myStation.addWash('Car', 'Simple'); 
        myStation.addWash('Motorcycle', 'Premium');
        myStation.addWash('Car', 'VIP');
        myStation.addWash('Car', 'Premium');
        myStation.addWash('Motorcycle', 'Simple');
        myStation.addWash('Car', 'Simple');
        await myStation.Show();
    } 
    catch(err){ 
        console.error(`Error Loading Data: ${err}`)
    }
}
start ();

//localStorage.setItem('Total Money' ,this.dailyMoney) in case this was run on a browser


