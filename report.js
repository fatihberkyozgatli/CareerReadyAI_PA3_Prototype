// report.js

const backToOppBtn = document.getElementById("back-to-opportunities");
if (backToOppBtn) {
  backToOppBtn.addEventListener("click", () => {
    showScreen("screen-opportunities");
  });
}

const chartCanvas = document.getElementById("productivity-chart");
const bestDayEl = document.getElementById("best-day");
const bestLocationEl = document.getElementById("best-location");
const summaryEl = document.getElementById("summary-text");

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SCHEDULE_KEY = "careerReadyAI.schedulePayload";

function drawChart(values) {
  if (!chartCanvas) return;
  const ctx = chartCanvas.getContext("2d");
  const width = chartCanvas.width;
  const height = chartCanvas.height;

  ctx.clearRect(0, 0, width, height);

  const barWidth = 25;
  const gap = 18;
  const maxVal = Math.max(...values, 1);

  values.forEach((v, i) => {
    const x = 30 + i * (barWidth + gap);
    const barHeight = (v / maxVal) * (height - 40);
    const y = height - barHeight - 10;

    ctx.fillStyle = "#3b82f6"; // same blue as before
    ctx.fillRect(x, y, barWidth, barHeight);
  });
}

function getBestLocationName(locationStats) {
  if (!locationStats || typeof locationStats !== "object") return null;

  let bestName = null;
  let bestScore = -Infinity;

  for (const [name, data] of Object.entries(locationStats)) {
    const hours = Number(data.hours ?? 0);
    const productivity = Number(data.productivity ?? 0);
    const score = hours * productivity;

    if (score > bestScore) {
      bestScore = score;
      bestName = name;
    }
  }

  return bestName;
}

function loadSchedulePayload() {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to read schedule payload:", e);
    return null;
  }
}

async function loadWeeklyReport() {
  if (!chartCanvas) return;

  const payload = loadSchedulePayload();
  if (!payload) {
    summaryEl.textContent =
      "No schedule data found. Please complete the Study & Schedule Setup first.";
    // Optionally draw a static demo chart
    const fallback = [3, 7, 5, 8, 6, 2, 4];
    drawChart(fallback);
    bestDayEl.textContent = "Thu";
    bestLocationEl.textContent = "Library";
    return;
  }

  summaryEl.textContent = "Generating AI report...";

  try {
    const resp = await fetch(`${API_BASE}/api/schedule-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || "Report request failed.");
    }

    const values = data.productivityValues || [];
    if (!Array.isArray(values) || values.length !== 7) {
      throw new Error("AI did not return 7 productivity values.");
    }

    drawChart(values);

    const maxIndex = values.indexOf(Math.max(...values));
    bestDayEl.textContent = DAYS[maxIndex] || "";

    const bestLoc = getBestLocationName(data.locationStats);
    bestLocationEl.textContent = bestLoc
      ? bestLoc.charAt(0).toUpperCase() + bestLoc.slice(1)
      : "Not specified";

    summaryEl.textContent = data.summary || "";
  } catch (err) {
    console.error("Error loading weekly report:", err);
    summaryEl.textContent =
      "Could not load AI report. Showing a static demo instead.";

    const fallback = [3, 7, 5, 8, 6, 2, 4];
    drawChart(fallback);
    bestDayEl.textContent = "Thu";
    bestLocationEl.textContent = "Library";
  }
}

// Expose to other scripts so opportunities.js can call it
window.loadWeeklyReport = loadWeeklyReport;
