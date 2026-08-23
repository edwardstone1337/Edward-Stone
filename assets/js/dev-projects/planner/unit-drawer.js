/**
 * Planner prototype — unit-detail drawer (round 4; round 6 restructure;
 * round 7 tweaks to actions placement + copy).
 *
 * Replaces the old "Opening units isn't part of this demo" toast: clicking a
 * term-view row's main area, a Kanban card's body, or "Open" in either
 * item's kebab/meatballs menu — or a "Recommended this term" row's main
 * area (round 5/6) — opens this drawer instead (wired generically in
 * planner.js's `setupCardInteractions()`, nothing here is row- or
 * card-specific, it just takes a unit id).
 *
 * Built on the same shared shell as the Add Units drawer (drawer-shell.js) —
 * slide-from-right within `.pl-frame`, in-frame scrim, inert background,
 * manual focus trap, Escape/scrim/✕ close, focus return, ~200ms slide. Both
 * drawers must never be open at once; planner.js enforces that by
 * force-closing whichever is open before opening the other (see
 * drawer-shell.js's `requestClose({ animate: false })` doc).
 *
 * Round 6 restructure (matches @inquisitive/ui's UnitPage.tsx pattern —
 * Edward's design-system reference), round 7 refined further after Edward's
 * live review of the round-6 build:
 *  - Header keeps ONLY the ✕ — no title. The dialog's `aria-labelledby`
 *    instead points at a body heading (see `buildTitleBlock()` below), same
 *    id (`pl-unit-drawer-title`) as before, just relocated.
 *  - The old tint hero strip is gone entirely. Body order: title block
 *    (unit name heading + "{Year} · {Subject}" meta line, 4px gap) →
 *    a state-dependent ACTIONS ROW (round 7: moved up here, directly under
 *    the meta line — was a footer under everything in round 6) → progress
 *    summary → Lessons section → Assessment section (omitted when the unit
 *    has none).
 *  - STATE-DEPENDENT content, resolved fresh on every open/refresh via
 *    `isInPlanner()` (never cached — an Add/Remove changes it mid-session
 *    without the drawer closing):
 *      · IN planner: lesson/assessment rows become real interactive
 *        toggles (`role="checkbox"`, 44px min touch target, a lucide-style
 *        check-circle icon) that flip the catalogue's `done` flag via
 *        planner-state.js's `toggleLesson`/`toggleAssessment` — every open
 *        renderer (row, card, this drawer) re-derives progress from that
 *        same catalogue object, so "recalculates live everywhere" falls out
 *        of the existing single-source-of-truth architecture (see
 *        planner-data.js) rather than needing its own sync. Actions row:
 *        "Download unit" (demo toast, downloads aren't part of the demo)
 *        and "Remove from planner" (danger text, removes + closes + announces).
 *      · NOT in planner (opened from a recommendation row): lessons/
 *        assessment render read-only (plain rows, no toggle). Actions row is
 *        a single primary "Add to planner" button (unfilled bookmark icon —
 *        round 7: renamed from "Save to planner" for copy consistency with
 *        the rest of the widget's "Add"/"+ Add Units" language). Clicking it
 *        adds the unit to the active term (or the term with the fewest
 *        units, from All Terms — same rule as the Add Units drawer's own Add
 *        button) WITHOUT closing the drawer: the drawer re-renders itself
 *        into the in-planner state above, bookmark flips to filled ("Added
 *        to planner", now inert).
 *  - Reset (planner-state.js's `reset()`) restores the catalogue's original
 *    `done` flags (planner-data.js's `resetCatalogueCompletion()`) — if this
 *    drawer is open when Reset runs, planner.js calls this module's
 *    `refresh()` so the open drawer reflects the rollback immediately too.
 *
 * XSS: every dynamic string goes through textContent; the only innerHTML
 * assignments below are static, hand-authored icon markup with no
 * interpolated data (same pattern as kebab.js/drawer.js) — safe per the
 * repo's XSS rule.
 */

