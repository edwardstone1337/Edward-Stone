/**
 * Planner prototype — drag core (brief §5, reimplemented with Pointer
 * Events + keyboard since the repo has no frameworks/npm; @dnd-kit's
 * *behaviour* is reproduced exactly, not its library).
 *
 * Fully generic: operates on "columns" (DOM lists identified by a column
 * id) and "cards" (`.pl-card` elements identified by `data-item-id`), and
 * knows nothing about units/terms. Any board built with board.js can
 * reuse this.
 *
 * Behavioural contract (kept 1:1 with the brief):
 *  - Whole card is the drag target, no handle; kebab excluded.
 *  - 8px pointer activation distance — under that is a click.
 *  - Cross-column moves commit live during drag-over; within-column
 *    reorders commit on drop.
 *  - Floating clone follows the pointer; source card fades to opacity 0.4.
 *  - cursor: grab / grabbing; touch-action: none on draggables (CSS).
 *  - Empty columns are valid drop targets.
 *  - Nearest-drop-target resolution: closest column (by horizontal
 *    distance to its list), then insertion index by comparing the
 *    pointer's Y to each card's vertical midpoint.
 *  - Keyboard: focusable cards, accessible name "Move {title}" (set by
 *    card.js). Enter/Space picks up, arrows move between positions/
 *    columns, Enter/Space drops, Escape cancels. aria-live announcements
 *    throughout.
 *  - prefers-reduced-motion: no drop animation or progress transition
 *    (the FLIP reflow + clone settle below both route through flip.js,
 *    which no-ops to an instant snap when the media query matches).
 *
 * Text-selection guard: dragging used to highlight page text because a
 * pointer gesture over text-bearing elements starts a native selection.
 * `beginDrag()` adds `pl-board-dragging` to <body> (CSS sets
 * `user-select: none` for the gesture's duration only — see
 * project-planner.css) and captures the pointer on the source card so the
 * OS doesn't hand subsequent move events to text selection; both are
 * undone in `cleanupPointerDrag()`. Cards also carry
 * `-webkit-user-select: none` unconditionally (CSS).
 *
 * Both that `<body>` class AND the floating drag clone (`.pl-card-clone`,
 * also appended to `<body>`) are styled by rules scoped
 * `[data-project="planner"] ...` — which only reaches `<body>` when the
 * attribute sits on `<html>`. `beginDrag()`/`cleanupPointerDrag()`
 * temporarily add/restore it there for the gesture's duration so this
 * still works when a page instead scopes the widget on a nested mount
 * element (see index.html's compact embed) rather than `<html>` itself.
 */

import { captureRects, playFlip, settleClone } from './flip.js';

let suppressClickUntil = 0;

/** Card body / kebab "Open" click handlers should ignore the synthetic
 * click that follows a real pointer drag gesture. */
export function shouldSuppressClick() {
  return performance.now() < suppressClickUntil;
}

function suppressClickBriefly() {
  suppressClickUntil = performance.now() + 300;
}

function getRealCards(listEl) {
  if (!listEl) return [];
  return Array.from(listEl.children).filter((el) => el.classList.contains('pl-card'));
}

/**
 * @param {Object} config
 * @param {HTMLElement} config.root - Stable container the board renders into.
 * @param {Array<{id: string|number, label: string}>} config.columns - In DOM order.
 * @param {(columnId: string|number) => HTMLElement|null} config.getColumnListEl
 * @param {(id: string, columnId: string|number, index: number) => void} config.move
 * @param {() => void} config.render - Full authoritative board re-render.
 * @param {(msg: string) => void} config.announce - Writes to an aria-live region.
 * @param {string} [config.columnEmptyText]
 */
