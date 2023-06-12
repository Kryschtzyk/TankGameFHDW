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
}

function generateKiTanks(){
    if (otherTanks.length === 0) {

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