/**
 * Shared Utilities
 * 
 * Common utility functions used across all components.
 * This file must be loaded before any component scripts.
 * 
 * Usage:
 *   Utils.escapeHTML('<script>alert("xss")</script>')
 *   // Returns: '&lt;script&gt;alert("xss")&lt;/script&gt;'
 */

(function() {
  'use strict';

  // Prevent double-loading
  if (typeof window.Utils !== 'undefined') {
    console.warn('Utils already loaded');
    return;
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
    escapeHTML: escapeHTML
  };

})();
