/**
 * Testimonials Section Component
 * Reusable section component for displaying testimonials
 * 
 * Usage:
 *   <div id="testimonials-container"></div>
 *   <script src="assets/js/components/testimonials-section.js"></script>
 */

(function() {
  'use strict';

  if (typeof window.Utils === 'undefined' || typeof window.Utils.escapeHTML !== 'function') {
    throw new Error('TestimonialsSection requires utils.js (Utils.escapeHTML). Load utils.js before this script.');
  }

  const escapeHTML = Utils.escapeHTML;
  const sanitizeUrl = Utils.sanitizeUrl;

  // ============================================
  // Configuration
  // ============================================
  const defaultConfig = {
    heading: 'What People Say',
    subheading: '',
    testimonials: []
  };

  // ============================================
  // Helper Functions
  // ============================================
  
  // ============================================
  // Core Functionality
  // ============================================
  
  /**
   * Generate testimonial card HTML
   * @param {Object} testimonial - Testimonial object
   * @param {string} testimonial.name - Person's name
   * @param {string} testimonial.role - Person's role/title
   * @param {string} testimonial.company - Company name (optional)
   * @param {string} testimonial.text - Testimonial text
   * @param {string} testimonial.photo - Photo URL (optional)
   * @returns {string} HTML string for testimonial card
   */
  function generateTestimonialCardHTML(testimonial) {
    const name = escapeHTML(testimonial.name || '');
    const role = escapeHTML(testimonial.role || '');
    const company = escapeHTML(testimonial.company || '');
    const text = escapeHTML(testimonial.text || '');
    const photo = testimonial.photo ? escapeHTML(sanitizeUrl(testimonial.photo)) : '';

    // Build role/company string
    let roleCompany = role;
    if (company && role) {
      roleCompany = `${role} @ ${company}`;
    } else if (company) {
      roleCompany = company;
    }

    return `
      <div class="testimonial-card">
        <blockquote class="testimonial-text">
          <p>${text}</p>
        </blockquote>
        <div class="testimonial-author">
          ${photo ? `<img src="${photo}" alt="${name}" class="testimonial-photo" />` : ''}
          <div class="testimonial-author-info">
            <div class="testimonial-name">${name}</div>
            ${roleCompany ? `<div class="testimonial-role">${roleCompany}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate testimonials section HTML structure
   * @param {Object} config - Configuration object
   * @param {string} config.heading - Section heading text
   * @param {string} config.subheading - Section subheading text (optional)
   * @param {Array} config.testimonials - Array of testimonial objects
   * @returns {string} HTML string for testimonials section
   */
  function generateTestimonialsHTML(config) {
    const heading = config.heading || defaultConfig.heading;
    const subheading = config.subheading || defaultConfig.subheading;
    const testimonials = config.testimonials || [];

    if (testimonials.length === 0) {
      return '';
    }

    // Generate testimonial cards HTML
    const testimonialsHTML = testimonials.map(testimonial => {
      return generateTestimonialCardHTML(testimonial);
    }).join('');

    const subheadingHTML = subheading ? `<p class="section-subheading">${escapeHTML(subheading)}</p>` : '';

    return `
      <section class="testimonials-section" aria-label="Testimonials">
        <h2 class="section-heading">${escapeHTML(heading)}</h2>
        ${subheadingHTML}
        <div class="testimonials-grid">
          ${testimonialsHTML}
        </div>
      </section>
    `;
  }

  // ============================================
  // Initialization
  // ============================================
  
  /**
   * Initialize the testimonials section component
   * @param {string} containerId - ID of the container element (default: 'testimonials-container')
   * @param {Object} config - Configuration object (optional)
   */
  function initTestimonialsSection(containerId = 'testimonials-container', config = {}) {
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.warn(`Testimonials section container with ID "${containerId}" not found.`);
      return;
    }

    // Merge default config with provided config
    const mergedConfig = {
      ...defaultConfig,
      ...config
    };
    
    // Generate and inject HTML
    container.innerHTML = generateTestimonialsHTML(mergedConfig);
  }

  // ============================================
  // Auto-initialize or Export
  // ============================================
  
  // Export for manual initialization
  window.TestimonialsSection = {
    init: initTestimonialsSection,
    generateHTML: generateTestimonialsHTML
  };

})();
