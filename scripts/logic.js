// Some small functions in that'll help in the game and for unit testing too.
// its not interacting with the server or changing the design atleast not yet // Emmanuel pls check this for testing page.

// ---------- Text checks (plain string methods, no regular expressions) ----------

// true for a space, tab, new line or any other blank character
function isSpace(ch) {
  return ch.trim() === "";
}

// true for a letter, digit or underscore
function isWordChar(ch) {
  if (ch === "") return false;
  return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || (ch >= "0" && ch <= "9") || ch === "_";
}

// true when the text is one or more of the digits 0-9 and nothing else
function isDigits(text) {
  if (text.length === 0) return false;
  for (let i = 0; i < text.length; i++) {
    if (text[i] < "0" || text[i] > "9") return false;
  }
  return true;
}

// "a   b\n c" -> "a b c"
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
  return out.trim();
}

// Does the text start with http:// or https:// (any capitals)?
function startsWithHttp(text) {
  let lower = text.toLowerCase();
  return lower.startsWith("http://") || lower.startsWith("https://");
}

// ---------- Answers ----------

// Turn what the player entered into the text the API expects.
// MCQ -> "A".."D", BOOLEAN -> "True"/"False", numbers use a dot, text is trimmed.
function formatAnswer(type, raw) {
  let value = String(raw == null ? "" : raw).trim();
  if (type === "MCQ") {
    return value.toUpperCase();
  }
  if (type === "BOOLEAN") {
    let lower = value.toLowerCase();
    if (lower === "true" || lower === "t" || lower === "yes") return "True";
    if (lower === "false" || lower === "f" || lower === "no") return "False";
    return value;
  }
  if (type === "INTEGER") {
    if (value.startsWith("+")) value = value.slice(1);
    return value;
  }
  if (type === "NUMERIC") {
    value = value.replace(",", ".");
    if (value.startsWith("+")) value = value.slice(1);
    return value;
  }
  return value;
}

// "7", "-12"
function isWholeNumber(value) {
  if (value.startsWith("-")) value = value.slice(1);
  return isDigits(value);
}

// "2", "2.3", "-0.5"
function isDecimalNumber(value) {
  if (value.startsWith("-")) value = value.slice(1);
  let parts = value.split(".");
  if (parts.length === 1) return isDigits(parts[0]);
  if (parts.length === 2) return isDigits(parts[0]) && isDigits(parts[1]);
  return false;
}

// Returns an error message, or "" when the answer is fine to send.
function validateAnswer(type, raw) {
  let value = formatAnswer(type, raw);
  if (value === "") return "Type or pick an answer first.";
  if (type === "MCQ" && !["A", "B", "C", "D"].includes(value)) return "Pick A, B, C or D.";
  if (type === "BOOLEAN" && value !== "True" && value !== "False") return "Pick True or False.";
  if (type === "INTEGER" && !isWholeNumber(value)) return "Enter a whole number, like 7.";
  if (type === "NUMERIC" && !isDecimalNumber(value)) return "Enter a number, like 2.3.";
  return "";
}

// ---------- Hunts and time ----------

// "live", "upcoming" or "ended"
function huntStatus(hunt, now) {
  if (!now) now = Date.now();
  if (now < hunt.startsOn) return "upcoming";
  if (now >= hunt.endsOn) return "ended";
  return "live";
}

// When a session must end: the hunt's time limit from the start, or the hunt's end, whichever is first.
function sessionDeadline(hunt, startedAt) {
  if (!hunt.maxDuration) return hunt.endsOn;
  return Math.min(startedAt + hunt.maxDuration, hunt.endsOn);
}

// 754000 -> "12:34"; 3723000 -> "1:02:03"
function formatClock(ms) {
  let total = Math.max(0, Math.ceil(ms / 1000));
  let hours = Math.floor(total / 3600);
  let minutes = Math.floor((total % 3600) / 60);
  let seconds = total % 60;
  let mm = hours ? String(minutes).padStart(2, "0") : String(minutes);
  return (hours ? hours + ":" : "") + mm + ":" + String(seconds).padStart(2, "0");
}

// 1800000 -> "30 min"; 5400000 -> "1 h 30 min"
function formatDuration(ms) {
  let minutes = Math.round(ms / 60000);
  if (minutes < 60) return minutes + " min";
  let hours = Math.floor(minutes / 60);
  let rest = minutes % 60;
  return hours + " h" + (rest ? " " + rest + " min" : "");
}

// "in 25 min", "in 2h", or a date like "Tue 1 Sept, 14:00"
function relativeTime(target, now) {
  if (!now) now = Date.now();
  let diff = target - now;
  let minutes = Math.round(Math.abs(diff) / 60000);
  let text;
  if (minutes < 60) {
    text = minutes + " min";
  } else if (minutes < 60 * 24) {
    text = Math.round(minutes / 60) + "h";
  } else {
    let date = new Date(target);
    return DAY_NAMES[date.getDay()] + " " + date.getDate() + " " + MONTH_NAMES[date.getMonth()] + ", " + formatTime(target);
  }
  return diff >= 0 ? "in " + text : text + " ago";
}

