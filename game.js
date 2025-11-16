
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// FUNZIONI DI GIOCO PLACEHOLDER (sostituire con logica di gioco vera)
function startGame() {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';
}

function moveLeft() {
  console.log("Move Left");
}

function moveRight() {
  console.log("Move Right");
}

function dropPiece() {
  console.log("Drop Piece");
}

function rotatePiece() {
  console.log("Rotate Piece");
}
