/**
 * Projects Grid — Dev Projects Page
 *
 * Fetches projects from JSON and renders cards into a grid.
 * Depends on: DPProjectCard (project-card.js must load first)
 */
(function () {
  'use strict';

  var DATA_PATH = 'assets/data/projects.json';

  function renderGrid(containerId) {
    var container = document.getElementById(containerId);
    if (!container) {
      console.error('Projects grid container not found:', containerId);
      return;
    }

    var controller = new AbortController();
    window.DPProjectsGrid._abortController = controller;

    fetch(DATA_PATH, { signal: controller.signal })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!container.isConnected) {
          console.warn('Projects grid: container no longer in DOM, skipping render.');
          return;
        }
        var projects = data.projects || [];
        if (projects.length === 0) {
          container.innerHTML = '<p class="dp-empty">No projects yet.</p>';
          return;
        }

        var html =
          '<section class="dp-grid-section">' +
            '<div class="dp-card-grid">' +
              projects.map(function (project) {
                return window.DPProjectCard.generate(project);
              }).join('') +
            '</div>' +
          '</section>';

        container.innerHTML = html;
      })
      .catch(function (err) {
        if (err.name === 'AbortError') return;
        console.error('Failed to load projects:', err);
        if (!container.isConnected) {
          console.warn('Projects grid: container no longer in DOM, skipping error message.');
          return;
        }
        container.innerHTML = '<p class="dp-empty">Failed to load projects.</p>';
      });
  }

  window.DPProjectsGrid = {
    init: renderGrid
  };
})();
