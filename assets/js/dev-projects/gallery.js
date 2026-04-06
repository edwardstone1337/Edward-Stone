/**
 * Gallery grid — loads images from assets/data/gallery.json
 * Image src paths are relative to assets/images/ and can reference
 * any subfolder (e.g. gallery/, ticker/). Images are shuffled on
 * each page load. See gallery.json to add or remove entries.
 */

import { escapeHTML, sanitizeUrl } from './utils.js';

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
        var src = escapeHTML(sanitizeUrl(img.src || '') || '');
        var alt = escapeHTML(img.alt || '');
        var w = parseInt(img.width, 10) || 800;
        var h = parseInt(img.height, 10) || 600;
        var aspect = w + '/' + h;
        var loadingAttr = index < 8 ? 'eager' : 'lazy';

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
            '<div class="dp-gallery-skeleton" style="--aspect: ' + aspect + '">' +
              '<img' +
                ' src="' + src + '"' +
                ' alt="' + alt + '"' +
                ' width="' + w + '"' +
                ' height="' + h + '"' +
                ' loading="' + loadingAttr + '"' +
                ' decoding="async"' +
                ' class="dp-gallery-img"' +
              ' />' +
            '</div>' +
          '</div>'
        );
      }).join('');

      grid.innerHTML = html;
      grid.dispatchEvent(new CustomEvent('gallery:rendered', { bubbles: true }));

      // Attach load and error handlers to each image
      var imgs = grid.querySelectorAll('.dp-gallery-img');
      for (var i = 0; i < imgs.length; i++) {
        (function (img) {
          // Already loaded from cache
          if (img.complete && img.naturalWidth > 0) {
            img.classList.add('dp-gallery-img--loaded');
          } else {
            img.addEventListener('load', function () {
              img.classList.add('dp-gallery-img--loaded');
            }, { once: true });
          }
          img.onerror = function () {
            img.onerror = null; // prevent infinite loop
            img.classList.add('dp-gallery-img--error');
            img.classList.add('dp-gallery-img--loaded'); // collapse skeleton on error too
          };
        })(imgs[i]);
      }

      // Reveal section-level dp-reveal elements (hero, header, etc.) after paint
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (typeof window.DPEffectsObserveReveals === 'function') {
            window.DPEffectsObserveReveals();
          }
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
