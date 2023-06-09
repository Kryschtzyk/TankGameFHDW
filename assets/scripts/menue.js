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
const footer = document.getElementsByClassName("footer");
const scoreLabel = document.getElementById("score-footer");

const buttonClickSound = new Audio('assets/sounds/buttonSound.mp3');
const buttons = document.querySelectorAll("button");

const audio = new Audio("assets/sounds/startMenueMusic.mp3");
let audioPlaying = false;

function getCookie(cookieNameSaved) {
    var cookieName = cookieNameSaved + "=";
    var cookieArray = document.cookie.split(";");
    for (var i = 0; i < cookieArray.length; i++) {
        var cookie = cookieArray[i];
        while (cookie.charAt(0) === " ") {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return 0;
}


let highscore = getCookie("highscore");
scoreLabel.innerText = "Highscore: " + highscore;

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

    let audio = new Audio("assets/sounds/startGame.wav");
    if(backgroundMusic.muted === false) {
        audio.play();
    }

    startScreen.style.display = "none";
    gameScreen.style.display = "block";
    exitButton.style.display = "block";
    reloadButton.style.display = "block";
    settingsButton.style.display = "none";
    levelLabel.style.display = "block";
    scoreLabel.style.display = "none";
    colorChangeButton.style.display = "none";

    // Resize the canvas and generate obstacles
    resizeCanvas();
    generateObstacles();
    generateKiTanks();
    centerTank();
    gameLoop();

    setTimeout(function() {
        shootPermission = true;
    }, 3000)
});

exitButton.addEventListener("click", function () {
    location.reload();
})

document.addEventListener("keydown", function(event) {
    if (event.keyCode === 27) { // Check if Escape key is pressed
        location.reload(); // Reload the page
    }
});


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
        gameOver = false; // Set the game over flag to true
        const gameOverPopup = document.getElementById("game-over-popup");
        gameOverPopup.style.display = "none"; // Show the game over popup
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
