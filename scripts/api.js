// Huntzilla: talking to the Treasure Hunt API with fetch() please check week 6 or 7 before making changes.
// Every call goes to the network.

let apiBase = "https://codecyprus.org/th/api/";
const APP_NAME = "Huntzilla-Team-C";

// test.html points this at the Testing API instead
function setApiBase(url) {
  apiBase = url;
}

// The server explains errors in errorMessages. This works out which kind of error it is,
// so the app can show a friendly message for it.
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

// Values go straight into the address . The browser turns spaces into %20 by itself,
// but &, # and + would break the address, so they are left out.
function cleanParam(value) {
  let text = String(value);
  let out = "";
  for (let i = 0; i < text.length; i++) {
    let ch = text[i];
    if (ch === "&" || ch === "#" || ch === "+") continue;
    out += ch;
  }
  return out;
}

// Calls one API endpoint. params is an object such as { session: "abc" }.
// Gives back a Promise with the server's JSON reply.
// If something goes wrong it rejects with { kind, message }.
function apiCall(endpoint, params) {
  let url = apiBase + endpoint;
  let query = [];
  for (let key in params) {
    let value = params[key];
    if (value === undefined || value === null || value === false) continue;
    if (value === true) {
      query.push(key);   // flags like ?sorted
    } else {
      query.push(key + "=" + cleanParam(value));
    }
  }
  if (query.length > 0) url = url + "?" + query.join("&");

  return fetch(url, { cache: "no-store" })
    .catch(function () {
      throw { kind: "network", message: "No connection" };
    })
    .then(response => response.json())
    .then(function (data) {
      if (data.status === "ERROR") {
        let message = (data.errorMessages || []).join(" ");
        throw { kind: errorKind(message), message: message };
      }
      return data;
    });
}

// One function for each  API command

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

// During a hunt pass the session; after it pass the hunt's id and true
function getLeaderboard(sessionOrHuntId, isHuntId) {
  let params = { sorted: true, limit: 20 };
  if (isHuntId) {
    params["treasure-hunt-id"] = sessionOrHuntId;
  } else {
    params.session = sessionOrHuntId;
  }
  return apiCall("leaderboard", params);
}
