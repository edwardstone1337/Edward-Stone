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

**Theme:** On **`main`**, most public pages **pin light** with a one-liner in `<head>` (see step 4). Use the full pre-init + step 8 **only** for pages that behave like **`dev/design-system.html`** (user-chosen dark/light).

## 2. CSS (dev system)

```html
  <link rel="stylesheet" href="/assets/css/dev-tokens.css">
  <link rel="stylesheet" href="/assets/css/dev-styles.css">
```

Tokens must load before styles. Add project-specific CSS after if needed.

## 3. GA4 Tag

Add in `<head>` after CSS. Measurement ID: `G-6MPMYG36LE`. See `docs/analytics-tagging.md` for the canonical snippet.

## 4. Theme on `<html>`

### 4a. Pinned light (default for new public pages matching the live site)

After GA4, before CSS is fine:

```html
<script>document.documentElement.setAttribute('data-theme', 'light');</script>
```

**Skip step 8** (no `dp-no-transition` / rAF). For prose-heavy case-study-style pages, add `case-study-theme.css` after `dev-styles.css` (see §Case Study variant).

### 4b. Pre-init (user-chosen theme — `dev/design-system.html` pattern)

Add inline script in `<head>` after GA4. Reads `localStorage` / `prefers-color-scheme`, sets `data-theme` before first paint, adds `dp-no-transition`:

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

## 8. Theme transition unlock

**Only if you used §4b.** Add as the last inline script before closing `</body>`. Removes `dp-no-transition` after first paint (double `requestAnimationFrame`):

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

- [ ] Page renders correctly at the intended theme (pinned light vs pre-init)
- [ ] Keyboard navigation works (Tab, Shift+Tab, Escape on overlays)
- [ ] Mobile drawer opens and closes at ≤768px
- [ ] Skip link reaches main content
- [ ] GA coverage check passes: `./scripts/check-ga-coverage.sh`
- [ ] No console errors

## Case Study Pages (variant)

Case studies in `case-studies/` are permanently light — same **§4a** one-liner as index/resume/gallery. They **differ** from generic pages mainly by CSS and layout:

- **`data-theme="light"`** in `<head>` — no §4b pre-init, no theme toggle
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
