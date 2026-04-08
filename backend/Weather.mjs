export async function Weather() {
  try {
    const response = await fetch("https://wttr.in/Chios?format=j1");
    const data = await response.json();
    const temp = data.current_condition[0].temp_C;
    const forecastTomorrow = data.weather[1];
    return {currenttemp : parseFloat(temp) , tomorrowmin : parseFloat(forecastTomorrow.mintempC) , tomorrowmax : parseFloat(forecastTomorrow.maxtempC),
      wind : parseFloat(data.current_condition[0].windspeedKmph)
    };
  } 
  catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  } 
}