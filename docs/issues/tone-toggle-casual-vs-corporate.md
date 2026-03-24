# Tone Toggle — Casual vs Corporate

**TL;DR** — Add a toggle that switches all site copy between **Corporate** (current default) and **Casual** mode. Same layout, same structure — just a personality switch for the voice.

**Type:** feature
**Priority:** normal
**Effort:** large

---

## Current State

- All copy is fixed in a formal/corporate register across every public page.

## Expected Outcome

- A toggle (in the nav actions area) lets visitors flip between Corporate and Casual voice and back.
- Preference is saved to `localStorage` (`dp-tone`) so repeat visitors get their preferred register on return.
- Default remains **Corporate** — preserves the current experience for first-time visitors.
- Layout, structure, and visual design are completely unchanged; only the language differs.

## Relevant Files

- `assets/js/dev-projects/theme-toggle.js` — closest existing pattern (localStorage-backed toggle injected into nav actions)
- `assets/js/dev-projects/nav-component.js` — toggle button would live in `#dp-nav-actions`
- `index.html` — primary page with the most copy to swap; other public pages to follow

## Notes / Risks

- Copy strings must be maintained in two voices — added authoring overhead any time copy changes.
- Scope question open: homepage + nav only, or all public pages including case studies?
- Needs an `aria-live` region so screen readers announce the switch; toggle button `aria-label` must update on state change.
- Could itself serve as a portfolio showcase piece — demonstrates JS + UX craft in one feature.
