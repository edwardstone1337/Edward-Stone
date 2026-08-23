/**
 * Planner prototype — entry point (Milestone 1: All Terms Kanban board).
 *
 * Composes the store (planner-state.js), the generic board renderer
 * (board.js), the card (card.js) and the drag core (drag.js) into the
 * existing #main of projects/planner.html. No tabs, no drawer, no compact
 * variant yet — those are later milestones (see
 * docs/superpowers/specs/2026-08-23-planner-prototype-design.md).
 */

import { getUnits, subscribe, move, remove, reset, clearAll } from './planner-state.js';
import { createBoard } from './board.js';
import { renderCard } from './card.js';
import { attachDragging, shouldSuppressClick } from './drag.js';
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
 * @param {HTMLElement} rootEl - The page's #main element.
 */
export function initPlanner(rootEl) {
  if (!rootEl) return;

  const section = document.createElement('section');
  section.className = 'pl-planner';
  section.setAttribute('aria-label', 'Class planner');

  const toolbar = document.createElement('div');
  toolbar.className = 'pl-toolbar';

  // Demo-state segmented control (Filled / Empty) — accessible two-option
  // radiogroup, roving tabindex, arrow-key operable. "Filled" is the
  // fixture; "Empty" swaps to the zero-units state so visitors can see it
  // without editing the board down to nothing by hand.
  const demoToggle = document.createElement('div');
  demoToggle.className = 'pl-segmented';
  demoToggle.setAttribute('role', 'radiogroup');
  demoToggle.setAttribute('aria-label', 'Demo data');

  const filledBtn = document.createElement('button');
  filledBtn.type = 'button';
  filledBtn.className = 'pl-segmented-btn';
  filledBtn.setAttribute('role', 'radio');
  filledBtn.setAttribute('aria-checked', 'true');
  filledBtn.textContent = 'Filled';

  const emptyBtn = document.createElement('button');
  emptyBtn.type = 'button';
  emptyBtn.className = 'pl-segmented-btn';
  emptyBtn.setAttribute('role', 'radio');
  emptyBtn.setAttribute('aria-checked', 'false');
  emptyBtn.tabIndex = -1;
  emptyBtn.textContent = 'Empty';

  demoToggle.appendChild(filledBtn);
  demoToggle.appendChild(emptyBtn);

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'pl-btn pl-btn-ghost';
  resetBtn.textContent = 'Reset demo';

  toolbar.appendChild(demoToggle);
  toolbar.appendChild(resetBtn);

  const boardRootEl = document.createElement('div');
  boardRootEl.id = 'pl-board-root';

  const liveRegion = document.createElement('div');
  liveRegion.className = 'pl-visually-hidden';
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');

  section.appendChild(toolbar);
  section.appendChild(boardRootEl);
  section.appendChild(liveRegion);
  rootEl.appendChild(section);

  const announce = createAnnouncer(liveRegion);

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
    },
  });

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

  resetBtn.addEventListener('click', () => {
    closeAllMenus(boardRootEl);
    reset();
    announce('Demo reset to the starting units.');
  });

  // 'filled' | 'empty' — which demo state is currently selected. Reset only
  // makes sense against the fixture, so it's disabled (not hidden, so the
  // toolbar doesn't reflow) whenever Empty is selected.
  let demoState = 'filled';

  function setDemoState(next) {
    if (next === demoState) return;
    demoState = next;

    filledBtn.setAttribute('aria-checked', String(next === 'filled'));
    filledBtn.tabIndex = next === 'filled' ? 0 : -1;
    emptyBtn.setAttribute('aria-checked', String(next === 'empty'));
    emptyBtn.tabIndex = next === 'empty' ? 0 : -1;
    resetBtn.disabled = next === 'empty';

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
