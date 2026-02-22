/**
 * Growth Chart — Light theme (case study page)
 * Chart.js line chart for Fair Share growth milestones.
 * Reads all colors from CSS custom properties at render time.
 * No theme switching — page is permanently light.
 * Respects prefers-reduced-motion.
 */
(function () {
  'use strict';

  var CHART_ID = 'growth-chart';

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

  var MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function shortLabel(dateStr) {
    var parts = dateStr.split('-');
    return MONTH_ABBR[parseInt(parts[1], 10) - 1] + " '" + parts[0].slice(2);
  }

  var labels = RAW_DATA.map(function (r) { return shortLabel(r.d); });
  var values = RAW_DATA.map(function (r) { return r.y; });

  function getToken(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function hexToRgba(hex, alpha) {
    if (!hex || hex.indexOf('#') !== 0) return null;
    var short = hex.length === 4;
    var r = parseInt(short ? hex[1] + hex[1] : hex.slice(1, 3), 16);
    var g = parseInt(short ? hex[2] + hex[2] : hex.slice(3, 5), 16);
    var b = parseInt(short ? hex[3] + hex[3] : hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function createFillGradient(ctx, accent) {
    var gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    var accentFill = hexToRgba(accent, 0.1);
    gradient.addColorStop(0, accentFill || accent);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    return gradient;
  }

  function init() {
    var canvas = document.getElementById(CHART_ID);
    if (!canvas || typeof window.Chart === 'undefined') return;

    var ctx = canvas.getContext('2d');
    var accent = getToken('--dp-accent');
    var gridColor = getToken('--dp-border-default');
    var labelColor = getToken('--dp-text-secondary');
    var tooltipBg = getToken('--dp-bg-raised');
    var tooltipText = getToken('--dp-text-primary');
    var reducedMotion = prefersReducedMotion();

    var fontFamily = "'Inter', sans-serif";
    var fontSize = Math.round(parseFloat(getToken('--dp-text-sm')) * 16); /* rem → px */
    var fontWeight = getToken('--dp-weight-normal') || '400';

    var accentGlow = hexToRgba(accent, 0.25);
    var fillGradient = createFillGradient(ctx, accent);

    new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Glow',
            data: values,
            borderColor: accentGlow || accent,
            backgroundColor: 'transparent',
            borderWidth: 7,
            pointRadius: 0,
            pointHoverRadius: 0,
            fill: false,
            tension: 0.3
          },
          {
            label: 'Clicks',
            data: values,
            borderColor: accent,
            backgroundColor: fillGradient,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: accent,
            pointBorderColor: accent,
            pointBorderWidth: 1,
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        animation: reducedMotion ? false : undefined,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: tooltipBg,
            titleColor: tooltipText,
            bodyColor: tooltipText,
            borderColor: gridColor,
            borderWidth: 1,
            cornerRadius: 8,
            padding: 10,
            titleFont: { family: fontFamily, size: fontSize, weight: '600' },
            bodyFont: { family: fontFamily, size: fontSize, weight: fontWeight },
            displayColors: false,
            callbacks: {
              title: function (items) { return items[0].label; },
              label: function (item) {
                return item.datasetIndex === 1 ? item.formattedValue + ' clicks / 28 days' : null;
              }
            },
            filter: function (item) { return item.datasetIndex === 1; }
          }
        },
        scales: {
          x: {
            type: 'category',
            grid: { color: gridColor, drawBorder: false },
            ticks: {
              maxTicksLimit: 6,
              autoSkip: true,
              color: labelColor,
              font: { size: fontSize, family: fontFamily, weight: fontWeight }
            }
          },
          y: {
            min: 0,
            max: 4000,
            ticks: {
              stepSize: 1000,
              color: labelColor,
              font: { size: fontSize, family: fontFamily, weight: fontWeight }
            },
            grid: { color: gridColor, drawBorder: false }
          }
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
