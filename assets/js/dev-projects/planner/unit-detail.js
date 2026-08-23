/**
 * Planner prototype — shared unit-detail renderer (round 8 extraction).
 *
 * Extracted out of unit-drawer.js once a SECOND host (drawer.js's Add Units
 * drawer, step 3 — clicking a unit row's main area in the unit-list step
 * drills into the same detail view, in place, inside the same drawer)
 * needed the identical content: title block (unit name heading + "{Year} ·
 * {Subject}" meta beneath), a state-aware actions row, a progress summary,
 * and Lessons/Assessment sections. One template, two hosts — unit-drawer.js
 * (the standalone drawer opened from a term row/Kanban card/recommendation
 * row) and drawer.js's step 3 both call `buildUnitDetail()` (via the
 * `createUnitDetailController()` factory below) so the rendered markup and
 * CSS are never forked between them.
 *
 * Two exports:
 *  - `buildUnitDetail(unit, opts)` — pure content builder. Given an already-
 *    resolved unit and a bundle of fully-wired callbacks (see its own doc
 *    below), returns a DocumentFragment: title block, actions row, progress
 *    summary, Lessons section, Assessment section (omitted when the unit has
 *    none). No side effects of its own beyond what the callbacks it's given
 *    do.
 *  - `createUnitDetailController(config)` — the stateful engine common to
 *    both hosts: "which unit id is currently shown", deriving in-planner
 *    state LIVE from the store on every render/refresh (never cached — an
 *    Add/Remove/toggle elsewhere in the same session must be reflected the
 *    next time this unit's detail is shown), and the re-render-in-place +
 *    refocus plumbing after an action. Hosts differ only in which container
 *    they render into, what id the title heading should carry (each host's
 *    `<dialog>` needs its own unique `aria-labelledby` target — see the
 *    note in drawer.js), and what "the unit vanished" / "removed" should do
 *    afterward (the standalone drawer closes; drawer.js's step 3 returns to
 *    the unit list) — both supplied via `config.onMissingUnit`/`onRemoved`.
 *
 * XSS: every dynamic string goes through textContent; the only innerHTML
 * assignments below are static, hand-authored icon markup with no
 * interpolated data (same pattern as kebab.js/drawer.js) — safe per the
 * repo's XSS rule.
 */

import { unitProgress, findCatalogueUnit } from './planner-data.js';
import { termWithFewestUnits } from './drawer.js';
import { showSnackbar } from '../snackbar.js';

const CHECK_CIRCLE_SVG =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<path d="M21.801 10A10 10 0 1 1 17 3.335" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<path d="m9 11 3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
  '</svg>';

/** Empty outline circle — NOT yet done. */
const CIRCLE_EMPTY_SVG =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="2"/>' +
  '</svg>';

/** Download icon (lucide), 20px — "Download unit" action (demo toast only). */
const DOWNLOAD_SVG =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<path d="m7 10 5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
  '</svg>';

/** Bookmark path (lucide), 20px — the real product's exact fill-toggle
 * pattern: UNFILLED (fill="none") = saveable, FILLED (fill="currentColor",
 * same path) = already in the planner. See buildBookmarkIcon() below. */
const BOOKMARK_PATH =
  'M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z';

function buildBookmarkIcon(filled) {
  return (
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="' +
    (filled ? 'currentColor' : 'none') +
    '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="' +
    BOOKMARK_PATH +
    '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>'
  );
}

function buildStatusIcon(done) {
  const span = document.createElement('span');
  span.className = 'pl-unit-drawer-status' + (done ? ' pl-unit-drawer-status--done' : '');
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = done ? CHECK_CIRCLE_SVG : CIRCLE_EMPTY_SVG;
  return span;
}

/**
 * Icon + label button (Add/Added, Download) — icon is a hand-authored
 * static SVG string (no interpolated data, safe per the module doc's XSS
 * note); `.pl-btn`'s own `gap: 8px` between the two spans below gives the
 * spec's "icon-to-label gap 8px" for free.
 */
function buildIconButton(className, svgMarkup, label) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = className;

  const icon = document.createElement('span');
  icon.className = 'pl-btn-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = svgMarkup;

  const text = document.createElement('span');
  text.textContent = label;

  btn.appendChild(icon);
  btn.appendChild(text);
  return btn;
}

