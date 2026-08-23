/**
 * Planner prototype — placeholder data.
 *
 * Placeholder content only: invented unit names, no real curriculum
 * codes or school data. Fixture verbatim from the handover brief §7.
 */

/**
 * @typedef {'english'|'maths'|'science'|'technologies'|'hass'} PlannerSubject
 */

/**
 * @typedef {Object} PlannerUnit
 * @property {string} id
 * @property {PlannerSubject} subject
 * @property {string} subjectLabel - "Science" — drives the tint + meta line
 * @property {string} title
 * @property {number} progress - 0–1, drives the progress bar
 * @property {1|2|3|4} term
 */

/**
 * Starter fixture. Session state is seeded from a deep copy of this array
 * (see planner-state.js `reset()`) so mutating the live store never
 * touches this module's data.
 *
 * @type {PlannerUnit[]}
 */
export const plannerFixture = [
  { id: 'u1', subject: 'maths',        subjectLabel: 'Mathematics',  title: 'Patterns and Algebra',          progress: 0.8, term: 1 },
  { id: 'u2', subject: 'english',      subjectLabel: 'English',      title: 'Poetry Out Loud',               progress: 0.45, term: 1 },
  { id: 'u3', subject: 'science',      subjectLabel: 'Science',      title: 'Forces and Friction',           progress: 0.1, term: 2 },
  { id: 'u4', subject: 'hass',         subjectLabel: 'HASS',         title: 'Mapping Our Place',             progress: 0,   term: 2 },
  { id: 'u5', subject: 'technologies', subjectLabel: 'Technologies', title: 'Digital Systems All Around Us', progress: 0,   term: 3 },
  { id: 'u6', subject: 'english',      subjectLabel: 'English',      title: 'Stories of the Past',           progress: 0,   term: 3 },
  { id: 'u7', subject: 'science',      subjectLabel: 'Science',      title: 'Night and Day',                 progress: 0,   term: 4 }
];
