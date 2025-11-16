const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();


const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const COLS = 10, ROWS = 20;
const BLOCK = canvas.width / COLS;
const shapes = [
  [[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]],
  [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]],
  [[1,1,0],[0,1,1]], [[0,1,1],[1,1,0]]
];
const colors = ["#ff6666", "#ffcc00", "#cc33ff", "#66ccff", "#66ff66", "#ff9966", "#6fbaff"];

let grid, current, px, py, score = 0;
let dropInterval = 600, dropTimer = 0, lastTime = 0;

function startGame() {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "flex";
  initGame();
}

function initGrid() {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function newPiece() {
  const index = Math.floor(Math.random() * shapes.length);
  current = {
    shape: shapes[index],
    color: colors[index]
  };
  px = 3;
  py = 0;
}

function collides(x, y, shape) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] && (grid[y + r] && grid[y + r][x + c]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function merge() {
  current.shape.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) grid[py + y][px + x] = current.color;
    });
  });
}

function clearLines() {
  for (let y = ROWS - 1; y >= 0; y--) {
    if (grid[y].every(cell => cell !== 0)) {
      grid.splice(y, 1);
      grid.unshift(Array(COLS).fill(0));
      score += 100;
      document.getElementById("score").textContent = score;
    }
  }
}

function drawMatrix(matrix, offsetX, offsetY, color) {
  matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) {
        ctx.fillStyle = color;
        ctx.fillRect((offsetX + x) * BLOCK, (offsetY + y) * BLOCK, BLOCK - 1, BLOCK - 1);
      }
    });
  });
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
  drawMatrix(current.shape, px, py, current.color);
}

function update(t = 0) {
  const delta = t - lastTime;
  lastTime = t;
  dropTimer += delta;
  if (dropTimer > dropInterval) {
    py++;
    if (collides(px, py, current.shape)) {
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

function initGame() {
  score = 0;
  document.getElementById("score").textContent = score;
  dropTimer = 0;
  lastTime = 0;
  initGrid();
  newPiece();
  update();
}

function moveLeft() {
  if (!collides(px - 1, py, current.shape)) px--;
}
function moveRight() {
  if (!collides(px + 1, py, current.shape)) px++;
}
function rotatePiece() {
  const rotated = current.shape[0].map((_, i) => current.shape.map(row => row[i])).reverse();
  if (!collides(px, py, rotated)) current.shape = rotated;
}
function dropPiece() {
  py++;
  if (collides(px, py, current.shape)) py--;
}
