// Get the canvas and context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const singlePlayerMode = document.getElementById("singlePlayer-button");
const multiPlayerMode = document.getElementById("multiPlayer-button");

const levelLabel = document.getElementById("level-footer");

// Tank image
let tankImage = new Image();
tankImage.src = document.getElementById("tank-image").src;

let obstacleImage = new Image();
obstacleImage.src = "./assets/images/stoneTexture.png";
body.style.backgroundImage = "url('./assets/images/backgroundTexture.jpg')";

// Generate obstacles
let obstacles = [];
const circleRadius = 100;
const obstacleMinDistance = 150;
const healthBarWidth = 5;
let otherTanks = [];
let tankHealth = 100;
let shootPermission = false;
let minAmountTanks = 1;
let maxAmountTanks = 2;
let gameOver = false;

let lastResizeTime = 0;
const resizeCooldown = 2000; // 2 seconds
let lastTick = Date.now();

// Resize the canvas to fit the window
function resizeCanvas() {

    const currentTime = Date.now();
    if (currentTime - lastResizeTime < resizeCooldown) {
        return; // Do nothing if the cooldown period hasn't elapsed
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 90;

    prepareTankCanvas();
}


// Tank position and angle
let x = canvas.width / 2;
let y = canvas.height / 2;
let angle = 0;

// Shots fired by the tank
let shots = [];
let lastShotTime = 0;
let isShooting = false;
const speedFactor = 1.5;

// Key codes for tank controls
const keys = {};

// Tank radius
const radius = Math.min(canvas.width, canvas.height) / 32;

// Event listeners for keydown and keyup
document.addEventListener('keydown', (event) => {
    keys[event.keyCode] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.keyCode] = false;
});

// Prepare the tank canvas
function prepareTankCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

class Tank {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.width = tankImage.width;
        this.height = tankImage.height;
        this.health = 100;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(tankImage, -this.width / 2, -this.height / 2);
        ctx.restore();

        drawHealthBar();
    }
}


// Draw the tank
function drawTank() {

    const tankWidth = tankImage.width;
    const tankHeight = tankImage.height;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.drawImage(tankImage, -tankWidth / 2, -tankHeight / 2);
    ctx.restore();

    for (let i = 0; i < otherTanks.length; i++) {
        const tank = otherTanks[i];
        ctx.save();
        ctx.translate(tank.x, tank.y);
        ctx.rotate(tank.angle);
        ctx.drawImage(tankImage, -tankWidth / 2, -tankHeight / 2);
        ctx.restore();
    }

    drawHealthBar(); // Call the drawHealthBar() function inside drawTank()
}

// Draw health bar
function drawHealthBar() {
    const healthBarHeight = tankImage.height; // Height of the health bar
    const healthBarX = x + tankImage.width / 2 + 10; // X-coordinate of the health bar
    const healthBarY = y - tankImage.height / 2; // Y-coordinate of the health bar

    ctx.fillStyle = 'red';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    ctx.fillStyle = 'green';
    const remainingHealthHeight = (tankHealth / 100) * healthBarHeight;
    const remainingHealthY = healthBarY + healthBarHeight - remainingHealthHeight;
    ctx.fillRect(healthBarX, remainingHealthY, healthBarWidth, remainingHealthHeight);
}

// Draw obstacles
function drawObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];
        ctx.beginPath();
        ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.fillStyle = 'gray';
        ctx.fill();
        ctx.closePath();
    }

    // Draw the other tanks
    for (let i = 0; i < otherTanks.length; i++) {
        const tank = new Tank(otherTanks[i]);
        tank.draw();
    }
}

// Draw shots
function drawShots(tickDeltaShots) {
    for (let i = 0; i < shots.length; i++) {
        let shot = shots[i];

        if (!shot.fired) {
            shot.dx = Math.cos(shot.angle) * speedFactor * tickDeltaShots * 0.25;
            shot.dy = Math.sin(shot.angle) * speedFactor * tickDeltaShots * 0.25;
            shot.fired = true;
        }

        shot.x += shot.dx;
        shot.y += shot.dy;

        // Remove bullets that are out of bounds
        if (shot.x < 0 || shot.x > canvas.width || shot.y < 0 || shot.y > canvas.height) {
            shots.splice(i, 1);
            continue;
        }

        ctx.beginPath();
        ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();

        adjustBullet(shot, obstacles);
    }
}

