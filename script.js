const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
menuToggle.addEventListener('click', () => { const open = nav.classList.toggle('is-open'); menuToggle.setAttribute('aria-expanded', String(open)); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('is-open'); menuToggle.setAttribute('aria-expanded', 'false'); }));

const canvas = document.querySelector('#snakeCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const bossHealthEl = document.querySelector('#bossHealth');
const stateEl = document.querySelector('#gameState');
const messageEl = document.querySelector('#gameMessage');
const startButton = document.querySelector('#startButton');
const grid = 20;
const cols = canvas.width / grid;
const rows = canvas.height / grid;
let snake, rune, direction, queuedDirection, score, bossHealth, running, timer;

function randomRune() { let next; do { next = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) }; } while (snake?.some(segment => segment.x === next.x && segment.y === next.y)); return next; }
function resetGame() { snake = [{ x: 6, y: 9 }, { x: 5, y: 9 }, { x: 4, y: 9 }]; rune = randomRune(); direction = { x: 1, y: 0 }; queuedDirection = direction; score = 0; bossHealth = 10; running = false; updateHud(); draw(); }
function updateHud() { scoreEl.textContent = String(score).padStart(2, '0'); bossHealthEl.textContent = String(bossHealth); stateEl.textContent = running ? 'RUNNING' : (bossHealth === 0 ? 'VICTORY' : 'READY'); }
function draw() { ctx.fillStyle = '#07100d'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = '#10271d'; for (let x = 0; x < cols; x++) { ctx.beginPath(); ctx.moveTo(x * grid, 0); ctx.lineTo(x * grid, canvas.height); ctx.stroke(); } for (let y = 0; y < rows; y++) { ctx.beginPath(); ctx.moveTo(0, y * grid); ctx.lineTo(canvas.width, y * grid); ctx.stroke(); } if (rune) { ctx.fillStyle = '#ff6589'; ctx.shadowColor = '#ff6589'; ctx.shadowBlur = 16; ctx.fillRect(rune.x * grid + 5, rune.y * grid + 5, grid - 10, grid - 10); ctx.shadowBlur = 0; } snake?.forEach((segment, index) => { ctx.fillStyle = index === 0 ? '#d7ff8f' : '#64d99c'; ctx.fillRect(segment.x * grid + 2, segment.y * grid + 2, grid - 4, grid - 4); if (index === 0) { ctx.fillStyle = '#07100d'; ctx.fillRect(segment.x * grid + 6, segment.y * grid + 6, 3, 3); ctx.fillRect(segment.x * grid + 12, segment.y * grid + 6, 3, 3); } }); }
function setDirection(name) { const next = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }[name]; if (next && !(next.x === -direction.x && next.y === -direction.y)) queuedDirection = next; }
function step() { direction = queuedDirection; const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y }; const hitWall = head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows; const hitSelf = snake.some(segment => segment.x === head.x && segment.y === head.y); if (hitWall || hitSelf) return finish(false, '용사가 어둠에 삼켜졌습니다. 다시 시작하세요.'); snake.unshift(head); if (head.x === rune.x && head.y === rune.y) { score += 1; bossHealth = Math.max(0, 10 - score); if (!bossHealth) return finish(true, '마왕의 힘이 사라졌습니다. 왕국을 구했습니다!'); rune = randomRune(); messageEl.textContent = `룬을 획득했습니다. 마왕 HP가 ${bossHealth} 남았습니다.`; } else snake.pop(); updateHud(); draw(); }
function finish(victory, message) { running = false; clearInterval(timer); updateHud(); messageEl.textContent = message; startButton.textContent = victory ? 'PLAY AGAIN ↗' : 'RETRY ↗'; draw(); }
function startGame() { resetGame(); running = true; startButton.textContent = 'RESTART GAME ↗'; messageEl.textContent = '룬을 모아 마왕을 쓰러뜨리세요.'; updateHud(); timer = setInterval(step, 125); }
document.addEventListener('keydown', event => { const keys = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' }; if (keys[event.key]) { event.preventDefault(); setDirection(keys[event.key]); } });
document.querySelectorAll('[data-direction]').forEach(button => { button.addEventListener('click', () => setDirection(button.dataset.direction)); });
let touchStart = null;
canvas.addEventListener('touchstart', event => { touchStart = event.changedTouches[0]; }, { passive: true });
canvas.addEventListener('touchend', event => { if (!touchStart) return; const touch = event.changedTouches[0]; const dx = touch.clientX - touchStart.clientX; const dy = touch.clientY - touchStart.clientY; if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) setDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); touchStart = null; }, { passive: true });
startButton.addEventListener('click', startGame);
resetGame();
