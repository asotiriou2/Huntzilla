// the dark bar on the game pages with the hunt name, time and score

let clockTimer = null;
let onTimeUp = null;

// fills it in and starts the clock, whenUp runs when the time is up
function startHeader(whenUp) {
  onTimeUp = whenUp;
  byId("gh-hunt").innerText = getCurrentHunt().name;
  showScore(getLastScore());
  tickClock();
  clockTimer = setInterval(tickClock, 1000);
}

// runs every second. goes red under a minute
function tickClock() {
  let hunt = getCurrentHunt();
  if (!hunt) return;
  let left = hunt.deadline - new Date().getTime();
  byId("gh-time").innerText = formatClock(left);
  if (left < 60000) byId("gh-time").setAttribute("class", "gh-time is-low");
  if (left <= 0) {
    stopHeader();
    if (onTimeUp) onTimeUp();
  }
}

function stopHeader() {
  clearInterval(clockTimer);
  clockTimer = null;
}

function showScore(score) {
  byId("gh-score").innerText = score + " pts";
}

// "Clue 3 of 10" + the bar
function showProgress(index, total) {
  byId("gh-clue").innerText = "Clue " + (index + 1) + " of " + total;
  byId("bar-fill").style.width = roundNumber(index / total * 100) + "%";
}

// gets the score from the server
function refreshScore() {
  getScore(getSession()).then(function (data) {
    if (data.status === "ERROR") return;
    setLastScore(data.score);
    showScore(data.score);
  });
}
