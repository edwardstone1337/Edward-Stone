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
 * "Recommended this term" (round 5; round 6 restructure): when
 * `getRecommendations` is supplied, every render additionally appends up to
 * 3 recommendation rows using `renderRow(unit, { variant: 'recommendation' })`.
 * The section is omitted entirely when there's nothing left to recommend.
 * Eligibility/ordering (including that different terms now see different
 * picks) is entirely the caller's concern (planner.js) — this module just
 * renders whatever list it's handed.
 *
 * Round 6: the section no longer sits under a plain divider — it's its own
 * bordered/rounded box (`.pl-term-reco`), and `root` (the panel container)
 * is styled as a flex column so the section's `margin-top: auto` (CSS) pins
 * it to the bottom of the term panel — hugging the frame body's bottom edge
 * even when the planned list above it (or the empty state) is short, while
 * still scrolling naturally with the rest of the panel if content is tall.
 * It also gets a "Hide"/"Show" text toggle in its header row
 * (`recoCollapsed`, closure state below) that collapses it to just the
 * header — deliberately a MODULE-level (this `createTermView()` instance's
 * closure) flag rather than per-term state, so the preference is shared
 * across every term tab for the rest of the session (Edward's brief).
 */

import { captureRects, playFlip, playEnter } from './flip.js';

/**
 * @typedef {Object} TermViewOptions
 * @property {HTMLElement} root - Stable panel container (persists across renders).
 * @property {(term: 1|2|3|4) => any[]} getItems - This term's units, in order.
 * @property {(item: any) => string} getItemId
 * @property {(item: any) => HTMLElement} renderRow - Returns an <li>.
 * @property {(term: 1|2|3|4) => string} [listLabel]
 * @property {{ title: string, description?: string }} [emptyState]
 *   Round 6: rebuilt on the design system's EmptyState pattern (a 120px
 *   illustration + title/description text block) — see `buildEmptyState()`
 *   below. `description` should point at the persistent "+ Add Units"
 *   action-row button (Edward's feedback: that button is the ONLY Add Units
 *   entry point) rather than duplicate it as a second button here.
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

  /** Hide/Show preference for the "Recommended this term" section — a
   * MODULE-level flag (this whole `createTermView()` instance is shared
   * across every term tab, see planner.js), so it's deliberately shared
   * across tabs rather than reset per-term. Session-only (no persistence),
   * defaults to expanded. */
  let recoCollapsed = false;

  /** Term most recently passed to render() — lets the Hide/Show toggle's
   * click handler re-render the currently-active term without the caller
   * having to thread it through separately. */
  let lastTerm = null;

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

  /**
   * Zero-state — design system's EmptyState pattern (Edward's reference
   * values): a centered column, a 120px illustration (decorative, `alt=""`
   * inside an `aria-hidden` wrapper — the heading below already carries the
   * meaning), then a title + description text block.
   */
  function buildEmptyState(cfg) {
    const wrap = document.createElement('div');
    wrap.className = 'pl-empty-state';

    const illoWrap = document.createElement('div');
    illoWrap.className = 'pl-empty-state-illo';
    illoWrap.setAttribute('aria-hidden', 'true');
    const illo = document.createElement('img');
    illo.className = 'pl-empty-state-illo-img';
    illo.src = '/assets/images/planner/question-balloon.png';
    illo.alt = '';
    illoWrap.appendChild(illo);
    wrap.appendChild(illoWrap);

    const content = document.createElement('div');
    content.className = 'pl-empty-state-content';

    const heading = document.createElement('h3');
    heading.className = 'pl-empty-state-title';
    heading.textContent = cfg.title;
    content.appendChild(heading);

    if (cfg.description) {
      const desc = document.createElement('p');
      desc.className = 'pl-empty-state-desc';
      desc.textContent = cfg.description;
      content.appendChild(desc);
    }

    wrap.appendChild(content);
    return wrap;
  }

  /**
   * "Recommended this term" — a bordered/rounded section (CSS pins it to
   * the bottom of the term panel via `margin-top: auto`, see the module
   * doc), containing a header row (heading + Hide/Show toggle) and, unless
   * collapsed, up to 3 recommendation-variant rows. `null` when there's
   * nothing eligible left to recommend (caller omits the whole section in
   * that case, per Edward's feedback) — the Hide/Show toggle never appears
   * with nothing to toggle.
   * @param {1|2|3|4} term
   * @returns {HTMLElement|null}
   */
  function buildRecommendations(term) {
    if (typeof getRecommendations !== 'function') return null;
    const recs = getRecommendations(term);
    if (!recs || recs.length === 0) return null;

    const section = document.createElement('div');
    section.className = 'pl-term-reco';

    const headerRow = document.createElement('div');
    headerRow.className = 'pl-term-reco-header';

    const heading = document.createElement('h3');
    heading.className = 'pl-term-reco-heading';
    heading.id = 'pl-term-reco-heading';
    heading.tabIndex = -1;
    heading.textContent = recommendationsLabel;
    headerRow.appendChild(heading);

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'pl-term-reco-toggle';
    toggleBtn.setAttribute('aria-expanded', String(!recoCollapsed));
    toggleBtn.textContent = recoCollapsed ? 'Show' : 'Hide';
    toggleBtn.addEventListener('click', () => {
      recoCollapsed = !recoCollapsed;
      // The toggle re-renders the CURRENT term only — a hide/show click is
      // not a data change, so no FLIP/enter replay for the planned rows
      // above (same "skip on a non-data-change render" idea board.js/this
      // module already use for tab switches).
      render(lastTerm, { skipAnimation: true });
      const nextToggle = root.querySelector('.pl-term-reco-toggle');
      if (nextToggle) nextToggle.focus({ preventScroll: true });
    });
    headerRow.appendChild(toggleBtn);

    section.appendChild(headerRow);

    if (!recoCollapsed) {
      const list = document.createElement('ul');
      list.className = 'pl-term-reco-list';
      list.setAttribute('aria-label', recommendationsLabel);

      recs.forEach((unit) => {
        const rowEl = renderRow(unit, { variant: 'recommendation' });
        rowEl.dataset.itemId = getItemId(unit);
        list.appendChild(rowEl);
      });

      section.appendChild(list);
    }

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
    lastTerm = term;
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
