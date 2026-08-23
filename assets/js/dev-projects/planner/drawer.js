/**
 * Planner prototype — Add Units drawer (brief §6).
 *
 * Built on `drawer-shell.js`'s shared in-frame drawer shell (round 4:
 * extracted once unit-drawer.js needed the identical mechanics) — this
 * module owns only the Add Units CONTENT: the two-step header (✕ / ←) and
 * body (subject list, then a subject's unit list). See drawer-shell.js for
 * the shell itself (slide-from-right, scrim, inert background, manual focus
 * trap, Escape/scrim/✕ close, focus return, animation).
 *
 * Two steps:
 *   1. "Add units" — a vertical list of subject cards.
 *   2. {Subject name} — units grouped by year, each with a per-unit Add
 *      button. Adding a unit calls the caller's `add(unit, term)`, flips
 *      the button to "Added ✓", and leaves the drawer open.
 *
 * "Added" is derived from the current board state every time step 2 is
 * rendered (`getUnits().some(u => u.id === unit.id)`) rather than cached, so
 * removing a unit from the board makes its catalogue entry addable again
 * the next time the drawer opens (or re-opens on the same subject).
 *
 * XSS: every dynamic string goes through textContent, never innerHTML.
 * The two innerHTML assignments below are static, hand-authored icon
 * markup — no interpolation — same pattern as card.js's kebab icon.
 */

import { drawerCatalogue } from './planner-data.js';
import { createDrawerShell } from './drawer-shell.js';

/**
 * Two-letter subject emblem glyphs (brief §6 mockup: En / Ma / Sc / Te / HA).
 * Exported: row.js (brief §4's term-view unit row) and unit-drawer.js
 * (round 4's unit-detail drawer) reuse the same glyphs for their own
 * subject-tinted elements, so a subject shows one consistent abbreviation
 * everywhere it appears.
 */
export const EMBLEM_GLYPH = {
  english: 'En',
  maths: 'Ma',
  science: 'Sc',
  technologies: 'Te',
  hass: 'HA',
};

/** Subject key -> --pl-tint-*-bg/-ink token suffix (technologies uses "tech"). */
const TINT_SUFFIX = {
  english: 'english',
  maths: 'maths',
  science: 'science',
  technologies: 'tech',
  hass: 'hass',
};

/** Exported alongside EMBLEM_GLYPH for the same reuse reason. */
export function tintClass(subject) {
  return 'pl-tint-' + (TINT_SUFFIX[subject] || subject);
}

const CLOSE_SVG =
  '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
  '</svg>';

const BACK_SVG =
  '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
  '</svg>';

function pluralize(count, word) {
  return count + ' ' + word + (count === 1 ? '' : 's');
}

/**
 * Term with the fewest units currently on the board; ties resolve to the
 * lowest term number (brief §6 "Term targeting"). On an empty board every
 * count is 0, so this always returns Term 1. Exported (round 6): the
 * unit-detail drawer's "Add to planner" action (unit-drawer.js) uses the
 * exact same fallback rule as this drawer's own Add button.
 *
 * @param {() => object[]} getUnits
 * @returns {1|2|3|4}
 */
export function termWithFewestUnits(getUnits) {
  const units = getUnits();
  let bestTerm = 1;
  let bestCount = Infinity;
  for (let term = 1; term <= 4; term++) {
    const count = units.filter((u) => u.term === term).length;
    if (count < bestCount) {
      bestCount = count;
      bestTerm = term;
    }
  }
  return bestTerm;
}

