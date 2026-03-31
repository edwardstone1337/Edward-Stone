#!/usr/bin/env node
'use strict';

/**
 * process-bears.js
 *
 * Batch-processes all SVGs in assets/images/bears/ and outputs:
 *   1. Cleaned SVGs → assets/images/bears/processed/{category}/
 *   2. Manifest      → assets/images/bears/bears-manifest.json
 *
 * Cleaning:
 *   - Preserves <filter> elements inside <defs>, namespaced to avoid ID clashes
 *   - Filter IDs renamed: filter0_xxx_yyy → filter0_[partId]
 *   - filter="url(#...)" references updated to match namespaced IDs
 *   - <g filter="url(#...)"> wrapper elements are preserved (not unwrapped)
 *   - Non-filter content in <defs> is stripped (none expected from Figma)
 *   - Adds data-colorable="skin"      to fill="#A06A4C" elements
 *   - Adds data-colorable="muzzle"    to fill="#CCA48E" elements
 *   - Adds data-colorable="inner-ear" to fill="#E8C2AE" elements
 *
 * No npm packages — Node built-ins (fs, path) only.
 */

const fs   = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────

const ROOT          = path.resolve(__dirname, '..');
const BEARS_DIR     = path.join(ROOT, 'assets', 'images', 'bears');
const OUT_DIR       = path.join(BEARS_DIR, 'processed');
const MANIFEST_PATH = path.join(BEARS_DIR, 'bears-manifest.json');

// Category config: { dir, prefix, partsKey }
// Order matches manifest spec: ears → heads → eyes → mouths
const CATEGORIES = [
  { dir: 'ears',   prefix: 'ears',  partsKey: 'ears'   },
  { dir: 'heads',  prefix: 'head',  partsKey: 'heads'  },
  { dir: 'eyes',   prefix: 'eyes',  partsKey: 'eyes'   },
  { dir: 'mouths', prefix: 'mouth', partsKey: 'mouths' },
];

// Colorable fill values (uppercase keys = exact match in source SVGs)
// Both cases listed so the replace loop handles either variant defensively
const COLORABLE_FILLS = {
  '#A06A4C': 'skin',
  '#a06a4c': 'skin',
  '#CCA48E': 'muzzle',
  '#cca48e': 'muzzle',
  '#E8C2AE': 'inner-ear',
  '#e8c2ae': 'inner-ear',
};

// Fill values that are expected and should NOT be flagged in the verification log
// (task spec: #A06A4C, #CCA48E, #E8C2AE, #000000, black, none + case variants)
const KNOWN_FILLS = new Set([
  '#a06a4c',          // skin
  '#cca48e',          // muzzle
  '#e8c2ae',          // inner-ear
  '#000000', 'black', // outlines / detail
  'none',             // transparent fills (SVG root default)
]);

// ─── SVG helpers ─────────────────────────────────────────────────────────────

/**
 * Escape a string for use as a regex literal.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Namespace filter IDs inside <defs> and update all filter="url(#...)" references.
 *
 * - Each filter ID is renamed: original_id → filterN_[partId]
 * - filter="url(#...)" references in the SVG body are updated to match
 * - Non-filter content in <defs> is stripped (none expected from Figma output)
 * - If <defs> contains no filters, the block is removed entirely
 * - If no <defs> block is present, the SVG is returned unchanged
 */
function namespaceDefs(svg, partId) {
  const defsRe    = /<defs[\s\S]*?<\/defs>/;
  const defsMatch = svg.match(defsRe);
  if (!defsMatch) return svg;

  const defsBlock = defsMatch[0];

  // Collect all filter IDs defined in this defs block
  const filterIdRe = /<filter\b[^>]*\bid="([^"]+)"/g;
  const filterIds  = [];
  let m;
  while ((m = filterIdRe.exec(defsBlock)) !== null) {
    filterIds.push(m[1]);
  }

  // No filters → strip defs entirely
  if (filterIds.length === 0) {
    return svg.replace(defsRe, '');
  }

  // Build old → new ID map
  const idMap = new Map();
  filterIds.forEach((oldId, i) => {
    idMap.set(oldId, `filter${i}_${partId}`);
  });

  // Rename filter id="" attributes inside the defs block
  let newDefs = defsBlock;
  for (const [oldId, newId] of idMap) {
    newDefs = newDefs.replace(
      new RegExp(`\\bid="${escapeRegex(oldId)}"`, 'g'),
      `id="${newId}"`
    );
  }

  // Replace the original defs block with the renamed version
  let result = svg.replace(defsRe, newDefs);

  // Update filter="url(#oldId)" references in the SVG body
  for (const [oldId, newId] of idMap) {
    result = result.replace(
      new RegExp(`filter="url\\(#${escapeRegex(oldId)}\\)"`, 'g'),
      `filter="url(#${newId})"`
    );
  }

  return result;
}

