import {getSessionCookie, API_URL, musicHandler} from "./util.js";

const gameStarted = document.getElementById("game-started");
const questionPanel = document.getElementById("question-panel");
const questionBox = document.getElementById("question-box");
const question = document.getElementById("question");
const answerChoices= document.getElementById("answer-choices");
const booleanAnswer  = document.getElementById("boolean-answer");
const integerAnswer = document.getElementById("integer-answer");
const numericAnswer = document.getElementById("numeric-answer");
const multipleChoiceAnswer = document.getElementById("mcq-answer");
const textAnswer = document.getElementById("text-answer");

/**
 *
 * @param sessionId  The session id given upon starting the treasure hunt
 * @returns {Promise<any>}
 */
const fetchNextQuestion = async (sessionId) => {

    const URL = `${API_URL}/question?session=${sessionId}`;

    const response = await fetch(URL);

    return await response.json();
}


const sessionCookie = getSessionCookie();
// If redirected from app.html the below code is not necessary, because it's already checked in app.html
// The reason we also add it here is people might access the question.html directly.
/**
 * TODO - In the future we could improve this by not allowing them to directly access question.html but only if they
 * get redirected from app.html. In that case we could show a 403 error or redirect them back to app.html
 */
if (!sessionCookie){
    location.href = "app.html";
}else{
    // If there is a session cookie, we should be able to fetch questions without any problems
    fetchNextQuestion(sessionCookie.value)
        .then(data => {
            if (data.status === "OK"){
                // Show the template HTML for the question
                gameStarted.ariaHidden = "false";
                questionPanel.ariaHidden = "false";
                question.innerText = data.questionText;
            }else if (data.status === "ERROR"){
                // show information to the client of the error
                alert(data.errorMessages);
                // remove the session cookie: Important because if we don't do this when it goes back to app, it will come immediately here
                document.cookie = "treasure-hunt-session=;max-age=0;path=/;";
                // redirect them back to the app.html
                location.href = "app.html";
            }
        })
}
musicHandler();