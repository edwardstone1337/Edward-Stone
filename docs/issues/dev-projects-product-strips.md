# Dev Projects: Product-Style Strips

**TL;DR** — Give each project its own full-width strip. Treat each one like a product we're selling, rather than a grid of cards. Each strip has a product-style layout: screenshot left, logo + description + CTAs right, with project-specific backgrounds (e.g. gradient for Fair Share Calculator).

**Type:** feature  
**Priority:** normal  
**Effort:** medium

> **Homepage v2 note (2026-08-24).** `dev/home-v2.html` (not yet public; `index.html` is
> unchanged) points the opposite direction from this issue. Per
> `docs/superpowers/specs/2026-08-24-homepage-v2-design.md`, v2 cuts the Fair Share, Flip 7 and
> SCP Reader strips entirely rather than adding more, and even the one project-promo bar it
> tried got pulled back out again: a project card was added in `f36a81d` ("add project card,
> reorder") and then removed in `ed9b1ec` ("drop the project bar, explain quotes via
> cursor-chat, reorder"), on the grounds that the working prototype speaks for itself without a
> banner explaining it. If v2 graduates to `index.html`, this issue's "give every project its
> own strip" direction is superseded, not just parked.

---

## Current State

- Projects render in a **card grid** (`dp-card-grid`)
- All cards share the same layout: media block + title + description
- One dense grid of tiles, uniform treatment for every project

## Expected Outcome

- Each project gets its own **strip** — full-width horizontal section
- Each strip feels like a product we're selling
- **Strip layout (example: Fair Share Calculator):**
  - **Background** — Project-specific styling (e.g. nice gradient for Fair Share Calculator)
  - **Left side** — Screenshot/representation of the project (e.g. Fair Share Calculator UI)
  - **Right side** — Logo/icon, short description, primary CTA (visit, open in new tab), secondary CTA (read case study)
- **Case study pages** — Position them as "selling the product" while also explaining it; combine marketing angle with product explanation

## Relevant Files

- `assets/js/dev-projects/product-strip.js` — renders strip from config (content, media, actions); uses `utils.sanitizeUrl` / `escapeHTML`
- `assets/js/dev-projects/strip-effects.js` — cursor-reactive orbs (desktop, hover); mobile/reduced-motion use CSS only
- `assets/js/dev-projects/utils.js` — `sanitizeUrl`, `escapeHTML` (ES module); used by strip and project-card
- `assets/js/dev-projects/project-card.js` — card markup
- `assets/js/dev-projects/projects-grid.js` — grid structure; inserts strip after container when configured
- `assets/css/dev-tokens.css` — strip/button tokens (`--dp-strip-*`, `--dp-btn-min-height`, etc.)
- `assets/css/dev-styles.css` — `.dp-strip`, `.dp-strip-inner`, media/content/actions, responsive
- `index.html` — container, strip config, noscript fallback

## Implemented: Responsive pattern (reuse for future strips)

- **Desktop:** Two columns — media (col 1, full height), content + actions (col 2). Inner max-width 1100px, `--dp-strip-gap`.
- **Mobile (≤768px):** Single column. Order: **copy first** (intro), **device** (fixed 9:16, max-width 280px, centered), **CTA last**. Content and device centered; actions full-width stacked with `--dp-space-4` (16px) gap. Strip padding/gap use `--dp-space-*` (8px grid).
- **Buttons:** `--dp-btn-min-height` 48px (a11y touch). Strip DOM: `inner` = content, media, actions (actions not inside content).

## Notes / Risks

- Strips are more vertical (longer scroll) than a compact grid — intentional for "product" feel
- Alternating strip layouts improve scannability and visual interest
