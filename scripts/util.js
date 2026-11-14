// Contains a set of utility functions that can be used throughout the project for convenience

// get session cookie

/**
 * Searches the cookies and tries to find the session cookie
 * @returns {{key: string, value: string}|null}
 */
export const getSessionCookie = () => {
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

/**
 * The base url for the api
 * @type {string}
 */
export const API_URL = "https://codecyprus.org/th/api";

/**
 * App name constant
 * @type {string}
 */
export const APP_NAME = "Huntzilla-Team-C";

/**
 * Handles the app.html music
 */
export const musicHandler = () => {
    const audio = document.getElementById("jingle");
    const musicBtn = document.getElementById("music-button");
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
}
/**
 * Makes a request to the api and returns all the available treasure hunts
 * @returns {Promise<any>}
 */
export const fetchAvailableTreasureHunts = async () => {
    const response = await fetch(`${API_URL}/list`);
    return await response.json();
};

/**
 * Allows to skip a certain question if it can be skipped
 * @param sessionId
 * @returns {Promise<any>}
 */
export const skipQuestion = async (sessionId) => {
    const response = await fetch(`${API_URL}/skip?session=${sessionId}`);

    return await response.json();
}

/**
 * Number of questions for the current treasure hunt
 * @type {number}
 */
export const numberOfQuestions = Number.parseInt(localStorage.getItem("treasure-hunt-number-of-questions"));