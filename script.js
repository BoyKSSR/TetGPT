const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');

const ROWS = 20;
const COLUMNS = 10;
const BLOCK_SIZE = 30;
const COLORS = ['#00FFFF', '#0000FF', '#FF7F00', '#FF0000', '#00FF00', '#FFFF00', '#800080'];

const SHAPES = [
    [[1, 1, 1, 1]],  // I shape
    [[1, 1], [1, 1]],  // O shape
    [[0, 1, 1], [1, 1, 0]],  // S shape
    [[1, 1, 0], [0, 1, 1]],  // Z shape
    [[1, 1, 1], [0, 1, 0]],  // T shape
    [[1, 0, 0], [1, 1, 1]],  // L shape
    [[0, 0, 1], [1, 1, 1]]   // J shape
];

let grid = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));

let currentShape, currentColor, currentPos;
let dropInterval = 500;
let lastDropTime = 0;
let gameOverFlag = false;

// Simulated virtual currency
let virtualCurrency = 100; // Start with 100 coins
let skinPurchased = false;  // Track if the player has purchased the skin

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLUMNS; x++) {
            if (grid[y][x]) {
                ctx.fillStyle = grid[y][x];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function drawShape() {
    for (let y = 0; y < currentShape.length; y++) {
        for (let x = 0; x < currentShape[y].length; x++) {
            if (currentShape[y][x]) {
                ctx.fillStyle = currentColor;
                ctx.fillRect((currentPos.x + x) * BLOCK_SIZE, (currentPos.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function rotateShape() {
    const newShape = currentShape[0].map((_, index) => currentShape.map(row => row[index])).reverse();
    if (!checkCollision(newShape, currentPos.x, currentPos.y)) {
        currentShape = newShape;
    }
}

function checkCollision(shape, offsetX, offsetY) {
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                if (offsetX + x < 0 || offsetX + x >= COLUMNS || offsetY + y >= ROWS || grid[offsetY + y][offsetX + x]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function placeShape() {
    for (let y = 0; y < currentShape.length; y++) {
        for (let x = 0; x < currentShape[y].length; x++) {
            if (currentShape[y][x]) {
                grid[currentPos.y + y][currentPos.x + x] = currentColor;
            }
        }
    }

    // Check for line clearing
    for (let y = ROWS - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell !== 0)) {
            grid.splice(y, 1);
            grid.unshift(Array(COLUMNS).fill(0));
        }
    }
}

function newPiece() {
    const randomIndex = Math.floor(Math.random() * SHAPES.length);
    currentShape = SHAPES[randomIndex];
    currentColor = COLORS[randomIndex];
    currentPos = { x: Math.floor(COLUMNS / 2) - Math.floor(currentShape[0].length / 2), y: 0 };

    if (checkCollision(currentShape, currentPos.x, currentPos.y)) {
        gameOver();
    }
}

function gameOver() {
    alert("Game Over!");
    grid = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));
    gameOverFlag = true;
}

function moveLeft() {
    if (!checkCollision(currentShape, currentPos.x - 1, currentPos.y)) {
        currentPos.x--;
    }
}

function moveRight() {
    if (!checkCollision(currentShape, currentPos.x + 1, currentPos.y)) {
        currentPos.x++;
    }
}

function moveDown() {
    if (!checkCollision(currentShape, currentPos.x, currentPos.y + 1)) {
        currentPos.y++;
    } else {
        placeShape();
        newPiece();
    }
}

function update() {
    drawGrid();
    drawShape();
}

function gameLoop(currentTime) {
    if (gameOverFlag) return;

    if (currentTime - lastDropTime > dropInterval) {
        moveDown();
        lastDropTime = currentTime;
    }

    update();
    requestAnimationFrame(gameLoop);
}

// Simulate microtransaction to buy a skin
function buySkin() {
    const skinCost = 50;  // 50 coins to unlock the skin

    if (virtualCurrency >= skinCost) {
        virtualCurrency -= skinCost;
        skinPurchased = true;
        alert("Skin purchased successfully!");
        updateCurrencyDisplay();
    } else {
        alert("Not enough coins!");
    }
}

function earnCoins(amount) {
    virtualCurrency += amount;
    updateCurrencyDisplay();
}

function updateCurrencyDisplay() {
    document.getElementById("currency-display").textContent = `Coins: ${virtualCurrency}`;
}

// Event listeners for controls
document.addEventListener('keydown', (event) => {
    if (event.key === 'a') { moveLeft(); }
    else if (event.key === 'd') { moveRight(); }
    else if (event.key === 's') { moveDown(); }
    else if (event.key === 'w') { rotateShape(); }
});

// Setup and start the game
newPiece();
requestAnimationFrame(gameLoop);

// Simulate earning coins when the player scores or performs some action
setInterval(() => {
    earnCoins(5);  // Award 5 coins every 10 seconds
}, 10000);  // Every 10 seconds

// Attach microtransaction actions to buttons
document.getElementById("buy-skin").addEventListener('click', buySkin);

