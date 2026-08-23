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
 *
 * "Recommended this term" (round 5): when `getRecommendations` is supplied,
 * every render additionally appends up to 3 recommendation rows below the
 * planned list (or below the empty state, if the term has no planned units
 * yet — both coexist) using `renderRow(unit, { variant: 'recommendation' })`.
 * The section is omitted entirely when there's nothing left to recommend.
 * Eligibility/ordering is entirely the caller's concern (planner.js) — this
 * module just renders whatever list it's handed.
 */

import { captureRects, playFlip, playEnter } from './flip.js';

/**
 * @typedef {Object} TermViewOptions
 * @property {HTMLElement} root - Stable panel container (persists across renders).
 * @property {(term: 1|2|3|4) => any[]} getItems - This term's units, in order.
 * @property {(item: any) => string} getItemId
 * @property {(item: any) => HTMLElement} renderRow - Returns an <li>.
 * @property {(term: 1|2|3|4) => string} [listLabel]
 * @property {{ title: string }} [emptyState]
 *   Text-only (Edward's feedback: the persistent "+ Add Units" action-row
 *   button is the ONLY Add Units entry point now) — `title` should point at
 *   it rather than duplicate it as a second button here.
 * @property {(term: 1|2|3|4) => any[]} [getRecommendations] - (round 5)
 *   Returns up to 3 catalogue units to recommend for this term (already
 *   filtered/ordered by the caller). Omit to skip the section entirely.
 * @property {string} [recommendationsLabel]
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
    getRecommendations = null,
    recommendationsLabel = 'Recommended this term',
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

    return wrap;
  }

  /**
   * "Recommended this term" — up to 3 recommendation-variant rows, or
   * `null` when there's nothing eligible left to recommend (caller omits
   * the whole section in that case, per Edward's feedback).
   * @param {1|2|3|4} term
   * @returns {HTMLElement|null}
   */
  function buildRecommendations(term) {
    if (typeof getRecommendations !== 'function') return null;
    const recs = getRecommendations(term);
    if (!recs || recs.length === 0) return null;

    const section = document.createElement('div');
    section.className = 'pl-term-reco';

    const heading = document.createElement('h3');
    heading.className = 'pl-term-reco-heading';
    heading.id = 'pl-term-reco-heading';
    heading.tabIndex = -1;
    heading.textContent = recommendationsLabel;
    section.appendChild(heading);

    const list = document.createElement('ul');
    list.className = 'pl-term-reco-list';
    list.setAttribute('aria-label', recommendationsLabel);

    recs.forEach((unit) => {
      const rowEl = renderRow(unit, { variant: 'recommendation' });
      rowEl.dataset.itemId = getItemId(unit);
      list.appendChild(rowEl);
    });

    section.appendChild(list);
    return section;
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
      // Empty state and recommendations coexist (Edward's feedback): an
      // empty term still gets its recommendations below the empty-state text.
      const reco = buildRecommendations(term);
      if (reco) root.appendChild(reco);
      if (!skipAnimation) {
        const rowEls = Array.from(root.querySelectorAll('.pl-card'));
        playFlip(rowEls, beforeRects);
        playEnter(rowEls, beforeRects);
      }
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

    const reco = buildRecommendations(term);
    if (reco) root.appendChild(reco);

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
