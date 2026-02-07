/**
 * Strip Effects — cursor-reactive orbs on .dp-strip
 *
 * Ambient drift + opacity pulse when in view; cursor nudge when mouse over.
 * Touch / reduced-motion: orbs use CSS keyframe drift only.
 */

var LERP_FACTOR = 0.10;
var MAX_CURSOR_OFFSET_PX = 50;
var rafId = null;
var strip = null;
var cursorX = 0;
var cursorY = 0;
var targetCursorX = 0;
var targetCursorY = 0;
var isInside = false;
var isInView = false;

/* Ambient drift: Lissajous-style per orb (amplitude px, period ms, phase rad) */
var DRIFT_1 = { amp: 25, periodX: 12000, periodY: 14000, phaseX: 0, phaseY: 0.7 };
var DRIFT_2 = { amp: 22, periodX: 15000, periodY: 11000, phaseX: 1.2, phaseY: 0.3 };

/* Opacity pulse: cycle ms. Sine 0..1 then map to range relative to token */
var PULSE_PERIOD_1 = 8000;
var PULSE_PERIOD_2 = 12000;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getBaseOpacity() {
  if (!strip) return 0.4;
  var v = getComputedStyle(strip).getPropertyValue('--dp-strip-orb-opacity').trim();
  return parseFloat(v) || 0.4;
}

function tick(timestamp) {
  if (!strip || !isInView) {
    rafId = null;
    return;
  }
  timestamp = timestamp || 0;
  var t = timestamp * 0.001;

  cursorX = lerp(cursorX, targetCursorX, LERP_FACTOR);
  cursorY = lerp(cursorY, targetCursorY, LERP_FACTOR);

  var d1 = DRIFT_1;
  var d2 = DRIFT_2;
  var driftX1 = d1.amp * Math.sin((t * 2 * Math.PI * 1000) / d1.periodX + d1.phaseX);
  var driftY1 = d1.amp * Math.sin((t * 2 * Math.PI * 1000) / d1.periodY + d1.phaseY);
  var driftX2 = d2.amp * Math.sin((t * 2 * Math.PI * 1000) / d2.periodX + d2.phaseX);
  var driftY2 = d2.amp * Math.sin((t * 2 * Math.PI * 1000) / d2.periodY + d2.phaseY);

  var finalX1 = driftX1 + cursorX;
  var finalY1 = driftY1 + cursorY;
  var finalX2 = driftX2 + cursorX;
  var finalY2 = driftY2 + cursorY;

  strip.style.setProperty('--dp-orb-x-1', finalX1.toFixed(2) + 'px');
  strip.style.setProperty('--dp-orb-y-1', finalY1.toFixed(2) + 'px');
  strip.style.setProperty('--dp-orb-x-2', finalX2.toFixed(2) + 'px');
  strip.style.setProperty('--dp-orb-y-2', finalY2.toFixed(2) + 'px');

  var baseOpacity = getBaseOpacity();
  var sine1 = Math.sin((t * 2 * Math.PI * 1000) / PULSE_PERIOD_1) * 0.5 + 0.5;
  var sine2 = Math.sin((t * 2 * Math.PI * 1000) / PULSE_PERIOD_2) * 0.5 + 0.5;
  var pulse1 = (0.25 + 0.3 * sine1) * (baseOpacity / 0.4);
  var pulse2 = (0.25 + 0.3 * sine2) * (baseOpacity / 0.4);
  strip.style.setProperty('--dp-orb-pulse-1', String(pulse1.toFixed(3)));
  strip.style.setProperty('--dp-orb-pulse-2', String(pulse2.toFixed(3)));

  rafId = requestAnimationFrame(tick);
}

function startLoop() {
  if (rafId == null && strip && isInView) {
    rafId = requestAnimationFrame(tick);
  }
}

function stopLoop() {
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function onMouseMove(e) {
  if (!strip || e.touches !== undefined) return;
  var rect = strip.getBoundingClientRect();
  var x = (e.clientX - rect.left) / rect.width;
  var y = (e.clientY - rect.top) / rect.height;
  x = Math.max(0, Math.min(1, x));
  y = Math.max(0, Math.min(1, y));
  targetCursorX = (x - 0.5) * 2 * MAX_CURSOR_OFFSET_PX;
  targetCursorY = (y - 0.5) * 2 * MAX_CURSOR_OFFSET_PX;
}

function onMouseEnter(e) {
  if (e.touches !== undefined) return;
  isInside = true;
  onMouseMove(e);
}

function onMouseLeave(e) {
  if (e.touches !== undefined) return;
  isInside = false;
  targetCursorX = 0;
  targetCursorY = 0;
}

function onIntersect(entries) {
  var entry = entries[0];
  if (!entry) return;
  isInView = entry.isIntersecting;
  if (!isInView) {
    targetCursorX = 0;
    targetCursorY = 0;
    stopLoop();
    if (strip) {
      strip.style.setProperty('--dp-orb-x-1', '0px');
      strip.style.setProperty('--dp-orb-y-1', '0px');
      strip.style.setProperty('--dp-orb-x-2', '0px');
      strip.style.setProperty('--dp-orb-y-2', '0px');
      strip.style.setProperty('--dp-orb-pulse-1', '');
      strip.style.setProperty('--dp-orb-pulse-2', '');
    }
  } else {
    startLoop();
  }
}

export function initStripEffects(stripSelector) {
  if (stripSelector === undefined) stripSelector = '.dp-strip';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) {
    return;
  }
  strip = document.querySelector(stripSelector);
  if (!strip) return;

  strip.classList.add('dp-strip--interactive');
  cursorX = 0;
  cursorY = 0;
  targetCursorX = 0;
  targetCursorY = 0;
  isInside = false;

  strip.style.setProperty('--dp-orb-x-1', '0px');
  strip.style.setProperty('--dp-orb-y-1', '0px');
  strip.style.setProperty('--dp-orb-x-2', '0px');
  strip.style.setProperty('--dp-orb-y-2', '0px');

  strip.addEventListener('mouseenter', onMouseEnter);
  strip.addEventListener('mousemove', onMouseMove);
  strip.addEventListener('mouseleave', onMouseLeave);

  var io = new IntersectionObserver(onIntersect, { threshold: 0, rootMargin: '0px' });
  io.observe(strip);
  isInView = true;
  startLoop();
}
