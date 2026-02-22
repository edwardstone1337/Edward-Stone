# Add TLDR component to case study pages

**Type:** feature  
**Priority:** normal  
**Effort:** medium  

---

## TL;DR

Add a TLDR (bullet-summary) component to case study pages so skimmers get the gist without reading the full article. Start with a static placement (top under hero on all breakpoints); optionally later add a sticky/follow-on-scroll variant for desktop.

---

## Current state

- Case study pages (Planner, Product Discovery, Design Systems) have hero + long-form article only.
- No quick summary; readers must scroll and read to understand the story.

---

## Expected outcome

- **Phase 1 (MVP):** A TLDR box with bullet-point summary of the article. Placement: directly under the hero section, same on mobile and desktop. Content: short bullets (e.g. problem, approach, outcome) authored per case study.
- **Phase 2 (optional):** On desktop only, either (a) move TLDR to a right-hand sidebar beside the prose, or (b) make it sticky and update the visible summary as the user scrolls (e.g. “In this section: …” based on the current `dp-prose-section`). Mobile keeps static top placement.
- Accessible: focus order, semantics, and WCAG AAA preserved (e.g. appropriate heading level, `aria-label` if needed).

---

## Relevant files

- `case-studies/planner.html`, `case-studies/product-discovery.html`, `case-studies/design-systems.html` — add TLDR markup (and optionally section IDs for scroll-aware variant).
- `assets/css/case-study-theme.css` (or new `assets/css/case-study-tldr.css`) — layout and styling for TLDR box; desktop grid for main + sidebar if Phase 2.
- `assets/js/dev-projects/` — optional small module for scroll-based “current section” summary (Phase 2 only). No new JS for Phase 1 if content is static HTML.

---

## Notes / risks

- **Content:** Each case study needs a curated TLDR (3–6 bullets). Decide whether to hardcode in HTML or drive from a small data structure.
- **Layout:** Current case study layout is single column. Phase 2 sidebar implies a prose + aside grid (e.g. `dp-prose` in a grid child, TLDR in the other); test with existing `dp-prose-section` and long content.
- **Sticky/follow behaviour:** If Phase 2 is “summary updates on scroll”, need clear UX so it doesn’t feel jumpy; consider debounce and clear visual tie to the current section.
