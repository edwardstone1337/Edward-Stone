/**
 * bears-modal.js
 * Opens the Bears character creator in a lightbox modal.
 * Follows the established dp-lightbox pattern (role=dialog, scroll lock,
 * dp-overlay-active, focus trap, Escape key, restore focus on close).
 */

import { initBearsCreator, setPart, setColor, getColors, getCurrentParts, getManifest, exportBearPNG } from './bears-creator.js';
import { initBearsControls } from './bears-controls.js';

let modal = null;
let hasInited = false;
let previousFocus = null;
let weAddedOverlay = false;
let controller = null;

const CLOSE_SVG = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
  <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

const MODAL_HTML = `
<div class="dp-lightbox-backdrop"></div>
<div class="dp-lightbox-body dp-lightbox-body--bears">
  <button type="button" class="dp-lightbox-close" aria-label="Close">
    ${CLOSE_SVG}
  </button>
  <div class="bears-creator" id="bears-creator">
    <div class="bears-creator__canvas"></div>
    <div class="bears-creator__controls"></div>
  </div>
</div>`;

function getFocusable() {
  return Array.from(
    modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ).filter(el => !el.hasAttribute('disabled') && !el.closest('[hidden]'));
}

function trapFocus(e) {
  if (e.key !== 'Tab' || !modal) return;
  const focusable = getFocusable();
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

function handleKeydown(e) {
  if (e.key === 'Escape') closeModal();
}

function lockScroll() {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}

function unlockScroll() {
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
}

async function openModal() {
  // Always capture before any DOM work so re-opens restore focus correctly
  previousFocus = document.activeElement;

  if (modal) {
    // Already exists — just show it
    modal.style.display = '';
    lockScroll();

    weAddedOverlay = false;
    if (!document.body.classList.contains('dp-overlay-active')) {
      document.body.classList.add('dp-overlay-active');
      weAddedOverlay = true;
    }

    controller = new AbortController();
    document.addEventListener('keydown', handleKeydown, { signal: controller.signal });
    document.addEventListener('keydown', trapFocus,    { signal: controller.signal });

    const closeBtn = modal.querySelector('.dp-lightbox-close');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
    return;
  }

  // First open — create and init
  modal = document.createElement('div');
  modal.className = 'dp-lightbox dp-lightbox-active';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Bears Character Creator');
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('data-theme', 'light');
  modal.innerHTML = MODAL_HTML;

  // Backdrop click: listen on modal container, fire only when clicking outside the content box
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  modal.querySelector('.dp-lightbox-close').addEventListener('click', closeModal);

  document.body.appendChild(modal);

  lockScroll();

  weAddedOverlay = false;
  if (!document.body.classList.contains('dp-overlay-active')) {
    document.body.classList.add('dp-overlay-active');
    weAddedOverlay = true;
  }

  controller = new AbortController();
  document.addEventListener('keydown', handleKeydown, { signal: controller.signal });
  document.addEventListener('keydown', trapFocus,    { signal: controller.signal });

  // Lazy init — runs only once, after modal is in DOM and visible
  if (!hasInited) {
    hasInited = true;
    await initBearsCreator('.dp-lightbox-body--bears .bears-creator__canvas');
    initBearsControls(
      '.dp-lightbox-body--bears .bears-creator__controls',
      { setPart, setColor, getColors, getCurrentParts, getManifest, exportBearPNG }
    );
  }

  const closeBtn = modal.querySelector('.dp-lightbox-close');
  if (closeBtn) closeBtn.focus({ preventScroll: true });
}

function closeModal() {
  if (!modal) return;

  if (controller) {
    controller.abort();
    controller = null;
  }

  unlockScroll();

  if (weAddedOverlay) {
    document.body.classList.remove('dp-overlay-active');
    weAddedOverlay = false;
  }

  // Hide rather than destroy — preserves bear state for re-opens
  modal.style.display = 'none';

  if (previousFocus) {
    previousFocus.focus({ preventScroll: true });
    previousFocus = null;
  }
}

/**
 * Wire the trigger button and export for use in the init script.
 */
export function initBearsModal() {
  const trigger = document.getElementById('bears-modal-trigger');
  if (!trigger) return;
  trigger.addEventListener('click', openModal);
}
