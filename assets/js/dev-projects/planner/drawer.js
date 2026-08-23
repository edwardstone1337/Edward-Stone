/**
 * Planner prototype — Add Units drawer (brief §6).
 *
 * A modal drawer sliding in from the right, built on native <dialog> +
 * showModal(): the browser gives us focus trapping and top-layer stacking
 * for free, so this module only has to handle content, the slide
 * transition, and closing (X / Escape / backdrop click) — see
 * docs/superpowers/specs/2026-08-23-planner-prototype-design.md.
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

/** Two-letter subject emblem glyphs (brief §6 mockup: En / Ma / Sc / Te / HA). */
const EMBLEM_GLYPH = {
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

function tintClass(subject) {
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

const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function pluralize(count, word) {
  return count + ' ' + word + (count === 1 ? '' : 's');
}

/**
 * Term with the fewest units currently on the board; ties resolve to the
 * lowest term number (brief §6 "Term targeting"). On an empty board every
 * count is 0, so this always returns Term 1.
 *
 * @param {() => import('./planner-data.js').PlannerUnit[]} getUnits
 * @returns {1|2|3|4}
 */
function termWithFewestUnits(getUnits) {
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
 * @param {() => import('./planner-data.js').PlannerUnit[]} config.getUnits
 * @param {(unit: import('./planner-data.js').PlannerUnit, term: 1|2|3|4) => void} config.add
 * @param {(msg: string) => void} config.announce
 * @param {HTMLElement} [config.fallbackFocusEl] - Focus target used when the
 *   button that opened the drawer no longer exists when it closes (e.g. the
 *   empty-board state's Add Units button, which gets replaced by the board
 *   render once the first unit lands).
 */
export function createAddUnitsDrawer(config) {
  const { getUnits, add, announce, fallbackFocusEl } = config;

  let lastTrigger = null;

  const dialog = document.createElement('dialog');
  dialog.className = 'pl-drawer';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'pl-drawer-title');

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
  document.body.appendChild(dialog);

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
    title.focus();
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

    const meta = document.createElement('span');
    meta.className = 'pl-drawer-unit-meta';
    meta.textContent =
      pluralize(unit.lessonCount, 'lesson') + ' · ' + pluralize(unit.assessmentCount, 'assessment');

    unitBody.appendChild(unitTitle);
    unitBody.appendChild(meta);

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'pl-drawer-add-btn';
    setAddButtonState(addBtn, added);

    addBtn.addEventListener('click', () => {
      if (addBtn.disabled) return;
      const term = termWithFewestUnits(getUnits);
      // Spread so mutating the store's copy never touches this catalogue
      // entry; term is set explicitly by add(), same contract as the board.
      add({ ...unit }, term);
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
    backBtn.focus();
  }

  // ------------------------------------------------------------------
  // Open / close
  // ------------------------------------------------------------------

  let isClosing = false;

  function finishClose() {
    isClosing = false;
    if (dialog.open) dialog.close();
  }

  function requestClose() {
    if (!dialog.open || isClosing) return;

    if (reduceMotionQuery.matches) {
      dialog.classList.remove('pl-drawer--open');
      dialog.close();
      return;
    }

    isClosing = true;
    dialog.classList.remove('pl-drawer--open');

    const onTransitionEnd = (e) => {
      if (e.target !== dialog || e.propertyName !== 'transform') return;
      dialog.removeEventListener('transitionend', onTransitionEnd);
      finishClose();
    };
    dialog.addEventListener('transitionend', onTransitionEnd);

    // Fallback in case the transition never fires (e.g. this browser lacks
    // support for something above) — matches the nav drawer's own
    // transitionend + timeout pattern (nav-component.js closeDrawer()).
    window.setTimeout(() => {
      dialog.removeEventListener('transitionend', onTransitionEnd);
      finishClose();
    }, 300);
  }

  closeBtn.addEventListener('click', requestClose);
  backBtn.addEventListener('click', renderSubjectStep);

  // Backdrop click: a click that lands on the dialog element itself (not a
  // descendant) means it landed on the ::backdrop or the dialog's own box
  // outside its content — see brief §6 / task spec.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) requestClose();
  });

  // Escape fires 'cancel' (default action: close immediately, no
  // transition). Intercept so it goes through the same animated close as
  // every other path, and so the 'close' listener below always owns focus
  // return.
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    requestClose();
  });

  dialog.addEventListener('close', () => {
    const target =
      lastTrigger && document.body.contains(lastTrigger) ? lastTrigger : fallbackFocusEl;
    if (target && typeof target.focus === 'function') target.focus();
    lastTrigger = null;
  });

  /**
   * Open the drawer at step 1. `triggerEl` is the button that opened it —
   * focus returns there on close (or to `fallbackFocusEl` if it's gone by
   * then, e.g. the empty-board action button after the board re-renders).
   * @param {HTMLElement} [triggerEl]
   */
  function open(triggerEl) {
    lastTrigger = triggerEl || document.activeElement;

    // Open (and become visible) BEFORE building step 1's content: a
    // focus() call on an element inside a still-closed <dialog> is a
    // silent no-op (the UA hides everything under dialog:not([open])).
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }

    renderSubjectStep();

    // Force a reflow so the slide-in transition plays from the off-screen
    // base state rather than jumping straight to open (same trick as the
    // nav drawer's openDrawer()).
    void dialog.offsetHeight;
    dialog.classList.add('pl-drawer--open');
  }

  return { open };
}
