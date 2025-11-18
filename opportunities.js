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

// This code will try to simulate the AI logic
function chooseBestTime(scheduleText) {
  if (!scheduleText) {
    return "Sunday afternoon — ideal period for applications.";
  }

  const lower = scheduleText.toLowerCase();

  if (lower.includes("library")) {
    return "Tuesday at 4 PM — strong library productivity window.";
  }
  if (lower.includes("morning")) {
    return "Wednesday morning — your peak focus time.";
  }
  return "Sunday afternoon — ideal period for applications.";
}

// Simulating the behavior of the AI processing the input
if (generateButton) {
  generateButton.addEventListener("click", () => {
    generateButton.disabled = true;
    generateButton.textContent = "Analyzing...";

    setTimeout(() => {
      // userSchedule is set in schedule.js after the intake form is submitted
      const result = chooseBestTime(userSchedule);
      opportunityText.textContent = result;

      opportunityResult.classList.remove("hidden");

      generateButton.disabled = false;
      generateButton.textContent = "Generate AI Timing";
    }, 900);
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
