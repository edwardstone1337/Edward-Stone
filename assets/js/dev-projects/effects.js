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

    // Card grid — glow on each card
    var grid = document.querySelector('.dp-card-grid');
    if (grid) {
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

    // Resume container — same glow pattern (scoped to page wrapper, not lightbox)
    var resumeContainer = document.querySelector('.dp-resume-page-wrapper .dp-resume-container');
    if (resumeContainer) {
      resumeContainer.addEventListener('mousemove', function (e) {
        var rect = resumeContainer.getBoundingClientRect();
        resumeContainer.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
        resumeContainer.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
      });

      resumeContainer.addEventListener('mouseleave', function () {
        resumeContainer.style.removeProperty('--mouse-x');
        resumeContainer.style.removeProperty('--mouse-y');
      });
    }
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

    function applyReveal(entry, obs) {
      if (entry.isIntersecting) {
        var delay = entry.target.getAttribute('data-reveal-delay') || '0';
        entry.target.style.transitionDelay = delay + 'ms';
        entry.target.classList.add('dp-revealed');
        obs.unobserve(entry.target);
      }
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        applyReveal(entry, observer);
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    var earlyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        applyReveal(entry, earlyObserver);
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px 200px 0px'
    });

    var elements = document.querySelectorAll('.dp-reveal');
    for (var k = 0; k < elements.length; k++) {
      var el = elements[k];
      if (el.classList.contains('dp-reveal--early')) {
        earlyObserver.observe(el);
      } else {
        observer.observe(el);
      }
    }

    // Immediately reveal any .dp-reveal elements already in the viewport on load
    for (var n = 0; n < elements.length; n++) {
      var el = elements[n];
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('dp-revealed');
        el.style.transitionDelay = (el.getAttribute('data-reveal-delay') || '0') + 'ms';
      }
    }

    window.DPEffectsObserveReveals = function () {
      var newEls = document.querySelectorAll('.dp-reveal:not(.dp-revealed)');
      for (var m = 0; m < newEls.length; m++) {
        var newEl = newEls[m];
        if (newEl.classList.contains('dp-reveal--early')) {
          earlyObserver.observe(newEl);
        } else {
          observer.observe(newEl);
        }
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
