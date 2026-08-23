/**
 * Planner prototype — Add Units drawer (brief §6).
 *
 * Built on `drawer-shell.js`'s shared in-frame drawer shell (round 4:
 * extracted once unit-drawer.js needed the identical mechanics) — this
 * module owns only the Add Units CONTENT: the three-step header (✕ / ←) and
 * body (subject list, then a subject's unit list, then round 8's unit
 * detail). See drawer-shell.js for the shell itself (slide-from-right,
 * scrim, inert background, manual focus trap, Escape/scrim/✕ close, focus
 * return, animation).
 *
 * Three steps:
 *   1. "Add units" — a vertical list of subject cards.
 *   2. {Subject name} — units grouped by year, each row a two-target
 *      pattern (round 8, matching the term row's own convention): a
 *      `.pl-drawer-unit-hit` button (thumbnail + name/meta) drills into
 *      step 3 for that unit; a separate `.pl-drawer-add-btn` sibling adds it
 *      to the planner as a shortcut WITHOUT drilling in, flips to
 *      "Added ✓", and leaves the drawer open on this step.
 *   3. (round 8) Unit detail — the SAME shared renderer as the standalone
 *      unit-detail drawer (unit-detail.js's `buildUnitDetail()`, via
 *      `createUnitDetailController()`), rendered into this drawer's own
 *      body instead of a second `<dialog>`. One template, two hosts — no
 *      forked markup or CSS. Reached by clicking a step-2 row's hit button;
 *      the header shows ONLY "←" (never both ✕ and ←, same rule as step 2's
 *      ✕-less header), which returns to step 2 on the SAME subject, restored
 *      to the scroll position it was at when the user drilled in.
 *
 * "Added" (step 2) and in-planner state (step 3) are both derived from the
 * current board state every time they render (`getUnits().some(u => u.id
 * === unit.id)`) rather than cached, so an Add from step 3 is reflected in
 * step 2's "Added ✓" button the moment the user goes back, and removing a
 * unit from the board makes its catalogue entry addable again the next time
 * either step renders.
 *
 * XSS: every dynamic string goes through textContent, never innerHTML.
 * The two innerHTML assignments below are static, hand-authored icon
 * markup — no interpolation — same pattern as card.js's kebab icon.
 * unit-detail.js's own doc covers step 3's content.
 */

import { drawerCatalogue } from './planner-data.js';
import { createDrawerShell } from './drawer-shell.js';
import { createUnitDetailController } from './unit-detail.js';

/**
 * Two-letter subject emblem glyphs (brief §6 mockup: En / Ma / Sc / Te / HA).
 * Exported: row.js (brief §4's term-view unit row) and unit-detail.js's
 * consumers reuse the same glyphs for their own subject-tinted elements, so
 * a subject shows one consistent abbreviation everywhere it appears.
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

/** id for step 3's title heading (unit-detail.js's title block) — distinct
 * from the standalone unit drawer's `pl-unit-drawer-title` (unit-drawer.js)
 * since both drawers' `<dialog>` elements exist in the DOM at once and a
 * duplicate `id` would break `aria-labelledby` resolution. */
const UNIT_DETAIL_TITLE_ID = 'pl-drawer-unit-title';

function pluralize(count, word) {
  return count + ' ' + word + (count === 1 ? '' : 's');
}

