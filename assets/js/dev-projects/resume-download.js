/**
 * Resume download widget — dropdown button with format menu.
 * Handles: trigger toggle, outside click close, copy-to-clipboard.
 */
import { printResume } from './resume-lightbox.js';
import { showSnackbar } from './snackbar.js';

export function initResumeDownload() {
  const controller = new AbortController();
  const { signal } = controller;

  // Toggle menu on trigger click
  document.querySelectorAll('.dp-download-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const widget = trigger.closest('[data-download-widget]');
      const menu = widget.querySelector('.dp-download-menu');
      const isOpen = !menu.hidden;
      closeAllMenus();
      if (!isOpen) {
        menu.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
      }
    }, { signal });
  });

  // Copy to clipboard
  document.querySelectorAll('[data-copy-resume]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const resumeEl = document.querySelector('.dp-resume-container');
      if (!resumeEl) return;
      const text = resumeEl.innerText;
      try {
        await navigator.clipboard.writeText(text);
        showSnackbar('Copied to clipboard');
      } catch {
        showSnackbar('Copy failed — try again');
      }
      closeAllMenus();
    }, { signal });
  });

  // Print PDF (silent print flow)
  document.querySelectorAll('[data-print-pdf]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllMenus();
      printResume();
    }, { signal: controller.signal });
  });

  // Close menus on outside click or Escape
  document.addEventListener('click', () => closeAllMenus(), { signal });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllMenus();
  }, { signal });

  function closeAllMenus() {
    document.querySelectorAll('.dp-download-menu').forEach(m => m.hidden = true);
    document.querySelectorAll('.dp-download-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));
  }

  return { destroy: () => controller.abort() };
}
