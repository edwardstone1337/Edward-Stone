/**
 * Planner prototype — shared kebab (ghost icon button + "Open · — · Remove
 * unit" menu) builder.
 *
 * Both the Kanban card (card.js, brief §3) and the term-view unit row
 * (row.js, brief §4) carry the identical menu, so it lives here once
 * instead of being duplicated. All the actual interaction (open/close,
 * outside-click, the Open/Remove actions themselves) is wired generically
 * in planner.js's delegated `setupCardInteractions()` against the
 * `.pl-kebab-btn` / `[data-action]` markup this produces — this module only
 * builds the DOM.
 *
 * Two icon orientations, same menu underneath: the card's kebab is the
 * classic vertical ⋮ (top-right corner overlay); the term-view row's
 * "meatballs" trigger is a horizontal ⋯ (its own trailing column) — Edward's
 * round-4 reference row. `buildKebab({ orientation: 'horizontal' })` swaps
 * only the glyph; menu markup, classes and behaviour are identical either
 * way.
 */

/** Ghost kebab icon (three vertical dots), static markup — safe to inject. */
const KEBAB_SVG_VERTICAL =
  '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<circle cx="8" cy="3.2" r="1.3" fill="currentColor"/>' +
  '<circle cx="8" cy="8" r="1.3" fill="currentColor"/>' +
  '<circle cx="8" cy="12.8" r="1.3" fill="currentColor"/>' +
  '</svg>';

/** "Meatballs" icon (three horizontal dots), static markup — safe to inject. */
const KEBAB_SVG_HORIZONTAL =
  '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<circle cx="3.2" cy="8" r="1.3" fill="currentColor"/>' +
  '<circle cx="8" cy="8" r="1.3" fill="currentColor"/>' +
  '<circle cx="12.8" cy="8" r="1.3" fill="currentColor"/>' +
  '</svg>';

/**
 * @param {{ orientation?: 'vertical'|'horizontal' }} [options] - Defaults to
 *   'vertical' (card.js's existing top-right kebab). row.js passes
 *   'horizontal' for the meatballs trigger.
 * @returns {HTMLDivElement} `.pl-kebab` wrapper (button + hidden menu).
 */
export function buildKebab(options) {
  const orientation = (options && options.orientation) || 'vertical';

  const kebabWrap = document.createElement('div');
  kebabWrap.className = 'pl-kebab' + (orientation === 'horizontal' ? ' pl-kebab--horizontal' : '');

  const kebabBtn = document.createElement('button');
  kebabBtn.type = 'button';
  kebabBtn.className = 'pl-kebab-btn';
  kebabBtn.setAttribute('aria-label', 'Unit options');
  kebabBtn.setAttribute('aria-haspopup', 'true');
  kebabBtn.setAttribute('aria-expanded', 'false');
  kebabBtn.innerHTML = orientation === 'horizontal' ? KEBAB_SVG_HORIZONTAL : KEBAB_SVG_VERTICAL;

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

  return kebabWrap;
}
