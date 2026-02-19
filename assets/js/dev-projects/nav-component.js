/**
 * Nav Component — Shared site navigation
 *
 * Generates <nav class="dp-nav"> and injects into #nav-container.
 * At ≤768px, desktop nav links hide and a hamburger opens a right-side drawer.
 *
 * Usage: Add <div id="nav-container"></div> to page, then:
 *   <script type="module">
 *     import { initNav } from './assets/js/dev-projects/nav-component.js';
 *     initNav();
 *   </script>
 */

/** Nav link definitions — add new links here */
const NAV_LINKS = [
  /* PROD-HIDE: Projects dropdown
  { text: 'Projects', children: [
    { text: 'Fair Share', href: '/projects/fair-share.html' },
    { text: 'SCP Reader', href: '/projects/scp-reader.html' }
  ]},
  END PROD-HIDE */
  { text: 'Resume', href: '/resume.html' },
  { text: 'Gallery', href: '/gallery.html' }
];

/**
 * Check if a link href matches the current page pathname
 * @param {string} linkHref - Absolute path of the link
 * @returns {boolean}
 */
function isCurrentPage(linkHref) {
  var current = window.location.pathname.replace(/\/$/, '') || '/';
  var target = linkHref.replace(/\/$/, '') || '/';
  if (current === '/index.html') current = '/';
  if (target === '/index.html') target = '/';
  return current === target;
}

/** Chevron SVG for dropdown trigger */
var CHEVRON_SVG = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** Close (X) icon SVG */
var CLOSE_SVG = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

/**
 * Generate the nav links HTML (desktop dropdown)
 * @returns {string}
 */
function generateLinksHTML() {
  return NAV_LINKS.map(function (link) {
    if (link.children) {
      var childLinks = link.children.map(function (child) {
        var ariaCurrent = isCurrentPage(child.href) ? ' aria-current="page"' : '';
        return '<a href="' + child.href + '" role="menuitem" class="dp-nav-dropdown-item"' + ariaCurrent + '>' + child.text + '</a>';
      }).join('');

      return '<div class="dp-nav-dropdown">' +
        '<button class="dp-nav-link dp-nav-dropdown-trigger" aria-expanded="false" aria-haspopup="true">' +
          link.text + ' ' + CHEVRON_SVG +
        '</button>' +
        '<div class="dp-dropdown-menu dp-nav-dropdown-menu" role="menu" hidden>' +
          childLinks +
        '</div>' +
      '</div>';
    }

    var ariaCurrent = isCurrentPage(link.href) ? ' aria-current="page"' : '';
    return '<a href="' + link.href + '" class="dp-nav-link"' + ariaCurrent + '>' + link.text + '</a>';
  }).join('');
}

/**
 * Generate the drawer links HTML (flat list with headings for groups)
 * @returns {string}
 */
function generateDrawerLinksHTML() {
  var html = '';
  var moreHeadingRendered = false;
  var hasChildGroups = NAV_LINKS.some(function (link) { return !!link.children; });
  NAV_LINKS.forEach(function (link) {
    if (link.children) {
      html += '<span class="dp-nav-drawer-heading">' + link.text + '</span>';
      link.children.forEach(function (child) {
        var ariaCurrent = isCurrentPage(child.href) ? ' aria-current="page"' : '';
        html += '<a href="' + child.href + '" class="dp-nav-drawer-link"' + ariaCurrent + '>' + child.text + '</a>';
      });
    } else {
      if (hasChildGroups && !moreHeadingRendered) {
        html += '<span class="dp-nav-drawer-heading">More</span>';
        moreHeadingRendered = true;
      }
      var ariaCurrent = isCurrentPage(link.href) ? ' aria-current="page"' : '';
      html += '<a href="' + link.href + '" class="dp-nav-drawer-link"' + ariaCurrent + '>' + link.text + '</a>';
    }
  });
  return html;
}

/**
 * Bind dropdown open/close behaviour (desktop)
 * @param {HTMLElement} nav - The nav element
 */
function initDropdowns(nav) {
  var dropdowns = nav.querySelectorAll('.dp-nav-dropdown');

  dropdowns.forEach(function (dropdown) {
    var trigger = dropdown.querySelector('.dp-nav-dropdown-trigger');
    var menu = dropdown.querySelector('.dp-nav-dropdown-menu');

    function open() {
      trigger.setAttribute('aria-expanded', 'true');
      menu.removeAttribute('hidden');
    }

    function close() {
      trigger.setAttribute('aria-expanded', 'false');
      menu.setAttribute('hidden', '');
    }

    function toggle() {
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';
      if (isOpen) { close(); } else { open(); }
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggle();
    });

    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) { close(); }
    });

    dropdown.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        close();
        trigger.focus();
      }
    });
  });
}

/**
 * Create and bind the mobile drawer
 * @param {HTMLElement} hamburger - The hamburger button element
 */
