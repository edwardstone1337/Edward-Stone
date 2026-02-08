/**
 * Resume lightbox — Phase 3
 * Opens resume in a full-size lightbox with download button.
 * Uses dp-overlay-active on body; coordinates with snake-game (only remove if we added it).
 */

const RESUME_DOCX_PATH = 'assets/files/Resume.docx'; // Resume file is deployed with the site as a static asset

/** @type {AbortController|null} */
let controller = null;

/** @type {HTMLElement|null} */
let lightbox = null;

/** @type {HTMLElement|null} */
let previousFocus = null;

/** Whether this module added dp-overlay-active (snake game may have it already) */
let weAddedOverlay = false;

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

function handleEscape(e) {
  if (e.key === 'Escape' && lightbox) closeLightbox();
}

function closeLightbox() {
  if (!lightbox) return;

  if (weAddedOverlay) {
    document.body.classList.remove('dp-overlay-active');
    weAddedOverlay = false;
  }

  document.removeEventListener('keydown', handleEscape);
  document.removeEventListener('keydown', trapFocus);

  lightbox.remove();
  lightbox = null;

  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus();
  }
  previousFocus = null;
}

function openLightbox() {
  if (window.innerWidth <= 1080) return;
  const resumePage = document.querySelector('.dp-resume-page');
  const resumeContainer = document.querySelector('.dp-resume-container');
  if (!resumePage || !resumeContainer) return;

  previousFocus = document.activeElement || document.body;

  // dp-overlay-active: only add if not already present (snake game may have it)
  const hadOverlay = document.body.classList.contains('dp-overlay-active');
  if (!hadOverlay) {
    document.body.classList.add('dp-overlay-active');
    weAddedOverlay = true;
  }

  const header = resumePage.querySelector('header');
  const body = resumePage.querySelector('.dp-resume-body');
  const innerHTML = [header, body].filter(Boolean).map(el => el.outerHTML).join('') || resumePage.innerHTML;

  lightbox = document.createElement('div');
  lightbox.className = 'dp-lightbox dp-lightbox-active';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Resume');

  lightbox.innerHTML = `
    <div class="dp-lightbox-backdrop"></div>
    <div class="dp-lightbox-content">
      <div class="dp-lightbox-page">${innerHTML}</div>
      <div class="dp-lightbox-controls">
        <a href="${RESUME_DOCX_PATH}" download class="dp-btn dp-btn-primary">
          <span>Download Resume</span>
        </a>
        <button type="button" class="dp-lightbox-close" aria-label="Close">
          <span aria-hidden="true">✕</span>
        </button>
      </div>
    </div>
  `;

  const backdrop = lightbox.querySelector('.dp-lightbox-backdrop');
  const closeBtn = lightbox.querySelector('.dp-lightbox-close');

  backdrop.addEventListener('click', closeLightbox, { signal: controller.signal });
  closeBtn.addEventListener('click', closeLightbox, { signal: controller.signal });
  document.addEventListener('keydown', handleEscape, { signal: controller.signal });
  document.addEventListener('keydown', trapFocus, { signal: controller.signal });

  lightbox.setAttribute('tabindex', '-1');
  document.body.appendChild(lightbox);
  lightbox.focus({ preventScroll: true });
}

/**
 * Initialize resume lightbox. Binds click on .dp-resume-container to open lightbox.
 */
export function initResumeLightbox() {
  if (controller) controller.abort();
  controller = new AbortController();

  const container = document.querySelector('.dp-resume-container');
  if (!container) return;

  container.addEventListener('click', openLightbox, { signal: controller.signal });
}

/**
 * Teardown: remove listeners and close lightbox if open.
 */
export function destroyResumeLightbox() {
  if (controller) {
    controller.abort();
    controller = null;
  }
  if (lightbox) {
    closeLightbox();
  }
}
