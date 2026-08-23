/**
 * Planner prototype — standalone unit-detail drawer (round 4; round 6
 * restructure; round 7 tweaks to actions placement + copy; round 8: thin
 * shell around the shared unit-detail renderer, unit-detail.js).
 *
 * Replaces the old "Opening units isn't part of this demo" toast: clicking a
 * term-view row's main area, a Kanban card's body, or "Open" in either
 * item's kebab/meatballs menu — or a "Recommended this term" row's main
 * area — opens this drawer instead (wired generically in planner.js's
 * `setupCardInteractions()`, nothing here is row- or card-specific, it just
 * takes a unit id).
 *
 * Built on the same shared shell as the Add Units drawer (drawer-shell.js) —
 * slide-from-right within `.pl-frame`, in-frame scrim, inert background,
 * manual focus trap, Escape/scrim/✕ close, focus return, ~200ms slide. Both
 * drawers must never be open at once; planner.js enforces that by
 * force-closing whichever is open before opening the other (see
 * drawer-shell.js's `requestClose({ animate: false })` doc).
 *
 * Round 8: the unit-detail CONTENT (title block, state-aware actions,
 * progress summary, Lessons/Assessment sections) moved to unit-detail.js
 * once a second host needed it — the Add Units drawer's step 3, added the
 * same round (drawer.js): clicking a unit row's main area in that drawer's
 * unit-list step drills into the identical detail view, in place, inside
 * the same drawer. This module is now just the standalone-drawer SHELL
 * around `createUnitDetailController()`: header (✕ only — no title, see
 * below), body container, and open/close/refresh wiring. All content
 * rendering, in-planner derivation, and the re-render-on-Add/toggle
 * plumbing live in the shared controller.
 *
 * Header keeps ONLY the ✕ — no title. The dialog's `aria-labelledby`
 * instead points at a body heading (unit-detail.js's title block), id
 * `pl-unit-drawer-title` — unique to THIS drawer's `<dialog>` (the Add
 * Units drawer's step 3 uses its own distinct id, `pl-drawer-unit-title`,
 * since both drawers' `<dialog>` elements exist in the DOM simultaneously
 * and a duplicate `id` would break `aria-labelledby` resolution).
 *
 * XSS: unit-detail.js's own doc covers content; nothing dynamic is added
 * here beyond what it already handles.
 */

import { createDrawerShell } from './drawer-shell.js';
import { createUnitDetailController } from './unit-detail.js';

const CLOSE_SVG =
  '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
  '</svg>';

const TITLE_ID = 'pl-unit-drawer-title';

/**
 * @param {Object} config
 * @param {() => object[]} config.getUnits
 * @param {(unit: { id: string }, term: 1|2|3|4) => void} config.add
 * @param {(id: string) => void} config.remove
 * @param {(unitId: string, lessonId: string) => (boolean|null)} config.toggleLesson
 * @param {(unitId: string) => (boolean|null)} config.toggleAssessment
 * @param {(msg: string) => void} config.announce
 * @param {() => ('all'|1|2|3|4)} [config.getActiveTerm]
 * @param {HTMLElement} config.frameEl
 * @param {HTMLElement} config.inertEl
 * @param {HTMLElement} [config.fallbackFocusEl]
 */
export function createUnitDrawer(config) {
  const {
    getUnits,
    add,
    remove,
    toggleLesson,
    toggleAssessment,
    announce,
    getActiveTerm,
    frameEl,
    inertEl,
    fallbackFocusEl,
  } = config;

  const shell = createDrawerShell({
    frameEl,
    inertEl,
    fallbackFocusEl,
    dialogClassName: 'pl-drawer',
    labelledBy: TITLE_ID,
  });
  const { dialog } = shell;

  const header = document.createElement('div');
  header.className = 'pl-drawer-header';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'pl-drawer-icon-btn';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = CLOSE_SVG;

  header.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'pl-drawer-body';

  dialog.appendChild(header);
  dialog.appendChild(body);

  closeBtn.addEventListener('click', () => shell.requestClose());

  const controller = createUnitDetailController({
    getUnits,
    add,
    remove,
    toggleLesson,
    toggleAssessment,
    announce,
    getActiveTerm,
    container: body,
    titleId: TITLE_ID,
    // In-planner "Remove from planner": nothing else useful to show once
    // the unit is gone, so close the drawer (round 6 behaviour, preserved).
    onRemoved: () => shell.requestClose(),
    // Shouldn't happen in this prototype, but close rather than render
    // stale/empty content.
    onMissingUnit: () => shell.requestClose(),
  });

  dialog.addEventListener('close', () => {
    controller.clear();
  });

  /**
   * @param {string} unitId
   * @param {HTMLElement} [triggerEl]
   */
  function open(unitId, triggerEl) {
    if (!controller.resolveUnit(unitId)) return;
    shell.open(triggerEl, () => {
      controller.render(unitId);
      // preventScroll: true — see the note in drawer-shell.js's open(). At
      // this point the drawer may still be off-canvas.
      const heading = body.querySelector('#' + TITLE_ID);
      if (heading) heading.focus({ preventScroll: true });
    });
  }

  return { open, close: shell.requestClose, isOpen: shell.isOpen, refresh: controller.refresh };
}