export function attachDragging(config) {
  const {
    root,
    columns,
    getColumnListEl,
    move,
    render,
    announce,
    columnEmptyText = 'Drop a unit here',
  } = config;

  function columnLabel(columnId) {
    const col = columns.find((c) => String(c.id) === String(columnId));
    return col ? col.label : String(columnId);
  }

  /**
   * DOM `dataset.columnId` reads are always strings, but a column's real id
   * (e.g. the numeric term 1–4 the store expects) may not be. Resolve a
   * dataset-sourced id back to the actual typed id from `columns` before it
   * is ever passed to `move()`, so a cancel/reorder never silently turns a
   * unit's term into the string "2" instead of the number 2.
   */
  function resolveColumnId(rawId) {
    const col = columns.find((c) => String(c.id) === String(rawId));
    return col ? col.id : rawId;
  }

  function refreshPlaceholder(listEl) {
    if (!listEl) return;
    const cards = getRealCards(listEl);
    const existing = listEl.querySelector(':scope > .pl-column-empty');
    if (cards.length === 0) {
      listEl.classList.add('pl-column-list--empty');
      if (!existing) {
        const li = document.createElement('li');
        li.className = 'pl-column-empty';
        li.setAttribute('aria-hidden', 'true');
        li.textContent = columnEmptyText;
        listEl.appendChild(li);
      }
    } else {
      listEl.classList.remove('pl-column-list--empty');
      if (existing) existing.remove();
    }
  }

  function refreshAllPlaceholders() {
    columns.forEach((col) => refreshPlaceholder(getColumnListEl(col.id)));
  }

  /**
   * Resolve the nearest column + insertion index for a pointer position,
   * excluding `excludeEl` (the card being dragged) from the count.
   */
  function resolveDropTarget(x, y, excludeEl) {
    let bestColumnId = columns.length ? columns[0].id : null;
    let bestDist = Infinity;

    columns.forEach((col) => {
      const listEl = getColumnListEl(col.id);
      if (!listEl) return;
      const rect = listEl.getBoundingClientRect();
      const dist = x >= rect.left && x <= rect.right
        ? 0
        : Math.min(Math.abs(x - rect.left), Math.abs(x - rect.right));
      if (dist < bestDist) {
        bestDist = dist;
        bestColumnId = col.id;
      }
    });

    const listEl = getColumnListEl(bestColumnId);
    const cards = getRealCards(listEl).filter((el) => el !== excludeEl);
    let index = 0;
    for (let i = 0; i < cards.length; i++) {
      const rect = cards[i].getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (y > mid) index++;
      else break;
    }

    return { columnId: bestColumnId, index };
  }

  // ------------------------------------------------------------------
  // Pointer drag
  // ------------------------------------------------------------------

  /** @type {null | {
   *   id: string, sourceLi: HTMLElement, startX: number, startY: number,
   *   dragging: boolean, cloneEl: HTMLElement|null, offsetX: number,
   *   offsetY: number, originColumnId: string, originIndex: number,
   *   lastResolved: { columnId: string|number, index: number },
   *   addedProjectAttr: boolean, priorProjectAttr: string|null
   * }} */
  let ptr = null;

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (ptr) return; // a previous gesture's drop-settle animation is still in flight
    const card = e.target.closest('.pl-card');
    if (!card || !root.contains(card)) return;
    // Generic opt-out (round 5: term-view's non-draggable "Recommended this
    // term" rows share `root` with the draggable planned rows, so class
    // alone can't distinguish them — a `.pl-card` with this attribute never
    // activates a drag, no matter where the pointer lands on it).
    if (card.hasAttribute('data-no-drag')) return;
    if (e.target.closest('.pl-kebab')) return; // kebab stays independently clickable

    ptr = {
      id: card.dataset.itemId,
      sourceLi: card,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      dragging: false,
      cloneEl: null,
      offsetX: 0,
      offsetY: 0,
      originColumnId: resolveColumnId(card.parentElement.dataset.columnId),
      originIndex: getRealCards(card.parentElement).indexOf(card),
      lastResolved: null,
      addedProjectAttr: false,
      priorProjectAttr: null,
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('keydown', onPointerDragKeydown, true);
  }

  function beginDrag(e) {
    const { sourceLi } = ptr;
    const rect = sourceLi.getBoundingClientRect();
    ptr.offsetX = ptr.startX - rect.left;
    ptr.offsetY = ptr.startY - rect.top;
    ptr.dragging = true;

    // The clone below is appended to <body> — OUTSIDE `root`'s own subtree
    // — and `document.body.classList.add('pl-board-dragging')` further
    // down styles <body> itself. Both rely on `[data-project="planner"]`
    // (project-planner.css) being reachable as an ANCESTOR of <body>, which
    // is only true when the attribute sits on <html> (as on the full-size
    // prototype page, projects/planner.html). A compact embed can instead
    // put the attribute on a nested mount div (see index.html's M3 embed)
    // — NOT an ancestor of <body> — so without this, the clone renders
    // completely unstyled (`position: static`, wherever it lands in
    // <body>'s normal flow, no cursor/pointer-events/z-index) and the
    // whole-page user-select/cursor guard never applies either. Temporarily
    // add the attribute to <html> for the gesture's duration so both rules
    // always reach their targets regardless of where the page scopes the
    // widget; idempotent when it's already the right value, and restored
    // (not just removed) in cleanupPointerDrag() below so a page that
    // already carries it permanently (projects/planner.html) — or, in
    // principle, some other value entirely — is never left wrong after a
    // drag.
    const existingProjectAttr = document.documentElement.getAttribute('data-project');
    ptr.addedProjectAttr = existingProjectAttr !== 'planner';
    ptr.priorProjectAttr = existingProjectAttr;
    if (ptr.addedProjectAttr) {
      document.documentElement.setAttribute('data-project', 'planner');
    }

    const clone = sourceLi.cloneNode(true);
    clone.classList.add('pl-card-clone');
    clone.style.width = rect.width + 'px';
    clone.removeAttribute('tabindex');
    document.body.appendChild(clone);
    ptr.cloneEl = clone;

    sourceLi.classList.add('pl-card--dragging');
    document.body.classList.add('pl-board-dragging');

    // Pointer capture keeps subsequent pointer events targeted at the card
    // (window listeners still receive them via bubbling) regardless of
    // where the cursor wanders — belt-and-braces alongside the CSS
    // user-select guard against the browser starting a text selection.
    try {
      if (!sourceLi.hasPointerCapture(ptr.pointerId)) {
        sourceLi.setPointerCapture(ptr.pointerId);
      }
    } catch (err) {
      // Progressive enhancement only — pointer capture failing (e.g. an
      // invalid/expired pointerId) shouldn't block the drag.
    }

    if (config.setRenderSuspended) config.setRenderSuspended(true);

    positionClone(e.clientX, e.clientY);
    announce('Picked up ' + sourceLi.getAttribute('aria-label').replace(/^Move /, '') + '.');
  }

  function positionClone(x, y) {
    if (!ptr || !ptr.cloneEl) return;
    ptr.cloneEl.style.left = (x - ptr.offsetX) + 'px';
    ptr.cloneEl.style.top = (y - ptr.offsetY) + 'px';
  }

  function onPointerMove(e) {
    if (!ptr) return;

    if (!ptr.dragging) {
      const dx = e.clientX - ptr.startX;
      const dy = e.clientY - ptr.startY;
      if (Math.hypot(dx, dy) < 8) return;
      // Past activation distance: this is now a drag, not a text/scroll
      // gesture — stop the browser starting a native selection from here on.
      e.preventDefault();
      beginDrag(e);
    } else {
      e.preventDefault();
    }

    positionClone(e.clientX, e.clientY);

    const resolved = resolveDropTarget(e.clientX, e.clientY, ptr.sourceLi);
    ptr.lastResolved = resolved;

    const currentColumnId = ptr.sourceLi.parentElement
      ? ptr.sourceLi.parentElement.dataset.columnId
      : null;

    const destListEl = getColumnListEl(resolved.columnId);
    if (!destListEl) return;
    const siblings = getRealCards(destListEl).filter((el) => el !== ptr.sourceLi);
    const before = siblings[resolved.index] || null;

    const crossingColumn = String(currentColumnId) !== String(resolved.columnId);
    const originListEl = ptr.sourceLi.parentElement;

    // FLIP: capture the pre-mutation position of every sibling that might
    // be displaced by re-inserting the dragged card (both the origin and
    // destination lists on a cross-column move; just the one list on a
    // within-column reorder), so the "make room" reflow below settles
    // instead of jumping.
    const affectedLists = crossingColumn && originListEl !== destListEl
      ? [originListEl, destListEl]
      : [destListEl];
    const affectedCards = () =>
      affectedLists
        .flatMap((listEl) => getRealCards(listEl))
        .filter((el) => el !== ptr.sourceLi);
    const beforeRects = captureRects(affectedCards());

    // Live-position the actual dragged element so the preview always
    // matches where a drop would land.
    if (before) {
      destListEl.insertBefore(ptr.sourceLi, before);
    } else {
      destListEl.appendChild(ptr.sourceLi);
    }
    refreshAllPlaceholders();
    playFlip(affectedCards(), beforeRects);

    if (crossingColumn) {
      // Cross-column moves commit live (brief §5).
      move(ptr.id, resolved.columnId, resolved.index);
    }
  }

  function detachPointerWindowListeners() {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerCancel);
    window.removeEventListener('keydown', onPointerDragKeydown, true);
  }

  function cleanupPointerDrag() {
    detachPointerWindowListeners();

    if (ptr && ptr.sourceLi && ptr.pointerId != null) {
      try {
        if (ptr.sourceLi.hasPointerCapture(ptr.pointerId)) {
          ptr.sourceLi.releasePointerCapture(ptr.pointerId);
        }
      } catch (err) {
        // Element may already be detached/recreated by a render — fine.
      }
    }
    if (ptr && ptr.cloneEl) ptr.cloneEl.remove();
    if (ptr && ptr.sourceLi) ptr.sourceLi.classList.remove('pl-card--dragging');
    document.body.classList.remove('pl-board-dragging');
    // Restore <html>'s data-project attribute to whatever it was before
    // beginDrag() touched it — only if THIS gesture is the one that
    // changed it (see beginDrag()'s comment above); a page that already
    // carried it permanently is never left without it after a drag.
    if (ptr && ptr.addedProjectAttr) {
      if (ptr.priorProjectAttr == null) {
        document.documentElement.removeAttribute('data-project');
      } else {
        document.documentElement.setAttribute('data-project', ptr.priorProjectAttr);
      }
    }
  }

  function onPointerUp() {
    if (!ptr) return;
    if (!ptr.dragging) {
      detachPointerWindowListeners();
      ptr = null;
      return; // sub-threshold move: this was a click, let it proceed
    }

    const title = ptr.sourceLi.getAttribute('aria-label').replace(/^Move /, '');
    const final = ptr.lastResolved || { columnId: ptr.originColumnId, index: ptr.originIndex };

    // Final authoritative commit — idempotent even if already committed
    // live during a cross-column drag-over.
    move(ptr.id, final.columnId, final.index);

    // ptr.sourceLi was already live-positioned into its final slot by every
    // drag-over tick, so its current rect IS the drop target — animate the
    // floating clone from wherever the pointer released it into that slot,
    // then reveal the real card underneath (settleClone no-ops to instant
    // under prefers-reduced-motion, matching the previous behaviour).
    const targetRect = ptr.sourceLi.getBoundingClientRect();
    const cloneEl = ptr.cloneEl;
    ptr.cloneEl = null; // cleanupPointerDrag below no longer owns it

    // Set synchronously (not inside the settle callback below): the
    // browser fires the synthetic trailing click right after this pointerup
    // handler returns, well before the ~180ms settle animation finishes.
    suppressClickBriefly();

    settleClone(cloneEl, targetRect, () => {
      if (cloneEl) cloneEl.remove();
      cleanupPointerDrag();
      if (config.setRenderSuspended) config.setRenderSuspended(false);
      render();
      announce('Moved ' + title + ' to ' + columnLabel(final.columnId) + '.');
      ptr = null;
    });
  }

  function onPointerCancel() {
    if (!ptr) return;
    if (!ptr.dragging) {
      detachPointerWindowListeners();
      ptr = null;
      return;
    }
    const title = ptr.sourceLi.getAttribute('aria-label').replace(/^Move /, '');
    move(ptr.id, ptr.originColumnId, ptr.originIndex);
    cleanupPointerDrag();
    if (config.setRenderSuspended) config.setRenderSuspended(false);
    render();
    announce('Cancelled. ' + title + ' returned to ' + columnLabel(ptr.originColumnId) + '.');
    ptr = null;
  }

  function onPointerDragKeydown(e) {
    if (!ptr || !ptr.dragging) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      onPointerCancel();
    }
  }

  root.addEventListener('pointerdown', onPointerDown);

  // ------------------------------------------------------------------
  // Keyboard drag
  // ------------------------------------------------------------------

  /** @type {null | { id: string, originColumnId: string, originIndex: number }} */
  let picked = null;

  // ArrowUp/Down/Left/Right below call render() while a card is still
  // picked up (mid-gesture), which replaces the focused card's DOM node —
  // removing a focused element from the document fires a synchronous
  // `focusout` on it. Without this guard the handler further down (added
  // to end the gesture when the user Tabs away) misreads that as the user
  // leaving and clears `picked`, so the very next Enter/Space silently
  // restarts a pick-up instead of dropping. Sub the flag only for the
  // render()+focusCard() pair that causes it; the real Tab-away path
  // leaves it false.
  let suppressFocusOutClear = false;

  function focusCard(id, addPickedClass) {
    const el = root.querySelector('.pl-card[data-item-id="' + id + '"]');
    if (!el) return null;
    if (addPickedClass) el.classList.add('pl-card--picked');
    el.focus();
    return el;
  }

  function columnNeighbor(columnId, dir) {
    const idx = columns.findIndex((c) => String(c.id) === String(columnId));
    if (idx === -1) return null;
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= columns.length) return null;
    return columns[nextIdx].id;
  }

  function onKeydown(e) {
    const card = e.target.closest('.pl-card');
    if (!card || card !== e.target) return; // ignore kebab's own Enter/Space etc.
    if (card.hasAttribute('data-no-drag')) return; // see onPointerDown's same guard

    const id = card.dataset.itemId;
    const title = card.getAttribute('aria-label').replace(/^Move /, '');

    if ((e.key === 'Enter' || e.key === ' ') && !picked) {
      e.preventDefault();
      picked = {
        id,
        originColumnId: resolveColumnId(card.parentElement.dataset.columnId),
        originIndex: getRealCards(card.parentElement).indexOf(card),
      };
      card.classList.add('pl-card--picked');
      announce('Picked up ' + title + '. Use arrow keys to move, Enter or Space to drop, Escape to cancel.');
      return;
    }

    if (!picked || picked.id !== id) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.classList.remove('pl-card--picked');
      const columnId = card.parentElement.dataset.columnId;
      const count = getRealCards(card.parentElement).length;
      const index = getRealCards(card.parentElement).indexOf(card);
      picked = null;
      announce('Dropped ' + title + ' in ' + columnLabel(columnId) + ', position ' + (index + 1) + ' of ' + count + '.');
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      const { originColumnId, originIndex } = picked;
      move(id, originColumnId, originIndex);
      picked = null;
      render();
      focusCard(id, false);
      announce('Cancelled. ' + title + ' returned to ' + columnLabel(originColumnId) + '.');
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const listEl = card.parentElement;
      const columnId = resolveColumnId(listEl.dataset.columnId);
      const cards = getRealCards(listEl);
      const currentIndex = cards.indexOf(card);
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      const newIndex = Math.max(0, Math.min(cards.length - 1, currentIndex + dir));
      if (newIndex === currentIndex) return;
      suppressFocusOutClear = true;
      move(id, columnId, newIndex);
      render();
      focusCard(id, true);
      suppressFocusOutClear = false;
      announce('Moved ' + title + ' to position ' + (newIndex + 1) + ' of ' + cards.length + ' in ' + columnLabel(columnId) + '.');
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const currentColumnId = card.parentElement.dataset.columnId;
      const targetColumnId = columnNeighbor(currentColumnId, dir);
      if (targetColumnId == null) return;
      const targetListEl = getColumnListEl(targetColumnId);
      const newIndex = getRealCards(targetListEl).length;
      suppressFocusOutClear = true;
      move(id, targetColumnId, newIndex);
      render();
      focusCard(id, true);
      suppressFocusOutClear = false;
      announce('Moved ' + title + ' to ' + columnLabel(targetColumnId) + '.');
    }
  }

  root.addEventListener('keydown', onKeydown);

  // A card losing focus while picked (e.g. Tab away) ends the keyboard
  // drag gesture quietly; state is already committed from arrow moves.
  root.addEventListener(
    'focusout',
    (e) => {
      if (!picked || suppressFocusOutClear) return;
      const card = e.target.closest && e.target.closest('.pl-card');
      if (card && card.dataset.itemId === picked.id) {
        card.classList.remove('pl-card--picked');
        picked = null;
      }
    },
    true
  );
}