/**
 * Title block — the unit name as a heading (the host dialog's
 * `aria-labelledby` target — see the module doc's note on why each host
 * supplies its own `titleId`) with a single meta line beneath ("{Year} ·
 * {Subject}" — this component's own convention; note this is YEAR-first,
 * the reverse of the row/card meta line's "{Subject} · {Year}",
 * intentionally not unified since they're different components).
 * @param {object} unit
 * @param {string} titleId - id stamped on the heading; each host passes its
 *   own unique id since more than one host's markup can exist in the DOM at
 *   once (the standalone drawer and the Add Units drawer are separate
 *   `<dialog>` elements) and a duplicate `id` would break `aria-labelledby`
 *   resolution.
 */
function buildTitleBlock(unit, titleId) {
  const wrap = document.createElement('div');
  wrap.className = 'pl-unit-drawer-title-block';

  const heading = document.createElement('h2');
  heading.className = 'pl-unit-drawer-name';
  heading.id = titleId;
  heading.tabIndex = -1;
  heading.textContent = unit.title;

  const meta = document.createElement('p');
  meta.className = 'pl-unit-drawer-meta';
  meta.textContent = unit.yearLabel + ' · ' + unit.subjectLabel;

  wrap.appendChild(heading);
  wrap.appendChild(meta);
  return wrap;
}

/**
 * Progress summary — reuses row.js's continuous-bar classes verbatim
 * (`.pl-row-progress`/`.pl-row-progress-fill`) so the fill mechanic lives in
 * exactly one place in the CSS. Capped to a moderate width via the
 * `.pl-unit-drawer-progress .pl-row-progress` CSS override.
 */
function buildProgressSummary(unit) {
  const { completed, total, fraction } = unitProgress(unit);

  const wrap = document.createElement('div');
  wrap.className = 'pl-unit-drawer-progress';

  const bar = document.createElement('div');
  bar.className = 'pl-row-progress';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', String(total));
  bar.setAttribute('aria-valuenow', String(completed));
  bar.setAttribute('aria-label', unit.title + ': ' + completed + ' of ' + total + ' complete');

  const fill = document.createElement('div');
  fill.className = 'pl-row-progress-fill';
  fill.style.width = Math.round(fraction * 100) + '%';
  bar.appendChild(fill);

  const label = document.createElement('p');
  label.className = 'pl-unit-drawer-progress-label';
  label.textContent = completed + ' of ' + total + ' complete';

  wrap.appendChild(bar);
  wrap.appendChild(label);
  return wrap;
}

/** Read-only lesson/assessment row (NOT-in-planner state) — a static line,
 * no interaction. Same visual anatomy as the interactive toggle below,
 * just not a button. */
function buildStatusListItem(item) {
  const li = document.createElement('li');
  li.className = 'pl-unit-drawer-item';

  const row = document.createElement('span');
  row.className = 'pl-unit-drawer-item-static';

  row.appendChild(buildStatusIcon(item.done));

  const label = document.createElement('span');
  label.className = 'pl-unit-drawer-item-title';
  label.textContent = item.title;
  row.appendChild(label);

  // Text alternative for the aria-hidden icon above — the icon alone
  // carries no accessible name of its own.
  const srStatus = document.createElement('span');
  srStatus.className = 'pl-visually-hidden';
  srStatus.textContent = item.done ? ' — Complete' : ' — Not yet complete';
  row.appendChild(srStatus);

  li.appendChild(row);
  return li;
}

/**
 * Interactive lesson/assessment toggle (IN-planner state) — a real
 * `role="checkbox"` button, 44px min touch target, that flips the item's
 * done state via `onToggle` and re-renders in place.
 * @param {{ id: string, title: string, done: boolean }} item
 * @param {() => void} onToggle
 */
function buildToggleListItem(item, onToggle) {
  const li = document.createElement('li');
  li.className = 'pl-unit-drawer-item';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pl-unit-drawer-toggle';
  btn.setAttribute('role', 'checkbox');
  btn.setAttribute('aria-checked', String(!!item.done));
  btn.dataset.toggleId = item.id;

  btn.appendChild(buildStatusIcon(item.done));

  const label = document.createElement('span');
  label.className = 'pl-unit-drawer-item-title';
  label.textContent = item.title;
  btn.appendChild(label);

  btn.addEventListener('click', () => onToggle());

  li.appendChild(btn);
  return li;
}

function buildSection(headingText, items, inPlanner, onToggleItem) {
  const section = document.createElement('section');
  section.className = 'pl-unit-drawer-section';

  const heading = document.createElement('h3');
  heading.className = 'pl-unit-drawer-heading';
  heading.textContent = headingText;

  const list = document.createElement('ul');
  list.className = 'pl-unit-drawer-list';
  items.forEach((item) => {
    list.appendChild(
      inPlanner ? buildToggleListItem(item, () => onToggleItem(item)) : buildStatusListItem(item)
    );
  });

  section.appendChild(heading);
  section.appendChild(list);
  return section;
}

