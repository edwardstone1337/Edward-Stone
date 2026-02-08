# Strips: Less body text, focus on headlines

**TL;DR** — Strip content should carry less description copy and put emphasis on the headline/lead line. Headlines do the work; body text is minimal or optional.

**Type:** improvement  
**Priority:** normal  
**Effort:** small

---

## Current state

- Strips include a full **description** paragraph (`.dp-strip-description`) under the title
- Example (Fair Share): long sentence explaining the tool, income split, proportional split, etc.
- Headline + overline + badges + description + CTA — copy-heavy

## Expected outcome

- **Headlines/lead lines** are the main message — punchy, scannable
- **Body text** is shortened or removed: one short line max, or no description at all
- Strip feels “headline-first”; details live on the linked page or case study

## Relevant files

- `index.html` — strip markup (Fair Share, Kaomoji, SCP): `.dp-strip-title`, `.dp-strip-description`
- `assets/css/dev-styles.css` — `.dp-strip-description` styling; consider hiding or constraining in compact strips
- `assets/js/dev-projects/product-strip.js` — if strips are ever rendered from config, description field usage

## Notes

- Aligns with compact strip variant (`.dp-strip--compact`) and centered content; less text fits that layout better
- Copy changes only for existing strips; optional: add a “no description” variant or max line count in DS
