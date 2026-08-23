/**
 * Planner prototype — term-view unit row renderer (brief §4).
 *
 * A horizontal counterpart to card.js's vertical Kanban card: same unit,
 * same meta/title/progress fields and the same kebab menu (shared via
 * kebab.js), laid out left-to-right instead of stacked. Two hit targets
 * only, per the brief: the image+body area (`data-action="open"`, same
 * no-op toast as the card) and the kebab — both wired generically by
 * planner.js's delegated `setupCardInteractions()`, nothing row-specific
 * there.
 *
 * The `<li>` carries `.pl-card` (not just `.pl-row`) so it participates in
 * drag.js and its CSS (`.pl-card--dragging`, `.pl-card--picked`,
 * `.pl-card-clone`, focus rings) completely unchanged — `.pl-row` in
 * project-planner.css is a layout-only modifier on top, not a fork.
 */

import { buildKebab } from './kebab.js';
import { EMBLEM_GLYPH, tintClass } from './drawer.js';

/**
 * Render one term-view unit row.
 *
 * @param {import('./planner-data.js').PlannerUnit} unit
 * @returns {HTMLLIElement}
 */
export function renderRow(unit) {
  const li = document.createElement('li');
  li.className = 'pl-card pl-row';
  li.tabIndex = 0;
  li.setAttribute('aria-label', 'Move ' + unit.title);
  li.dataset.itemId = unit.id;

  // Image panel — subject-tinted placeholder art (brief §4 note 1), a
  // large initial in the tint ink colour. Reuses the drawer's subject
  // glyph map so a subject reads the same abbreviation everywhere.
  const image = document.createElement('span');
  image.className = 'pl-row-image ' + tintClass(unit.subject);
  image.setAttribute('aria-hidden', 'true');
  image.textContent = EMBLEM_GLYPH[unit.subject] || '';

  // Hit target 1: image + body together open the unit (brief §4 "Row
  // behaviour" — two hit targets only). Reuses .pl-card-body's existing
  // data-action="open" + click-suppression-after-drag wiring verbatim.
  const hit = document.createElement('div');
  hit.className = 'pl-card-body pl-row-hit';
  hit.dataset.action = 'open';

  const meta = document.createElement('span');
  meta.className = 'pl-card-meta';
  meta.textContent = unit.subjectLabel + ' · Year 4';

  // No 2-line clamp here (brief §4 note 2) — .pl-row-title lifts the base
  // .pl-card-title's clamp.
  const title = document.createElement('span');
  title.className = 'pl-card-title pl-row-title';
  title.textContent = unit.title;

  const progressPct = Math.round(unit.progress * 100);
  const progressWrap = document.createElement('div');
  progressWrap.className = 'pl-card-progress';
  progressWrap.setAttribute('role', 'progressbar');
  progressWrap.setAttribute('aria-valuemin', '0');
  progressWrap.setAttribute('aria-valuemax', '100');
  progressWrap.setAttribute('aria-valuenow', String(progressPct));
  progressWrap.setAttribute('aria-label', unit.title + ' progress');

  const progressFill = document.createElement('div');
  progressFill.className = 'pl-card-progress-fill';
  progressFill.style.width = progressPct + '%';
  progressWrap.appendChild(progressFill);

  hit.appendChild(meta);
  hit.appendChild(title);
  hit.appendChild(progressWrap);

  // Hit target 2: kebab, its own trailing column (brief §4 note 4) — same
  // Open/—/Remove menu as the card, never navigates.
  const kebabWrap = buildKebab();

  li.appendChild(image);
  li.appendChild(hit);
  li.appendChild(kebabWrap);

  return li;
}
