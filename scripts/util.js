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