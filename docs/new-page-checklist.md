# New Page Checklist

Step-by-step for adding a new public page to the site. Reference existing pages (e.g. `resume.html`) for the exact patterns.

## 1. HTML Shell

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title — Edward Stone</title>
  <meta name="description" content="...">
  <link rel="canonical" href="https://edwardstone.design/your-page.html">
```

## 2. CSS (dev system)

```html
  <link rel="stylesheet" href="/assets/css/dev-tokens.css">
  <link rel="stylesheet" href="/assets/css/dev-styles.css">
```

Tokens must load before styles. Add project-specific CSS after if needed.

## 3. GA4 Tag

Add in `<head>` after CSS. Measurement ID: `G-6MPMYG36LE`. See `docs/analytics-tagging.md` for the canonical snippet.

## 4. Theme Pre-init Script

Add inline script in `<head>` after GA4. This sets `data-theme` before first paint to prevent flash. Copy the pattern from any existing public page (e.g. `resume.html` lines 39–50) or see `docs/theme-init-pattern.md`.

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
  initNav();
</script>
```

## 7. Main Content

Wrap page content in a section with the `dp-page-content` class (accounts for fixed nav height):

```html
<main id="main-content" class="dp-page-content">
  <!-- Page content here -->
</main>
```

## 8. Theme Toggle

Add before closing `</body>`:

```html
<script src="/assets/js/dev-projects/theme-toggle.js"></script>
```

This IIFE finds `#dp-nav-actions` (created by nav component) and injects the toggle button.

## 9. Theme Transition Removal

Add inline script before closing `</body>` (after theme-toggle). This removes the `dp-no-transition` class after first paint using double `requestAnimationFrame`:

```html
<script>
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      document.documentElement.classList.remove('dp-no-transition');
    });
  });
</script>
```

## 10. Noscript Fallback

Add a `<noscript>` block if the page relies on JS for critical content.

## 11. Verify

- [ ] Both themes render correctly (toggle between light/dark)
- [ ] Keyboard navigation works (Tab, Shift+Tab, Escape on overlays)
- [ ] Mobile drawer opens and closes at ≤768px
- [ ] Skip link reaches main content
- [ ] GA coverage check passes: `./scripts/check-ga-coverage.sh`
- [ ] No console errors in either theme

## Internal/Dev Pages

For non-public pages (`dev/*`, `assets/previews/*`):
- Omit GA4 tag
- May omit theme pre-init if the page is an iframe (receives theme via `postMessage`)
- May use legacy CSS system if extending existing legacy tooling
