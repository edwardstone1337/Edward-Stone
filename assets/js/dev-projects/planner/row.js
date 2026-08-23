/**
 * Planner prototype — term-view unit row renderer (round 4 redesign,
 * matching Edward's reference "epic row" layout).
 *
 * A horizontal counterpart to card.js's vertical Kanban card: same unit,
 * laid out left-to-right as, in order: a decorative grab pad, a small
 * subject-tinted thumbnail, the unit name, a subject/year stack, a
 * lessons/assessment content stack, a segmented progress bar, and a
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
 * Segmented progress bar: one segment per lesson, plus a visually distinct
 * final segment for the assessment (if any) — wider gap + its own
 * outlined shape, rather than just another bar segment, so it reads as a
 * different KIND of item, not just one more lesson. Filled = done (success
 * green); unfilled = --pl-surface-2. The wrapper alone carries the
 * `progressbar` semantics (individual segments are presentation only) so
 * assistive tech gets one number, not N.
 *
 * @param {import('./planner-data.js').CatalogueUnit} unit
 * @returns {HTMLDivElement}
 */
function buildSegmentedProgress(unit) {
  const { completed, total } = unitProgress(unit);

  const wrap = document.createElement('div');
  wrap.className = 'pl-row-progress';
  wrap.setAttribute('role', 'progressbar');
  wrap.setAttribute('aria-valuemin', '0');
  wrap.setAttribute('aria-valuemax', String(total));
  wrap.setAttribute('aria-valuenow', String(completed));
  wrap.setAttribute('aria-label', unit.title + ': ' + completed + ' of ' + total + ' complete');

  unit.lessons.forEach((lessonItem) => {
    const seg = document.createElement('span');
    seg.className = 'pl-row-progress-seg' + (lessonItem.done ? ' pl-row-progress-seg--filled' : '');
    wrap.appendChild(seg);
  });

  if (unit.assessment) {
    const seg = document.createElement('span');
    seg.className =
      'pl-row-progress-seg pl-row-progress-seg--assessment' +
      (unit.assessment.done ? ' pl-row-progress-seg--filled' : '');
    wrap.appendChild(seg);
  }

  return wrap;
}

/**
 * Render one term-view unit row.
 *
 * @param {import('./planner-data.js').CatalogueUnit & { term: 1|2|3|4 }} unit
 * @returns {HTMLLIElement}
 */
export function renderRow(unit) {
  const li = document.createElement('li');
  li.className = 'pl-card pl-row';
  li.tabIndex = 0;
  li.setAttribute('aria-label', 'Move ' + unit.title);
  li.dataset.itemId = unit.id;

  // Grab pad — decorative drag affordance at the row's far left edge.
  // aria-hidden: the row itself already carries the "Move {title}"
  // accessible name and is the real drag target (see module doc above).
  const grabPad = document.createElement('span');
  grabPad.className = 'pl-row-grab';
  grabPad.setAttribute('aria-hidden', 'true');
  grabPad.innerHTML = GRAB_SVG;

  // Hit target: everything a click should open the unit from (thumbnail
  // through the progress bar) — kebab and grab pad are deliberately
  // outside this wrapper, matching card.js's body/kebab split.
  const hit = document.createElement('div');
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

  const progress = buildSegmentedProgress(unit);

  hit.appendChild(thumb);
  hit.appendChild(name);
  hit.appendChild(subjectYear);
  hit.appendChild(content);
  hit.appendChild(progress);

  // Trailing meatballs menu — same Open/—/Remove menu as the card's kebab
  // (kebab.js), horizontal glyph per Edward's reference row.
  const kebabWrap = buildKebab({ orientation: 'horizontal' });

  li.appendChild(grabPad);
  li.appendChild(hit);
  li.appendChild(kebabWrap);

  return li;
}
