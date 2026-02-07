/**
 * Project Card — Dev Projects Page
 *
 * Generates a glass-style project card with:
 * - Project image with bottom fade
 * - Title and description
 * - External link wrapper
 * - Gradient border glow on hover (CSS-driven)
 */

import { sanitizeUrl, escapeHTML } from './utils.js';

function generateCard(project) {
  var title = escapeHTML(project.title);
  var description = escapeHTML(project.description);
  var url = escapeHTML(sanitizeUrl(project.url) || '#');
  var rawImagePath = sanitizeUrl(project.imagePath || '');
  var imagePath = (rawImagePath && rawImagePath !== '#') ? escapeHTML(rawImagePath) : '';
  var imageAlt = escapeHTML(project.imageAlt || project.title || '');

  var preview = project.preview;
  var previewSrc = preview && preview.src ? escapeHTML(sanitizeUrl(preview.src)) : '';

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

  export { generateCard };
