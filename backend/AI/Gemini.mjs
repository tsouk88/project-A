import 'dotenv/config';


export default async function AskGemini (systemPrompt, userMessage) {
    try {
         const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method : 'POST' ,
            headers: {
            'Content-Type': 'application/json'
                },
            body: JSON.stringify({
                contents: [{
                    parts : [{text : `${systemPrompt}\n\n User: ${userMessage}`}]
                }] 
                })
            })
            const data = await response.json();
            if (data.candidates && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text; 
            return aiResponse; }
            else {
                console.log ('Gemini sent an empty message')
            }
           
        }
        catch (error) {
            console.error(`Error Talking to Gemini: ${error}`);
           
        }   
    }
    
