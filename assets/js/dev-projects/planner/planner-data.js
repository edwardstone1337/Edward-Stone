/**
 * Planner prototype — catalogue (single source of truth for unit content)
 * + board seed.
 *
 * Placeholder content only: invented unit names and lesson titles, no real
 * curriculum codes or school data.
 *
 * Round 4 data model rework: the drawer catalogue below is now the ONLY
 * place a unit's content lives (title, lessons, assessment). The board seed
 * (`boardSeed`) is just a list of {id, term} placements referencing a
 * catalogue id — planner-state.js resolves each placement against the
 * catalogue on every `getUnits()` call, so there is exactly one copy of any
 * unit's lesson list / completion state in the whole prototype. Progress is
 * never stored as a number: it's always derived from lessons[].done +
 * assessment.done via `unitProgress()` below.
 */

/**
 * @typedef {'english'|'maths'|'science'|'technologies'|'hass'} PlannerSubject
 */

/**
 * @typedef {Object} PlannerLesson
 * @property {string} id
 * @property {string} title
 * @property {boolean} done
 */

/**
 * @typedef {Object} PlannerAssessment
 * @property {string} id
 * @property {string} title
 * @property {boolean} done
 */

/**
 * @typedef {Object} CatalogueUnit
 * @property {string} id
 * @property {PlannerSubject} subject
 * @property {string} subjectLabel - "Science" — drives the tint + meta line
 * @property {string} yearLabel - "Year 3" | "Year 4" — drawer grouping
 *   heading, also shown on the board (row/card meta line, drawer hero).
 * @property {string} title
 * @property {PlannerLesson[]} lessons - 4-8 per unit.
 * @property {PlannerAssessment|null} assessment - 0 or 1 per unit.
 */

/**
 * @typedef {Object} DrawerSubjectGroup
 * @property {PlannerSubject} subject
 * @property {string} subjectLabel
 * @property {CatalogueUnit[]} units
 */

function lesson(unitId, n, title, done) {
  return { id: unitId + '-l' + n, title, done: !!done };
}

function assessment(unitId, title, done) {
  return { id: unitId + '-a1', title, done: !!done };
}

/**
 * Add Units drawer catalogue: five subjects, each with a handful of
 * invented placeholder units grouped by year. This is the single source of
 * truth for every unit's content — the board seed below only references
 * these ids. All names are placeholders — no real curriculum codes.
 *
 * Seeded completion (round 10 reseed, Edward's brief): simulates a teacher
 * late in the school year, Term 4 still ahead. Term 1 (u1 Patterns and
 * Algebra, u2 Poetry Out Loud, u7 Night and Day) and Term 2 (u3 Forces and
 * Friction, u5 Digital Systems All Around Us) are fully complete. Term 3
 * has one unit ~75% done (de-tec-4-2 Coding Our First Game, 6 of 8 items)
 * and one ~25% done (de-has-4-2 Australia's Neighbours, 2 of 8 items).
 * Term 4 (de-mat-3-1 Fractions and Sharing) hasn't started. Every other
 * catalogue unit is untouched (nothing done yet).
 *
 * @type {DrawerSubjectGroup[]}
 */
