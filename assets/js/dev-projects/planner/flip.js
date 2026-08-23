/**
 * Planner prototype — FLIP animation helper.
 *
 * A small, board-agnostic utility: capture the current bounding rects of a
 * set of elements (matched later by `data-item-id`), then after the DOM has
 * been mutated, play a FLIP transition — invert each moved element back to
 * its previous position with a transform, then let it transition to
 * identity. Used by board.js (full re-renders) and drag.js (live drag-over
 * reflow + the drag clone's drop settle) so the "make room" reflow and the
 * drop never jump instantly.
 *
 * Fully disabled under `prefers-reduced-motion: reduce` — callers still call
 * these functions unconditionally; they just no-op into the instant snap
 * that already existed.
 */

const DURATION = 180;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'; // ease-out

const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function prefersReducedMotion() {
  return reduceMotionQuery.matches;
}

/**
 * Snapshot the current bounding rects of a set of elements, keyed by their
 * `data-item-id`. Call this BEFORE the DOM mutation that will move them.
 * @param {HTMLElement[]} els
 * @returns {Map<string, DOMRect>}
 */
export function captureRects(els) {
  const map = new Map();
  els.forEach((el) => {
    const id = el.dataset && el.dataset.itemId;
    if (id) map.set(id, el.getBoundingClientRect());
  });
  return map;
}

/**
 * Compare a captured "before" snapshot to each element's current (post-
 * mutation) position and animate any that moved from their old position to
 * the new one (the "FLIP" — First/Last/Invert/Play, played directly rather
 * than literally inverting then playing, since Web Animations lets us
 * express the whole thing as one keyframe pair).
 *
 * No-ops entirely under prefers-reduced-motion.
 *
 * @param {HTMLElement[]} els - elements in their FINAL DOM position.
 * @param {Map<string, DOMRect>} beforeRects
 * @param {HTMLElement} [excludeEl] - skip this element (e.g. a card animated
 *   separately, such as the live drag source).
 */
export function playFlip(els, beforeRects, excludeEl) {
  if (prefersReducedMotion()) return;

  els.forEach((el) => {
    if (el === excludeEl) return;
    const id = el.dataset && el.dataset.itemId;
    const before = id && beforeRects.get(id);
    if (!before) return;

    const after = el.getBoundingClientRect();
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    if (!dx && !dy) return;

    el.getAnimations().forEach((anim) => anim.cancel());
    el.animate(
      [
        { transform: 'translate(' + dx + 'px, ' + dy + 'px)' },
        { transform: 'translate(0, 0)' },
      ],
      { duration: DURATION, easing: EASING }
    );
  });
}

/**
 * Play a subtle fade/rise-in for elements that have no entry in `beforeRects`
 * — i.e. they didn't exist in the previous render, so `playFlip` (which only
 * moves elements that DID exist) has nothing to do for them. Used by
 * board.js so a unit added via the drawer (brief §6: "animate the new card
 * in so the landing spot is obvious") gets a visible entrance instead of
 * just appearing. No-ops entirely under prefers-reduced-motion.
 *
 * @param {HTMLElement[]} els - elements in their FINAL DOM position.
 * @param {Map<string, DOMRect>} beforeRects
 */
export function playEnter(els, beforeRects) {
  if (prefersReducedMotion()) return;

  els.forEach((el) => {
    const id = el.dataset && el.dataset.itemId;
    if (id && beforeRects.has(id)) return; // existed before — playFlip's concern

    el.getAnimations().forEach((anim) => anim.cancel());
    el.animate(
      [
        { opacity: 0, transform: 'translateY(6px) scale(0.98)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' },
      ],
      { duration: DURATION, easing: EASING }
    );
  });
}

/**
 * Animate the floating drag clone from its current fixed position to a
 * target rect (the dropped card's resting slot), then call `onDone`.
 * Under prefers-reduced-motion — or if there's no clone — `onDone` runs
 * synchronously with no animation, matching the pre-existing instant snap.
 *
 * @param {HTMLElement|null} cloneEl
 * @param {DOMRect} targetRect
 * @param {() => void} onDone
 */
export function settleClone(cloneEl, targetRect, onDone) {
  if (!cloneEl || prefersReducedMotion()) {
    onDone();
    return;
  }

  const current = cloneEl.getBoundingClientRect();
  const dx = targetRect.left - current.left;
  const dy = targetRect.top - current.top;

  if (!dx && !dy) {
    onDone();
    return;
  }

  const anim = cloneEl.animate(
    [
      { transform: 'translate(0, 0) rotate(-1.5deg)' },
      { transform: 'translate(' + dx + 'px, ' + dy + 'px) rotate(0deg)' },
    ],
    { duration: DURATION, easing: EASING, fill: 'forwards' }
  );

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    onDone();
  };
  anim.addEventListener('finish', finish);
  anim.addEventListener('cancel', finish);
}
