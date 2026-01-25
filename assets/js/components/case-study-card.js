/**
 * Case Study Card Component
 * Reusable card component for displaying case study previews
 * 
 * Usage:
 *   <div id="case-studies-container"></div>
 *   <script src="assets/js/components/case-study-card.js"></script>
 */

(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const defaultConfig = {
    heading: 'Featured Case Studies',
    subheading: 'A selection of projects showcasing my approach to design and problem-solving.',
    caseStudies: []
  };

  // ============================================
  // Helper Functions
  // ============================================
  
  // Use shared Utils.escapeHTML (requires utils.js to be loaded first)
  const escapeHTML = Utils.escapeHTML;

  // ============================================
  // Core Functionality
  // ============================================
  
  /**
   * Generate case study card HTML
   * @param {Object} caseStudy - Case study object
   * @param {string} caseStudy.title - Case study title
   * @param {string} caseStudy.description - Brief description
   * @param {string} caseStudy.imagePath - Preview image path
   * @param {string} caseStudy.href - Link to full case study
   * @param {string} caseStudy.metrics - Optional metrics (e.g., "40% increase")
   * @returns {string} HTML string for case study card
   */
  function generateCaseStudyCardHTML(caseStudy) {
    if (!caseStudy || !caseStudy.title || !caseStudy.href) {
      return '';
    }
    
    const title = escapeHTML(caseStudy.title || '');
    const description = escapeHTML(caseStudy.description || '');
    const imagePath = caseStudy.imagePath || '';
    const href = escapeHTML(caseStudy.href || '#');
    const metrics = escapeHTML(caseStudy.metrics || '');
    const imageAlt = escapeHTML(caseStudy.imageAlt || title);

    return `
      <a href="${href}" class="case-study-card">
        ${imagePath ? `
          <div class="case-study-image">
            <img src="${escapeHTML(imagePath)}" alt="${imageAlt}" />
          </div>
        ` : ''}
        <div class="case-study-content">
          <h3 class="case-study-title">${title}</h3>
          ${description ? `<p class="case-study-description">${description}</p>` : ''}
          ${metrics ? `<span class="case-study-metrics">${metrics}</span>` : ''}
          <span class="case-study-cta">Read Case Study</span>
        </div>
      </a>
    `;
  }

  /**
   * Generate case studies section HTML structure
   * @param {Object} config - Configuration object
   * @param {string} config.heading - Section heading text
   * @param {string} config.subheading - Section subheading text
   * @param {Array} config.caseStudies - Array of case study objects
   * @returns {string} HTML string for case studies section
   */
  function generateCaseStudiesHTML(config) {
    const heading = config.heading || defaultConfig.heading;
    const subheading = config.subheading || defaultConfig.subheading;
    const caseStudies = config.caseStudies || [];

    if (caseStudies.length === 0) {
      return '';
    }

    // Generate case study cards HTML
    const caseStudiesHTML = caseStudies.map(caseStudy => {
      return generateCaseStudyCardHTML(caseStudy);
    }).join('');

    return `
      <section class="case-studies-section" aria-label="Featured Case Studies">
        <h2 class="section-heading">${escapeHTML(heading)}</h2>
        ${subheading ? `<p class="section-subheading">${escapeHTML(subheading)}</p>` : ''}
        <div class="case-studies-grid">
          ${caseStudiesHTML}
        </div>
      </section>
    `;
  }

  // ============================================
  // Initialization
  // ============================================
  
  /**
   * Initialize the case studies section component
   * @param {string} containerId - ID of the container element (default: 'case-studies-container')
   * @param {Object} config - Configuration object (optional)
   */
  function initCaseStudiesSection(containerId = 'case-studies-container', config = {}) {
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.warn(`Case studies section container with ID "${containerId}" not found.`);
      return;
    }

    // Merge default config with provided config
    const mergedConfig = {
      ...defaultConfig,
      ...config
    };
    
    // Generate and inject HTML
    container.innerHTML = generateCaseStudiesHTML(mergedConfig);
  }

  // ============================================
  // Auto-initialize or Export
  // ============================================
  
  // Export for manual initialization
  window.CaseStudiesSection = {
    init: initCaseStudiesSection,
    generateHTML: generateCaseStudiesHTML,
    generateCardHTML: generateCaseStudyCardHTML
  };

})();
