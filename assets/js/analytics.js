/**
 * Analytics Module
 *
 * Tracks custom GA4 events for user interactions on the portfolio site.
 * Requires GA4 to be loaded (gtag.js) and fires events via the global gtag() function.
 *
 * Events tracked:
 * - project_click: clicks on project strip buttons (learn more / visit)
 * - snake_opened: snake game overlay opened
 * - resume_lightbox: resume lightbox opened
 * - resume_download: resume download actions (pdf, print, clipboard, hero)
 * - easter_egg: avatar easter egg triggered
 */
(function () {
  'use strict';

  /**
   * Safe gtag wrapper — only fires if gtag is available
   */
  function track(eventName, params) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, params || {});
    }
  }

  /**
   * Derive project name from strip ID
   * e.g. "strip-fair-share" → "fair-share"
   */
  function getProjectNameFromStrip(strip) {
    if (!strip || !strip.id) return 'unknown';
    var id = strip.id;
    return id.startsWith('strip-') ? id.substring(6) : id;
  }

  /**
   * Determine action type from link href
   * Internal /projects/ paths → "learn_more"
   * External URLs → "visit"
   */
  function getActionType(href) {
    if (!href) return 'unknown';
    if (href.includes('/projects/')) return 'learn_more';
    return 'visit';
  }

  /**
   * 1. project_click
   * Event delegation: listen for clicks on .dp-btn inside .dp-strip
   */
  function initProjectClickTracking() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.dp-btn');
      if (!btn) return;

      var strip = btn.closest('.dp-strip');
      if (!strip) return;

      var projectName = getProjectNameFromStrip(strip);
      var action = getActionType(btn.getAttribute('href'));

      track('project_click', {
        project_name: projectName,
        action: action
      });
    });
  }

  /**
   * 2. snake_opened
   * Listen for click on .dp-snake-toggle in #dp-nav-actions
   */
  function initSnakeTracking() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.dp-snake-toggle');
      if (!btn) return;

      // Only track the "open" button, not the close button in overlay
      if (btn.classList.contains('dp-snake-toggle--in-overlay')) return;

      track('snake_opened', {});
    });
  }

  /**
   * 3. resume_lightbox
   * Listen for click on .dp-resume-container (only fires if viewport > 1080px)
   */
  function initResumeLightboxTracking() {
    document.addEventListener('click', function (e) {
      var container = e.target.closest('.dp-resume-container');
      if (!container) return;

      // Mirror lightbox behaviour: only track when viewport > 1080px
      if (window.innerWidth <= 1080) return;

      track('resume_lightbox', {});
    });
  }

  /**
   * 4. resume_download
   * Listen for clicks on download widget buttons
   * Methods: print, clipboard
   */
  function initResumeDownloadTracking() {
    document.addEventListener('click', function (e) {
      var method = null;

      // Check which download method was clicked
      if (e.target.closest('[data-print-pdf]')) {
        method = 'print';
      } else if (e.target.closest('[data-copy-resume]')) {
        method = 'clipboard';
      }

      if (!method) return;

      track('resume_download', {
        method: method
      });
    });
  }

  /**
   * 5. hero_resume_download
   * Listen for click on hero resume download button (static PDF)
   */
  function initHeroResumeTracking() {
    var heroBtn = document.querySelector('.dp-hero .dp-btn-primary[download]');
    if (!heroBtn) return;
    heroBtn.addEventListener('click', function () {
      track('resume_download', {
        method: 'pdf',
        location: 'hero'
      });
    });
  }

  /**
   * 6. easter_egg
   * Listen for click on .dp-avatar-wrap
   */
  function initEasterEggTracking() {
    document.addEventListener('click', function (e) {
      var avatarWrap = e.target.closest('.dp-avatar-wrap');
      if (!avatarWrap) return;

      track('easter_egg', {
        type: 'avatar'
      });
    });
  }

  /**
   * Initialize all tracking
   */
  function init() {
    initProjectClickTracking();
    initSnakeTracking();
    initResumeLightboxTracking();
    initResumeDownloadTracking();
    initHeroResumeTracking();
    initEasterEggTracking();
  }

  // Initialize on DOMContentLoaded or immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
