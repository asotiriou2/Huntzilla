import {getSessionCookie, API_URL, musicHandler, skipQuestion, numberOfQuestions} from "./util.js";

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
const submitAnswerButton = document.getElementById("submit-answer");
const error = document.getElementById("error");
const skipButton = document.getElementById("skip");
const scoreContainer = document.getElementById("score-container");

// Inputs
const integerInput = document.getElementById("integer");
const numericInput = document.getElementById("numeric");
const trueButton = document.getElementById("true");
const falseButton = document.getElementById("false");
const textInput = document.getElementById("input");


let answer = "";
let questionData;

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
const updateQuestionProgress = (questions) => {

}
console.log("Welcome to the question page");
const sessionCookie = getSessionCookie();
let questions = JSON.parse(localStorage.getItem("questions"));

console.log(questions);
// If redirected from app.html the below code is not necessary, because it's already checked in app.html
// The reason we also add it here is people might access the question.html directly.
/**
 * TODO - In the future we could improve this by not allowing them to directly access question.html but only if they
 * get redirected from app.html. In that case we could show a 403 error or redirect them back to app.html
 */
if (!sessionCookie){
    location.href = "app.html";
}else{
    for (let i=0; i<numberOfQuestions; i++){
        const div = document.createElement("div");
        div.classList.add("question-number");
        div.innerHTML = (i+1).toString();
        div.dataset.questionIndex = i.toString();
        scoreContainer.appendChild(div);

        console.log(questions["question_0"]);
        if (i < numberOfQuestions - 1){
            const span = document.createElement("span");
            span.dataset.questionIndex = i.toString();
            span.classList.add("progress-line");
            scoreContainer.appendChild(span);
            if (questions[`question_${i}`] === true){
                div.style.backgroundColor = "green";
                div.style.border = "2px solid white";
                div.style.color = "white";
                console.log("green")
            }else if (questions[`question_${i}`] === false){
                div.style.backgroundColor = "red";
                div.style.border = "1px solid white";
                div.style.color = "white";
                console.log("red");
            }
        }

    }
    // If there is a session cookie, we should be able to fetch questions without any problems
    fetchNextQuestion(sessionCookie.value)
        .then(data => {
            if (data.status === "OK"){
                console.log(data);
                // Show the template HTML for the question
                gameStarted.ariaHidden = "false";
                questionPanel.ariaHidden = "false";
                question.innerText = data.questionText;
                scoreContainer.ariaHidden = "false";
                questionData = data;

                let questions = localStorage.getItem("questions");
                if(questions === null){
                    questions = {};
                }else{
                    questions = JSON.parse(questions);
                }

                // questions[`question_${questionData.currentQuestionIndex}`] = "not_answered";
                // localStorage.setItem("questions", JSON.stringify(questions));


                // Store the current question index in local storage
                localStorage.setItem("currentQuestion", String(questionData.currentQuestionIndex));

                // Show answer option based on the type of question
                if (data.questionType === "INTEGER"){
                    integerAnswer.ariaHidden = "false";
                }else if (data.questionType === "BOOLEAN"){
                    booleanAnswer.ariaHidden = "false";
                }else if (data.questionType === "MCQ"){
                    multipleChoiceAnswer.ariaHidden = "false";
                }else if (data.questionType === "TEXT"){
                    textAnswer.ariaHidden = "false";
                }else if (data.questionType === "NUMERIC"){
                    numericAnswer.ariaHidden = "false";
                }
            }else if (data.status === "ERROR"){
                // show information to the client of the error
                alert(data.errorMessages);
                // remove the session cookie: Important because if we don't do this when it goes back to app, it will come immediately here
                document.cookie = "treasure-hunt-session=;max-age=0;path=/;";
                // redirect them back to the app.html
                location.href = "app.html";
                localStorage.removeItem("questions");
                localStorage.removeItem("currentQuestion");
                localStorage.removeItem("treasure-hunt-numbe-of-questions");
            }
        });

    submitAnswerButton.addEventListener("click", async () => {
        error.ariaHidden = "true";
        console.log(integerInput.value);
        if (questionData.questionType === "INTEGER"){
            answer = integerInput.value;
        }else if (questionData.questionType === "MCQ"){
            //
        }else if (questionData.questionType === "TEXT"){
            answer = textInput.value;
        }else if (questionData.questionType === "NUMERIC"){
            answer = numericInput.value;
        }
        console.log(answer);

        if (questionData.questionType === "BOOLEAN" && answer === ""){
            // didn't choose true or false and clicked submit
            error.ariaHidden = "false";
            error.innerText = "Choose either True or False";
            return;
        }else if (questionData.questionType === "MCQ" && answer === ""){
            // didn't choose any of the available multiple choices
            error.ariaHidden = "false";
            error.innerText = "Choose one of A, B, C or D";
            return;
        }

        if (answer === ""){
            alert("Please give an answer");
            return;
        }
        // request /answer
        const ANSWER_URL = `${API_URL}/answer?session=${sessionCookie.value}&answer=${answer}`;
        const response = await fetch(ANSWER_URL);
        const data = await response.json();
        if (data.status === "OK"){
            //Update local storage for the current question status
            const question_index = `question_${questionData.currentQuestionIndex}`;
            let questionsStore = JSON.parse(localStorage.getItem("questions"));
            questionsStore[question_index] = data.correct;
            console.log(questionsStore);
            console.log(data);
            localStorage.setItem("questions", JSON.stringify(questionsStore));
            alert(JSON.stringify(data));
            location.reload();

        }else if (data.status === "ERROR"){
            // remove the session cookie
            document.cookie = "treasure-hunt-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            console.log(document.cookie);
            alert(data.errorMessages);
            location.reload();
        }

    });
    skipButton.addEventListener("click", async () => {
        if (!questionData.canBeSkipped){
            error.ariaHidden = "false";
            error.innerText = "You cannot skip this question.";
            return;
        }
        await skipQuestion(sessionCookie.value);
        location.reload();

    })
    for (const booleanButton of booleanAnswer.children){
       booleanButton.addEventListener("click", (event) => {
          booleanButton.style.border = "2px solid red";
          console.log(booleanButton.value);
          answer = event.target.value;
       });
    }
    for (const multipleChoiceButton of multipleChoiceAnswer.children){
        multipleChoiceButton.addEventListener("click", (event) => {
           multipleChoiceButton.style.backgroundColor = "green";
           answer = event.target.value;
        })
    }
}


musicHandler();