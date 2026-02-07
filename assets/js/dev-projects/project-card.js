/**
 * Project Card — Dev Projects Page
 *
 * Generates a glass-style project card with:
 * - Project image with bottom fade
 * - Title and description
 * - External link wrapper
 * - Gradient border glow on hover (CSS-driven)
 */
(function () {
  'use strict';

  if (typeof window.Utils === 'undefined' || typeof window.Utils.sanitizeUrl !== 'function') {
    throw new Error('project-card.js requires utils.js (Utils.sanitizeUrl). Load utils.js before this script.');
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str || ''));
    return div.innerHTML;
  }

  function generateCard(project) {
    var title = escapeHTML(project.title);
    var description = escapeHTML(project.description);
    var url = escapeHTML(Utils.sanitizeUrl(project.url) || '#');
    var imagePath = escapeHTML(project.imagePath || '');
    var imageAlt = escapeHTML(project.imageAlt || project.title || '');

    var preview = project.preview;
    var previewSrc = preview && preview.src ? escapeHTML(Utils.sanitizeUrl(preview.src)) : '';

    var mediaBlock;
    if (previewSrc) {
      mediaBlock =
        '<div class="dp-card-media">' +
          '<iframe class="dp-card-media-iframe" src="' + previewSrc + '" loading="lazy" tabindex="-1" aria-hidden="true" title="' + title + ' preview"></iframe>' +
        '</div>';
    } else if (imagePath) {
      mediaBlock =
        '<div class="dp-card-media">' +
          '<img src="' + imagePath + '" alt="' + imageAlt + '" loading="lazy" />' +
          '<div class="dp-card-media-fade"></div>' +
        '</div>';
    } else {
      mediaBlock =
        '<div class="dp-card-media">' +
          '<div class="dp-card-media-placeholder"></div>' +
        '</div>';
    }

    return (
      '<a href="' + url + '" class="dp-card" target="_blank" rel="noopener noreferrer">' +
        '<div class="dp-card-inner">' +
          mediaBlock +
          '<div class="dp-card-content">' +
            '<h3 class="dp-card-title">' + title + '</h3>' +
            '<p class="dp-card-description">' + description + '</p>' +
          '</div>' +
        '</div>' +
      '</a>'
    );
  }

  window.DPProjectCard = {
    generate: generateCard
  };
})();
