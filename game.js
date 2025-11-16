const tetrisCanvas = document.getElementById("tetris");
const nextCanvas = document.getElementById("next");
const ctx = tetrisCanvas.getContext("2d");
const nextCtx = nextCanvas.getContext("2d");

let COLS = 10, ROWS = 20;
let BLOCK;

// Resize automatico
function resizeCanvas() {
  const width = tetrisCanvas.clientWidth;
  const height = tetrisCanvas.clientHeight;

  tetrisCanvas.width = width;
  tetrisCanvas.height = height;

  BLOCK = width / COLS;

  draw();
}

window.addEventListener("resize", resizeCanvas);

// ------------ GAME CORE --------------

let grid, current, currentColor, px, py, score, level, dropTimer, dropInterval, lastTime;
let paused = false;
let nextPiece = null;

const shapes = [
  { color: "#00f0f0", shape: [[1,1,1,1]] },
  { color: "#f0f000", shape: [[1,1],[1,1]] },
  { color: "#8000f0", shape: [[0,1,0],[1,1,1]] },
  { color: "#f00000", shape: [[1,0,0],[1,1,1]] },
  { color: "#0000f0", shape: [[0,0,1],[1,1,1]] },
  { color: "#00f000", shape: [[1,1,0],[0,1,1]] },
  { color: "#f0a000", shape: [[0,1,1],[1,1,0]] }
];

function initGrid() {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomPiece() {
  return shapes[Math.floor(Math.random() * shapes.length)];
}

function drawMatrix(context, matrix, offsetX, offsetY, size, color) {
  context.fillStyle = color;
  matrix.forEach((row, y) =>
    row.forEach((val, x) => {
      if (val) context.fillRect((offsetX + x)*size, (offsetY + y)*size, size-1, size-1);
    })
  );
}

function drawNext() {
  nextCanvas.width = nextCanvas.clientWidth;
  nextCanvas.height = nextCanvas.clientHeight;

  const block = nextCanvas.width / 4;

  nextCtx.clearRect(0,0,nextCanvas.width,nextCanvas.height);
  drawMatrix(nextCtx, nextPiece.shape, 1, 1, block, nextPiece.color);
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
  ctx.clearRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);

  grid.forEach((row, y) =>
    row.forEach((val, x) => {
      if (val) {
        ctx.fillStyle = val;
        ctx.fillRect(x*BLOCK, y*BLOCK, BLOCK-1, BLOCK-1);
      }
    })
  );

  if (current)
    drawMatrix(ctx, current, px, py, BLOCK, currentColor);
}

function collides(x,y,shape){
  return shape.some((row, dy) =>
    row.some((val, dx) =>
      val && (y+dy >= ROWS || x+dx < 0 || x+dx >= COLS || grid[y+dy]?.[x+dx])
    ));
}

function merge(){
  current.forEach((row,y)=>
    row.forEach((val,x)=>{
      if(val) grid[py+y][px+x] = currentColor;
    })
  );
}

function clearLines(){
  for(let y=ROWS-1; y>=0; y--){
    if(grid[y].every(v=>v)){
      grid.splice(y,1);
      grid.unshift(Array(COLS).fill(0));
      score += 100;
      level = 1 + Math.floor(score/500);
      dropInterval = Math.max(150, 800 - level*50);

      document.getElementById("score").textContent = score;
      document.getElementById("level").textContent = level;
    }
  }
}

function update(t=0){
  if(paused) return;

  const delta = t-lastTime;
  lastTime = t;
  dropTimer += delta;

  if(dropTimer > dropInterval){
    py++;
    if(collides(px,py,current)){
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

function moveLeft(){ if(!collides(px-1,py,current)) px--; }
function moveRight(){ if(!collides(px+1,py,current)) px++; }
function rotatePiece(){
  const rotated = current[0].map((_,i)=>current.map(row=>row[i])).reverse();
  if(!collides(px,py,rotated)) current = rotated;
}
function hardDrop(){ while(!collides(px,py+1,current)) py++; }

function togglePause(){ paused=!paused; if(!paused) update(); }

function launchGame(){
  document.getElementById("start-screen").style.display="none";
  document.getElementById("game-ui").style.display="block";

  score = 0;
  level = 1;
  dropInterval = 800;
  dropTimer = 0;
  lastTime = 0;

  initGrid();
  nextPiece = randomPiece();
  newPiece();

  resizeCanvas();
  update();
}
