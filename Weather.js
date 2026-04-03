
async function Weather() {
  try {
    const response = await fetch("https://wttr.in/Chios?format=j1");
    const data = await response.json();
    //const humidity=data.current_condition[0].humidity;
    const temp =(data.current_condition[0].temp_C;
  } 
  catch (error) {
    console.log(error);
  }
  return temp;  
    
}
 export default Weather();

