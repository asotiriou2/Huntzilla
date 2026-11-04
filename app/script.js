const audio = document.getElementById("jingle");
const musicBtn = document.getElementById("music-button");

if (musicBtn && audio) {
    musicBtn.addEventListener("click", function(event) {
        event.preventDefault();

        if (audio.paused) {
            audio.play();
            musicBtn.innerText = "Music On: 🔊";
        } else {
            audio.pause();
            musicBtn.innerText = "Music Off: 🔇";
        }
    });
}