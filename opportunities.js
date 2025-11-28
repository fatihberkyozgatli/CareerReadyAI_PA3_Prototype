// This screen will be able to simulate the role of AI in the schedule productivity

// Back button
const backToIntakeBtn = document.getElementById("back-to-intake");
if (backToIntakeBtn) {
  backToIntakeBtn.addEventListener("click", () => {
    showScreen("screen-intake");
  });
}

// Interactive elements of the app
const generateButton = document.getElementById("generate-opportunity-button");
const opportunityResult = document.getElementById("opportunity-result");
const opportunityText = document.getElementById("opportunity-text");

// AI Call
if (generateButton) {
  generateButton.addEventListener("click", async () => {
    // Guard: make sure schedule was saved
    if (
      !window.userSchedule ||
      !window.userLocations ||
      !window.userAssignments
    ) {
      opportunityText.textContent =
        "Please go back and save your schedule first.";
      opportunityResult.classList.remove("hidden");
      return;
    }

    generateButton.disabled = true;
    generateButton.textContent = "Analyzing...";

    try {
      const response = await fetch(`${API_BASE}/api/schedule-advice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedule: window.userSchedule,
          locations: window.userLocations,
          assignments: window.userAssignments,
        }),
      });

      if (!response.ok) {
        throw new Error("Schedule AI request failed");
      }

      const data = await response.json();
      console.log("Schedule AI response:", data);

      opportunityText.textContent = `${data.bestTime} — ${data.reason}`;
      opportunityResult.classList.remove("hidden");
    } catch (err) {
      console.error(err);
      opportunityText.textContent =
        "Sunday afternoon — ideal period for applications (fallback suggestion).";
      opportunityResult.classList.remove("hidden");
    } finally {
      generateButton.disabled = false;
      generateButton.textContent = "Generate AI Timing";
    }
  });
}

// Button to move to the Weekly Effectiveness Report screen
const viewReportBtn = document.getElementById("view-report-button");
if (viewReportBtn) {
  viewReportBtn.addEventListener("click", () => {
    showScreen("screen-report");
    // drawReport() is defined in report.js
    if (typeof drawReport === "function") {
      drawReport();
    }
  });
}
