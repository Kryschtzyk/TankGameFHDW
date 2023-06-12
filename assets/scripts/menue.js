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
const settingsPopup = document.getElementById("settings-popup");
const body = document.querySelector("body");
const soundButton = document.getElementById("sound-button");
const backgroundMusic = document.getElementById("background-music");
const audioState = document.getElementById('background-audio');

const buttonClickSound = new Audio('assets/sounds/buttonSound.mp3');
const buttons = document.querySelectorAll("button");

const audio = new Audio("assets/sounds/startMenueMusic.mp3");
let audioPlaying = false;

audio.addEventListener("ended", () => {
    audio.currentTime = 0; // Reset the audio playback position to the beginning
    audio.play();
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
    tankImage.src = document.getElementById("tank-image").src;

    startScreen.style.display = "none";
    gameScreen.style.display = "block";
    exitButton.style.display = "block";
    reloadButton.style.display = "block";
    settingsButton.style.display = "block";
    colorChangeButton.style.display = "none";

    // Resize the canvas and generate obstacles
    resizeCanvas();
    generateObstacles();
    generateKiTanks();
    centerTank();
    gameLoop();

    setTimeout(function() {
        shootPermission = true;
    }, 3000);
});

exitButton.addEventListener("click", function () {
    location.reload();
})

creditButton.addEventListener("click", () => {
    popup.style.display = "flex";
    body.classList.add("blur");
});

settingsButton.addEventListener("click", function () {
    settingsPopup.style.display = "flex";
    body.classList.add("blur");
});

let reloadTimer = null;
const reloadTime = 2000; // 2 seconds

reloadButton.addEventListener('mousedown', () => {
    reloadTimer = setTimeout(() => {
        obstacles = []; // Clear the obstacles array
        shots = []; // Clear the shots array
        otherTanks = []; // Clear the other tanks array
        tankHealth = 100; // Reset the tank health
        generateObstacles(); // Generate new obstacles
        generateKiTanks();
        centerTank(); // Center the tank
        resetGame();
        // Add any additional game reload logic here

        reloadTimer = null; // Reset the timer
    }, reloadTime);

    // Start the animation for the reload timer
    reloadButton.classList.add('reload-animation');
});

reloadButton.addEventListener('mouseup', () => {
    clearTimeout(reloadTimer);
    reloadTimer = null;
    reloadButton.classList.remove('reload-animation');
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
    if (event.target.id === "settings-popup") {
        settingsPopup.style.display = "none";
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

function changeTankImage(newImageSrc) {
    const tankImage = document.getElementById("tank-image");
    tankImage.src = newImageSrc;
}

function centerTank() {
    x = canvas.width / 2;
    y = canvas.height / 2;
}
