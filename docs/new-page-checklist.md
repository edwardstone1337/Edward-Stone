# New Page Checklist

Step-by-step for adding a new public page to the site. Reference existing pages (e.g. `resume.html`) for the exact patterns.

## 1. HTML Shell

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title — Edward Stone</title>
  <meta name="description" content="...">
  <link rel="canonical" href="https://edwardstone.design/your-page.html">
```

Do **not** hardcode `data-theme` on `<html>` — the pre-init script (step 4) sets it dynamically.

## 2. CSS (dev system)

```html
  <link rel="stylesheet" href="/assets/css/dev-tokens.css">
  <link rel="stylesheet" href="/assets/css/dev-styles.css">
```

Tokens must load before styles. Add project-specific CSS after if needed.

## 3. GA4 Tag

Add in `<head>` after CSS. Measurement ID: `G-6MPMYG36LE`. See `docs/analytics-tagging.md` for the canonical snippet.

## 4. Theme Pre-init Script

Add inline script in `<head>` after GA4. This reads `localStorage` / `prefers-color-scheme`, sets `data-theme` before first paint, and adds `dp-no-transition` to suppress flash:

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

See `docs/theme-init-pattern.md` for the full pattern.

## 5. Skip Link

First element in `<body>`:

```html
<a href="#main-content" class="dp-skip-link">Skip to content</a>
```

## 6. Nav Container

```html
<div id="nav-container"></div>
<script type="module">
  import { initNav } from '/assets/js/dev-projects/nav-component.js';
  import { initBannerTicker } from '/assets/js/dev-projects/banner-ticker.js';
  initNav();
  initBannerTicker({ text: 'Currently open to new opportunities', separator: '✦' });
</script>
```

Do **not** load the theme toggle on public pages — it is dev-only (see `docs/theme-init-pattern.md`).

## 7. Main Content

Wrap page content in a section with the `dp-page-content` class (accounts for fixed nav height):

```html
<main id="main-content" class="dp-page-content">
  <!-- Page content here -->
</main>
```

## 8. Theme Transition Unlock

Add as the last inline script before closing `</body>`. This removes the `dp-no-transition` class after first paint using double `requestAnimationFrame`:

```html
<script>
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      document.documentElement.classList.remove('dp-no-transition');
    });
  });
</script>
```

## 9. Noscript Fallback

Add a `<noscript>` block if the page relies on JS for critical content.

## 10. Verify

- [ ] Page renders correctly in dark theme (default)
- [ ] Keyboard navigation works (Tab, Shift+Tab, Escape on overlays)
- [ ] Mobile drawer opens and closes at ≤768px
- [ ] Skip link reaches main content
- [ ] GA coverage check passes: `./scripts/check-ga-coverage.sh`
- [ ] No console errors

## Case Study Pages (variant)

Case studies in `case-studies/` are permanently light. They **differ** from the standard checklist:

- **Hardcode `data-theme="light"`** in `<head>` (before CSS) — no pre-init script, no theme toggle
- **Add** `case-study-theme.css` after dev-styles.css
- **Omit** `initThemeToggle()` — load nav + banner ticker only
- **Script block**: `initNav()`, `initBannerTicker({ text: '...', separator: '✦' })`
- **Main**: Use `class="dp-page"` (not `dp-page-content`); case-study-theme handles spacing
- **Manifest comment**: `<!-- CASE-STUDY-SCRIPTS: effects.js, back-to-top.js, module(nav-component, banner-ticker) -->` above scripts for copy-paste consistency

Reference: `case-studies/design-systems.html`, `case-studies/planner.html`, `case-studies/product-discovery.html`.

## Internal/Dev Pages

For non-public pages (`dev/*`, `assets/previews/*`):
- Omit GA4 tag
- May omit theme pre-init if the page is an iframe (receives theme via `postMessage`)
- May use legacy CSS system if extending existing legacy tooling
