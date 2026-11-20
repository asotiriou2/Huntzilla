import {fetchAvailableTreasureHunts, getSessionCookie, API_URL, getPlayerScore, musicHandler, hamburgerButtonHandler} from "./util.js";
const table = document.getElementById("leaderboard-table");
const treasureHuntContainer = document.getElementById("treasure-hunts");
const leaderboardHeading = document.querySelector("#leaderboard > h3");
const playerRank = document.getElementById("player-rank");

//If there is an available session load the leaderboard
//Otherwise show treasure hunts for the user to pick
const session = getSessionCookie();
let leaderboardData = "";
let playerScore =  {
    player: "",
    score: -1,
    completionTime: "",
    rank: -1,
    isEmpty(){
       return (!this.player && this.score === -1 && !this.completionTime && this.rank === -1);
    }
};

const buildTable = (leaderboard) => {
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const trow = document.createElement("tr");

    for (const key of Object.keys(leaderboard[0])){
        const td = document.createElement("td");
        td.innerText = key;
        trow.appendChild(td);
    }
    thead.appendChild(trow);
    table.appendChild(thead);
    for (let i=0; i<100; i++) {
        const brow = document.createElement("tr");
        for (let j=0; j<Object.values(leaderboard[i]).length; j++){
            const td = document.createElement("td");
            const rank = document.createElement("span");
            const column = document.createElement("span");

            if (j === 0){
                td.classList.add("player");
                if (i === 0){
                    rank.classList.add("first");
                }else if (i === 1){
                    rank.classList.add("second");
                }else if (i === 2){
                    rank.classList.add("third");
                }
                rank.innerText = (i+1).toString();
                td.appendChild(rank);
                if (Object.values(leaderboard[i])[j].toString().length > 20){
                    column.innerText = Object.values(leaderboard[i])[j].toString().substring(0, 20);
                }else{
                    column.innerText = `${Object.values(leaderboard[i])[j]}`;
                }
                td.appendChild(column);
            }else if (j === Object.values(leaderboard[i]).length - 1){
                rank.innerText = new Date(Object.values(leaderboard[i])[j]).toUTCString();
                td.appendChild(rank);
            }else{
                column.innerText = `${Object.values(leaderboard[i])[j]}`;
                td.appendChild(column);
            }
            brow.appendChild(td);
        }
        tbody.appendChild(brow);
    }
    table.appendChild(tbody);
}
hamburgerButtonHandler();
if (session && session.key && session.value){
    fetch(`${API_URL}/leaderboard?session=${session.value}&sorted`)
        .then(res => res.json())
        .then(data => {
            leaderboardData = data;
            console.log(leaderboardData);
            console.log(Object.keys(leaderboardData.leaderboard[0]));
            buildTable(leaderboardData.leaderboard);
            table.ariaHidden = "false";
            leaderboardHeading.ariaHidden = "false";
            getPlayerScore(session.value)
                .then(data => {
                    playerScore.player = data.player;
                    for (let i=0; i<leaderboardData.leaderboard.length; i++){
                        console.log(leaderboardData.leaderboard[i]);
                        if (leaderboardData.leaderboard[i].player === playerScore.player){
                            playerScore.score = leaderboardData.leaderboard[i].score;
                            playerScore.completionTime = leaderboardData.leaderboard[i].completionTime;
                            playerScore.rank = i+1;
                        }
                    }

                    if (!playerScore.isEmpty()){
                        const bubble = document.createElement("div");
                        bubble.classList.add("bubble");
                        console.log(playerScore);
                        playerRank.ariaHidden = "false";
                        const rankContainer = document.createElement("div");
                        rankContainer.innerHTML = playerScore.rank;
                        bubble.appendChild(rankContainer);
                        const playerContainer = document.createElement("div");
                        playerContainer.innerHTML = playerScore.player;
                        bubble.appendChild(playerContainer);
                        const scoreContainer = document.createElement("div");
                        scoreContainer.innerHTML = playerScore.score;
                        bubble.appendChild(scoreContainer)
                        const completionTimeContainer = document.createElement("div");
                        completionTimeContainer.innerHTML = new Date(playerScore.completionTime).toUTCString();
                        bubble.appendChild(completionTimeContainer);
                        playerRank.appendChild(bubble);
                    }
                });
        });
}else{
    // Choose a treasure hunt to show the leaderboard
    fetchAvailableTreasureHunts()
        .then(data => {
           console.log(data.treasureHunts);
           for (const hunt of data.treasureHunts){
               const huntButton = document.createElement("button");
               huntButton.innerHTML = `
               ${hunt.name}
                <div class="loader" aria-hidden="true"></div> 
               `;
               treasureHuntContainer.appendChild(huntButton);
               treasureHuntContainer.ariaHidden = "false";

               huntButton.addEventListener("click", () => {
                   // fetch using treasure-hunt-id
                   huntButton.classList.add("loading");
                   huntButton.innerHTML = `
                   ${hunt.name}
                    <div class="loader" aria-hidden="false"></div> 
                   `;
                   fetch(`${API_URL}/leaderboard?treasure-hunt-id=${hunt.uuid}&sorted`)
                       .then(res => res.json())
                       .then(data => {
                           leaderboardData = data;
                           console.log(leaderboardData);
                           if(!leaderboardData.leaderboard.length){
                               alert("This treasure hunt has no leaderboard.");
                               huntButton.classList.remove("loading");
                               huntButton.innerHTML = `${hunt.name}`;
                               return;
                           }
                           buildTable(leaderboardData.leaderboard);
                           table.ariaHidden = "false";
                           leaderboardHeading.ariaHidden = "false";
                           treasureHuntContainer.ariaHidden = "true";
                           huntButton.classList.remove("loading");
                           huntButton.innerHTML = `${hunt.name}`;
                       });

               });
           }
        } );
}

// musicHandler();