// Update tank position and angle based on keyboard input
function updateTank(tickDelta) {
    let rotationSpeed = 0.0055 * tickDelta * 0.25;
    let moveSpeed = 0.5 * tickDelta * 0.25;
    let dx = 0;
    let dy = 0;
    let dAngle = 0;

    if (keys[16] && minAmountTanks >= 1) {
        rotationSpeed += 0.01;
        moveSpeed += 0.5;
    }

    if (keys[87]) { // W key
        dx += Math.cos(angle) * moveSpeed;
        dy += Math.sin(angle) * moveSpeed;
    }
    if (keys[83]) { // S key
        dx -= Math.cos(angle) * moveSpeed;
        dy -= Math.sin(angle) * moveSpeed;
    }
    if (keys[65]) { // A key
        dAngle -= rotationSpeed;
    }
    if (keys[68]) { // D key
        dAngle += rotationSpeed;
    }

    if (keys[81] && !isShooting && !gameOver) { // Q key
        isShooting = true;

        const currentTime = Date.now();
        if (currentTime - lastShotTime > 500) {
            lastShotTime = currentTime;

            let newShot = {
                x: x + Math.cos(angle) * (tankImage.width / 2 + 10),
                y: y + Math.sin(angle) * (tankImage.height / 2 + 10),
                dx: Math.cos(angle) * speedFactor,
                dy: Math.sin(angle) * speedFactor,
                radius: 5,
                angle: angle,
                fired: false
            };

            shots.push(newShot);
        }
    }

    if (!keys[81]) { // Q key released
        isShooting = false;
    }

    angle += dAngle;
    let nextX = x + dx;
    let nextY = y + dy;
    let nextAngle = angle + dAngle;
    let collision = false;

    // Check collision with obstacles
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];
        let obstacleCenterX = obstacle.x + obstacle.width / 2;
        let obstacleCenterY = obstacle.y + obstacle.height / 2;
        let distanceX = Math.abs(obstacleCenterX - nextX);
        let distanceY = Math.abs(obstacleCenterY - nextY);
        let maxDistanceX = obstacle.width / 2 + radius;
        let maxDistanceY = obstacle.height / 2 + radius;

        if (distanceX < maxDistanceX && distanceY < maxDistanceY) {
            collision = true;
            break;
        }
    }

    if (!collision) {
        x = nextX;
        y = nextY;
    }

    // Keep the tank within the canvas bounds
    x = Math.max(radius, Math.min(x, canvas.width - radius));
    y = Math.max(radius, Math.min(y, canvas.height - radius));

    // Normalize the angle to be between 0 and 2*pi
    angle = nextAngle;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function adjustBullet(bullet, obstacles) {
    // Check if bullet is out of bounds
    if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
        // Remove the bullet from the shots array
        shots.splice(shots.indexOf(bullet), 1);
        return;
    }

    // Check for collisions with obstacles
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];
        let bulletLeft = bullet.x - bullet.radius;
        let bulletRight = bullet.x + bullet.radius;
        let bulletTop = bullet.y - bullet.radius;
        let bulletBottom = bullet.y + bullet.radius;

        let obstacleLeft = obstacle.x;
        let obstacleRight = obstacle.x + obstacle.width;
        let obstacleTop = obstacle.y;
        let obstacleBottom = obstacle.y + obstacle.height;

        if (
            bulletRight >= obstacleLeft &&
            bulletLeft <= obstacleRight &&
            bulletBottom >= obstacleTop &&
            bulletTop <= obstacleBottom
        ) {
            // AABB collision occurred, perform detailed collision check

            // Calculate the overlap on each axis
            let overlapX = Math.min(bulletRight - obstacleLeft, obstacleRight - bulletLeft);
            let overlapY = Math.min(bulletBottom - obstacleTop, obstacleBottom - bulletTop);

            // Determine the axis of least penetration
            if (overlapX < overlapY) {
                // Colliding horizontally, adjust bullet's position
                if (bullet.x < obstacle.x) {
                    bullet.x -= overlapX;
                } else {
                    bullet.x += overlapX;
                }
            } else {
                // Colliding vertically, adjust bullet's position
                if (bullet.y < obstacle.y) {
                    bullet.y -= overlapY;
                } else {
                    bullet.y += overlapY;
                }
            }

            // Remove the bullet from the shots array
            shots.splice(shots.indexOf(bullet), 1);
            return;
        }
    }

    // Check for collisions with the player tank
    let distanceX = bullet.x - x;
    let distanceY = bullet.y - y;
    let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distance < bullet.radius + radius) {
        // Remove the bullet from the shots array
        shots.splice(shots.indexOf(bullet), 1);

        // Decrease the health of the player tank when hit
        tankHealth -= 25;
        if (tankHealth <= 0) {
            const gameOverPopup = document.getElementById("game-over-popup");
            gameOverPopup.style.display = "flex"; // Show the game over popup

            shootPermission = false; // Stop the player from shooting
            tankHealth = 100; // Reset the player tank's health
            gameOver = true; // Set the game over flag to true

            return;
        }

        return;
    }

    // Check for collisions with other tanks
    for (let i = 0; i < otherTanks.length; i++) {
        let botTank = otherTanks[i];
        let distanceX = bullet.x - botTank.x;
        let distanceY = bullet.y - botTank.y;
        let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (distance < bullet.radius + botTank.width / 2) {
            // Remove the bullet from the shots array
            shots.splice(shots.indexOf(bullet), 1);
            // Decrease the health of the botTank when hit
            botTank.health -= 25;
            if (botTank.health <= 0) {
                // Remove the botTank from the otherTanks array if its health is depleted
                otherTanks.splice(i, 1);
                i++;
            }
        }
    }
}

