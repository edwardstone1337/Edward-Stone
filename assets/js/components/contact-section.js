/**
 * Contact Section Component
 * Reusable section component for displaying contact information
 * 
 * Usage:
 *   <div id="contact-container"></div>
 *   <script src="assets/js/components/contact-section.js"></script>
 */

(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const defaultConfig = {
    heading: 'Let\'s Work Together',
    subheading: 'I\'m always open to discussing new opportunities and interesting projects.',
    email: '',
    phone: '',
    linkedInUrl: '',
    location: '',
    availability: ''
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
   * Generate contact section HTML structure
   * @param {Object} config - Configuration object
   * @param {string} config.heading - Section heading text
   * @param {string} config.subheading - Section subheading text
   * @param {string} config.email - Email address
   * @param {string} config.phone - Phone number
   * @param {string} config.linkedInUrl - LinkedIn profile URL
   * @param {string} config.location - Location (e.g., "Leichardt, Sydney, NSW")
   * @param {string} config.availability - Availability status (optional)
   * @returns {string} HTML string for contact section
   */
  function generateContactHTML(config) {
    const heading = escapeHTML(config.heading || defaultConfig.heading);
    const subheading = escapeHTML(config.subheading || defaultConfig.subheading);
    const email = config.email || '';
    const phone = config.phone || '';
    const linkedInUrl = config.linkedInUrl || '';
    const location = escapeHTML(config.location || '');
    const availability = escapeHTML(config.availability || '');

    // Build contact methods HTML
    let contactMethodsHTML = '';

    if (email) {
      // Escape email for both href and display
      const escapedEmail = escapeHTML(email);
      contactMethodsHTML += `
        <a href="mailto:${escapedEmail}" class="contact-method">
          <span class="contact-label">Email</span>
          <span class="contact-value">${escapedEmail}</span>
        </a>
      `;
    }

    if (phone) {
      // Escape phone for display, use cleaned version for tel: link
      const escapedPhone = escapeHTML(phone);
      const cleanPhone = phone.replace(/\s/g, '');
      contactMethodsHTML += `
        <a href="tel:${escapeHTML(cleanPhone)}" class="contact-method">
          <span class="contact-label">Phone</span>
          <span class="contact-value">${escapedPhone}</span>
        </a>
      `;
    }

    if (linkedInUrl) {
      // Escape LinkedIn URL for href attribute
      const escapedLinkedInUrl = escapeHTML(linkedInUrl);
      contactMethodsHTML += `
        <a href="${escapedLinkedInUrl}" class="contact-method" target="_blank" rel="noopener noreferrer">
          <span class="contact-label">LinkedIn</span>
          <span class="contact-value">Connect with me</span>
        </a>
      `;
    }

    return `
      <section class="contact-section" aria-label="Contact Information">
        <h2 class="section-heading">${heading}</h2>
        ${subheading ? `<p class="section-subheading">${subheading}</p>` : ''}
        ${availability ? `<p class="contact-availability">${availability}</p>` : ''}
        <div class="contact-methods">
          ${contactMethodsHTML}
        </div>
        ${location ? `<p class="contact-location">📍 ${location}</p>` : ''}
      </section>
    `;
  }

  // ============================================
  // Initialization
  // ============================================
  
  /**
   * Initialize the contact section component
   * @param {string} containerId - ID of the container element (default: 'contact-container')
   * @param {Object} config - Configuration object (optional)
   */
  function initContactSection(containerId = 'contact-container', config = {}) {
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.warn(`Contact section container with ID "${containerId}" not found.`);
      return;
    }

    // Merge default config with provided config
    const mergedConfig = {
      ...defaultConfig,
      ...config
    };
    
    // Generate and inject HTML
    container.innerHTML = generateContactHTML(mergedConfig);
  }

  // ============================================
  // Auto-initialize or Export
  // ============================================
  
  // Export for manual initialization
  window.ContactSection = {
    init: initContactSection,
    generateHTML: generateContactHTML
  };

})();
