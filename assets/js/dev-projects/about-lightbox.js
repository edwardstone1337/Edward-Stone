/**
 * About page lightbox — Facebook-style image + description panel.
 * Replicates focus trap, scroll lock, and close patterns from resume-lightbox.js.
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

/** All gallery items (for prev/next navigation) */
let items = [];

/** Current index in the items array */
let currentIndex = 0;

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
  const img = item.querySelector('img');
  if (!img) return;

  // TRUST: src and alt come from static HTML attributes on same-origin <img> elements
  // in about.html. description comes from data-description on the same static elements.
  const src = img.getAttribute('src') || '';
  const alt = img.getAttribute('alt') || '';
  const description = item.getAttribute('data-description') || '';

  const lbImg = lightbox.querySelector('.dp-about-lightbox__image img');
  const lbDesc = lightbox.querySelector('.dp-about-lightbox__description');

  if (lbImg) {
    lbImg.setAttribute('src', src);
    lbImg.setAttribute('alt', alt);
  }
  if (lbDesc) {
    lbDesc.textContent = description;
  }

  const prevBtn = lightbox.querySelector('.dp-about-lightbox__prev');
  const nextBtn = lightbox.querySelector('.dp-about-lightbox__next');
  if (prevBtn) prevBtn.hidden = currentIndex === 0;
  if (nextBtn) nextBtn.hidden = currentIndex === items.length - 1;
}

function navigateTo(index) {
  if (index < 0 || index >= items.length) return;
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

  const img = item.querySelector('img');
  if (!img) return;

  currentIndex = index;
  previousFocus = document.activeElement || document.body;

  // TRUST: src, alt, and description are read from static HTML attributes
  // hardcoded in about.html. No user input is injected.
  const src = img.getAttribute('src') || '';
  const alt = img.getAttribute('alt') || '';
  const description = item.getAttribute('data-description') || '';

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
  lightbox.setAttribute('aria-label', 'Image viewer');
  lightbox.setAttribute('tabindex', '-1');

  // Build inner HTML — all values are escaped for safety
  lightbox.innerHTML = `
    <div class="dp-lightbox-backdrop"></div>
    <button type="button" class="dp-lightbox-close" aria-label="Close image viewer" title="Close">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    <div class="dp-about-lightbox__body">
      <button type="button" class="dp-about-lightbox__prev" aria-label="Previous image"${currentIndex === 0 ? ' hidden' : ''}>\u2190</button>
      <div class="dp-about-lightbox__image">
        <img src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" />
      </div>
      <button type="button" class="dp-about-lightbox__next" aria-label="Next image"${currentIndex === items.length - 1 ? ' hidden' : ''}>\u2192</button>
      <div class="dp-about-lightbox__panel">
        <p class="dp-about-lightbox__description">${escapeHTML(description)}</p>
      </div>
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

/**
 * Initialize about lightbox. Attaches click handlers to all .dp-gallery-item elements.
 */
export function initAboutLightbox() {
  if (controller) controller.abort();
  controller = new AbortController();

  items = Array.from(document.querySelectorAll('.dp-gallery-grid--compact .dp-gallery-item'));
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
