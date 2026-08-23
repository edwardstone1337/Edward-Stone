/**
 * Planner prototype — entry point (Milestone 1: All Terms Kanban board;
 * Milestone 2: Add Units drawer; Milestone 3: tab bar + term views;
 * product-window restructure per Edward's feedback below).
 *
 * Composes the store (planner-state.js), the generic board renderer
 * (board.js), the single-term panel renderer (term-view.js), the card
 * (card.js) and row (row.js) renderers, the drag core (drag.js) and the Add
 * Units drawer (drawer.js) into the existing #main of projects/planner.html.
 * No compact variant yet — that's a later milestone (see
 * docs/superpowers/specs/2026-08-23-planner-prototype-design.md).
 *
 * DOM shape (top to bottom, inside #main's hero):
 *   .pl-planner
 *     .pl-demo-row          — demo-only chrome (Reset, alone, right-aligned),
 *                              styled as portfolio-page UI, NOT part of the
 *                              simulated product
 *     .pl-frame              — the simulated product window (see
 *                              project-planner.css); position:relative, the
 *                              drawer's containing block
 *       .pl-frame-titlebar    — decorative, aria-hidden
 *       .pl-frame-body        — scrollable product surface
 *         .pl-tabbar            — tablist (All Terms · Term 1–4) + the
 *                                 "+ Add Units" action row, in line (brief §2)
 *         #pl-board-root        — tabpanel: the All Terms board (unchanged)
 *         #pl-term-panel         — tabpanel: the active term's row list (brief §4)
 *         (live region)
 *       (drawer + scrim mount here too, as direct children of .pl-frame —
 *        see drawer.js)
 *
 * Board and term panel share ONE store (planner-state.js) and are both kept
 * live via `subscribe()` regardless of which tab is currently visible, so
 * switching tabs always reflects current data with no separate re-fetch.
 */

import { getUnits, subscribe, move, remove, add, reset } from './planner-state.js';
import { createBoard } from './board.js';
import { createTermView } from './term-view.js';
import { renderCard } from './card.js';
import { renderRow } from './row.js';
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