function initDrawer(hamburger) {
  var drawer = document.createElement('div');
  drawer.className = 'dp-nav-drawer';
  drawer.id = 'dp-nav-drawer';
  drawer.setAttribute('aria-label', 'Navigation menu');
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('hidden', '');

  drawer.innerHTML =
    '<div class="dp-nav-drawer-backdrop"></div>' +
    '<div class="dp-nav-drawer-panel">' +
      '<button class="dp-nav-drawer-close" aria-label="Close menu">' + CLOSE_SVG + '</button>' +
      '<nav class="dp-nav-drawer-links" aria-label="Menu">' +
        generateDrawerLinksHTML() +
      '</nav>' +
    '</div>';

  document.body.appendChild(drawer);

  var backdrop = drawer.querySelector('.dp-nav-drawer-backdrop');
  var panel = drawer.querySelector('.dp-nav-drawer-panel');
  var closeBtn = drawer.querySelector('.dp-nav-drawer-close');

  function openDrawer() {
    drawer.removeAttribute('hidden');
    // Force reflow so the transition fires after display change
    void panel.offsetHeight;
    drawer.classList.add('dp-nav-drawer--open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeDrawer() {
    drawer.classList.remove('dp-nav-drawer--open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    function onEnd() {
      panel.removeEventListener('transitionend', onEnd);
      if (!drawer.classList.contains('dp-nav-drawer--open')) {
        drawer.setAttribute('hidden', '');
      }
    }
    panel.addEventListener('transitionend', onEnd);

    // Fallback if transition doesn't fire (e.g. reduced motion)
    setTimeout(function () {
      if (!drawer.classList.contains('dp-nav-drawer--open')) {
        drawer.setAttribute('hidden', '');
      }
    }, 350);
  }

  hamburger.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', function () {
    closeDrawer();
    hamburger.focus();
  });
  backdrop.addEventListener('click', function () {
    closeDrawer();
    hamburger.focus();
  });

  drawer.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeDrawer();
      hamburger.focus();
    }

    // Focus trap
    if (e.key === 'Tab') {
      var focusable = panel.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });
}

/**
 * Dynamically load the snake game script.
 * Resolved relative to this module so every page gets the correct path
 * without needing its own <script> tag.
 */
function loadSnakeGame() {
  var script = document.createElement('script');
  script.src = new URL('snake-game.js', import.meta.url).href;
  document.head.appendChild(script);
}

/**
 * Inject the site navigation into #nav-container
 */
export function initNav() {
  var container = document.getElementById('nav-container');
  if (!container) return;

  var nav = document.createElement('nav');
  nav.className = 'dp-nav';
  nav.setAttribute('aria-label', 'Site navigation');

  nav.innerHTML =
    '<div class="dp-nav-inner">' +
      '<a href="/index.html" class="dp-nav-brand" aria-label="Edward Stone, Go to homepage">' +
        '<svg class="dp-nav-logo" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
          '<rect x="40" y="40" width="40" height="40" rx="20" transform="rotate(-180 40 40)" fill="black"/>' +
          '<g clip-path="url(#nav-clip)">' +
            '<path d="M17.5356 4.99999C27.6155 2.01097 38.8338 11.6176 33.7466 26.1765C35.0001 19.5588 25.0997 16.3646 16.4009 13.8235C11.1332 12.2847 7.45569 7.98901 17.5356 4.99999Z" fill="url(#nav-paint0)"/>' +
            '<path d="M22.4644 35C12.3845 37.989 1.16624 28.3823 6.25343 13.8235C4.99994 20.4412 14.9003 23.6353 23.5991 26.1765C28.8668 27.7153 32.5443 32.011 22.4644 35Z" fill="url(#nav-paint1)" fill-opacity="0.5"/>' +
            '<path d="M22.4644 35C12.3845 37.989 1.16624 28.3823 6.25343 13.8235C4.99994 20.4412 14.9003 23.6353 23.5991 26.1765C28.8668 27.7153 32.5443 32.011 22.4644 35Z" fill="white"/>' +
          '</g>' +
          '<defs>' +
            '<linearGradient id="nav-paint0" x1="11.5176" y1="9.51703" x2="36.2755" y2="24.2457" gradientUnits="userSpaceOnUse">' +
              '<stop stop-color="#B8C2FF"/>' +
              '<stop offset="1" stop-color="#5E6AD2"/>' +
            '</linearGradient>' +
            '<linearGradient id="nav-paint1" x1="16.9063" y1="13.8235" x2="16.9063" y2="35.5455" gradientUnits="userSpaceOnUse">' +
              '<stop stop-color="#B8C2FF"/>' +
              '<stop offset="1" stop-color="#5E6AD2"/>' +
            '</linearGradient>' +
            '<clipPath id="nav-clip">' +
              '<rect x="5" y="5" width="30" height="30" rx="15" fill="white"/>' +
            '</clipPath>' +
          '</defs>' +
        '</svg>' +
        '<span class="dp-nav-name">Edward Stone</span>' +
      '</a>' +
      '<div class="dp-nav-links">' +
        generateLinksHTML() +
      '</div>' +
      '<div class="dp-nav-actions" id="dp-nav-actions">' +
        '<button class="dp-nav-link dp-nav-hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="dp-nav-drawer">' +
          '<span class="dp-nav-hamburger-label">Menu</span>' +
        '</button>' +
      '</div>' +
    '</div>';

  container.replaceWith(nav);
  initDropdowns(nav);

  var hamburger = nav.querySelector('.dp-nav-hamburger');
  initDrawer(hamburger);

  loadSnakeGame();
}