// ---------- Dates and times (built from the Date object's get... methods) ----------

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

function twoDigits(n) {
  return String(n).padStart(2, "0");
}

// -> "14:05"
function formatTime(ms) {
  let date = new Date(ms);
  return twoDigits(date.getHours()) + ":" + twoDigits(date.getMinutes());
}

// -> "13 May 2026, 14:05"
function formatDateTime(ms) {
  let date = new Date(ms);
  return date.getDate() + " " + MONTH_NAMES[date.getMonth()] + " " + date.getFullYear() + ", " + formatTime(ms);
}

// -> "12/05/2026"
function formatDate(ms) {
  let date = new Date(ms);
  return twoDigits(date.getDate()) + "/" + twoDigits(date.getMonth() + 1) + "/" + date.getFullYear();
}

// ---------- Leaderboard ----------

// 1-based rank of a player in a sorted leaderboard, or 0 if its not listed.
function rankOf(board, player) {
  if (!board || !player) return 0;
  let name = String(player).toLowerCase();
  for (let i = 0; i < board.length; i++) {
    if (String(board[i].player).toLowerCase() === name) return i + 1;
  }
  return 0;
}

// ---------- Question text ----------

// Question text can contain simple HTML (and sometimes broken HTML).
// Keep a few safe tags, make every link open in a new tab, and turn bare URLs into links.
const ALLOWED_TAGS = ["A", "B", "STRONG", "I", "EM", "U", "CODE", "BR", "P", "SPAN", "SUB", "SUP"];

function safeQuestionHtml(html) {
  // Let the browser read the HTML into a hidden <div> (innerHTML), then copy only the safe parts
  let source = document.createElement("div");
  source.innerHTML = String(html || "");
  let out = document.createElement("div");
  copyChildren(source, out, false);
  return out.innerHTML;
}

// insideLink is true while copying the text of a link, so its words aren't turned into another link
function copyChildren(from, to, insideLink) {
  for (let node = from.firstChild; node; node = node.nextSibling) {
    if (node.nodeType === 3) {
      appendLinkified(node.nodeValue, to, insideLink);
    } else if (node.nodeType === 1) {
      let tag = node.nodeName;
      if (ALLOWED_TAGS.includes(tag)) {
        let el = document.createElement(tag.toLowerCase());
        if (tag === "A") {
          let href = node.getAttribute("href") || "";
          if (startsWithHttp(href)) {
            el.setAttribute("href", href);
            el.setAttribute("target", "_blank");
            el.setAttribute("rel", "noopener noreferrer");
          }
        }
        copyChildren(node, el, insideLink || tag === "A");
        to.appendChild(el);
      } else {
        copyChildren(node, to, insideLink); // unwrap unknown tags, keep their text
      }
    }
  }
}

function appendLinkified(text, to, insideLink) {
  if (insideLink) { to.appendChild(document.createTextNode(text)); return; }
  let last = 0;
  let found = findUrl(text, 0);
  while (found) {
    if (found.index > last) to.appendChild(document.createTextNode(text.slice(last, found.index)));
    let a = document.createElement("a");
    a.href = found.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = found.url;
    to.appendChild(a);
    last = found.index + found.url.length;
    found = findUrl(text, last);
  }
  if (last < text.length) to.appendChild(document.createTextNode(text.slice(last)));
}

// A web address ends at a space or at one of these characters
function endsUrl(ch) {
  return isSpace(ch) || ch === "<" || ch === ">" || ch === '"' || ch === "'";
}

// Finds the next web address in the text, starting at position "from".
// Returns { index, url } or null. The address must not be glued to a word before it.
function findUrl(text, from) {
  let i = from;
  while (i < text.length) {
    let http = text.indexOf("http://", i);
    let https = text.indexOf("https://", i);
    let start;
    if (http === -1) start = https;
    else if (https === -1) start = http;
    else start = Math.min(http, https);
    if (start === -1) return null;

    let prefixLength = text.startsWith("https://", start) ? 8 : 7;
    let end = start + prefixLength;
    while (end < text.length && !endsUrl(text[end])) end++;

    let before = start > 0 ? text[start - 1] : "";
    if (end > start + prefixLength && !isWordChar(before)) {
      return { index: start, url: text.slice(start, end) };
    }
    i = start + 1;
  }
  return null;
}

// Plain-text version of a question (for past answers and the map)
function questionPlainText(html) {
  let source = document.createElement("div");
  source.innerHTML = String(html || "");
  return collapseSpaces(source.textContent || "");
}

// Is the whole text a single web address?
function isUrl(text) {
  let value = String(text || "").trim();
  if (!startsWithHttp(value)) return false;
  let rest = value.slice(value.toLowerCase().startsWith("https://") ? 8 : 7);
  if (rest.length === 0) return false;
  for (let i = 0; i < rest.length; i++) {
    if (isSpace(rest[i])) return false;
  }
  return true;
}

// Escape text so it can go inside an HTML string safely
function esc(value) {
  return String(value == null ? "" : value)
    .split("&").join("&amp;")
    .split("<").join("&lt;")
    .split(">").join("&gt;")
    .split('"').join("&quot;")
    .split("'").join("&#39;");
}