/**
 * State-dependent actions row: NOT-in-planner shows a single primary "Add
 * to planner" button (unfilled bookmark). IN-planner shows an inert "Added
 * to planner" indicator (filled bookmark), "Download unit" (demo toast) and
 * "Remove from planner" (danger text, pushed to the far side).
 * @param {object} unit
 * @param {UnitDetailOpts} opts
 */
function buildActionsRow(unit, opts) {
  const { inPlanner, onAdd, onRemove } = opts;

  const row = document.createElement('div');
  row.className = 'pl-unit-drawer-actions';

  if (inPlanner) {
    const addedBtn = buildIconButton(
      'pl-btn pl-unit-drawer-save-btn pl-unit-drawer-save-btn--saved',
      buildBookmarkIcon(true),
      'Added to planner'
    );
    addedBtn.disabled = true;
    row.appendChild(addedBtn);

    const downloadBtn = buildIconButton('pl-btn pl-btn-secondary', DOWNLOAD_SVG, 'Download unit');
    downloadBtn.addEventListener('click', () => {
      showSnackbar("Downloads aren't part of this demo");
    });
    row.appendChild(downloadBtn);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'pl-unit-drawer-remove-btn';
    removeBtn.textContent = 'Remove from planner';
    removeBtn.addEventListener('click', () => onRemove());
    row.appendChild(removeBtn);
  } else {
    const addBtn = buildIconButton(
      'pl-btn pl-btn-primary pl-unit-drawer-save-btn',
      buildBookmarkIcon(false),
      'Add to planner'
    );
    addBtn.addEventListener('click', () => onAdd());
    row.appendChild(addBtn);
  }

  return row;
}

/**
 * @typedef {Object} UnitDetailOpts
 * @property {boolean} inPlanner
 * @property {string} titleId - see buildTitleBlock()'s doc.
 * @property {() => void} onAdd - "Add to planner" clicked (not-in-planner
 *   state only).
 * @property {() => void} onRemove - "Remove from planner" clicked
 *   (in-planner state only).
 * @property {(lesson: { id: string, title: string, done: boolean }) => void} onToggleLesson
 * @property {(assessment: { id: string, title: string, done: boolean }) => void} onToggleAssessment
 */

/**
 * Build the unit-detail body content for one unit: title block, the
 * state-aware actions row, progress summary, Lessons section, and an
 * Assessment section (omitted when the unit has none). Pure content
 * builder — every side effect (store mutation, announcing, re-rendering,
 * refocusing) lives in the callbacks `opts` supplies, wired by
 * `createUnitDetailController()` below.
 * @param {object} unit - resolved unit (catalogue fields, plus `.term` when
 *   the unit is on the board).
 * @param {UnitDetailOpts} opts
 * @returns {DocumentFragment}
 */
export function buildUnitDetail(unit, opts) {
  const { inPlanner, titleId } = opts;

  const frag = document.createDocumentFragment();
  frag.appendChild(buildTitleBlock(unit, titleId));
  frag.appendChild(buildActionsRow(unit, opts));
  frag.appendChild(buildProgressSummary(unit));

  frag.appendChild(
    buildSection('Lessons', unit.lessons, inPlanner, (lesson) => opts.onToggleLesson(lesson))
  );

  if (unit.assessment) {
    frag.appendChild(
      buildSection('Assessment', [unit.assessment], inPlanner, (assessment) =>
        opts.onToggleAssessment(assessment)
      )
    );
  }

  return frag;
}

