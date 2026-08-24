/**
 * Snail — pixel-art snail that crawls laps around the edge of any element.
 *
 * Ported from Edward's Claude Design component ("Interactive animated UI
 * snail"), then extended from a single top-edge crawl to a full perimeter lap.
 * The original is a DCLogic class component; this is a dependency-free ES6
 * module, since the repo has no framework or build step.
 *
 * Behaviour:
 *   - Crawls clockwise around the target's border, rounding the corners along
 *     their actual border-radius, upright on top, sideways down the right,
 *     upside down along the bottom, then back up the left.
 *   - Four-frame walk cycle: the body bobs, the eye stalks sway, and a ripple
 *     travels along the foot.
 *   - Drags a short fading slime trail behind it.
 *   - Click and it retracts into its shell and stops. Click again to carry on.
 *
 * How the lap works: CSS Motion Path. `offset-path` is given a rounded-rect
 * `path()` built from the target's measured size and border-radius,
 * `offset-anchor: 50% 100%` puts the snail's FEET on the line, and
 * `offset-rotate: auto` turns it to follow the tangent, which is what carries
 * it round the corners and flips it upside down underneath. Animating
 * `offset-distance` from 0% to 100% walks one lap.
 *
 * Fallback: browsers without `offset-path: path()` get the original top-edge
 * crawl instead of a lap. Feature-detected, not sniffed.
 *
 * Accessibility: decorative, and treated as such. The snail is `aria-hidden`
 * and not focusable, matching the floating testimonials. It is an easter egg
 * that conveys nothing a screen reader user would lose, and a focusable target
 * that slides around the screen is worse than no target at all. Under
 * `prefers-reduced-motion` it parks at the top-left with no lap, no walk cycle
 * and no trail, but stays clickable.
 *
 * Usage:
 *   import { initSnail } from './snail.js';
 *   const snail = initSnail(host, { size: 32, speed: 110, pathTarget: frameEl });
 *   snail.destroy();
 *
 * `pathTarget` is the element whose border the snail traces; it defaults to
 * the host. They differ when the visually-bordered element hides its overflow
 * and would clip the snail — the Planner is exactly that case, so home-v2
 * mounts on the widget wrapper and traces `.pl-frame`.
 */

/** 16x12 pixel map. Shell is x <= 9, body and eye stalks x >= 10, so the
 *  snail faces right and crawls in the direction it is looking. */
const MAP = [
  '................',
  '....OOOO........',
  '..OOSSSSOO......',
  '.OSSSDDSSO..E.E.',
  '.OSDDOODSO..B.B.',
  '.OSDO..DSO..B.B.',
  '.OSDDOODSOOBBBBO',
  '..OOSSSSOOBBBBBO',
  '...OOSSOOBBBBBBO',
  '.OBBBBBBBBBBBBBO',
  '.OOOOOOOOOOOOOO.',
  '................'
];

const PAL = {
  colour: { O: '#2A211A', S: '#D08A4A', D: '#A05B26', B: '#F1E4CE', E: '#2A211A', slime: '#BFD8C6' },
  mono: { O: '#1C1C1C', S: '#BFBFBF', D: '#7C7C7C', B: '#EFEFEF', E: '#1C1C1C', slime: '#CFCFCF' }
};

const FRAME_MS = 130;
const FRAME_COUNT = 4;
const SVG_NS = 'http://www.w3.org/2000/svg';

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function supportsMotionPath() {
  return typeof CSS !== 'undefined'
    && typeof CSS.supports === 'function'
    && CSS.supports('offset-path', "path('M 0 0 L 1 1')")
    && CSS.supports('offset-rotate', 'auto');
}

/**
 * Clockwise rounded-rect path starting just past the top-left corner, so the
 * lap begins with the snail walking left-to-right along the top edge.
 */
function roundedRectPath(w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  if (radius === 0) {
    return 'M 0 0 H ' + w + ' V ' + h + ' H 0 Z';
  }
  return [
    'M ' + radius + ' 0',
    'H ' + (w - radius),
    'A ' + radius + ' ' + radius + ' 0 0 1 ' + w + ' ' + radius,
    'V ' + (h - radius),
    'A ' + radius + ' ' + radius + ' 0 0 1 ' + (w - radius) + ' ' + h,
    'H ' + radius,
    'A ' + radius + ' ' + radius + ' 0 0 1 0 ' + (h - radius),
    'V ' + radius,
    'A ' + radius + ' ' + radius + ' 0 0 1 ' + radius + ' 0',
    'Z'
  ].join(' ');
}

/**
 * Pixels for one frame of the walk cycle, split into shell and body so each
 * can carry its own retract transform.
 */
function pixelsForFrame(frame, pal) {
  const bob = (frame === 1 || frame === 2) ? -1 : 0;
  const sway = (frame === 2 || frame === 3) ? 1 : 0;
  const shell = [];
  const body = [];

  for (let y = 0; y < MAP.length; y++) {
    for (let x = 0; x < 16; x++) {
      const c = MAP[y][x];
      if (!c || c === '.') continue;

      let px = x;
      let py = y;
      if (y <= 8) py += bob;
      if (y <= 5 && x >= 11) px += sway;
      // Ripple travelling along the foot.
      if (y >= 9) py += ((x - frame * 2) % 6 + 12) % 6 < 2 ? -1 : 0;

      (x <= 9 ? shell : body).push({ x: px, y: py, f: pal[c] });
    }
  }
  return { shell, body };
}

function drawGroup(group, pixels) {
  // Rebuilt every frame. 12x16 is small enough that this beats diffing, and it
  // keeps the frame logic a pure function.
  while (group.firstChild) group.removeChild(group.firstChild);
  for (let i = 0; i < pixels.length; i++) {
    const p = pixels[i];
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', p.x);
    rect.setAttribute('y', p.y);
    rect.setAttribute('width', '1');
    rect.setAttribute('height', '1');
    rect.setAttribute('fill', p.f);
    group.appendChild(rect);
  }
}

