/**
 * Strip Effects — cursor-reactive orbs on .dp-strip
 *
 * Ambient drift + opacity pulse when in view; cursor nudge when mouse over.
 * Touch / reduced-motion: orbs use CSS keyframe drift only.
 *
 * Supports multiple strips: each strip has its own state (cursor, visibility).
 * Single shared RAF updates all visible strips; loops pause when no strip is in view.
 */

var LERP_FACTOR = 0.10;
var MAX_CURSOR_OFFSET_PX = 50;
var rafId = null;

/** @type {Array<{ el: HTMLElement, cursorX: number, cursorY: number, targetCursorX: number, targetCursorY: number, isInside: boolean, isInView: boolean }>} */
var stripInstances = [];
/** @type {Map<Element, { el: HTMLElement, cursorX: number, cursorY: number, targetCursorX: number, targetCursorY: number, isInside: boolean, isInView: boolean }>} */
var stripStateByElement = new Map();

/* Ambient drift: Lissajous-style per orb (amplitude px, period ms, phase rad) */
var DRIFT_1 = { amp: 25, periodX: 12000, periodY: 14000, phaseX: 0, phaseY: 0.7 };
var DRIFT_2 = { amp: 22, periodX: 15000, periodY: 11000, phaseX: 1.2, phaseY: 0.3 };

/* Opacity pulse: cycle ms. Sine 0..1 then map to range relative to token */
var PULSE_PERIOD_1 = 8000;
var PULSE_PERIOD_2 = 12000;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getBaseOpacity(stripEl) {
  if (!stripEl) return 0.4;
  var v = getComputedStyle(stripEl).getPropertyValue('--dp-strip-orb-opacity').trim();
  return parseFloat(v) || 0.4;
}

function tick(timestamp) {
  timestamp = timestamp || 0;
  var t = timestamp * 0.001;

  for (var i = 0; i < stripInstances.length; i++) {
    var state = stripInstances[i];
    if (!state.isInView) continue;

    state.cursorX = lerp(state.cursorX, state.targetCursorX, LERP_FACTOR);
    state.cursorY = lerp(state.cursorY, state.targetCursorY, LERP_FACTOR);

    var d1 = DRIFT_1;
    var d2 = DRIFT_2;
    var driftX1 = d1.amp * Math.sin((t * 2 * Math.PI * 1000) / d1.periodX + d1.phaseX);
    var driftY1 = d1.amp * Math.sin((t * 2 * Math.PI * 1000) / d1.periodY + d1.phaseY);
    var driftX2 = d2.amp * Math.sin((t * 2 * Math.PI * 1000) / d2.periodX + d2.phaseX);
    var driftY2 = d2.amp * Math.sin((t * 2 * Math.PI * 1000) / d2.periodY + d2.phaseY);

    var finalX1 = driftX1 + state.cursorX;
    var finalY1 = driftY1 + state.cursorY;
    var finalX2 = driftX2 + state.cursorX;
    var finalY2 = driftY2 + state.cursorY;

    state.el.style.setProperty('--dp-orb-x-1', finalX1.toFixed(2) + 'px');
    state.el.style.setProperty('--dp-orb-y-1', finalY1.toFixed(2) + 'px');
    state.el.style.setProperty('--dp-orb-x-2', finalX2.toFixed(2) + 'px');
    state.el.style.setProperty('--dp-orb-y-2', finalY2.toFixed(2) + 'px');

    var baseOpacity = getBaseOpacity(state.el);
    var sine1 = Math.sin((t * 2 * Math.PI * 1000) / PULSE_PERIOD_1) * 0.5 + 0.5;
    var sine2 = Math.sin((t * 2 * Math.PI * 1000) / PULSE_PERIOD_2) * 0.5 + 0.5;
    var pulse1 = (0.25 + 0.3 * sine1) * (baseOpacity / 0.4);
    var pulse2 = (0.25 + 0.3 * sine2) * (baseOpacity / 0.4);
    state.el.style.setProperty('--dp-orb-pulse-1', String(pulse1.toFixed(3)));
    state.el.style.setProperty('--dp-orb-pulse-2', String(pulse2.toFixed(3)));
  }

  rafId = null;
  if (stripInstances.some(function (s) { return s.isInView; })) {
    rafId = requestAnimationFrame(tick);
  }
}

function startLoop() {
  if (rafId == null && stripInstances.some(function (s) { return s.isInView; })) {
    rafId = requestAnimationFrame(tick);
  }
}

function clearStripStyles(stripEl) {
  if (!stripEl) return;
  stripEl.style.setProperty('--dp-orb-x-1', '0px');
  stripEl.style.setProperty('--dp-orb-y-1', '0px');
  stripEl.style.setProperty('--dp-orb-x-2', '0px');
  stripEl.style.setProperty('--dp-orb-y-2', '0px');
  stripEl.style.setProperty('--dp-orb-pulse-1', '');
  stripEl.style.setProperty('--dp-orb-pulse-2', '');
}

function onIntersect(entries) {
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var state = stripStateByElement.get(entry.target);
    if (!state) continue;

    state.isInView = entry.isIntersecting;

    if (!entry.isIntersecting) {
      state.targetCursorX = 0;
      state.targetCursorY = 0;
      state.el.classList.remove('dp-strip--interactive');
      clearStripStyles(state.el);
    } else {
      state.el.classList.add('dp-strip--interactive');
      startLoop();
    }
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

  var strips = document.querySelectorAll(stripSelector);
  if (!strips.length) return;

  var io = new IntersectionObserver(onIntersect, { threshold: 0, rootMargin: '0px' });

  for (var i = 0; i < strips.length; i++) {
    var el = strips[i];
    var state = {
      el: el,
      cursorX: 0,
      cursorY: 0,
      targetCursorX: 0,
      targetCursorY: 0,
      isInside: false,
      isInView: false
    };
    stripInstances.push(state);
    stripStateByElement.set(el, state);

    clearStripStyles(el);

    el.addEventListener('mouseenter', function (e) {
      if (e.touches !== undefined) return;
      var s = stripStateByElement.get(e.currentTarget);
      if (!s) return;
      s.isInside = true;
      onMouseMoveForState(s, e);
    });
    el.addEventListener('mousemove', function (e) {
      if (e.touches !== undefined) return;
      var s = stripStateByElement.get(e.currentTarget);
      if (!s) return;
      onMouseMoveForState(s, e);
    });
    el.addEventListener('mouseleave', function (e) {
      if (e.touches !== undefined) return;
      var s = stripStateByElement.get(e.currentTarget);
      if (!s) return;
      s.isInside = false;
      s.targetCursorX = 0;
      s.targetCursorY = 0;
    });

    io.observe(el);
  }
}

function onMouseMoveForState(state, e) {
  if (!state || !state.el || e.touches !== undefined) return;
  var rect = state.el.getBoundingClientRect();
  var x = (e.clientX - rect.left) / rect.width;
  var y = (e.clientY - rect.top) / rect.height;
  x = Math.max(0, Math.min(1, x));
  y = Math.max(0, Math.min(1, y));
  state.targetCursorX = (x - 0.5) * 2 * MAX_CURSOR_OFFSET_PX;
  state.targetCursorY = (y - 0.5) * 2 * MAX_CURSOR_OFFSET_PX;
}
