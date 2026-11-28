// question.html - where you actually play.
// gets the clue, shows the right answer box, sends the answer and shows if you got it

let question = null; // the clue thats on screen
let picked = ""; // which A-D / True False button is picked
let sending = false; // so an answer doesnt get sent twice
let dialogAction = null; // what the popup's ok button does


// getting the clue

function loadQuestion() {
  hide("offline-note");
  hide("clue-view");
  show("loading");

  getQuestion(getSession()).then(function (data) {
    hide("loading");

    if (data.status === "ERROR") {
      gameError(data);
      return;
    }
    // completed means theres no clues left
    if (data.completed) {
      endGame("finished");
      return;
    }

    question = data;
    showClue();
  });
}

function showClue() {
  picked = "";
  showProgress(question.currentQuestionIndex, question.numOfQuestions);

  // the question text can have html in it (links, bold etc) so it goes through
  // safeQuestionHtml first, that also makes links open in a new tab
  byId("question-text").innerHTML = safeQuestionHtml(question.questionText);
  byId("answer-error").innerText = "";
  byId("submit-btn").innerText = "Send answer";

  buildAnswer();
  show("clue-view");
}

// MCQ gets 4 buttons, BOOLEAN gets True/False, everything else gets a text box.
// INTEGER uses a number box so phones show the number keyboard
function buildAnswer() {
  let area = byId("answer-area");
  area.innerHTML = "";
  let type = question.questionType;

  if (type === "MCQ") {
    let choices = makeEl("div", "choices", "");
    let letters = ["A", "B", "C", "D"];
    for (let letter of letters) {
      choices.appendChild(choiceButton(letter, letter));
    }
    area.appendChild(choices);

  } else if (type === "BOOLEAN") {
    let choices = makeEl("div", "choices", "");
    choices.appendChild(choiceButton("True", "T"));
    choices.appendChild(choiceButton("False", "F"));
    area.appendChild(choices);

  } else {
    let label = makeEl("label", "field-label", "YOUR ANSWER");
    label.setAttribute("for", "answer-input");
    area.appendChild(label);

    let input = makeEl("input", "text-input", "");
    input.setAttribute("id", "answer-input");
    if (type === "INTEGER") {
      input.setAttribute("type", "number");
    } else {
      input.setAttribute("type", "text");
    }
    if (type === "NUMERIC") input.setAttribute("placeholder", "Like 2.5");
    area.appendChild(input);
  }
}

// one big button like A or True
function choiceButton(value, letter) {
  let button = makeEl("button", "choice", "");
  button.setAttribute("type", "button");
  button.setAttribute("id", "choice-" + value);
  button.setAttribute("onclick", "pick('" + value + "')");
  button.appendChild(makeEl("span", "choice-letter", letter));
  if (value !== letter) button.appendChild(makeEl("span", "", value));
  return button;
}

// highlights the button you tapped and un-highlights the old one
function pick(value) {
  if (picked) byId("choice-" + picked).setAttribute("class", "choice");
  picked = value;
  byId("choice-" + value).setAttribute("class", "choice is-picked");
}

function currentAnswer() {
  let type = question.questionType;
  if (type === "MCQ" || type === "BOOLEAN") return picked;
  return byId("answer-input").value;
}


// sending the answer

function submitAnswer() {
  if (sending || !question) return;

  // check it first so we dont waste a go on something like "abc" for a number
  let raw = currentAnswer();
  let problem = validateAnswer(question.questionType, raw);
  byId("answer-error").innerText = problem;
  if (problem !== "") return;

  let answer = formatAnswer(question.questionType, raw);
  sending = true;
  byId("submit-btn").innerText = "Checking…";
  sendIt(answer);
}

function sendIt(answer) {
  sendAnswer(getSession(), answer).then(function (data) {
    sending = false;
    byId("submit-btn").innerText = "Send answer";
    if (data.status === "ERROR") {
      gameError(data);
      return;
    }
    refreshScore();

    let points = pointsText(data.scoreAdjustment);
    if (data.correct) {
      let next = "Next clue";
      if (data.completed) next = "See your score";

      openDialog("✓", "is-good", "Correct!", points, data.message, next, function () {
        if (data.completed) {
          endGame("finished");
        } else {
          loadQuestion();
        }
      }, false);
    } else {
      // wrong just closes the popup so they can try the same clue again
      openDialog("✗", "is-bad", "Not quite", points, data.message, "Try again", null, false);
    }
  });
}

// +10 points / -3 points, nothing if its 0
function pointsText(n) {
  if (!n) return "";
  if (n > 0) return "+" + n + " points";
  return n + " points";
}


// popup

// one popup for everything (right, wrong, skip, errors).
// onOk is what happens when they press the main button, null just closes it
function openDialog(icon, iconClass, title, points, text, okLabel, onOk, withCancel) {
  byId("dlg-icon").innerText = icon;
  byId("dlg-icon").setAttribute("class", "dialog-icon " + iconClass);
  byId("dlg-title").innerText = title;
  byId("dlg-points").innerText = points;
  byId("dlg-text").innerText = text;
  byId("dlg-ok").innerText = okLabel;

  if (withCancel) {
    show("dlg-cancel");
  } else {
    hide("dlg-cancel");
  }
  dialogAction = onOk;
  show("dialog");
}

function dialogOk() {
  hide("dialog");
  if (dialogAction) dialogAction();
}


// errors

// kind comes from errorKind in api.js
function gameError(data) {
  sending = false;
  byId("submit-btn").innerText = "Send answer";

  if (data.kind === "expired") {
    endGame("expired");
    return;
  }
  if (data.kind === "network") {
    show("offline-note");
    return;
  }
  if (data.kind === "session-unknown") {
    endSession();
    openDialog("!", "", "Game not found", "", errorText(data), "Back to the hunts", function () {
      openPage("app.html");
    }, false);
    return;
  }

  openDialog("!", "", "Something went wrong", "", errorText(data), "OK", null, false);
}


// end of the game

function endGame(kind) {
  // grab these before endSession() at the bottom clears them
  let session = getSession();
  let hunt = getCurrentHunt();

  stopHeader();
  hide("loading");
  hide("clue-view");

  if (kind === "finished") {
    byId("end-title").innerText = "You finished!";
    byId("end-text").innerText = "You got through every clue in " + hunt.name + ".";
  } else {
    byId("end-title").innerText = "Time's up";
    byId("end-text").innerText = "The clock ran out for " + hunt.name + ".";
  }

  // show the saved score straight away then the real one when it comes back
  byId("end-score").innerText = getLastScore() + " points";
  if (session) {
    getScore(session).then(function (data) {
      if (data.status === "ERROR") return;
      setLastScore(data.score);
      byId("end-score").innerText = data.score + " points";
    });
  }

  show("end-view");
  endSession();
}


if (!getCurrentHunt()) {
  // not playing so back to the list
  openPage("app.html");
} else if (!getSession() || getCurrentHunt().deadline <= new Date().getTime()) {
  // the cookie runs out at the same time as the hunt, so no cookie = times up
  byId("gh-hunt").innerText = getCurrentHunt().name;
  endGame("expired");
} else {
  startHeader(function () {
    endGame("expired");
  });
  loadQuestion();
}
