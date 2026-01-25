/**
 * Project Card Component
 * Reusable component for displaying individual project cards
 * 
 * Usage:
 *   This component is used by the side-quests-section component.
 *   It can also be used standalone by calling ProjectCard.generateHTML(projectData)
 */

(function() {
  'use strict';

  // ============================================
  // Helper Functions
  // ============================================
  
  // Use shared Utils.escapeHTML (requires utils.js to be loaded first)
  const escapeHTML = Utils.escapeHTML;

  // ============================================
  // Core Functionality
  // ============================================
  
  /**
   * Generate project card HTML structure
   * @param {Object} project - Project data object
   * @param {string} project.title - Project title
   * @param {string} project.description - Project description
   * @param {string} project.url - Project URL
   * @param {string} project.imagePath - Path to project image
   * @param {string} project.imageAlt - Alt text for project image
   * @returns {string} HTML string for project card
   */
  function generateProjectCardHTML(project) {
    // Validate required fields - return empty string immediately if missing
    if (!project || typeof project !== 'object' || !project.title || !project.url) {
      console.warn('Project card requires at least title and url');
      return '';
    }

    const title = escapeHTML(project.title);
    const description = escapeHTML(project.description || '');
    const url = escapeHTML(project.url);
    const imagePath = project.imagePath ? escapeHTML(project.imagePath) : '';
    const imageAlt = escapeHTML(project.imageAlt || project.title);

    return `
      <a href="${url}" 
         target="_blank" 
         rel="noopener noreferrer" 
         class="project-card"
         aria-label="View ${title} project">
        ${imagePath ? `
        <div class="project-image">
          <img src="${imagePath}" 
               alt="${imageAlt}" 
               loading="lazy" />
        </div>
        ` : ''}
        <div class="project-content">
          <h3 class="project-title">${title}</h3>
          ${description ? `<p class="project-description">${description}</p>` : ''}
        </div>
      </a>
    `;
  }

  // ============================================
  // Export
  // ============================================
  
  // Export for use by other components
  window.ProjectCard = {
    generateHTML: generateProjectCardHTML
  };

})();
