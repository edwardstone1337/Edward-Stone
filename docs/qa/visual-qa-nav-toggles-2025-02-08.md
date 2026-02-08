# Visual QA Report: Nav Bar & Toggles (Phases 1 & 2)

**Date:** 2025-02-08  
**Viewports tested:** 1200px × 800px, 480px × 800px  
**Pages:** `index.html`, `404.html`  
**Themes:** Light (verified), Dark (code/implementation verified; full visual check recommended)

---

## Summary

| Check | index.html | 404.html |
|-------|------------|----------|
| Nav bar visible, "Edward Stone" left | ✅ Pass | ✅ Pass |
| Toggles on right (theme; snake at ≥768px only) | ✅ Pass | ✅ Pass |
| No overlap with hero/main content | ✅ Pass | N/A (no hero) |
| Nav resizes at 480px | ✅ Pass | ✅ Pass |
| Snake toggle hidden at 480px | ✅ Pass (CSS: hidden ≤768px) | ✅ Pass |
| Name still visible at 480px | ✅ Pass | ✅ Pass |
| Content centred below nav | N/A | ✅ Pass |
| Back-to-top after ~1 viewport scroll | ✅ Pass | N/A (no BTT on 404) |
| Light theme | ✅ Pass | ✅ Pass |
| Dark theme | ⚠️ Recommend manual check | ⚠️ Recommend manual check |

---

## 1. index.html

### 1.1 1200px width (light theme)

- **Nav bar:** Visible; full-width strip at top.
- **Left:** Logo + "Edward Stone" present and legible.
- **Right:** Theme toggle (moon icon) visible. Snake toggle is present in DOM and shown at this width (hidden only at `max-width: 768px` in CSS).
- **Overlap:** No overlap between nav and hero. Hero (avatar, "Learning by doing", heading, body) starts clearly below the nav with clear separation.
- **Hero:** Centred; no layout issues observed.

### 1.2 480px width (light theme)

- **Nav resizing:** Nav remains visible; inner padding and height adjust per `dev-styles.css` (e.g. `padding: var(--dp-space-2) var(--dp-space-4)`, `height: 56px` at 480px).
- **Snake toggle:** Hidden (`.dp-snake-toggle { display: none; }` at `max-width: 768px`).
- **Name:** "Edward Stone" still visible; `.dp-nav-name` uses `font-size: var(--dp-text-sm)` at 480px.
- **Logo:** Smaller (28×28px at 480px).
- **Overlap:** No overlap with hero content.

### 1.3 Scroll & back-to-top (index only)

- **Behaviour:** `back-to-top.js` uses `SCROLL_THRESHOLD = window.innerHeight`; button appears after scrolling more than one viewport height.
- **Position:** Fixed bottom-right (`bottom: var(--dp-space-6)`, `right: var(--dp-space-6)`).
- **Visual:** Button (arrow up) appears in bottom-right after ~1 viewport of scroll; no conflict with content noted.

### 1.4 Themes (index)

- **Light:** Verified via screenshots — nav, hero, toggles, and content render correctly.
- **Dark:** Not toggled in this session (automation could not obtain element ref for theme button). Implementation in `theme-toggle.js` and `data-theme` styling is in place; **recommend a quick manual click of the theme toggle** to confirm dark theme on index.

---

## 2. 404.html

### 2.1 1200px width (light theme)

- **Nav bar:** Same structure as index (logo + "Edward Stone" left; toggles right). Theme toggle visible; snake toggle present in DOM at this width (404 includes both `theme-toggle.js` and `snake-game.js`).
- **Content:** Main block (404 code, title, body, "Go home") is centred horizontally and vertically below the nav. No overlap with nav.
- **Toggles:** Theme toggle present; snake toggle visible at >768px (hidden at 480px).

### 2.2 480px width (light theme)

- **Nav:** Resizes consistently with index (same nav component and CSS). "Edward Stone" remains visible with smaller type at 480px.
- **Snake toggle:** Hidden (same 768px media query).
- **Content:** 404 message and "Go home" remain centred below nav.

### 2.3 Themes (404)

- **Light:** Verified — layout and centring correct.
- **Dark:** **Recommend manual check** (toggle theme and confirm 404 content and nav in dark mode).

---

## 3. Code / implementation notes

- **Snake visibility:** `dev-styles.css` hides `.dp-snake-toggle` at `@media (max-width: 768px)`; at 480px it is always hidden.
- **404 snake CTA:** `.dp-404-snake-btn` is also hidden at 768px, so "Play Snake instead" is not shown on small viewports (by design).
- **Back-to-top:** Rendered by `back-to-top.js`; visibility driven by `scrollY > innerHeight`; smooth scroll respects `prefers-reduced-motion`.
- **Theme:** Applied via `data-theme` on `<html>`; theme toggle has `aria-label="Toggle theme"`.

---

## 4. Recommendations

1. **Manual dark theme check:** Click the theme toggle on both index and 404 at 1200px and 480px; confirm nav, hero/404 content, and toggles in dark theme.
2. **Optional:** At 1200px, confirm both theme and snake toggles are visible in the nav (screenshots highlighted theme; snake is in DOM and not hidden at that width).
3. **Optional:** After scrolling index past one viewport, confirm back-to-top is clearly visible and clickable in bottom-right in both themes.

---

*Screenshots captured during QA: index (1200 / 480 light, 1200 scrolled), 404 (1200 / 480 light).*
