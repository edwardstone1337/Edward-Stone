/**
 * Resume lightbox — Phase 3
 * Opens resume in a full-size lightbox with download button.
 * Uses dp-overlay-active on body; coordinates with snake-game (only remove if we added it).
 */
import { showSnackbar } from './snackbar.js';

/** @type {AbortController|null} */
let controller = null;

/** @type {HTMLElement|null} */
let lightbox = null;

/** @type {HTMLElement|null} */
let previousFocus = null;

/** Whether this module added dp-overlay-active (snake game may have it already) */
let weAddedOverlay = false;

/** Whether this module locked scroll (don't restore if someone else locked it) */
let weLockedScroll = false;

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

/**
 * Build lightbox inner HTML (backdrop, body with content + sidebar, close button).
 * Shared by openLightbox() and printResume() so the template is not duplicated.
 */
function buildLightboxHTML(resumeContent) {
  return `
    <div class="dp-lightbox-backdrop"></div>
    <button type="button" class="dp-lightbox-close" aria-label="Close" title="Close">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    <div class="dp-lightbox-body">
      <div class="dp-lightbox-content">
        <div class="dp-lightbox-page">${resumeContent}</div>
      </div>
      <div class="dp-lightbox-sidebar">
        <div class="dp-resume-download" data-download-widget>
          <button class="dp-btn dp-btn-primary dp-download-trigger" aria-haspopup="true" aria-expanded="false">
            <span>Download Resume</span>
            <svg class="dp-download-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="dp-dropdown-menu dp-download-menu" role="menu" hidden>
            <button role="menuitem" class="dp-download-menu-item dp-download-print-pdf" data-print-pdf>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 14h8M8 2v9M8 11L5 8M8 11l3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Print to PDF</span>
            </button>
            <button role="menuitem" class="dp-download-menu-item" data-copy-resume>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M3 11V3.5A1.5 1.5 0 014.5 2H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>Copy to clipboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
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

  // TRUST: Content is extracted from .dp-resume-page, which is static same-origin HTML hardcoded in resume.html. No user input is injected.
  const header = resumePage.querySelector('header');
  const body = resumePage.querySelector('.dp-resume-body');
  const innerHTML = [header, body].filter(Boolean).map(el => el.outerHTML).join('') || resumePage.innerHTML;

  lightbox = document.createElement('div');
  lightbox.className = 'dp-lightbox dp-lightbox-active';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Resume');

  lightbox.innerHTML = buildLightboxHTML(innerHTML);

  const closeBtn = lightbox.querySelector('.dp-lightbox-close');

  // Click directly on the lightbox container (empty space around content) closes it.
  // Backdrop has pointer-events: none so scroll works everywhere on the overlay.
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  }, { signal: controller.signal });
  closeBtn.addEventListener('click', closeLightbox, { signal: controller.signal });

  // Wire up the lightbox download widget (created dynamically, not bound by initResumeDownload)
  const lbWidget = lightbox.querySelector('[data-download-widget]');
  if (lbWidget) {
    const lbTrigger = lbWidget.querySelector('.dp-download-trigger');
    const lbMenu = lbWidget.querySelector('.dp-download-menu');

    function closeLbMenu() {
      lbMenu.hidden = true;
      lbTrigger.setAttribute('aria-expanded', 'false');
    }

    lbTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !lbMenu.hidden;
      closeLbMenu();
      if (!isOpen) {
        lbMenu.hidden = false;
        lbTrigger.setAttribute('aria-expanded', 'true');
      }
    }, { signal: controller.signal });

    // Close menu on click outside the trigger
    lightbox.addEventListener('click', closeLbMenu, { signal: controller.signal });

    // Print to PDF — use window.print() directly (lightbox is already showing the resume)
    const printBtn = lbWidget.querySelector('[data-print-pdf]');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        closeLbMenu();
        window.print();
      }, { signal: controller.signal });
    }

    // Copy to clipboard — copy from the lightbox page content
    const copyBtn = lbWidget.querySelector('[data-copy-resume]');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const page = lightbox.querySelector('.dp-lightbox-page');
        const text = page ? page.innerText : '';
        try {
          await navigator.clipboard.writeText(text);
          showSnackbar('Copied to clipboard');
        } catch (err) {
          console.error('Resume copy failed', err);
          showSnackbar('Copy failed — try again');
        }
        closeLbMenu();
      }, { signal: controller.signal });
    }
  }

  // Lock scroll on both html and body to prevent bleed-through
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  weLockedScroll = true;

  document.addEventListener('keydown', handleEscape, { signal: controller.signal });
  document.addEventListener('keydown', trapFocus, { signal: controller.signal });

  lightbox.setAttribute('tabindex', '-1');
  document.body.appendChild(lightbox);
  lightbox.focus({ preventScroll: true });
}

/**
 * Silent print: build lightbox DOM (hidden), call window.print(), remove on afterprint.
 * No overlay, focus trap, or UI listeners. For use by in-page download menu.
 */
export function printResume() {
  if (document.querySelector('.dp-lightbox--print-only')) return;

  const resumePage = document.querySelector('.dp-resume-page');
  const resumeContainer = document.querySelector('.dp-resume-container');
  if (!resumePage || !resumeContainer) return;

  // TRUST: Content is extracted from .dp-resume-page, which is static same-origin HTML hardcoded in resume.html. No user input is injected.
  const header = resumePage.querySelector('header');
  const body = resumePage.querySelector('.dp-resume-body');
  const resumeContent = [header, body].filter(Boolean).map(el => el.outerHTML).join('') || resumePage.innerHTML;

  let printNode = document.createElement('div');
  printNode.className = 'dp-lightbox dp-lightbox--print-only';
  printNode.innerHTML = buildLightboxHTML(resumeContent);

  document.body.appendChild(printNode);
  window.print();

  window.addEventListener('afterprint', function cleanup() {
    printNode.remove();
    printNode = null;
  }, { once: true });
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
