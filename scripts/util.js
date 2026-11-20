// Contains a set of utility functions that can be used throughout the project for convenience

// get session cookie

/**
 * Searches the cookies and tries to find the session cookie
 * @returns {{key: string, value: string}|null}
 */
export const getSessionCookie = () => {
    for (let c of document.cookie.split(";")){
        // The reason we trim is that when we split there could be whitespaces at the start and end of each cookie string
        let cookie = c.trim();
        if (cookie.includes("treasure-hunt-session")){
            const cookieArray = cookie.split("=");
            return {
                key: cookieArray[0] ,
                value: cookieArray[1]
            }
        }
    }
    return null;
}

/**
 * Returns the current score of the current session
 * @param session
 * @returns {Promise<any>}
 */
export const getPlayerScore = async (session) => {
    const response = await fetch(`${API_URL}/score?session=${session}`);

    return await response.json();
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
    audio.play();
    if (musicBtn && audio) {
        musicBtn.addEventListener("click", function(event) {
            event.preventDefault();
            if (audio.paused) {
                audio.play();
                musicBtn.innerHTML = '<svg id=`music-svg` viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#FFD700" stroke-width="0.8960000000000001" color="rgb(255, 215, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools --> <path d="M6 1H8V15H6L2 11H0V5H2L6 1Z" fill="#26d51b"></path> <path d="M14 8C14 5.79086 12.2091 4 10 4V2C13.3137 2 16 4.68629 16 8C16 11.3137 13.3137 14 10 14V12C12.2091 12 14 10.2091 14 8Z" fill="#26d51b"></path> <path d="M12 8C12 9.10457 11.1046 10 10 10V6C11.1046 6 12 6.89543 12 8Z" fill="#26d51b"></path> </g></svg>';
            } else {
                audio.pause();
                // musicBtn.innerText = "Music (Off)";
                musicBtn.innerHTML = "<svg id=`music-svg` viewBox=\"-1.6 -1.6 19.2 19.2\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" stroke=\"#FFD700\" stroke-width=\"0.8960000000000001\" color=\"rgb(255, 215, 0)\"><g id=\"SVGRepo_bgCarrier\" stroke-width=\"0\"></g><g id=\"SVGRepo_tracerCarrier\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke=\"#CCCCCC\" stroke-width=\"0.8320000000000001\"></g><g id=\"SVGRepo_iconCarrier\"><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools --> <path d=\"M8 1H6L2 5H0V11H2L6 15H8V1Z\" fill=\"#26d51b\"></path> <path d=\"M9.29289 6.20711L11.0858 8L9.29289 9.79289L10.7071 11.2071L12.5 9.41421L14.2929 11.2071L15.7071 9.79289L13.9142 8L15.7071 6.20711L14.2929 4.79289L12.5 6.58579L10.7071 4.79289L9.29289 6.20711Z\" fill=\"#26d51b\"></path> </g></svg>";

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

/**
 * Check Icon HTML
 * @returns {string}
 */
export const checkIcon = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
        <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
        <path
            d="M4 12.6111L8.92308 17.5L20 6.5"
            stroke="#000000"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        ></path>
    </g>
</svg>
`;

/**
 * Cross Icon HTML
 * @type {string}
 */
export const crossIcon= `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
    <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
    <path
        d="M19 5L5 19M5.00001 5L19 19"
        stroke="#000000"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
    ></path>
    </g>
</svg>`;

/**
 * Handles the hamburger button interaction
 */
export const hamburgerButtonHandler = () => {
    const mobileMenuOverlay = document.getElementById("menu-overlay");
    const hamburgerButton = document.getElementById("burger-button");
    const closeHamburgerButton = document.getElementById("close-button");

    let hamburgerOpen = false;

    hamburgerButton.addEventListener("click", () => {
        if(hamburgerOpen){
            mobileMenuOverlay.ariaHidden = "true";
            hamburgerOpen = false;
            document.body.style.overflow = "auto";
        }else{
            mobileMenuOverlay.ariaHidden = "false";
            hamburgerOpen = true;
            document.body.style.overflow = "hidden";
        }
    });
    closeHamburgerButton.addEventListener("click", () => {
       if (hamburgerOpen) {
           mobileMenuOverlay.ariaHidden = "true";
           hamburgerOpen = false;
           document.body.style.overflow = "auto";
       }
    });
}