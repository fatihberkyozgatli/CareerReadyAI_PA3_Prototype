// report.js

// Base URL for the backend API that matches the one in the server backend
window.API_BASE = window.API_BASE || "http://localhost:3000";

// Back to opportunities screen
const backToOppBtn = document.getElementById("back-to-opportunities");
if (backToOppBtn) {
  backToOppBtn.addEventListener("click", () => {
    showScreen("screen-opportunities");
  });
}

// Elements of the report
const chartCanvas = document.getElementById("productivity-chart");
const bestDayEl = document.getElementById("best-day");
const bestLocationEl = document.getElementById("best-location");
//tracking a change
const summaryEl = document.getElementById("summary-text");

// Data that the API will fill 
let productivityValues = [3, 7, 5, 8, 6, 2, 4]; // sample default
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
let locationStats = {
  library: { hours: 8, productivity: 7.5 },
  dorm: { hours: 5, productivity: 5.2 },
};
let summaryText = "";

// This will compute the stats and draw the bars
function drawReport() {
  if (!chartCanvas || !bestDayEl || !bestLocationEl) {
    console.warn("Report elements missing:", { chartCanvas, bestDayEl, bestLocationEl });
    return;
  }

  const ctx = chartCanvas.getContext("2d");

  // Will clear old chart
  ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

  // Choosing the bar color
  ctx.fillStyle = "#3b82f6";

  // Will create the seven bars for the days of the week for the visual
  productivityValues.forEach((value, index) => {
    ctx.fillRect(
      30 + index * 38,  // x position
      180 - value * 15, // y position (inverted)
      25,               // bar width
      value * 15        // bar height
    );
  });

  // Best day that was the most productive
  const bestIndex = productivityValues.indexOf(Math.max(...productivityValues));
  bestDayEl.textContent = days[bestIndex];

  // Best location that takes productivity into account
  const bestLoc = getBestLocation();
  if (bestLoc) {
    bestLocationEl.textContent =
      bestLoc.charAt(0).toUpperCase() + bestLoc.slice(1);
  }

  // Summary text
  if (summaryEl) {
    summaryEl.textContent = summaryText || "";
  }
}

// will compute best location from locationStats
function getBestLocation() {
  let best = null;
  let bestScore = -Infinity;

  for (const place in locationStats) {
    const data = locationStats[place];
    if (!data) continue;

    const score = (data.hours || 0) * (data.productivity || 0);
    if (score > bestScore) {
      bestScore = score;
      best = place;
    }
  }
  return best;
}

// must show a function used by opportunities.js when the user clicks
window.loadWeeklyReport = async function () {
  const schedule = window.userSchedule || "";
  const locations = window.userLocations || "";
  const assignments = window.userAssignments || "";

  if (!schedule) {
    // If worst comes to worst and the schedule was not provided,
    // it will give a default answer
    summaryText =
      "Demo report: using a sample pattern because schedule data was not found.";
    drawReport();
    return;
  }

  try {
    const resp = await fetch(`${window.API_BASE}/api/schedule-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedule, locations, assignments }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.error || "Request failed.");
    }

    // If the AI values are valid, they will be used
    if (
      Array.isArray(data.productivityValues) &&
      data.productivityValues.length === 7
    ) {
      productivityValues = data.productivityValues;
    }

    if (data.locationStats && typeof data.locationStats === "object") {
      locationStats = data.locationStats;
    }

    summaryText =
      data.summary ||
      "Summary not provided. Using fallback visualization.";

    drawReport();
  } catch (err) {
    console.error("loadWeeklyReport error:", err);
    summaryText =
      "Sorry, the AI report could not be loaded. Showing a sample weekly pattern instead.";
    // Fallback data
    drawReport();
  }
};

// Draw the report once when this script loads 
drawReport();
