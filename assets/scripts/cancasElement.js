const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

let obstacles = [];
let shots = [];
let lastShotTime = 0; // initialize lastShotTime to 0


const circleRadius = 5;
const obstacleMinDistance = 100;

for (let i = 0; i < 8; i++) {
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
let radius = Math.min(canvas.width, canvas.height) / 50;

function drawCircle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
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
    const speedFactor = 1.5;
    for (let i = 0; i < shots.length; i++) {
        let shot = shots[i];
        shot.x += shot.dx * speedFactor;
        shot.y += shot.dy * speedFactor;
        ctx.beginPath();
        ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();

        for (let i = 0; i < shots.length; i++) {
            let bullet = shots[i];
            adjustBullet(bullet, obstacles);
        }
    }
}

function moveCircle() {
    let dx = 0;
    let dy = 0;

    if (keys[87]) dy -= 5; // w
    if (keys[65]) dx -= 5; // a
    if (keys[83]) dy += 5; // s
    if (keys[68]) dx += 5; // d

    if (keys[81] && keys[87] || keys[81] && keys[65] || keys[81] && keys[83] || keys[81] && keys[68]) {
        const currentTime = Date.now(); // get the current time in milliseconds
        if (currentTime - lastShotTime > 1000) { // check if at least 3 seconds have passed
            lastShotTime = currentTime; // update lastShotTime to current time
            let newShot = {x: x, y: y, dx: dx, dy: dy, radius: 5};
            shots.push(newShot);
        }
    }

    // Check collision with obstacles
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];

        // Calculate the distance between the circle center and the closest point on the obstacle
        let closestX = Math.max(obstacle.x, Math.min(x, obstacle.x + obstacle.width));
        let closestY = Math.max(obstacle.y, Math.min(y, obstacle.y + obstacle.height));
        let distanceX = x - closestX;
        let distanceY = y - closestY;
        let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // Check if the distance is less than the circle radius
        if (distance < radius) {
            // Adjust the circle position so that it does not intersect with the obstacle
            let directionX = distanceX >= 0 ? 1 : -1;
            let directionY = distanceY >= 0 ? 1 : -1;
            let adjustX = directionX;
            let adjustY = directionY;
            x += adjustX;
            y += adjustY;

            // Update the velocity to zero to prevent the circle from moving through the obstacle
            dx = 0;
            dy = 0;
        }

    }

    x += dx;
    y += dy;

    // Keep the circle inside the screen
    x = Math.max(radius, Math.min(x, canvas.width - radius));
    y = Math.max(radius, Math.min(y, canvas.height - radius));
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


function gameLoop() {
    drawCircle();
    drawObstacles();
    drawShots();
    moveCircle();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
    keys[event.keyCode] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.keyCode] = false;
});

let keys = {};

gameLoop();
