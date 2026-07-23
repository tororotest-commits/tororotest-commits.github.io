$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$html = Get-Content -Raw (Join-Path $root 'index.html')
$css = Get-Content -Raw (Join-Path $root 'styles.css')
$js = Get-Content -Raw (Join-Path $root 'script.js')

if ($html -notlike '*Games*') { throw 'Games 메뉴가 없습니다.' }
if ($html -notlike '*snakeCanvas*') { throw '게임 캔버스가 없습니다.' }
if ($html -notlike '*사람 확인 필요*') { throw '프로필 확인 표시가 없습니다.' }
if ($html -notlike '*touch-controls*') { throw '모바일 터치 컨트롤이 없습니다.' }
if ($css -notlike '*@media*') { throw '반응형 CSS가 없습니다.' }
if ($js -notlike '*keydown*') { throw '키보드 입력 처리가 없습니다.' }
if ($js -notlike '*touchstart*') { throw '터치 입력 처리가 없습니다.' }
if ($js -notlike '*bossHealth*') { throw '마왕 상태가 없습니다.' }

Write-Output 'verify-site: PASS'
