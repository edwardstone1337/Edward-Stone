/**
 * Planner prototype — session-only state store.
 *
 * Single flat array of PlannerUnit (see planner-data.js). There is no Term
 * entity and no placement record: `term` is a field on the unit, and order
 * within a term is the array order — moves splice the array rather than
 * writing an index. Seeded from the fixture; never touches localStorage.
 */

import { plannerFixture } from './planner-data.js';

/** @type {import('./planner-data.js').PlannerUnit[]} */
let units = [];

/** @type {Array<(units: import('./planner-data.js').PlannerUnit[]) => void>} */
const listeners = [];

function clone(list) {
  return list.map((unit) => ({ ...unit }));
}

function notify() {
  const snapshot = clone(units);
  listeners.forEach((fn) => fn(snapshot));
}

/**
 * Subscribe to state changes. Returns an unsubscribe function.
 * @param {(units: import('./planner-data.js').PlannerUnit[]) => void} fn
 * @returns {() => void}
 */
export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i !== -1) listeners.splice(i, 1);
  };
}

/**
 * Current units, as a defensive copy (array order = display order).
 * @returns {import('./planner-data.js').PlannerUnit[]}
 */
export function getUnits() {
  return clone(units);
}

/**
 * Reseed the store from the fixture, discarding all session changes.
 */
export function reset() {
  units = clone(plannerFixture);
  notify();
}

/**
 * Move a unit to a term at a given index. Idempotent, handles both
 * cross-term moves and within-term reorders. `index` counts only the
 * OTHER units already in the destination term (i.e. the position the
 * moved unit should land at among its new term-mates) — this matches
 * the "count elements before the drop point" convention drag.js uses
 * when resolving a drop target.
 *
 * @param {string} id
 * @param {1|2|3|4} term
 * @param {number} index
 */
export function move(id, term, index) {
  const from = units.findIndex((u) => u.id === id);
  if (from === -1) return;

  const [unit] = units.splice(from, 1);
  unit.term = term;

  const safeIndex = Math.max(0, index);
  let seen = 0;
  let insertAt = units.length; // default: end of array (= end of this term too)

  for (let i = 0; i < units.length; i++) {
    if (units[i].term === term) {
      if (seen === safeIndex) {
        insertAt = i;
        break;
      }
      seen++;
    }
  }

  units.splice(insertAt, 0, unit);
  notify();
}

/**
 * Remove a unit permanently (no confirm, matches the prototype).
 * @param {string} id
 */
export function remove(id) {
  const before = units.length;
  units = units.filter((u) => u.id !== id);
  if (units.length !== before) notify();
}

/**
 * Add a new unit to a term (appended at the end of that term).
 * @param {import('./planner-data.js').PlannerUnit} unit
 * @param {1|2|3|4} term
 */
export function add(unit, term) {
  units.push({ ...unit, term });
  notify();
}

// Seed on load.
units = clone(plannerFixture);
