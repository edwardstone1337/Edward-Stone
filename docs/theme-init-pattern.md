# Theme init pattern (canonical)

Theme is set before first paint to avoid a flash of wrong theme. Inline scripts only; no external JS.

## 1. Head: pre-init script

Place in `<head>`, after stylesheets, before `</head>`:

```html
<!-- Theme pre-init: prevents flash. Canonical pattern documented in docs/theme-init-pattern.md -->
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

- Reads `dp-theme` from localStorage, else `prefers-color-scheme: dark` → `'dark'` / `'light'`.
- Sets `data-theme` on `<html>` and adds `dp-no-transition` so theme change doesn’t animate on load.

## 2. Body end: no-transition removal

Place just before `</body>`:

```html
<!-- Remove no-transition class after paint -->
<script>
requestAnimationFrame(function() {
  requestAnimationFrame(function() {
    document.documentElement.classList.remove('dp-no-transition');
  });
});
</script>
```

- Double rAF runs after first paint; removing the class re-enables transitions for later theme toggles.

## Files using this pattern

- `index.html`
- `projects/scp-reader.html`
- `projects/fair-share.html`
- `dev/design-system.html`
- `404.html`

## Note

Preview iframes (`assets/previews/*`) do **not** use this pattern — they receive theme via `postMessage` from the parent page.
