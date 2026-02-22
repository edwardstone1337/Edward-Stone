# Gallery filter by category and/or project

**Type:** feature  
**Priority:** normal  
**Effort:** medium (est. half-day+)  

---

## TL;DR

Add filter controls to the gallery page so visitors can narrow by category (e.g. UX/UI, Illustration, Branding, Photography) and/or by project (e.g. Inquisitive, Prang Out, PlaySport, Elton John). Enables project-specific views (e.g. “Prang Out” gallery) and reduces scope creep from adding project imagery without a way to focus on it.

---

## Context

- No current gallery images are tagged for Prang Out; adding them would mix everything in one grid.
- Filtering was raised as a follow-on from the Prang Out page task and parked to avoid scope creep. This ticket captures it as a separate, well-scoped feature.

---

## Current state

- **Data:** `assets/data/gallery.json` has a `categories` array per image (e.g. `["branding","logo","playsport"]`). No dedicated `project` field; some categories are project names (e.g. `playsport`).
- **DOM:** `assets/js/dev-projects/gallery.js` already renders each item with `data-categories` (JSON array) on `.dp-gallery-item`. No filter UI; no URL state.
- **Gallery workflow:** `docs/gallery-workflow.md` documents categories; script accepts comma-separated categories. Could be extended for a `project` (or `projects`) field if we want project-first filtering.

---

## Expected outcome

- **Filter UI:** Controls above or beside the grid (e.g. pills, dropdown, or toggle group) for:
  - **By category:** e.g. UX/UI, Illustration, Branding, Photography (align with existing + any new taxonomy).
  - **By project (optional):** e.g. Inquisitive, Prang Out, PlaySport, Elton John — requires a `project` (or `projects`) field in `gallery.json` and in `gallery-add.sh` if we want project-based filtering.
- **Behaviour:** Selecting a filter shows only matching items; “All” shows everything. Show/hide with animation (e.g. opacity/height) so layout doesn’t jump.
- **URL state (optional but recommended):** e.g. `gallery.html?category=illustration` or `?project=prang-out` so filtered views are shareable and back/forward work.
- **Accessibility:** Filter controls keyboard- and screen-reader friendly; live region or aria updates when results change; WCAG AAA preserved.

---

## Relevant files

- `gallery.html` — optional container for filter UI (e.g. above `#gallery-grid`).
- `assets/css/gallery.css` — filter control styles, any show/hide transition for grid items.
- `assets/js/dev-projects/gallery.js` — filter logic, reading `data-categories` (and `data-project` if added), toggling visibility; optional URL read/write (e.g. `URLSearchParams`).
- `assets/data/gallery.json` — add `project` or `projects` per image if project filter is in scope; keep categories for type (UX/UI, Illustration, etc.).
- `scripts/gallery-add.sh` — if project filter is added, extend to accept and store project (e.g. optional 5th argument).
- `docs/gallery-workflow.md` — document category vs project taxonomy and script usage.

---

## Notes / risks

- **Taxonomy:** Decide whether “project” is a first-class field or derived from categories. First-class keeps “Prang Out”, “PlaySport”, etc. clear and avoids overloading categories.
- **Performance:** Filtering in the DOM (show/hide) is fine for current image count; if the gallery grows large, consider re-render or virtualisation.
- **Deep links:** URL state implies parsing on load and applying filter before first paint so the initial view matches the URL.
- **Effort:** At least half-day: filter UI, show/hide animation, URL state, and data/schema if project is added.
