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

/**
 * @typedef {Object} DrawerUnit
 * @property {string} id - Matches a `plannerFixture` id when the same unit
 *   is already seeded onto the board, so the drawer derives its "Added ✓"
 *   state from live board state instead of duplicating a flag (brief §6).
 * @property {PlannerSubject} subject
 * @property {string} subjectLabel
 * @property {string} title
 * @property {number} lessonCount
 * @property {number} assessmentCount
 * @property {string} yearLabel - "Year 3" | "Year 4" — drawer grouping heading
 * @property {number} progress - Always 0: a unit fresh off the shelf hasn't
 *   been taught yet. Once added it takes on the board's normal progress field.
 */

/**
 * @typedef {Object} DrawerSubjectGroup
 * @property {PlannerSubject} subject
 * @property {string} subjectLabel
 * @property {DrawerUnit[]} units
 */

/**
 * Add Units drawer catalogue (brief §6/§7): five subjects, each with a
 * handful of invented placeholder units grouped by year. All names are
 * placeholders — no real curriculum codes anywhere.
 *
 * @type {DrawerSubjectGroup[]}
 */
export const drawerCatalogue = [
  {
    subject: 'english',
    subjectLabel: 'English',
    units: [
      { id: 'u2', subject: 'english', subjectLabel: 'English', title: 'Poetry Out Loud', lessonCount: 5, assessmentCount: 1, yearLabel: 'Year 3', progress: 0 },
      { id: 'de-eng-3-2', subject: 'english', subjectLabel: 'English', title: 'Tall Tales and Tellers', lessonCount: 6, assessmentCount: 1, yearLabel: 'Year 3', progress: 0 },
      { id: 'u6', subject: 'english', subjectLabel: 'English', title: 'Stories of the Past', lessonCount: 6, assessmentCount: 1, yearLabel: 'Year 4', progress: 0 },
      { id: 'de-eng-4-2', subject: 'english', subjectLabel: 'English', title: 'Persuasive Writing Workshop', lessonCount: 7, assessmentCount: 2, yearLabel: 'Year 4', progress: 0 },
    ],
  },
  {
    subject: 'maths',
    subjectLabel: 'Mathematics',
    units: [
      { id: 'de-mat-3-1', subject: 'maths', subjectLabel: 'Mathematics', title: 'Fractions and Sharing', lessonCount: 6, assessmentCount: 1, yearLabel: 'Year 3', progress: 0 },
      { id: 'de-mat-3-2', subject: 'maths', subjectLabel: 'Mathematics', title: 'Shape and Symmetry', lessonCount: 5, assessmentCount: 1, yearLabel: 'Year 3', progress: 0 },
      { id: 'u1', subject: 'maths', subjectLabel: 'Mathematics', title: 'Patterns and Algebra', lessonCount: 7, assessmentCount: 2, yearLabel: 'Year 4', progress: 0 },
      { id: 'de-mat-4-2', subject: 'maths', subjectLabel: 'Mathematics', title: 'Measurement and Data', lessonCount: 6, assessmentCount: 1, yearLabel: 'Year 4', progress: 0 },
    ],
  },
  {
    subject: 'science',
    subjectLabel: 'Science',
    units: [
      { id: 'u7', subject: 'science', subjectLabel: 'Science', title: 'Night and Day', lessonCount: 8, assessmentCount: 1, yearLabel: 'Year 3', progress: 0 },
      { id: 'de-sci-3-2', subject: 'science', subjectLabel: 'Science', title: 'Living Things Grow', lessonCount: 6, assessmentCount: 1, yearLabel: 'Year 3', progress: 0 },
      { id: 'u3', subject: 'science', subjectLabel: 'Science', title: 'Forces and Friction', lessonCount: 7, assessmentCount: 2, yearLabel: 'Year 4', progress: 0 },
      { id: 'de-sci-4-2', subject: 'science', subjectLabel: 'Science', title: 'Water in Our World', lessonCount: 5, assessmentCount: 1, yearLabel: 'Year 4', progress: 0 },
    ],
  },
  {
    subject: 'technologies',
    subjectLabel: 'Technologies',
    units: [
      { id: 'de-tec-3-1', subject: 'technologies', subjectLabel: 'Technologies', title: 'Designing Simple Solutions', lessonCount: 5, assessmentCount: 1, yearLabel: 'Year 3', progress: 0 },
      { id: 'de-tec-3-2', subject: 'technologies', subjectLabel: 'Technologies', title: 'Materials and Making', lessonCount: 4, assessmentCount: 1, yearLabel: 'Year 3', progress: 0 },
      { id: 'u5', subject: 'technologies', subjectLabel: 'Technologies', title: 'Digital Systems All Around Us', lessonCount: 6, assessmentCount: 1, yearLabel: 'Year 4', progress: 0 },
      { id: 'de-tec-4-2', subject: 'technologies', subjectLabel: 'Technologies', title: 'Coding Our First Game', lessonCount: 7, assessmentCount: 2, yearLabel: 'Year 4', progress: 0 },
    ],
  },
  {
    subject: 'hass',
    subjectLabel: 'HASS',
    units: [
      { id: 'de-has-3-1', subject: 'hass', subjectLabel: 'HASS', title: 'Community and Remembrance', lessonCount: 5, assessmentCount: 1, yearLabel: 'Year 3', progress: 0 },
      { id: 'de-has-3-2', subject: 'hass', subjectLabel: 'HASS', title: 'Then and Now', lessonCount: 6, assessmentCount: 1, yearLabel: 'Year 3', progress: 0 },
      { id: 'u4', subject: 'hass', subjectLabel: 'HASS', title: 'Mapping Our Place', lessonCount: 6, assessmentCount: 1, yearLabel: 'Year 4', progress: 0 },
      { id: 'de-has-4-2', subject: 'hass', subjectLabel: 'HASS', title: "Australia's Neighbours", lessonCount: 7, assessmentCount: 2, yearLabel: 'Year 4', progress: 0 },
    ],
  },
];
