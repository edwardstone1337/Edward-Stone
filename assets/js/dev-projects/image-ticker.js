/**
 * Image ticker — JS requestAnimationFrame loop replacing CSS @keyframes.
 *
 * - Left row (.dp-ticker__row--left):  scrolls right-to-left (negative translateX)
 * - Right row (.dp-ticker__row--right): scrolls left-to-right (positive translateX)
 * - Respects prefers-reduced-motion: rAF loop is never started when set; listens for
 *   live changes (e.g. user toggles the OS setting while the page is open)
 *
 * Base speed is derived from the --dp-ticker-speed CSS token (defined in dev-tokens.css)
 * read via getComputedStyle at init time.
 */

var _rafId = null;
var _motionQuery = null;
var _motionChangeListener = null;
var _rows = [];
var _durationS = 50;

export function initImageTicker() {
  var ticker = document.querySelector('.dp-ticker');
  if (!ticker) return;

  // Read base cycle duration from CSS token; fall back to 50 if unparseable
  var raw = getComputedStyle(ticker).getPropertyValue('--dp-ticker-speed').trim();
  _durationS = parseFloat(raw) || 50;

  _motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function buildRows() {
    _rows = [];
    var rowEls = ticker.querySelectorAll('.dp-ticker__row');
    rowEls.forEach(function (row) {
      var track = row.querySelector('.dp-ticker__track');
      if (!track) return;
      var isLeft = row.classList.contains('dp-ticker__row--left');
      var loopDist = track.scrollWidth / 2;
      // Left starts at translateX(0) and moves negatively toward -loopDist.
      // Right starts at translateX(-loopDist) and moves positively toward 0.
      var offset = isLeft ? 0 : -loopDist;
      _rows.push({
        track: track,
        direction: isLeft ? -1 : 1,
        offset: offset,
        loopDist: loopDist,
      });
    });
  }

  function tick() {
    var FPS = 60;
    _rows.forEach(function (row) {
      var baseSpeed = row.loopDist / (_durationS * FPS);
      row.offset += row.direction * baseSpeed;

      // Seamless loop — use additive reset so overshooting at high speed has no jump
      if (row.direction === -1 && row.offset <= -row.loopDist) {
        row.offset += row.loopDist;
      } else if (row.direction === 1 && row.offset >= 0) {
        row.offset -= row.loopDist;
      }

      row.track.style.transform = 'translateX(' + row.offset + 'px)';
    });

    _rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (_motionQuery.matches) return;
    buildRows();
    _rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (_rafId !== null) {
      cancelAnimationFrame(_rafId);
      _rafId = null;
    }
  }

  // Respond to live prefers-reduced-motion changes
  _motionChangeListener = function (e) {
    if (e.matches) {
      stop();
      ticker.classList.add('dp-ticker--reduced');
    } else {
      ticker.classList.remove('dp-ticker--reduced');
      start();
    }
  };
  _motionQuery.addEventListener('change', _motionChangeListener);

  if (_motionQuery.matches) {
    ticker.classList.add('dp-ticker--reduced');
  } else {
    start();
  }
}

export function destroyImageTicker() {
  if (_rafId !== null) {
    cancelAnimationFrame(_rafId);
    _rafId = null;
  }
  if (_motionQuery && _motionChangeListener) {
    _motionQuery.removeEventListener('change', _motionChangeListener);
  }
  _motionChangeListener = null;
  _motionQuery = null;
  _rows = [];
}
