/**
 * Planner prototype — single-term panel renderer (brief §4).
 *
 * A term tab shows one term's units as a vertical list of rows (row.js).
 * Structurally this is a board with exactly ONE column (whichever term is
 * currently active) — so it reuses drag.js's generic column abstraction
 * unmodified for vertical reorder-within-list (the caller passes a
 * single-entry `columns` array it mutates in place when the active term
 * changes — see planner.js's `termColumns`). Cross-term dragging never
 * enters the picture here (brief §4: "cross-term drag not needed on term
 * tabs"), so a single column is all drag.js ever needs to resolve.
 *
 * Reuses the SAME live state as the board (getItems is supplied by the
 * caller, reading straight from planner-state.js) — there is no separate
 * per-term data source, so switching tabs always reflects current data.
 *
 * Animation guard (Edward's feedback): tab switching re-renders this panel,
 * but that render should not replay FLIP/enter for every row as if they'd
 * all just appeared — only a render caused by an actual data change (add /
 * remove / move / reorder while this term is already the active tab) should
 * animate. The caller tells us which is which via `skipAnimation`.
 */

import { captureRects, playFlip, playEnter } from './flip.js';

/**
 * @typedef {Object} TermViewOptions
 * @property {HTMLElement} root - Stable panel container (persists across renders).
 * @property {(term: 1|2|3|4) => any[]} getItems - This term's units, in order.
 * @property {(item: any) => string} getItemId
 * @property {(item: any) => HTMLElement} renderRow - Returns an <li>.
 * @property {(term: 1|2|3|4) => string} [listLabel]
 * @property {{ title: string, actionLabel: string, onAction?: (e: Event) => void }} [emptyState]
 */

/**
 * @param {TermViewOptions} options
 */
export function createTermView(options) {
  const {
    root,
    getItems,
    getItemId,
    renderRow,
    listLabel = (term) => 'Term ' + term + ' units',
    emptyState = null,
  } = options;

  let renderSuspended = false;

  function setRenderSuspended(value) {
    renderSuspended = value;
  }

  function isRenderSuspended() {
    return renderSuspended;
  }

  /** @returns {HTMLElement|null} the term's row list (drag.js's "column list"). */
  function getColumnListEl() {
    return root.querySelector('.pl-column-list');
  }

  function buildEmptyState(cfg) {
    const wrap = document.createElement('div');
    wrap.className = 'pl-empty-board pl-empty-term';

    const heading = document.createElement('h3');
    heading.className = 'pl-empty-board-title';
    heading.textContent = cfg.title;
    wrap.appendChild(heading);

    if (cfg.actionLabel) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pl-btn pl-btn-primary';
      btn.textContent = cfg.actionLabel;
      if (typeof cfg.onAction === 'function') {
        btn.addEventListener('click', cfg.onAction);
      } else {
        btn.disabled = true;
      }
      wrap.appendChild(btn);
    }

    return wrap;
  }

  /**
   * @param {1|2|3|4} term
   * @param {{ skipAnimation?: boolean }} [opts] - skipAnimation: true for a
   *   render triggered by activating this tab (no "before" state worth
   *   settling from); false/omitted for a render triggered by a live data
   *   change while already on this tab.
   */
  function render(term, opts) {
    const skipAnimation = !!(opts && opts.skipAnimation);
    const beforeRects = skipAnimation
      ? new Map()
      : captureRects(Array.from(root.querySelectorAll('.pl-card')));

    const items = getItems(term);
    root.textContent = '';

    if (items.length === 0 && emptyState) {
      root.appendChild(buildEmptyState(emptyState));
      return;
    }

    const listEl = document.createElement('ul');
    listEl.className = 'pl-column-list pl-row-list';
    listEl.dataset.columnId = String(term);
    listEl.setAttribute('aria-label', listLabel(term));

    items.forEach((item) => {
      const rowEl = renderRow(item);
      rowEl.dataset.itemId = getItemId(item);
      rowEl.dataset.columnId = String(term);
      listEl.appendChild(rowEl);
    });

    root.appendChild(listEl);

    if (!skipAnimation) {
      const rowEls = Array.from(root.querySelectorAll('.pl-card'));
      playFlip(rowEls, beforeRects);
      playEnter(rowEls, beforeRects);
    }
  }

  return {
    render,
    getColumnListEl,
    setRenderSuspended,
    isRenderSuspended,
  };
}