// Render the game
function render(tickDeltaRender) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShots(tickDeltaRender);
    drawTank();
    drawObstacles();
    drawHealthBar();
}
centerTank();

let level = 1;
// The game loop
function gameLoop() {
    let now = Date.now();
    let tickDelta = now - lastTick;
    lastTick = now;
    updateTank(tickDelta);
    render(tickDelta);

    requestAnimationFrame(gameLoop);
    setTimeout(function() {
        updateOtherTanks();
    }, 3000);

    if(otherTanks.length === 0) {
        level++;
        levelLabel.textContent = `Level: ${level}`;
        minAmountTanks++;
        maxAmountTanks++;
        generateKiTanks();
        console.log("minAmount:" + minAmountTanks + "maxAmount:" + maxAmountTanks);
    }
}

function resetGame() {
    obstacles = []; // Clear the obstacles array
    shots = []; // Clear the shots array
    bullets = []; // Clear the bullets array
    otherTanks = []; // Clear the other tanks array
    tankHealth = 100; // Reset the tank health
    let level = 1;
    levelLabel.textContent = `Level: ${level}`;
    minAmountTanks = 1;
    maxAmountTanks = 2;
    generateObstacles(); // Generate new obstacles
    generateKiTanks();
    centerTank(); // Center the tank
    shootPermission = false;
    setTimeout(function() {
        shootPermission = true;
    }, 3000);
}

function updateOtherTanks() {
    for (let i = 0; i < otherTanks.length; i++) {
        let tank = otherTanks[i];

        // Randomly shoot at the player tank
        if (Math.random() < 0.002 && shootPermission === true) {
            const dx = x - tank.x;
            const dy = y - tank.y;
            const angle = Math.atan2(dy, dx);
            tank.angle = angle;
            let newShot = {
                x: tank.x + Math.cos(angle) * (tank.width / 2 + 20),
                y: tank.y + Math.sin(angle) * (tank.height / 2 + 20),
                dx: Math.cos(angle) * speedFactor,
                dy: Math.sin(angle) * speedFactor,
                radius: 5,
                angle: angle,
                fired: false
            };
            shots.push(newShot);
        }
    }
}

// Event listeners
window.addEventListener('resize', resizeCanvas);
document.addEventListener('keydown', (event) => {
    keys[event.keyCode] = true;
});
document.addEventListener('keyup', (event) => {
    keys[event.keyCode] = false;
});