/**
 * Add data-colorable="<value>" to every shape element that carries a
 * known colorable fill.  Only targets path/circle/rect/ellipse/polygon/
 * polyline/line — never the SVG root or any remaining <g> elements.
 *
 * Returns the modified SVG and a Set of colorable values that were added.
 */
function addColorableAttrs(svg) {
  const SHAPE_RE_SRC =
    '(<(?:path|circle|rect|ellipse|polygon|polyline|line)\\b[^>]*' +
    '\\bfill="FILL_PLACEHOLDER"[^>]*?)(\\s*\\/?>)';

  for (const [fillHex, colorableVal] of Object.entries(COLORABLE_FILLS)) {
    // Escape '#' for regex; the hex digits are already safe
    const escaped = fillHex.replace('#', '\\#');
    const re = new RegExp(SHAPE_RE_SRC.replace('FILL_PLACEHOLDER', escaped), 'g');
    svg = svg.replace(re, `$1 data-colorable="${colorableVal}"$2`);
  }
  return svg;
}

/**
 * Collect the set of data-colorable values present in a processed SVG.
 */
function detectColorables(svg) {
  const found = new Set();
  const re = /\bdata-colorable="([^"]+)"/g;
  let m;
  while ((m = re.exec(svg)) !== null) found.add(m[1]);
  return Array.from(found).sort();
}

/**
 * Find fill values that aren't in the expected set.
 * Reports { fill, element } objects for the verification log.
 */
function findUnexpectedFills(svg) {
  const unexpected = [];
  const re = /\bfill="([^"]+)"/g;
  let m;
  while ((m = re.exec(svg)) !== null) {
    const normalised = m[1].toLowerCase();
    if (!KNOWN_FILLS.has(normalised)) {
      unexpected.push(m[1]);
    }
  }
  // Deduplicate
  return [...new Set(unexpected)];
}

/**
 * Extract the viewBox attribute value from the SVG root element.
 */
function extractViewBox(svg) {
  const m = svg.match(/\bviewBox="([^"]+)"/);
  return m ? m[1] : '';
}

/**
 * Count visible shape elements (rough sanity check for empty output).
 */
function countShapes(svg) {
  return (svg.match(/<(?:path|circle|rect|ellipse|polygon|polyline|line)\b/g) || []).length;
}

/**
 * Count <filter> elements present in a processed SVG.
 */
function countFilters(svg) {
  return (svg.match(/<filter\b/g) || []).length;
}

/**
 * Collapse multiple consecutive blank lines into one.
 */
function cleanWhitespace(svg) {
  return svg.replace(/\n(\s*\n){2,}/g, '\n\n').trim();
}

// ─── Filename → semantic ID ──────────────────────────────────────────────────

/**
 * Convert a raw SVG filename to a semantic kebab-case id and output filename.
 *
 * Logic:
 *   1. Take the value after '=' (or the full stem if no '=' present).
 *   2. Lowercase, replace '^' with '-up', collapse non-alphanumeric runs to '-',
 *      trim leading/trailing hyphens.
 *   3. Prefix with category prefix — UNLESS the slug already starts with
 *      '{prefix}-' (avoids "mouth-mouth-soppy" for "Mouth Soppy").
 */
function fileToId(filename, prefix) {
  const stem    = path.basename(filename, '.svg');
  const eqIdx   = stem.indexOf('=');
  const rawValue = eqIdx !== -1 ? stem.slice(eqIdx + 1) : stem;

  const slug = rawValue
    .toLowerCase()
    .replace(/\^/g, '-up')            // ^ → -up  (handles "^^" eye type)
    .replace(/[^a-z0-9]+/g, '-')      // non-alphanumeric runs → hyphen
    .replace(/^-+|-+$/g, '');         // trim leading/trailing hyphens

  const id = slug.startsWith(prefix + '-') ? slug : `${prefix}-${slug}`;
  return { id, outFile: id + '.svg' };
}

// ─── Full SVG processing pipeline ────────────────────────────────────────────

