/**
 * Cursor Chat Bubble
 *
 * Displays a speech-bubble next to the cursor on desktop, triggered by hover
 * or scroll position. Dev-only: bails on prod and touch/keyboard devices.
 *
 * Usage:
 *   import { initCursorChat } from './assets/js/dev-projects/cursor-chat.js';
 *   initCursorChat({
 *     triggers: [
 *       { type: 'hover', selector: '.dp-hero-heading', message: 'Hello!' },
 *       { type: 'scroll', y: 1200, message: 'Still reading?', duration: 4000 },
 *     ]
 *   });
 */

/**
 * Cursor Chat — desktop-only hover/click chat bubble system.
 * A Figma-inspired speech bubble that follows the cursor and displays
 * contextual messages when hovering or scrolling past trigger points.
 *
 * @param {Object} config
 * @param {Array} config.triggers
 * @param {string} config.triggers[].type - 'hover' or 'scroll'
 * @param {string} [config.triggers[].selector] - CSS selector (hover triggers)
 * @param {number} [config.triggers[].y] - scroll Y threshold (scroll triggers)
 * @param {string} config.triggers[].message - bubble text
 * @param {string} [config.triggers[].clickMessage] - alt text shown on click (hover only)
 * @param {number} [config.triggers[].duration=3000] - auto-hide ms (scroll only)
 *
 * Gates: desktop only (hover + fine pointer), reduced-motion safe.
 * Styles: assets/css/cursor-chat.css
 */
export function initCursorChat(config) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  /* ── DOM setup ── */
  const container = document.createElement('div');
  container.className = 'dp-cursor-chat';
  container.setAttribute('aria-hidden', 'true');

  const bubble = document.createElement('div');
  bubble.className = 'dp-cursor-chat__bubble';

  container.appendChild(bubble);
  document.body.appendChild(container);

  /* ── Mouse tracking — RAF-guarded to stay off the main thread ── */
  var rafId = null;
  var latestX = 0;
  var latestY = 0;

  document.addEventListener('mousemove', function (e) {
    latestX = e.clientX + 8;
    latestY = e.clientY + 16;
    if (rafId == null) {
      rafId = requestAnimationFrame(function () {
        container.style.setProperty('--x', latestX + 'px');
        container.style.setProperty('--y', latestY + 'px');
        rafId = null;
      });
    }
  });

  /* ── Show / hide helpers ── */
  var isScrollTriggered = false;

  function show(message, fromScroll) {
    isScrollTriggered = fromScroll === true;
    bubble.textContent = message;
    container.classList.add('dp-cursor-chat--active');
  }

  function hide() {
    isScrollTriggered = false;
    container.classList.remove('dp-cursor-chat--active');
  }

  /* ── Scroll dismiss — hides hover-triggered bubbles on scroll; leaves
     scroll-triggered bubbles alone so they run their full auto-hide duration ── */
  window.addEventListener('scroll', function () {
    if (!isScrollTriggered) hide();
  }, { passive: true });

  /* ── Triggers ── */
  var triggers = (config && Array.isArray(config.triggers)) ? config.triggers : [];

  triggers.forEach(function (trigger) {

    /* Hover trigger — show on mouseenter, hide on mouseleave */
    if (trigger.type === 'hover') {
      var elements = document.querySelectorAll(trigger.selector);
      if (!elements.length) return; // skip silently if selector matches nothing

      elements.forEach(function (el) {
        el.addEventListener('mouseenter', function () { show(trigger.message, false); });
        el.addEventListener('mouseleave', function () {
          if (trigger.leaveMessage) {
            show(trigger.leaveMessage, false);
            setTimeout(hide, 500);
          } else {
            hide();
          }
        });
        if (trigger.clickMessage) {
          el.addEventListener('click', function () { show(trigger.clickMessage, false); });
        }
      });

    /* Scroll trigger — show when scrollY passes trigger.y, auto-hides after duration.
       Uses IntersectionObserver on a lightweight sentinel for performance.
       Repeatable: resets when user scrolls back above trigger.y. */
    } else if (trigger.type === 'scroll') {
      var scrolledPast = false;
      var hideTimer = null;

      var sentinel = document.createElement('div');
      sentinel.setAttribute('aria-hidden', 'true');
      sentinel.style.cssText =
        'position:absolute;top:' + trigger.y + 'px;' +
        'left:0;height:1px;width:1px;pointer-events:none;opacity:0;';
      document.body.appendChild(sentinel);

      var io = new IntersectionObserver(function (entries) {
        var entry = entries[0];

        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          /* Sentinel scrolled above the viewport — user passed threshold going down */
          if (!scrolledPast) {
            scrolledPast = true;
            show(trigger.message, true);
            if (hideTimer) clearTimeout(hideTimer);
            hideTimer = setTimeout(hide, trigger.duration || 3000);
          }
        } else {
          /* Sentinel back in view or below viewport — user scrolled back up; reset */
          scrolledPast = false;
          if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
          }
        }
      }, { threshold: 0 });

      io.observe(sentinel);
    }
  });
}
