// Some small functions in that'll help in the game and for unit testing too.
// its not interacting with the server or changing the design atleast not yet // Emmanuel pls check this for testing page.

//  text checks

// space, tab, new line or non-breaking space
function isSpace(ch) {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r" || ch === "\u00A0";
}

// letter, number or _
function isWordChar(ch) {
  if (ch === "") return false;
  return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || (ch >= "0" && ch <= "9") || ch === "_";
}

// only digits 0-9
function isDigits(text) {
  if (text.length === 0) return false;
  for (let i = 0; i < text.length; i++) {
    if (text[i] < "0" || text[i] > "9") return false;
  }
  return true;
}

// turns lots of spaces into one
function collapseSpaces(text) {
  let out = "";
  let lastWasSpace = false;
  for (let i = 0; i < text.length; i++) {
    if (isSpace(text[i])) {
      if (!lastWasSpace) out += " ";
      lastWasSpace = true;
    } else {
      out += text[i];
      lastWasSpace = false;
    }
  }
  return trimSpaces(out);
}

// takes the spaces off both ends
function trimSpaces(text) {
  let start = 0;
  let end = text.length;
  while (start < end && isSpace(text[start])) start++;
  while (end > start && isSpace(text[end - 1])) end--;
  return text.substring(start, end);
}

// starts with http:// or https://
function startsWithHttp(text) {
  let lower = text.toLowerCase();
  return lower.indexOf("http://") === 0 || lower.indexOf("https://") === 0;
}

//  answers

// cleans up the answer before sending it to the api
function formatAnswer(type, raw) {
  let value = "";
  if (raw !== null && raw !== undefined) value = trimSpaces("" + raw);
  if (type === "MCQ") {
    // a-d becomes A-D, anything else gets caught by validateAnswer
    let pos = "abcd".indexOf(value.toLowerCase());
    if (value.length === 1 && pos !== -1) return "ABCD".substring(pos, pos + 1);
    return value;
  }
  if (type === "BOOLEAN") {
    let lower = value.toLowerCase();
    if (lower === "true" || lower === "t" || lower === "yes") return "True";
    if (lower === "false" || lower === "f" || lower === "no") return "False";
    return value;
  }
  if (type === "INTEGER") {
    if (value.indexOf("+") === 0) value = value.substring(1);
    return value;
  }
  if (type === "NUMERIC") {
    // 1,5 becomes 1.5
    let comma = value.indexOf(",");
    if (comma !== -1) value = value.substring(0, comma) + "." + value.substring(comma + 1);
    if (value.indexOf("+") === 0) value = value.substring(1);
    return value;
  }
  return value;
}

// whole number like 7 or -12
function isWholeNumber(value) {
  if (value.indexOf("-") === 0) value = value.substring(1);
  return isDigits(value);
}

// number like 2.3 or -0.5
function isDecimalNumber(value) {
  if (value.indexOf("-") === 0) value = value.substring(1);
  let dot = value.indexOf(".");
  if (dot === -1) return isDigits(value);
  return isDigits(value.substring(0, dot)) && isDigits(value.substring(dot + 1));
}

// gives an error message, or "" if its ok
function validateAnswer(type, raw) {
  let value = formatAnswer(type, raw);
  if (value === "") return "Type or pick an answer first.";
  if (type === "MCQ" && ["A", "B", "C", "D"].indexOf(value) === -1) return "Pick A, B, C or D.";
  if (type === "BOOLEAN" && value !== "True" && value !== "False") return "Pick True or False.";
  if (type === "INTEGER" && !isWholeNumber(value)) return "Enter a whole number, like 7.";
  if (type === "NUMERIC" && !isDecimalNumber(value)) return "Enter a number, like 2.3.";
  return "";
}

//  hunts and time (all in milliseconds)

// live, upcoming or ended
function huntStatus(hunt, now) {
  if (!now) now = new Date().getTime();
  if (now < hunt.startsOn) return "upcoming";
  if (now >= hunt.endsOn) return "ended";
  return "live";
}

// when the session has to end
function sessionDeadline(hunt, startedAt) {
  if (!hunt.maxDuration) return hunt.endsOn;
  return Math.min(startedAt + hunt.maxDuration, hunt.endsOn);
}

// parseInt drops the decimals, 2.7 becomes 2 (worksheet 9a)
// adding 0.5 first rounds it to the nearest instead
function roundNumber(x) {
  return parseInt(x + 0.5);
}

// timer text like 12:34
function formatClock(ms) {
  if (ms < 0) ms = 0;
  let total = parseInt(ms / 1000);
  if (total * 1000 < ms) total = total + 1;   // round the seconds up
  let hours = parseInt(total / 3600);
  let minutes = parseInt((total % 3600) / 60);
  let seconds = total % 60;
  let mm = hours ? twoDigits(minutes) : "" + minutes;
  return (hours ? hours + ":" : "") + mm + ":" + twoDigits(seconds);
}

