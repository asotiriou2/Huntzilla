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
const APP_NAME = "Huntzilla-Team-C";
const part2Container = document.getElementById("part-2");
const part1Container = document.getElementById("part-1");
const treasureHuntSession = document.getElementById("treasure-hunt-session");
const question = document.getElementById("question");
const treasureHuntForm = document.getElementById("treasure-hunt-form");

const findSessionCookie = () => {
    for (const c of document.cookie.split(";")){
       if (c.includes("treasure-hunt-session")){
           const cookieArray = c.split("=");
           return {
               key: cookieArray[0] ,
               value: cookieArray[1]
           }
       }
    }
    return null;
}
// This is the object that holds information about the available treasure hunts
let availableTreasureHunts = {};
let selectedTreasureHunt = null;

let formData = {
    playerName: "",
    appName: "",
    treasureHunt: null,
    isEmpty(){
        return (!this.playerName || !this.treasureHunt || !this.treasureHunt);
    }
};

const fetchNextQuestion = async () => {

    const URL = `${API_URL}/question?session=${sessionCookie.value}`;

    const response = await fetch(URL);

    return await response.json();
}
const questionLogic = () => {
    fetchNextQuestion().then(data => {
        console.log(data);
        if (data.status === "OK"){
            treasureHuntSession.ariaHidden = "false";
            gameNotStarted.ariaHidden = "true";
            gameStarted.ariaHidden = "false";
            treasureHuntForm.ariaHidden = "true";
            question.innerHTML = data.questionText;
        }else{
            alert(data.errorMessages);
            document.cookie = "treasure-hunt-session=;max-age=0;path=/;";
            gameNotStarted.ariaHidden = "false";
            gameStarted.ariaHidden = "true";
            treasureHuntSession.ariaHidden = "true";
            treasureHuntForm.ariaHidden = "true";
        }
    });
}
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
// Check to see if a session is active from cookies
const sessionCookie = findSessionCookie();
if (sessionCookie){
    questionLogic();
}else{
   // I haven't started the game
   // Start the game
    treasureHuntSession.ariaHidden = "true";
    gameNotStarted.ariaHidden = "false";
    gameStarted.ariaHidden = "true";
}
startGameButton.addEventListener("click", async () => {
    startGameButton.disabled = true;
    startGameButton.innerText = "STARTING...";
    availableTreasureHunts = (await fetchAvailableTreasureHunts()).treasureHunts;
    startGameButton.disabled = false;
    startGameButton.innerText = "START";
    gameNotStarted.ariaHidden = "true"
    gameStarted.ariaHidden = "false";
    treasureHuntForm.ariaHidden = "false";
    treasureHuntSession.ariaHidden = "true";
    part1Container.ariaHidden = "false";
    part2Container.ariaHidden = "true";

    // Empty the list: Go Back button created which doesn't refresh the page
    treasureHuntsList.innerHTML = "";
    console.log(availableTreasureHunts);
    for (const treasureHunt of availableTreasureHunts){
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
        })
    }
});
submitButton.addEventListener("click", async (event) => {
    event.preventDefault();

    if (player.value.length === 0){
        errorMsg.innerText = "Please enter a player name";
        errorMsg.ariaHidden = "false";
        return;
    }else{
        errorMsg.ariaHidden = "true";
    }

    formData.playerName = player.value.trim().split(" ").join("-");
    formData.appName = APP_NAME;
    formData.treasureHunt = selectedTreasureHunt;

    console.log(formData);

    submitButton.disabled = true;
    event.target.value = "Loading..."
    await startTreasureHuntGame();
    location.reload();
    questionLogic();
});


goBackButton.addEventListener("click", (event) => {
    part1Container.ariaHidden = "false";
    part2Container.ariaHidden = "true";
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
        submitButton.value = "Start Game";
    }else{
        //Store the session id in cookies and number of questions in local storage
        const now = new Date();
        const expireMilliseconds = 2 * 60 * 60 * 1000;
        const expireDate = new Date(now.getTime() + expireMilliseconds);
        console.log(expireDate);

        document.cookie = `treasure-hunt-session=${data.session};expires=${expireDate.toUTCString()};`;

        localStorage.setItem("treasure-hunt-number-of-questions", data.numOfQuestions);
        submitButton.disabled = false;
        submitButton.value = "Starting...";
    }

};
const resetForm = () => {
    player.value = "";
    errorMsg.innerHTML = "";
    submitButton.disabled = false;
    submitButton.value = "Start Game";
};

