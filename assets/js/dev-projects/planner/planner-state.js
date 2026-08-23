/**
 * Planner prototype — session-only state store.
 *
 * Round 4 data model rework: the store now holds PLACEMENTS only — a flat
 * array of `{ id, term }` referencing a `planner-data.js` catalogue id.
 * There is no Term entity and no separate index: order within a term is
 * the array order — moves splice the array rather than writing an index.
 * All unit CONTENT (title, lessons, assessment) lives exactly once, in the
 * catalogue (planner-data.js) — the drawer catalogue is the single source
 * of truth. `getUnits()` resolves each placement against the catalogue on
 * every call and returns full unit objects (catalogue fields + `term`), so
 * a caller never needs to know placements and content are stored
 * separately. Seeded from `boardSeed`; never touches localStorage.
 */

import { boardSeed, findCatalogueUnit } from './planner-data.js';

/** @type {Array<{ id: string, term: 1|2|3|4 }>} */
let placements = [];

/** @type {Array<(units: object[]) => void>} */
const listeners = [];

function clonePlacements(list) {
  return list.map((p) => ({ ...p }));
}

/**
 * Merge a placement with its catalogue content into a full, defensively-
 * cloned unit object (never a live reference into the catalogue, so a
 * caller can't accidentally mutate the single source of truth).
 * @param {{ id: string, term: 1|2|3|4 }} placement
 * @returns {object|null}
 */
function resolveUnit(placement) {
  const catalogueUnit = findCatalogueUnit(placement.id);
  if (!catalogueUnit) return null;
  return {
    ...catalogueUnit,
    lessons: catalogueUnit.lessons.map((l) => ({ ...l })),
    assessment: catalogueUnit.assessment ? { ...catalogueUnit.assessment } : null,
    term: placement.term,
  };
}

function buildUnits() {
  return placements.map(resolveUnit).filter(Boolean);
}

function notify() {
  const snapshot = buildUnits();
  listeners.forEach((fn) => fn(snapshot));
}

/**
 * Subscribe to state changes. Returns an unsubscribe function.
 * @param {(units: object[]) => void} fn
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
 * Current units, resolved against the catalogue (array order = display
 * order). Defensive copy — safe for a caller to hold onto.
 * @returns {object[]}
 */
export function getUnits() {
  return buildUnits();
}

/**
 * Reseed the store from the fixture, discarding all session changes. Note:
 * this only resets PLACEMENTS — completion state lives on the catalogue
 * (planner-data.js) and is never mutated by this prototype (read-only this
 * round), so it doesn't need resetting.
 */
export function reset() {
  placements = clonePlacements(boardSeed);
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
  const from = placements.findIndex((p) => p.id === id);
  if (from === -1) return;

  const [placement] = placements.splice(from, 1);
  placement.term = term;

  const safeIndex = Math.max(0, index);
  let seen = 0;
  let insertAt = placements.length; // default: end of array (= end of this term too)

  for (let i = 0; i < placements.length; i++) {
    if (placements[i].term === term) {
      if (seen === safeIndex) {
        insertAt = i;
        break;
      }
      seen++;
    }
  }

  placements.splice(insertAt, 0, placement);
  notify();
}

/**
 * Remove a unit permanently (no confirm, matches the prototype).
 * @param {string} id
 */
export function remove(id) {
  const before = placements.length;
  placements = placements.filter((p) => p.id !== id);
  if (placements.length !== before) notify();
}

/**
 * Add a new unit to a term (appended at the end of that term). Only the
 * unit's `id` is used — content is always resolved from the catalogue, so
 * passing a plain `{ id }` works exactly the same as passing a full
 * catalogue unit object (drawer.js does the latter, for a stable call
 * shape with the rest of its code).
 * @param {{ id: string }} unit
 * @param {1|2|3|4} term
 */
export function add(unit, term) {
  placements.push({ id: unit.id, term });
  notify();
}

// Seed on load.
placements = clonePlacements(boardSeed);
