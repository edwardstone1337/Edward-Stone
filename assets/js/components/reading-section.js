/**
 * Reading Section Component
 * Reusable section component for displaying book covers image
 * 
 * Usage:
 *   <div id="reading-container"></div>
 *   <script src="assets/js/utils.js"></script>
 *   <script src="assets/js/components/reading-section.js"></script>
 *   <script>
 *     window.ReadingSection.init('reading-container', {
 *       heading: 'I read these so you don\'t have to',
 *       imagePath: 'assets/images/books.png',
 *       imageAlt: 'Book covers'
 *     });
 *   </script>
 */

(function() {
  'use strict';

  if (typeof window.Utils === 'undefined' || typeof window.Utils.escapeHTML !== 'function') {
    throw new Error('ReadingSection requires utils.js (Utils.escapeHTML). Load utils.js before this script.');
  }

  const escapeHTML = Utils.escapeHTML;
  const sanitizeUrl = Utils.sanitizeUrl;

  // ============================================
  // Configuration
  // ============================================
  const defaultConfig = {
    heading: 'I read these so you don\'t have to',
    imagePath: 'assets/images/books.png',
    imageAlt: 'Book covers of product and UX books'
  };

  // ============================================
  // Helper Functions
  // ============================================
  
  // ============================================
  // Core Functionality
  // ============================================
  
  /**
   * Generate reading section HTML structure
   * @param {Object} config - Configuration object
   * @param {string} config.heading - Section heading text
   * @param {string} config.imagePath - Path to the book covers image
   * @param {string} config.imageAlt - Alt text for the image
   * @returns {string} HTML string for reading section
   */
  function generateReadingHTML(config) {
    const heading = escapeHTML(config.heading || defaultConfig.heading);
    const imagePath = escapeHTML(sanitizeUrl(config.imagePath || defaultConfig.imagePath));
    const imageAlt = escapeHTML(config.imageAlt || defaultConfig.imageAlt);

    return `
      <section class="reading-section" aria-label="Reading">
        <h2 class="section-heading">${heading}</h2>
        <div class="reading-image">
          <img src="${imagePath}" alt="${imageAlt}" />
        </div>
      </section>
    `;
  }

  // ============================================
  // Initialization
  // ============================================
  
  /**
   * Initialize the reading section component
   * @param {string} containerId - ID of the container element (default: 'reading-container')
   * @param {Object} config - Configuration object (optional)
   */
  function initReadingSection(containerId = 'reading-container', config = {}) {
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.warn(`Reading section container with ID "${containerId}" not found.`);
      return;
    }

    // Merge default config with provided config
    const mergedConfig = {
      ...defaultConfig,
      ...config
    };
    
    // Generate and inject HTML
    container.innerHTML = generateReadingHTML(mergedConfig);
  }

  // ============================================
  // Auto-initialize or Export
  // ============================================
  
  // Note: Auto-initialization is disabled to allow manual initialization with custom config
  // Components should be manually initialized via window.ReadingSection.init()

  // Export for manual initialization if needed
  window.ReadingSection = {
    init: initReadingSection,
    generateHTML: generateReadingHTML
  };

})();
