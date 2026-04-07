import express from 'express';
import CarWash from './CarWash.mjs';

const app = express();
const port = 3000;
const myWash = new CarWash();
await myWash.LoadData();
app.get('/', (req, res) => {
  res.send('CarWash API is Online');
});
app.get('/info' , (req, res) => {
    res.send('The Carwash is always open 24/7')
});
app.get ('/add' , (req , res) => {
    myWash.addWash('Car', 'Simple');
    res.send('Done , one car with simple wash added')
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
