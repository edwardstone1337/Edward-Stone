/**
 * Resume lightbox — Phase 3
 * Opens resume in a full-size lightbox with download button.
 * Uses dp-overlay-active on body; coordinates with snake-game (only remove if we added it).
 */

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

/**
 * Build lightbox inner HTML (backdrop, content, .dp-lightbox-page, controls).
 * Shared by openLightbox() and printResume() so the template is not duplicated.
 */
function buildLightboxHTML(resumeContent) {
  return `
    <div class="dp-lightbox-backdrop"></div>
    <div class="dp-lightbox-content">
      <div class="dp-lightbox-page">${resumeContent}</div>
      <button type="button" class="dp-lightbox-close" aria-label="Close" title="Close">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div class="dp-lightbox-actions">
      <button type="button" class="dp-btn dp-btn-secondary dp-lightbox-action-btn" data-lightbox-print>
        <span>Print to PDF</span>
      </button>
      <button type="button" class="dp-btn dp-btn-secondary dp-lightbox-action-btn" data-lightbox-copy>
        <span>Copy to clipboard</span>
      </button>
    </div>
  `;
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

  lightbox.innerHTML = buildLightboxHTML(innerHTML);

  const backdrop = lightbox.querySelector('.dp-lightbox-backdrop');
  const closeBtn = lightbox.querySelector('.dp-lightbox-close');

  backdrop.addEventListener('click', closeLightbox, { signal: controller.signal });
  closeBtn.addEventListener('click', closeLightbox, { signal: controller.signal });

  lightbox.querySelector('[data-lightbox-print]').addEventListener('click', () => {
    window.print();
  }, { signal: controller.signal });

  lightbox.querySelector('[data-lightbox-copy]').addEventListener('click', async () => {
    const page = lightbox.querySelector('.dp-lightbox-page');
    const text = page ? page.innerText : '';
    const btn = lightbox.querySelector('[data-lightbox-copy]');
    const originalTitle = btn.getAttribute('title') || 'Copy to clipboard';
    try {
      await navigator.clipboard.writeText(text);
      btn.setAttribute('title', 'Copied!');
      setTimeout(() => { btn.setAttribute('title', originalTitle); }, 2000);
    } catch {
      btn.setAttribute('title', 'Copy failed');
      setTimeout(() => { btn.setAttribute('title', originalTitle); }, 2000);
    }
  }, { signal: controller.signal });

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
