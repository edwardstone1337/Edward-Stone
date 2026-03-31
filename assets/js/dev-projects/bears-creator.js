/**
 * bears-creator.js
 *
 * Composites bear parts into a live, swappable SVG.
 * Renderer-only — no UI controls, strip HTML, or CSS.
 *
 * Architecture:
 *   A single root <svg> element acts as the canvas. Each part is injected
 *   as a <g transform="translate(x, y)"> group positioned by the layer anchor
 *   defined in bears-manifest.json.
 *
 * Public API:
 *   initBearsCreator(selector) — mount + render default bear (async)
 *   setPart(category, partId)  — swap a part (async)
 *   setColor(type, hex)        — change a colorable fill
 *   getColors()                — current colour state
 *   getCurrentParts()          — current part selections
 */

const MANIFEST_URL = 'assets/images/bears/bears-manifest.json';
const PARTS_BASE   = 'assets/images/bears/processed/';

// partsKey in manifest → layer name in manifest.layers
const PARTS_KEY_TO_LAYER = {
  ears:   'ears',
  heads:  'head',
  eyes:   'eyes',
  mouths: 'mouth',
};

const DEFAULT_PARTS = {
  heads:  'head-default',
  ears:   'ears-teddy',
  eyes:   'eyes-sparkle',
  mouths: 'mouth-ellipse-27',
};

const DEFAULT_COLORS = {
  skin:        '#A06A4C',
  muzzle:      '#CCA48E',
  'inner-ear': '#E8C2AE',
};

// ── Module state ──────────────────────────────────────────────────────────────

let _manifest      = null;
let _rootSVG       = null;
let _sharedDefs    = null;        // <defs> for shared filter elements
let _layers        = {};          // layerName → <g> element
let _svgCache      = new Map();   // partId → { children: Node[], filters: Element[], viewBox: string }
let _currentParts  = { ears: null, heads: null, eyes: null, mouths: null };
let _currentColors = { ...DEFAULT_COLORS };
let _motionQuery   = null;        // reserved for future animation use

// ── Private helpers ───────────────────────────────────────────────────────────

function _findPart(category, partId) {
  if (!_manifest) return null;
  const parts = _manifest.parts[category];
  if (!parts) return null;
  return parts.find(p => p.id === partId) || null;
}

async function _fetchPart(part) {
  if (_svgCache.has(part.id)) return _svgCache.get(part.id);

  let svgText;
  try {
    const res = await fetch(PARTS_BASE + part.file);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    svgText = await res.text();
  } catch (err) {
    console.warn(`[bears-creator] Failed to fetch ${part.file}:`, err);
    return null;
  }

  const parser = new DOMParser();
  const doc    = parser.parseFromString(svgText, 'image/svg+xml');
  const svgEl  = doc.documentElement;

  if (svgEl.querySelector('parsererror')) {
    console.warn(`[bears-creator] Parse error in ${part.file}`);
    return null;
  }

  const viewBox = svgEl.getAttribute('viewBox') || '';

  // Separate <defs> (filter elements) from drawable children
  const defsEl  = svgEl.querySelector('defs');
  const filters  = defsEl
    ? Array.from(defsEl.querySelectorAll('filter'))
    : [];
  const children = Array.from(svgEl.childNodes).filter(
    node => !(node.nodeType === 1 && node.tagName.toLowerCase() === 'defs')
  );

  const cached = { children, filters, viewBox };
  _svgCache.set(part.id, cached);
  return cached;
}

