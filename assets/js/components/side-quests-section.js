/**
 * Side Quests Section Component
 * Reusable section component for displaying development side quests
 * 
 * Usage:
 *   <div id="side-quests-container"></div>
 *   <script src="assets/js/components/project-card.js"></script>
 *   <script src="assets/js/components/side-quests-section.js"></script>
 */

(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const defaultConfig = {
    heading: 'Development Side Quests',
    subheading: 'What good is designing something if you can\'t build it? Here are some simple web apps I\'ve made to learn, experiment, and explore.',
    projects: []
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
   * Generate side quests section HTML structure
   * @param {Object} config - Configuration object
   * @param {string} config.heading - Section heading text
   * @param {string} config.subheading - Section subheading text
   * @param {Array} config.projects - Array of project objects
   * @returns {string} HTML string for side quests section
   */
  function generateSideQuestsHTML(config) {
    const heading = escapeHTML(config.heading || defaultConfig.heading);
    const subheading = escapeHTML(config.subheading || defaultConfig.subheading);
    const projects = config.projects || [];

    // Generate project cards HTML
    let projectsHTML = '';
    if (window.ProjectCard && typeof window.ProjectCard.generateHTML === 'function') {
      projectsHTML = projects.map(project => {
        return window.ProjectCard.generateHTML(project);
      }).join('');
    } else {
      console.warn('ProjectCard component not found. Make sure project-card.js is loaded before side-quests-section.js');
    }

    return `
      <section class="dev-quests">
        <h2 class="section-heading">${heading}</h2>
        ${subheading ? `<p class="section-subheading">${subheading}</p>` : ''}
        <div class="projects-grid">
          ${projectsHTML}
        </div>
      </section>
    `;
  }

  // ============================================
  // Initialization
  // ============================================
  
  /**
   * Initialize the side quests section component
   * @param {string} containerId - ID of the container element (default: 'side-quests-container')
   * @param {Object} config - Configuration object (optional)
   */
  function initSideQuestsSection(containerId = 'side-quests-container', config = {}) {
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.warn(`Side quests section container with ID "${containerId}" not found.`);
      return;
    }

    // Merge default config with provided config
    const mergedConfig = {
      ...defaultConfig,
      ...config
    };
    
    // Generate and inject HTML
    container.innerHTML = generateSideQuestsHTML(mergedConfig);
  }

  // ============================================
  // Auto-initialize or Export
  // ============================================
  
  // Note: Auto-initialization is disabled to allow manual initialization with custom config
  // Components should be manually initialized via window.SideQuestsSection.init()

  // Export for manual initialization if needed
  window.SideQuestsSection = {
    init: initSideQuestsSection,
    generateHTML: generateSideQuestsHTML
  };

})();
