# Theme init pattern (canonical)

> **Status:** On **`main`**, index, resume, gallery, 404, projects, and case studies pin **`data-theme="light"`** with a one-line `<head>` script (no user toggle). The full **pre-init + `dp-no-transition` + body-end rAF** flow below is what **`dev/design-system.html`** uses, together with **theme-toggle.js** (dev-only).

Light theme tokens live exclusively in `dev-tokens.css` under `[data-theme="light"]`. Case-study-specific component overrides (prose sizing, pullquote, hero line) live in `case-study-theme.css`. Nav light overrides (sticky bar opacity, logo ring) live in `dev-styles.css`.

**Design system pages:** pre-init in `<head>` plus **transition-unlock** double-`requestAnimationFrame` at end of `<body>`, and **`theme-toggle.js`** ES6 module. **Public listing pages** that only need a fixed theme can keep a single `setAttribute('data-theme', 'light'|'dark')` line instead of this full block.

## 1. Head: pre-init script

For **`dev/design-system.html`** (or any page that restores user-chosen dark/light). Pinned-light public pages **omit** this block.

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

## 2. Body: nav + banner ticker (no theme toggle)

Most public pages load nav and banner ticker only — no `theme-toggle.js`:

```html
<script type="module">
  import { initNav } from './assets/js/dev-projects/nav-component.js';
  import { initBannerTicker } from './assets/js/dev-projects/banner-ticker.js';
  initNav();
  initBannerTicker({ text: 'Currently open to new opportunities', separator: '✦' });
</script>
```

## 3. End of body: transition unlock

Pair with **§1** only (removes `dp-no-transition` after first paint). Pinned-light pages **omit** this.

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

## Files by wiring

| Wiring | HTML files |
|--------|------------|
| **Full pattern** — §1 pre-init, §3 body-end rAF, optional §4 toggle | `dev/design-system.html` |
| **Pinned light** — one-line `setAttribute('data-theme', 'light')` in `<head>`; §2 nav + ticker; no §1/§3/§4 | `index.html`, `resume.html`, `gallery.html`, `404.html`, `case-studies/fair-share.html`, `projects/scp-reader.html`, `case-studies/planner.html`, `case-studies/design-systems.html`, `case-studies/product-discovery.html` |

Case study and Fair Share pages also load `case-study-theme.css` after `dev-styles.css` for prose/pullquote/hero overrides.

## Theme toggle (dev-only)

The theme toggle (`assets/js/dev-projects/theme-toggle.js`) is loaded only on `dev/design-system.html`. It injects a sun/moon button into `#dp-nav-actions`, toggles `data-theme` between `dark` and `light`, and persists to `localStorage('dp-theme')`. Must be called after `initNav()`.

```html
<script type="module">
  import { initThemeToggle } from '../assets/js/dev-projects/theme-toggle.js';
  initThemeToggle();
</script>
```

## Preview iframes

Preview iframes (`assets/previews/*`) do **not** use this pattern — they receive theme via `postMessage` from the parent page.
