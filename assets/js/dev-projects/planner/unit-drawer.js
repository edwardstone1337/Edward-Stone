/**
 * Planner prototype — unit-detail drawer (round 4).
 *
 * Replaces the old "Opening units isn't part of this demo" toast: clicking a
 * term-view row's main area, a Kanban card's body, or "Open" in either
 * item's kebab/meatballs menu now opens this drawer instead (wired
 * generically in planner.js's `setupCardInteractions()` — nothing here is
 * row- or card-specific, it just takes a unit id).
 *
 * Built on the same shared shell as the Add Units drawer (drawer-shell.js) —
 * slide-from-right within `.pl-frame`, in-frame scrim, inert background,
 * manual focus trap, Escape/scrim/✕ close, focus return, ~200ms slide. Both
 * drawers must never be open at once; planner.js enforces that by
 * force-closing whichever is open before opening the other (see
 * drawer-shell.js's `requestClose({ animate: false })` doc).
 *
 * Content, top to bottom:
 *  - Header: ✕ + unit title (no back button — this drawer has one view).
 *  - Hero strip: subject tint + big initial, subject/year meta.
 *  - Progress summary: the SAME continuous-bar classes as the term-view row
 *    (.pl-row-progress / .pl-row-progress-fill — see row.js) plus an
 *    "{x} of {y} complete" label, so the mechanic isn't duplicated.
 *  - "Lessons" list — each lesson with a done indicator (filled check circle
 *    vs empty circle). The icon is aria-hidden; a visually-hidden text
 *    alternative ("— Complete" / "— Not yet complete") carries the state to
 *    assistive tech.
 *  - "Assessment" list — same treatment, omitted entirely when the unit has
 *    none.
 *
 * READ-ONLY this round: nothing here can toggle a done state (brief for this
 * round is explicit — see docs/superpowers/specs). XSS: every dynamic
 * string goes through textContent; the only innerHTML assignments below are
 * static, hand-authored icon markup (same pattern as kebab.js/drawer.js).
 */

import { createDrawerShell } from './drawer-shell.js';
import { EMBLEM_GLYPH, tintClass } from './drawer.js';
import { unitProgress, findCatalogueUnit } from './planner-data.js';

const CLOSE_SVG =
  '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
  '</svg>';

/** Filled circle + check — done. Circle takes its fill from the wrapping
 * `.pl-unit-drawer-status--done`'s `color` (currentColor); the check itself
 * is drawn in --pl-surface (not a raw hex) so it reads as a light mark on
 * the green circle regardless of theme. */
const STATUS_DONE_SVG =
  '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<circle cx="9" cy="9" r="8" fill="currentColor"/>' +
  '<path d="M5.4 9.3L7.7 11.6L12.6 6.4" stroke="var(--pl-surface)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
  '</svg>';

/** Empty outline circle — not yet done. */
const STATUS_EMPTY_SVG =
  '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<circle cx="9" cy="9" r="7.25" stroke="currentColor" stroke-width="1.5"/>' +
  '</svg>';

function buildStatusIcon(done) {
  const span = document.createElement('span');
  span.className = 'pl-unit-drawer-status' + (done ? ' pl-unit-drawer-status--done' : '');
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = done ? STATUS_DONE_SVG : STATUS_EMPTY_SVG;
  return span;
}

/**
 * @param {{ title: string, done: boolean }} item - A lesson or an assessment.
 * @returns {HTMLLIElement}
 */
function buildStatusListItem(item) {
  const li = document.createElement('li');
  li.className = 'pl-unit-drawer-item';

  li.appendChild(buildStatusIcon(item.done));

  const label = document.createElement('span');
  label.className = 'pl-unit-drawer-item-title';
  label.textContent = item.title;
  li.appendChild(label);

  // Text alternative for the aria-hidden icon above — the icon alone
  // carries no accessible name of its own.
  const srStatus = document.createElement('span');
  srStatus.className = 'pl-visually-hidden';
  srStatus.textContent = item.done ? ' — Complete' : ' — Not yet complete';
  li.appendChild(srStatus);

  return li;
}

