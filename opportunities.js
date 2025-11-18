//This screen will be able to simulate the role of AI in the schedule productivity

//WIll create the back button
const backToIntakeBtn = document.getElementById("back-to-intake");
if (backToIntakeBtn) {
  backToIntakeBtn.addEventListener("click", () => {
    showScreen("screen-intake");
  });
}


//Interactive elements of the app
const generateButton = document.getElementById("generate-opportunity-button");
const opportunityResult = document.getElementById("opportunity-result");
const opportunityText = document.getElementById("opportunity-text");


//THis code will try to simulate the AI logic
function chooseBestTime(scheduleText) {
  if (scheduleText.toLowerCase().includes("library")) {
    return "Tuesday at 4 PM — strong library productivity window.";
  }
  if (scheduleText.toLowerCase().includes("morning")) {
    return "Wednesday morning — your peak focus time.";
  }
  return "Sunday afternoon — ideal period for applications.";
}

//simulating the behavior of the AI processing the input
if (generateButton) {
  generateButton.addEventListener("click", () => {

    generateButton.disabled = true;
    generateButton.textContent = "Analyzing...";

    setTimeout(() => {
      const result = chooseBestTime(userSchedule);
      opportunityText.textContent = result;

      opportunityResult.classList.remove("hidden");

      generateButton.disabled = false;
      generateButton.textContent = "Generate AI Timing";
    }, 900);
  });
}
