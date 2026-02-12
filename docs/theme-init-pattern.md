# Theme init pattern (canonical)

> **Status:** Simplified. The site is dark-only — there is no theme toggle or light mode.

The canonical pattern is a single `setAttribute` line in `<head>`, before first paint:

## Head: set dark theme

Place in `<head>`, after stylesheets, before `</head>`:

```html
<!-- Dark-only: set data-theme for CSS token resolution -->
<script>
document.documentElement.setAttribute('data-theme', 'dark');
</script>
```

No localStorage, no `prefers-color-scheme` detection, no transition suppression needed.

## Files using this pattern

- `index.html`
- `resume.html`
- `projects/scp-reader.html`
- `projects/fair-share.html`
- `dev/design-system.html`
- `404.html`

## Note

Preview iframes (`assets/previews/*`) do **not** use this pattern — they receive theme via `postMessage` from the parent page.
