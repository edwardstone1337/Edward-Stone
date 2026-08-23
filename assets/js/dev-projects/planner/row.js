/**
 * Planner prototype — term-view unit row renderer (round 4 redesign,
 * matching Edward's reference "epic row" layout; round 5 adds a
 * `variant: 'recommendation'` option, see below).
 *
 * A horizontal counterpart to card.js's vertical Kanban card: same unit,
 * laid out left-to-right as, in order: a decorative grab pad, a small
 * subject-tinted thumbnail, the unit name, a subject/year stack, a
 * lessons/assessment content stack, a single continuous progress bar (same
 * mechanic as the Kanban card's — round 5 reverted the segmented bar), and a
 * trailing horizontal "meatballs" menu (kebab.js, same Open/—/Remove menu
 * as the card).
 *
 * The `<li>` carries `.pl-card` (not just `.pl-row`) so it participates in
 * drag.js and its CSS (`.pl-card--dragging`, `.pl-card--picked`,
 * `.pl-card-clone`, focus rings) completely unchanged — `.pl-row` in
 * project-planner.css is a layout-only modifier on top, not a fork. The
 * grab pad is purely decorative (aria-hidden): drag.js's pointerdown
 * listener is bound to the whole `.pl-card` element (excluding only
 * `.pl-kebab`), so the whole row stays the drag target exactly as before —
 * nothing here changes activation.
 *
 * Only `.pl-card-body` (the "hit" wrapper below) carries `data-action="open"`
 * — that's the click target planner.js's delegated `setupCardInteractions()`
 * opens the unit-detail drawer from (same class/attribute contract card.js
 * uses, including the post-drag click-suppression check).
 *
 * `variant: 'recommendation'` (round 5, term-view.js's "Recommended this
 * term" section): same anatomy (thumbnail/name/subject-year/counts/
 * progress) MINUS the grab pad and kebab, PLUS a trailing "Add" button
 * (`data-action="add"`, reuses the Add Units drawer's `.pl-drawer-add-btn`
 * look). These rows are NOT draggable — the `<li>` carries
 * `data-no-drag="true"` (drag.js's onPointerDown bails on it) instead of a
 * tabIndex/"Move {title}" accessible name, and the hit area is a real
 * `<button>` (rather than the planned row's plain `<div>`) so keyboard users
 * can still reach "open" without the kebab's "Open" menu item that planned
 * rows rely on.
 */

import { buildKebab } from './kebab.js';
import { EMBLEM_GLYPH, tintClass } from './drawer.js';
import { unitProgress } from './planner-data.js';

/** Grip-dot grab affordance (Jira-style), purely decorative. */
const GRAB_SVG =
  '<svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<circle cx="2.5" cy="2.5" r="1.3" fill="currentColor"/>' +
  '<circle cx="7.5" cy="2.5" r="1.3" fill="currentColor"/>' +
  '<circle cx="2.5" cy="8" r="1.3" fill="currentColor"/>' +
  '<circle cx="7.5" cy="8" r="1.3" fill="currentColor"/>' +
  '<circle cx="2.5" cy="13.5" r="1.3" fill="currentColor"/>' +
  '<circle cx="7.5" cy="13.5" r="1.3" fill="currentColor"/>' +
  '</svg>';

function pluralizeLabel(count, word) {
  return count + ' ' + word + (count === 1 ? '' : 's');
}

/**
 * Continuous progress bar — one fill on a track, same mechanic as the
 * Kanban card's `.pl-card-progress` (round 5: reverted the round-4 segmented
 * bar, which read as more precise than the data warranted). Fill width is
 * the derived completion fraction; aria semantics stay counted (not a
 * percentage) so assistive tech gets "{x} of {y} complete", matching the
 * unit-detail drawer's progress summary (unit-drawer.js reuses these same
 * classes verbatim).
 *
 * @param {import('./planner-data.js').CatalogueUnit} unit
 * @returns {HTMLDivElement}
 */
function buildProgress(unit) {
  const { completed, total, fraction } = unitProgress(unit);

  const wrap = document.createElement('div');
  wrap.className = 'pl-row-progress';
  wrap.setAttribute('role', 'progressbar');
  wrap.setAttribute('aria-valuemin', '0');
  wrap.setAttribute('aria-valuemax', String(total));
  wrap.setAttribute('aria-valuenow', String(completed));
  wrap.setAttribute('aria-label', unit.title + ': ' + completed + ' of ' + total + ' complete');

  const fill = document.createElement('div');
  fill.className = 'pl-row-progress-fill';
  fill.style.width = Math.round(fraction * 100) + '%';
  wrap.appendChild(fill);

  return wrap;
}

