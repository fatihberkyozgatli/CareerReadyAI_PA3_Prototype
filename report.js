// report.js

const chartCanvas = document.getElementById("productivity-chart");
const bestDayEl = document.getElementById("best-day");
const bestLocationEl = document.getElementById("best-location");
const summaryEl = document.getElementById("summary-text");

// Simple bar chart renderer
function drawChart(values) {
  if (!chartCanvas) return;
  const ctx = chartCanvas.getContext("2d");

  ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

  const maxVal = Math.max(...values, 10);
  const barWidth = 25;
  const gap = 20;
  const baseY = 180;

  ctx.fillStyle = "#3b82f6";

  values.forEach((v, i) => {
    const height = (v / maxVal) * 140;
    const x = 30 + i * (barWidth + gap);
    ctx.fillRect(x, baseY - height, barWidth, height);
  });
}

// Utilities
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getBestDay(values) {
  const idx = values.indexOf(Math.max(...values));
  return dayNames[idx] || "";
}

function getBestLocationFromStats(locationStats) {
  let best = null;
  let bestScore = -Infinity;

  for (const name in locationStats) {
    const data = locationStats[name];
    const score = (data.hours || 0) * (data.productivity || 0);
    if (score > bestScore) {
      bestScore = score;
      best = name;
    }
  }
  return best || "Library";
}

// This is called from opportunities.js after /api/schedule-report
window.renderScheduleReport = function (data) {
  const values =
    Array.isArray(data.productivityValues) && data.productivityValues.length === 7
      ? data.productivityValues
      : [3, 7, 5, 8, 6, 2, 4]; // fallback

  const locationStats =
    data.locationStats && typeof data.locationStats === "object"
      ? data.locationStats
      : {
          library: { hours: 8, productivity: 7.5 },
          dorm: { hours: 5, productivity: 5.0 },
        };

  const summary =
    data.summary ||
    "AI could not generate a detailed summary, so this is a sample pattern.";

  // Draw chart
  drawChart(values);

  // Fill text fields
  if (bestDayEl) bestDayEl.textContent = getBestDay(values);
  if (bestLocationEl)
    bestLocationEl.textContent = getBestLocationFromStats(locationStats);
  if (summaryEl) summaryEl.textContent = summary;
};