function buildHero(unit) {
  const hero = document.createElement('div');
  hero.className = 'pl-unit-drawer-hero';

  const emblem = document.createElement('span');
  emblem.className = 'pl-unit-drawer-emblem ' + tintClass(unit.subject);
  emblem.setAttribute('aria-hidden', 'true');
  emblem.textContent = EMBLEM_GLYPH[unit.subject] || '';

  const metaWrap = document.createElement('div');
  metaWrap.className = 'pl-unit-drawer-hero-meta';

  const subject = document.createElement('span');
  subject.className = 'pl-unit-drawer-hero-subject';
  subject.textContent = unit.subjectLabel;

  const year = document.createElement('span');
  year.className = 'pl-unit-drawer-hero-year';
  year.textContent = unit.yearLabel;

  metaWrap.appendChild(subject);
  metaWrap.appendChild(year);
  hero.appendChild(emblem);
  hero.appendChild(metaWrap);
  return hero;
}

/**
 * Progress summary — reuses row.js's continuous-bar classes verbatim (see
 * module doc) so the fill mechanic lives in exactly one place in the CSS.
 * Capped to a moderate width (round 5: it previously stretched the full
 * drawer width) via the `.pl-unit-drawer-progress .pl-row-progress` CSS
 * override — see project-planner.css.
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

function buildSection(headingText, items) {
  const section = document.createElement('section');
  section.className = 'pl-unit-drawer-section';

  const heading = document.createElement('h3');
  heading.className = 'pl-unit-drawer-heading';
  heading.textContent = headingText;

  const list = document.createElement('ul');
  list.className = 'pl-unit-drawer-list';
  items.forEach((item) => list.appendChild(buildStatusListItem(item)));

  section.appendChild(heading);
  section.appendChild(list);
  return section;
}

/**
 * @param {Object} config
 * @param {() => object[]} config.getUnits
 * @param {HTMLElement} config.frameEl
 * @param {HTMLElement} config.inertEl
 * @param {HTMLElement} [config.fallbackFocusEl]
 */
export function createUnitDrawer(config) {
  const { getUnits, frameEl, inertEl, fallbackFocusEl } = config;

  const shell = createDrawerShell({
    frameEl,
    inertEl,
    fallbackFocusEl,
    dialogClassName: 'pl-drawer',
    labelledBy: 'pl-unit-drawer-title',
  });
  const { dialog } = shell;

  const header = document.createElement('div');
  header.className = 'pl-drawer-header';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'pl-drawer-icon-btn';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = CLOSE_SVG;

  const title = document.createElement('h2');
  title.className = 'pl-drawer-title';
  title.id = 'pl-unit-drawer-title';
  title.tabIndex = -1;

  header.appendChild(closeBtn);
  header.appendChild(title);

  const body = document.createElement('div');
  body.className = 'pl-drawer-body';

  dialog.appendChild(header);
  dialog.appendChild(body);

  closeBtn.addEventListener('click', () => shell.requestClose());

  function renderContent(unit) {
    title.textContent = unit.title;

    body.textContent = '';
    body.appendChild(buildHero(unit));
    body.appendChild(buildProgressSummary(unit));
    body.appendChild(buildSection('Lessons', unit.lessons));
    if (unit.assessment) {
      body.appendChild(buildSection('Assessment', [unit.assessment]));
    }

    // preventScroll: true — see the note in drawer-shell.js's open().
    title.focus({ preventScroll: true });
  }

  /**
   * @param {string} unitId
   * @param {HTMLElement} [triggerEl]
   */
  function open(unitId, triggerEl) {
    // On-board units first (carries `.term`, though renderContent never
    // reads it); falls back to the catalogue directly for a unit that
    // isn't on the board yet — round 5's "Recommended this term" rows open
    // this same drawer for a unit `getUnits()` doesn't know about yet.
    const unit = getUnits().find((u) => u.id === unitId) || findCatalogueUnit(unitId);
    if (!unit) return;
    shell.open(triggerEl, () => renderContent(unit));
  }

  return { open, close: shell.requestClose, isOpen: shell.isOpen };
}
