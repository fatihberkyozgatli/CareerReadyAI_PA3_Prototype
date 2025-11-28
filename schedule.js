// schedule.js

// Make these globals so opportunities.js can use them
window.userSchedule = "";
window.userLocations = "";
window.userAssignments = "";

// Button + error area
const submitIntakeButton = document.getElementById("submit-intake-button");
const intakeError = document.getElementById("intake-error");

if (submitIntakeButton) {
  submitIntakeButton.addEventListener("click", () => {
    const consentCheckbox = document.getElementById("consent-checkbox");

    const scheduleEl = document.getElementById("weekly-schedule");
    const locationsEl = document.getElementById("study-locations");
    const assignmentsEl = document.getElementById("intake-assignments");

    if (!scheduleEl || !locationsEl || !assignmentsEl || !consentCheckbox) {
      console.error("Intake form elements missing:", {
        scheduleEl,
        locationsEl,
        assignmentsEl,
        consentCheckbox,
      });
      if (intakeError) {
        intakeError.textContent =
          "Internal form error – please refresh the page.";
      }
      return;
    }

    const consentChecked = consentCheckbox.checked;
    const schedule = scheduleEl.value.trim();
    const locations = locationsEl.value.trim();
    const assignments = assignmentsEl.value.trim();

 
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

    window.userSchedule = schedule;
    window.userLocations = locations;
    window.userAssignments = assignments;

    showScreen("screen-opportunities");
  });
}