/**
 * Image lightbox — parameterised refactor of about-lightbox.js.
 * Can be pointed at any set of items via config.selector and extractor functions.
 * Reuses all dp-lightbox / dp-about-lightbox CSS classes — no new styles required.
 */
import { escapeHTML } from './utils.js';

/** @type {AbortController|null} */
let controller = null;

/** @type {HTMLElement|null} */
let lightbox = null;

/** @type {HTMLElement|null} */
let previousFocus = null;

/** Whether this module added dp-overlay-active */
let weAddedOverlay = false;

/** Whether this module locked scroll */
let weLockedScroll = false;

/** All items collected at init time (after optional deduplication) */
let items = [];

/** Current index in the items array */
let currentIndex = 0;

/** Resolved config from the last initImageLightbox() call */
let cfg = null;

/** Whether any item in the set has a non-empty description (computed once at init) */
let hasAnyDescription = false;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter(el => !el.hidden && el.offsetParent !== null);
}

function trapFocus(e) {
  if (e.key !== 'Tab' || !lightbox || !lightbox.contains(document.activeElement)) return;
  const focusable = getFocusableElements(lightbox);
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const idx = focusable.indexOf(document.activeElement);
  if (e.shiftKey) {
    if (idx <= 0) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (idx === -1 || idx >= focusable.length - 1) {
      e.preventDefault();
      first.focus();
    }
  }
}

function handleKeydown(e) {
  if (!lightbox) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navigateTo(currentIndex - 1);
  if (e.key === 'ArrowRight') navigateTo(currentIndex + 1);
}

function updateLightboxContent(index) {
  if (index < 0 || index >= items.length || !lightbox) return;
  currentIndex = index;

  const item = items[currentIndex];
  // TRUST: src, alt, and description come from caller-supplied extractor functions
  // reading static same-origin HTML attributes. No user input is injected.
  const src = cfg.getImageSrc(item);
  const alt = cfg.getImageAlt(item);
  const description = cfg.getDescription(item);

  const lbImg = lightbox.querySelector('.dp-about-lightbox__image img');
  const lbPanel = lightbox.querySelector('.dp-about-lightbox__panel');
  const lbDesc = lightbox.querySelector('.dp-about-lightbox__description');

  if (lbImg) {
    lbImg.setAttribute('src', src);
    lbImg.setAttribute('alt', alt);
  }

  // Show/hide the panel per-item: present in DOM only when hasAnyDescription,
  // but hidden with the HTML hidden attribute when the current item has no description.
  if (lbPanel) {
    lbPanel.hidden = description === '';
  }
  if (lbDesc) {
    lbDesc.textContent = description;
  }

}

function navigateTo(index) {
  if (items.length === 0) return;
  if (index < 0) index = items.length - 1;
  if (index >= items.length) index = 0;
  updateLightboxContent(index);
}

function closeLightbox() {
  if (!lightbox) return;

  if (weAddedOverlay) {
    document.body.classList.remove('dp-overlay-active');
    weAddedOverlay = false;
  }

  if (weLockedScroll) {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    weLockedScroll = false;
  }

  document.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('keydown', trapFocus);

  lightbox.remove();
  lightbox = null;

  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus();
  }
  previousFocus = null;
}

