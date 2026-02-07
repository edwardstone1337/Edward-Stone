# Gallery — Pinterest-style mason grid of past work

**Type:** feature  
**Priority:** normal  
**Effort:** large  

---

## TL;DR

A gallery section: **mason/mosaic layout** (Pinterest-style) of images of things you’ve made or done. MVP = unopinionated, randomised grid of images only. Architecture from the start should support **filters/categorisation**, **lightbox**, and **captions** so they can be added later without a rewrite.

---

## Current state

- No gallery or image-grid component on the site.
- No shared data source for “past work” images; case studies and dev projects are separate.

---

## Expected outcome

### MVP (ship first)

- Mason/mosaic grid of images (CSS columns or JS-based masonry).
- Images are the primary content; order can be randomised or data-driven.
- No filters, no lightbox, no captions in the first version — but **structure and data model** should allow adding them.

### Future (build to support)

- **Filters / categorisation** — e.g. by type, year, project; filter UI can come later.
- **Lightbox** — click image → overlay/fullscreen view.
- **Caption / blurb** — optional per image; can be shown in lightbox or on hover; “little blurb” on click is a later enhancement.

Data and DOM should be designed so that adding `categories`, `caption`, and lightbox behaviour doesn’t require changing the core grid component.

---

## Relevant files

- **New:** `assets/js/components/gallery-section.js` (or `gallery-grid.js`) — grid init, optional randomisation, inject items from data.
- **New:** `assets/data/gallery.json` (or similar) — list of image entries: `src`, `alt`, optional `id`; later add `categories`, `caption`.
- **New:** Section in `index.html` or dedicated page (e.g. `gallery.html`) that mounts the gallery.
- **`assets/css/style.css`** — mason layout (e.g. `column-count` or flex/grid with masonry), gallery item and gap styles; later: lightbox overlay, filter bar.

---

## Risk / notes

- **Masonry:** Pure CSS (`column-count`) is simple but order is top-to-bottom per column; JS masonry (e.g. library or custom) gives left-to-right flow. Choose based on “randomised” vs “controlled” order.
- **Images:** Decide early: fixed aspect ratios (easier layout) vs true masonry with varying heights; and whether images need resized/optimised sources (e.g. thumbs + full for lightbox).
- **Filters later:** If categories are in the data from day one, filter UI can be added without migrating data.
- **Caption:** Optional field in data + hidden in DOM or shown in lightbox only keeps MVP minimal.
