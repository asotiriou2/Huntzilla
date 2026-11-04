const clickSound = document.getElementById("click-sound");
const allLinks = document.querySelectorAll("a");

allLinks.forEach(function(link) {
    link.addEventListener("click", function(event) {
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play();
        }
    });
});