function openLightbox(index) {
  if (lightbox) closeLightbox();

  const item = items[index];
  if (!item) return;

  currentIndex = index;
  previousFocus = document.activeElement || document.body;

  // TRUST: src, alt, and description are read via caller-supplied extractor functions
  // from static same-origin HTML attributes. No user input is injected.
  const src = cfg.getImageSrc(item);
  const alt = cfg.getImageAlt(item);
  const description = cfg.getDescription(item);

  const hadOverlay = document.body.classList.contains('dp-overlay-active');
  if (!hadOverlay) {
    document.body.classList.add('dp-overlay-active');
    weAddedOverlay = true;
  }

  lightbox = document.createElement('div');
  lightbox.className = 'dp-lightbox dp-about-lightbox';
  if (!prefersReducedMotion()) {
    lightbox.classList.add('dp-lightbox-active');
  }
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', cfg.ariaLabel);
  lightbox.setAttribute('tabindex', '-1');

  // Description panel: included in DOM only when at least one item in the set has a
  // description (hasAnyDescription). When present, the hidden attribute is toggled
  // per navigation step by updateLightboxContent.
  const panelHTML = hasAnyDescription
    ? `<div class="dp-about-lightbox__panel"${description === '' ? ' hidden' : ''}>
        <p class="dp-about-lightbox__description">${escapeHTML(description)}</p>
      </div>`
    : '';

  lightbox.innerHTML = `
    <div class="dp-lightbox-backdrop"></div>
    <button type="button" class="dp-lightbox-close" aria-label="Close" title="Close">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    <div class="dp-about-lightbox__body">
      <button type="button" class="dp-about-lightbox__prev" aria-label="Previous image">\u2190</button>
      <div class="dp-about-lightbox__image">
        <img src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" />
      </div>
      <button type="button" class="dp-about-lightbox__next" aria-label="Next image">\u2192</button>
      ${panelHTML}
    </div>
  `;

  const closeBtn = lightbox.querySelector('.dp-lightbox-close');
  const prevBtn = lightbox.querySelector('.dp-about-lightbox__prev');
  const nextBtn = lightbox.querySelector('.dp-about-lightbox__next');

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  }, { signal: controller.signal });

  closeBtn.addEventListener('click', closeLightbox, { signal: controller.signal });
  prevBtn.addEventListener('click', () => navigateTo(currentIndex - 1), { signal: controller.signal });
  nextBtn.addEventListener('click', () => navigateTo(currentIndex + 1), { signal: controller.signal });

  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  weLockedScroll = true;

  document.addEventListener('keydown', handleKeydown, { signal: controller.signal });
  document.addEventListener('keydown', trapFocus, { signal: controller.signal });

  document.body.appendChild(lightbox);
  closeBtn.focus({ preventScroll: true });
}

/** Default config — matches current about-lightbox behaviour exactly */
const DEFAULT_CONFIG = {
  selector: '.dp-gallery-grid--compact .dp-gallery-item',
  getImageSrc: (item) => item.querySelector('img')?.getAttribute('src') || '',
  getImageAlt: (item) => item.querySelector('img')?.getAttribute('alt') || '',
  getDescription: (item) => item.getAttribute('data-description') || '',
  ariaLabel: 'Image viewer',
  dedupe: false,
};

/**
 * Initialize the image lightbox.
 *
 * @param {object} [config]
 * @param {string}   [config.selector='.dp-gallery-grid--compact .dp-gallery-item']
 *   CSS selector to find clickable items.
 * @param {function} [config.getImageSrc]
 *   Extracts image src from an item element. Default: first <img> child's src.
 * @param {function} [config.getImageAlt]
 *   Extracts alt text from an item element. Default: first <img> child's alt.
 * @param {function} [config.getDescription]
 *   Extracts caption text from an item element. Default: data-description attribute.
 *   Return '' to suppress the description panel for that item.
 * @param {string}   [config.ariaLabel='Image viewer']
 *   aria-label for the lightbox dialog element.
 * @param {boolean}  [config.dedupe=false]
 *   When true, deduplicates items by image src — keeps only the first element per
 *   unique src value. Use this when the selector matches cloned/duplicated DOM nodes
 *   (e.g. a ticker's aria-hidden duplicate items).
 */
export function initImageLightbox(config) {
  if (controller) controller.abort();
  controller = new AbortController();

  cfg = Object.assign({}, DEFAULT_CONFIG, config);

  let collected = Array.from(document.querySelectorAll(cfg.selector));

  if (cfg.dedupe) {
    const seen = new Set();
    collected = collected.filter(item => {
      const src = cfg.getImageSrc(item);
      if (seen.has(src)) return false;
      seen.add(src);
      return true;
    });
  }

  items = collected;
  hasAnyDescription = items.some(item => cfg.getDescription(item) !== '');
  currentIndex = 0;

  if (items.length === 0) return;

  items.forEach((item, index) => {
    item.style.cursor = 'pointer';
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', (item.getAttribute('data-alt') || 'View image'));

    item.addEventListener('click', () => openLightbox(index), { signal: controller.signal });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    }, { signal: controller.signal });
  });
}

/**
 * Tear down the image lightbox — abort all listeners, close if open, reset module state.
 */
export function destroyImageLightbox() {
  if (controller) {
    controller.abort();
    controller = null;
  }
  if (lightbox) {
    closeLightbox();
  }
  items = [];
  currentIndex = 0;
  cfg = null;
  hasAnyDescription = false;
}
