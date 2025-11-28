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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
