# Dev Projects: Product-Style Strips

**TL;DR** — Give each project its own full-width strip. Treat each one like a product we're selling, rather than a grid of cards.

**Type:** feature  
**Priority:** normal  
**Effort:** medium

---

## Current State

- Projects render in a **card grid** (`dp-card-grid`)
- All cards share the same layout: media block + title + description
- One dense grid of tiles, uniform treatment for every project

## Expected Outcome

- Each project gets its own **strip** — full-width horizontal section
- More like a product showcase: one project per strip, stacked vertically
- Could alternate layout per strip (e.g. media left / content right, then content left / media right)
- Feels like "here's what we're offering" — each project presented as a distinct product

## Relevant Files

- `assets/js/dev-projects/project-card.js` — card markup; may need strip variant or replacement
- `assets/js/dev-projects/projects-grid.js` — grid structure; becomes strip layout
- `assets/css/dev-styles.css` — card/grid styles; new strip styles
- `dev-projects.html` — container structure

## Notes / Risks

- Strips are more vertical (longer scroll) than a compact grid — intentional for "product" feel
- Alternating strip layouts improve scannability and visual interest
- Consider how strips behave on mobile (stack to single column naturally)
