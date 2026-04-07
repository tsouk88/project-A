import express from 'express';
import CarWash from './CarWash.mjs';

const app = express();
const port = 3000;
const myWash = new CarWash();
app.get('/', (req, res) => {
  res.send('Το CarWash API είναι Online!');
});
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
