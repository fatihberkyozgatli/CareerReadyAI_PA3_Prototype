// schedule.js

window.userSchedule = "";
window.userLocations = "";
window.userAssignments = "";
window.schedulePayload = null; // used by report.js

const consentCheckbox = document.getElementById("consent-checkbox");
const weeklyScheduleInput = document.getElementById("weekly-schedule");
const studyLocationsInput = document.getElementById("study-locations");
const assignmentsInput = document.getElementById("intake-assignments");
const submitIntakeButton = document.getElementById("submit-intake-button");
const intakeError = document.getElementById("intake-error");

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

    // Save to globals
    window.userSchedule = schedule;
    window.userLocations = locations;
    window.userAssignments = assignments;

    // Payload used by the report
    window.schedulePayload = { schedule, locations, assignments };

    // Go to AI opportunity timing screen
    showScreen("screen-opportunities");
  });
}
