/**
 * Growth Chart — Fair Share project
 * Replaces stat strip with a Chart.js line chart (Google Search Console milestones).
 * Linear aesthetic; theme-reactive; respects prefers-reduced-motion.
 */
(function () {
  'use strict';

  var CHART_ID = 'growth-chart';

  // 23 milestone data points (date string, clicks per 28 days)
  var RAW_DATA = [
    { d: '2024-03-13', y: 5 },
    { d: '2024-03-28', y: 15 },
    { d: '2024-04-11', y: 30 },
    { d: '2024-04-20', y: 40 },
    { d: '2024-05-05', y: 50 },
    { d: '2024-05-14', y: 60 },
    { d: '2024-09-19', y: 80 },
    { d: '2024-10-03', y: 100 },
    { d: '2024-12-07', y: 250 },
    { d: '2024-12-18', y: 300 },
    { d: '2025-01-04', y: 350 },
    { d: '2025-01-16', y: 450 },
    { d: '2025-01-28', y: 600 },
    { d: '2025-02-11', y: 800 },
    { d: '2025-02-21', y: 900 },
    { d: '2025-03-08', y: 1200 },
    { d: '2025-04-10', y: 1500 },
    { d: '2025-04-20', y: 1800 },
    { d: '2025-05-05', y: 2000 },
    { d: '2025-08-09', y: 2200 },
    { d: '2025-09-24', y: 2500 },
    { d: '2025-10-17', y: 3000 },
    { d: '2026-01-25', y: 3500 }
  ];

  // Abbreviated labels for axis: "Mar '24", "Jan '26", etc.
  var MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function shortLabel(dateStr) {
    var parts = dateStr.split('-');
    var y = parts[0];
    var m = parseInt(parts[1], 10) - 1;
    return MONTH_ABBR[m] + " '" + y.slice(2);
  }

  var labels = RAW_DATA.map(function (r) { return shortLabel(r.d); });
  var values = RAW_DATA.map(function (r) { return r.y; });

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function getAccentColor() {
    var style = getComputedStyle(document.documentElement);
    return style.getPropertyValue('--dp-accent').trim() || '#5BBFB5';
  }

  function getGridColor() {
    return getTheme() === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
  }

  function getLabelColor() {
    var style = getComputedStyle(document.documentElement);
    return style.getPropertyValue('--dp-text-secondary').trim() || '#8A94A6';
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  var chartInstance = null;

  function buildOptions() {
    var gridColor = getGridColor();
    var labelColor = getLabelColor();
    var reducedMotion = prefersReducedMotion();

    return {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      animation: reducedMotion ? false : undefined,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: {
          type: 'category',
          grid: { color: gridColor, drawBorder: false },
          ticks: {
            maxTicksLimit: 6,
            autoSkip: true,
            color: labelColor,
            font: { size: 12, family: 'Inter, sans-serif' }
          }
        },
        y: {
          min: 0,
          max: 4000,
          ticks: {
            stepSize: 1000,
            color: labelColor,
            font: { size: 12, family: 'Inter, sans-serif' }
          },
          grid: { color: gridColor, drawBorder: false }
        }
      }
    };
  }

  function buildDatasets() {
    var accent = getAccentColor();

    // Glow: same data, thicker line, low opacity (Chart.js has no stroke blur)
    var accentRgba = hexToRgba(accent, 0.25);
    var glowDataset = {
      label: 'Glow',
      data: values,
      borderColor: accentRgba || accent,
      backgroundColor: 'transparent',
      borderWidth: 7,
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: false,
      tension: 0.3
    };

    var mainDataset = {
      label: 'Clicks',
      data: values,
      borderColor: accent,
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: accent,
      pointBorderColor: accent,
      pointBorderWidth: 1,
      fill: false,
      tension: 0.3
    };

    return [glowDataset, mainDataset];
  }

  function hexToRgba(hex, alpha) {
    if (!hex || hex.indexOf('#') !== 0) return null;
    var shorthand = hex.length === 4;
    var r = parseInt(shorthand ? hex[1] + hex[1] : hex.slice(1, 3), 16);
    var g = parseInt(shorthand ? hex[2] + hex[2] : hex.slice(3, 5), 16);
    var b = parseInt(shorthand ? hex[3] + hex[3] : hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function createChart() {
    var canvas = document.getElementById(CHART_ID);
    if (!canvas || typeof window.Chart === 'undefined') return;

    var ctx = canvas.getContext('2d');
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    chartInstance = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: buildDatasets()
      },
      options: buildOptions()
    });
  }

  function updateChartTheme() {
    if (!chartInstance) return;
    chartInstance.options = buildOptions();
    chartInstance.data.datasets = buildDatasets();
    chartInstance.update('none'); // no animation on theme switch
  }

  function observeTheme() {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.type === 'attributes' && m.attributeName === 'data-theme') {
          updateChartTheme();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  function init() {
    var container = document.querySelector('[data-project="fair-share"] .dp-growth-chart');
    if (!container) return;

    var canvas = document.getElementById(CHART_ID);
    if (!canvas) return;

    createChart();
    observeTheme();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
