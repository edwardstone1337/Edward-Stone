/**
 * Effects — Dev Projects Page
 *
 * 1. SVG noise overlay (atmospheric texture)
 * 2. Cursor-tracking glow on card grid (mouse only)
 * 3. Scroll-reveal entrance animations (IntersectionObserver)
 *
 * All animations respect prefers-reduced-motion.
 */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -----------------------------------------------
  // 1. NOISE OVERLAY
  // -----------------------------------------------
  function initNoise() {
    var existing = document.querySelector('.dp-noise');
    if (existing) return;

    var el = document.createElement('div');
    el.className = 'dp-noise';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
  }

  // -----------------------------------------------
  // 2. CURSOR-TRACKING GLOW
  // -----------------------------------------------
  function initCursorGlow() {
    // Skip on touch-only devices
    if (!window.matchMedia('(hover: hover)').matches) return;

    var grid = document.querySelector('.dp-card-grid');
    if (!grid) return;

    grid.addEventListener('mousemove', function (e) {
      var cards = grid.querySelectorAll('.dp-card');
      for (var i = 0; i < cards.length; i++) {
        var rect = cards[i].getBoundingClientRect();
        cards[i].style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
        cards[i].style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
      }
    });

    grid.addEventListener('mouseleave', function () {
      var cards = grid.querySelectorAll('.dp-card');
      for (var i = 0; i < cards.length; i++) {
        cards[i].style.removeProperty('--mouse-x');
        cards[i].style.removeProperty('--mouse-y');
      }
    });
  }

  // -----------------------------------------------
  // 3. SCROLL REVEAL
  // -----------------------------------------------
  function initScrollReveal() {
    if (prefersReducedMotion) {
      // Show everything immediately
      var els = document.querySelectorAll('.dp-reveal');
      for (var i = 0; i < els.length; i++) {
        els[i].classList.add('dp-revealed');
      }
      return;
    }

    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything
      var fallback = document.querySelectorAll('.dp-reveal');
      for (var j = 0; j < fallback.length; j++) {
        fallback[j].classList.add('dp-revealed');
      }
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Apply stagger delay based on data attribute
          var delay = entry.target.getAttribute('data-reveal-delay') || '0';
          entry.target.style.transitionDelay = delay + 'ms';
          entry.target.classList.add('dp-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    var elements = document.querySelectorAll('.dp-reveal');
    for (var k = 0; k < elements.length; k++) {
      observer.observe(elements[k]);
    }

    window.DPEffectsObserveReveals = function () {
      var newEls = document.querySelectorAll('.dp-reveal:not(.dp-revealed)');
      for (var m = 0; m < newEls.length; m++) {
        observer.observe(newEls[m]);
      }
    };
  }

  // -----------------------------------------------
  // INIT
  // -----------------------------------------------
  function init() {
    initNoise();
    initCursorGlow();
    initScrollReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
