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

/** Ghost kebab icon (three vertical dots), static markup — safe to inject. */
const KEBAB_SVG =
  '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<circle cx="8" cy="3.2" r="1.3" fill="currentColor"/>' +
  '<circle cx="8" cy="8" r="1.3" fill="currentColor"/>' +
  '<circle cx="8" cy="12.8" r="1.3" fill="currentColor"/>' +
  '</svg>';

/**
 * Render one Kanban card for a planner unit.
 *
 * @param {import('./planner-data.js').PlannerUnit} unit
 * @returns {HTMLLIElement}
 */
export function renderCard(unit) {
  const li = document.createElement('li');
  li.className = 'pl-card';
  li.tabIndex = 0;
  li.setAttribute('aria-label', 'Move ' + unit.title);
  li.dataset.itemId = unit.id;

  // Kebab (ghost icon button, top-right)
  const kebabWrap = document.createElement('div');
  kebabWrap.className = 'pl-kebab';

  const kebabBtn = document.createElement('button');
  kebabBtn.type = 'button';
  kebabBtn.className = 'pl-kebab-btn';
  kebabBtn.setAttribute('aria-label', 'Unit options');
  kebabBtn.setAttribute('aria-haspopup', 'true');
  kebabBtn.setAttribute('aria-expanded', 'false');
  kebabBtn.innerHTML = KEBAB_SVG;

  const menu = document.createElement('div');
  menu.className = 'pl-kebab-menu';
  menu.setAttribute('role', 'menu');
  menu.hidden = true;

  const openItem = document.createElement('button');
  openItem.type = 'button';
  openItem.className = 'pl-kebab-menu-item';
  openItem.setAttribute('role', 'menuitem');
  openItem.dataset.action = 'open';
  openItem.textContent = 'Open';

  const separator = document.createElement('div');
  separator.className = 'pl-kebab-menu-separator';
  separator.setAttribute('role', 'separator');

  const removeItem = document.createElement('button');
  removeItem.type = 'button';
  removeItem.className = 'pl-kebab-menu-item pl-kebab-menu-item--destructive';
  removeItem.setAttribute('role', 'menuitem');
  removeItem.dataset.action = 'remove';
  removeItem.textContent = 'Remove unit';

  menu.appendChild(openItem);
  menu.appendChild(separator);
  menu.appendChild(removeItem);
  kebabWrap.appendChild(kebabBtn);
  kebabWrap.appendChild(menu);

  // Body (meta line, title, progress) — clickable, no-op "open"
  const body = document.createElement('div');
  body.className = 'pl-card-body';
  body.dataset.action = 'open';

  const meta = document.createElement('span');
  meta.className = 'pl-card-meta';
  meta.textContent = unit.subjectLabel + ' · Year 4';

  const title = document.createElement('span');
  title.className = 'pl-card-title';
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

  body.appendChild(meta);
  body.appendChild(title);
  body.appendChild(progressWrap);

  li.appendChild(kebabWrap);
  li.appendChild(body);

  return li;
}
