/**
 * Back to Top — Dev Projects Page
 *
 * Floating button, bottom-right corner.
 * Appears after scrolling 1 viewport height. Smooth-scrolls to top on click.
 * Respects prefers-reduced-motion.
 */
(function () {
  'use strict';

  var SCROLL_THRESHOLD = window.innerHeight;
  var btn = null;
  var visible = false;

  var arrowIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>';

  function scrollToTop() {
    var behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    window.scrollTo({ top: 0, behavior: behavior });
  }

  function updateVisibility() {
    var shouldShow = window.scrollY > SCROLL_THRESHOLD;
    if (shouldShow === visible) return;
    visible = shouldShow;
    btn.style.opacity = shouldShow ? '1' : '0';
    btn.style.pointerEvents = shouldShow ? 'auto' : 'none';
  }

  function renderButton() {
    btn = document.createElement('button');
    btn.className = 'dp-back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.setAttribute('type', 'button');
    btn.innerHTML = arrowIcon;
    btn.style.opacity = '0';
    btn.style.pointerEvents = 'none';
    btn.addEventListener('click', scrollToTop);
    document.body.appendChild(btn);
  }

  function init() {
    renderButton();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
