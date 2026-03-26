/**
 * bears-controls.js
 *
 * Stepper-based UI controls for the bears character creator.
 * Builds four prev/next stepper rows (one per category), colour swatches,
 * and a randomise button — wired to the bears-creator.js API.
 *
 * Usage:
 *   import { initBearsControls } from './bears-controls.js';
 *   initBearsControls('.bears-creator__controls', {
 *     setPart, setColor, getColors, getCurrentParts, getManifest
 *   });
 */

const CATEGORY_ORDER = ['ears', 'heads', 'eyes', 'mouths'];

const CATEGORY_LABELS = {
  ears:   'Ears',
  heads:  'Head',
  eyes:   'Eyes',
  mouths: 'Mouth',
};

// 8 preset skin colours.
const SKIN_PRESETS = [
  { hex: '#A06A4C', label: 'Brown'  },
  { hex: '#F5C16A', label: 'Honey'  },
  { hex: '#E8C2AE', label: 'Blush'  },
  { hex: '#D94F4F', label: 'Red'    },
  { hex: '#5B8C5A', label: 'Forest' },
  { hex: '#5E6AD2', label: 'Indigo' },
  { hex: '#2B3276', label: 'Navy'   },
  { hex: '#FFFFFF', label: 'White'  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Mix a hex colour toward white by `amount` (0–1).
 * Used to derive related muzzle and inner-ear tones from a skin colour.
 */
function lightenHex(hex, amount) {
  const r   = parseInt(hex.slice(1, 3), 16);
  const g   = parseInt(hex.slice(3, 5), 16);
  const b   = parseInt(hex.slice(5, 7), 16);
  const mix = c => Math.round(c + (255 - c) * amount);
  const h   = c => mix(c).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Minimal DOM element builder. */
function el(tag, attrs, ...children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      node.setAttribute(k, v);
    }
  }
  for (const child of children) {
    if (typeof child === 'string') node.appendChild(document.createTextNode(child));
    else if (child instanceof Node) node.appendChild(child);
  }
  return node;
}

// ── Active-state management ───────────────────────────────────────────────────

function activateInGroup(group, activeBtn) {
  group.querySelectorAll('[aria-pressed]').forEach(btn => {
    btn.classList.remove('is-active');
    btn.setAttribute('aria-pressed', 'false');
  });
  activeBtn.classList.add('is-active');
  activeBtn.setAttribute('aria-pressed', 'true');
}

// ── Section builders ──────────────────────────────────────────────────────────

/**
 * Build a stepper row for one category.
 * Returns { group, setIndex } where setIndex(i) updates the display and active state.
 */
function buildStepperRow(category, parts, currentPartId, onSelect) {
  let currentIndex = parts.findIndex(p => p.id === currentPartId);
  if (currentIndex < 0) currentIndex = 0;

  const nameEl = el('span', { class: 'bears-creator__stepper-name' },
    `${currentIndex + 1} / ${parts.length}`,
  );

  const prevBtn = el('button', {
    class:       'bears-creator__stepper-arrow',
    type:        'button',
    'aria-label': 'Previous ' + CATEGORY_LABELS[category],
  }, '‹');

  const nextBtn = el('button', {
    class:       'bears-creator__stepper-arrow',
    type:        'button',
    'aria-label': 'Next ' + CATEGORY_LABELS[category],
  }, '›');

  function goTo(index) {
    currentIndex = ((index % parts.length) + parts.length) % parts.length;
    nameEl.textContent = `${currentIndex + 1} / ${parts.length}`;
    onSelect(category, parts[currentIndex].id);
  }

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  const stepper = el('div', { class: 'bears-creator__stepper' }, prevBtn, nameEl, nextBtn);

  const group = el('div', { class: 'bears-creator__stepper-group' },
    el('p', { class: 'bears-creator__stepper-label' }, CATEGORY_LABELS[category]),
    stepper,
  );

  function setIndex(index) {
    currentIndex = ((index % parts.length) + parts.length) % parts.length;
    nameEl.textContent = `${currentIndex + 1} / ${parts.length}`;
  }

  return { group, setIndex };
}

function buildColourSection(currentSkinHex, onSelect) {
  const group = el('div', {
    class:        'bears-creator__swatch-group',
    role:         'group',
    'aria-label': 'Skin colour presets',
  });

  for (const preset of SKIN_PRESETS) {
    const isActive = preset.hex.toLowerCase() === currentSkinHex.toLowerCase();
    const btn = el('button', {
      class:          'bears-creator__swatch' + (isActive ? ' is-active' : ''),
      type:           'button',
      'data-hex':     preset.hex,
      'aria-label':   preset.label + ' skin colour',
      'aria-pressed': isActive ? 'true' : 'false',
    });
    btn.style.backgroundColor = preset.hex;

    btn.addEventListener('click', () => {
      activateInGroup(group, btn);
      onSelect(preset.hex);
    });
    group.appendChild(btn);
  }

  const section = el('div', { class: 'bears-creator__colour-section' },
    el('p', { class: 'bears-creator__colour-label' }, 'Colour'),
    group,
  );

  return { section, group };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Build and mount the stepper controls UI.
 *
 * @param {string} controlsSelector — CSS selector for the controls container element
 * @param {object} creatorAPI       — { setPart, setColor, getColors, getCurrentParts, getManifest }
 */
export function initBearsControls(controlsSelector, creatorAPI) {
  const container = document.querySelector(controlsSelector);
  if (!container) {
    console.warn('[bears-controls] No element found for selector:', controlsSelector);
    return;
  }

  const manifest = creatorAPI.getManifest();
  if (!manifest) {
    console.warn('[bears-controls] Manifest not available — ensure initBearsCreator has completed');
    return;
  }

  const currentParts  = creatorAPI.getCurrentParts();
  const currentColors = creatorAPI.getColors();

  // Track stepper setIndex fns for randomise
  const stepperRefs = {};  // category → { setIndex, parts }

  // ── Stepper rows ─────────────────────────────────────────────────────────

  for (const category of CATEGORY_ORDER) {
    const parts = manifest.parts[category];
    if (!parts || parts.length === 0) continue;

    const { group, setIndex } = buildStepperRow(
      category,
      parts,
      currentParts[category],
      (cat, partId) => creatorAPI.setPart(cat, partId),
    );

    container.appendChild(group);
    stepperRefs[category] = { setIndex, parts };
  }

  // ── Colour section ────────────────────────────────────────────────────────

  const { section: colourSection, group: swatchGroup } = buildColourSection(
    currentColors.skin,
    hex => {
      creatorAPI.setColor('skin',      hex);
      creatorAPI.setColor('muzzle',    lightenHex(hex, 0.40));
      creatorAPI.setColor('inner-ear', lightenHex(hex, 0.55));
    },
  );

  container.appendChild(colourSection);

  // ── Randomise button ──────────────────────────────────────────────────────

  const randomiseBtn = el('button', {
    class: 'bears-creator__randomise dp-btn dp-btn-secondary-on-light',
    type:  'button',
  }, 'Randomise');

  randomiseBtn.addEventListener('click', () => {
    // Random part per category — update stepper display + call API
    for (const category of CATEGORY_ORDER) {
      const ref = stepperRefs[category];
      if (!ref) continue;

      const idx = Math.floor(Math.random() * ref.parts.length);
      ref.setIndex(idx);
      creatorAPI.setPart(category, ref.parts[idx].id);
    }

    // Random colour preset
    const preset = SKIN_PRESETS[Math.floor(Math.random() * SKIN_PRESETS.length)];
    creatorAPI.setColor('skin',      preset.hex);
    creatorAPI.setColor('muzzle',    lightenHex(preset.hex, 0.40));
    creatorAPI.setColor('inner-ear', lightenHex(preset.hex, 0.55));

    const swatch = swatchGroup.querySelector(`[data-hex="${preset.hex}"]`);
    if (swatch) activateInGroup(swatchGroup, swatch);
  });

  container.appendChild(randomiseBtn);
}
