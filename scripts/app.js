// app.html - the hunt list, and the join form when you tap a hunt

let hunts = [];
let joining = null; // the hunt thats on the join form
let starting = false; // so start cant get pressed twice while we wait for the server


// ----- the hunt list -----

function loadHunts() {
  byId("hunt-list").innerHTML = '<p class="muted">Loading hunts…</p>';

  getHuntList().then(function (data) {
    if (data.status === "ERROR") {
      showListMessage(errorText(data), true);
      return;
    }

    hunts = data.treasureHunts;
    showHunts();
    byId("updated").innerText = "Updated at " + formatTime(new Date().getTime());
  });
}

// live hunts go first, then upcoming, then ended.
// if two are the same status the one that ends sooner goes first
const STATUS_ORDER = { live: 0, upcoming: 1, ended: 2 };

function huntOrder(a, b) {
  let now = new Date().getTime();
  let diff = STATUS_ORDER[huntStatus(a, now)] - STATUS_ORDER[huntStatus(b, now)];
  if (diff !== 0) return diff;
  return a.endsOn - b.endsOn;
}

function showHunts() {
  let box = byId("hunt-list");
  box.innerHTML = "";

  if (hunts.length === 0) {
    showListMessage("No hunts right now. Check back soon.", false);
    return;
  }

  hunts.sort(huntOrder);
  let now = new Date().getTime();
  for (let hunt of hunts) {
    box.appendChild(huntCard(hunt, now));
  }
}

// makes the card for one hunt. only live ones can be tapped
function huntCard(hunt, now) {
  let status = huntStatus(hunt, now);
  let card;
  if (status === "live") {
    card = makeEl("a", "card", "");
    card.setAttribute("href", "app.html?hunt=" + hunt.uuid + testPart());
  } else {
    card = makeEl("div", "card is-ended", "");
  }

  // the little tag and the date line change depending on the status
  let badge = "Live";
  let when = "Open until " + formatDateTime(hunt.endsOn);
  if (status === "upcoming") {
    badge = "Starts " + relativeTime(hunt.startsOn, now);
    when = "Opens " + formatDateTime(hunt.startsOn);
  } else if (status === "ended") {
    badge = "Ended";
    when = "Closed " + formatDate(hunt.endsOn);
  }

  card.appendChild(makeEl("span", "badge badge--" + status, badge));
  card.appendChild(makeEl("h2", "", hunt.name));
  card.appendChild(makeEl("p", "hunt-desc", hunt.description));

  let meta = when;
  if (hunt.maxDuration) meta = formatDuration(hunt.maxDuration) + " to play · " + when;
  card.appendChild(makeEl("p", "hunt-meta", meta));
  if (status === "live") card.appendChild(makeEl("p", "hunt-go", "Join hunt →"));

  return card;
}

// puts a message where the list goes, eg no internet or no hunts
function showListMessage(text, withRetry) {
  let box = byId("hunt-list");
  box.innerHTML = "";

  let card = makeEl("div", "card state-card", "");
  card.appendChild(makeEl("p", "", text));
  if (withRetry) {
    let button = makeEl("button", "btn", "Try again");
    button.setAttribute("type", "button");
    button.setAttribute("onclick", "loadHunts()");
    card.appendChild(button);
  }
  box.appendChild(card);
}


// ----- joining a hunt -----

// app.html?hunt=... opens this. we get the list again to find the hunt
// because the page reloaded so we lost the old one
function openJoin(id) {
  hide("list-view");
  show("join-view");
  byId("join-name").innerText = "Loading…";

  getHuntList().then(function (data) {
    if (data.status === "ERROR") {
      byId("join-name").innerText = errorText(data);
      return;
    }

    for (let hunt of data.treasureHunts) {
      if (hunt.uuid === id) {
        showJoin(hunt);
        return;
      }
    }
    byId("join-name").innerText = "We can't find that hunt any more";
  });
}

function showJoin(hunt) {
  joining = hunt;
  byId("join-name").innerText = hunt.name;
  byId("join-desc").innerText = hunt.description;
  byId("join-limit").innerText = hunt.maxDuration ? formatDuration(hunt.maxDuration) : "None";
  byId("join-closes").innerText = formatDateTime(hunt.endsOn);
  byId("player").value = getRememberedName();
}

// runs when the form is sent. if the server says ok we save the game
// (cookie + localStorage) and go to question.html
function joinHunt() {
  if (starting || !joining) return;

  let name = trimSpaces(byId("player").value);
  byId("player-error").innerText = "";
  if (name === "") {
    byId("player-error").innerText = "Add a name so we can put you on the leaderboard.";
    return;
  }

  starting = true;
  byId("start-btn").innerText = "Starting…";

  startHunt(name, joining.uuid).then(function (data) {
    starting = false;
    byId("start-btn").innerText = "Start hunt";
    if (data.status === "ERROR") {
      byId("player-error").innerText = errorText(data);
      return;
    }

    startSession(data.session, joining, name, data.numOfQuestions);
    rememberName(name, true);
    openPage("question.html");
  });
}


if (addressValue("hunt")) {
  openJoin(addressValue("hunt"));
} else {
  loadHunts();
}
