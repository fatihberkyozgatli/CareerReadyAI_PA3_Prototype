

//Will provide a button to go back to the AI application section
const backToOppBtn = document.getElementById("back-to-opportunities");

if (backToOppBtn) {
  backToOppBtn.addEventListener("click", () => {
    showScreen("screen-opportunities");
  });
}

//Will provide the chart element
const chartCanvas = document.getElementById("productivity-chart");

//It will display the text that will be used in the summary
const bestDay = document.getElementById("best-day");
const bestLocation = document.getElementById("best-location");

//These samples are being used as place holders
//Actual numbers would rely on ScheduleTracker and the ai productivity statistics.
const productivityValues = [3, 7, 5, 8, 6, 2, 4];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

//will construct the bar chart that will highlight most productive day as well as the best location to complete work
function drawReport() {
  const ctx = chartCanvas.getContext("2d");

  // Clear old chart
  ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

  // Bar color
  ctx.fillStyle = "#3b82f6";

  // Will create the seven bars for the days of the week
  productivityValues.forEach((value, index) => {
    ctx.fillRect(
      30 + index * 38,        // x position
      180 - value * 15,       // y position (inverted)
      25,                     // bar width
      value * 15              // bar height
    );
  });
  //To compute the best day of the week, it will take the productivity values and compare
  const bestIndex = productivityValues.indexOf(Math.max(...productivityValues));
  bestDay.textContent = days[bestIndex];
  updateBestLocation();


  //Given example paces, it will pick the best location based on productivity vs time spent there
  const locationStats = {
  library: {
    hours: 8,
    productivity: 7.5 // out of 10
  },
  dorm: {
    hours: 5,
    productivity: 5.2
  },
  "coffee shop": {
    hours: 4,
    productivity: 6.0
  },
  "study lounge": {
    hours: 6,
    productivity: 6.8
  }
};

//This function will calculate the effectiveness of the location that the student had
function getBestLocation() {
  let best = null;
  let bestScore = -Infinity;

  for (const place in locationStats) {
    const data = locationStats[place];

    // Weighted effectiveness = hours * productivity
    const score = data.hours * data.productivity;

    if (score > bestScore) {
      bestScore = score;
      best = place;
    }
  }

  return best;
}

//Will update which location is the best
function updateBestLocation() {
  const best = getBestLocation();

  bestLocation.textContent =
    best.charAt(0).toUpperCase() + best.slice(1);
}





