/**
 * Shared Utilities
 * 
 * Common utility functions used across all components.
 * This file must be loaded before any component scripts.
 * 
 * Usage:
 *   Utils.escapeHTML('<script>alert("xss")</script>')
 *   // Returns: '&lt;script&gt;alert("xss")&lt;/script&gt;'
 *
 *   Utils.sanitizeUrl(url) — use for config-derived href/src; blocks javascript:, vbscript:, data:
 */

(function() {
  'use strict';

  // Prevent double-loading (intentional dev feedback; no centralized logger in this project)
  if (typeof window.Utils !== 'undefined') {
    console.warn('Utils already loaded');
    return;
  }

  /**
   * Sanitize URL for use in href/src: block javascript:, vbscript:, data: and similar.
   * Use for any config-derived URL before escapeHTML when setting href or src.
   * @param {string} url - URL string from config
   * @returns {string} Safe URL or '#' if protocol is disallowed
   */
  function sanitizeUrl(url) {
    if (url == null || typeof url !== 'string') return '';
    const s = String(url).trim();
    if (s === '') return '';
    const lower = s.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('data:')) {
      return '#';
    }
    return s;
  }

  /**
   * Escape HTML special characters to prevent XSS attacks
   * 
   * @param {string} str - String to escape
   * @returns {string} Escaped string safe for HTML insertion
   * 
   * @example
   * Utils.escapeHTML('<script>alert("xss")</script>')
   * // Returns: '&lt;script&gt;alert("xss")&lt;/script&gt;'
   * 
   * @example
   * Utils.escapeHTML(null)
   * // Returns: ''
   */
  function escapeHTML(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Export utilities
  window.Utils = {
    escapeHTML: escapeHTML,
    sanitizeUrl: sanitizeUrl
  };

})();
