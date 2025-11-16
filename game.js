// CANVAS
const canvas = document.getElementById("tetris");
const nextCanvas = document.getElementById("next");
const ctx = canvas.getContext("2d");
const nextCtx = nextCanvas.getContext("2d");

// GAME SETTINGS
const COLS = 10;
const ROWS = 20;

let BLOCK = 0;

// Resize automatico perfetto
function resize() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  nextCanvas.width = nextCanvas.clientWidth;
  nextCanvas.height = nextCanvas.clientHeight;

  BLOCK = canvas.width / COLS;

  draw();
  drawNext();
}

window.addEventListener("resize", resize);

// GAME LOGIC
let grid;
let current, next;
let px, py;
let score, level;
let last = 0;
let dropInterval = 900;

function emptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

const pieces = [
  { color: "#00f0f0", shape: [[1,1,1,1]] },
  { color: "#f0f000", shape: [[1,1],[1,1]] },
  { color: "#8000f0", shape: [[0,1,0],[1,1,1]] },
  { color: "#f00000", shape: [[1,0,0],[1,1,1]] },
  { color: "#0000f0", shape: [[0,0,1],[1,1,1]] },
  { color: "#00f000", shape: [[1,1,0],[0,1,1]] },
  { color: "#f0a000", shape: [[0,1,1],[1,1,0]] }
];

function randomPiece() {
  return JSON.parse(JSON.stringify(pieces[Math.floor(Math.random() * pieces.length)]));
}

function startGame() {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "flex";

  grid = emptyGrid();
  score = 0;
  level = 1;

  next = randomPiece();
  spawn();

  resize();
  update();
}

function spawn() {
  current = next;
  next = randomPiece();
  px = 3;
  py = 0;
}

function drawMatrix(ctx, matrix, ox, oy, block, color) {
  ctx.fillStyle = color;
  matrix.forEach((row, y) =>
    row.forEach((v, x) => {
      if (v) ctx.fillRect((ox + x) * block, (oy + y) * block, block - 1, block - 1);
    })
  );
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw grid
  grid.forEach((row, y) =>
    row.forEach((v, x) => {
      if (v) {
        ctx.fillStyle = v;
        ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK - 1, BLOCK - 1);
      }
    })
  );

  // Draw current
  drawMatrix(ctx, current.shape, px, py, BLOCK, current.color);

  document.getElementById("score").textContent = score;
  document.getElementById("level").textContent = level;
}

function drawNext() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

  const block = nextCanvas.width / 4;
  drawMatrix(nextCtx, next.shape, 0.5, 0.5, block, next.color);
}

function collide(x, y, shape) {
  return shape.some((row, dy) =>
    row.some((v, dx) =>
      v &&
      (y + dy >= ROWS ||
       x + dx < 0 ||
       x + dx >= COLS ||
       grid[y + dy][x + dx])
    )
  );
}

function merge() {
  current.shape.forEach((row, y) =>
    row.forEach((v, x) => {
      if (v) grid[py + y][px + x] = current.color;
    })
  );
}

function clearLines() {
  for (let y = ROWS - 1; y >= 0; y--) {
    if (grid[y].every(v => v)) {
      grid.splice(y, 1);
      grid.unshift(Array(COLS).fill(0));
      score += 100;
    }
  }
}

function update(t = 0) {
  const dt = t - last;
  last = t;

  if (dt > dropInterval) {
    py++;
    if (collide(px, py, current.shape)) {
      py--;
      merge();
      clearLines();
      spawn();
    }
  }

  draw();
  requestAnimationFrame(update);
}

// CONTROLLI
function moveLeft(){ if(!collide(px-1,py,current.shape)) px--; }
function moveRight(){ if(!collide(px+1,py,current.shape)) px++; }
function rotatePiece(){
  const rot = current.shape[0].map((_,i)=>current.shape.map(r=>r[i])).reverse();
  if(!collide(px,py,rot)) current.shape = rot;
}
function hardDrop(){
  while(!collide(px,py+1,current.shape)) py++;
  merge();
  clearLines();
  spawn();
}
function pauseGame(){ }


let lastTime = 0;

function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;

  if (delta > dropInterval) {
    py++;
    if (collide(px, py, current.shape)) {
      py--;
      merge();
      clearLines();
      spawn();
    }
  }

  draw();
  requestAnimationFrame(update);
}
