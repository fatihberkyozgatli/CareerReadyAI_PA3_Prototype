// schedule.js

// Globals so opportunities.js can use them
window.userSchedule = "";
window.userLocations = "";
window.userAssignments = "";

// DOM elements
const consentCheckbox = document.getElementById("consent-checkbox");
const weeklyScheduleInput = document.getElementById("weekly-schedule");
const studyLocationsInput = document.getElementById("study-locations");
const assignmentsInput = document.getElementById("intake-assignments");
const submitIntakeButton = document.getElementById("submit-intake-button");
const intakeError = document.getElementById("intake-error");

// Key shared with report.js
const SCHEDULE_KEY = "careerReadyAI.schedulePayload";

function saveSchedulePayload(schedule, locations, assignments) {
  const payload = { schedule, locations, assignments };

  // for opportunities.js
  window.userSchedule = schedule;
  window.userLocations = locations;
  window.userAssignments = assignments;

  // for report.js
  try {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error("Failed to save schedule payload:", e);
  }
}

if (submitIntakeButton) {
  submitIntakeButton.addEventListener("click", () => {
    if (!consentCheckbox || !weeklyScheduleInput || !studyLocationsInput || !assignmentsInput) {
      console.error("Intake form elements missing.");
      if (intakeError) {
        intakeError.textContent = "Internal form error – please refresh the page.";
      }
      return;
    }

    const consentChecked = consentCheckbox.checked;
    const schedule = weeklyScheduleInput.value.trim();
    const locations = studyLocationsInput.value.trim();
    const assignments = assignmentsInput.value.trim();

    if (!consentChecked) {
      intakeError.textContent =
        "Please consent to sharing your schedule and assignments.";
      return;
    }

    if (!schedule || !locations || !assignments) {
      intakeError.textContent = "Please fill in all three fields.";
      return;
    }

    intakeError.textContent = "";

    // Save both to globals + localStorage
    saveSchedulePayload(schedule, locations, assignments);

    // Go to AI Opportunity Timing screen
    showScreen("screen-opportunities");
  });
}