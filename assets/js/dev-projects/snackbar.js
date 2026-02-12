/**
 * Snackbar — lightweight, reusable toast notification.
 *
 * Usage:
 *   import { showSnackbar } from './snackbar.js';
 *   showSnackbar('Copied to clipboard');
 *   showSnackbar('Error occurred', 3000);
 *
 * - Appends a .dp-snackbar to document.body
 * - Auto-dismisses after `duration` ms (default 2000)
 * - If called while visible, replaces current message (no stacking)
 * - Respects prefers-reduced-motion via CSS (no slide, instant appear/disappear)
 * - z-index 20000 (above lightbox 10000)
 */

/** @type {HTMLElement|null} */
let activeSnackbar = null;

/** @type {number} */
let dismissTimer = 0;

/**
 * Show a snackbar notification.
 * @param {string} message - Text to display
 * @param {number} [duration=2000] - Auto-dismiss delay in ms
 */
export function showSnackbar(message, duration) {
  if (duration === undefined) duration = 2000;

  // Reuse existing element or create a new one
  if (activeSnackbar) {
    clearTimeout(dismissTimer);
    activeSnackbar.classList.remove('dp-snackbar--visible');
  } else {
    activeSnackbar = document.createElement('div');
    activeSnackbar.className = 'dp-snackbar';
    activeSnackbar.setAttribute('role', 'status');
    activeSnackbar.setAttribute('aria-live', 'polite');
    document.body.appendChild(activeSnackbar);
  }

  activeSnackbar.textContent = message;

  // Force reflow so transition fires even when replacing
  void activeSnackbar.offsetHeight;
  activeSnackbar.classList.add('dp-snackbar--visible');

  dismissTimer = setTimeout(function () {
    if (!activeSnackbar) return;
    activeSnackbar.classList.remove('dp-snackbar--visible');

    // Remove from DOM after transition completes
    activeSnackbar.addEventListener('transitionend', function cleanup() {
      if (activeSnackbar && !activeSnackbar.classList.contains('dp-snackbar--visible')) {
        activeSnackbar.remove();
        activeSnackbar = null;
      }
    }, { once: true });

    // Fallback removal if transitionend doesn't fire (reduced motion)
    setTimeout(function () {
      if (activeSnackbar && !activeSnackbar.classList.contains('dp-snackbar--visible')) {
        activeSnackbar.remove();
        activeSnackbar = null;
      }
    }, 300);
  }, duration);
}
