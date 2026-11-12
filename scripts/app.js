import {getSessionCookie, musicHandler, fetchAvailableTreasureHunts, API_URL, APP_NAME} from "./util.js";

const startGameButton = document.getElementById("start-game");
const gameNotStarted = document.getElementById("game-not-started");
const gameStarted = document.getElementById("game-started");
const treasureHuntsList = document.getElementById("treasure-hunts-list");
const errorMsg = document.getElementById("error-message");
const goBackButton = document.getElementById("go-back");
const submitButton = document.getElementById("submit");
const player = document.getElementById("player");
const part2Container = document.getElementById("part-2");
const part1Container = document.getElementById("part-1");
const treasureHuntForm = document.getElementById("treasure-hunt-form");


/* APP */
// 1. We have to check if a session is stored in the cookies
//    a) If exists then redirect without any additional checks to the question.html page
//    b) If it doesn't exist, we stay in app.html, and we show the default page(choose a treasure hunt + add player name)

let appState = "GameNotStarted";

const session = getSessionCookie();
// Session exists -> Redirect to question.html
if (session && session.key === "treasure-hunt-session"){
    console.log("session key exists directing you to the question page");
   location.href = "question.html";
}else {
    // The  below line will show the start button, where when pressing it, it will show treasure hunts to choose
    gameNotStarted.ariaHidden = "false";

    // This is the object that holds information about the available treasure hunts
    let availableTreasureHunts = {};
    let selectedTreasureHunt = null;

    let formData = {
        playerName: "",
        appName: "",
        treasureHunt: null,
        isEmpty() {
            return (!this.playerName || !this.treasureHunt || !this.treasureHunt);
        }
    };
    startGameButton.addEventListener("click", async () => {
        startGameButton.disabled = true;
        startGameButton.innerText = "STARTING...";
        availableTreasureHunts = (await fetchAvailableTreasureHunts()).treasureHunts;
        startGameButton.disabled = false;
        startGameButton.innerText = "START";

        gameNotStarted.ariaHidden = "true";
        gameStarted.ariaHidden = "false";
        treasureHuntForm.ariaHidden = "false";
        part1Container.ariaHidden = "false";
        goBackButton.ariaHidden = "false";

        appState = "GameStarted";

        // Empty the list: Go Back button created which doesn't refresh the page
        treasureHuntsList.innerHTML = "";
        console.log(availableTreasureHunts);
        for (const treasureHunt of availableTreasureHunts) {
            const listItem = document.createElement("li");
            const button = document.createElement("button");

            button.type = "button";
            button.classList.add("treasure-hunt-button");
            button.dataset.treasureHunt = JSON.stringify(treasureHunt);
            button.innerText = treasureHunt.name;
            button.innerHTML = `${treasureHunt.name} 
                <svg id="submit-icon" viewBox="-0.5 0 7 7" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g> 
                        <title>play [#1003]</title> 
                        <desc>Created with Sketch.</desc> 
                        <defs> </defs> 
                        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> 
                            <g id="Dribbble-Light-Preview" transform="translate(-347.000000, -3766.000000)" fill="#000000"> 
                                <g id="icons" transform="translate(56.000000, 160.000000)"> 
                                    <path d="M296.494737,3608.57322 L292.500752,3606.14219 C291.83208,3605.73542 291,3606.25002 291,3607.06891 L291,3611.93095 C291,3612.7509 291.83208,3613.26444 292.500752,3612.85767 L296.494737,3610.42771 C297.168421,3610.01774 297.168421,3608.98319 296.494737,3608.57322" id="play-[#1003]"> </path> 
                                </g> 
                            </g>
                        </g> 
                    </g>
                </svg> `;
            listItem.appendChild(button);

            treasureHuntsList.appendChild(listItem);

            button.addEventListener("click", async () => {
                resetForm();
                selectedTreasureHunt = JSON.parse(button.dataset.treasureHunt);
                goBackButton.ariaHidden = "false";
                part2Container.ariaHidden = "false";
                part1Container.ariaHidden = "true";
                appState = "TreasureHuntSelected";
            })
        }
    });
    submitButton.addEventListener("click", async (event) => {
        event.preventDefault();

        if (player.value.length === 0) {
            errorMsg.innerText = "Please enter a player name";
            errorMsg.ariaHidden = "false";
            return;
        } else {
            errorMsg.ariaHidden = "true";
        }

        formData.playerName = player.value.trim().split(" ").join("-");
        formData.appName = APP_NAME;
        formData.treasureHunt = selectedTreasureHunt;

        console.log(formData);

        submitButton.disabled = true;
        event.target.value = "Loading..."
        await startTreasureHuntGame();
    });



    const startTreasureHuntGame = async () => {
        if (formData.isEmpty()) return;

        const response = await fetch(`${API_URL}/start?player=${formData.playerName}&app=${formData.appName}&treasure-hunt-id=${formData.treasureHunt.uuid}`)

        const data = await response.json();


        console.log(data);
        if (data.status === "ERROR") {
            errorMsg.ariaHidden = "false";
            errorMsg.innerHTML = data.errorMessages;
            submitButton.disabled = false;
            submitButton.value = "Start Game";
        } else {
            //Store the session id in cookies and number of questions in local storage
            // We set an expire date which is more than enough in our case 2 hours. The session lasts about 30 minutes
            // Even if it still exists in the cookies the api will not accept is as a valid session id
            const now = new Date();
            const expireMilliseconds = 2 * 60 * 60 * 1000;
            const expireDate = new Date(now.getTime() + expireMilliseconds);
            console.log(expireDate);

            document.cookie = `treasure-hunt-session=${data.session};expires=${expireDate.toUTCString()};`;

            localStorage.setItem("treasure-hunt-number-of-questions", data.numOfQuestions);
            submitButton.disabled = false;
            submitButton.value = "Starting...";
            // We know that we have a valid session
            // Redirect to the question html site which will handle the next part of the application
            location.href = "question.html";
        }

    };
    const resetForm = () => {
        player.value = "";
        errorMsg.innerHTML = "";
        submitButton.disabled = false;
        submitButton.value = "Start Game";
    };
    goBackButton.addEventListener("click", (event) => {
        if (appState === "GameStarted"){
            appState = "GameNotStarted";
            goBackButton.ariaHidden = "true";
            gameStarted.ariaHidden = "true";
            gameNotStarted.ariaHidden = "false";
        }else if (appState === "TreasureHuntSelected"){
            part1Container.ariaHidden = "false";
            part2Container.ariaHidden = "true";
            appState = "GameStarted";
        }

    });
}


musicHandler();