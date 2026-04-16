export async function Weather() {
  try {
    const response = await fetch("https://wttr.in/Chios?format=j1");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const current = data?.current_condition?.[0];
    const forecast = data?.weather?.[1];

    if (!current || !forecast) throw new Error("Incomplete data from API");
    return {
      currenttemp: parseFloat(current.temp_C),
      tomorrowmin: parseFloat(forecast.mintempC),
      tomorrowmax: parseFloat(forecast.maxtempC),
      wind: parseFloat(current.windspeedKmph),
      success: true 
    };
  }
    catch (error) {
    console.error("⚠️ Weather fetch failed:", error.message); }
  return { 
        currenttemp: "N/A", 
        tomorrowmin: "N/A", 
        tomorrowmax: "N/A", 
        wind: "N/A",
        success: false 
    };
  } 
