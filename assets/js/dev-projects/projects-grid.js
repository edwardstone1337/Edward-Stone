/**
 * Projects Grid — Dev Projects Page
 *
 * Fetches projects from JSON and renders cards into a grid.
 * Imports generateCard from project-card.js so module load order is guaranteed.
 */
import { generateCard } from './project-card.js';

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
        // Hide cards for projects that have a featured strip (banner) above the grid
        var stripTitles = { 'Kaomoji.click': true, 'Fair Share Calculator': true, 'SCP Reader': true };
        var cardProjects = projects.filter(function (p) { return !stripTitles[p.title]; });
        if (cardProjects.length === 0) {
          container.innerHTML = '<p class="dp-empty">No projects yet.</p>';
          return;
        }

        var html =
          '<section class="dp-grid-section">' +
            '<div class="dp-card-grid">' +
              cardProjects.map(function (project) {
                return generateCard(project);
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
