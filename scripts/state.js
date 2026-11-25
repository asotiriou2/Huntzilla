// Huntzilla: what the app remembers between visits.
// The session id lives in a cookie  so a game can be resumed after the browser closes.
// Everything else uses localStorage  The current question is never stored.



// check worksheet 7b plz
function setCookie(cookieName, cookieValue, expireDays) {
  let date = new Date();
  date.setTime(date.getTime() + (expireDays * 24 * 60 * 60 * 1000));
  let expires = "expires=" + date.toUTCString();
  document.cook ie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
}

/
function getCookie(cookieName) {
  let name = cookieName + "=";
  let parts = document.cookie.split(";");
  for (let i = 0; i < parts.length; i++) {
    let c = parts[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// From W3Schools: a cookie is deleted by giving it a date in the past
function deleteCookie(cookieName) {
  document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// localStorage

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // storage is full or blocked (private browsing): carry on without it
  }
}

function loadData(key, defaultValue) {
  try {
    let saved = localStorage.getItem(key);
    if (saved === null) return defaultValue;
    return JSON.parse(saved);
  } catch (error) {
    return defaultValue;
  }
}

function removeData(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    // ignore
  }
}

// The names everything is saved under
const SESSION_COOKIE = "treasure-hunt-session";
const HUNT_KEY = "huntzilla.hunt";              // { id, name, maxDuration, endsOn, startedAt, deadline, player, numOfQuestions }
const PLAYER_KEY = "huntzilla.player";          // remembered name
const SCORE_KEY = "huntzilla.score";            // last known score
const TRAIL_KEY = "huntzilla.trail";            // [{ lat, lng, t }]
const HISTORY_KEY = "huntzilla.history";        // [{ n, text, type, answer, result, points, lat, lng, t }]
const LAST_HUNT_KEY = "huntzilla.lastHunt";     // { id, name, player } for the leaderboard after a hunt
const PRIMED_KEY = "huntzilla.locationPrimed";  // the location screen was shown for this hunt
const LOCATION_ON_KEY = "huntzilla.locationOn"; // the player allowed location for this hunt

// The game session

// A new hunt has started
function startSession(session, hunt, player, numOfQuestions) {
  let startedAt = Date.now();
  let deadline = sessionDeadline(hunt, startedAt);
  let daysLeft = (deadline - startedAt) / (24 * 60 * 60 * 1000);
  setCookie(SESSION_COOKIE, session, daysLeft);
  saveData(HUNT_KEY, {
    id: hunt.uuid,
    name: hunt.name,
    maxDuration: hunt.maxDuration,
    endsOn: hunt.endsOn,
    startedAt: startedAt,
    deadline: deadline,
    player: player,
    numOfQuestions: numOfQuestions
  });
  saveData(LAST_HUNT_KEY, { id: hunt.uuid, name: hunt.name, player: player });
  saveData(SCORE_KEY, 0);
  saveData(TRAIL_KEY, []);
  saveData(HISTORY_KEY, []);
  removeData(PRIMED_KEY);
  removeData(LOCATION_ON_KEY);
}

function getSession() {
  return getCookie(SESSION_COOKIE);
}

function getCurrentHunt() {
  return loadData(HUNT_KEY, null);
}

function getLastHunt() {
  return loadData(LAST_HUNT_KEY, null);
}

// The game is over or abandoned. Past answers and the trail stay until the next hunt.
function endSession() {
  deleteCookie(SESSION_COOKIE);
  removeData(HUNT_KEY);
  removeData(PRIMED_KEY);
  removeData(LOCATION_ON_KEY);
}

function getRememberedName() {
  return loadData(PLAYER_KEY, "");
}

function rememberName(name, remember) {
  if (remember) {
    saveData(PLAYER_KEY, name);
  } else {
    removeData(PLAYER_KEY);
  }
}

function getLastScore() {
  return loadData(SCORE_KEY, 0);
}

function setLastScore(score) {
  saveData(SCORE_KEY, score);
}

function getTrail() {
  return loadData(TRAIL_KEY, []);
}

function addTrailPoint(lat, lng) {
  let trail = loadData(TRAIL_KEY, []);
  trail.push({ lat: lat, lng: lng, t: Date.now() });
  saveData(TRAIL_KEY, trail);
}

function getHistory() {
  return loadData(HISTORY_KEY, []);
}

function addHistory(entry) {
  let list = loadData(HISTORY_KEY, []);
  list.push(entry);
  saveData(HISTORY_KEY, list);
}

function setLocationPrimed() {
  saveData(PRIMED_KEY, true);
}

function isLocationOn() {
  return loadData(LOCATION_ON_KEY, false);
}

function setLocationOn(on) {
  saveData(LOCATION_ON_KEY, on);
}
