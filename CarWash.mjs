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
        this.wash ={};
        this.simpleprice= 10;
        this.premiumprice= 20;
        this.prices= [];
    }
addWash (vehicle , washType ) {
    this.wash = {
        vehicle ,
        washType,
    }
    if (this.wash.vehicle === 'Car' ) {
        this.cars++; 
        this.washes24h++;
    }
    else if (this.wash.vehicle === 'Motorcycle') {
        this.motorcycles++;
        this.washes24h++;
    }      
    else {
        console.log('Not valid Entry')
        return;
    }
    this.fixedPrice();
    this.dailyMoney = this.prices.reduce((total, price) => total + price, 0);

    }


async Show () {
    console.log(`Today we had ${this.cars} cars and ${this.motorcycles} motorcycles.`);
    console.log(`We gathered ${this.dailyMoney}€ today. `);
    console.log(`People used ${this.simplewash} Simple Washes and ${this.premiumwash} Premium Washes today. `)
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

fixedPrice() {
    if(this.wash.vehicle !== 'Car' && this.wash.vehicle !== 'Motorcycle'){
        console.log(`${this.wash.vehicle} is Not a Valid Entry` )
        return}
    else if (this.wash.washType === 'Simple') {
        this.simplewash++;
        return this.prices.push(this.simpleprice);
    } else if (this.wash.washType === 'Premium') {
        this.premiumwash++;
        return this.prices.push(this.premiumprice);
    }
    else {
        console.log(` ${this.wash.washType} is Not a Valid Entry` )
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
        await writeFile('wash_stats.json ', JSON.stringify(Data, null , 2))
        console.log ("Τα δεδομένα αποθηκεύτηκαν με επιτυχία!")
    } catch(err) {
        console.error("Error Saving File" , err)
    }
}
}
const myStation = new CarWash(); 

myStation.addWash('Car', 'Premium'); 
myStation.addWash('Motorcycle', 'Simple'); 
myStation.addWash('Car', 'Premium'); 
myStation.addWash('Motorcycle', 'Simple'); 
myStation.addWash('Car', 'Simple'); 
myStation.addWash('Motorcycle', 'Premium');
myStation.addWash('Car', 'VIP');
myStation.addWash('Car', 'Premium');

myStation.Show().catch(err => console.error(err));
//localStorage.setItem('Total Money' ,this.dailyMoney) in case this was run on a browser


    