export const drawerCatalogue = [
  {
    subject: 'english',
    subjectLabel: 'English',
    units: [
      {
        id: 'u2', subject: 'english', subjectLabel: 'English', title: 'Poetry Out Loud', yearLabel: 'Year 3',
        // Fully complete (round 10 reseed: Term 1) — Edward's brief.
        lessons: [
          lesson('u2', 1, 'What makes a poem a poem?', true),
          lesson('u2', 2, 'Rhyme and rhythm scavenger hunt', true),
          lesson('u2', 3, 'Choosing performance poems', true),
          lesson('u2', 4, 'Reading aloud with expression', true),
          lesson('u2', 5, 'Poetry Out Loud showcase', true),
        ],
        assessment: assessment('u2', 'Poetry recitation performance', true),
      },
      {
        id: 'de-eng-3-2', subject: 'english', subjectLabel: 'English', title: 'Tall Tales and Tellers', yearLabel: 'Year 3',
        lessons: [
          lesson('de-eng-3-2', 1, 'What is a tall tale?'),
          lesson('de-eng-3-2', 2, 'Exaggeration and larger-than-life heroes'),
          lesson('de-eng-3-2', 3, "Mapping a tall tale's structure"),
          lesson('de-eng-3-2', 4, 'Drafting our own tall tale'),
          lesson('de-eng-3-2', 5, 'Peer feedback circle'),
          lesson('de-eng-3-2', 6, 'Publishing our tall tales'),
        ],
        assessment: assessment('de-eng-3-2', 'Tall tale writing portfolio', false),
      },
      {
        id: 'u6', subject: 'english', subjectLabel: 'English', title: 'Stories of the Past', yearLabel: 'Year 4',
        lessons: [
          lesson('u6', 1, 'How do we learn about the past?'),
          lesson('u6', 2, 'Reading historical narratives'),
          lesson('u6', 3, 'Primary vs secondary sources'),
          lesson('u6', 4, 'Building a story timeline'),
          lesson('u6', 5, 'Writing from a historical viewpoint'),
          lesson('u6', 6, 'Sharing our stories of the past'),
        ],
        assessment: assessment('u6', 'Historical narrative writing task', false),
      },
      {
        id: 'de-eng-4-2', subject: 'english', subjectLabel: 'English', title: 'Persuasive Writing Workshop', yearLabel: 'Year 4',
        lessons: [
          lesson('de-eng-4-2', 1, 'What is persuasive writing?'),
          lesson('de-eng-4-2', 2, 'Finding strong arguments'),
          lesson('de-eng-4-2', 3, 'Using persuasive language devices'),
          lesson('de-eng-4-2', 4, 'Structuring a persuasive text'),
          lesson('de-eng-4-2', 5, 'Drafting our persuasive piece'),
          lesson('de-eng-4-2', 6, 'Revising with a writing partner'),
          lesson('de-eng-4-2', 7, 'Publishing and presenting'),
        ],
        assessment: assessment('de-eng-4-2', 'Persuasive essay', false),
      },
    ],
  },
  {
    subject: 'maths',
    subjectLabel: 'Mathematics',
    units: [
      {
        id: 'de-mat-3-1', subject: 'maths', subjectLabel: 'Mathematics', title: 'Fractions and Sharing', yearLabel: 'Year 3',
        // 0% complete (round 10 reseed: Term 4, not yet started) — Edward's
        // brief. Already all-false, nothing to change.
        lessons: [
          lesson('de-mat-3-1', 1, 'Sharing equally, sharing fairly'),
          lesson('de-mat-3-1', 2, 'What is a fraction?'),
          lesson('de-mat-3-1', 3, 'Fractions on a number line'),
          lesson('de-mat-3-1', 4, 'Comparing simple fractions'),
          lesson('de-mat-3-1', 5, 'Fractions in everyday life'),
          lesson('de-mat-3-1', 6, 'Fractions problem-solving'),
        ],
        assessment: assessment('de-mat-3-1', 'Fractions check-in', false),
      },
      {
        id: 'de-mat-3-2', subject: 'maths', subjectLabel: 'Mathematics', title: 'Shape and Symmetry', yearLabel: 'Year 3',
        lessons: [
          lesson('de-mat-3-2', 1, 'Naming 2D shapes'),
          lesson('de-mat-3-2', 2, 'Finding lines of symmetry'),
          lesson('de-mat-3-2', 3, 'Symmetry in nature and art'),
          lesson('de-mat-3-2', 4, 'Building symmetrical patterns'),
          lesson('de-mat-3-2', 5, 'Shape and symmetry hunt'),
        ],
        assessment: assessment('de-mat-3-2', 'Shape and symmetry quiz', false),
      },
      {
        id: 'u1', subject: 'maths', subjectLabel: 'Mathematics', title: 'Patterns and Algebra', yearLabel: 'Year 4',
        // Fully complete (round 10 reseed: Term 1) — Edward's brief.
        lessons: [
          lesson('u1', 1, 'Describing number patterns', true),
          lesson('u1', 2, 'Growing and shrinking patterns', true),
          lesson('u1', 3, 'Patterns in tables and charts', true),
          lesson('u1', 4, 'Function machines', true),
          lesson('u1', 5, 'Finding the rule', true),
          lesson('u1', 6, 'Creating our own patterns', true),
          lesson('u1', 7, 'Patterns and algebra challenge', true),
        ],
        assessment: assessment('u1', 'Patterns and algebra test', true),
      },
      {
        id: 'de-mat-4-2', subject: 'maths', subjectLabel: 'Mathematics', title: 'Measurement and Data', yearLabel: 'Year 4',
        lessons: [
          lesson('de-mat-4-2', 1, 'Choosing the right unit'),
          lesson('de-mat-4-2', 2, 'Measuring length and perimeter'),
          lesson('de-mat-4-2', 3, 'Collecting and organising data'),
          lesson('de-mat-4-2', 4, 'Reading column graphs'),
          lesson('de-mat-4-2', 5, 'Interpreting data displays'),
          lesson('de-mat-4-2', 6, 'Measurement and data project'),
        ],
        assessment: assessment('de-mat-4-2', 'Measurement and data task', false),
      },
    ],
  },
  {
    subject: 'science',
    subjectLabel: 'Science',
    units: [
      {
        id: 'u7', subject: 'science', subjectLabel: 'Science', title: 'Night and Day', yearLabel: 'Year 3',
        // Fully complete (round 10 reseed: Term 1) — Edward's brief.
        lessons: [
          lesson('u7', 1, 'Why do we have day and night?', true),
          lesson('u7', 2, "Earth's rotation", true),
          lesson('u7', 3, 'Shadows through the day', true),
          lesson('u7', 4, 'The Sun, Earth and Moon', true),
          lesson('u7', 5, 'Day and night around the world', true),
          lesson('u7', 6, 'Nocturnal vs diurnal animals', true),
          lesson('u7', 7, 'Modelling the day/night cycle', true),
          lesson('u7', 8, 'Night and Day showcase', true),
        ],
        assessment: assessment('u7', 'Day and night model presentation', true),
      },
      {
        id: 'de-sci-3-2', subject: 'science', subjectLabel: 'Science', title: 'Living Things Grow', yearLabel: 'Year 3',
        lessons: [
          lesson('de-sci-3-2', 1, 'What do living things need?'),
          lesson('de-sci-3-2', 2, 'Life cycles of plants'),
          lesson('de-sci-3-2', 3, 'Life cycles of animals'),
          lesson('de-sci-3-2', 4, 'Growth and change over time'),
          lesson('de-sci-3-2', 5, 'Observing our classroom plant'),
          lesson('de-sci-3-2', 6, 'Living things grow — wrap-up'),
        ],
        assessment: assessment('de-sci-3-2', 'Life cycle diagram task', false),
      },
      {
        id: 'u3', subject: 'science', subjectLabel: 'Science', title: 'Forces and Friction', yearLabel: 'Year 4',
        // Fully complete (round 10 reseed: Term 2) — Edward's brief.
        lessons: [
          lesson('u3', 1, 'What makes things move?', true),
          lesson('u3', 2, 'Friction in everyday life', true),
          lesson('u3', 3, 'Push and pull investigations', true),
          lesson('u3', 4, 'Friction on different surfaces', true),
          lesson('u3', 5, 'Reducing and increasing friction', true),
          lesson('u3', 6, 'Designing a fair test', true),
          lesson('u3', 7, 'Forces and friction showcase', true),
        ],
        assessment: assessment('u3', 'Forces and friction investigation', true),
      },
      {
        id: 'de-sci-4-2', subject: 'science', subjectLabel: 'Science', title: 'Water in Our World', yearLabel: 'Year 4',
        lessons: [
          lesson('de-sci-4-2', 1, "Where is Earth's water?"),
          lesson('de-sci-4-2', 2, 'The water cycle'),
          lesson('de-sci-4-2', 3, 'States of water'),
          lesson('de-sci-4-2', 4, 'Water use and conservation'),
          lesson('de-sci-4-2', 5, 'Water in our world — reflection'),
        ],
        assessment: assessment('de-sci-4-2', 'Water cycle diagram', false),
      },
    ],
  },
  {
    subject: 'technologies',
    subjectLabel: 'Technologies',
    units: [
      {
        id: 'de-tec-3-1', subject: 'technologies', subjectLabel: 'Technologies', title: 'Designing Simple Solutions', yearLabel: 'Year 3',
        lessons: [
          lesson('de-tec-3-1', 1, 'What is a design problem?'),
          lesson('de-tec-3-1', 2, 'Brainstorming solutions'),
          lesson('de-tec-3-1', 3, 'Sketching our designs'),
          lesson('de-tec-3-1', 4, 'Building a prototype'),
          lesson('de-tec-3-1', 5, 'Testing and improving'),
        ],
        assessment: assessment('de-tec-3-1', 'Design solution showcase', false),
      },
      {
        id: 'de-tec-3-2', subject: 'technologies', subjectLabel: 'Technologies', title: 'Materials and Making', yearLabel: 'Year 3',
        lessons: [
          lesson('de-tec-3-2', 1, 'Exploring everyday materials'),
          lesson('de-tec-3-2', 2, 'Choosing materials for a purpose'),
          lesson('de-tec-3-2', 3, 'Making with recycled materials'),
          lesson('de-tec-3-2', 4, 'Materials and Making showcase'),
        ],
        // No assessment for this one — exercises the "omit if none" rule.
        assessment: null,
      },
      {
        id: 'u5', subject: 'technologies', subjectLabel: 'Technologies', title: 'Digital Systems All Around Us', yearLabel: 'Year 4',
        // Fully complete (round 10 reseed: Term 2) — Edward's brief.
        lessons: [
          lesson('u5', 1, 'What is a digital system?', true),
          lesson('u5', 2, 'Input, process, output', true),
          lesson('u5', 3, 'Digital systems at school', true),
          lesson('u5', 4, 'Digital systems at home', true),
          lesson('u5', 5, 'How computers store information', true),
          lesson('u5', 6, 'Digital Systems — wrap-up', true),
        ],
        assessment: assessment('u5', 'Digital systems poster', true),
      },
      {
        id: 'de-tec-4-2', subject: 'technologies', subjectLabel: 'Technologies', title: 'Coding Our First Game', yearLabel: 'Year 4',
        // ~75% complete (6 of 8 items: 6 of 7 lessons, exactly 75% — round 10
        // reseed: Term 3) — Edward's brief.
        lessons: [
          lesson('de-tec-4-2', 1, 'What is an algorithm?', true),
          lesson('de-tec-4-2', 2, 'Sequencing instructions', true),
          lesson('de-tec-4-2', 3, 'Introducing loops', true),
          lesson('de-tec-4-2', 4, 'Using conditionals', true),
          lesson('de-tec-4-2', 5, 'Designing our game', true),
          lesson('de-tec-4-2', 6, 'Building our game', true),
          lesson('de-tec-4-2', 7, 'Coding showcase', false),
        ],
        assessment: assessment('de-tec-4-2', 'Coding project', false),
      },
    ],
  },
  {
    subject: 'hass',
    subjectLabel: 'HASS',
    units: [
      {
        id: 'de-has-3-1', subject: 'hass', subjectLabel: 'HASS', title: 'Community and Remembrance', yearLabel: 'Year 3',
        lessons: [
          lesson('de-has-3-1', 1, 'What is community?'),
          lesson('de-has-3-1', 2, 'Why do we remember?'),
          lesson('de-has-3-1', 3, 'Local memorials and monuments'),
          lesson('de-has-3-1', 4, 'Stories from our community'),
          lesson('de-has-3-1', 5, 'Community and Remembrance reflection'),
        ],
        assessment: assessment('de-has-3-1', 'Community reflection task', false),
      },
      {
        id: 'de-has-3-2', subject: 'hass', subjectLabel: 'HASS', title: 'Then and Now', yearLabel: 'Year 3',
        lessons: [
          lesson('de-has-3-2', 1, 'Comparing then and now'),
          lesson('de-has-3-2', 2, 'How technology has changed'),
          lesson('de-has-3-2', 3, 'How school has changed'),
          lesson('de-has-3-2', 4, 'Interviewing family members'),
          lesson('de-has-3-2', 5, 'Then and now timeline'),
          lesson('de-has-3-2', 6, 'Then and Now showcase'),
        ],
        assessment: assessment('de-has-3-2', 'Then and now presentation', false),
      },
      {
        id: 'u4', subject: 'hass', subjectLabel: 'HASS', title: 'Mapping Our Place', yearLabel: 'Year 4',
        lessons: [
          lesson('u4', 1, 'What is a map?'),
          lesson('u4', 2, 'Map symbols and legends'),
          lesson('u4', 3, 'Grid references'),
          lesson('u4', 4, 'Mapping our school'),
          lesson('u4', 5, 'Mapping our local area'),
          lesson('u4', 6, 'Mapping Our Place showcase'),
        ],
        assessment: assessment('u4', 'Local area map task', false),
      },
      {
        id: 'de-has-4-2', subject: 'hass', subjectLabel: 'HASS', title: "Australia's Neighbours", yearLabel: 'Year 4',
        // ~25% complete (2 of 8 items: 2 of 7 lessons, exactly 25% — round 10
        // reseed: Term 3) — Edward's brief.
        lessons: [
          lesson('de-has-4-2', 1, 'Where is Australia?', true),
          lesson('de-has-4-2', 2, "Australia's nearest neighbours", true),
          lesson('de-has-4-2', 3, 'Comparing cultures', false),
          lesson('de-has-4-2', 4, 'Trade and connections', false),
          lesson('de-has-4-2', 5, 'Similarities and differences', false),
          lesson('de-has-4-2', 6, 'Researching a neighbouring country', false),
          lesson('de-has-4-2', 7, "Australia's Neighbours showcase", false),
        ],
        assessment: assessment('de-has-4-2', 'Country research presentation', false),
      },
    ],
  },
];