/** Tab bar definitions, in display order (brief §2) — "All Terms" first. */
const TAB_DEFS = [
  { key: 'all', label: 'All Terms', id: 'pl-tab-all', controls: 'pl-board-root' },
  { key: 1, label: 'Term 1', id: 'pl-tab-term-1', controls: 'pl-term-panel' },
  { key: 2, label: 'Term 2', id: 'pl-tab-term-2', controls: 'pl-term-panel' },
  { key: 3, label: 'Term 3', id: 'pl-tab-term-3', controls: 'pl-term-panel' },
  { key: 4, label: 'Term 4', id: 'pl-tab-term-4', controls: 'pl-term-panel' },
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

function closeAllMenus(rootEl) {
  rootEl.querySelectorAll('.pl-kebab-menu:not([hidden])').forEach((menu) => {
    menu.hidden = true;
    const btn = menu.previousElementSibling;
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Wire up the kebab menu (open/close/outside-click) and the card/row body's
 * no-op "open" click. Delegated on a stable root so re-rendering never leaks
 * per-item listeners. Card.js's cards and row.js's rows share the same
 * `.pl-kebab` / `[data-action]` markup, so this same function is called
 * once for the board root and once for the term panel — nothing here is
 * board- or row-specific.
 */
function setupCardInteractions(rootEl, announce) {
  rootEl.addEventListener('click', (e) => {
    const kebabBtn = e.target.closest('.pl-kebab-btn');
    if (kebabBtn) {
      e.stopPropagation();
      const menu = kebabBtn.nextElementSibling;
      const wasOpen = kebabBtn.getAttribute('aria-expanded') === 'true';
      closeAllMenus(rootEl);
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
        // Card/row body clicks can carry a trailing synthetic click after a
        // real pointer drag; the kebab's "Open" item can't (kebab is
        // excluded from drag activation), so only guard the body case.
        if (actionEl.classList.contains('pl-card-body') && shouldSuppressClick()) return;
        closeAllMenus(rootEl);
        showSnackbar("Opening units isn't part of this demo");
        return;
      }

      if (actionEl.dataset.action === 'remove') {
        closeAllMenus(rootEl);
        const unit = getUnits().find((u) => u.id === id);
        remove(id);
        if (unit) announce('Removed ' + unit.title + '.');
        return;
      }
      return;
    }

    // Click landed inside the root but on none of the above — close any
    // open kebab menu (e.g. clicking a different card or empty column space).
    closeAllMenus(rootEl);
  });

  rootEl.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openMenu = rootEl.querySelector('.pl-kebab-menu:not([hidden])');
    if (!openMenu) return;
    const btn = openMenu.previousElementSibling;
    openMenu.hidden = true;
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (!rootEl.contains(e.target)) closeAllMenus(rootEl);
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
 * Build the tab bar: an accessible tablist (brief §2 — All Terms · Term 1–4,
 * roving tabindex, Left/Right/Home/End) plus a slot for the "+ Add Units"
 * action row, right-aligned in the same line and visible on every tab.
 * @returns {{ tabbarEl: HTMLElement, tabListEl: HTMLElement, actionsEl: HTMLElement, tabEls: HTMLButtonElement[] }}
 */
function buildTabBar() {
  const tabbarEl = document.createElement('div');
  tabbarEl.className = 'pl-tabbar';

  const tabListEl = document.createElement('div');
  tabListEl.className = 'pl-tabs';
  tabListEl.setAttribute('role', 'tablist');
  tabListEl.setAttribute('aria-label', 'Planner view');

  const tabEls = TAB_DEFS.map((def, i) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'pl-tab';
    tab.id = def.id;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(i === 0));
    tab.setAttribute('aria-controls', def.controls);
    tab.tabIndex = i === 0 ? 0 : -1;
    tab.dataset.tabKey = String(def.key);
    tab.textContent = def.label;
    tabListEl.appendChild(tab);
    return tab;
  });

  // "+ Add Units" lives in this slot (populated by the caller) — reuses the
  // existing .pl-toolbar class (right-aligned) so it sits in line with the
  // tabs, visible on every tab (brief §2).
  const actionsEl = document.createElement('div');
  actionsEl.className = 'pl-toolbar';

  tabbarEl.appendChild(tabListEl);
  tabbarEl.appendChild(actionsEl);

  return { tabbarEl, tabListEl, actionsEl, tabEls };
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
  // Demo chrome (Edward's feedback: this controls the DEMO, not the
  // simulated product — it sits above the window frame, styled as
  // portfolio-page UI, not product UI). Reset alone, right-aligned:
  // re-seeds the 6-unit starting fixture (Term 4 empty by design — see
  // planner-data.js). No Filled/Empty toggle: the fixture itself now shows
  // the zero state naturally via Term 4's empty tab / empty board column.
  // ------------------------------------------------------------------
  const demoRow = document.createElement('div');
  demoRow.className = 'pl-demo-row';

  // Reuses the shared .dp-btn component (portfolio chrome), not a
  // planner-scoped .pl-btn — this button isn't part of the simulated
  // product either.
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'dp-btn dp-btn-secondary';
  resetBtn.textContent = 'Reset demo';

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

  const { tabbarEl, tabListEl, actionsEl, tabEls } = buildTabBar();

  const addUnitsBtn = document.createElement('button');
  addUnitsBtn.type = 'button';
  addUnitsBtn.className = 'pl-btn pl-btn-primary';
  addUnitsBtn.textContent = '+ Add Units';
  actionsEl.appendChild(addUnitsBtn);

  const boardRootEl = document.createElement('div');
  boardRootEl.id = 'pl-board-root';
  boardRootEl.setAttribute('role', 'tabpanel');
  boardRootEl.setAttribute('aria-labelledby', 'pl-tab-all');

  // The term panel is a SINGLE reused tabpanel — whichever term tab is
  // active, its content (and aria-labelledby) is rebuilt for that term; see
  // selectTab() below. There is one row-list at a time, not four hidden ones.
  const termPanelEl = document.createElement('div');
  termPanelEl.id = 'pl-term-panel';
  termPanelEl.setAttribute('role', 'tabpanel');
  termPanelEl.setAttribute('aria-labelledby', 'pl-tab-term-1');
  termPanelEl.hidden = true;

  const liveRegion = document.createElement('div');
  liveRegion.className = 'pl-visually-hidden';
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');

  frameBody.appendChild(tabbarEl);
  frameBody.appendChild(boardRootEl);
  frameBody.appendChild(termPanelEl);
  frameBody.appendChild(liveRegion);
  frame.appendChild(frameBody);

  section.appendChild(demoRow);
  section.appendChild(frame);
  rootEl.appendChild(section);

  const announce = createAnnouncer(liveRegion);

  // 'all' | 1 | 2 | 3 | 4 — which tab is currently active. Read by the
  // drawer's term-targeting rule (brief §6, updated for tabs) below.
  let activeTab = 'all';

  // The drawer opens INSIDE the frame (not the page/top layer) and, while
  // open, sends `frameBody` (the tab bar + board/term panel) `inert` — see
  // drawer.js.
  const drawer = createAddUnitsDrawer({
    getUnits,
    add,
    announce,
    fallbackFocusEl: addUnitsBtn,
    frameEl: frame,
    inertEl: frameBody,
    getActiveTerm: () => activeTab,
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
      description: 'Use Add Units above to plan what your class will learn each term.',
    },
  });

  const termView = createTermView({
    root: termPanelEl,
    getItems: (term) => getUnits().filter((unit) => unit.term === term),
    getItemId: (unit) => unit.id,
    renderRow,
    listLabel: (term) => 'Term ' + term + ' units',
    emptyState: {
      title: 'Nothing planned for this term yet. Use Add Units to plan this term.',
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

  // Term-view drag: modelled as a board with exactly ONE column (the active
  // term) — this single-entry array is mutated in place (never replaced) as
  // the active term changes, so drag.js (which captures `columns` once, by
  // reference, at attachDragging() call time below) always resolves against
  // whichever term is currently showing. Cross-term drag never applies here
  // (brief §4), so one column is all it ever needs.
  const termColumns = [{ id: 1, label: 'Term 1' }];

  attachDragging({
    root: termPanelEl,
    columns: termColumns,
    getColumnListEl: () => termView.getColumnListEl(),
    move,
    render: () => termView.render(activeTab, { skipAnimation: false }),
    setRenderSuspended: termView.setRenderSuspended,
    announce,
    columnEmptyText: COLUMN_EMPTY_TEXT,
  });

  setupCardInteractions(boardRootEl, announce);
  setupCardInteractions(termPanelEl, announce);

  // ------------------------------------------------------------------
  // Tab bar wiring — accessible tablist pattern: roving tabindex,
  // aria-selected, Left/Right/Home/End move AND activate (brief §2).
  // ------------------------------------------------------------------
  function selectTab(key) {
    if (key === activeTab) return;
    activeTab = key;

    tabEls.forEach((tab) => {
      const isActive = tab.dataset.tabKey === String(key);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    if (key === 'all') {
      boardRootEl.hidden = false;
      termPanelEl.hidden = true;
      closeAllMenus(termPanelEl);
    } else {
      boardRootEl.hidden = true;
      termPanelEl.hidden = false;
      closeAllMenus(boardRootEl);

      termColumns[0].id = key;
      termColumns[0].label = 'Term ' + key;
      termPanelEl.setAttribute('aria-labelledby', 'pl-tab-term-' + key);
      // skipAnimation: true — this render is caused by switching TO this
      // tab, not by a data change, so it should not replay FLIP/enter for
      // every row (Edward's feedback) — same idea as board.js's own
      // first-render guard.
      termView.render(key, { skipAnimation: true });
    }
  }

  function tabKeyFromEl(tabEl) {
    return tabEl.dataset.tabKey === 'all' ? 'all' : Number(tabEl.dataset.tabKey);
  }

  tabEls.forEach((tab) => {
    tab.addEventListener('click', () => selectTab(tabKeyFromEl(tab)));
  });

  tabListEl.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const currentIndex = tabEls.indexOf(document.activeElement);
    if (currentIndex === -1) return;
    e.preventDefault();

    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabEls.length;
    else if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabEls.length) % tabEls.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = tabEls.length - 1;

    const nextTab = tabEls[nextIndex];
    selectTab(tabKeyFromEl(nextTab));
    nextTab.focus();
  });

  // Reset always re-seeds the 6-unit starting fixture (Term 4 empty by
  // design — see planner-data.js).
  resetBtn.addEventListener('click', () => {
    closeAllMenus(boardRootEl);
    closeAllMenus(termPanelEl);
    reset();
    announce('Demo reset to the starting units.');
  });

  subscribe(() => {
    if (!board.isRenderSuspended()) board.render();
    // Term lists render from the same live state as the board (Edward's
    // feedback): any store change re-renders the active term tab's panel
    // too, so switching back to it (or an add/remove/drag while already on
    // it) always reflects current data. Not a tab switch, so animate normally.
    if (activeTab !== 'all' && !termView.isRenderSuspended()) {
      termView.render(activeTab, { skipAnimation: false });
    }
  });

  board.render();
}
