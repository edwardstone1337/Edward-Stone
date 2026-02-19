/**
 * Gallery Grid — Gallery Page
 *
 * Fetches image data from gallery.json and renders a masonry grid.
 * Grid fades in as a single unit after render (dp-gallery-grid--visible).
 * Sanitises all dynamic content via utils.js.
 */

import { escapeHTML } from './utils.js';

var DATA_PATH = 'assets/data/gallery.json';

function renderGallery() {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;

  var controller = new AbortController();

  fetch(DATA_PATH, { signal: controller.signal })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      if (!grid.isConnected) return;

      var images = data.images || [];

      // Fisher-Yates shuffle — randomise order on each page load
      for (var fi = images.length - 1; fi > 0; fi--) {
        var ri = Math.floor(Math.random() * (fi + 1));
        var tmp = images[fi];
        images[fi] = images[ri];
        images[ri] = tmp;
      }

      if (images.length === 0) {
        grid.innerHTML = '<p class="dp-gallery-noscript">No images yet.</p>';
        return;
      }

      var html = images.map(function (img, index) {
        var src = escapeHTML(img.src || '');
        var alt = escapeHTML(img.alt || '');
        var w = parseInt(img.width, 10) || 800;
        var h = parseInt(img.height, 10) || 600;
        var aspect = w + '/' + h;

        // Build optional data-categories attribute
        var catAttr = '';
        if (Array.isArray(img.categories) && img.categories.length > 0) {
          var safeCats = img.categories.map(function (c) { return escapeHTML(c); });
          catAttr = ' data-categories=\'' + escapeHTML(JSON.stringify(safeCats)) + '\'';
        }

        return (
          '<div class="dp-gallery-item" role="listitem"' +
            catAttr +
            ' data-alt="' + alt + '"' +
            ' style="--aspect: ' + aspect + '">' +
            '<img' +
              ' src="' + src + '"' +
              ' alt="' + alt + '"' +
              ' width="' + w + '"' +
              ' height="' + h + '"' +
              ' loading="lazy"' +
              ' decoding="async"' +
              ' class="dp-gallery-img"' +
            ' />' +
          '</div>'
        );
      }).join('');

      grid.innerHTML = html;

      // Attach error handlers for broken images (expected for placeholders)
      var imgs = grid.querySelectorAll('.dp-gallery-img');
      for (var i = 0; i < imgs.length; i++) {
        imgs[i].onerror = function () {
          this.onerror = null; // prevent infinite loop
          this.classList.add('dp-gallery-img--error');
        };
      }

      // Fade in the whole grid after paint
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          grid.classList.add('dp-gallery-grid--visible');
        });
      });
    })
    .catch(function (err) {
      if (err.name === 'AbortError') return;
      console.error('Failed to load gallery:', err);
      if (!grid.isConnected) return;
      grid.innerHTML = '<p class="dp-gallery-noscript">Failed to load gallery.</p>';
    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderGallery);
} else {
  renderGallery();
}
