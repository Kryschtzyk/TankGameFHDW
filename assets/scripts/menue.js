const startButton = document.getElementById("start-button");
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const exitButton = document.getElementById("exit-button");
const creditButton = document.getElementById("credit-button");
const closeButton = document.getElementById("close-button");
const popup = document.getElementById("controls-popup");
const body = document.querySelector("body");

startButton.addEventListener("click", function (){
    startScreen.style.display = "none";
    gameScreen.style.display = "block";
    exitButton.style.display = "block";
});

exitButton.addEventListener("click", function () {
    startScreen.style.display = "flex";
    gameScreen.style.display = "none";
    exitButton.style.display = "none";
})

creditButton.addEventListener("click", () => {
    popup.style.display = "flex";
    body.classList.add("blur");
});

body.addEventListener("click", (event) => {
    if (event.target.id === "controls-popup") {
        popup.style.display = "none";
    }
});