function _applyAllColors() {
  for (const [type, hex] of Object.entries(_currentColors)) {
    const els = _rootSVG.querySelectorAll(`[data-colorable="${type}"]`);
    els.forEach(el => el.setAttribute('fill', hex));
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Mount the bear canvas into selector and render the default bear.
 * @param {string} selector — CSS selector for the container element
 */
export async function initBearsCreator(selector) {
  _motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const container = document.querySelector(selector);
  if (!container) {
    console.warn('[bears-creator] No element found for selector:', selector);
    return;
  }

  try {
    const res = await fetch(MANIFEST_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _manifest = await res.json();
  } catch (err) {
    console.warn('[bears-creator] Failed to load manifest:', err);
    return;
  }

  const { width, height } = _manifest.canvas;

  _rootSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  _rootSVG.setAttribute('viewBox', `0 0 ${width} ${height}`);
  _rootSVG.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  _rootSVG.setAttribute('overflow', 'visible');
  _rootSVG.setAttribute('aria-hidden', 'true');
  _rootSVG.style.width  = '100%';
  _rootSVG.style.height = 'auto';
  _rootSVG.style.display = 'block';

  // Shared <defs> for filter elements — must be first child so filters are
  // defined before the layer groups that reference them.
  _sharedDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  _rootSVG.appendChild(_sharedDefs);

  // Create 4 layer groups in z-order (ears behind head, etc.)
  for (const layerName of ['ears', 'head', 'eyes', 'mouth']) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.id = `bear-layer-${layerName}`;
    _layers[layerName] = g;
    _rootSVG.appendChild(g);
  }

  container.appendChild(_rootSVG);

  // Fetch all default parts concurrently, then apply colors once everything is placed
  await Promise.all(
    Object.entries(DEFAULT_PARTS).map(([cat, id]) => _setPartNoColor(cat, id))
  );

  _currentColors = { ...DEFAULT_COLORS };
  _applyAllColors();
}

/**
 * Internal setPart that skips the color reapply (used during init to batch colors).
 */
async function _setPartNoColor(category, partId) {
  if (!_manifest) return;

  const part = _findPart(category, partId);
  if (!part) {
    console.warn(`[bears-creator] Part not found: ${category}/${partId}`);
    return;
  }

  const layerName = PARTS_KEY_TO_LAYER[category];
  const layer     = _layers[layerName];
  if (!layer) {
    console.warn(`[bears-creator] Unknown layer for category: ${category}`);
    return;
  }

  const cached = await _fetchPart(part);
  if (!cached) return;

  const vbParts = cached.viewBox.split(/\s+/);
  const W       = parseFloat(vbParts[2]) || 0;
  const H       = parseFloat(vbParts[3]) || 0;

  const anchor  = _manifest.layers[layerName]?.anchor || { x: 0, y: 0 };
  const tx      = anchor.x - W / 2;
  const ty      = anchor.y - H / 2;

  // ── Filter management ────────────────────────────────────────────────────
  // Remove this category's previous filters from the shared <defs>.
  // Filter IDs are namespaced as filterN_[partId], so we match by suffix.
  const oldPartId = _currentParts[category];
  if (oldPartId && _sharedDefs) {
    const suffix = '_' + oldPartId;
    Array.from(_sharedDefs.querySelectorAll('filter')).forEach(filterEl => {
      if ((filterEl.getAttribute('id') || '').endsWith(suffix)) {
        _sharedDefs.removeChild(filterEl);
      }
    });
  }

  // Clone new filters into shared <defs>
  if (_sharedDefs && cached.filters.length > 0) {
    cached.filters.forEach(filterEl => {
      _sharedDefs.appendChild(document.importNode(filterEl, true));
    });
  }

  // ── Layer update ─────────────────────────────────────────────────────────
  while (layer.firstChild) layer.removeChild(layer.firstChild);

  const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  wrapper.setAttribute('transform', `translate(${tx}, ${ty})`);
  // Preserve the fill="none" that Figma sets on the root <svg>: stroke-only paths
  // inherit transparent fill from the parent SVG root; without this they default to black.
  // <g filter="url(#...)"> wrappers inside are preserved as-is — they reference
  // the filter IDs now live in _sharedDefs.
  wrapper.setAttribute('fill', 'none');

  for (const child of cached.children) {
    wrapper.appendChild(document.importNode(child, true));
  }

  layer.appendChild(wrapper);
  _currentParts[category] = partId;
}

/**
 * Swap a bear part. Fetches the SVG on first use; subsequent calls use the cache.
 * @param {string} category — partsKey: 'ears' | 'heads' | 'eyes' | 'mouths'
 * @param {string} partId   — e.g. 'ears-cat', 'head-robot'
 */
export async function setPart(category, partId) {
  if (!_manifest) {
    console.warn('[bears-creator] Manifest not loaded — call initBearsCreator first');
    return;
  }

  await _setPartNoColor(category, partId);
  _applyAllColors();
}

/**
 * Change the fill colour for a colorable type.
 * @param {string} type — 'skin' | 'muzzle' | 'inner-ear'
 * @param {string} hex  — e.g. '#D4956A'
 */
export function setColor(type, hex) {
  if (!_rootSVG) return;
  _currentColors[type] = hex;
  const els = _rootSVG.querySelectorAll(`[data-colorable="${type}"]`);
  els.forEach(el => el.setAttribute('fill', hex));
}

/**
 * Returns a copy of the current colour state.
 * @returns {{ skin: string, muzzle: string, 'inner-ear': string }}
 */
export function getColors() {
  return { ..._currentColors };
}

/**
 * Returns a copy of the current part selections keyed by partsKey.
 * @returns {{ ears: string|null, heads: string|null, eyes: string|null, mouths: string|null }}
 */
export function getCurrentParts() {
  return { ..._currentParts };
}

/**
 * Returns the loaded manifest object, or null if initBearsCreator has not completed.
 * Used by bears-controls.js to build the UI from the parts inventory.
 * @returns {object|null}
 */
export function getManifest() {
  return _manifest;
}

/**
 * Export the current bear as a transparent PNG with a watermark.
 * Measures the full rendered bounds (including ears outside the viewBox), adds
 * 24px padding, clones the SVG at 2× resolution, draws to an offscreen canvas,
 * stamps a watermark, and triggers a file download.
 */
export async function exportBearPNG() {
  if (!_rootSVG) {
    console.warn('[bears-creator] exportBearPNG called before init');
    return;
  }

  // ── 1. Measure full bounds across all four layers ─────────────────────────

  const PAD = 24;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const layerName of ['ears', 'head', 'eyes', 'mouth']) {
    const layer = _layers[layerName];
    if (!layer) continue;
    try {
      const bbox = layer.getBBox();
      if (bbox.width === 0 && bbox.height === 0) continue;
      minX = Math.min(minX, bbox.x);
      minY = Math.min(minY, bbox.y);
      maxX = Math.max(maxX, bbox.x + bbox.width);
      maxY = Math.max(maxY, bbox.y + bbox.height);
    } catch (_) { /* empty layer — skip */ }
  }

  if (!isFinite(minX)) {
    // Fallback to manifest canvas dimensions
    minX = 0; minY = 0;
    maxX = _manifest.canvas.width;
    maxY = _manifest.canvas.height;
  }

  const vbX = minX - PAD;
  const vbY = minY - PAD;
  const vbW = (maxX - minX) + PAD * 2;
  const vbH = (maxY - minY) + PAD * 2;

  const SCALE   = 2;  // 2× retina
  const canvasW = Math.round(vbW * SCALE);
  const canvasH = Math.round(vbH * SCALE);

  // ── 2. Clone and reframe ──────────────────────────────────────────────────

  function _buildClone(stripFilters) {
    const clone = _rootSVG.cloneNode(true);
    clone.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
    clone.setAttribute('width',   String(canvasW));
    clone.setAttribute('height',  String(canvasH));
    if (stripFilters) {
      clone.querySelectorAll('[filter]').forEach(el => el.removeAttribute('filter'));
      const defs = clone.querySelector('defs');
      if (defs) defs.remove();
    }
    return clone;
  }

  // ── 3. Serialize to data URL ──────────────────────────────────────────────

  function _toDataUrl(svgEl) {
    const str = new XMLSerializer().serializeToString(svgEl);
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str);
  }

  // ── 4. Draw SVG + watermark onto an offscreen canvas ─────────────────────

  async function _drawCanvas(dataUrl) {
    const canvas = document.createElement('canvas');
    canvas.width  = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');

    await new Promise((resolve, reject) => {
      const img   = new Image();
      img.onload  = () => { ctx.drawImage(img, 0, 0); resolve(); };
      img.onerror = reject;
      img.src     = dataUrl;
    });

    // Watermark — bottom-right, offset white shadow for legibility on any bg
    const wmPad = 16 * SCALE;
    ctx.font          = `${12 * SCALE}px Inter, system-ui, sans-serif`;
    ctx.textAlign     = 'right';
    ctx.textBaseline  = 'bottom';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur    = 0;
    ctx.shadowColor   = 'rgba(255, 255, 255, 0.6)';
    ctx.fillStyle     = 'rgba(0, 0, 0, 0.4)';
    ctx.fillText('edwardstone.design', canvasW - wmPad, canvasH - wmPad);
    ctx.shadowColor   = 'transparent';

    return canvas;
  }

  // ── 5. Trigger download ───────────────────────────────────────────────────

  function _triggerDownload(blob) {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = 'the-cute-little-bear-i-made-on-edwardstone-dot-design.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── 6. Export — with filter-strip fallback ────────────────────────────────

  const canvas = await _drawCanvas(_toDataUrl(_buildClone(false)));

  try {
    canvas.toBlob(blob => {
      if (!blob) { console.warn('[bears-creator] toBlob returned null'); return; }
      _triggerDownload(blob);
    }, 'image/png');
  } catch (err) {
    console.warn('[bears-creator] Export failed — retrying without filters:', err);
    const canvas2 = await _drawCanvas(_toDataUrl(_buildClone(true)));
    canvas2.toBlob(blob => {
      if (!blob) { console.warn('[bears-creator] toBlob returned null on retry'); return; }
      _triggerDownload(blob);
    }, 'image/png');
  }
}
