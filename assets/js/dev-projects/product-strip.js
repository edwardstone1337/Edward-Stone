/**
 * Product Strip — Dev Projects Page
 *
 * Renders a single product strip (orb background, device + content) before or after a container.
 *
 * Usage:
 *   renderProductStrip(config, '#projects-container');
 *   renderProductStrip(config, '#projects-container', { insertAfter: true });
 */

import { sanitizeUrl } from './utils.js';

export function renderProductStrip(config, containerSelector, options) {
  var container = document.querySelector(containerSelector);
  if (!container || !container.parentNode) {
    console.warn('Product strip: container not found or has no parent:', containerSelector);
    return;
  }

  var insertAfter = options && options.insertAfter === true;

  var section = document.createElement('section');
  section.className = 'dp-strip';
  if (config.ariaLabel) {
    section.setAttribute('aria-label', config.ariaLabel);
  }

  var orbsWrap = document.createElement('div');
  orbsWrap.className = 'dp-strip-orbs';
  var dark1 = document.createElement('div');
  dark1.className = 'dp-strip-orb-dark dp-strip-orb-dark--1';
  var dark2 = document.createElement('div');
  dark2.className = 'dp-strip-orb-dark dp-strip-orb-dark--2';
  orbsWrap.appendChild(dark1);
  orbsWrap.appendChild(dark2);

  var inner = document.createElement('div');
  inner.className = 'dp-strip-inner';

  var media = document.createElement('div');
  media.className = 'dp-strip-media';
  if (config.mediaSrc) {
    var safeSrc = sanitizeUrl(config.mediaSrc);
    if (safeSrc) {
      var img = document.createElement('img');
      img.src = safeSrc;
      img.alt = config.mediaAlt != null ? String(config.mediaAlt) : '';
      img.setAttribute('loading', 'lazy');
      media.appendChild(img);
    }
  } else if (config.mediaSkeleton === 'fair-share') {
    media.appendChild(buildFairShareSkeleton());
  }

  function buildFairShareSkeleton() {
    var wrap = document.createElement('div');
    wrap.className = 'dp-strip-skeleton';
    wrap.setAttribute('aria-hidden', 'true');
    var title = document.createElement('div');
    title.className = 'dp-strip-skeleton__title';
    var row1 = document.createElement('div');
    row1.className = 'dp-strip-skeleton__row';
    var row2 = document.createElement('div');
    row2.className = 'dp-strip-skeleton__row';
    var row3 = document.createElement('div');
    row3.className = 'dp-strip-skeleton__row dp-strip-skeleton__row--short';
    var btn = document.createElement('div');
    btn.className = 'dp-strip-skeleton__btn';
    wrap.appendChild(title);
    wrap.appendChild(row1);
    wrap.appendChild(row2);
    wrap.appendChild(row3);
    wrap.appendChild(btn);
    return wrap;
  }

  var content = document.createElement('div');
  content.className = 'dp-strip-content';

  if (config.emoji) {
    var emojiEl = document.createElement('span');
    emojiEl.className = 'dp-strip-emoji';
    emojiEl.textContent = config.emoji;
    emojiEl.setAttribute('aria-hidden', 'true');
    content.appendChild(emojiEl);
  }

  var titleEl = document.createElement('h2');
  titleEl.className = 'dp-strip-title';
  titleEl.textContent = config.title != null ? String(config.title) : '';

  content.appendChild(titleEl);

  if (config.overline) {
    var overlineEl = document.createElement('span');
    overlineEl.className = 'dp-strip-overline';
    overlineEl.textContent = config.overline;
    content.appendChild(overlineEl);
  }

  if (config.badges && config.badges.length > 0) {
    var badgesEl = document.createElement('div');
    badgesEl.className = 'dp-strip-badges';
    for (var i = 0; i < config.badges.length; i++) {
      var badge = document.createElement('span');
      badge.className = 'dp-strip-badge';
      badge.textContent = String(config.badges[i]);
      badgesEl.appendChild(badge);
    }
    content.appendChild(badgesEl);
  }

  content.appendChild(descEl);

  var actionsEl = document.createElement('div');
  actionsEl.className = 'dp-strip-actions';

  if (config.learnMoreLabel) {
    var learnMoreUrl = sanitizeUrl(config.learnMoreUrl) || '#';
    var learnMore = document.createElement('a');
    learnMore.className = 'dp-btn dp-btn-primary-on-dark';
    learnMore.href = learnMoreUrl;
    learnMore.textContent = config.learnMoreLabel;
    if (learnMoreUrl.indexOf('#') !== 0) {
      learnMore.target = '_blank';
      learnMore.rel = 'noopener noreferrer';
    }
    actionsEl.appendChild(learnMore);
  }

  var ctaUrl = sanitizeUrl(config.ctaUrl) || '#';
  var cta = document.createElement('a');
  cta.className = 'dp-btn dp-btn-secondary-on-dark';
  cta.href = ctaUrl;
  cta.target = '_blank';
  cta.rel = 'noopener noreferrer';
  cta.setAttribute('aria-label', (config.ctaLabel || 'Open') + ' (opens in new tab)');
  cta.textContent = config.ctaLabel != null ? String(config.ctaLabel) : '';
  var iconSpan = document.createElement('span');
  iconSpan.className = 'dp-btn-icon';
  iconSpan.setAttribute('aria-hidden', 'true');
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6');
  var polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  polyline.setAttribute('points', '15 3 21 3 21 9');
  var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', '10');
  line.setAttribute('y1', '14');
  line.setAttribute('x2', '21');
  line.setAttribute('y2', '3');
  svg.appendChild(path);
  svg.appendChild(polyline);
  svg.appendChild(line);
  iconSpan.appendChild(svg);
  cta.appendChild(iconSpan);
  actionsEl.appendChild(cta);

  inner.appendChild(content);
  inner.appendChild(media);
  inner.appendChild(actionsEl);
  section.appendChild(orbsWrap);
  section.appendChild(inner);

  if (insertAfter) {
    container.insertAdjacentElement('afterend', section);
  } else {
    container.parentNode.insertBefore(section, container);
  }
}
