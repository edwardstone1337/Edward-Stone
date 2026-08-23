/**
 * Planner prototype — entry point (Milestone 1: All Terms Kanban board;
 * Milestone 2: Add Units drawer; product-window restructure per Edward's
 * feedback below).
 *
 * Composes the store (planner-state.js), the generic board renderer
 * (board.js), the card (card.js), the drag core (drag.js) and the Add Units
 * drawer (drawer.js) into the existing #main of projects/planner.html. No
 * term tabs or compact variant yet — those are later milestones (see
 * docs/superpowers/specs/2026-08-23-planner-prototype-design.md).
 *
 * DOM shape (top to bottom, inside #main's hero):
 *   .pl-planner
 *     .pl-demo-row          — demo-only chrome (Filled/Empty, Reset), styled
 *                              as portfolio-page UI, NOT part of the
 *                              simulated product
 *     .pl-frame              — the simulated product window (see
 *                              project-planner.css); position:relative, the
 *                              drawer's containing block
 *       .pl-frame-titlebar    — decorative, aria-hidden
 *       .pl-frame-body        — scrollable product surface
 *         .pl-toolbar          — "+ Add Units" (product UI, inside the window)
 *         #pl-board-root
 *         (live region)
 *       (drawer + scrim mount here too, as direct children of .pl-frame —
 *        see drawer.js)
 */

import { getUnits, subscribe, move, remove, add, reset, clearAll } from './planner-state.js';
import { createBoard } from './board.js';
import { renderCard } from './card.js';
import { attachDragging, shouldSuppressClick } from './drag.js';
import { createAddUnitsDrawer } from './drawer.js';
import { showSnackbar } from '../snackbar.js';

/** Column definitions — fixed four terms, in display order (brief §2). */
const COLUMNS = [
  { id: 1, label: 'Term 1' },
  { id: 2, label: 'Term 2' },
  { id: 3, label: 'Term 3' },
  { id: 4, label: 'Term 4' },
];

const COLUMN_EMPTY_TEXT = 'Drop a unit here';

function createAnnouncer(liveRegionEl) {
  return function announce(message) {
    // Clear then set on a tick so identical consecutive messages still
    // get announced by assistive tech (a no-op textContent set is a no-op
    // for many screen readers' live-region diffing).
    liveRegionEl.textContent = '';
    window.setTimeout(() => {
      liveRegionEl.textContent = message;
    }, 30);
  };
}

function closeAllMenus(boardRootEl) {
  boardRootEl.querySelectorAll('.pl-kebab-menu:not([hidden])').forEach((menu) => {
    menu.hidden = true;
    const btn = menu.previousElementSibling;
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Wire up the kebab menu (open/close/outside-click) and the card body's
 * no-op "open" click. Delegated on the board's stable root so re-rendering
 * the board never leaks per-card listeners.
 */
function setupCardInteractions(boardRootEl, announce) {
  boardRootEl.addEventListener('click', (e) => {
    const kebabBtn = e.target.closest('.pl-kebab-btn');
    if (kebabBtn) {
      e.stopPropagation();
      const menu = kebabBtn.nextElementSibling;
      const wasOpen = kebabBtn.getAttribute('aria-expanded') === 'true';
      closeAllMenus(boardRootEl);
      if (!wasOpen && menu) {
        kebabBtn.setAttribute('aria-expanded', 'true');
        menu.hidden = false;
      }
      return;
    }

    const actionEl = e.target.closest('[data-action]');
    if (actionEl) {
      const card = actionEl.closest('.pl-card');
      if (!card) return;
      const id = card.dataset.itemId;

      if (actionEl.dataset.action === 'open') {
        // Card body clicks can carry a trailing synthetic click after a
        // real pointer drag; the kebab's "Open" item can't (kebab is
        // excluded from drag activation), so only guard the body case.
        if (actionEl.classList.contains('pl-card-body') && shouldSuppressClick()) return;
        closeAllMenus(boardRootEl);
        showSnackbar("Opening units isn't part of this demo");
        return;
      }

      if (actionEl.dataset.action === 'remove') {
        closeAllMenus(boardRootEl);
        const unit = getUnits().find((u) => u.id === id);
        remove(id);
        if (unit) announce('Removed ' + unit.title + '.');
        return;
      }
      return;
    }

    // Click landed inside the board but on none of the above — close any
    // open kebab menu (e.g. clicking a different card or empty column space).
    closeAllMenus(boardRootEl);
  });

  boardRootEl.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openMenu = boardRootEl.querySelector('.pl-kebab-menu:not([hidden])');
    if (!openMenu) return;
    const btn = openMenu.previousElementSibling;
    openMenu.hidden = true;
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (!boardRootEl.contains(e.target)) closeAllMenus(boardRootEl);
  });
}

/**
 * Build the decorative titlebar strip for the product window frame. Purely
 * set dressing (three dots + a centered label) — the whole thing is
 * aria-hidden since the page's own heading/labels already identify the
 * widget; nothing here is informative or interactive.
 * @returns {HTMLElement}
 */
function buildFrameTitlebar() {
  const titlebar = document.createElement('div');
  titlebar.className = 'pl-frame-titlebar';
  titlebar.setAttribute('aria-hidden', 'true');

  const dots = document.createElement('div');
  dots.className = 'pl-frame-titlebar-dots';
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    dot.className = 'pl-frame-titlebar-dot';
    dots.appendChild(dot);
  }

  const label = document.createElement('span');
  label.className = 'pl-frame-titlebar-label';
  label.textContent = 'Planner';

  titlebar.appendChild(dots);
  titlebar.appendChild(label);
  return titlebar;
}

