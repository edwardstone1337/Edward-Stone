/**
 * Planner prototype — Add Units drawer (brief §6).
 *
 * A drawer sliding in from the right, scoped INSIDE the product window
 * frame (`.pl-frame` in planner.js) rather than the browser's top layer —
 * the frame is a simulated product screen, so nothing here should overlay
 * the rest of the portfolio page. Built on native <dialog>, opened with
 * `.show()` (non-modal) instead of `.showModal()`: this keeps the element
 * in normal document flow (positioned against the frame via CSS, see
 * project-planner.css) instead of the top layer, but forfeits the
 * browser's free focus trapping and Escape-to-cancel, which this module
 * now implements by hand (same idiom as nav-component.js's mobile drawer):
 *  - `inertEl.inert` is toggled while open, so Tab/AT can't reach the
 *    frame's board + toolbar underneath.
 *  - A manual Tab-key focus trap wraps within the dialog's own focusable
 *    elements.
 *  - A manual Escape handler closes it (no native 'cancel' event fires for
 *    a non-modal dialog).
 *  - A scrim element (sibling inside the frame) dims the frame and closes
 *    on click, replacing the native ::backdrop a modal dialog would give
 *    for free.
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

/**
 * Two-letter subject emblem glyphs (brief §6 mockup: En / Ma / Sc / Te / HA).
 * Exported: row.js (brief §4's term-view unit row) reuses the same glyphs
 * for its subject-tinted image panel's placeholder initial, so a subject
 * shows one consistent abbreviation everywhere it appears.
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

/** Exported alongside EMBLEM_GLYPH for the same reuse-in-row.js reason. */
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
 * @param {HTMLElement} config.frameEl - The product window frame
 *   (`.pl-frame`) the drawer and its scrim mount into as direct children —
 *   it's the frame's `position: relative` that anchors them.
 * @param {HTMLElement} config.inertEl - The frame's other content (toolbar +
 *   board), sent `inert` while the drawer is open so it can't be reached by
 *   Tab or assistive tech (no native modal dialog is doing this for free).
 * @param {() => ('all'|1|2|3|4)} [config.getActiveTerm] - Term-targeting rule
 *   (brief §6 callout, updated for tabs): while a TERM tab is active, an
 *   added unit lands in that term; from All Terms (or if this is omitted),
 *   it falls back to the term with the fewest units.
 */
export function createAddUnitsDrawer(config) {
  const { getUnits, add, announce, fallbackFocusEl, frameEl, inertEl, getActiveTerm } = config;

  let lastTrigger = null;

  const scrim = document.createElement('div');
  scrim.className = 'pl-drawer-scrim';

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
  frameEl.appendChild(scrim);
  frameEl.appendChild(dialog);

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
    // preventScroll: true — see the note in open() below. At this point the
    // drawer may still be off-canvas (translateX(100%), its closed-state
    // transform), and a default focus() would scroll .pl-frame to reveal it.
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
      // Term targeting (brief §6, updated by Edward for tabs): a unit added
      // while a TERM tab is active lands in that term; otherwise (All Terms,
      // or no tab-awareness wired at all) fall back to fewest-units.
      const active = typeof getActiveTerm === 'function' ? getActiveTerm() : null;
      const term =
        Number.isInteger(active) && active >= 1 && active <= 4
          ? active
          : termWithFewestUnits(getUnits);
      // Spread so mutating the store's copy never touches this catalogue
      // entry; term is set explicitly by add(), same contract as the board.
      add({ ...unit }, term);
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

  // ------------------------------------------------------------------
  // Open / close
  // ------------------------------------------------------------------

  let isClosing = false;

  function setInert(value) {
    if (inertEl) inertEl.inert = value;
  }

  function finishClose() {
    isClosing = false;
    if (dialog.open) dialog.close();
  }

  function requestClose() {
    if (!dialog.open || isClosing) return;

    if (reduceMotionQuery.matches) {
      dialog.classList.remove('pl-drawer--open');
      scrim.classList.remove('pl-drawer-scrim--visible');
      dialog.close();
      return;
    }

    isClosing = true;
    dialog.classList.remove('pl-drawer--open');
    scrim.classList.remove('pl-drawer-scrim--visible');

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

  // Scrim click closes — the in-frame stand-in for a modal dialog's
  // ::backdrop click (there's no native backdrop without showModal()).
  scrim.addEventListener('click', requestClose);

  // Manual focus trap + Escape: open() below uses .show(), not
  // .showModal(), so neither of the browser's usual conveniences apply
  // here — a non-modal dialog doesn't fire 'cancel' on Escape, and Tab
  // isn't confined to it. Reimplemented by hand, same idiom as
  // nav-component.js's mobile drawer keydown handler.
  function getFocusable() {
    return Array.from(
      dialog.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((el) => el.offsetParent !== null);
  }

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      requestClose();
      return;
    }

    if (e.key !== 'Tab') return;
    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first || !dialog.contains(document.activeElement)) {
        e.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last || !dialog.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    }
  });

  dialog.addEventListener('close', () => {
    setInert(false);
    scrim.classList.remove('pl-drawer-scrim--visible');
    const target =
      lastTrigger && document.body.contains(lastTrigger) ? lastTrigger : fallbackFocusEl;
    if (target && typeof target.focus === 'function') target.focus({ preventScroll: true });
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
    // .show() (not .showModal()) keeps this in normal document flow, inside
    // .pl-frame, instead of promoting it to the browser's top layer.
    if (typeof dialog.show === 'function') {
      dialog.show();
    } else {
      dialog.setAttribute('open', '');
    }

    // Root cause of "everything underneath slides": show() runs the HTML
    // spec's dialog-focusing steps synchronously and — since nothing inside
    // has [autofocus] yet (renderSubjectStep() hasn't run) — focuses the
    // <dialog> itself. At this instant the drawer is still in its
    // closed-state position (`transform: translateX(100%)`, off-canvas past
    // .pl-frame's clipped right edge), so the browser's default
    // focus-scrolls-into-view behaviour scrolls .pl-frame (the nearest
    // clipping/scrollable ancestor) horizontally to reveal it — and nothing
    // ever scrolls it back, so the frame's whole content (titlebar, toolbar,
    // board) stays shifted sideways underneath. This focus step has no
    // options we can pass (it isn't our .focus() call), so the fix is to
    // stamp the scroll straight back to (0,0) synchronously, before any
    // paint. .pl-frame is a clip-only surface — it should never actually
    // scroll — so this is safe unconditionally.
    frameEl.scrollLeft = 0;
    frameEl.scrollTop = 0;

    setInert(true);
    renderSubjectStep();

    // Force a reflow so the slide-in transition plays from the off-screen
    // base state rather than jumping straight to open (same trick as the
    // nav drawer's openDrawer()).
    void dialog.offsetHeight;
    dialog.classList.add('pl-drawer--open');
    scrim.classList.add('pl-drawer-scrim--visible');
  }

  return { open };
}
