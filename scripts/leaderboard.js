import {fetchAvailableTreasureHunts, getSessionCookie, API_URL} from "./util.js";
const table = document.getElementById("leaderboard-table");

//If there is an available session load the leaderboard
//Otherwise show treasure hunts for the user to pick
const session = getSessionCookie();
let leaderboardData = "";

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
    for (let i=0; i<leaderboard.length; i++) {
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
if (session && session.key && session.value){
    fetch(`${API_URL}/leaderboard?session=${session.value}&sorted&limit=100`)
        .then(res => res.json())
        .then(data => {
            leaderboardData = data;
            console.log(leaderboardData);
            console.log(Object.keys(leaderboardData.leaderboard[0]));
            buildTable(leaderboardData.leaderboard);
        });
}else{
    // Choose a treasure hunt to show the leaderboard
}