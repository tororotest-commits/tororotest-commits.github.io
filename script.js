const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
menuToggle.addEventListener('click', () => { const open = nav.classList.toggle('is-open'); menuToggle.setAttribute('aria-expanded', String(open)); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('is-open'); menuToggle.setAttribute('aria-expanded', 'false'); }));

const canvas = document.querySelector('#heroCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const bossHealthEl = document.querySelector('#bossHealth');
const stateEl = document.querySelector('#gameState');
const messageEl = document.querySelector('#gameMessage');
const startButton = document.querySelector('#startButton');
const attackButton = document.querySelector('#attackButton');
const grid = 20;
const cols = canvas.width / grid;
const rows = canvas.height / grid;
let hero, demon, crystal, direction, score, bossHealth, running, timer, attackFlash = 0;

function randomPosition() { return { x: 2 + Math.floor(Math.random() * (cols - 4)), y: 2 + Math.floor(Math.random() * (rows - 4)) }; }
function resetGame() { hero = { x: 6, y: 9, facing: 'right' }; demon = { x: cols - 5, y: rows - 9 }; crystal = randomPosition(); direction = { x: 0, y: 0 }; score = 0; bossHealth = 10; running = false; attackFlash = 0; updateHud(); draw(); }
function updateHud() { scoreEl.textContent = String(score).padStart(2, '0'); bossHealthEl.textContent = String(bossHealth); stateEl.textContent = running ? 'RUNNING' : (bossHealth === 0 ? 'VICTORY' : 'READY'); }
function draw() { ctx.fillStyle = '#07100d'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = '#10271d'; for (let x = 0; x < cols; x++) { ctx.beginPath(); ctx.moveTo(x * grid, 0); ctx.lineTo(x * grid, canvas.height); ctx.stroke(); } for (let y = 0; y < rows; y++) { ctx.beginPath(); ctx.moveTo(0, y * grid); ctx.lineTo(canvas.width, y * grid); ctx.stroke(); } drawCrystal(); drawDemon(); drawHero(); if (attackFlash > 0) { ctx.strokeStyle = '#d7ff8f'; ctx.lineWidth = 3; ctx.strokeRect(hero.x * grid - 5, hero.y * grid - 5, grid * 2 + 10, grid * 2 + 10); ctx.lineWidth = 1; } }
function drawCrystal() { ctx.fillStyle = '#ff6589'; ctx.shadowColor = '#ff6589'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.moveTo(crystal.x * grid + 10, crystal.y * grid + 3); ctx.lineTo(crystal.x * grid + 17, crystal.y * grid + 10); ctx.lineTo(crystal.x * grid + 10, crystal.y * grid + 17); ctx.lineTo(crystal.x * grid + 3, crystal.y * grid + 10); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0; }
function drawHero() { const x = hero.x * grid + 10; const y = hero.y * grid + 10; ctx.fillStyle = '#d7ff8f'; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#1b4b38'; ctx.fillRect(x - 5, y - 10, 10, 5); ctx.fillStyle = '#07100d'; ctx.fillRect(x - 4, y - 2, 3, 3); ctx.fillRect(x + 2, y - 2, 3, 3); }
function drawDemon() { const x = demon.x * grid + 10; const y = demon.y * grid + 10; ctx.fillStyle = '#bb557d'; ctx.beginPath(); ctx.moveTo(x - 10, y + 8); ctx.lineTo(x - 7, y - 8); ctx.lineTo(x - 2, y - 12); ctx.lineTo(x + 2, y - 12); ctx.lineTo(x + 7, y - 8); ctx.lineTo(x + 10, y + 8); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ffcedb'; ctx.fillRect(x - 5, y - 2, 3, 3); ctx.fillRect(x + 2, y - 2, 3, 3); }
function setDirection(name) { const next = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }[name]; if (!next) return; direction = next; hero.facing = name; }
function moveHero() { if (!running || (!direction.x && !direction.y)) return; hero.x = Math.max(1, Math.min(cols - 2, hero.x + direction.x)); hero.y = Math.max(1, Math.min(rows - 2, hero.y + direction.y)); if (hero.x === crystal.x && hero.y === crystal.y) { score += 1; crystal = randomPosition(); messageEl.textContent = `마왕의 수정 ${score}/5개를 찾았습니다.`; } updateHud(); draw(); }
function attack() { if (!running) return; attackFlash = 2; const distance = Math.abs(hero.x - demon.x) + Math.abs(hero.y - demon.y); if (distance <= 3) { bossHealth = Math.max(0, bossHealth - 2); messageEl.textContent = bossHealth ? `검격 성공! 마왕 HP가 ${bossHealth} 남았습니다.` : '마왕을 물리쳤습니다. 왕국이 다시 빛납니다!'; if (!bossHealth) return finish(true, messageEl.textContent); } else { messageEl.textContent = '검이 닿지 않습니다. 마왕에게 더 가까이 가세요.'; } updateHud(); draw(); }
function finish(victory, message) { running = false; clearInterval(timer); updateHud(); messageEl.textContent = message; startButton.textContent = victory ? 'PLAY AGAIN ↗' : 'RETRY ↗'; draw(); }
function startGame() { resetGame(); running = true; startButton.textContent = 'RESTART GAME ↗'; messageEl.textContent = '마왕에게 접근해 검으로 공격하세요.'; updateHud(); timer = setInterval(() => { attackFlash = Math.max(0, attackFlash - 1); moveHero(); draw(); }, 140); }
document.addEventListener('keydown', event => { const keys = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' }; if (keys[event.key]) { event.preventDefault(); setDirection(keys[event.key]); } if (event.code === 'Space') { event.preventDefault(); attack(); } });
document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => setDirection(button.dataset.direction)));
attackButton.addEventListener('click', attack);
let touchStart = null;
canvas.addEventListener('touchstart', event => { touchStart = event.changedTouches[0]; }, { passive: true });
canvas.addEventListener('touchend', event => { if (!touchStart) return; const touch = event.changedTouches[0]; const dx = touch.clientX - touchStart.clientX; const dy = touch.clientY - touchStart.clientY; if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) setDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); touchStart = null; }, { passive: true });
startButton.addEventListener('click', startGame);
resetGame();
