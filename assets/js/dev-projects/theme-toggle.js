/**
 * Theme Toggle — Dev Projects Page
 *
 * Behaviour:
 * 1. On load: check localStorage for 'dp-theme'. If not set, read prefers-color-scheme.
 * 2. Apply theme as data-theme attribute on <html>.
 * 3. Render a floating toggle button (sun/moon icons).
 * 4. On click: toggle theme, persist to localStorage.
 * 5. Listen for system preference changes (if no manual override).
 * 6. Broadcasts theme to strip iframes via postMessage.
 */

var STORAGE_KEY = 'dp-theme';

// --- SVG icons ---
var sunIcon = '<svg class="dp-toggle-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

var moonIcon = '<svg class="dp-toggle-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

function setStoredTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {
    // localStorage not available — theme will reset on reload
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  broadcastThemeToIframes(theme);
}

function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

function broadcastThemeToIframes(theme) {
  var iframes = document.querySelectorAll('.dp-card-media-iframe, .dp-strip .dp-strip-media iframe');
  iframes.forEach(function (iframe) {
    try {
      iframe.contentWindow.postMessage({ type: 'theme-change', theme: theme }, '*');
    } catch (e) { /* iframe not ready */ }
  });
}

function toggleTheme() {
  var current = getCurrentTheme();
  var next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  setStoredTheme(next);
}

function renderToggle() {
  var btn = document.createElement('button');
  btn.className = 'dp-theme-toggle';
  btn.setAttribute('aria-label', 'Toggle theme');
  btn.setAttribute('type', 'button');
  btn.innerHTML = sunIcon + moonIcon;
  btn.addEventListener('click', toggleTheme);
  var container = document.getElementById('dp-nav-actions');
  (container || document.body).appendChild(btn);
}

export function initThemeToggle() {
  // Determine initial theme (pre-init script in <head> already set data-theme;
  // this re-applies to broadcast to iframes)
  var stored = getStoredTheme();
  var theme = stored || getSystemTheme();
  applyTheme(theme);

  // Broadcast theme to iframes that load after init
  document.addEventListener('load', function (e) {
    if (e.target.classList && e.target.classList.contains('dp-card-media-iframe')) {
      broadcastThemeToIframes(getCurrentTheme());
    }
  }, true);

  // Render toggle button
  renderToggle();

  // Listen for system preference changes (only if no manual override)
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!getStoredTheme()) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}
