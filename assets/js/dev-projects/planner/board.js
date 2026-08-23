/**
 * Generic kanban board renderer.
 *
 * Deliberately has no planner semantics baked in: it takes a columns
 * definition, an item list, a render-card function and a move callback,
 * and renders <column> x <card> markup with drop targets. Any future
 * prototype can reuse this for its own board.
 *
 * Semantic markup: each column is a labelled group; each column's cards
 * are a <ul>/<li> list so assistive tech gets real list semantics.
 *
 * Every `render()` also plays a FLIP transition (see flip.js) for any card
 * whose position moved between the previous render and this one — keyboard
 * moves, remove/add/reset, and the authoritative re-render after a pointer
 * drop all get a smooth "make room" settle for free. Disabled under
 * prefers-reduced-motion (flip.js's concern, not this module's).
 */

import { captureRects, playFlip } from './flip.js';

/**
 * @typedef {Object} BoardColumn
 * @property {string|number} id
 * @property {string} label
 */

/**
 * @typedef {Object} BoardOptions
 * @property {HTMLElement} root - Container the board renders into.
 * @property {BoardColumn[]} columns
 * @property {() => any[]} getItems - Returns items in display order.
 * @property {(item: any) => string} getItemId
 * @property {(item: any) => string|number} getItemColumn
 * @property {(item: any) => HTMLElement} renderCard - Returns an <li>.
 * @property {string} [boardLabel]
 * @property {string} [columnEmptyText]
 * @property {{ title: string, description: string, actionLabel: string }} [emptyState]
 *   Shown instead of the columns when getItems() is empty.
 */

/**
 * @param {BoardOptions} options
 */
export function createBoard(options) {
  const {
    root,
    columns,
    getItems,
    getItemId,
    getItemColumn,
    renderCard,
    boardLabel = 'Board',
    columnEmptyText = 'Drop a unit here',
    emptyState = null,
  } = options;

  /** Render is suppressed while a drag gesture owns the DOM directly. */
  let renderSuspended = false;

  function setRenderSuspended(value) {
    renderSuspended = value;
  }

  function isRenderSuspended() {
    return renderSuspended;
  }

  /**
   * @param {string|number} columnId
   * @returns {HTMLElement|null} the column's <ul> card list
   */
  function getColumnListEl(columnId) {
    return root.querySelector(
      '.pl-column-list[data-column-id="' + String(columnId).replace(/"/g, '') + '"]'
    );
  }

  function buildEmptyState(cfg) {
    const wrap = document.createElement('div');
    wrap.className = 'pl-empty-board';

    const heading = document.createElement('h3');
    heading.className = 'pl-empty-board-title';
    heading.textContent = cfg.title;

    const desc = document.createElement('p');
    desc.className = 'pl-empty-board-desc';
    desc.textContent = cfg.description;

    wrap.appendChild(heading);
    wrap.appendChild(desc);

    if (cfg.actionLabel) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pl-btn pl-btn-primary';
      btn.textContent = cfg.actionLabel;
      btn.disabled = true;
      wrap.appendChild(btn);
    }

    return wrap;
  }

  function buildColumn(column, items) {
    const colEl = document.createElement('div');
    colEl.className = 'pl-column';

    const headingId = 'pl-col-heading-' + column.id;
    const heading = document.createElement('h3');
    heading.className = 'pl-column-header';
    heading.id = headingId;
    heading.textContent = column.label;

    const listEl = document.createElement('ul');
    listEl.className = 'pl-column-list';
    listEl.dataset.columnId = String(column.id);
    listEl.setAttribute('aria-labelledby', headingId);

    if (items.length === 0) {
      listEl.classList.add('pl-column-list--empty');
      const placeholder = document.createElement('li');
      placeholder.className = 'pl-column-empty';
      placeholder.setAttribute('aria-hidden', 'true');
      placeholder.textContent = columnEmptyText;
      listEl.appendChild(placeholder);
    } else {
      items.forEach((item) => {
        const cardEl = renderCard(item);
        cardEl.dataset.itemId = getItemId(item);
        cardEl.dataset.columnId = String(column.id);
        listEl.appendChild(cardEl);
      });
    }

    colEl.appendChild(heading);
    colEl.appendChild(listEl);
    return colEl;
  }

  function render() {
    const beforeRects = captureRects(Array.from(root.querySelectorAll('.pl-card')));

    const items = getItems();
    root.textContent = '';

    if (items.length === 0 && emptyState) {
      root.appendChild(buildEmptyState(emptyState));
      return;
    }

    const boardEl = document.createElement('div');
    boardEl.className = 'pl-board';
    boardEl.setAttribute('aria-label', boardLabel);

    columns.forEach((column) => {
      const colItems = items.filter((item) => getItemColumn(item) === column.id);
      boardEl.appendChild(buildColumn(column, colItems));
    });

    root.appendChild(boardEl);
    playFlip(Array.from(root.querySelectorAll('.pl-card')), beforeRects);
  }

  return {
    render,
    getColumnListEl,
    setRenderSuspended,
    isRenderSuspended,
  };
}
