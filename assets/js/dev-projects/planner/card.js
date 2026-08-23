/**
 * Planner prototype — Kanban card renderer (brief §3).
 *
 * Builds the card DOM only. All interaction (kebab menu open/close, card
 * body click, drag pick-up) is wired by delegated listeners in planner.js
 * against the board's root element, so re-rendering the board never leaks
 * per-card event listeners.
 *
 * Field order is fixed: meta line, title (2-line clamp), progress bar,
 * kebab (top-right). No image, no counts, no badges, no dates — see
 * brief §3 "Deliberately NOT on the card".
 */

import { buildKebab } from './kebab.js';
import { unitProgress } from './planner-data.js';

/**
 * Render one Kanban card for a planner unit.
 *
 * @param {import('./planner-data.js').CatalogueUnit & { term: 1|2|3|4 }} unit
 * @returns {HTMLLIElement}
 */
export function renderCard(unit) {
  const li = document.createElement('li');
  li.className = 'pl-card';
  li.tabIndex = 0;
  li.setAttribute('aria-label', 'Move ' + unit.title);
  li.dataset.itemId = unit.id;

  // Kebab (ghost icon button, top-right) — opens the unit drawer via
  // planner.js's delegated "open" action (see setupCardInteractions()).
  const kebabWrap = buildKebab();

  // Body (meta line, title, progress) — clickable, opens the unit drawer
  const body = document.createElement('div');
  body.className = 'pl-card-body';
  body.dataset.action = 'open';

  const meta = document.createElement('span');
  meta.className = 'pl-card-meta';
  meta.textContent = unit.subjectLabel + ' · ' + unit.yearLabel;

  const title = document.createElement('span');
  title.className = 'pl-card-title';
  title.textContent = unit.title;

  // Progress is always DERIVED from lessons[].done + assessment.done — never
  // read from a stored number (see planner-data.js's unitProgress()).
  const { fraction } = unitProgress(unit);
  const progressPct = Math.round(fraction * 100);
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

  body.appendChild(meta);
  body.appendChild(title);
  body.appendChild(progressWrap);

  li.appendChild(kebabWrap);
  li.appendChild(body);

  return li;
}
