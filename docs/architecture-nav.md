# Navigation Architecture

## Overview

The shared site navigation is an ES6 module at `assets/js/dev-projects/nav-component.js`. It generates a `<nav class="dp-nav">` element and replaces `#nav-container` on the page. Used on all public pages and some dev pages.

## Usage

Add the container div and module import to any page:

```html
<div id="nav-container"></div>
<script type="module">
  import { initNav } from './assets/js/dev-projects/nav-component.js';
  initNav();
</script>
```

## NAV_LINKS Configuration

Links are defined in a `NAV_LINKS` array at the top of `nav-component.js`. **Order in the array matches desktop left-to-right.** Items with `prodHide: true` are filtered out on production by `ACTIVE_LINKS` in the `env.js` feature gate system — they remain visible on all non-production hostnames.

```js
const NAV_LINKS = [
  { text: 'Case Studies', children: [
    { text: 'Driving weekly engagement for 25,000 teachers', href: '/case-studies/planner.html' },
    { text: 'Changing how an organisation decides what to build', href: '/case-studies/product-discovery.html' },
    { text: 'Accelerating team velocity with design systems', href: '/case-studies/design-systems.html' },
    { text: 'Designing the tool therapists recommend to their clients', href: '/case-studies/fair-share.html' }
  ]},
  { text: 'Projects', prodHide: true, children: [
    { text: 'SCP Reader', href: '/projects/scp-reader.html' }
  ]},
  { text: 'Gallery', href: '/gallery.html', prodHide: true },
  { text: 'Resume', href: '/resume.html' },
  { text: 'About', href: '/about.html', prodHide: true }
];
```

- **Top-level items with `href`** render as direct links
- **Top-level items with `children`** render as dropdown triggers with a chevron icon
- **Child items** always have `text` and `href`

To add a new page to the nav, add an entry to `NAV_LINKS`.

## Desktop Layout

On production (`is-prod`), only items without `prodHide: true` are rendered:

```
[ Logo  Edward Stone ]    [ Case Studies ▾ ] [ Resume ]    [ actions: hamburger hidden ]
        brand                  links (centre)                   #dp-nav-actions
```

On non-production hostnames, all items are rendered:

```
[ Logo  Edward Stone ]    [ Case Studies ▾ ] [ Projects ▾ ] [ Gallery ] [ Resume ] [ About ]    [ actions ]
        brand                                    links (centre)                                   #dp-nav-actions
```

- **Brand** (`.dp-nav-brand`): Logo SVG + "Edward Stone" text, links to `/index.html`
- **Links** (`.dp-nav-links`): Rendered from `NAV_LINKS`. Items with children become dropdowns
- **Actions** (`.dp-nav-actions`, `#dp-nav-actions`): Hamburger lives here (visible ≤768px). On **`dev/design-system.html` only**, `theme-toggle.js` also injects the sun/moon control into this container

## Dropdown Menus (Desktop)

Items with `children` in `NAV_LINKS` render as:
- A `<button>` trigger with `aria-expanded` and `aria-haspopup="true"`
- A `<div role="menu" hidden>` containing child links as `<a role="menuitem">`

Behaviour:
- **Click trigger** → open; opening one dropdown closes any other open dropdown first
- **Click outside** → close
- **Escape key** → close and return focus to trigger
- Elevated background (`rgba(30, 30, 30, 0.95)`) with backdrop blur for legibility. Case Studies menu (4 items) uses `min-width: 400px` for full-sentence labels.

CSS: `.dp-nav-dropdown`, `.dp-nav-dropdown-trigger`, `.dp-nav-dropdown-menu`, `.dp-dropdown-menu`

## Mobile Drawer (≤768px)

At viewport widths ≤768px, desktop links are hidden via CSS and a hamburger button appears in the actions area.

### Structure

```
<div class="dp-nav-drawer" role="dialog" aria-modal="true">
  <div class="dp-nav-drawer-backdrop"></div>
  <div class="dp-nav-drawer-panel">
    <button class="dp-nav-drawer-close" aria-label="Close menu">
    <nav class="dp-nav-drawer-links" aria-label="Menu">
      <!-- Flat list: headings for groups, links for items -->
    </nav>
  </div>
</div>
```

### Opening
1. Click hamburger → remove `hidden` attribute
2. Force reflow (`void panel.offsetHeight`)
3. Add `dp-nav-drawer--open` class (triggers slide-in transition)
4. Lock body scroll (`document.body.style.overflow = 'hidden'`)
5. Focus close button

### Closing (three triggers)
- Close button click
- Backdrop click
- Escape key

On close: remove `dp-nav-drawer--open`, wait for `transitionend` (350ms fallback), add `hidden`, restore scroll, return focus to hamburger.

### Focus Trap
Tab and Shift+Tab cycle through focusable elements within the drawer panel. Focusable elements: `a[href], button, [tabindex]:not([tabindex="-1"])`.

### Drawer Links
Dropdown parents from `NAV_LINKS` render as section headings (`.dp-nav-drawer-heading`) with their children listed below. Direct links render as standalone items.

## aria-current="page"

Set automatically via `isCurrentPage(linkHref)` which normalises pathnames (strips trailing slashes, treats `/index.html` as `/`). Applied to desktop links, dropdown child links, and drawer links.

## Theme Toggle Integration (dev-only)

The nav component renders an empty `<div id="dp-nav-actions">` container. The theme toggle module (`theme-toggle.js`, ES6 `export function initThemeToggle()`) finds this container and injects a sun/moon toggle button. Call `initThemeToggle()` after `initNav()` so the container exists. The nav does not depend on the theme toggle — they are decoupled. On click, the toggle flips `data-theme` on `<html>` and persists to `localStorage('dp-theme')`.

The theme toggle is loaded only on `dev/design-system.html`. Public pages on `main` pin light (or load without the toggle); they do not load `theme-toggle.js`.

## CSS Selectors (in `dev-styles.css`)

| Selector | Purpose |
|----------|---------|
| `.dp-nav` | Fixed top bar, glass background, backdrop blur |
| `.dp-nav-inner` | Centred container (max-width: 1200px) |
| `.dp-nav-brand` | Logo + name link |
| `.dp-nav-links` | Desktop link row (hidden at ≤768px) |
| `.dp-nav-link` | Individual nav link |
| `.dp-nav-link:focus-visible` | Accent outline with 2px offset |
| `.dp-nav-actions` | Right-side action container |
| `.dp-nav-hamburger` | Mobile menu button (hidden at >768px) |
| `.dp-dropdown-menu`, `.dp-nav-dropdown-menu` | Dropdown panel; Case Studies (4 items) gets min-width 400px |
| `.dp-nav-drawer` | Full-viewport overlay |
| `.dp-nav-drawer-panel` | Right-side slide-in panel (max-width: 320px) |
| `.dp-nav-drawer-backdrop` | Semi-transparent backdrop |
| `.dp-nav-drawer-link` | Drawer nav link |
| `.dp-nav-drawer-heading` | Section heading in drawer |
| `.dp-page-content` | Content wrapper (accounts for 64px nav height) |
