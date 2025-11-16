const canvas = document.getElementById("tetris");
const nextCanvas = document.getElementById("next");
const ctx = canvas.getContext("2d");
const nextCtx = nextCanvas.getContext("2d");

const COLS = 10, ROWS = 20;
let BLOCK; 
let NEXT_BLOCK;

// Responsiveness
function resizeGame() {
    // Tetris deve stare dentro allo schermo senza uscire
    const maxWidth = Math.min(window.innerWidth * 0.9, 360);
    const height = maxWidth * 2;

    canvas.style.width = maxWidth + "px";
    canvas.style.height = height + "px";

    // Impostiamo *fisicamente* la risoluzione del canvas
    canvas.width = maxWidth;
    canvas.height = height;

    BLOCK = canvas.width / COLS;
    NEXT_BLOCK = nextCanvas.width / 4;

    draw();
}

// Detect resize events
window.addEventListener("resize", () => {
    resizeGame();
});

// ---------------------------------------------------

const shapes = [
  { color: "#00f0f0", shape: [[1,1,1,1]] },
  { color: "#f0f000", shape: [[1,1],[1,1]] },
  { color: "#8000f0", shape: [[0,1,0],[1,1,1]] },
  { color: "#f00000", shape: [[1,0,0],[1,1,1]] },
  { color: "#0000f0", shape: [[0,0,1],[1,1,1]] },
  { color: "#00f000", shape: [[1,1,0],[0,1,1]] },
  { color: "#f0a000", shape: [[0,1,1],[1,1,0]] }
];

let grid, current, currentColor, px, py, score = 0, level = 1, dropInterval = 800;
let dropTimer = 0, lastTime = 0, paused = false, highScore = 0;
let nextPiece = null;

// ---------------------------------------------------

function initGrid() {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomPiece() {
  return shapes[Math.floor(Math.random() * shapes.length)];
}

function drawMatrix(ctx, matrix, offsetX, offsetY, blockSize, color) {
  ctx.fillStyle = color;
  matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) {
        ctx.fillRect((offsetX + x) * blockSize, (offsetY + y) * blockSize, blockSize - 1, blockSize - 1);
      }
    });
  });
}

function drawNext() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  if (nextPiece) {
    drawMatrix(nextCtx, nextPiece.shape, 1, 1, NEXT_BLOCK, nextPiece.color);
  }
}

function newPiece() {
  const piece = nextPiece || randomPiece();
  current = piece.shape;
  currentColor = piece.color;
  nextPiece = randomPiece();
  drawNext();
  px = 3;
  py = 0;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  grid.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) {
        ctx.fillStyle = val;
        ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK - 1, BLOCK - 1);
      }
    });
  });

  if (current) {
    drawMatrix(ctx, current, px, py, BLOCK, currentColor);
  }
}

function collides(x, y, shape) {
  return shape.some((row, dy) =>
    row.some((val, dx) =>
      val && (y + dy >= ROWS || x + dx < 0 || x + dx >= COLS || grid[y + dy]?.[x + dx])
    )
  );
}

function merge() {
  current.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) grid[py + y][px + x] = currentColor;
    });
  });
}

function clearLines() {
  for (let y = ROWS - 1; y >= 0; y--) {
    if (grid[y].every(cell => cell)) {
      grid.splice(y, 1);
      grid.unshift(Array(COLS).fill(0));
      score += 100;
      level = 1 + Math.floor(score / 500);
      dropInterval = Math.max(200, 800 - level * 50);
      document.getElementById("score").textContent = score;
      document.getElementById("level").textContent = level;
    }
  }
}

function update(t = 0) {
  if (paused) return;

  const delta = t - lastTime;
  lastTime = t;
  dropTimer += delta;

  if (dropTimer > dropInterval) {
    py++;
    if (collides(px, py, current)) {
      py--;
      merge();
      clearLines();
      newPiece();
    }
    dropTimer = 0;
  }

  draw();
  requestAnimationFrame(update);
}

function moveLeft() { if (!collides(px - 1, py, current)) px--; }
function moveRight() { if (!collides(px + 1, py, current)) px++; }
function rotatePiece() {
  const rotated = current[0].map((_, i) => current.map(row => row[i])).reverse();
  if (!collides(px, py, rotated)) current = rotated;
}
function hardDrop() { while (!collides(px, py + 1, current)) py++; }

function togglePause() {
  paused = !paused;
  if (!paused) update();
}

function startGame() {
  score = 0;
  level = 1;
  dropInterval = 800;
  dropTimer = 0;
  lastTime = 0;
  paused = false;

  highScore = parseInt(localStorage.getItem("highScore")) || 0;

  document.getElementById("score").textContent = score;
  document.getElementById("highscore").textContent = highScore;
  document.getElementById("level").textContent = level;

  initGrid();
  nextPiece = randomPiece();
  newPiece();

  resizeGame();
  update();
}

function launchGame() {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-ui").style.display = "flex";
  startGame();
}
