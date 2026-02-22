# Theme init pattern (canonical)

> **Status:** Dual light/dark theme with toggle. Seven pages support toggling; case studies are permanently light.

The theme system has three parts: a **pre-init script** in `<head>`, the **theme-toggle.js** ES6 module, and a **transition-unlock** double-`requestAnimationFrame` at end of `<body>`.

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

## 2. Body: theme toggle module

After `initNav()` in the nav module script block:

```html
<script type="module">
  import { initNav } from './assets/js/dev-projects/nav-component.js';
  import { initThemeToggle } from './assets/js/dev-projects/theme-toggle.js';
  initNav();
  initThemeToggle();
</script>
```

`initThemeToggle()` finds `#dp-nav-actions` (created by nav component) and injects a sun/moon toggle button. On click it:
- Toggles `data-theme` between `dark` and `light` on `<html>`
- Persists the choice to `localStorage('dp-theme')`

Must be called **after** `initNav()` so the `#dp-nav-actions` container exists.

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

## Files using this pattern

- `index.html`
- `resume.html`
- `gallery.html`
- `404.html`
- `projects/fair-share.html`
- `projects/scp-reader.html`
- `dev/design-system.html`

## Case studies (permanently light)

Case study pages (`case-studies/*.html`) use a simpler pattern — they hardcode light theme and do not support toggling:

```html
<script>document.documentElement.setAttribute('data-theme', 'light');</script>
```

No pre-init script, no theme-toggle.js, no transition-unlock needed.

## Preview iframes

Preview iframes (`assets/previews/*`) do **not** use this pattern — they receive theme via `postMessage` from the parent page.
