/**
 * Magnetic Tilt — Dev Projects
 *
 * Cursor-following tilt for elements with .dp-magnetic-tilt.
 * Respects prefers-reduced-motion.
 * Exposes DPMagneticTilt.init(selector) for late-bound elements.
 */
(function () {
  'use strict';

  var DEFAULT_INTENSITY = 8;
  var reducedMotionQuery = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

  function getIntensity(el) {
    var val = el.getAttribute('data-tilt-intensity');
    if (val === null || val === '') return DEFAULT_INTENSITY;
    var n = parseInt(val, 10);
    return isNaN(n) ? DEFAULT_INTENSITY : n;
  }

  function setTilt(el, xDeg, yDeg) {
    el.style.transform = 'perspective(600px) rotateY(' + xDeg + 'deg) rotateX(' + yDeg + 'deg)';
  }

  function resetTilt(el) {
    el.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg)';
  }

  function attachTilt(el) {
    if (el._dpMagneticTiltAttached) return;
    var intensity = getIntensity(el);

    function onMove(e) {
      var rect = el.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var centerY = rect.top + rect.height / 2;
      var halfW = rect.width / 2;
      var halfH = rect.height / 2;
      if (halfW <= 0 || halfH <= 0) return;
      var normX = (e.clientX - centerX) / halfW;
      var normY = (e.clientY - centerY) / halfH;
      normX = Math.max(-1, Math.min(1, normX));
      normY = Math.max(-1, Math.min(1, normY));
      var tiltX = intensity * normX;   /* vertical axis: left neg, right pos */
      var tiltY = -intensity * normY;  /* horizontal axis: above pos, below neg */
      setTilt(el, tiltX, tiltY);
    }

    function onLeave() {
      resetTilt(el);
    }
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    el._dpMagneticTiltAttached = true;
    el._dpMagneticTiltCleanup = function () {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      resetTilt(el);
      el._dpMagneticTiltAttached = false;
      delete el._dpMagneticTiltCleanup;
    };
  }

  function detachTilt(el) {
    if (el._dpMagneticTiltCleanup) el._dpMagneticTiltCleanup();
  }

  function initElement(el) {
    if (!el || !el.classList || !el.classList.contains('dp-magnetic-tilt')) return;
    if (reducedMotionQuery && reducedMotionQuery.matches) {
      setTilt(el, 0, 0);
      return;
    }
    attachTilt(el);
  }

  function initAll() {
    if (reducedMotionQuery && reducedMotionQuery.matches) {
      var all = document.querySelectorAll('.dp-magnetic-tilt');
      for (var i = 0; i < all.length; i++) {
        detachTilt(all[i]);
        setTilt(all[i], 0, 0);
      }
      return;
    }
    var elements = document.querySelectorAll('.dp-magnetic-tilt');
    for (var j = 0; j < elements.length; j++) initElement(elements[j]);
  }

  function onReducedMotionChange() {
    if (reducedMotionQuery && reducedMotionQuery.matches) {
      var all = document.querySelectorAll('.dp-magnetic-tilt');
      for (var i = 0; i < all.length; i++) {
        detachTilt(all[i]);
        setTilt(all[i], 0, 0);
      }
    } else {
      initAll();
    }
  }

  if (reducedMotionQuery && reducedMotionQuery.addEventListener) {
    reducedMotionQuery.addEventListener('change', onReducedMotionChange);
  }

  window.DPMagneticTilt = {
    init: function (selector) {
      if (selector === undefined) {
        initAll();
        return;
      }
      if (typeof selector === 'string') {
        var list = document.querySelectorAll(selector);
        for (var i = 0; i < list.length; i++) initElement(list[i]);
      } else if (selector && selector.nodeType === 1) {
        initElement(selector);
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
