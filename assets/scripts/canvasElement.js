// Get the canvas and context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const singlePlayerMode = document.getElementById("singlePlayer-button");
const multiPlayerMode = document.getElementById("multiPlayer-button");

// Tank image
let tankImage = new Image();
tankImage.src = document.getElementById("tank-image").src;

// Generate obstacles
let obstacles = [];
const circleRadius = 100;
const obstacleMinDistance = 150;
const healthBarWidth = 5;
let otherTanks = [];
let tankHealth = 100;
let shootPermission = true;


let lastResizeTime = 0;
const resizeCooldown = 2000; // 2 seconds

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

function isOverlap(rect, rects) {
    for (let i = 0; i < rects.length; i++) {
        let otherRect = rects[i];
        if (rect.x < otherRect.x + otherRect.width &&
            rect.x + rect.width > otherRect.x &&
            rect.y < otherRect.y + otherRect.height &&
            rect.y + rect.height > otherRect.y) {
            return true;
        }
    }
    return false;
}

function isCloseToCircle(rect, circleRadius, minDistance) {
    let circleX = canvas.width / 2;
    let circleY = canvas.height / 2;
    let rectCenterX = rect.x + rect.width / 2;
    let rectCenterY = rect.y + rect.height / 2;
    let distance = Math.sqrt((circleX - rectCenterX) ** 2 + (circleY - rectCenterY) ** 2);
    return distance < circleRadius + minDistance + Math.max(rect.width, rect.height) / 2;
}

function isCloseToTanks(rect, tanks) {
    const minDistance = 150;

    for (let i = 0; i < tanks.length; i++) {
        let tank = tanks[i];
        let tankCenterX = tank.x + tank.width / 2;
        let tankCenterY = tank.y + tank.height / 2;
        let distanceX = Math.abs(tankCenterX - rect.x - rect.width / 2);
        let distanceY = Math.abs(tankCenterY - rect.y - rect.height / 2);

        if (distanceX < minDistance && distanceY < minDistance) {
            return true;
        }
    }

    return false;
}


function generateObstacles() {
    const minAmountObstacles = 10;
    const maxAmountObstacles = 20;

    for (let i = 0; i < Math.floor(Math.random() * (maxAmountObstacles - minAmountObstacles + 1) + 10); i++) {
        let obstacle = {
            x: 0,
            y: 0,
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
        };

        do {
            obstacle.x = Math.random() * canvas.width;
            obstacle.y = Math.random() * canvas.height;
        } while (
            isOverlap(obstacle, obstacles) ||
            isCloseToCircle(obstacle, circleRadius, obstacleMinDistance) ||
            isCloseToTanks(obstacle, otherTanks)
            );

        obstacles.push(obstacle);
    }

    // Generate tanks
    const minAmountTanks = 6;
    const maxAmountTanks = 10;

    for (let i = 0; i < Math.floor(Math.random() * (maxAmountTanks - minAmountTanks + 1) + minAmountTanks); i++) {
        let tank = {
            x: 0,
            y: 0,
            width: 60,
            height: 30,
            health: 100
        };

        do {
            tank.x = Math.random() * (canvas.width - tank.width);
            tank.y = Math.random() * (canvas.height - tank.height);
        } while (
            isOverlap(tank, obstacles) ||
            isCloseToCircle(tank, circleRadius, obstacleMinDistance) ||
            isCloseToTanks(tank, otherTanks)
            );

        otherTanks.push(tank);
    }
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
        drawHealthBar();
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
        ctx.rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
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
function drawShots() {
    for (let i = 0; i < shots.length; i++) {
        let shot = shots[i];

        if (!shot.fired) {
            shot.dx = Math.cos(shot.angle) * speedFactor;
            shot.dy = Math.sin(shot.angle) * speedFactor;
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
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();

        adjustBullet(shot, obstacles);
    }
}

// Update tank position and angle based on keyboard input
function updateTank() {
    let rotationSpeed = 0.0055;
    let moveSpeed = 0.5;
    let dx = 0;
    let dy = 0;
    let dAngle = 0;

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

    if (keys[81] && !isShooting) { // Q key
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
    drawTank();
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
            resetGame();
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
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShots();
    drawObstacles();
    drawTank();
    drawHealthBar();
}
centerTank();

// The game loop
function gameLoop() {
    updateTank();
    render();
    requestAnimationFrame(gameLoop);
    updateOtherTanks();

}

function resetGame() {
    obstacles = []; // Clear the obstacles array
    shots = []; // Clear the shots array
    bullets = []; // Clear the bullets array
    otherTanks = []; // Clear the other tanks array
    tankHealth = 100; // Reset the tank health
    generateObstacles(); // Generate new obstacles
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
            let newShot = {
                x: tank.x + Math.cos(angle) * (tank.width / 2 + 10),
                y: tank.y + Math.sin(angle) * (tank.height / 2 + 10),
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