import { createDrawerShell } from './drawer-shell.js';
import { unitProgress, findCatalogueUnit } from './planner-data.js';
import { termWithFewestUnits } from './drawer.js';
import { showSnackbar } from '../snackbar.js';

const CLOSE_SVG =
  '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
  '</svg>';

/** Lucide-style check-circle (round 6: replaces the old hand-drawn filled
 * circle) — 20px, stroke=currentColor, fill=none, the lucide convention.
 * Marks a DONE lesson/assessment; colour comes from the wrapping
 * `.pl-unit-drawer-status--done` class (currentColor), never hardcoded here. */
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
 * Title block — the unit name as a heading (dialog's `aria-labelledby`
 * target) with a single meta line beneath ("{Year} · {Subject}" — the
 * drawer's own convention, per Edward's design-system reference; note this
 * is YEAR-first, the reverse of the row/card meta line's "{Subject} ·
 * {Year}", intentionally not unified since they're different components).
 */
function buildTitleBlock(unit) {
  const wrap = document.createElement('div');
  wrap.className = 'pl-unit-drawer-title-block';

  const heading = document.createElement('h2');
  heading.className = 'pl-unit-drawer-name';
  heading.id = 'pl-unit-drawer-title';
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
 * Interactive lesson/assessment toggle (IN-planner state, round 6) — a real
 * `role="checkbox"` button, 44px min touch target, that flips the item's
 * done state via `onToggle` and re-renders in place.
 * @param {{ id: string, title: string, done: boolean }} item
 * @param {() => (boolean|null)} onToggle - Performs the store toggle and
 *   returns the new done state (or null on a no-op).
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
 * @param {Object} config
 * @param {() => object[]} config.getUnits
 * @param {(unit: { id: string }, term: 1|2|3|4) => void} config.add - Add
 *   to planner (round 6; renamed from "Save" in round 7).
 * @param {(id: string) => void} config.remove - Remove from planner.
 * @param {(unitId: string, lessonId: string) => (boolean|null)} config.toggleLesson
 * @param {(unitId: string) => (boolean|null)} config.toggleAssessment
 * @param {(msg: string) => void} config.announce
 * @param {() => ('all'|1|2|3|4)} [config.getActiveTerm] - Same term-targeting
 *   rule as the Add Units drawer: while a TERM tab is active, "Add to
 *   planner" lands the unit there; from All Terms (or if omitted), falls
 *   back to the term with
 *   the fewest units.
 * @param {HTMLElement} config.frameEl
 * @param {HTMLElement} config.inertEl
 * @param {HTMLElement} [config.fallbackFocusEl]
 */
export function createUnitDrawer(config) {
  const {
    getUnits,
    add,
    remove,
    toggleLesson,
    toggleAssessment,
    announce,
    getActiveTerm,
    frameEl,
    inertEl,
    fallbackFocusEl,
  } = config;

  const shell = createDrawerShell({
    frameEl,
    inertEl,
    fallbackFocusEl,
    dialogClassName: 'pl-drawer',
    labelledBy: 'pl-unit-drawer-title',
  });
  const { dialog } = shell;

  // Header keeps ONLY the ✕ (round 6) — the title moved into the body (see
  // buildTitleBlock()); the dialog's aria-labelledby still resolves, just to
  // an element down in `body` now instead of up here.
  const header = document.createElement('div');
  header.className = 'pl-drawer-header';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'pl-drawer-icon-btn';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = CLOSE_SVG;

  header.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'pl-drawer-body';

  dialog.appendChild(header);
  dialog.appendChild(body);

  closeBtn.addEventListener('click', () => shell.requestClose());

  /** Id of the unit currently shown, or null when the drawer is closed —
   * lets refresh()/toggle handlers re-resolve fresh data without the
   * caller having to pass the unit around. */
  let currentUnitId = null;

  dialog.addEventListener('close', () => {
    currentUnitId = null;
  });

  function isInPlanner(unitId) {
    return getUnits().some((u) => u.id === unitId);
  }

  /** On-board units first (carries `.term`, live-cloned lessons/assessment
   * — see planner-state.js's resolveUnit()); falls back to the catalogue
   * directly for a unit that isn't on the board yet (a "Recommended this
   * term" row opens this same drawer for one of those). */
  function resolveUnit(unitId) {
    return getUnits().find((u) => u.id === unitId) || findCatalogueUnit(unitId);
  }

  function resolveTargetTerm() {
    const active = typeof getActiveTerm === 'function' ? getActiveTerm() : null;
    return Number.isInteger(active) && active >= 1 && active <= 4
      ? active
      : termWithFewestUnits(getUnits);
  }

  function buildActionsRow(unit, inPlanner) {
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
      removeBtn.addEventListener('click', () => {
        remove(unit.id);
        announce('Removed ' + unit.title + '.');
        shell.requestClose();
      });
      row.appendChild(removeBtn);
    } else {
      const addBtn = buildIconButton(
        'pl-btn pl-btn-primary pl-unit-drawer-save-btn',
        buildBookmarkIcon(false),
        'Add to planner'
      );
      addBtn.addEventListener('click', () => {
        const term = resolveTargetTerm();
        add({ id: unit.id }, term);
        announce('Added ' + unit.title + ' to Term ' + term + '.');
        refresh();
        const heading = body.querySelector('#pl-unit-drawer-title');
        if (heading) heading.focus({ preventScroll: true });
      });
      row.appendChild(addBtn);
    }

    return row;
  }

  /**
   * Round 7 (Edward's live review): the actions row moves UP — directly
   * under the title block's meta line, BEFORE the progress summary — same
   * placement for both states (not-in-planner's single "Add to planner",
   * in-planner's Added/Download/Remove trio), rather than sitting as a
   * footer under everything.
   */
  function renderContent(unit, inPlanner) {
    body.textContent = '';
    body.appendChild(buildTitleBlock(unit));
    body.appendChild(buildActionsRow(unit, inPlanner));
    body.appendChild(buildProgressSummary(unit));

    body.appendChild(
      buildSection('Lessons', unit.lessons, inPlanner, (lesson) => {
        const done = toggleLesson(unit.id, lesson.id);
        if (done === null) return;
        announce('Marked ' + lesson.title + (done ? ' complete.' : ' incomplete.'));
        refresh();
        const next = body.querySelector('[data-toggle-id="' + lesson.id + '"]');
        if (next) next.focus({ preventScroll: true });
      })
    );

    if (unit.assessment) {
      body.appendChild(
        buildSection('Assessment', [unit.assessment], inPlanner, (assessment) => {
          const done = toggleAssessment(unit.id);
          if (done === null) return;
          announce('Marked ' + assessment.title + (done ? ' complete.' : ' incomplete.'));
          refresh();
          const next = body.querySelector('[data-toggle-id="' + assessment.id + '"]');
          if (next) next.focus({ preventScroll: true });
        })
      );
    }
  }

  /** Re-render the currently-open unit from fresh data (a toggle, an Add,
   * or an external change like Reset) — no-op when the drawer is closed. */
  function refresh() {
    if (!currentUnitId) return;
    const unit = resolveUnit(currentUnitId);
    if (!unit) {
      // The unit vanished from both the board and the catalogue lookup —
      // shouldn't happen in this prototype, but close rather than render
      // stale/empty content.
      shell.requestClose();
      return;
    }
    renderContent(unit, isInPlanner(currentUnitId));
  }

  /**
   * @param {string} unitId
   * @param {HTMLElement} [triggerEl]
   */
  function open(unitId, triggerEl) {
    const unit = resolveUnit(unitId);
    if (!unit) return;
    currentUnitId = unitId;
    shell.open(triggerEl, () => {
      renderContent(unit, isInPlanner(unitId));
      // preventScroll: true — see the note in drawer-shell.js's open(). At
      // this point the drawer may still be off-canvas.
      const heading = body.querySelector('#pl-unit-drawer-title');
      if (heading) heading.focus({ preventScroll: true });
    });
  }

  return { open, close: shell.requestClose, isOpen: shell.isOpen, refresh };
}