/** Flat id -> CatalogueUnit lookup, built once from drawerCatalogue. */
const catalogueById = new Map();
drawerCatalogue.forEach((group) => {
  group.units.forEach((unit) => catalogueById.set(unit.id, unit));
});

/**
 * @param {string} id
 * @returns {CatalogueUnit|undefined}
 */
export function findCatalogueUnit(id) {
  return catalogueById.get(id);
}

/**
 * Deep-cloned seed completion snapshot (round 6), captured once here at
 * module load — before the unit-detail drawer's lesson/assessment toggles
 * (unit-drawer.js) ever mutate a catalogue unit's `done` flags. The
 * catalogue stays the single source of truth for a unit's CONTENT even
 * while its completion state is interactive this round (so every renderer
 * reading `unitProgress()` picks up a toggle immediately, everywhere the
 * unit appears) — but a session-only prototype still needs Reset to
 * genuinely reset, so `resetCatalogueCompletion()` below restores exactly
 * this snapshot rather than the catalogue being permanently mutable.
 * @type {Map<string, { lessons: boolean[], assessment: boolean|null }>}
 */
const seedCompletion = new Map();
drawerCatalogue.forEach((group) => {
  group.units.forEach((unit) => {
    seedCompletion.set(unit.id, {
      lessons: unit.lessons.map((l) => l.done),
      assessment: unit.assessment ? unit.assessment.done : null,
    });
  });
});

