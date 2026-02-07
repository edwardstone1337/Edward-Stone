/**
 * Back to top — Dev Projects Page
 *
 * Floating glassy circle button with logo SVG; scrolls to top on click.
 * Same component style as theme toggle and snake toggle. Placed to the left of the snake.
 */
(function () {
  'use strict';

  // Logo SVG: outer ring (dp-btt-stroke-ring) 2px stroke entirely outside logo. viewBox 48x48 so ring isn't clipped.
  var logoIcon = '<svg class="dp-back-to-top-logo" viewBox="-4 -4 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g transform="translate(4, 4)"><circle class="dp-btt-stroke-ring" cx="16" cy="16" r="17.75" fill="none" stroke-width="3.5"/><rect width="32" height="32" rx="16" fill="black"/><g clip-path="url(#dp-btt-clip)"><path d="M17.9716 28C9.90767 30.3912 0.93304 22.7059 5.00279 11.0588C4 16.353 11.9203 18.9083 18.8793 20.9412C23.0935 22.1723 26.0355 25.6088 17.9716 28Z" fill="url(#dp-btt-paint0)"/><path d="M14.0284 3.99999C22.0923 1.60877 31.067 9.2941 26.9972 20.9412C28 15.647 20.0797 13.0917 13.1207 11.0588C8.9065 9.82774 5.9645 6.3912 14.0284 3.99999Z" fill="url(#dp-btt-paint1)" fill-opacity="0.5"/><path d="M14.0284 3.99999C22.0923 1.60877 31.067 9.2941 26.9972 20.9412C28 15.647 20.0797 13.0917 13.1207 11.0588C8.9065 9.82774 5.9645 6.3912 14.0284 3.99999Z" fill="white"/></g></g><defs><linearGradient id="dp-btt-paint0" x1="4.2642" y1="15.1089" x2="24.0706" y2="26.8917" gradientUnits="userSpaceOnUse"><stop stop-color="#B8C2FF"/><stop offset="1" stop-color="#5E6AD2"/></linearGradient><linearGradient id="dp-btt-paint1" x1="18.4749" y1="20.9412" x2="18.4749" y2="3.56359" gradientUnits="userSpaceOnUse"><stop stop-color="#B8C2FF"/><stop offset="1" stop-color="#5E6AD2"/></linearGradient><clipPath id="dp-btt-clip"><rect x="4" y="4" width="24" height="24" rx="12" fill="white"/></clipPath></defs></svg>';

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderButton() {
    var btn = document.createElement('button');
    btn.className = 'dp-back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.setAttribute('type', 'button');
    btn.innerHTML = logoIcon;
    btn.addEventListener('click', scrollToTop);
    document.body.appendChild(btn);
  }

  function init() {
    renderButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
