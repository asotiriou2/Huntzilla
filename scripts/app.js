// app.html - the hunt list, and the join form when you tap a hunt

let hunts = [];


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
  // cant join yet, thats the next update
  card = makeEl("div", "card", "");
  if (status !== "live") card.setAttribute("class", "card is-ended");

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


loadHunts();
