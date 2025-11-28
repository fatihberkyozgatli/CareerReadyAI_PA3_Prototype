// server.js

//This will import the environment variables 
import 'dotenv/config';

//importing the server tools
import express from "express";
import cors from "cors";


import OpenAI from "openai";

//Creating a server that will add endpoints
const app = express();

//This will allow for request from the frontend
app.use(cors());
//and this will allow json request the body of the text
app.use(express.json());


//will be creating an OpenAi client from the imported library
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});




//a helper function to be able to ask gpt and be abel to get a response

async function askOpenAI(prompt, model = "gpt-4.1-mini") {
  // will send the prompt to OpenAI
  const response = await client.responses.create({
    model,
    input: prompt,
  });

  // This gives us the plain text result
  const text = response.output_text;

  return text;
}



//This is the actual part that will use the AI to make the most efficient day and time
app.post("/api/generate-timing", async (req, res) => {
  try {
    //be able to get the information from the front end
    const { scheduleText, locationsText, assignmentsText } = req.body;

    //will not be able to operate if there is no schedule input
    if (!scheduleText || !scheduleText.trim()) {
      return res.status(400).json({ error: "scheduleText is required" });
    }
//This will display the prompt we use for the GPT
    //Also includes what needs to be sent back
    const prompt = `
You are an AI assistant helping a college student decide when to work on scholarships and internships.

You are given:
- A rough weekly schedule 
- Typical study locations they use
- The assignments they need to work on

Your job:
1. Pick ONE best day of the week for scholarship/internship work.
2. Pick ONE best 2–3 hour time block on that day.
3. Explain briefly why that window is good.
4. Suggest what they should focus on in that block (example: "2 scholarship apps + 1 internship draft").

Student schedule:
"""${scheduleText}"""

Study locations they mentioned:
"""${locationsText || "Not specified"}"""

Assignments and application tasks:
"""${assignmentsText || "Not specified"}"""
//an examples structure of how the result should be given
Return ONLY a valid JSON object with this exact shape and NO extra text:

{
  "best_day": "Sunday",
  "best_time_block": "2:00 PM – 5:00 PM",
  "reason": "short explanation here",
  "suggested_focus": "what they should do in that block"
}
    `.trim();

    //will ask gpt
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    //This will grab the text from the first output
    const raw = response.output[0].content[0].text;

    //This will store the parsed json data
    let data;

    
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse JSON from AI:", raw);
      return res.status(500).json({ error: "AI response was not valid JSON" });
    }

    return res.json(data);
    //This will make sure that if JSON is invalid it will catch it
  } catch (err) {
    console.error("Error in /api/generate-timing:", err);
    return res.status(500).json({ error: "Server error calling AI" });
  }
});



//Will create a weekly efficiency report based on the availability and how it was used.

app.post("/api/generate-efficiency-report", async (req, res) => {
  try {
    //Getting the information from the frontend.
    const { scheduleText, locationsText, assignmentsText } = req.body;

    //copied from abaove, same logic
    if (!scheduleText || !scheduleText.trim()) {
      return res.status(400).json({ error: "scheduleText is required" });
    }

    const prompt = `
You analyze a student's weekly schedule and rate how good each day is for focused scholarship/internship work.

You are given:
- Weekly schedule
- Study locations
- Types of assignments / applications

You must:
1. Give a productivity score for EACH day of the week (Mon–Sun) from 0 to 10, can be decimals if needed.
   Higher = better time for focused scholarship/internship work.
2. Compute which study location is best overall (consider hours + focus quality).
3. Return a short 1–2 sentence summary.

Return ONLY JSON in this exact structure:

{
  "productivityValues": [3, 7, 5, 8, 6, 2, 4],
  "locationStats": {
    "library": { "hours": 8, "productivity": 7.5 },
    "dorm": { "hours": 5, "productivity": 5.2 }
  },
  "summary": "short explanation of the pattern"
}

Where:
- productivityValues has exactly 7 numbers in order: Monday..Sunday.
- locationStats has at least 1 location (keys are lowercase strings).
- hours is a positive number, productivity is 0–10.
    `.trim();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt + `

Student schedule:
"""${scheduleText}"""

Study locations:
"""${locationsText || "Not specified"}"""

Assignments and tasks:
"""${assignmentsText || "Not specified"}"""
      `,
    });

    //Has to ask GPT
    const raw = response.output[0].content[0].text;

    //must parse the GPT JSON
    let data;

    //Same logic as above will catch for any errors
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse JSON from AI:", raw);
      return res.status(500).json({ error: "AI response was not valid JSON" });
    }

   // checking to see if it outputted 7 nums
    if (
      !Array.isArray(data.productivityValues) ||
      //if it does not then it will let us know an error
      data.productivityValues.length !== 7
    ) {
      return res.status(500).json({
        error: "AI did not return exactly 7 productivity values (Mon..Sun).",
      });
    }

    // Must send the data back to the front-end
    return res.json(data);
  } catch (err) {
    console.error("Error in /api/generate-efficiency-report:", err);
    return res.status(500).json({ error: "Server error calling AI" });
  }
});

   

//This will start the server

const PORT = process.env.PORT || 3001;

//This will help listen to requests that the user might have
app.listen(PORT, () => {
  console.log(`AI backend listening on http://localhost:${PORT}`);
});
