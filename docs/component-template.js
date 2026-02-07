/**
 * Component Name
 * Brief description of what this component does
 * 
 * Usage:
 *   <div id="component-container"></div>
 *   <script src="component-name.js"></script>
 */

(function() {
  'use strict';

  if (typeof window.Utils === 'undefined' || typeof window.Utils.escapeHTML !== 'function') {
    throw new Error('Component requires utils.js (Utils.escapeHTML). Load utils.js before this script.');
  }

  const escapeHTML = Utils.escapeHTML;

  // ============================================
  // Configuration
  // ============================================
  const componentConfig = {
    // Add component-specific configuration here
    // Example: items, options, default values, etc.
  };

  // ============================================
  // Helper Functions
  // ============================================
  
  /**
   * Helper function example
   * @param {type} param - Description
   * @returns {type} Description
   */
  function helperFunction(param) {
    // Implementation
  }

  // ============================================
  // Core Functionality
  // ============================================
  
  /**
   * Generate component HTML structure
   * @returns {string} HTML string
   */
  function generateComponentHTML() {
    // Generate and return HTML structure
    // Use template literals for clean code
    // IMPORTANT: Always use escapeHTML() for any user-provided or config data
    // Example: ${escapeHTML(config.title)}
    return `
      <div class="component-wrapper">
        <!-- Component HTML here -->
        <!-- Always escape: ${escapeHTML(componentConfig.example || '')} -->
      </div>
    `;
  }

  /**
   * Initialize component functionality
   * Sets up event listeners, interactions, etc.
   */
  function initComponentFunctionality() {
    const component = document.querySelector('.component-wrapper');
    
    if (!component) return;
    
    // Add event listeners
    // Example:
    // component.addEventListener('click', handleClick);
    
    // Initialize any sub-components or features
  }

  // ============================================
  // Initialization
  // ============================================
  
  /**
   * Initialize the component
   * @param {string} containerId - ID of the container element (default: 'component-container')
   */
  function initComponent(containerId = 'component-container') {
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.warn(`Component container with ID "${containerId}" not found.`);
      return;
    }
    
    // Generate and inject HTML
    container.innerHTML = generateComponentHTML();
    
    // Initialize functionality after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initComponentFunctionality);
    } else {
      initComponentFunctionality();
    }
  }

  // ============================================
  // Auto-initialize or Export
  // ============================================
  
  // Auto-initialize if container exists
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (document.getElementById('component-container')) {
        initComponent();
      }
    });
  } else {
    if (document.getElementById('component-container')) {
      initComponent();
    }
  }

  // Export for manual initialization if needed
  window.ComponentName = {
    init: initComponent,
    // Add other public methods if needed
  };

})();