/**
 * Stateful engine shared by both hosts (unit-drawer.js's standalone drawer,
 * drawer.js's Add Units step 3): tracks which unit id is currently shown,
 * derives in-planner state LIVE from the store on every render/refresh
 * (never cached), and owns the re-render-in-place + refocus plumbing after
 * an Add/Remove/toggle.
 *
 * @param {Object} config
 * @param {() => object[]} config.getUnits
 * @param {(unit: { id: string }, term: 1|2|3|4) => void} config.add
 * @param {(id: string) => void} config.remove
 * @param {(unitId: string, lessonId: string) => (boolean|null)} config.toggleLesson
 * @param {(unitId: string) => (boolean|null)} config.toggleAssessment
 * @param {(msg: string) => void} config.announce
 * @param {() => ('all'|1|2|3|4)} [config.getActiveTerm] - Term-targeting
 *   rule (same everywhere): while a TERM tab is active, "Add to planner"
 *   lands the unit there; from All Terms (or if omitted), falls back to the
 *   term with the fewest units.
 * @param {HTMLElement} config.container - Element to render the detail
 *   content into (cleared and rebuilt on every render/refresh).
 * @param {string} config.titleId - see buildTitleBlock()'s doc; each host
 *   passes its own unique id.
 * @param {() => void} [config.onRemoved] - Called after a successful
 *   "Remove from planner" (store mutation + announce already done). The
 *   standalone drawer closes itself here; drawer.js's step 3 returns to the
 *   unit list.
 * @param {() => void} [config.onMissingUnit] - Called from `refresh()` when
 *   the currently-shown unit id no longer resolves against either the board
 *   or the catalogue (shouldn't happen in this prototype, but closes/
 *   navigates away rather than rendering stale/empty content).
 */
export function createUnitDetailController(config) {
  const {
    getUnits,
    add,
    remove,
    toggleLesson,
    toggleAssessment,
    announce,
    getActiveTerm,
    container,
    titleId,
    onRemoved,
    onMissingUnit,
  } = config;

  /** Id of the unit currently rendered, or null. */
  let currentUnitId = null;

  function isInPlanner(unitId) {
    return getUnits().some((u) => u.id === unitId);
  }

  /** On-board units first (carries `.term`, live-cloned lessons/assessment
   * — see planner-state.js's resolveUnit()); falls back to the catalogue
   * directly for a unit that isn't on the board yet. */
  function resolveUnit(unitId) {
    return getUnits().find((u) => u.id === unitId) || findCatalogueUnit(unitId);
  }

  function resolveTargetTerm() {
    const active = typeof getActiveTerm === 'function' ? getActiveTerm() : null;
    return Number.isInteger(active) && active >= 1 && active <= 4
      ? active
      : termWithFewestUnits(getUnits);
  }

  function renderContent(unit, inPlanner) {
    container.textContent = '';
    container.appendChild(
      buildUnitDetail(unit, {
        inPlanner,
        titleId,
        onAdd: () => {
          const term = resolveTargetTerm();
          add({ id: unit.id }, term);
          announce('Added ' + unit.title + ' to Term ' + term + '.');
          refresh();
          const heading = container.querySelector('#' + titleId);
          if (heading) heading.focus({ preventScroll: true });
        },
        onRemove: () => {
          remove(unit.id);
          announce('Removed ' + unit.title + '.');
          if (typeof onRemoved === 'function') onRemoved();
        },
        onToggleLesson: (lesson) => {
          const done = toggleLesson(unit.id, lesson.id);
          if (done === null) return;
          announce('Marked ' + lesson.title + (done ? ' complete.' : ' incomplete.'));
          refresh();
          const next = container.querySelector('[data-toggle-id="' + lesson.id + '"]');
          if (next) next.focus({ preventScroll: true });
        },
        onToggleAssessment: (assessment) => {
          const done = toggleAssessment(unit.id);
          if (done === null) return;
          announce('Marked ' + assessment.title + (done ? ' complete.' : ' incomplete.'));
          refresh();
          const next = container.querySelector('[data-toggle-id="' + assessment.id + '"]');
          if (next) next.focus({ preventScroll: true });
        },
      })
    );
  }

  /** Re-render the currently-shown unit from fresh data (a toggle, an Add,
   * or an external change like Reset) — no-op when nothing is shown. */
  function refresh() {
    if (!currentUnitId) return;
    const unit = resolveUnit(currentUnitId);
    if (!unit) {
      if (typeof onMissingUnit === 'function') onMissingUnit();
      return;
    }
    renderContent(unit, isInPlanner(currentUnitId));
  }

  /**
   * Render a unit's detail into `container`. Returns false (and renders
   * nothing) if the id doesn't resolve.
   * @param {string} unitId
   * @returns {boolean}
   */
  function render(unitId) {
    const unit = resolveUnit(unitId);
    if (!unit) return false;
    currentUnitId = unitId;
    renderContent(unit, isInPlanner(unitId));
    return true;
  }

  /** Forget the currently-shown unit (call when the host closes/navigates
   * away) so a later `refresh()` is a no-op rather than acting on stale
   * state. */
  function clear() {
    currentUnitId = null;
  }

  return {
    render,
    refresh,
    clear,
    resolveUnit,
    isInPlanner,
    getCurrentUnitId: () => currentUnitId,
  };
}