/**
 * Term with the fewest units currently on the board; ties resolve to the
 * lowest term number (brief §6 "Term targeting"). On an empty board every
 * count is 0, so this always returns Term 1. Exported: unit-detail.js's
 * "Add to planner" action uses the exact same fallback rule as this
 * drawer's own Add button.
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
 * @param {(id: string) => void} config.remove - (round 8) Step 3's "Remove
 *   from planner" — same store call the standalone unit drawer uses.
 * @param {(unitId: string, lessonId: string) => (boolean|null)} config.toggleLesson - (round 8)
 * @param {(unitId: string) => (boolean|null)} config.toggleAssessment - (round 8)
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
  const {
    getUnits,
    add,
    remove,
    toggleLesson,
    toggleAssessment,
    announce,
    fallbackFocusEl,
    frameEl,
    inertEl,
    getActiveTerm,
  } = config;

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
  // Step tracking (round 8) — which step is showing and, for step
  // 2<->3, which subject/scroll position to return to. `currentStep` also
  // drives the header's one-control-only rule (renderSubjectStep/
  // renderUnitStep/renderUnitDetailStep below each set the full header
  // state themselves) and backBtn's routing (see its click handler below).
  // ------------------------------------------------------------------
  let currentStep = 'subject'; // 'subject' | 'unit-list' | 'unit-detail'
  let currentSubject = null;
  let unitListScrollTop = 0;

  // Step 3's content engine — the SAME shared renderer the standalone unit
  // drawer uses (unit-detail.js), rendering into this drawer's own `body`
  // instead of a second dialog. In-planner state is derived live on every
  // render, so an Add from here is reflected the moment the user goes back
  // to step 2 (that step's own render also derives "Added" live — see
  // renderUnitStep below).
  const unitDetail = createUnitDetailController({
    getUnits,
    add,
    remove,
    toggleLesson,
    toggleAssessment,
    announce,
    getActiveTerm,
    container: body,
    titleId: UNIT_DETAIL_TITLE_ID,
    // "Remove from planner" from step 3: unlike the standalone drawer
    // (which closes — nothing else to show once the unit's gone), this
    // drawer still has somewhere useful to send the user back to.
    onRemoved: () => renderUnitStep(currentSubject, { scrollTop: unitListScrollTop }),
    // Shouldn't happen in this prototype, but don't render stale/empty
    // content — fall back to the unit list (or subjects, if that's gone
    // too).
    onMissingUnit: () => renderUnitStep(currentSubject, { scrollTop: unitListScrollTop }),
  });

  // ------------------------------------------------------------------
  // Step rendering
  // ------------------------------------------------------------------

  function renderSubjectStep() {
    currentStep = 'subject';
    currentSubject = null;
    unitListScrollTop = 0;
    unitDetail.clear();

    // Leading header control is ✕ at the root, ← once drilled into a
    // subject or a unit — never both at once (brief §6 mockup shows only
    // one).
    closeBtn.hidden = false;
    backBtn.hidden = true;
    headerEmblem.hidden = true;
    title.hidden = false;
    title.textContent = 'Add units';
    dialog.setAttribute('aria-labelledby', 'pl-drawer-title');

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

  /**
   * Round 8: two-target pattern (same idea as row.js's recommendation
   * row) — `.pl-drawer-unit-hit` is a real `<button>` covering the
   * thumbnail/name/meta and drills into step 3 for this unit;
   * `.pl-drawer-add-btn` is a separate sibling button, not nested inside
   * it, so the add-as-shortcut action keeps its own hit target with no
   * nested-button DOM.
   * @param {import('./planner-data.js').CatalogueUnit} unit
   * @param {boolean} added
   * @param {(unitId: string) => void} onOpen
   */
  function buildUnitRow(unit, added, onOpen) {
    const row = document.createElement('div');
    row.className = 'pl-drawer-unit';
    row.dataset.unitId = unit.id;

    const hit = document.createElement('button');
    hit.type = 'button';
    hit.className = 'pl-drawer-unit-hit';
    hit.dataset.action = 'open';

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

    hit.appendChild(thumb);
    hit.appendChild(unitBody);
    hit.addEventListener('click', () => onOpen(unit.id));

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

    row.appendChild(hit);
    row.appendChild(addBtn);
    return row;
  }

  /**
   * @param {string} subjectKey
   * @param {{ scrollTop?: number, focus?: boolean }} [opts] - `scrollTop`
   *   restores the list's scroll position (used when returning from step 3
   *   — either via backBtn or a Reset-triggered refresh); `focus: false`
   *   (used only by the Reset-triggered refresh) skips the usual
   *   backBtn.focus() so an in-place data refresh doesn't steal focus from
   *   wherever it currently is.
   */
  function renderUnitStep(subjectKey, opts) {
    const group = drawerCatalogue.find((g) => g.subject === subjectKey);
    if (!group) return;

    const options = opts || {};
    currentStep = 'unit-list';
    currentSubject = subjectKey;
    unitDetail.clear();

    closeBtn.hidden = true;
    backBtn.hidden = false;
    backBtn.setAttribute('aria-label', 'Back to subjects');
    headerEmblem.hidden = false;
    headerEmblem.className = 'pl-emblem pl-emblem-sm ' + tintClass(subjectKey);
    headerEmblem.textContent = EMBLEM_GLYPH[subjectKey] || '';
    title.hidden = false;
    title.textContent = group.subjectLabel;
    dialog.setAttribute('aria-labelledby', 'pl-drawer-title');

    body.textContent = '';
    const list = document.createElement('div');
    list.className = 'pl-drawer-unit-list';

    // Derived fresh every render — never cached — so a unit removed from
    // the board (from here or from step 3) shows as addable again here.
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
        .forEach((unit) =>
          list.appendChild(
            buildUnitRow(unit, isAdded(unit.id), (unitId) => {
              unitListScrollTop = body.scrollTop;
              renderUnitDetailStep(unitId);
            })
          )
        );
    });

    body.appendChild(list);
    if (typeof options.scrollTop === 'number') body.scrollTop = options.scrollTop;
    if (options.focus !== false) backBtn.focus({ preventScroll: true });
  }

  /**
   * Step 3 (round 8) — drills into the shared unit-detail renderer for one
   * unit, in place inside this same drawer. Header shows ONLY "←" (back to
   * the unit list on the same subject); the dialog's `aria-labelledby` is
   * repointed at the detail's own title heading (unit-detail.js) for the
   * duration of this step.
   * @param {string} unitId
   */
  function renderUnitDetailStep(unitId) {
    if (!unitDetail.resolveUnit(unitId)) return;

    currentStep = 'unit-detail';

    closeBtn.hidden = true;
    headerEmblem.hidden = true;
    title.hidden = true;
    title.textContent = '';
    backBtn.hidden = false;
    backBtn.setAttribute('aria-label', 'Back to unit list');
    dialog.setAttribute('aria-labelledby', UNIT_DETAIL_TITLE_ID);

    unitDetail.render(unitId);

    // preventScroll: true — see the note in drawer-shell.js's open().
    const heading = body.querySelector('#' + UNIT_DETAIL_TITLE_ID);
    if (heading) heading.focus({ preventScroll: true });
  }

  closeBtn.addEventListener('click', () => shell.requestClose());

  // One control only (never both ✕ and ←): step 2's back returns to the
  // subject list; step 3's back returns to step 2 on the SAME subject,
  // restored to the scroll position captured when the user drilled in.
  backBtn.addEventListener('click', () => {
    if (currentStep === 'unit-detail') {
      renderUnitStep(currentSubject, { scrollTop: unitListScrollTop });
    } else {
      renderSubjectStep();
    }
  });

  /**
   * Open the drawer at step 1.
   * @param {HTMLElement} [triggerEl]
   */
  function open(triggerEl) {
    shell.open(triggerEl, renderSubjectStep);
  }

  /**
   * Re-render whichever step is currently showing from fresh store data
   * (Reset while this drawer is open) — a no-op-safe alternative to closing
   * it out from under the user. Step 1 (subjects) never varies with store
   * state, so there's nothing to refresh there.
   */
  function refresh() {
    if (currentStep === 'unit-list' && currentSubject) {
      const preservedScrollTop = body.scrollTop;
      renderUnitStep(currentSubject, { scrollTop: preservedScrollTop, focus: false });
    } else if (currentStep === 'unit-detail') {
      unitDetail.refresh();
    }
  }

  return { open, close: shell.requestClose, isOpen: shell.isOpen, refresh };
}
