/**
 * Snake Game — Dev Projects Page
 *
 * Floating "Play Snake" button opens full-screen overlay with canvas game.
 * Classic snake: arrow/WASD, eat food, avoid walls and body. Colours from dp- tokens;
 * theme changes mid-game re-read tokens. Respects prefers-reduced-motion for decorative effects only.
 */
(function () {
  'use strict';

  var snakeIcon = '<svg class="dp-snake-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 483 650" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M214.372 0.4565C213.822 0.6705 206.515 1.5205 198.134 2.3445C183.21 3.8105 169.348 6.0205 163.372 7.8845C161.722 8.3995 158.122 9.3015 155.372 9.8895C134.15 14.4295 99.6392 29.6595 80.3722 42.9865C54.8442 60.6445 33.8302 82.9585 21.9802 104.992C3.11819 140.062 -1.25681 184.571 9.91219 227.758C23.9142 281.898 62.7022 318.757 128.872 340.805C151.615 348.382 181.868 354.968 223.872 361.486C229.097 362.296 234.047 363.162 234.872 363.411C235.697 363.66 240.872 364.522 246.372 365.326C266.55 368.275 290.692 373.16 315.752 379.366C322.753 381.099 331.699 383.96 336.372 385.961C366.919 399.041 382.018 411.917 389.671 431.408C393.994 442.418 395.341 451.546 395.351 469.908C395.359 485.247 395.078 488.361 393.071 495.132C388.51 510.521 382.722 520.711 372.173 531.925C347.06 558.621 310.538 573.231 259.372 577.051C244.797 578.139 209.415 577.467 197.872 575.884C184.514 574.052 177.176 572.837 170.372 571.332C105.307 556.944 58.0372 535.839 13.1372 501.131C2.89419 493.214 0.522187 493.051 0.0641869 500.236C-0.262813 505.356 0.0161877 505.861 17.2272 531.407C25.0322 542.993 37.3762 557.536 50.8092 570.975C64.7842 584.954 72.5372 591.501 86.3722 601.002C90.7722 604.024 96.6222 608.075 99.3722 610.005C105.743 614.475 117.918 620.963 124.372 623.328C127.122 624.336 130.722 625.775 132.372 626.526C136.911 628.591 163.305 637.746 172.372 640.4C195.372 647.133 213.763 649.907 235.397 649.907C250.331 649.907 287.696 646.934 297.372 644.976C334.049 637.554 352.037 631.549 378.061 618.04C401.074 606.094 415.092 595.931 431.893 579.014C447.956 562.84 459.331 546.39 467.233 527.907C468.762 524.332 470.417 520.507 470.913 519.407C472.088 516.798 475.299 506.908 477.309 499.705C479.821 490.701 482.85 469.185 482.861 460.253C482.871 452.91 480.753 429.86 479.246 420.908C478.527 416.641 474.5 401.9 472.542 396.375C454.104 344.323 399.894 309.132 310.872 291.427C306.747 290.606 300.222 289.231 296.372 288.372C289.206 286.773 274.885 284.162 255.372 280.897C235.914 277.641 226.667 275.978 224.872 275.408C223.908 275.102 219.351 274.193 214.746 273.388C199.381 270.702 190.409 268.984 186.372 267.956C184.172 267.396 178.322 265.992 173.372 264.836C157.368 261.099 142.998 255.477 129.372 247.626C120.084 242.274 113.976 237.098 108.094 229.595C102.057 221.895 99.8512 218.033 97.1312 210.408C91.7472 195.311 91.4402 193.321 91.4332 173.408C91.4272 155.404 91.5682 153.988 94.1242 146.408C98.2892 134.056 104.881 123.769 115.27 113.406C135.5 93.2265 160.82 81.3575 197.372 74.9165C220.133 70.9065 281.745 71.2055 289.79 75.3655C293.725 77.4005 295.296 80.6735 296.766 89.9075C299.272 105.639 304.404 115.502 315.522 125.958C327.676 137.388 338.125 141.349 366.872 145.421C372.647 146.239 382.322 147.616 388.372 148.482C394.422 149.348 400.369 150.698 401.588 151.482C402.806 152.266 405.921 156.171 408.509 160.159C414.269 169.033 427.93 187.149 432.45 191.908C439.087 198.895 440.081 206.015 436.279 219.34C433.624 228.646 435.221 233.908 440.701 233.908C444.856 233.908 446.536 230.822 447.294 221.799C447.682 217.184 448.51 211.658 449.135 209.521L450.27 205.637L458.821 206.257C463.524 206.598 468.726 207.271 470.381 207.753C473.585 208.687 477.779 207.652 479.078 205.607C480.275 203.724 480.001 199.253 478.622 198.174C476.531 196.538 472.86 195.867 461.333 195.01C455.126 194.548 449.284 193.58 447.986 192.798C446.716 192.034 442.586 187.133 438.809 181.908C435.031 176.683 427.65 166.813 422.406 159.975C417.162 153.137 412.886 147.287 412.904 146.975C412.983 145.551 415.949 125.115 417.847 112.908C419.002 105.483 420.427 96.2575 421.014 92.4075C426.774 54.6485 404.32 24.6035 361.467 12.7285C335.859 5.6315 281.035 -0.1065 239.872 0.00149996C226.397 0.0365 214.922 0.2415 214.372 0.4565Z"/></svg>';
  var closeIcon = '<svg class="dp-snake-close-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  var overlay = null;
  var closeButton = null;
  var canvas = null;
  var playButton = null;
  var boundResizeHandler = null;
  var overlayClosing = false;

  // --- Game state (all private) ---
  var animId = null;
  var themeObserver = null;
  var resizeTimeout = null;
  var CELL_SIZE = 40;
  var BASE_TICK_MS = 125;   // ~8 moves/sec
  var MIN_TICK_MS = 67;     // ~15 moves/sec cap
  var SPEED_INCREASE_PER_5 = 10; // ms faster every 5 points

  var state = {
    snake: [],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 0, y: 0 },
    score: 0,
    cols: 0,
    rows: 0,
    offsetX: 0,
    offsetY: 0,
    lastTick: 0,
    gameOver: false,
    colors: {}
  };

  var TOKEN_KEYS = [
    '--dp-accent',
    '--dp-accent-hover',
    '--dp-snake-icon-hover',
    '--dp-text-primary',
    '--dp-text-secondary',
    '--dp-text-tertiary',
    '--dp-glow-1',
    '--dp-border-divider',
    '--dp-space-8',
    '--dp-space-4'
  ];

  function getToken(name) {
    if (!document.documentElement) return '';
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function isDark() {
    return (document.documentElement.getAttribute('data-theme') || 'dark') !== 'light';
  }

  function readColors() {
    for (var i = 0; i < TOKEN_KEYS.length; i++) {
      state.colors[TOKEN_KEYS[i]] = getToken(TOKEN_KEYS[i]);
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function getOverlayDuration() {
    return prefersReducedMotion() ? '0ms' : 'var(--dp-duration-slow)';
  }

  function trapFocus(e) {
    if (e.key !== 'Tab' || !overlay || !overlay.contains(document.activeElement)) return;
    var focusable = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function handleEscape(e) {
    if (e.key === 'Escape' && overlay) {
      closeOverlay();
    }
  }

  // --- Game: grid & geometry ---
  function updateGrid() {
    if (!canvas) return;
    var w = canvas.width;
    var h = canvas.height;
    state.cols = Math.floor(w / CELL_SIZE);
    state.rows = Math.floor(h / CELL_SIZE);
    state.offsetX = (w - state.cols * CELL_SIZE) / 2;
    state.offsetY = (h - state.rows * CELL_SIZE) / 2;
  }

  function gridToPixel(x, y) {
    return {
      x: state.offsetX + x * CELL_SIZE,
      y: state.offsetY + y * CELL_SIZE
    };
  }

  function initSnake() {
    var cx = Math.floor(state.cols / 2);
    var cy = Math.floor(state.rows / 2);
    state.snake = [
      { x: cx - 2, y: cy },
      { x: cx - 1, y: cy },
      { x: cx, y: cy }
    ];
    state.dir = { x: 1, y: 0 };
    state.nextDir = { x: 1, y: 0 };
    state.score = 0;
    state.gameOver = false;
  }

  function spawnFood() {
    var list = [];
    for (var y = 0; y < state.rows; y++) {
      for (var x = 0; x < state.cols; x++) {
        var occupied = false;
        for (var i = 0; i < state.snake.length; i++) {
          if (state.snake[i].x === x && state.snake[i].y === y) {
            occupied = true;
            break;
          }
        }
        if (!occupied) list.push({ x: x, y: y });
      }
    }
    if (list.length === 0) return;
    var cell = list[Math.floor(Math.random() * list.length)];
    state.food.x = cell.x;
    state.food.y = cell.y;
  }

  function getTickMs() {
    var steps = Math.floor(state.score / 5);
    return Math.max(MIN_TICK_MS, BASE_TICK_MS - steps * SPEED_INCREASE_PER_5);
  }

  function die() {
    state.gameOver = true;
  }

  function tick() {
    if (state.gameOver || !canvas) return;

    state.dir.x = state.nextDir.x;
    state.dir.y = state.nextDir.y;

    var head = state.snake[state.snake.length - 1];
    var nx = head.x + state.dir.x;
    var ny = head.y + state.dir.y;
    nx = (nx + state.cols) % state.cols;
    ny = (ny + state.rows) % state.rows;

    for (var i = 0; i < state.snake.length; i++) {
      if (state.snake[i].x === nx && state.snake[i].y === ny) {
        die();
        return;
      }
    }

    state.snake.push({ x: nx, y: ny });

    if (nx === state.food.x && ny === state.food.y) {
      state.score++;
      spawnFood();
    } else {
      state.snake.shift();
    }
  }

  function drawSegment(ctx, x, y, isHead) {
    var p = gridToPixel(x, y);
    var size = CELL_SIZE - 2;
    var r = 8;
    var px = p.x + 1;
    var py = p.y + 1;
    var color = state.colors['--dp-snake-icon-hover'] || (isDark() ? '#4ade80' : '#22c55e');
    ctx.globalAlpha = isHead ? 1 : 0.7;
    ctx.fillStyle = color;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(px, py, size, size, r);
      ctx.fill();
    } else {
      ctx.fillRect(px, py, size, size);
    }
    ctx.globalAlpha = 1;
  }

  function drawFood(ctx, now) {
    var p = gridToPixel(state.food.x, state.food.y);
    var cx = p.x + CELL_SIZE / 2;
    var cy = p.y + CELL_SIZE / 2;
    var radius = CELL_SIZE * 0.35;
    var color = state.colors['--dp-text-primary'] || (isDark() ? '#E8E9ED' : '#1A1D23');
    ctx.fillStyle = color;
    if (!prefersReducedMotion()) {
      var pulse = 4 + 3 * Math.sin(now / 300);
      ctx.shadowBlur = pulse * 4;
      ctx.shadowColor = color;
    }
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }

  function drawGrid(ctx) {
    var div = state.colors['--dp-border-divider'] || (isDark() ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)');
    ctx.strokeStyle = div;
    ctx.lineWidth = 1;
    for (var x = 0; x <= state.cols; x++) {
      var sx = state.offsetX + x * CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(sx, state.offsetY);
      ctx.lineTo(sx, state.offsetY + state.rows * CELL_SIZE);
      ctx.stroke();
    }
    for (var y = 0; y <= state.rows; y++) {
      var sy = state.offsetY + y * CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(state.offsetX, sy);
      ctx.lineTo(state.offsetX + state.cols * CELL_SIZE, sy);
      ctx.stroke();
    }
  }

  function drawScore(ctx) {
    var space8 = state.colors['--dp-space-8'] || '32px';
    var top = parseInt(space8, 10) || 32;
    var color = state.colors['--dp-text-secondary'] || (isDark() ? '#95A2B3' : '#4B5060');
    ctx.font = '500 14px Inter, system-ui, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText('Score: ' + state.score, canvas.width / 2, top);
  }

  function drawGameOver(ctx) {
    var w = canvas.width;
    var h = canvas.height;
    var space4 = state.colors['--dp-space-4'] || '16px';
    var gap = parseInt(space4, 10) || 16;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '600 24px Inter, system-ui, sans-serif';
    ctx.fillStyle = state.colors['--dp-text-primary'] || (isDark() ? '#F7F8F8' : '#1A1D23');
    ctx.fillText('Game Over', w / 2, h / 2 - gap - 12);

    ctx.font = '400 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = state.colors['--dp-text-secondary'] || (isDark() ? '#95A2B3' : '#4B5060');
    ctx.fillText('Score: ' + state.score, w / 2, h / 2);

    ctx.font = '400 14px Inter, system-ui, sans-serif';
    ctx.fillStyle = state.colors['--dp-text-tertiary'] || (isDark() ? 'rgba(255,255,255,0.64)' : 'rgba(0,0,0,0.75)');
    ctx.fillText('Space to restart', w / 2, h / 2 + 8 + gap + 7);
  }

  function draw(now) {
    if (!canvas || !overlay) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx);
    for (var i = 0; i < state.snake.length; i++) {
      drawSegment(ctx, state.snake[i].x, state.snake[i].y, i === state.snake.length - 1);
    }
    drawFood(ctx, now);
    drawScore(ctx);

    if (state.gameOver) {
      drawGameOver(ctx);
    }
  }

  function gameLoop(now) {
    if (!overlay || !canvas) return;
    animId = requestAnimationFrame(gameLoop);

    if (state.gameOver) {
      draw(now);
      return;
    }

    var tickMs = getTickMs();
    if (now - state.lastTick >= tickMs) {
      state.lastTick = now;
      tick();
    }
    draw(now);
  }

  function startGame() {
    if (!canvas) return;
    stopGame();
    readColors();
    updateGrid();
    if (state.cols < 3 || state.rows < 3) return;
    initSnake();
    spawnFood();
    state.lastTick = performance.now();
    document.addEventListener('keydown', handleGameKey);
    animId = requestAnimationFrame(gameLoop);
  }

  function stopGame() {
    if (animId != null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    document.removeEventListener('keydown', handleGameKey);
    state.snake = [];
    state.gameOver = true;
    state.cols = 0;
    state.rows = 0;
    state.offsetX = 0;
    state.offsetY = 0;
    state.colors = {};
  }

  function handleGameKey(e) {
    if (!overlay || !canvas) return;

    if (state.gameOver) {
      if (e.key === ' ') {
        e.preventDefault();
        startGame();
      }
      return;
    }

    var next = { x: state.nextDir.x, y: state.nextDir.y };
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') next = { x: -1, y: 0 };
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') next = { x: 1, y: 0 };
    else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') next = { x: 0, y: -1 };
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') next = { x: 0, y: 1 };
    else return;

    e.preventDefault();
    if (next.x === -state.dir.x && next.y === -state.dir.y) return;
    state.nextDir = next;
  }

  function onResize() {
    if (!canvas || !overlay) return;
    canvas.setAttribute('width', String(window.innerWidth));
    canvas.setAttribute('height', String(window.innerHeight));
    updateGrid();
    var head = state.snake[state.snake.length - 1];
    if (head && (head.x < 0 || head.x >= state.cols || head.y < 0 || head.y >= state.rows)) {
      die();
      return;
    }
    if (state.food.x < 0 || state.food.x >= state.cols || state.food.y < 0 || state.food.y >= state.rows) {
      spawnFood();
    }
  }

  function openOverlay() {
    overlayClosing = false;
    overlay = document.createElement('div');
    overlay.className = 'dp-snake-overlay';
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Snake game');

    var duration = getOverlayDuration();
    overlay.style.transition = 'opacity ' + duration + ' var(--dp-ease-out)';
    overlay.style.opacity = '0';

    canvas = document.createElement('canvas');
    canvas.setAttribute('width', String(window.innerWidth));
    canvas.setAttribute('height', String(window.innerHeight));
    canvas.className = 'dp-snake-canvas';

    closeButton = document.createElement('button');
    closeButton.className = 'dp-snake-toggle dp-snake-toggle--in-overlay';
    closeButton.setAttribute('type', 'button');
    closeButton.setAttribute('aria-label', 'Close Snake');
    closeButton.innerHTML = closeIcon;

    overlay.appendChild(canvas);
    overlay.appendChild(closeButton);
    document.body.appendChild(overlay);

    document.body.classList.add('dp-overlay-active');
    if (playButton) playButton.hidden = true;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.style.opacity = '1';
      });
    });

    closeButton.addEventListener('click', closeOverlay);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', trapFocus);

    closeButton.focus();

    if (prefersReducedMotion()) {
      startGame();
    } else {
      overlay.addEventListener('transitionend', function openDone() {
        overlay.removeEventListener('transitionend', openDone);
        if (!overlayClosing && overlay && canvas) startGame();
      });
    }

    themeObserver = new MutationObserver(function () {
      readColors();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    boundResizeHandler = function () {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(onResize, 150);
    };
    window.addEventListener('resize', boundResizeHandler);
  }

  function closeOverlay() {
    if (!overlay) return;
    overlayClosing = true;
    stopGame();
    if (themeObserver) {
      themeObserver.disconnect();
      themeObserver = null;
    }
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
      resizeTimeout = null;
    }
    if (boundResizeHandler) {
      window.removeEventListener('resize', boundResizeHandler);
      boundResizeHandler = null;
    }

    var duration = getOverlayDuration();
    overlay.style.opacity = '0';

    function teardown() {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', trapFocus);
      closeButton.removeEventListener('click', closeOverlay);
      overlay.removeEventListener('transitionend', teardown);

      document.body.classList.remove('dp-overlay-active');
      if (playButton) playButton.hidden = false;

      overlay.remove();
      overlay = null;
      closeButton = null;
      canvas = null;
      overlayClosing = false;
    }

    if (prefersReducedMotion()) {
      teardown();
    } else {
      overlay.addEventListener('transitionend', teardown);
    }
  }

  function renderToggle() {
    var btn = document.createElement('button');
    btn.className = 'dp-snake-toggle';
    btn.setAttribute('aria-label', 'Play Snake');
    btn.setAttribute('type', 'button');
    btn.innerHTML = snakeIcon;
    btn.addEventListener('click', openOverlay);
    playButton = btn;
    var container = document.getElementById('dp-nav-actions');
    (container || document.body).appendChild(btn);
  }

  function init() {
    renderToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API — allows external pages (e.g. 404) to open the game
  window.SnakeGame = { open: openOverlay };
})();
