/**
 * Dev-projects utilities (standalone from main-site utils.js).
 * Used by product-strip.js and project-card.js.
 */

/**
 * Sanitize URL for href/src: block javascript:, vbscript:, data: and similar.
 * @param {string} url - URL string from config
 * @returns {string} Safe URL or '#' if protocol is disallowed
 */
export function sanitizeUrl(url) {
  if (url == null || typeof url !== 'string') return '';
  var s = String(url).trim();
  if (s === '') return '';
  var lower = s.toLowerCase();
  if (lower.indexOf('javascript:') === 0 || lower.indexOf('vbscript:') === 0 || lower.indexOf('data:') === 0) {
    return '#';
  }
  return s;
}

/**
 * Escape HTML special characters for safe HTML insertion.
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHTML(str) {
  if (str == null) return '';
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
