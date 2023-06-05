const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const singlePlayerMode = document.getElementById("singlePlayer-button");
const multiPlayerMode = document.getElementById("multiPlayer-button");

tankImage = new Image();
tankImage.src = 'assets/images/tank.png';
tankImage.onload = gameLoop;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 90;

    prepareTankCanvas();
}

resizeCanvas();

let angle = 0;
let obstacles = [];
let shots = [];
let lastShotTime = 0;
let isShooting = false;
const speedFactor = 1.5;

const circleRadius = 100;
const obstacleMinDistance = 150;

function generateObstacles() {
    let minAmountObstacles = 10;
    let maxAmountObstacles = 20;
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
        } while (isOverlap(obstacle, obstacles) || isCloseToCircle(obstacle, circleRadius, obstacleMinDistance));
        obstacles.push(obstacle);
    }
}

function centerTank() {
    x = canvas.width / 2;
    y = canvas.height / 2;
}

generateObstacles();

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

let x = canvas.width / 2;
let y = canvas.height / 2;

let radius = Math.min(canvas.width, canvas.height) / 32;

function prepareTankCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawTank() {
    const tankWidth = tankImage.width;
    const tankHeight = tankImage.height;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.drawImage(tankImage, -tankWidth / 2, -tankHeight / 2);
    ctx.restore();
}

function drawObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];
        ctx.beginPath();
        ctx.rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.fillStyle = 'gray';
        ctx.fill();
        ctx.closePath();
    }
}

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

        ctx.beginPath();
        ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();

        adjustBullet(shot, obstacles);
    }
}

function updateTank() {
    let rotationSpeed = 0.01;
    let moveSpeed = 0.5;
    let dx = 0;
    let dy = 0;
    let dAngle = 0;


    if (keys[87]) { // W key
        dx += Math.cos(angle) * moveSpeed;
        dy += Math.sin(angle) * moveSpeed;
        console.log(angle);
    }
    if (keys[83]) { // S key
        dx -= Math.cos(angle) * moveSpeed;
        dy -= Math.sin(angle) * moveSpeed;
        console.log(angle);
    }
    if (keys[65]) { // A key
        dAngle -= rotationSpeed;
        console.log(dAngle);
    }
    if (keys[68]) { // D key
        dAngle += rotationSpeed;
        console.log(angle);
    }

    if (keys[81] && !isShooting) { // Q key
        isShooting = true;

        const currentTime = Date.now();
        if (currentTime - lastShotTime > 500) {
            lastShotTime = currentTime;


            let newShot = {
                x: x + Math.cos(angle) * (tankImage.width / 2 + 10), // Adjust the distance from the center of the tank
                y: y + Math.sin(angle) * (tankImage.height / 2 + 10), // Adjust the distance from the center of the tank
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

    // Keep the circle inside the screen
    x = Math.max(radius, Math.min(x, canvas.width - radius));
    y = Math.max(radius, Math.min(y, canvas.height - radius));

    // Normalize the angle to be between 0 and 2*pi
    angle = nextAngle;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw the tank at the new position and rotation
    drawTank();
}

function adjustBullet(obj, obstacles) {
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];

        // Calculate the distance between the object center and the closest point on the obstacle
        let closestX = Math.max(obstacle.x, Math.min(obj.x, obstacle.x + obstacle.width));
        let closestY = Math.max(obstacle.y, Math.min(obj.y, obstacle.y + obstacle.height));
        let distanceX = obj.x - closestX;
        let distanceY = obj.y - closestY;
        let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // Check if the distance is less than the object radius/size
        if (distance < obj.radius || distance < obj.size) {
            obj.radius = 0;
            obj.size = 0;
        }
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawShots();
    drawObstacles();
    drawTank();
}

function gameLoop() {
    updateTank();
    render();

    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', resizeCanvas);

document.addEventListener('keydown', (event) => {
    keys[event.keyCode] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.keyCode] = false;
});

let keys = {};

gameLoop();