/**
 * Toggle one lesson's `done` flag on the catalogue (round 6: the
 * unit-detail drawer's interactive lesson rows, in-planner units only).
 * Mutates the single source of truth directly — every open renderer
 * (board card, term row, the drawer itself) re-derives its progress from
 * this same object on its next render, so a toggle here is what makes
 * "progress recalcs live everywhere" true without a duplicated store.
 * @param {string} unitId
 * @param {string} lessonId
 * @returns {boolean|null} the lesson's new done state, or null if either
 *   id doesn't resolve (caller treats null as a no-op).
 */
export function toggleLessonDone(unitId, lessonId) {
  const unit = catalogueById.get(unitId);
  if (!unit) return null;
  const lesson = unit.lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;
  lesson.done = !lesson.done;
  return lesson.done;
}

/**
 * Toggle a unit's assessment `done` flag (a unit has at most one, so no
 * separate id is needed — see the module's `assessment` field doc).
 * @param {string} unitId
 * @returns {boolean|null}
 */
export function toggleAssessmentDone(unitId) {
  const unit = catalogueById.get(unitId);
  if (!unit || !unit.assessment) return null;
  unit.assessment.done = !unit.assessment.done;
  return unit.assessment.done;
}

/**
 * Restore every catalogue unit's lessons/assessment `done` flags to their
 * original seed values (see `seedCompletion` above). Called by
 * `planner-state.js`'s `reset()` alongside placement reseeding, so Reset
 * undoes BOTH session changes the catalogue can carry this round: board
 * placement and completion state.
 */