// like "30 min" or "1 h 30 min"
function formatDuration(ms) {
  let minutes = roundNumber(ms / 60000);
  if (minutes < 60) return minutes + " min";
  let hours = parseInt(minutes / 60);
  let rest = minutes % 60;
  return hours + " h" + (rest ? " " + rest + " min" : "");
}

// "in 25 min", "2h ago" or the date
function relativeTime(target, now) {
  if (!now) now = new Date().getTime();
  let diff = target - now;
  let gap = diff;
  if (gap < 0) gap = -gap;
  let minutes = roundNumber(gap / 60000);
  let text;
  if (minutes < 60) {
    text = minutes + " min";
  } else if (minutes < 60 * 24) {
    text = roundNumber(minutes / 60) + "h";
  } else {
    let date = new Date(target);
    return DAY_NAMES[date.getDay()] + " " + date.getDate() + " " + MONTH_NAMES[date.getMonth()] + ", " + formatTime(target);
  }
  return diff >= 0 ? "in " + text : text + " ago";
}

//  dates
// https://www.w3schools.com/js/js_date_methods.asp

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

// adds a 0 in front, 5 becomes 05
function twoDigits(n) {
  return n < 10 ? "0" + n : "" + n;
}

function formatTime(ms) {
  let date = new Date(ms);
  return twoDigits(date.getHours()) + ":" + twoDigits(date.getMinutes());
}

function formatDateTime(ms) {
  let date = new Date(ms);
  return date.getDate() + " " + MONTH_NAMES[date.getMonth()] + " " + date.getFullYear() + ", " + formatTime(ms);
}

function formatDate(ms) {
  let date = new Date(ms);
  return twoDigits(date.getDate()) + "/" + twoDigits(date.getMonth() + 1) + "/" + date.getFullYear();
}

// leaderboard

// players position on the leaderboard, 0 if not there
function rankOf(board, player) {
  if (!board || !player) return 0;
  let name = ("" + player).toLowerCase();
  for (let i = 0; i < board.length; i++) {
    if (("" + board[i].player).toLowerCase() === name) return i + 1;
  }
  return 0;
}

//  question text

// puts the question in a div so the browser reads the html,
// makes web addresses clickable and every link open in a new tab
function safeQuestionHtml(html) {
  if (!html) html = "";
  let box = document.createElement("div");
  box.innerHTML = html;
  if (box.children.length === 0) {   // no tags, just text
    let text = box.innerText;
    box.innerHTML = "";
    addLinks(box, text);
  }
  let links = box.getElementsByTagName("a");
  for (let i = 0; i < links.length; i++) {
    // opens in a new tab https://www.w3schools.com/tags/att_a_target.asp
    links[i].setAttribute("target", "_blank");
    links[i].setAttribute("rel", "noopener noreferrer");
  }
  return box.innerHTML;
}

// adds the text to the box with every web address as a link
function addLinks(box, text) {
  let last = 0;
  let found = findUrl(text, 0);
  while (found) {
    addText(box, text.substring(last, found.index));
    let link = document.createElement("a");
    link.setAttribute("href", found.url);
    link.innerText = found.url;
    box.appendChild(link);
    last = found.index + found.url.length;
    found = findUrl(text, last);
  }
  addText(box, text.substring(last));
}

// innerText keeps it as plain text so nothing in it runs
function addText(box, text) {
  if (text === "") return;
  let span = document.createElement("span");
  span.innerText = text;
  box.appendChild(span);
}

// where a web address stops
function endsUrl(ch) {
  return isSpace(ch) || ch === "<" || ch === ">" || ch === '"' || ch === "'";
}

// finds the next web address, or null
function findUrl(text, from) {
  for (let i = from; i < text.length; i++) {
    let prefixLength = 0;
    if (text.substring(i, i + 7) === "http://") prefixLength = 7;
    if (text.substring(i, i + 8) === "https://") prefixLength = 8;
    if (prefixLength > 0) {
      let end = i + prefixLength;
      while (end < text.length && !endsUrl(text[end])) end++;
      let before = "";
      if (i > 0) before = text[i - 1];
      if (end > i + prefixLength && !isWordChar(before)) {
        return { index: i, url: text.substring(i, end) };
      }
    }
  }
  return null;
}

// question without the html
function questionPlainText(html) {
  if (!html) html = "";
  let source = document.createElement("div");
  source.innerHTML = html;
  return collapseSpaces(source.innerText);
}

// is the whole thing just a link
function isUrl(text) {
  if (!text) return false;
  let value = trimSpaces("" + text);
  if (!startsWithHttp(value)) return false;
  let prefixLength = 7;
  if (value.toLowerCase().indexOf("https://") === 0) prefixLength = 8;
  let rest = value.substring(prefixLength);
  if (rest.length === 0) return false;
  for (let i = 0; i < rest.length; i++) {
    if (isSpace(rest[i])) return false;
  }
  return true;
}
