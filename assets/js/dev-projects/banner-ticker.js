/**
 * Banner ticker — slim scrolling text bar above the nav.
 * Uses CSS animation (dp-ticker-scroll) for motion.
 * 8 copies of the content ensure seamless looping on ultrawide displays;
 * translateX(-50%) shifts the first half out, revealing the identical second half.
 */
export function initBannerTicker(config) {
  var text = config && config.text || 'Currently open to new opportunities';
  var separator = config && config.separator || '\u2726';

  var nav = document.querySelector('nav.dp-nav');
  if (!nav) return;

  var banner = document.createElement('div');
  banner.className = 'dp-banner-ticker';
  banner.setAttribute('role', 'marquee');
  banner.setAttribute('aria-label', 'Site announcement');

  var track = document.createElement('div');
  track.className = 'dp-banner-ticker__track';

  for (var i = 0; i < 8; i++) {
    var span = document.createElement('span');
    span.className = 'dp-banner-ticker__content';
    if (i > 0) span.setAttribute('aria-hidden', 'true');

    var sep = document.createElement('span');
    sep.className = 'dp-banner-ticker__separator';
    sep.textContent = separator;

    span.appendChild(sep);
    span.appendChild(document.createTextNode(' ' + text));

    track.appendChild(span);
  }

  banner.appendChild(track);
  nav.parentNode.insertBefore(banner, nav);
}
