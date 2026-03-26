/**
 * Page Counter — Mechanical odometer for the portfolio footer
 *
 * Inserts a 6-digit roller counter into .dp-footer-inner between
 * .dp-footer-text and .dp-footer-links. Calls Supabase RPC on load to
 * increment and retrieve the page-view count. Animates on scroll-in via
 * IntersectionObserver (one-shot). Respects prefers-reduced-motion.
 *
 * Reel geometry: 10 spans stacked, each = cell height.
 * Reel total height = 10 × cell. translateY(-N * 10%) shows digit N.
 *
 * Timing: DOM is inserted immediately at 000000. Fetch and IntersectionObserver
 * run independently. Whichever resolves last triggers the animation.
 */

var SUPABASE_URL = 'https://wclltistwbogrmtrlbzk.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjbGx0aXN0d2JvZ3JtdHJsYnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MTA4NjQsImV4cCI6MjA5MDA4Njg2NH0.HYVG0jaVuP0AdX4ELT9-2p8czRjb5Of5cHLvoJXNPaU';

var DIGIT_COUNT = 6;
var STAGGER_MS = 80;

function pad(n, len) {
  return String(n).padStart(len, '0');
}

function buildReel() {
  var reel = document.createElement('div');
  reel.className = 'dp-counter__reel';
  for (var i = 0; i <= 9; i++) {
    var span = document.createElement('span');
    span.textContent = String(i);
    reel.appendChild(span);
  }
  return reel;
}

function buildCounter(formatted) {
  var wrapper = document.createElement('div');
  wrapper.className = 'dp-counter';
  wrapper.setAttribute('aria-label', 'Page views: ' + parseInt(formatted, 10).toLocaleString());

  var track = document.createElement('div');
  track.className = 'dp-counter__track';

  for (var i = 0; i < DIGIT_COUNT; i++) {
    var cell = document.createElement('div');
    cell.className = 'dp-counter__digit';
    cell.setAttribute('data-digit', formatted[i]);
    cell.appendChild(buildReel());
    track.appendChild(cell);
  }

  wrapper.appendChild(track);
  return wrapper;
}

function applyDigit(cell, digit, animate) {
  var reel = cell.querySelector('.dp-counter__reel');
  if (!reel) return;
  if (!animate) {
    reel.style.transition = 'none';
  }
  reel.style.transform = 'translateY(' + (-digit * 10) + '%)';
}

async function fetchCount() {
  var isNewSession = sessionStorage.getItem('es_visited') === null;
  if (isNewSession) {
    sessionStorage.setItem('es_visited', '1');
  }
  try {
    var res = await fetch(SUPABASE_URL + '/rest/v1/rpc/increment_visit', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_new_session: isNewSession })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var data = await res.json();
    var count = data.total_page_views;
    localStorage.setItem('es_page_views', String(count));
    return count;
  } catch (e) {
    var cached = localStorage.getItem('es_page_views');
    return cached !== null ? parseInt(cached, 10) : 0;
  }
}

export function initPageCounter() {
  var footerInner = document.querySelector('.dp-footer-inner');
  if (!footerInner) return;

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Insert DOM immediately with all digits at 0 (start position)
  var counter = buildCounter(pad(0, DIGIT_COUNT));
  var footerLinks = footerInner.querySelector('.dp-footer-links');
  footerInner.insertBefore(counter, footerLinks);
  var cells = counter.querySelectorAll('.dp-counter__digit');

  // prefers-reduced-motion: fetch then set digits instantly, no animation
  if (prefersReducedMotion) {
    fetchCount().then(function (count) {
      var formatted = pad(count, DIGIT_COUNT);
      counter.setAttribute('aria-label', 'Page views: ' + count.toLocaleString());
      for (var i = 0; i < cells.length; i++) {
        applyDigit(cells[i], parseInt(formatted[i], 10), false);
      }
    });
    return;
  }

  // No IntersectionObserver support: fetch then apply with CSS transition
  if (!('IntersectionObserver' in window)) {
    fetchCount().then(function (count) {
      var formatted = pad(count, DIGIT_COUNT);
      counter.setAttribute('aria-label', 'Page views: ' + count.toLocaleString());
      for (var j = 0; j < cells.length; j++) {
        applyDigit(cells[j], parseInt(formatted[j], 10), true);
      }
    });
    return;
  }

  // Timing state: whichever of fetch / observer resolves last triggers animation
  var fetchedFormatted = null;
  var inView = false;

  function animateToFormatted(formatted) {
    counter.setAttribute('aria-label', 'Page views: ' + parseInt(formatted, 10).toLocaleString());
    for (var k = 0; k < cells.length; k++) {
      (function (cell, index) {
        var digit = parseInt(formatted[index], 10);
        var reel = cell.querySelector('.dp-counter__reel');
        if (!reel) return;
        reel.style.transitionDelay = (index * STAGGER_MS) + 'ms';
        reel.style.transform = 'translateY(' + (-digit * 10) + '%)';
      })(cells[k], k);
    }
  }

  // Kick off fetch immediately — don't wait for scroll-in
  fetchCount().then(function (count) {
    fetchedFormatted = pad(count, DIGIT_COUNT);
    if (inView) {
      animateToFormatted(fetchedFormatted);
    }
    // Not yet in view: observer will call animateToFormatted when it fires
  });

  // One-shot observer — same pattern as effects.js initScrollReveal()
  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      inView = true;
      if (fetchedFormatted !== null) {
        animateToFormatted(fetchedFormatted);
      }
      // Fetch not yet resolved: fetchCount().then() will animate when ready
    });
  }, { threshold: 0.1 });

  observer.observe(counter);
}
