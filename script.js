const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
menuToggle.addEventListener('click', () => { const open = nav.classList.toggle('is-open'); menuToggle.setAttribute('aria-expanded', String(open)); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('is-open'); menuToggle.setAttribute('aria-expanded', 'false'); }));

const canvas = document.querySelector('#snakeCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const highScoreEl = document.querySelector('#highScore');
const bossHealthEl = document.querySelector('#bossHealth');
const stateEl = document.querySelector('#gameState');
const messageEl = document.querySelector('#gameMessage');
const startButton = document.querySelector('#startButton');
const pauseButton = document.querySelector('#pauseButton');
const restartButton = document.querySelector('#restartButton');
const attackButton = document.querySelector('#attackButton');
const grid = 20;
const cols = canvas.width / grid;
const rows = canvas.height / grid;
let snake, food, demon, direction, nextDirection, score, highScore, bossHealth, running, paused, gameOver, timer, attackFlash;

function loadHighScore() { try { return Number(localStorage.getItem('tororo-hero-high-score')) || 0; } catch { return 0; } }
function saveHighScore() { try { localStorage.setItem('tororo-hero-high-score', String(highScore)); } catch { /* storage is optional */ } }
function randomFood() { let next; do { next = { x: 1 + Math.floor(Math.random() * (cols - 2)), y: 1 + Math.floor(Math.random() * (rows - 2)) }; } while (snake.some(segment => segment.x === next.x && segment.y === next.y) || (next.x === demon.x && next.y === demon.y)); return next; }
function resetGame() { clearInterval(timer); timer = null; snake = [{ x: 6, y: 9 }, { x: 5, y: 9 }, { x: 4, y: 9 }]; demon = { x: cols - 5, y: rows - 5 }; food = randomFood(); direction = { x: 1, y: 0, name: 'right' }; nextDirection = direction; score = 0; highScore = loadHighScore(); bossHealth = 10; running = false; paused = false; gameOver = false; attackFlash = 0; updateHud(); draw(); }
function updateHud() { scoreEl.textContent = String(score).padStart(2, '0'); highScoreEl.textContent = String(highScore).padStart(2, '0'); bossHealthEl.textContent = String(bossHealth); stateEl.textContent = paused ? 'PAUSED' : (gameOver ? 'GAME OVER' : (bossHealth === 0 ? 'VICTORY' : (running ? 'RUNNING' : 'READY'))); pauseButton.textContent = paused ? 'RESUME' : 'PAUSE'; }
function draw() { ctx.fillStyle = '#07100d'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = '#10271d'; for (let x = 0; x < cols; x++) { ctx.beginPath(); ctx.moveTo(x * grid, 0); ctx.lineTo(x * grid, canvas.height); ctx.stroke(); } for (let y = 0; y < rows; y++) { ctx.beginPath(); ctx.moveTo(0, y * grid); ctx.lineTo(canvas.width, y * grid); ctx.stroke(); } drawFood(); drawDemon(); snake.forEach((segment, index) => drawHeroSegment(segment, index)); if (attackFlash > 0) { ctx.strokeStyle = '#d7ff8f'; ctx.lineWidth = 3; ctx.strokeRect(snake[0].x * grid - 5, snake[0].y * grid - 5, grid * 2 + 10, grid * 2 + 10); ctx.lineWidth = 1; } }
function drawFood() { ctx.fillStyle = '#ff6589'; ctx.shadowColor = '#ff6589'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.moveTo(food.x * grid + 10, food.y * grid + 3); ctx.lineTo(food.x * grid + 17, food.y * grid + 10); ctx.lineTo(food.x * grid + 10, food.y * grid + 17); ctx.lineTo(food.x * grid + 3, food.y * grid + 10); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0; }
function drawHeroSegment(segment, index) { const x = segment.x * grid + 10; const y = segment.y * grid + 10; ctx.fillStyle = index === 0 ? '#d7ff8f' : '#64d99c'; ctx.beginPath(); ctx.arc(x, y, index === 0 ? 8 : 7, 0, Math.PI * 2); ctx.fill(); if (index === 0) { ctx.fillStyle = '#1b4b38'; ctx.fillRect(x - 5, y - 10, 10, 5); ctx.fillStyle = '#07100d'; ctx.fillRect(x - 4, y - 2, 3, 3); ctx.fillRect(x + 2, y - 2, 3, 3); } }
function drawDemon() { const x = demon.x * grid + 10; const y = demon.y * grid + 10; ctx.fillStyle = '#bb557d'; ctx.beginPath(); ctx.moveTo(x - 10, y + 8); ctx.lineTo(x - 7, y - 8); ctx.lineTo(x - 2, y - 12); ctx.lineTo(x + 2, y - 12); ctx.lineTo(x + 7, y - 8); ctx.lineTo(x + 10, y + 8); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ffcedb'; ctx.fillRect(x - 5, y - 2, 3, 3); ctx.fillRect(x + 2, y - 2, 3, 3); }
function setDirection(name) { const next = { up: { x: 0, y: -1, name }, down: { x: 0, y: 1, name }, left: { x: -1, y: 0, name }, right: { x: 1, y: 0, name } }[name]; const opposite = direction && next && next.x === -direction.x && next.y === -direction.y; if (next && !opposite) nextDirection = next; }
function growSnake() { snake.unshift({ ...snake[0] }); }
function moveSnake() { direction = nextDirection; const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y }; const hitWall = head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows; const hitSelf = snake.some(segment => segment.x === head.x && segment.y === head.y); if (hitWall || hitSelf) return endGame('GAME OVER: 어둠의 벽에 부딪혔습니다.'); snake.unshift(head); if (head.x === food.x && head.y === food.y) { score += 1; growSnake(); food = randomFood(); if (score > highScore) { highScore = score; saveHighScore(); } bossHealth = Math.max(0, 10 - Math.floor(score / 2)); messageEl.textContent = `룬을 먹고 성장했습니다. 마왕 HP: ${bossHealth}`; if (bossHealth === 0) return endGame('VICTORY: 성장한 용사가 마왕의 결계를 무너뜨렸습니다.', true); } else snake.pop(); updateHud(); draw(); }
function attack() { if (!running || paused || gameOver) return; attackFlash = 2; const distance = Math.abs(snake[0].x - demon.x) + Math.abs(snake[0].y - demon.y); if (distance <= 2 && score >= 2) { bossHealth = Math.max(0, bossHealth - 2); messageEl.textContent = bossHealth ? `검격 성공! 마왕 HP: ${bossHealth}` : 'VICTORY: 검격으로 마왕을 물리쳤습니다.'; if (bossHealth === 0) return endGame(messageEl.textContent, true); } else messageEl.textContent = '룬을 2개 이상 모으고 마왕에게 가까이 가세요.'; updateHud(); draw(); }
function tick() { if (!running || paused || gameOver) return; attackFlash = Math.max(0, attackFlash - 1); moveSnake(); }
function endGame(message, victory = false) { clearInterval(timer); timer = null; running = false; gameOver = !victory; bossHealth = victory ? 0 : bossHealth; updateHud(); messageEl.textContent = message; startButton.textContent = victory ? 'PLAY AGAIN ↗' : 'RETRY ↗'; draw(); }
function startGame() { resetGame(); running = true; startButton.textContent = 'RUNNING ↗'; messageEl.textContent = '룬을 먹어 성장하고 마왕을 쓰러뜨리세요.'; updateHud(); timer = setInterval(tick, 140); }
function togglePause() { if (!running || gameOver) return; paused = !paused; messageEl.textContent = paused ? '일시정지 중입니다.' : '다시 전진하세요.'; updateHud(); draw(); }
function restartGame() { startGame(); }
document.addEventListener('keydown', event => { const keys = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' }; if (keys[event.key]) { event.preventDefault(); setDirection(keys[event.key]); } if (event.code === 'Space') { event.preventDefault(); attack(); } if (event.key === 'p' || event.key === 'P') { event.preventDefault(); togglePause(); } });
document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => setDirection(button.dataset.direction)));
attackButton.addEventListener('click', attack); startButton.addEventListener('click', startGame); pauseButton.addEventListener('click', togglePause); restartButton.addEventListener('click', restartGame);
let touchStart = null;
canvas.addEventListener('touchstart', event => { touchStart = event.changedTouches[0]; }, { passive: true });
canvas.addEventListener('touchend', event => { if (!touchStart) return; const touch = event.changedTouches[0]; const dx = touch.clientX - touchStart.clientX; const dy = touch.clientY - touchStart.clientY; if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) setDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); touchStart = null; }, { passive: true });
resetGame();