/**
 * @param {HTMLElement} rootEl - The page's #main element.
 */
export function initPlanner(rootEl) {
  if (!rootEl) return;

  const section = document.createElement('section');
  section.className = 'pl-planner';
  section.setAttribute('aria-label', 'Class planner');

  // ------------------------------------------------------------------
  // Demo chrome (Edward's feedback: these control the DEMO, not the
  // simulated product — they sit above the window frame, styled as
  // portfolio-page UI, not product UI). Filled/Empty is an accessible
  // two-option radiogroup (roving tabindex, arrow-key operable); Reset
  // re-seeds whichever of the two is currently selected (see resetBtn's
  // click handler below — this is the bug fix: Reset used to be disabled
  // on Empty, stranding a visitor who'd added units from the zero state).
  // ------------------------------------------------------------------
  const demoRow = document.createElement('div');
  demoRow.className = 'pl-demo-row';

  const demoToggle = document.createElement('div');
  demoToggle.className = 'pl-demo-segmented';
  demoToggle.setAttribute('role', 'radiogroup');
  demoToggle.setAttribute('aria-label', 'Demo data');

  const filledBtn = document.createElement('button');
  filledBtn.type = 'button';
  filledBtn.className = 'pl-demo-segmented-btn';
  filledBtn.setAttribute('role', 'radio');
  filledBtn.setAttribute('aria-checked', 'true');
  filledBtn.textContent = 'Filled';

  const emptyBtn = document.createElement('button');
  emptyBtn.type = 'button';
  emptyBtn.className = 'pl-demo-segmented-btn';
  emptyBtn.setAttribute('role', 'radio');
  emptyBtn.setAttribute('aria-checked', 'false');
  emptyBtn.tabIndex = -1;
  emptyBtn.textContent = 'Empty';

  demoToggle.appendChild(filledBtn);
  demoToggle.appendChild(emptyBtn);

  // Reuses the shared .dp-btn component (portfolio chrome), not a
  // planner-scoped .pl-btn — this button isn't part of the simulated
  // product either.
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'dp-btn dp-btn-secondary';
  resetBtn.textContent = 'Reset demo';

  demoRow.appendChild(demoToggle);
  demoRow.appendChild(resetBtn);

  // ------------------------------------------------------------------
  // Product window frame — the simulated app screen. Everything that
  // belongs to the "product" (toolbar, board, drawer) mounts inside it.
  // ------------------------------------------------------------------
  const frame = document.createElement('div');
  frame.className = 'pl-frame';
  frame.appendChild(buildFrameTitlebar());

  const frameBody = document.createElement('div');
  frameBody.className = 'pl-frame-body';

  const toolbar = document.createElement('div');
  toolbar.className = 'pl-toolbar';

  const addUnitsBtn = document.createElement('button');
  addUnitsBtn.type = 'button';
  addUnitsBtn.className = 'pl-btn pl-btn-primary';
  addUnitsBtn.textContent = '+ Add Units';

  toolbar.appendChild(addUnitsBtn);

  const boardRootEl = document.createElement('div');
  boardRootEl.id = 'pl-board-root';

  const liveRegion = document.createElement('div');
  liveRegion.className = 'pl-visually-hidden';
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');

  frameBody.appendChild(toolbar);
  frameBody.appendChild(boardRootEl);
  frameBody.appendChild(liveRegion);
  frame.appendChild(frameBody);

  section.appendChild(demoRow);
  section.appendChild(frame);
  rootEl.appendChild(section);

  const announce = createAnnouncer(liveRegion);

  // The drawer opens INSIDE the frame (not the page/top layer) and, while
  // open, sends `frameBody` (the toolbar + board) `inert` — see drawer.js.
  const drawer = createAddUnitsDrawer({
    getUnits,
    add,
    announce,
    fallbackFocusEl: addUnitsBtn,
    frameEl: frame,
    inertEl: frameBody,
  });

  const board = createBoard({
    root: boardRootEl,
    columns: COLUMNS,
    getItems: getUnits,
    getItemId: (unit) => unit.id,
    getItemColumn: (unit) => unit.term,
    renderCard,
    boardLabel: 'Class planner board',
    columnEmptyText: COLUMN_EMPTY_TEXT,
    emptyState: {
      title: 'No units yet',
      description: 'Add units to plan what your class will learn each term.',
      actionLabel: 'Add Units',
      onAction: (e) => drawer.open(e.currentTarget),
    },
  });

  addUnitsBtn.addEventListener('click', () => drawer.open(addUnitsBtn));

  attachDragging({
    root: boardRootEl,
    columns: COLUMNS,
    getColumnListEl: board.getColumnListEl,
    move,
    render: board.render,
    setRenderSuspended: board.setRenderSuspended,
    announce,
    columnEmptyText: COLUMN_EMPTY_TEXT,
  });

  setupCardInteractions(boardRootEl, announce);

  // 'filled' | 'empty' — which demo state is currently selected.
  let demoState = 'filled';

  // Bug fix: Reset is now ALWAYS enabled and re-seeds whichever scenario is
  // currently selected — Filled restores the 7-unit fixture (as before);
  // Empty clears the board back to the zero state, so a visitor who added
  // units from Empty can still get back to a clean slate.
  resetBtn.addEventListener('click', () => {
    closeAllMenus(boardRootEl);
    if (demoState === 'empty') {
      clearAll();
      announce('Demo reset to the empty planner.');
    } else {
      reset();
      announce('Demo reset to the starting units.');
    }
  });

  function setDemoState(next) {
    if (next === demoState) return;
    demoState = next;

    filledBtn.setAttribute('aria-checked', String(next === 'filled'));
    filledBtn.tabIndex = next === 'filled' ? 0 : -1;
    emptyBtn.setAttribute('aria-checked', String(next === 'empty'));
    emptyBtn.tabIndex = next === 'empty' ? 0 : -1;

    closeAllMenus(boardRootEl);
    if (next === 'empty') {
      clearAll();
      announce('Switched to the empty demo state.');
    } else {
      reset();
      announce('Switched to the filled demo state.');
    }
  }

  filledBtn.addEventListener('click', () => {
    setDemoState('filled');
    filledBtn.focus();
  });
  emptyBtn.addEventListener('click', () => {
    setDemoState('empty');
    emptyBtn.focus();
  });

  demoToggle.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next = demoState === 'filled' ? 'empty' : 'filled';
    setDemoState(next);
    (next === 'filled' ? filledBtn : emptyBtn).focus();
  });

  subscribe(() => {
    if (!board.isRenderSuspended()) board.render();
  });

  board.render();
}
