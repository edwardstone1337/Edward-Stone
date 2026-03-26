# Release Playbook

## Overview

Features are hidden or shown on production via a **feature gate** — not comment wrappers. Both `dev` and `main` carry identical code. Visibility is controlled at runtime by detecting the production hostname.

```
dev ──→ main (prod)
  (gate attributes/flags control visibility on each host)
```

GitHub Pages deploys from `main` automatically (~60s).

## How the Feature Gate Works

**`assets/js/env.js`** runs synchronously in `<head>` (first script, no defer/async) and adds `is-prod` to `<html>` when the hostname is `edwardstone.design` or `www.edwardstone.design`. All gating logic reads this class.

| Gate method | Mechanism |
|---|---|
| HTML sections | `data-prod-hide` attribute on outermost element → CSS rule hides it |
| Nav items | `prodHide: true` property in `NAV_LINKS` → filtered out of `ACTIVE_LINKS` |
| JS-initialised features | `if (!isProd)` check wrapping the init call |
| CSS-only features | `.is-prod .selector { display: none; }` override rule |

**CSS rule** (top of `dev-styles.css`):
```css
.is-prod [data-prod-hide] { display: none !important; }
```

**Nav filter** (`nav-component.js`):
```js
const isProd = document.documentElement.classList.contains('is-prod');
const ACTIVE_LINKS = isProd ? NAV_LINKS.filter(item => !item.prodHide) : NAV_LINKS;
```

**dev** renders on a non-prod hostname (Vercel) — all gated features are visible.
**main** renders on `edwardstone.design` — all gated features are hidden.

## Hiding a New Feature on Prod

**HTML section:**
```html
<section data-prod-hide>
  ...
</section>
```

**Nav item:**
```js
{ text: 'Gallery', href: '/gallery.html', prodHide: true },
```

**JS-initialised feature:**
```js
const isProd = document.documentElement.classList.contains('is-prod');
if (!isProd) {
  import('./assets/js/dev-projects/my-feature.js').then(m => m.init());
}
```

**CSS-only feature:**
```css
.is-prod .my-selector { display: none; }
```

## Shipping a Feature to Prod

Remove the gate. No branch gymnastics required.

- HTML: remove `data-prod-hide`
- Nav: remove `prodHide: true`
- JS: remove the `if (!isProd)` wrapper
- CSS: remove the `.is-prod` override rule

Commit and push to `main` (or merge from `dev`). Deploy takes ~60s.

## Release Steps

```bash
# 1. Develop on dev
git checkout dev

# 2. When ready to ship, merge to main
git checkout main
git merge dev
git push origin main

# 3. Verify on edwardstone.design (~60s deploy)
```

## Rollback

**Safe (creates a revert commit):**
```bash
git revert <merge-commit> && git push origin main
```

**Nuclear (rewrites history):**
```bash
git reset --hard <previous-commit> && git push --force origin main
```

## Currently Gated Features

| Feature | Gate method | File |
|---|---|---|
| Toolbox section | `data-prod-hide` | `index.html` |
| Fair Share strip + testimonial | `data-prod-hide` | `index.html` |
| Flip 7 strip | `data-prod-hide` | `index.html` |
| SCP Reader strip + testimonial | `data-prod-hide` | `index.html` |
| Kaomoji strip | `data-prod-hide` | `index.html` |
| Ticker composite items (×2) | `data-prod-hide` | `index.html` |
| Ticker static items (×2) | `data-prod-hide` | `index.html` |
| Projects nav dropdown | `prodHide: true` | `nav-component.js` |
| Gallery nav link | `prodHide: true` | `nav-component.js` |
| About nav link | `prodHide: true` | `nav-component.js` |
| Banner ticker init | `isProd` check | 8 HTML files |
| Hero card scribble overlay | `.is-prod` CSS override | `dev-styles.css` |

## Important Notes

- `env.js` must be the **first `<script>` in `<head>`** on every page — synchronous, no `defer` or `async`
- Both branches carry identical code — no comment-syntax differences between `dev` and `main`
- Merges between branches are conflict-free
- To verify coverage: `grep -rn "env.js" --include="*.html" . | grep -v dev/ | grep -v assets/previews`