function processSVG(sourcePath, prefix, partId) {
  const source = fs.readFileSync(sourcePath, 'utf8');

  let svg = source;
  svg = namespaceDefs(svg, partId);
  svg = addColorableAttrs(svg);
  svg = cleanWhitespace(svg);

  return {
    svg,
    viewBox:          extractViewBox(svg),
    colorable:        detectColorables(svg),
    unexpectedFills:  findUnexpectedFills(svg),
    shapeCount:       countShapes(svg),
    filterCount:      countFilters(svg),
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────

// Ensure output category subdirectories exist
for (const cat of CATEGORIES) {
  fs.mkdirSync(path.join(OUT_DIR, cat.dir), { recursive: true });
}

// Build manifest skeleton
const manifest = {
  canvas: { width: 704, height: 666 },
  layers: {
    ears:  { zIndex: 0, anchor: { x: 352, y: 112 } },
    head:  { zIndex: 1, anchor: { x: 352, y: 361 } },
    eyes:  { zIndex: 2, anchor: { x: 296, y: 318 } },
    mouth: { zIndex: 3, anchor: { x: 296, y: 487 } },
  },
  parts: { ears: [], heads: [], eyes: [], mouths: [] },
};

// Verification accumulators
const verifyLog = {
  counts:          {},   // { [categoryDir]: number }
  emptyShapes:     [],   // files that end up with 0 shape elements
  unexpectedFills: [],   // { id, fills[] }
  withFilters:     [],   // ids that have filter elements
  withoutFilters:  [],   // ids with no filters
};

for (const cat of CATEGORIES) {
  const inDir  = path.join(BEARS_DIR, cat.dir);
  const outDir = path.join(OUT_DIR, cat.dir);

  const svgFiles = fs
    .readdirSync(inDir)
    .filter(f => f.endsWith('.svg'))
    .sort();                          // deterministic order

  verifyLog.counts[cat.dir] = svgFiles.length;

  for (const filename of svgFiles) {
    const { id, outFile } = fileToId(filename, cat.prefix);
    const sourcePath = path.join(inDir, filename);
    const outPath    = path.join(outDir, outFile);

    const result = processSVG(sourcePath, cat.prefix, id);

    // Write cleaned SVG
    fs.writeFileSync(outPath, result.svg, 'utf8');

    // Verification tracking
    if (result.shapeCount === 0) {
      verifyLog.emptyShapes.push({ category: cat.dir, source: filename, id });
    }
    if (result.unexpectedFills.length > 0) {
      verifyLog.unexpectedFills.push({ id, fills: result.unexpectedFills });
    }
    if (result.filterCount > 0) {
      verifyLog.withFilters.push({ id, filterCount: result.filterCount });
    } else {
      verifyLog.withoutFilters.push(id);
    }

    // Add to manifest
    manifest.parts[cat.partsKey].push({
      id,
      file:      `${cat.dir}/${outFile}`,
      viewBox:   result.viewBox,
      colorable: result.colorable,
    });
  }

  // Sort parts alphabetically for deterministic manifest
  manifest.parts[cat.partsKey].sort((a, b) => a.id.localeCompare(b.id));
}

// Write manifest
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

// ─── Verification log ────────────────────────────────────────────────────────

const hr = '═'.repeat(50);
console.log(`\n${hr}`);
console.log('  Bears SVG Processor — Verification Log');
console.log(`${hr}\n`);

console.log('Files processed per category:');
for (const cat of CATEGORIES) {
  const count   = verifyLog.counts[cat.dir];
  const written = fs.readdirSync(path.join(OUT_DIR, cat.dir)).filter(f => f.endsWith('.svg')).length;
  console.log(`  ${cat.dir.padEnd(8)}  input: ${String(count).padStart(2)}  output: ${String(written).padStart(2)}`);
}

const totalIn  = Object.values(verifyLog.counts).reduce((a, b) => a + b, 0);
const totalOut = CATEGORIES.reduce((sum, cat) => {
  return sum + fs.readdirSync(path.join(OUT_DIR, cat.dir)).filter(f => f.endsWith('.svg')).length;
}, 0);
console.log(`  ${'TOTAL'.padEnd(8)}  input: ${String(totalIn).padStart(2)}  output: ${String(totalOut).padStart(2)}`);

console.log('');
console.log(`Filter preservation:`);
console.log(`  With filters:    ${verifyLog.withFilters.length} SVGs`);
console.log(`  Without filters: ${verifyLog.withoutFilters.length} SVGs`);
if (verifyLog.withFilters.length > 0) {
  for (const { id, filterCount } of verifyLog.withFilters) {
    console.log(`    ✓ ${id}  (${filterCount} filter${filterCount !== 1 ? 's' : ''})`);
  }
}

console.log('');
if (verifyLog.emptyShapes.length === 0) {
  console.log('✓ All cleaned SVGs contain at least one shape element');
} else {
  console.log('⚠ Files with NO shape elements after cleaning (investigate):');
  for (const e of verifyLog.emptyShapes) {
    console.log(`    [${e.category}] ${e.source}  →  ${e.id}.svg`);
  }
}

console.log('');
if (verifyLog.unexpectedFills.length === 0) {
  console.log('✓ No unexpected fill colours found');
} else {
  console.log('⚠ Unexpected fill colours found (not in: #A06A4C, #CCA48E, #E8C2AE, #000000, black, none):');
  for (const u of verifyLog.unexpectedFills) {
    console.log(`    ${u.id}: ${u.fills.map(f => `fill="${f}"`).join(', ')}`);
  }
}

console.log('');
console.log(`Manifest → ${path.relative(ROOT, MANIFEST_PATH)}`);
console.log(`Processed SVGs → ${path.relative(ROOT, OUT_DIR)}/`);
console.log('');
