const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ================= CONFIG ================= */
const GRID = 34;
const FPS = 10;

let SIZE;
let snake, dx, dy, nextDx, nextDy, food, score;

/* ================= IMAGES ================= */
const imgTete = new Image();
imgTete.src = "./img/serpent.png"; // image tête orientée vers le HAUT

const imgCorps = new Image();
imgCorps.src = "./img/corps.png";

const imgPomme = new Image();
imgPomme.src = "./img/pomme.png";

/* ================= RESIZE RESPONSIVE ================= */
function resizeCanvas() {
  const section = document.getElementById("snake");
  const size = Math.min(section.clientWidth * 0.95, 680);

  canvas.width = size;
  canvas.height = size;

  SIZE = canvas.width / GRID;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* ================= RESET ================= */
function resetGame() {
  snake = [{ x: 17, y: 17 }];
  dx = dy = 0;
  nextDx = nextDy = 0;
  score = 0;
  food = spawnFood();
}

resetGame();

/* ================= FOOD ================= */
function spawnFood() {
  while (true) {
    const f = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID)
    };
    if (!snake.some(s => s.x === f.x && s.y === f.y)) return f;
  }
}

/* ================= DIRECTION SAFE ================= */
function setDirection(x, y) {
  if (x === -dx && y === -dy) return; // empêche demi-tour
  nextDx = x;
  nextDy = y;
}

/* ================= CLAVIER ================= */
document.addEventListener("keydown", e => {
  const k = e.key.toLowerCase();
  if (k === "z" || k === "arrowup") setDirection(0, -1);
  if (k === "s" || k === "arrowdown") setDirection(0, 1);
  if (k === "q" || k === "arrowleft") setDirection(-1, 0);
  if (k === "d" || k === "arrowright") setDirection(1, 0);
});

/* ================= TACTILE (ANTI SCROLL) ================= */
let startX = 0;
let startY = 0;

canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  const t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
}, { passive: false });

canvas.addEventListener("touchmove", e => {
  e.preventDefault(); // empêche le scroll
}, { passive: false });

canvas.addEventListener("touchend", e => {
  e.preventDefault();
  const t = e.changedTouches[0];
  const dxTouch = t.clientX - startX;
  const dyTouch = t.clientY - startY;

  if (Math.abs(dxTouch) > Math.abs(dyTouch)) {
    if (dxTouch > 30) setDirection(1, 0);
    else if (dxTouch < -30) setDirection(-1, 0);
  } else {
    if (dyTouch > 30) setDirection(0, 1);
    else if (dyTouch < -30) setDirection(0, -1);
  }
}, { passive: false });

/* ================= UPDATE ================= */
function update() {
  dx = nextDx;
  dy = nextDy;
  if (!dx && !dy) return;

  const head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy
  };

  // Mur
  if (head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID) {
    resetGame();
    return;
  }

  // Corps
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    resetGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    food = spawnFood();
  } else {
    snake.pop();
  }
}

/* ================= DRAW ================= */
function draw() {
  // Damier
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      ctx.fillStyle = (x + y) % 2 ? "#005500" : "#004400";
      ctx.fillRect(x * SIZE, y * SIZE, SIZE, SIZE);
    }
  }

  // Serpent
  snake.forEach((s, i) => {
    if (i === 0) {
      ctx.save();
      ctx.translate(s.x * SIZE + SIZE / 2, s.y * SIZE + SIZE / 2);

      let angle = 0;
      if (dx === 1) angle = Math.PI / 2;
      else if (dx === -1) angle = -Math.PI / 2;
      else if (dy === 1) angle = Math.PI;

      ctx.rotate(angle);
      ctx.drawImage(imgTete, -SIZE / 2, -SIZE / 2, SIZE, SIZE);
      ctx.restore();
    } else {
      ctx.drawImage(imgCorps, s.x * SIZE, s.y * SIZE, SIZE, SIZE);
    }
  });

  // Pomme
  ctx.drawImage(imgPomme, food.x * SIZE, food.y * SIZE, SIZE, SIZE);

  // Score
  ctx.fillStyle = "white";
  ctx.font = `${SIZE}px Arial`;
  ctx.fillText("Score : " + score, 10, SIZE + 5);
}

/* ================= LOOP ================= */
setInterval(() => {
  update();
  draw();
}, 1000 / FPS);