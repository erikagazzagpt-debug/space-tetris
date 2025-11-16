
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// Resize dinamico del canvas
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function startGame() {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';
  resizeCanvas();
}

function moveLeft() {
  console.log("← Spostato a sinistra");
}

function moveRight() {
  console.log("→ Spostato a destra");
}

function dropPiece() {
  console.log("↓ Caduta del pezzo");
}

function rotatePiece() {
  console.log("⟳ Rotazione del pezzo");
}
