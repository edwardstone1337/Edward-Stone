/**
 * Skills Section Component
 * Reusable section component for displaying skills, tools, and frameworks
 * 
 * Usage:
 *   <div id="skills-container"></div>
 *   <script src="assets/js/components/skills-section.js"></script>
 */

(function() {
  'use strict';

  if (typeof window.Utils === 'undefined' || typeof window.Utils.escapeHTML !== 'function') {
    throw new Error('SkillsSection requires utils.js (Utils.escapeHTML). Load utils.js before this script.');
  }

  const escapeHTML = Utils.escapeHTML;

  // ============================================
  // Configuration
  // ============================================
  const defaultConfig = {
    heading: 'Skills & Expertise',
    tools: [],
    principles: [],
    personality: []
  };

  // ============================================
  // Helper Functions
  // ============================================
  
  // ============================================
  // Core Functionality
  // ============================================
  
  /**
   * Generate skills section HTML structure
   * @param {Object} config - Configuration object
   * @param {string} config.heading - Section heading text
   * @param {Array} config.tools - Array of tool/technology strings
   * @param {Array} config.principles - Array of principle/guiding statement strings
   * @param {Array} config.personality - Array of personality trait strings
   * @returns {string} HTML string for skills section
   */
  function generateSkillsHTML(config) {
    const heading = escapeHTML(config.heading || defaultConfig.heading);
    const tools = config.tools || [];
    const principles = config.principles || [];
    const personality = config.personality || [];

    // Generate tools list HTML
    const toolsHTML = tools.length > 0 ? tools.map(tool => {
      return `<li class="skill-item">${escapeHTML(tool)}</li>`;
    }).join('') : '';

    // Generate principles list HTML
    const principlesHTML = principles.length > 0 ? principles.map(principle => {
      return `<li class="skill-item">${escapeHTML(principle)}</li>`;
    }).join('') : '';

    // Generate personality list HTML
    const personalityHTML = personality.length > 0 ? personality.map(trait => {
      return `<li class="skill-item">${escapeHTML(trait)}</li>`;
    }).join('') : '';

    return `
      <section class="skills-section" aria-label="Skills and Expertise">
        <h2 class="section-heading">${heading}</h2>
        <div class="skills-content">
          ${tools.length > 0 ? `
            <div class="skills-category">
              <h3 class="skills-category-heading">Tools & Technologies</h3>
              <ul class="skills-list">
                ${toolsHTML}
              </ul>
            </div>
          ` : ''}
          ${principles.length > 0 ? `
            <div class="skills-category">
              <h3 class="skills-category-heading">Guiding Principles</h3>
              <ul class="skills-list">
                ${principlesHTML}
              </ul>
            </div>
          ` : ''}
          ${personality.length > 0 ? `
            <div class="skills-category">
              <h3 class="skills-category-heading">A Bit About Me</h3>
              <ul class="skills-list">
                ${personalityHTML}
              </ul>
            </div>
          ` : ''}
        </div>
      </section>
    `;
  }

  // ============================================
  // Initialization
  // ============================================
  
  /**
   * Initialize the skills section component
   * @param {string} containerId - ID of the container element (default: 'skills-container')
   * @param {Object} config - Configuration object (optional)
   */
  function initSkillsSection(containerId = 'skills-container', config = {}) {
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.warn(`Skills section container with ID "${containerId}" not found.`);
      return;
    }

    // Merge default config with provided config
    const mergedConfig = {
      ...defaultConfig,
      ...config
    };
    
    // Generate and inject HTML
    container.innerHTML = generateSkillsHTML(mergedConfig);
  }

  // ============================================
  // Auto-initialize or Export
  // ============================================
  
  // Export for manual initialization
  window.SkillsSection = {
    init: initSkillsSection,
    generateHTML: generateSkillsHTML
  };

})();
