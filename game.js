
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const COLS = 10;
const ROWS = 16;

const colors = {
  1: '#FF4136', // Z - red
  2: '#2ECC40', // S - green
  3: '#0074D9', // J - blue
  4: '#FFDC00', // O - yellow
  5: '#B10DC9', // T - purple
  6: '#7FDBFF', // I - cyan
  7: '#FF851B'  // L - orange
};

const pieces = 'ZSLJOTI';

let arena = createMatrix(COLS, ROWS);
let player = {
  pos: { x: 0, y: 0 },
  matrix: null
};

let dropCounter = 0;
let dropInterval = 800;
let lastTime = 0;

function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

function createPiece(type) {
  switch (type) {
    case 'T': return [[0, 5, 0], [5, 5, 5]];
    case 'O': return [[4, 4], [4, 4]];
    case 'L': return [[0, 0, 7], [7, 7, 7]];
    case 'J': return [[3, 0, 0], [3, 3, 3]];
    case 'I': return [[6, 6, 6, 6]];
    case 'S': return [[0, 2, 2], [2, 2, 0]];
    case 'Z': return [[1, 1, 0], [0, 1, 1]];
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
        context.strokeStyle = '#000';
        context.lineWidth = 0.05;
        context.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = '#0a1a3a';
  context.fillRect(0, 0, COLS, ROWS);
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
        (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

function playerRotate() {
  const original = player.matrix;
  player.matrix = rotate(player.matrix);
  if (collide(arena, player)) {
    player.matrix = original;
  }
}

function playerReset() {
  const type = pieces[Math.floor(Math.random() * pieces.length)];
  player.matrix = createPiece(type);
  player.pos.y = 0;
  player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix[0].length / 2);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    alert("Game Over");
  }
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  context.setTransform(canvas.width / COLS, 0, 0, canvas.height / ROWS, 0, 0);
  draw();
}

// Comandi
function moveLeft() { playerMove(-1); }
function moveRight() { playerMove(1); }
function dropPiece() { playerDrop(); }
function rotatePiece() { playerRotate(); }

// Inizializzazione
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
playerReset();
update();
