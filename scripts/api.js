// Huntzilla: talking to the Treasure Hunt API with fetch() please check week 6 or 7 before making changes.
// Every call goes to the network.

let apiBase = "https://codecyprus.org/th/api/";
const APP_NAME = "Huntzilla-Team-C";

// test.html uses this to switch to the testing api
function setApiBase(url) {
  apiBase = url;
}

// works out what kind of error the server sent back
function errorKind(message) {
  let text = message.toLowerCase();
  if (text.includes("already in use")) return "name-taken";
  if (text.includes("missing or empty parameter: player")) return "name-missing";
  if (text.includes("missing or empty parameter")) return "missing-parameter";
  if (text.includes("not active")) return "hunt-not-active";
  if (text.includes("is empty")) return "hunt-empty";
  if (text.includes("could not find a treasure hunt")) return "hunt-unknown";
  if (text.includes("unknown session") || text.includes("invalid session")) return "session-unknown";
  if (text.includes("run out of time") || text.includes("finished session") || text.includes("has ended")) return "expired";
  if (text.includes("skip")) return "cannot-skip";
  if (text.includes("location")) return "location";
  if (text.includes("completed")) return "completed";
  return "unknown";
}

// takes out & # + because they break the url
function cleanParam(value) {
  let text = "" + value;
  let out = "";
  for (let i = 0; i < text.length; i++) {
    let ch = text[i];
    if (ch !== "&" && ch !== "#" && ch !== "+") out += ch;
  }
  return out;
}

// calls the api, like endpoint?key=value&key=value
// always gives back the json. if something went wrong status is "ERROR"
// and kind + message say what, so check data.status
function apiCall(endpoint, params) {
  let url = apiBase + endpoint;
  let first = true;
  for (let key in params) {
    let value = params[key];
    if (value !== undefined && value !== null && value !== false) {
      if (first) {
        url += "?";
      } else {
        url += "&";
      }
      first = false;
      if (value === true) {
        url += key;                          // like ?sorted
      } else {
        url += key + "=" + cleanParam(value);
      }
    }
  }

  return fetch(url)
    .then(response => response.json())
    .then(function (data) {
      if (data.status === "ERROR") {
        let message = "";
        if (data.errorMessages) {
          for (let i = 0; i < data.errorMessages.length; i++) {
            if (i > 0) message += " ";
            message += data.errorMessages[i];
          }
        }
        data.kind = errorKind(message);
        data.message = message;
      }
      return data;
    })
    .catch(function () {
      // no internet or the server didn't answer
      return { status: "ERROR", kind: "network", message: "No connection", errorMessages: ["No connection"] };
    });
}

// one function for each api command

function getHuntList() {
  return apiCall("list", {});
}

function startHunt(player, huntId) {
  return apiCall("start", { player: player, app: APP_NAME, "treasure-hunt-id": huntId });
}

function getQuestion(session) {
  return apiCall("question", { session: session });
}

function sendAnswer(session, answer) {
  return apiCall("answer", { session: session, answer: answer });
}

function sendLocation(session, latitude, longitude) {
  return apiCall("location", { session: session, latitude: latitude, longitude: longitude });
}

function skipQuestion(session) {
  return apiCall("skip", { session: session });
}

function getScore(session) {
  return apiCall("score", { session: session });
}

// session during the hunt, hunt id + true after it
function getLeaderboard(sessionOrHuntId, isHuntId) {
  if (isHuntId) {
    return apiCall("leaderboard", { sorted: true, limit: 20, "treasure-hunt-id": sessionOrHuntId });
  }
  return apiCall("leaderboard", { sorted: true, limit: 20, session: sessionOrHuntId });
}