/**
 * @param {Object} config
 * @param {() => object[]} config.getUnits
 * @param {(unit: { id: string }, term: 1|2|3|4) => void} config.add
 * @param {(msg: string) => void} config.announce
 * @param {HTMLElement} [config.fallbackFocusEl] - Focus target used when the
 *   button that opened the drawer no longer exists when it closes (e.g. the
 *   empty-board state's Add Units button, which gets replaced by the board
 *   render once the first unit lands).
 * @param {HTMLElement} config.frameEl - The product window frame
 *   (`.pl-frame`) the drawer and its scrim mount into as direct children.
 * @param {HTMLElement} config.inertEl - The frame's other content (toolbar +
 *   board), sent `inert` while the drawer is open.
 * @param {() => ('all'|1|2|3|4)} [config.getActiveTerm] - Term-targeting rule
 *   (brief §6 callout, updated for tabs): while a TERM tab is active, an
 *   added unit lands in that term; from All Terms (or if this is omitted),
 *   it falls back to the term with the fewest units.
 */
export function createAddUnitsDrawer(config) {
  const { getUnits, add, announce, fallbackFocusEl, frameEl, inertEl, getActiveTerm } = config;

  const shell = createDrawerShell({
    frameEl,
    inertEl,
    fallbackFocusEl,
    dialogClassName: 'pl-drawer',
    labelledBy: 'pl-drawer-title',
  });
  const { dialog } = shell;

  const header = document.createElement('div');
  header.className = 'pl-drawer-header';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'pl-drawer-icon-btn';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = CLOSE_SVG;

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'pl-drawer-icon-btn';
  backBtn.setAttribute('aria-label', 'Back to subjects');
  backBtn.innerHTML = BACK_SVG;
  backBtn.hidden = true;

  const headerEmblem = document.createElement('span');
  headerEmblem.className = 'pl-emblem pl-emblem-sm';
  headerEmblem.setAttribute('aria-hidden', 'true');
  headerEmblem.hidden = true;

  const title = document.createElement('h2');
  title.className = 'pl-drawer-title';
  title.id = 'pl-drawer-title';
  title.tabIndex = -1;

  header.appendChild(closeBtn);
  header.appendChild(backBtn);
  header.appendChild(headerEmblem);
  header.appendChild(title);

  const body = document.createElement('div');
  body.className = 'pl-drawer-body';

  dialog.appendChild(header);
  dialog.appendChild(body);

  // ------------------------------------------------------------------
  // Step rendering
  // ------------------------------------------------------------------

  function renderSubjectStep() {
    // Leading header control is ✕ at the root, ← once drilled into a
    // subject — never both at once (brief §6 mockup shows only one).
    closeBtn.hidden = false;
    backBtn.hidden = true;
    headerEmblem.hidden = true;
    title.textContent = 'Add units';

    body.textContent = '';
    const list = document.createElement('div');
    list.className = 'pl-drawer-subject-list';

    drawerCatalogue.forEach((group) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'pl-drawer-subject-card';

      const emblem = document.createElement('span');
      emblem.className = 'pl-emblem ' + tintClass(group.subject);
      emblem.setAttribute('aria-hidden', 'true');
      emblem.textContent = EMBLEM_GLYPH[group.subject] || '';

      const name = document.createElement('span');
      name.className = 'pl-drawer-subject-name';
      name.textContent = group.subjectLabel;

      card.appendChild(emblem);
      card.appendChild(name);
      card.addEventListener('click', () => renderUnitStep(group.subject));

      list.appendChild(card);
    });

    body.appendChild(list);
    // preventScroll: true — see the note in drawer-shell.js's open(). At
    // this point the drawer may still be off-canvas (translateX(100%), its
    // closed-state transform), and a default focus() would scroll
    // .pl-frame to reveal it.
    title.focus({ preventScroll: true });
  }

  function setAddButtonState(btn, added) {
    btn.disabled = added;
    btn.classList.toggle('pl-drawer-add-btn--added', added);
    btn.textContent = added ? 'Added ✓' : 'Add';
  }

  function buildUnitRow(unit, added) {
    const row = document.createElement('div');
    row.className = 'pl-drawer-unit';
    row.dataset.unitId = unit.id;

    const thumb = document.createElement('span');
    thumb.className = 'pl-drawer-unit-thumb ' + tintClass(unit.subject);
    thumb.setAttribute('aria-hidden', 'true');

    const unitBody = document.createElement('span');
    unitBody.className = 'pl-drawer-unit-body';

    const unitTitle = document.createElement('span');
    unitTitle.className = 'pl-drawer-unit-title';
    unitTitle.textContent = unit.title;

    // Counts derive from the catalogue's lessons/assessment arrays — never
    // a cached count field (round 4: the catalogue is the single source of
    // truth for a unit's content, see planner-data.js).
    const meta = document.createElement('span');
    meta.className = 'pl-drawer-unit-meta';
    meta.textContent =
      pluralize(unit.lessons.length, 'lesson') + ' · ' + pluralize(unit.assessment ? 1 : 0, 'assessment');

    unitBody.appendChild(unitTitle);
    unitBody.appendChild(meta);

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'pl-drawer-add-btn';
    setAddButtonState(addBtn, added);

    addBtn.addEventListener('click', () => {
      if (addBtn.disabled) return;
      // Term targeting (brief §6, updated by Edward for tabs): a unit added
      // while a TERM tab is active lands in that term; otherwise (All Terms,
      // or no tab-awareness wired at all) fall back to fewest-units.
      const active = typeof getActiveTerm === 'function' ? getActiveTerm() : null;
      const term =
        Number.isInteger(active) && active >= 1 && active <= 4
          ? active
          : termWithFewestUnits(getUnits);
      // planner-state.js's add() only reads `.id` — content always resolves
      // from the catalogue, never from this object.
      add({ id: unit.id }, term);
      // Disabling the just-clicked (and currently focused) button below
      // makes the UA blur it to <body> — outside the dialog, where the
      // manual Tab-trap keydown listener (bound to `dialog`) never fires,
      // silently breaking the focus trap. Move focus to `backBtn` (always
      // present and enabled in this step) first, synchronously, so it
      // never leaves the dialog.
      backBtn.focus({ preventScroll: true });
      setAddButtonState(addBtn, true);
      announce('Added ' + unit.title + ' to Term ' + term + '.');
    });

    row.appendChild(thumb);
    row.appendChild(unitBody);
    row.appendChild(addBtn);
    return row;
  }

  function renderUnitStep(subjectKey) {
    const group = drawerCatalogue.find((g) => g.subject === subjectKey);
    if (!group) return;

    closeBtn.hidden = true;
    backBtn.hidden = false;
    headerEmblem.hidden = false;
    headerEmblem.className = 'pl-emblem pl-emblem-sm ' + tintClass(subjectKey);
    headerEmblem.textContent = EMBLEM_GLYPH[subjectKey] || '';
    title.textContent = group.subjectLabel;

    body.textContent = '';
    const list = document.createElement('div');
    list.className = 'pl-drawer-unit-list';

    // Derived fresh every render — never cached — so a unit removed from
    // the board earlier in the session shows as addable again here.
    const boardUnits = getUnits();
    const isAdded = (id) => boardUnits.some((u) => u.id === id);

    const seenYears = [];
    group.units.forEach((unit) => {
      if (seenYears.indexOf(unit.yearLabel) === -1) seenYears.push(unit.yearLabel);
    });

    seenYears.forEach((yearLabel) => {
      const heading = document.createElement('h3');
      heading.className = 'pl-drawer-group-heading';
      heading.textContent = yearLabel;
      list.appendChild(heading);

      group.units
        .filter((unit) => unit.yearLabel === yearLabel)
        .forEach((unit) => list.appendChild(buildUnitRow(unit, isAdded(unit.id))));
    });

    body.appendChild(list);
    backBtn.focus({ preventScroll: true });
  }

  closeBtn.addEventListener('click', () => shell.requestClose());
  backBtn.addEventListener('click', renderSubjectStep);

  /**
   * Open the drawer at step 1.
   * @param {HTMLElement} [triggerEl]
   */
  function open(triggerEl) {
    shell.open(triggerEl, renderSubjectStep);
  }

  return { open, close: shell.requestClose, isOpen: shell.isOpen };
}