export function resetCatalogueCompletion() {
  seedCompletion.forEach((snapshot, unitId) => {
    const unit = catalogueById.get(unitId);
    if (!unit) return;
    unit.lessons.forEach((lesson, i) => {
      lesson.done = snapshot.lessons[i];
    });
    if (unit.assessment && snapshot.assessment != null) {
      unit.assessment.done = snapshot.assessment;
    }
  });
}

/**
 * Flattened catalogue in a fixed, deterministic order (subject groups in
 * their declared order above, units in their declared order within each
 * group) — the pool the "Recommended this term" section (round 5) draws
 * from. Never reordered at runtime, so the same board state always yields
 * the same recommendations (Reset reproduces them exactly).
 * @type {CatalogueUnit[]}
 */
export const flatCatalogue = drawerCatalogue.flatMap((group) => group.units);

/**
 * Board seed: which catalogue units start on the board, and in which term.
 * This is a placement list only — no content lives here (see module doc
 * above).
 *
 * Round 10 reseed (Edward's feedback, reversing round 6's "Term 1 empty"
 * decision): simulates a teacher late in the school year, Term 4 still
 * ahead — no term starts empty any more. Unit counts taper across the year
 * (Term 1 >= Term 2 >= Term 3 >= Term 4: 3/2/2/1) and completion tapers
 * with it (see the `drawerCatalogue` doc above for the exact fractions).
 * `u4` (Mapping Our Place) and `u6` (Stories of the Past), seeded in prior
 * rounds, are unseeded again this round — still addable from the drawer
 * under the same ids, now part of the recommendations pool instead.
 *
 * @type {Array<{ id: string, term: 1|2|3|4 }>}
 */
export const boardSeed = [
  { id: 'u1', term: 1 },
  { id: 'u2', term: 1 },
  { id: 'u7', term: 1 },
  { id: 'u3', term: 2 },
  { id: 'u5', term: 2 },
  { id: 'de-tec-4-2', term: 3 },
  { id: 'de-has-4-2', term: 3 },
  { id: 'de-mat-3-1', term: 4 },
];

/**
 * Derive {completed, total, fraction} from a unit's lessons + assessment.
 * The single place progress is ever computed — nothing stores a progress
 * number.
 * @param {{ lessons: PlannerLesson[], assessment: PlannerAssessment|null }} unit
 * @returns {{ completed: number, total: number, fraction: number }}
 */
export function unitProgress(unit) {
  const lessonsDone = unit.lessons.filter((l) => l.done).length;
  const assessmentDone = unit.assessment && unit.assessment.done ? 1 : 0;
  const completed = lessonsDone + assessmentDone;
  const total = unit.lessons.length + (unit.assessment ? 1 : 0);
  return { completed, total, fraction: total ? completed / total : 0 };
}