/**
 * @param {HTMLElement} host                 Element the snail is mounted into.
 * @param {Object}      [options]
 * @param {number}      [options.size=32]    Snail width in px. Height is 12/16 of it.
 * @param {boolean}     [options.mono=false] Greyscale instead of the warm palette.
 * @param {number}      [options.speed=110]  Seconds for one full lap.
 * @param {HTMLElement} [options.pathTarget] Element whose border to trace. Defaults to host.
 * @returns {{destroy: function, isRetracted: function}|null}
 */
export function initSnail(host, options = {}) {
  if (!host) return null;

  const size = Number(options.size) || 32;
  const speed = Number(options.speed) || 110;
  const mono = options.mono === true;
  const pal = mono ? PAL.mono : PAL.colour;
  const target = options.pathTarget || host;

  const reduced = prefersReducedMotion();
  const canLap = supportsMotionPath();

  const unit = size / 16;
  const height = Math.round(size * 12 / 16);
  const trailH = Math.max(1, Math.round(unit));

  if (getComputedStyle(host).position === 'static') {
    host.style.position = 'relative';
  }

  const rail = document.createElement('div');
  rail.className = 'dp-snail-rail';
  rail.setAttribute('aria-hidden', 'true');
  if (!canLap) rail.classList.add('dp-snail-rail--edge');
  if (reduced) rail.classList.add('dp-snail-rail--static');

  const wrap = document.createElement('div');
  wrap.className = 'dp-snail';

  // Trail lives INSIDE the wrap so it rotates with the snail. A separately
  // positioned trail cannot follow the element round a corner.
  const trail = document.createElement('div');
  trail.className = 'dp-snail-trail';
  trail.style.height = trailH + 'px';
  trail.style.width = Math.round(size * 1.6) + 'px';
  trail.style.background = 'linear-gradient(to left, ' + pal.slime + ', rgba(255, 255, 255, 0))';

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 16 12');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(height));
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.setAttribute('focusable', 'false');

  const bodyGroup = document.createElementNS(SVG_NS, 'g');
  bodyGroup.setAttribute('class', 'dp-snail__body');
  const shellGroup = document.createElementNS(SVG_NS, 'g');
  shellGroup.setAttribute('class', 'dp-snail__shell');

  // Body first so the shell paints over it as it retracts.
  svg.appendChild(bodyGroup);
  svg.appendChild(shellGroup);

  wrap.appendChild(trail);
  wrap.appendChild(svg);
  rail.appendChild(wrap);
  host.appendChild(rail);

  if (!reduced) {
    wrap.style.animationDuration = speed + 's';
  }

  /** Rebuild the lap path from the target's current geometry. */
  function measure() {
    if (!canLap) {
      // Edge fallback: the snail rides the top border only, feet on the line.
      wrap.style.bottom = (-unit).toFixed(1) + 'px';
      return;
    }
    const rect = target.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    const cs = getComputedStyle(target);
    const radius = parseFloat(cs.borderTopLeftRadius) || 0;

    // Path coordinates are relative to the wrap's containing block, which is
    // the rail. Offset by where the target sits inside the host.
    const dx = rect.left - hostRect.left;
    const dy = rect.top - hostRect.top;

    rail.style.left = dx + 'px';
    rail.style.top = dy + 'px';
    rail.style.width = rect.width + 'px';
    rail.style.height = rect.height + 'px';

    wrap.style.offsetPath = "path('" + roundedRectPath(rect.width, rect.height, radius) + "')";
  }

  let frame = 0;
  let retracted = false;
  let timer = null;

  function render() {
    const px = pixelsForFrame(frame, pal);
    drawGroup(shellGroup, px.shell);
    drawGroup(bodyGroup, px.body);
  }

  function startWalk() {
    if (timer !== null || reduced) return;
    timer = window.setInterval(() => {
      if (retracted) return;
      frame = (frame + 1) % FRAME_COUNT;
      render();
    }, FRAME_MS);
  }

  function stopWalk() {
    if (timer === null) return;
    window.clearInterval(timer);
    timer = null;
  }

  function setRetracted(next) {
    retracted = next;
    rail.classList.toggle('dp-snail-rail--retracted', retracted);
    if (retracted) {
      // Settle on frame 0 so it pulls in from a neutral pose.
      frame = 0;
      render();
    }
  }

  function onClick(e) {
    e.preventDefault();
    setRetracted(!retracted);
  }

  wrap.addEventListener('click', onClick);

  // Pause the walk cycle while off screen. The lap itself is a CSS animation;
  // browsers already throttle those off screen.
  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) startWalk();
      else stopWalk();
    }, { threshold: 0 });
    observer.observe(host);
  } else {
    startWalk();
  }

  // The path is baked from measured pixels, so it has to be rebuilt whenever
  // the target resizes. ResizeObserver catches board-height changes (switching
  // Planner tabs) that a window resize listener would miss.
  let resizeObs = null;
  let resizeTimer = null;
  function scheduleMeasure() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(measure, 120);
  }
  if ('ResizeObserver' in window) {
    resizeObs = new ResizeObserver(scheduleMeasure);
    resizeObs.observe(target);
  }
  window.addEventListener('resize', scheduleMeasure);

  measure();
  render();

  return {
    isRetracted() { return retracted; },
    destroy() {
      stopWalk();
      if (observer) observer.disconnect();
      if (resizeObs) resizeObs.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
      window.clearTimeout(resizeTimer);
      wrap.removeEventListener('click', onClick);
      rail.remove();
    }
  };
}
