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

fixedPrice() {
    if (this.wash.washType === 'Simple') {
        this.simplewash++;
        return this.prices.push(this.simpleprice);
    } else if (this.wash.washType === 'Premium') {
        this.premiumwash++;
        return this.prices.push(this.premiumprice);
    }
    else {
        console.log('Not valid Entry')
        return;     
    }
}
}
const myStation = new CarWash(); 

myStation.addWash('Car', 'Premium'); 
myStation.addWash('Motorcycle', 'Simple'); 
myStation.addWash('Car', 'Premium'); 

myStation.Show().catch(err => console.error(err));


    
