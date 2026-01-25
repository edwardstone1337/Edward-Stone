/**
 * Button Component
 * Reusable button component with primary, secondary, and tertiary variants
 * Supports icons, loading states, and disabled states
 * 
 * Usage:
 *   // Programmatic
 *   Button.create({ text: 'Click Me', variant: 'primary' }, 'container-id');
 * 
 *   // Declarative
 *   <div data-button='{"text":"Click Me","variant":"primary"}'></div>
 *   Button.init();
 * 
 *   // Backward compatible (CSS classes still work)
 *   <a href="#" class="btn btn-primary">Existing Button</a>
 */

(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const buttonConfig = {
    defaultVariant: 'primary',
    defaultElement: 'button' // 'button' or 'a'
  };

  // ============================================
  // Helper Functions
  // ============================================

  // Use shared Utils.escapeHTML (requires utils.js to be loaded first)
  const escapeHTML = Utils.escapeHTML;

  /**
   * Get CSS classes for button based on configuration
   * @param {Object} config - Button configuration
   * @returns {string} CSS class string
   */
  function getButtonClasses(config) {
    const classes = ['btn'];
    
    // Add variant class
    const variant = config.variant || buttonConfig.defaultVariant;
    classes.push(`btn-${variant}`);
    
    // Add state classes
    if (config.loading) {
      classes.push('is-loading');
    }
    if (config.disabled) {
      classes.push('is-disabled');
    }
    if (config.icon) {
      classes.push('btn-has-icon');
    }
    
    return classes.join(' ');
  }

  /**
   * Get HTML attributes string for button
   * @param {Object} config - Button configuration
   * @param {string} elementType - 'button' or 'a'
   * @returns {string} HTML attributes string
   */
  function getButtonAttributes(config, elementType) {
    const attrs = [];
    
    // Disabled state
    if (config.disabled || config.loading) {
      if (elementType === 'button') {
        attrs.push('disabled');
      }
      attrs.push('aria-disabled="true"');
    }
    
    // Loading state
    if (config.loading) {
      attrs.push('aria-busy="true"');
    }
    
    // Link attributes
    if (elementType === 'a') {
      if (config.href) {
        attrs.push(`href="${config.href}"`);
      } else {
        attrs.push('href="#"');
      }
      
      if (config.target) {
        attrs.push(`target="${config.target}"`);
      }
      
      if (config.download !== undefined) {
        attrs.push('download');
      }
      
      if (config.rel) {
        attrs.push(`rel="${config.rel}"`);
      }
    }
    
    // Button type
    if (elementType === 'button') {
      const type = config.type || 'button';
      attrs.push(`type="${type}"`);
    }
    
    // ARIA label for icon-only buttons
    if (config.icon && !config.text && config.ariaLabel) {
      attrs.push(`aria-label="${escapeHTML(config.ariaLabel)}"`);
    }
    
    // Custom classes (class names should not contain HTML, but escape for safety)
    if (config.className) {
      attrs.push(`class="${escapeHTML(config.className)}"`);
    }
    
    // Custom data attributes
    if (config.dataAttributes) {
      Object.keys(config.dataAttributes).forEach(key => {
        attrs.push(`data-${key}="${config.dataAttributes[key]}"`);
      });
    }
    
    return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  }

  /**
   * Generate icon HTML if provided
   * @param {Object} config - Button configuration
   * @returns {string} Icon HTML or empty string
   */
  function generateIconHTML(config) {
    if (!config.icon) return '';
    
    // Removed support for config.icon.html to prevent XSS vulnerability
    // Icons must be provided as string class names only
    const iconClass = typeof config.icon === 'string' ? config.icon : config.icon.class || '';
    const iconPosition = config.iconPosition || 'left';
    
    // Escape icon class for safety
    return `<span class="btn-icon btn-icon-${escapeHTML(iconPosition)}" aria-hidden="true">${escapeHTML(iconClass)}</span>`;
  }

  /**
   * Generate loading spinner HTML
   * @returns {string} Loading spinner HTML
   */
  function generateLoadingHTML() {
    return '<span class="btn-spinner" aria-hidden="true"></span>';
  }

  /**
   * Generate button HTML structure
   * @param {Object} config - Button configuration
   * @returns {string} Button HTML string
   */
  function generateButtonHTML(config) {
    // Determine element type
    const elementType = config.href ? 'a' : (config.element || buttonConfig.defaultElement);
    
    // Get classes and attributes
    const classes = getButtonClasses(config);
    const attributes = getButtonAttributes(config, elementType);
    
    // Generate icon HTML
    const iconHTML = generateIconHTML(config);
    const iconPosition = config.iconPosition || 'left';
    
    // Generate loading spinner
    const loadingHTML = config.loading ? generateLoadingHTML() : '';
    
    // Build content (icon + text + loading)
    let content = '';
    
    if (iconPosition === 'left') {
      content = iconHTML + escapeHTML(config.text || '') + loadingHTML;
    } else {
      content = escapeHTML(config.text || '') + iconHTML + loadingHTML;
    }
    
    // Generate button element
    return `<${elementType} class="${classes}"${attributes}>${content}</${elementType}>`;
  }

  // ============================================
  // Core Functionality
  // ============================================

  /**
   * Create a single button and append to container
   * @param {Object} config - Button configuration
   * @param {string|HTMLElement} container - Container ID or element
   * @returns {HTMLElement} Created button element
   */
  function createButton(config, container) {
    // Validate config
    if (!config || (typeof config !== 'object')) {
      console.warn('Button component: config object is required');
      return null;
    }
    
    if (!config.text && !config.icon) {
      console.warn('Button component: config.text or config.icon is required');
      return null;
    }
    
    // Get container element
    let containerEl;
    if (typeof container === 'string') {
      containerEl = document.getElementById(container);
      if (!containerEl) {
        console.warn(`Button component: Container with ID "${container}" not found.`);
        return null;
      }
    } else if (container instanceof HTMLElement) {
      containerEl = container;
    } else {
      console.warn('Button component: Invalid container provided.');
      return null;
    }
    
    // Generate and insert HTML
    const buttonHTML = generateButtonHTML(config);
    containerEl.insertAdjacentHTML('beforeend', buttonHTML);
    
    // Get the created button element
    const buttonEl = containerEl.lastElementChild;
    
    // Attach click handler if provided
    if (config.onClick && typeof config.onClick === 'function') {
      buttonEl.addEventListener('click', function(e) {
        if (!config.disabled && !config.loading) {
          config.onClick(e);
        } else {
          e.preventDefault();
        }
      });
    }
    
    return buttonEl;
  }

  /**
   * Initialize buttons from data attributes
   */
  function initButtons() {
    const buttonContainers = document.querySelectorAll('[data-button]');
    
    buttonContainers.forEach(container => {
      try {
        const configJSON = container.getAttribute('data-button');
        const config = JSON.parse(configJSON);
        
        // Create button in this container
        createButton(config, container);
      } catch (error) {
        console.warn('Button component: Invalid data-button attribute:', error);
      }
    });
  }

  // ============================================
  // Initialization
  // ============================================

  /**
   * Initialize button component
   * Auto-initializes buttons with data-button attributes
   */
  function initButtonComponent() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initButtons);
    } else {
      initButtons();
    }
  }

  // ============================================
  // Auto-initialize or Export
  // ============================================

  // Auto-initialize on page load
  initButtonComponent();

  // Export for manual initialization and creation
  window.Button = {
    /**
     * Create a button programmatically
     * @param {Object} config - Button configuration
     * @param {string|HTMLElement} container - Container ID or element
     * @returns {HTMLElement} Created button element
     */
    create: createButton,
    
    /**
     * Initialize buttons from data attributes
     */
    init: initButtons,
    
    /**
     * Generate button HTML (for advanced usage)
     * @param {Object} config - Button configuration
     * @returns {string} Button HTML string
     */
    generateHTML: generateButtonHTML
  };

})();
