import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

// Dev CORS – allows calls from your local frontend
app.use(cors());
app.use(express.json());

// Debug: confirm key is loaded
console.log(
  "Loaded key prefix:",
  (process.env.OPENAI_API_KEY || "").slice(0, 8)
);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/resume-feedback
app.post("/api/resume-feedback", async (req, res) => {
  const { fileName, text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing resume text." });
  }

  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: `
You are a concise, supportive resume reviewer for university students.

Return ONLY a JSON object with this exact shape, and nothing else:

{
  "intro": "one short paragraph",
  "strengths": ["bullet 1", "bullet 2", "bullet 3"],
  "improvements": ["bullet 1", "bullet 2", "bullet 3"]
}

Do NOT include any markdown, HTML, or extra text outside the JSON.
      `,
      input: `
Resume filename: ${fileName}

Resume content (may be partial or summarized):
${text}
      `,
      max_output_tokens: 400,
    });

    // Get raw text from Responses API
    const raw =
      response.output_text ??
      (response.output &&
        response.output[0]?.content?.[0]?.text) ??
      "";

    // Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("JSON parse error, raw output:", raw);
      return res
        .status(500)
        .json({ error: "AI response was not valid JSON." });
    }

    const intro = parsed.intro || "";
    const strengths = parsed.strengths || [];
    const improvements = parsed.improvements || [];

    // Build consistent HTML template
    const feedbackHtml = `
      <h4>Introduction</h4>
      <p>${intro}</p>

      <h4>Strengths</h4>
      <ul>
        ${strengths.map((s) => `<li>${s}</li>`).join("")}
      </ul>

      <h4>Areas for Improvement</h4>
      <ul>
        ${improvements.map((i) => `<li>${i}</li>`).join("")}
      </ul>
    `;

    res.json({ feedbackHtml });
  } catch (err) {
    console.error("OpenAI error:", err?.status, err?.message, err?.response?.data);

    res.status(500).json({
      error:
        err?.response?.data?.error?.message ||
        err?.message ||
        "AI request failed.",
    });
  }
});

app.post("/api/schedule-advice", async (req, res) => {
  const { schedule, locations, assignments } = req.body;

  if (!schedule || !locations || !assignments) {
    return res
      .status(400)
      .json({ error: "Missing schedule, locations, or assignments." });
  }

  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: `
You are a supportive study coach for a college student.

Return ONLY a JSON object with this shape:
{
  "bestTime": "one concise time recommendation",
  "reason": "one short explanation"
}
No extra text outside the JSON.
      `,
      input: `
Student weekly schedule:
${schedule}

Preferred study locations:
${locations}

Upcoming assignments and deadlines:
${assignments}

Based on this, pick the best recurring 1–2 hour window in the week to work
on internships / scholarship applications.
      `,
      max_output_tokens: 300,
    });

    const raw =
      response.output_text ??
      (response.output &&
        response.output[0]?.content?.[0]?.text) ??
      "";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("Schedule JSON parse error, raw:", raw);
      return res
        .status(500)
        .json({ error: "AI schedule response was not valid JSON." });
    }

    const bestTime = parsed.bestTime || "Sunday afternoon";
    const reason =
      parsed.reason ||
      "This time has the fewest conflicts and is easy to protect as a routine.";

    res.json({ bestTime, reason });
  } catch (err) {
    console.error("OpenAI schedule error:", err?.status, err?.message, err?.response?.data);
    res.status(500).json({
      error:
        err?.response?.data?.error?.message ||
        err?.message ||
        "AI schedule request failed.",
    });
  }
});




//This next endpoint will help create a report that uses AI to maximize the efficiency of the student
app.post("/api/schedule-report", async (req, res) => {
  const { schedule, locations, assignments } = req.body;

  //verify if there is a schedule to check, if there is not, then it will return error
  if (!schedule) {
    return res
      .status(400)
      .json({ error: "Missing schedule text for report." });
  }

  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: `
You are an AI study coach analyzing how efficiently a student uses their AVAILABLE time
for internships and scholarship applications across the week.

Return ONLY a JSON object in this exact shape and nothing else:

{
  "productivityValues": [3, 7, 5, 8, 6, 2, 4],
  "locationStats": {
    "library": { "hours": 8, "productivity": 7.5 },
    "dorm": { "hours": 5, "productivity": 5.2 }
  },
  "summary": "short explanation of the pattern"
}

Where:
- "productivityValues" has EXACTLY 7 numbers (Monday..Sunday), each 0–10.
  These represent an EFFICIENCY SCORE for each day:
  "How efficiently they use their available time that day for applications."
- "locationStats" has 1+ locations as keys, with:
    - "hours": estimated weekly hours used for focused work in that location
    - "productivity": 0–10, how focused/effective that location is
- "summary" is 1–2 sentences summarizing which days are efficient and
  where there is unused potential.

Do NOT include any markdown, explanation, or text outside the JSON.
      `,
      input: `
Student weekly schedule:
${schedule}

Preferred study locations:
${locations || "Not specified"}

Upcoming assignments and deadlines:
${assignments || "Not specified"}

Estimate:
1) For each day, how much potentially available focus time they have.
2) How much of that is realistically being used for applications or deep work.
3) Turn that into an efficiency score 0–10 per day (Mon..Sun).
      `,
      max_output_tokens: 400,
    });

    const raw =
      response.output_text ??
      (response.output && response.output[0]?.content?.[0]?.text) ??
      "";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("Schedule report JSON parse error, raw:", raw);
      return res
        .status(500)
        .json({ error: "AI schedule report response was not valid JSON." });
    }

    // Verify that the GPT is still giving correct formatting on everything
    const productivityValues = Array.isArray(parsed.productivityValues)
      ? parsed.productivityValues
      : null;
    const locationStats =
      parsed.locationStats && typeof parsed.locationStats === "object"
        ? parsed.locationStats
        : {};
    const summary = parsed.summary || "";

    //Assuring that there are 7 nums for the days
    if (!productivityValues || productivityValues.length !== 7) {
      return res.status(500).json({
        error:
          "AI did not return exactly 7 productivity values for Monday–Sunday.",
      });
    }

    res.json({ productivityValues, locationStats, summary });
  } catch (err) {
    console.error(
      "OpenAI schedule report error:",
      err?.status,
      err?.message,
      err?.response?.data
    );
    res.status(500).json({
      error:
        err?.response?.data?.error?.message ||
        err?.message ||
        "AI schedule report request failed.",
    });
  }
});

//Will finally be able to start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
