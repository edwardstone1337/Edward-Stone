# Theme init pattern (canonical)

> **Status:** Public pages default dark. Case studies and project pages (`projects/fair-share.html`) are permanently light. The theme toggle is dev-only (loaded on `dev/design-system.html`).

Light theme tokens live exclusively in `dev-tokens.css` under `[data-theme="light"]`. Case-study-specific component overrides (prose sizing, pullquote, hero line) live in `case-study-theme.css`. Nav light overrides (sticky bar opacity, logo ring) live in `dev-styles.css`.

The theme system has two parts for public pages: a **pre-init script** in `<head>` and a **transition-unlock** double-`requestAnimationFrame` at end of `<body>`. Dev pages additionally load the **theme-toggle.js** ES6 module.

## 1. Head: pre-init script

Place in `<head>`, after stylesheets and GA4, before `</head>`:

```html
<script>
(function() {
  var theme;
  try { theme = localStorage.getItem('dp-theme'); } catch(e) {}
  if (!theme) {
    theme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.classList.add('dp-no-transition');
})();
</script>
```

This runs before first paint and:
1. Reads the user's persisted choice from `localStorage('dp-theme')`
2. Falls back to `prefers-color-scheme` media query
3. Sets `data-theme` on `<html>` for CSS token resolution
4. Adds `dp-no-transition` class to suppress transition flicker during load

## 2. Body: nav module (public pages)

Public pages load nav and banner ticker only — no theme toggle:

```html
<script type="module">
  import { initNav } from './assets/js/dev-projects/nav-component.js';
  import { initBannerTicker } from './assets/js/dev-projects/banner-ticker.js';
  initNav();
  initBannerTicker({ text: 'Currently open to new opportunities', separator: '✦' });
</script>
```

## 3. End of body: transition unlock

Last script before `</body>`:

```html
<script>
requestAnimationFrame(function() {
  requestAnimationFrame(function() {
    document.documentElement.classList.remove('dp-no-transition');
  });
});
</script>
```

The double-`requestAnimationFrame` ensures the browser has completed first paint with the correct theme before re-enabling CSS transitions. Without this, theme-dependent properties would visibly transition from their default values.

## Files using this pattern (dark default, no toggle)

- `index.html`
- `resume.html`
- `gallery.html`
- `404.html`
- `projects/scp-reader.html`

## Theme toggle (dev-only)

The theme toggle (`assets/js/dev-projects/theme-toggle.js`) is loaded only on `dev/design-system.html`. It injects a sun/moon button into `#dp-nav-actions`, toggles `data-theme` between `dark` and `light`, and persists to `localStorage('dp-theme')`. Must be called after `initNav()`.

```html
<script type="module">
  import { initThemeToggle } from '../assets/js/dev-projects/theme-toggle.js';
  initThemeToggle();
</script>
```

## Case studies and project pages (permanently light)

Case study pages (`case-studies/*.html`) and `projects/fair-share.html` are permanently light. They hardcode light theme and do not support toggling:

```html
<script>document.documentElement.setAttribute('data-theme', 'light');</script>
```

No pre-init script, no theme-toggle.js, no transition-unlock needed. They load `case-study-theme.css` after dev-styles for component overrides (prose sizing, pullquote, hero line). Light tokens come from `dev-tokens.css`.

## Preview iframes

Preview iframes (`assets/previews/*`) do **not** use this pattern — they receive theme via `postMessage` from the parent page.
