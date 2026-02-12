# Lightbox — full-screen image viewer on gallery click

**Type:** feature  
**Priority:** normal  
**Effort:** medium  

---

## TL;DR

Clicking a gallery image opens a full-screen lightbox overlay showing the high-res version (`srcFull`) with optional caption and alt text. Reuses the proven overlay patterns from the resume lightbox (focus trap, escape-close, scroll lock). Keyboard navigable with arrow keys between images.

---

## Current state

- Gallery MVP is live with 9+ images in a masonry grid
- `gallery.json` already has `srcFull` and `caption` fields in the schema — currently optional/unused
- Resume lightbox (`resume-lightbox.js`) provides a proven overlay pattern: focus trap, escape-close, scroll lock, ARIA dialog, backdrop blur, AbortController cleanup
- Z-index slot at ~10000 is established for lightbox overlays
- `body.dp-overlay-active` scroll lock class exists
- No click handler on gallery items currently

---

## Expected outcome

- Click any gallery image → full-screen overlay with high-res image
- Backdrop: `--dp-bg-overlay` with `backdrop-filter: blur(8px)` (matching resume lightbox)
- Close via: close button (top-right), Escape key, backdrop click
- Arrow key / swipe navigation between images (prev/next)
- Caption displayed below image if present in JSON
- Alt text carried through to lightbox `<img>`
- Focus trap cycling through close button + nav arrows
- `prefers-reduced-motion` respected (no transition if set)
- Mobile: full-width image, swipe left/right for nav, tap-to-close on backdrop
- Graceful fallback: if `srcFull` isn't set, use `src` (thumb) in lightbox

---

## Relevant files

- **New:** `assets/js/dev-projects/gallery-lightbox.js` — overlay logic, keyboard nav, focus trap
- **Modify:** `assets/css/gallery.css` — lightbox overlay styles, responsive image sizing, caption typography
- **Modify:** `assets/js/dev-projects/gallery.js` — add click handlers on gallery items, import/init lightbox
- **Reference:** `assets/js/dev-projects/resume-lightbox.js` — pattern to follow for overlay, focus trap, cleanup

---

## Risk / notes

- **`srcFull` images don't exist yet** — need to generate 1800px wide versions of all current images before this ships. Could add to `gallery-add.sh` as a second output.
- **Navigation state** — lightbox needs to know the full image array and current index. Pass the parsed JSON array to the lightbox module on init.
- **Large images on mobile** — even 1800px wide may be overkill on mobile. Consider `srcset` on the lightbox `<img>` or just use thumb on small screens.
- **Swipe** — needs touch event handling. Keep it simple (threshold-based `touchstart`/`touchend` delta), no library.
