export async function Weather() {
  try {
    const response = await fetch("https://wttr.in/Chios?format=j1");
    const data = await response.json();
    //const humidity = data.current_condition[0].humidity;
    const temp = data.current_condition[0].temp_C;
    return parseFloat(temp); 
  } 
  catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  } 
}