// opportunities.js

// Base URL for the backend API 
window.API_BASE = window.API_BASE || "http://localhost:3000";

// Back to intake
const backToIntakeBtn = document.getElementById("back-to-intake");
if (backToIntakeBtn) {
  backToIntakeBtn.addEventListener("click", () => {
    showScreen("screen-intake");
  });
}

// will generate AI Timing
const generateButton = document.getElementById("generate-opportunity-button");
const opportunityResult = document.getElementById("opportunity-result");
const opportunityText = document.getElementById("opportunity-text");

// Button to go to weekly report
const viewReportButton = document.getElementById("view-report-button");

if (generateButton) {
  generateButton.addEventListener("click", async () => {
    // These are set in schedule.js
    const schedule = window.userSchedule || "";
    const locations = window.userLocations || "";
    const assignments = window.userAssignments || "";

    // If the user skipped the intake screen
    if (!schedule || !locations || !assignments) {
      opportunityText.textContent =
        "Please complete the Study & Schedule Setup first.";
      opportunityResult.classList.remove("hidden");
      return;
    }

    generateButton.disabled = true;
    generateButton.textContent = "Analyzing...";

    try {
      const resp = await fetch(`${window.API_BASE}/api/schedule-advice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule, locations, assignments }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Request failed.");
      }

      // bestTime + reason come from server.js
      const bestTime = data.bestTime || "Sunday afternoon";
      const reason =
        data.reason ||
        "This time has the fewest conflicts and is easy to turn into a habit.";

      opportunityText.textContent = `${bestTime} — ${reason}`;
      opportunityResult.classList.remove("hidden");
    } catch (err) {
      console.error(err);
      opportunityText.textContent =
        "Sorry, AI timing request failed. Falling back to a generic suggestion: Sunday afternoon — ideal period for applications.";
      opportunityResult.classList.remove("hidden");
    } finally {
      generateButton.disabled = false;
      generateButton.textContent = "Generate AI Timing";
    }
  });
}

// and trigger the AI-driven report load
if (viewReportButton) {
  viewReportButton.addEventListener("click", () => {
    showScreen("screen-report");
    if (typeof window.loadWeeklyReport === "function") {
      window.loadWeeklyReport();
    }
  });
}
