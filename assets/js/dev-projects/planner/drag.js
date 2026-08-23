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
 *    (handled in CSS — this module never animates a snap-back itself).
 */

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
   *   lastResolved: { columnId: string|number, index: number }
   * }} */
  let ptr = null;

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    const card = e.target.closest('.pl-card');
    if (!card || !root.contains(card)) return;
    if (e.target.closest('.pl-kebab')) return; // kebab stays independently clickable

    ptr = {
      id: card.dataset.itemId,
      sourceLi: card,
      startX: e.clientX,
      startY: e.clientY,
      dragging: false,
      cloneEl: null,
      offsetX: 0,
      offsetY: 0,
      originColumnId: resolveColumnId(card.parentElement.dataset.columnId),
      originIndex: getRealCards(card.parentElement).indexOf(card),
      lastResolved: null,
    };

    window.addEventListener('pointermove', onPointerMove);
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

    const clone = sourceLi.cloneNode(true);
    clone.classList.add('pl-card-clone');
    clone.style.width = rect.width + 'px';
    clone.removeAttribute('tabindex');
    document.body.appendChild(clone);
    ptr.cloneEl = clone;

    sourceLi.classList.add('pl-card--dragging');
    document.body.classList.add('pl-board-dragging');

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
      beginDrag(e);
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

    // Live-position the actual dragged element so the preview always
    // matches where a drop would land.
    if (before) {
      destListEl.insertBefore(ptr.sourceLi, before);
    } else {
      destListEl.appendChild(ptr.sourceLi);
    }
    refreshAllPlaceholders();

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

    if (ptr && ptr.cloneEl) ptr.cloneEl.remove();
    if (ptr && ptr.sourceLi) ptr.sourceLi.classList.remove('pl-card--dragging');
    document.body.classList.remove('pl-board-dragging');
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

    cleanupPointerDrag();
    if (config.setRenderSuspended) config.setRenderSuspended(false);
    render();
    announce('Moved ' + title + ' to ' + columnLabel(final.columnId) + '.');
    suppressClickBriefly();
    ptr = null;
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
      move(id, columnId, newIndex);
      render();
      focusCard(id, true);
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
      move(id, targetColumnId, newIndex);
      render();
      focusCard(id, true);
      announce('Moved ' + title + ' to ' + columnLabel(targetColumnId) + '.');
    }
  }

  root.addEventListener('keydown', onKeydown);

  // A card losing focus while picked (e.g. Tab away) ends the keyboard
  // drag gesture quietly; state is already committed from arrow moves.
  root.addEventListener(
    'focusout',
    (e) => {
      if (!picked) return;
      const card = e.target.closest && e.target.closest('.pl-card');
      if (card && card.dataset.itemId === picked.id) {
        card.classList.remove('pl-card--picked');
        picked = null;
      }
    },
    true
  );
}
