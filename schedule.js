//This piece of code will put up a consent screen, accept the schedule input, as well as the study location and assignment location
//If consent was given, then it will save the data and use it for the results portion of the app

//Storing input to use in opportunities and reports
let userSchedule = "";
let userLocations = "";
let userAssignments = "";

//Will take you from the intake screen back to the resume screen
const backToResumeBtn = document.getElementById("back-to-resume");

if (backToResumeBtn) {
  backToResumeBtn.addEventListener("click", () => {
    // Using F's function to switch screens
    showScreen("screen-resume");
  });
}

//THis button will save the intake form 
const intakeButton = document.getElementById("submit-intake-button");


//Chechbox for the user consent
const consentCheckbox = document.getElementById("consent-checkbox");


//If somehting goes wrong an error message will be displayed
const intakeError = document.getElementById("intake-error");

if (intakeButton) {
  intakeButton.addEventListener("click", () => {

    // Will grab the values from the textarea fields
    const schedule = document.getElementById("intake-schedule").value.trim();
    const locations = document.getElementById("intake-locations").value.trim();
    const assignments = document.getElementById("intake-assignments").value.trim();

    // First stage validation...will check if the user gave consent
    if (!consentCheckbox.checked) {
      //if user did not give consent, then they will not be able to use this feature
      intakeError.textContent = "You must give consent to continue.";
      return;
    }

    // Second stage validation...make sure everything was put in correctly.
    if (!schedule || !locations || !assignments) {
      intakeError.textContent = "Please fill out all fields before continuing.";
      return;
    }

    //Making sure data could be used in other files
    userSchedule = schedule;
    userLocations = locations;
    userAssignments = assignments;

    // Will clear any previous errors
    intakeError.textContent = "";

    // Now will move to the next screen
    showScreen("screen-opportunities");
  });
}

    



    
