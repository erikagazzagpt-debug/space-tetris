// ------------------------------------------------------
//  CANVAS E SCALING
// ------------------------------------------------------

const canvas = document.getElementById("tetris");
const nextCanvas = document.getElementById("next");

const ctx = canvas.getContext("2d");
const nextCtx = nextCanvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
let BLOCK = 0;

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
//  LOGICA DI GIOCO
// ------------------------------------------------------

let grid;
let current, nextPiece;
let px, py;

let score = 0;
let level = 1;
let dropInterval = 900;  // velocità discesa
let lastTime = 0;

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
  return JSON.parse(JSON.stringify(
    pieces[Math.floor(Math.random() * pieces.length)]
  ));
}

// ------------------------------------------------------
//  AVVIO GIOCO (CHIAMATO DAL BOTTONE START)
// ------------------------------------------------------

function startGame() {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "flex";

  grid = emptyGrid();
  score = 0;
  level = 1;
  dropInterval = 900;
  lastTime = 0;

  nextPiece = randomPiece();
  spawn();

  resize();
  requestAnimationFrame(update);   // <------ IMPORTANTISSIMO
}

// ------------------------------------------------------
//  SPAWN PEZZO
// ------------------------------------------------------

function spawn() {
  current = nextPiece;
  nextPiece = randomPiece();

  px = 3;
  py = 0;

  drawNext();
}

// ------------------------------------------------------
//  COLLISIONE
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
//  UNIONE PEZZO CON GRIGLIA
// ------------------------------------------------------

function merge() {
  current.shape.forEach((row, y) =>
    row.forEach((v, x) => {
      if (v) grid[py + y][px + x] = current.color;
    })
  );
}

// ------------------------------------------------------
//  CLEAR LINEE
// ------------------------------------------------------

function clearLines() {
  for (let y = ROWS - 1; y >= 0; y--) {
    if (grid[y].every(v => v)) {
      grid.splice(y, 1);
      grid.unshift(Array(COLS).fill(0));

      score += 100;

      dropInterval = Math.max(150, dropInterval - 40);
    }
  }
}

// ------------------------------------------------------
//  DISEGNARE
// ------------------------------------------------------

function drawMatrix(context, matrix, ox, oy, b, color) {
  context.fillStyle = color;
  matrix.forEach((row, dy) =>
    row.forEach((v, dx) => {
      if (v) context.fillRect((ox+dx)*b, (oy+dy)*b, b-1, b-1);
    })
  );
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // griglia
  grid.forEach((row, y) =>
    row.forEach((v, x) => {
      if (v) {
        ctx.fillStyle = v;
        ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK - 1, BLOCK - 1);
      }
    })
  );

  // pezzo attuale
  drawMatrix(ctx, current.shape, px, py, BLOCK, current.color);
}

function drawNext() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

  const b = nextCanvas.width / 4;
  drawMatrix(nextCtx, nextPiece.shape, 1, 1, b, nextPiece.color);
}

// ------------------------------------------------------
//  LOOP DEL GIOCO (FUNZIONA AL 100%)
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
//  CONTROLLI
// ------------------------------------------------------

function moveLeft() {
  if (!collide(px - 1, py, current.shape)) px--;
}

function moveRight() {
  if (!collide(px + 1, py, current.shape)) px++;
}

function rotatePiece() {
  const rotated = current.shape[0].map((_, i) =>
    current.shape.map(row => row[i])
  ).reverse();

  if (!collide(px, py, rotated)) current.shape = rotated;
}

function hardDrop() {
  while (!collide(px, py + 1, current.shape)) py++;
  merge();
  clearLines();
  spawn();
}

function pauseGame() {}
