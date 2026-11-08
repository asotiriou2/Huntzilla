const API_URL = "https://codecyprus.org/th/api";
const audio = document.getElementById("jingle");
const musicBtn = document.getElementById("music-button");
const startGameButton = document.getElementById("start-game");
const gameNotStarted = document.getElementById("game-not-started");
const gameStarted = document.getElementById("game-started");
const treasureHuntsList = document.getElementById("treasure-hunts-list");
const errorMsg = document.getElementById("error-message");
const goBackButton = document.getElementById("go-back");
const submitButton = document.getElementById("submit");
const player = document.getElementById("player");
const world = document.getElementById("world");

// This is the object that holds information about the available treasure hunts
let availableTreasureHunts = {};
let selectedTreasureHunt = null;
let selectedTreasureHuntButton = null;

let formData = {
    playerName: "",
    appName: "",
    treasureHunt: null,
    isEmpty(){
        return (!this.playerName || !this.treasureHunt || !this.treasureHunt);
    }
};

if (musicBtn && audio) {
    musicBtn.addEventListener("click", function(event) {
        event.preventDefault();

        if (audio.paused) {
            audio.play();
            musicBtn.innerText = "Music (On)";
        } else {
            audio.pause();
            musicBtn.innerText = "Music (Off)";
        }
    });
}

startGameButton.addEventListener("click", async () => {
    startGameButton.disabled = true;
    startGameButton.innerText = "STARTING...";
    availableTreasureHunts = (await fetchAvailableTreasureHunts()).treasureHunts;
    startGameButton.disabled = false;
    startGameButton.innerText = "START";
    gameNotStarted.ariaHidden = "true";
    gameStarted.ariaHidden = "false";

    // Empty the list: Go Back button created which doesn't refresh the page
    treasureHuntsList.innerHTML = "";
    resetForm();

    for (const treasureHunt of availableTreasureHunts){
        const listItem = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.classList.add("treasure-hunt-button");
        button.dataset.treasureHunt = JSON.stringify(treasureHunt);
        button.innerText = treasureHunt.description;
        listItem.appendChild(button);
        treasureHuntsList.appendChild(listItem);
    }
    let treasureHuntButtons = document.getElementsByClassName("treasure-hunt-button");
    for (const button of treasureHuntButtons){
        button.addEventListener("click", (event) => {
            if (selectedTreasureHuntButton !== button) {
                selectedTreasureHuntButton = button;
                button.classList.add("selected");
                selectedTreasureHunt = JSON.parse(button.dataset.treasureHunt);
            }
            for (let sb of treasureHuntButtons){
                if (sb !== button){
                    sb.classList.remove("selected");
                }
            }
        })
    }
});

submitButton.addEventListener("click", async (event) => {
    event.preventDefault();
    if (player.value.length === 0){
        errorMsg.innerText = "Please enter a player name";
        errorMsg.ariaHidden = "false";
        return;
    }
    else if (world.value.length === 0){
        errorMsg.innerText = "Please enter a world name";
        errorMsg.ariaHidden = "false";
        return;
    }else if (selectedTreasureHunt === null){
        errorMsg.innerText = "Please select a treasure hunt";
        errorMsg.ariaHidden = "false";
        return;
    }else{
        errorMsg.ariaHidden = "true";
    }
    formData.playerName = player.value.trim().split(" ").join("-");
    formData.appName = world.value.trim().split(" ").join("-");
    formData.treasureHunt = selectedTreasureHunt;

    console.log(formData);
    submitButton.disabled = true;
    event.target.value = "Loading..."
    await startTreasureHuntGame();
});

goBackButton.addEventListener("click", (event) => {
    gameStarted.ariaHidden = "true";
    gameNotStarted.ariaHidden = "false";
});
const fetchAvailableTreasureHunts = async () => {
    const response = await fetch(`${API_URL}/list`);
    return await response.json();
};
const startTreasureHuntGame = async () => {
    if (formData.isEmpty()) return;

    const response = await fetch(`${API_URL}/start?player=${formData.playerName}&app=${formData.appName}&treasure-hunt-id=${formData.treasureHunt.uuid}`)

    const data = await response.json();

    console.log(data);
    if (data.status === "ERROR"){
        errorMsg.ariaHidden = "false";
        errorMsg.innerHTML = data.errorMessages[0];
        submitButton.disabled = false;
        submitButton.value = "Play";
    }else{
        submitButton.disabled = false;
        submitButton.value = "Game is Starting!";
    }

};
const resetForm = () => {
    player.value = "";
    world.value = "";
    selectedTreasureHunt = null;
    errorMsg.innerHTML = "";
    submitButton.disabled = false;
    submitButton.value = "Play";
};
console.log(formData.isEmpty());