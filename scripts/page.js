// small helpers we use on every page so we dont keep repeating stuff

// shorter getElementById
function byId(id) {
  return document.getElementById(id);
}

// makes an element with a class and some text, ready to appendChild
function makeEl(tag, className, text) {
  let el = document.createElement(tag);
  if (className) el.setAttribute("class", className);
  if (text) el.innerText = text;
  return el;
}

// show / hide by id
function show(id) {
  byId(id).style.display = "block";
}

function hide(id) {
  byId(id).style.display = "none";
}

// gets something from the url, eg addressValue("hunt") for ?hunt=abc
function addressValue(name) {
  let url = new URL(window.location.href);
  return url.searchParams.get(name);
}

// go to another page https://www.w3schools.com/js/js_window_location.asp
function openPage(address) {
  window.location.href = address;
}
