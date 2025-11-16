// CANVAS
const canvas = document.getElementById("tetris");
const nextCanvas = document.getElementById("next");

const ctx = canvas.getContext("2d");
const nextCtx = nextCanvas.getContext("2d");

// DIMENSIONI TETRIS
const COLS = 10;
const ROWS = 20;

let BLOCK = 0;

// Resize responsive
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

// ------------------------------------------------------
//     LOGICA DEL GIOCO
// ------------------------------------------------------

let grid;
let current, next;

let px, py;

let score = 0;
let level = 1;
let dropInterval = 800;   // velocità caduta
let lastTime = 0;         // timestamp ultimo frame

// CREA TABELLA VUOTA
function emptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// PEZZI
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
  return JSON.parse(JSON.stringify(
    pieces[Math.floor(Math.random() * pieces.length)]
  ));
}

// ------------------------------------------------------
//     AVVIO DEL GIOCO
// ------------------------------------------------------

function startGame() {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "flex";

  // Reset
  grid = emptyGrid();
  score = 0;
  level = 1;
  dropInterval = 800;
  lastTime = 0;

  // Primo pezzo
  next = randomPiece();
  spawn();

  resize();
  requestAnimationFrame(update);  // <--- IMPORTANTISSIMO
}

// ------------------------------------------------------
//     SPAWNA NUOVO PEZZO
// ------------------------------------------------------

function spawn() {
  current = next;
  next = randomPiece();

  px = 3;
  py = 0;

  drawNext();
}

// ------------------------------------------------------
//     COLLISIONE
// ------------------------------------------------------

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

// ------------------------------------------------------
//     UNISCI PEZZO ALLA GRIGLIA
// ------------------------------------------------------

function merge() {
  current.shape.forEach((row, y) =>
    row.forEach((v, x) => {
      if (v) grid[py + y][px + x] = current.color;
    })
  );
}

// ------------------------------------------------------
//     CANCELLA LINEE
// ------------------------------------------------------

function clearLines() {
  for (let y = ROWS - 1; y >= 0; y--) {
    if (grid[y].every(v => v)) {
      grid.splice(y, 1);
      grid.unshift(Array(COLS).fill(0));
      score += 100;
    }
  }
}

// ------------------------------------------------------
//     DISEGNA PEZZI
// ------------------------------------------------------

function drawMatrix(context, matrix, ox, oy, b, color) {
  context.fillStyle = color;
  matrix.forEach((row, dy) =>
    row.forEach((v, dx) => {
      if (v)
        context.fillRect((ox+dx)*b, (oy+dy)*b, b-1, b-1);
    })
  );
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Griglia
  grid.forEach((row, y) =>
    row.forEach((v, x) => {
      if (v) {
        ctx.fillStyle = v;
        ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK - 1, BLOCK - 1);
      }
    })
  );

  // Pezzo attuale
  drawMatrix(ctx, current.shape, px, py, BLOCK, current.color);

  document.getElementById("score").textContent = score;
  document.getElementById("level").textContent = level;
}

function drawNext() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

  const b = nextCanvas.width / 4;
  drawMatrix(nextCtx, next.shape, 1, 1, b, next.color);
}

// ------------------------------------------------------
//     UPDATE (CADUTA AUTOMATICA)
// ------------------------------------------------------

function update(time = 0) {
  const delta = time - lastTime;

  if (delta >= dropInterval) {
    py++;
    if (collide(px, py, current.shape)) {
      py--;
      merge();
      clearLines();
      spawn();
    }
    lastTime = time;
  }

  draw();
  requestAnimationFrame(update);
}

// ------------------------------------------------------
//     CONTROLLI
// ------------------------------------------------------

function moveLeft() {
  if (!collide(px - 1, py, current.shape)) px--;
}

function moveRight() {
  if (!collide(px + 1, py, current.shape)) px--;
}

function rotatePiece() {
  const rot = current.shape[0].map((_, i) =>
    current.shape.map(row => row[i])
  ).reverse();

  if (!collide(px, py, rot)) current.shape = rot;
}

function hardDrop() {
  while (!collide(px, py + 1, current.shape)) py++;
  merge();
  clearLines();
  spawn();
}

function pauseGame() {}
