// Huntzilla: what the app remembers between visits.
// session id goes in a cookie so you can carry on after closing the browser.
// everything else goes in localStorage. the current question is never saved.

//  cookies

// check worksheet 7b plz
function setCookie(cookieName, cookieValue, expireDays) {
  let date = new Date();
  date.setTime(date.getTime() + (expireDays * 24 * 60 * 60 * 1000));
  let expires = "expires=" + date.toUTCString();
  document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
}

// document.cookie looks like "a=1; b=2", so find "; name=" and cut out the value
function getCookie(cookieName) {
  let cookies = "; " + document.cookie + ";";
  let start = cookies.indexOf("; " + cookieName + "=");
  if (start === -1) return "";
  let rest = cookies.substring(start + cookieName.length + 3);
  return rest.substring(0, rest.indexOf(";"));
}

// setting it to yesterday deletes it
function deleteCookie(cookieName) {
  setCookie(cookieName, "", -1);
}

//  localStorage

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // storage not working, just skip it
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

// names for everything we save
const SESSION_COOKIE = "treasure-hunt-session";
const HUNT_KEY = "huntzilla.hunt";
const PLAYER_KEY = "huntzilla.player";          // remembered name
const SCORE_KEY = "huntzilla.score";            // last score
const TRAIL_KEY = "huntzilla.trail";            // places on the map
const HISTORY_KEY = "huntzilla.history";        // past answers
const LAST_HUNT_KEY = "huntzilla.lastHunt";     // for the leaderboard after
const PRIMED_KEY = "huntzilla.locationPrimed";  // location screen already shown
const LOCATION_ON_KEY = "huntzilla.locationOn"; // player said yes to location

//  the game session

// new hunt started
function startSession(session, hunt, player, numOfQuestions) {
  let startedAt = new Date().getTime();
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

// game over, answers and trail stay till the next hunt
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
  trail.push({ lat: lat, lng: lng, t: new Date().getTime() });
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
