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
    }
addWash (vehicle , washType , price) {
    this.wash = {
        vehicle ,
        washType,
        price
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
if (this.wash.washType === 'Simple' ) {
        this.simplewash++;
    }
    else if (this.wash.washType === 'Premium') {
        this.premiumwash++; 
    }
    else {
        console.log('Not valid Entry')
        return;     
    }
    this.dailyMoney += price ;

    }
async Show () {
    console.log(`Today we had ${this.cars} cars and ${this.motorcycles} motorcycles.`);
    console.log(`We gathered ${this.dailyMoney}€ today. `);
    console.log(`People used ${this.simplewash} Simple Washes and ${this.premiumwash} Premium Washes today. `)
    let temperature = await Weather();
    if (temperature !== null) {
        if (temperature > 15) {
            console.log(`Temperature right now is ${temperature} Celsius , it's kinda hot`);
        } else {
            console.log(`Temperature right now is ${temperature} Celsius , it's kinda cold`);
        }
    } else {
        console.log("Could not retrieve temperature information right now.");
    }
}
};

const myStation = new CarWash(); 

myStation.addWash('Car', 'Premium', 20); 
myStation.addWash('Motorcycle', 'Simple', 10); 
myStation.addWash('Car', 'Premium', 30); 

myStation.Show().catch(err => console.error(err));


    
