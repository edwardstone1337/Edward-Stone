# Square component previews for case study cards

**Type:** feature  
**Priority:** normal  
**Effort:** large  

---

## TL;DR

Replace (or add alongside) the optional image on case study cards with a **square, fixed-aspect container** that shows a small simulated UI component themed to that case study (e.g. mini Planner for “features users return”). Each preview has its own styling, scripts, and optional animation; code can be borrowed from the actual product sites and trimmed for the square.

---

## Current state

- Case study cards are rendered by `CaseStudiesSection.init('case-studies-container', { caseStudies: [...] })`.
- Each item: `title`, `description`, `href`, optional `imagePath`, `imageAlt`, `metrics`.
- Homepage currently uses `imagePath: ''` → card has no image, text + CTA only.
- When `imagePath` is set: full-width `.case-study-image` (height: auto), no fixed aspect ratio.
- Nav only runs if `#nav-container` exists → previews can “hide” nav by not rendering that container (no code change needed).
- Case study pages are static + screenshots; no live embedded product UI in repo yet.

---

## Expected outcome

- Case study cards can show a **square** (e.g. 1:1) area containing a themed, optionally interactive “simulated component” instead of (or in addition to) a static image.
- Per–case study: which preview to show + optional theme/id (e.g. `planner-mini`, `inquisitive`).
- Preview CSS/JS is isolated so one preview doesn’t affect others or the rest of the site.
- Theming (colors, fonts, motion) matches the case study / product.
- Fallback when no preview is defined or load fails: keep current behaviour (no image or existing `imagePath`).
- Previews never show site nav (iframe = no nav; inline/shadow = no nav container).

---

## Relevant files

- **`assets/js/components/case-study-card.js`** — Support a `preview` slot: when `preview` is set, render square container (iframe or div + shadow/inline); keep card layout (square on top, then title/description/CTA).
- **`index.html`** — Case study config: add `preview` field (e.g. `preview: { type: 'component', id: 'planner-mini', theme: 'inquisitive' }` or `preview: { url: 'previews/planner.html' }`).
- **`assets/css/style.css`** — Styles for square container (aspect ratio, overflow), and any card layout tweaks for the preview slot.
- **New:** `assets/previews/<id>/` or `dev/previews/<id>/` — Per-preview: `snippet.html`, `preview.css`, `preview.js` (optional), theme overrides as needed.

---

## Implementation approaches

| Approach | How | Pros | Cons |
|----------|-----|------|------|
| **A. Iframe per preview** | Square `<iframe src="previews/planner.html">` | Strong isolation; own CSS/JS/fonts; no nav. | Responsive square sizing; sharing tokens with main site is manual. |
| **B. Inline + scoped CSS** | Square `<div>`, inject HTML, load preview CSS/JS with BEM/data-attrs | Single doc; can use shared tokens. | Risk of global clashes; strict scoping. |
| **C. Shadow DOM** | Wrapper with `attachShadow`; render preview inside; inject CSS/JS into shadow root | Isolation + same document; can inherit/re-apply tokens. | Fonts/tokens need passing or re-declaring in shadow. |

Choose A/B/C after resolving scope questions below.

---

## Decisions / scope (to lock before implementation)

1. **Where do previews appear?** Homepage cards only, or also a case study index / dev preview page?
2. **One preview per case study?** Or can one case study have multiple squares / carousel?
3. **Interaction level:** Purely visual (decorative) or interactive (tabs, toggles, hover) to show real UI behaviour?
4. **Source of “actual” code:** External product sites (copy into repo and trim) or existing in-repo code to reuse?
5. **Aspect ratio:** 1:1 only, or allow e.g. 4:3 per preview?
6. **Fallback:** No preview / load fail → current behaviour (no image or `imagePath`)? *(Assumed yes.)*
7. **Nav in previews:** Never show nav in square previews (iframe or no nav container). *(Assumed yes.)*

---

## Risk / notes

- Iframe: cross-origin and token sharing add complexity; ensure square aspect ratio is robust (e.g. `aspect-ratio: 1` + max-height or padding trick).
- Inline/Shadow: avoid global class names; consider a single “preview registry” that loads the right snippet + assets per `preview.id` to avoid loading every preview on the page at once.
- First preview (e.g. Planner) can drive the pattern; document the schema and file layout once decided.