/**
 * Render one term-view unit row.
 *
 * @param {import('./planner-data.js').CatalogueUnit & { term?: 1|2|3|4 }} unit
 * @param {{ variant?: 'planned'|'recommendation' }} [options] - `variant:
 *   'recommendation'` (round 5) renders term-view.js's "Recommended this
 *   term" flavour: no grab pad, no kebab, a trailing "Add" button, and no
 *   drag affordance/semantics at all (see module doc above).
 * @returns {HTMLLIElement}
 */
export function renderRow(unit, options) {
  const isRecommendation = !!(options && options.variant === 'recommendation');

  const li = document.createElement('li');
  li.className = 'pl-card pl-row' + (isRecommendation ? ' pl-row--recommendation' : '');
  li.dataset.itemId = unit.id;

  if (isRecommendation) {
    // Not draggable: drag.js's onPointerDown bails out on this attribute
    // before it ever picks the row up. No tabIndex/"Move {title}" name
    // either — the hit button below (not the <li>) is the keyboard target.
    li.setAttribute('data-no-drag', 'true');
  } else {
    li.tabIndex = 0;
    li.setAttribute('aria-label', 'Move ' + unit.title);
  }

  // Grab pad — decorative drag affordance at the row's far left edge.
  // aria-hidden: the row itself already carries the "Move {title}"
  // accessible name and is the real drag target (see module doc above).
  // Recommendation rows have no grab pad (nothing to drag).
  let grabPad = null;
  if (!isRecommendation) {
    grabPad = document.createElement('span');
    grabPad.className = 'pl-row-grab';
    grabPad.setAttribute('aria-hidden', 'true');
    grabPad.innerHTML = GRAB_SVG;
  }

  // Hit target: everything a click should open the unit from (thumbnail
  // through the progress bar) — kebab/Add and grab pad are deliberately
  // outside this wrapper, matching card.js's body/kebab split. Planned rows
  // keep a plain <div> (the <li> itself is the focusable/draggable target);
  // recommendation rows use a real <button> so the open action stays
  // keyboard-reachable without a kebab.
  const hit = document.createElement(isRecommendation ? 'button' : 'div');
  if (isRecommendation) hit.type = 'button';
  hit.className = 'pl-card-body pl-row-hit';
  hit.dataset.action = 'open';

  const thumb = document.createElement('span');
  thumb.className = 'pl-row-thumb ' + tintClass(unit.subject);
  thumb.setAttribute('aria-hidden', 'true');
  thumb.textContent = EMBLEM_GLYPH[unit.subject] || '';

  const name = document.createElement('span');
  name.className = 'pl-row-name';
  name.textContent = unit.title;

  const subjectYear = document.createElement('span');
  subjectYear.className = 'pl-row-subject-year';
  const subjectEl = document.createElement('span');
  subjectEl.className = 'pl-row-subject';
  subjectEl.textContent = unit.subjectLabel;
  const yearEl = document.createElement('span');
  yearEl.className = 'pl-row-year';
  yearEl.textContent = unit.yearLabel;
  subjectYear.appendChild(subjectEl);
  subjectYear.appendChild(yearEl);

  const content = document.createElement('span');
  content.className = 'pl-row-content';
  const lessonsLine = document.createElement('span');
  lessonsLine.className = 'pl-row-content-line';
  lessonsLine.textContent = pluralizeLabel(unit.lessons.length, 'Lesson');
  content.appendChild(lessonsLine);
  if (unit.assessment) {
    const assessmentLine = document.createElement('span');
    assessmentLine.className = 'pl-row-content-line';
    assessmentLine.textContent = pluralizeLabel(1, 'Assessment');
    content.appendChild(assessmentLine);
  }

  const progress = buildProgress(unit);

  hit.appendChild(thumb);
  hit.appendChild(name);
  hit.appendChild(subjectYear);
  hit.appendChild(content);
  hit.appendChild(progress);

  // Trailing control: planned rows get the meatballs menu (same Open/—/
  // Remove menu as the card's kebab, kebab.js, horizontal glyph per
  // Edward's reference row); recommendation rows get an "Add" button
  // instead (reuses the Add Units drawer's `.pl-drawer-add-btn` look —
  // Edward's feedback: "like the drawer's Add"), wired generically via the
  // same `data-action` delegation planner.js already uses for open/remove.
  let trailing;
  if (isRecommendation) {
    trailing = document.createElement('button');
    trailing.type = 'button';
    trailing.className = 'pl-drawer-add-btn pl-row-add-btn';
    trailing.dataset.action = 'add';
    trailing.textContent = 'Add';
    trailing.setAttribute('aria-label', 'Add ' + unit.title + ' to this term');
  } else {
    trailing = buildKebab({ orientation: 'horizontal' });
  }

  if (grabPad) li.appendChild(grabPad);
  li.appendChild(hit);
  li.appendChild(trailing);

  return li;
}
