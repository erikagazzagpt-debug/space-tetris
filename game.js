const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const COLS = 10, ROWS = 20;
const BLOCK = canvas.width / COLS;

const shapes = [
  [[1,1,1,1]], 
  [[1,1],[1,1]], 
  [[0,1,0],[1,1,1]],
  [[1,0,0],[1,1,1]], 
  [[0,0,1],[1,1,1]],
  [[1,1,0],[0,1,1]], 
  [[0,1,1],[1,1,0]]
];

const colors = ["#6fbaff", "#ffcc00", "#cc33ff", "#ff6666", "#66ccff", "#66ff66", "#ff9966"];

let grid, current, px, py, score = 0;
let dropInterval = 600, dropTimer = 0, lastTime = 0;
let isGameOver = false;

function startGame() {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "flex";
  initGame();
}

function initGame() {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  score = 0;
  isGameOver = false;
  spawnPiece();
  update();
}

function spawnPiece() {
  const index = Math.floor(Math.random() * shapes.length);
  current = {
    shape: shapes[index],
    color: colors[index]
  };
  px = 3;
  py = 0;

  if (checkCollision(px, py, current.shape)) {
    gameOver();
  }
}

function checkCollision(x, y, shape) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const newY = y + r;
        const newX = x + c;
        if (
          newY >= ROWS || 
          newX < 0 || 
          newX >= COLS || 
          (newY >= 0 && grid[newY][newX])
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function mergePiece() {
  current.shape.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val) {
        grid[py + r][px + c] = current.color;
      }
    });
  });
}

function clearLines() {
  for (let y = ROWS - 1; y >= 0; y--) {
    if (grid[y].every(cell => cell)) {
      grid.splice(y, 1);
      grid.unshift(Array(COLS).fill(0));
      score += 10;
      document.getElementById("score").textContent = score;
      y++;
    }
  }
}

function dropPiece() {
  if (!isGameOver) {
    py++;
    if (checkCollision(px, py, current.shape)) {
      py--;
      mergePiece();
      clearLines();
      spawnPiece();
    }
    dropTimer = 0;
  }
}

function drawMatrix(matrix, offsetX, offsetY, color) {
  matrix.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val) {
        ctx.fillStyle = color;
        ctx.fillRect((offsetX + c) * BLOCK, (offsetY + r) * BLOCK, BLOCK, BLOCK);
        ctx.strokeStyle = "black";
        ctx.strokeRect((offsetX + c) * BLOCK, (offsetY + r) * BLOCK, BLOCK, BLOCK);
      }
    });
  });
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  grid.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val) {
        ctx.fillStyle = val;
        ctx.fillRect(c * BLOCK, r * BLOCK, BLOCK, BLOCK);
        ctx.strokeStyle = "black";
        ctx.strokeRect(c * BLOCK, r * BLOCK, BLOCK, BLOCK);
      }
    });
  });

  drawMatrix(current.shape, px, py, current.color);
}

function update(time = 0) {
  if (!isGameOver) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropTimer += deltaTime;

    if (dropTimer > dropInterval) {
      dropPiece();
    }

    drawGrid();
    requestAnimationFrame(update);
  }
}

function moveLeft() {
  if (!isGameOver && !checkCollision(px - 1, py, current.shape)) px--;
}

function moveRight() {
  if (!isGameOver && !checkCollision(px + 1, py, current.shape)) px++;
}

function rotatePiece() {
  if (isGameOver) return;
  const rotated = current.shape[0].map((_, i) => current.shape.map(row => row[i])).reverse();
  if (!checkCollision(px, py, rotated)) current.shape = rotated;
}

function gameOver() {
  isGameOver = true;
  document.getElementById("final-score").textContent = "Your score point is: " + score;
  document.getElementById("game-over-screen").style.display = "flex";
}

function resetGame() {
  // Reset stato gioco
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  score = 0;
  isGameOver = false;

  // Aggiorna punteggio
  document.getElementById("score").textContent = score;

  // Nascondi schermata game over se visibile
  document.getElementById("game-over-screen").style.display = "none";

  // Crea nuovo pezzo
  spawnPiece();

  // Riparti con l'animazione
  lastTime = 0;
  dropTimer = 0;
  update();
}

function restartGame() {
  location.reload(); // oppure puoi creare una funzione resetGame() se non vuoi ricaricare la pagina
}


// DISABILITA ZOOM CON DOPPIO TOCCO
document.addEventListener('touchstart', function (e) {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });


// DISABILITA ZOOM CON DOPPIO TAP
let lastTouchEnd = 0;
document.addEventListener('touchend', function (e) {
  const now = new Date().getTime();
  if (now - lastTouchEnd <= 150) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, false);


