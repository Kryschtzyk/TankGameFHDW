const startButton = document.getElementById("start-button");
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const exitButton = document.getElementById("exit-button");
const creditButton = document.getElementById("credit-button");
const settingsButton = document.getElementById("settings-button");
const reloadButton = document.getElementById("reload-button");
const colorChangeButton = document.getElementById("colorChange-button");
const popup = document.getElementById("controls-popup");
const colorPopup = document.getElementById("color-popup");
const body = document.querySelector("body");
const soundButton = document.getElementById("sound-button");
const backgroundMusic = document.getElementById("background-music");
const audioState = document.getElementById('background-audio');

const buttonClickSound = new Audio('assets/sounds/buttonSound.mp3');
const buttons = document.querySelectorAll("button");

const audio = new Audio("assets/sounds/startMenueMusic.mp3");
let audioPlaying = false;

audio.addEventListener("canplaythrough", () => {
    backgroundMusic.play();
});

backgroundMusic.muted = true;

buttons.forEach((button) => {
    button.addEventListener("click", () => {
        if (audioPlaying) {
            buttonClickSound.play();
        }
    });
});

startButton.addEventListener("click", function () {
    startScreen.style.display = "none";
    gameScreen.style.display = "block";
    exitButton.style.display = "block";
    reloadButton.style.display = "block";
});

exitButton.addEventListener("click", function () {
    startScreen.style.display = "flex";
    gameScreen.style.display = "none";
    exitButton.style.display = "none";
    reloadButton.style.display = "none";
})

creditButton.addEventListener("click", () => {
    popup.style.display = "flex";
    body.classList.add("blur");
});

settingsButton.addEventListener("click", function () {
    // settings menu
});

reloadButton.addEventListener("click", () => {
    obstacles = []; // Clear the obstacles array
    shots = []; // Clear the shots array
    generateObstacles(); // Generate new obstacles
});

colorChangeButton.addEventListener("click", function () {
    colorPopup.style.display = "flex";
    body.classList.add("blur");
});

body.addEventListener("click", (event) => {
    if (event.target.id === "controls-popup") {
        popup.style.display = "none";
    }
    if (event.target.id === "color-popup") {
        colorPopup.style.display = "none";
    }
});

soundButton.addEventListener("click", () => {
    if (audio.paused) {
        audio.play();
        audio.loop = true;
        audioPlaying = true;
        backgroundMusic.muted = false;
        soundButton.classList.remove("muted");
        soundButton.firstElementChild.src = "assets/images/sound-on.png";
        console.log("Music is playing");
    } else {
        audio.pause();
        audioPlaying = false;
        backgroundMusic.muted = true;
        soundButton.classList.add("muted");
        soundButton.firstElementChild.src = "assets/images/sound-off.png";
        console.log("Music is muted");
    }
});

