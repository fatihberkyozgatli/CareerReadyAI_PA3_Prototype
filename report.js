// report.js

// Back to opportunities screen
const backToOppBtn = document.getElementById("back-to-opportunities");
if (backToOppBtn) {
  backToOppBtn.addEventListener("click", () => {
    showScreen("screen-opportunities");
  });
}

// Elements
const chartCanvas = document.getElementById("productivity-chart");
const bestDayEl = document.getElementById("best-day");
const bestLocationEl = document.getElementById("best-location");
const summaryEl = document.getElementById("report-summary");

// Data (will be filled from the API)
let productivityValues = [3, 7, 5, 8, 6, 2, 4]; // fallback
let days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
let locationStats = {
  library: { hours: 8, productivity: 7.5 },
  dorm: { hours: 5, productivity: 5.2 },
};
let summaryText = "";

// Draw the chart and computed stats
function drawReport() {
  if (!chartCanvas || !bestDayEl || !bestLocationEl) return;

  const ctx = chartCanvas.getContext("2d");

  // Clear old chart
  ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

  // Bar color
  ctx.fillStyle = "#3b82f6";

  // Create the seven bars for the days of the week
  productivityValues.forEach((value, index) => {
    ctx.fillRect(
      30 + index * 38,  // x position
      180 - value * 15, // y position (inverted)
      25,               // bar width
      value * 15        // bar height
    );
  });

  // Best day
  const bestIndex = productivityValues.indexOf(Math.max(...productivityValues));
  bestDayEl.textContent = days[bestIndex];

  // Best location (weighted hours * productivity)
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

// Compute best location from locationStats
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

// Expose a function used by opportunities.js when user clicks "View Weekly Report"
window.loadWeeklyReport = async function () {
  const schedule = window.userSchedule || "";
  const locations = window.userLocations || "";
  const assignments = window.userAssignments || "";

  if (!schedule) {
    // If for some reason schedule isn't set, just draw fallback static chart
    summaryText =
      "Demo report: using a sample pattern because schedule data was not found.";
    drawReport();
    return;
  }

  try {
    const resp = await fetch(`${API_BASE}/api/schedule-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedule, locations, assignments }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.error || "Request failed.");
    }

    // Use AI values if valid, otherwise keep defaults
    if (Array.isArray(data.productivityValues) &&
        data.productivityValues.length === 7) {
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
    // fallback data
    drawReport();
  }
};


drawReport();
