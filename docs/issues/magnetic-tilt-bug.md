# Magnetic-tilt bug

**Type:** bug  
**Priority:** normal  
**Effort:** small  

---

## TL;DR

Fix a bug in the magnetic tilt effect (`.dp-magnetic-tilt`) — behaviour is incorrect, jarring, or broken in some context. Details to be confirmed; capture and fix.

---

## Current state

- `magnetic-tilt.js` provides cursor-following 3D tilt for `.dp-magnetic-tilt` elements (e.g. avatar on homepage).
- Bug observed: [describe specific behaviour — e.g. wrong axis, jank on scroll, broken on mobile, conflict with other transforms].
- `assets/js/dev-projects/magnetic-tilt.js` — IIFE, respects `prefers-reduced-motion`.

---

## Expected outcome

- Magnetic tilt works correctly in the affected scenario(s).
- No regression for `prefers-reduced-motion` users (effect disabled).
- Clean, smooth interaction within WCAG motion guidelines.

---

## Relevant files

- `assets/js/dev-projects/magnetic-tilt.js`
- `assets/css/dev-styles.css` — `.dp-magnetic-tilt` (L813+), responsive overrides (L2566)
- `index.html` — `.dp-magnetic-tilt.dp-avatar-wrap` usage

---

## Notes / risks

- Tilt uses `transform`; conflicts possible with other transform-based effects (e.g. avatar easter-egg, `dp-reveal`).
- Test on touch devices — `mousemove`/`mouseleave` may not fire as expected; consider pointer events if needed.
