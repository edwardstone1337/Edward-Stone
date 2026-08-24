/**
 * Floating Testimonials
 *
 * Drifts short quotes up through the empty gutters either side of a centred
 * element, fading in and out as they rise. Built for the homepage flagship,
 * where the Planner prototype on its own only reads as "a kanban board" —
 * the quotes are what say why it mattered to the people who used it.
 *
 * Deliberately decorative:
 *   - `pointer-events: none` throughout, so it can never steal a click from
 *     the interactive prototype it sits beside.
 *   - `aria-hidden` on the layer, so a screen reader is not read twenty-odd
 *     quotes it did not ask for. The same testimonials are real content on
 *     case-studies/planner.html, which the page links to.
 *   - Returns null and renders nothing under `prefers-reduced-motion`.
 *   - Animates transform and opacity only (no layout-triggering properties).
 *
 * Width handling: the layer spans the viewport, measured with
 * `documentElement.clientWidth` rather than `100vw`. `100vw` includes the
 * scrollbar, which would push the page into horizontal scroll.
 *
 * Usage:
 *   import { initFloatingTestimonials, PLANNER_TEACHER_QUOTES } from './floating-testimonials.js';
 *   initFloatingTestimonials({ stage, quotes: PLANNER_TEACHER_QUOTES });
 */

/** Real teacher quotes, taken from the wall of love on case-studies/planner.html.
 *  Only the short ones: a gutter bubble is ~200px wide, so anything longer
 *  becomes a wall of text nobody reads while it drifts past. */
export const PLANNER_TEACHER_QUOTES = [
  'Love it!',
  "It's awesome",
  'Love the planner.',
  'Love it thank you',
  'planner is helpful!',
  'It s so easy to use',
  'Love it..set out well',
  'Easy and efficient interface.',
  'it makes my planning very easy',
  'This is brilliant, I love this feature!',
  'I find the planner a very useful resource to plan.',
  'Very efficient for retrieving current learning materials.',
  'Love the planner. I can find my subjects really easy this way',
  'I find the planner really useful for my overall termly and yearly planning.',
  'Loving the easy access to the planned modules. This was a really great idea.',
];

/** Bubbles hug their text (`width: max-content` in CSS), so these bound the
 *  cap rather than the actual width — a short quote stays a small pill. */
const MIN_BUBBLE_WIDTH = 130;
const MAX_BUBBLE_WIDTH = 260;

/** How far a bubble may overlap the centred element. At 1440 the gutter alone
 *  is only 144px, which is too narrow to read; letting it reach inward a
 *  little buys legibility and sells the "drifting past" feel.
 *
 *  This is a balance, not a free parameter. Larger values keep the effect
 *  alive on narrower laptops but push the bubbles further over the board.
 *  Above ~1700 the gutter is wide enough that bubbles clear the board
 *  entirely and the overlap stops applying at all. */
const OVERLAP = 28;

/** Random horizontal offset per bubble, inward from the anchor. Without it
 *  every bubble shares one x and the effect reads as two tidy columns. */
const MAX_JITTER = 44;

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * @param {Object} config
 * @param {HTMLElement} config.stage    Centred element to drift quotes beside. Gets position:relative.
 * @param {string[]}    config.quotes   Quote strings. Rendered as text, never as HTML.
 * @param {number}      [config.intervalMs=2400]  Gap between spawns.
 * @returns {{destroy: function}|null}  null when the effect does not apply.
 */
export function initFloatingTestimonials(config) {
  const { stage, quotes, intervalMs = 2400 } = config || {};
  if (!stage || !Array.isArray(quotes) || quotes.length === 0) return null;
  if (prefersReducedMotion()) return null;

  const layer = document.createElement('div');
  layer.className = 'dp-float-layer';
  layer.setAttribute('aria-hidden', 'true');

  if (getComputedStyle(stage).position === 'static') {
    stage.style.position = 'relative';
  }
  stage.appendChild(layer);

  let bubbleWidth = 0;
  let enabled = false;
  let timerId = null;
  let visible = false;
  let queue = [];
  let side = 0;

  /** Fisher-Yates, so every quote shows once before any repeats. Math.random
   *  is fine here: this is decorative ordering, not anything load-bearing. */
  function refillQueue() {
    queue = quotes.slice();
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = queue[i];
      queue[i] = queue[j];
      queue[j] = tmp;
    }
  }

  function measure() {
    const viewportWidth = document.documentElement.clientWidth;
    const stageWidth = stage.getBoundingClientRect().width;
    const gutter = Math.max(0, (viewportWidth - stageWidth) / 2);
    const available = gutter + OVERLAP;

    enabled = available >= MIN_BUBBLE_WIDTH;
    bubbleWidth = Math.min(MAX_BUBBLE_WIDTH, available);

    layer.style.width = viewportWidth + 'px';
    layer.style.setProperty('--dp-float-gutter', gutter + 'px');
    layer.style.setProperty('--dp-float-bubble-w', bubbleWidth + 'px');
    layer.hidden = !enabled;
  }

  function spawn() {
    if (!enabled || !visible) return;
    if (queue.length === 0) refillQueue();

    const bubble = document.createElement('div');
    bubble.className = 'dp-float-quote';
    bubble.classList.add(side === 0 ? 'dp-float-quote--left' : 'dp-float-quote--right');
    side = side === 0 ? 1 : 0;

    // textContent, never innerHTML — quotes are data, not markup.
    bubble.textContent = queue.pop();

    // Spread vertically so they do not all rise along one line, jitter
    // horizontally so the two sides do not read as columns, and vary the
    // duration so they never lock into a rhythm.
    bubble.style.top = (12 + Math.random() * 66) + '%';
    bubble.style.setProperty('--dp-float-jitter', Math.round(Math.random() * MAX_JITTER) + 'px');
    bubble.style.animationDuration = (7 + Math.random() * 3).toFixed(2) + 's';

    bubble.addEventListener('animationend', () => bubble.remove());
    layer.appendChild(bubble);
  }

  function start() {
    if (timerId !== null) return;
    timerId = window.setInterval(spawn, intervalMs);
    spawn();
  }

  function stop() {
    if (timerId === null) return;
    window.clearInterval(timerId);
    timerId = null;
  }

  // Only animate while the stage is actually on screen.
  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) start();
      else stop();
    }, { threshold: 0 });
    observer.observe(stage);
  } else {
    visible = true;
    start();
  }

  let resizeTimer = null;
  function onResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(measure, 150);
  }
  window.addEventListener('resize', onResize);

  refillQueue();
  measure();

  return {
    destroy() {
      stop();
      window.removeEventListener('resize', onResize);
      window.clearTimeout(resizeTimer);
      if (observer) observer.disconnect();
      layer.remove();
    }
  };
}
