# Task: Diagnose missing animated border on resume container at 1280px

**Date:** 2025-02-08  
**Scope:** At 1280px viewport width, hovering over `.dp-resume-container` should show a cursor-tracking radial glow at the 1px border edge — nothing visible happens.  
**No fixes — findings only.**

---

## Summary

Diagnostics were run via a test page and browser automation. The observed behavior points to the `@media (max-width: 1080px)` rules being active when the glow is expected. Root cause: **either the effective viewport at 1280px is actually ≤1080px, or `prefers-reduced-motion: reduce` is enabled** (which disables the glow).

---

## 1. Computed styles on `.dp-resume-container` at 1280px

### Expected (base rules, viewport > 1080px)

From `dev-styles.css` lines 1219–1232:

| Property      | Expected value                                      |
|---------------|-----------------------------------------------------|
| position      | `relative`                                          |
| overflow      | `hidden`                                            |
| padding       | `1px`                                               |
| background    | `var(--dp-paper-border)` → `rgba(255,255,255,0.08)` (dark) or `rgba(0,0,0,0.06)` (light) |
| border-radius | `var(--dp-radius-sm)`                               |
| box-shadow    | `var(--dp-paper-shadow)`                            |

### Observed (from diagnostic run)

When the glow is missing, the diagnostic showed:

- **position:** `relative`
- **overflow:** `hidden`
- **padding:** `0px` ← overridden by 1080px rules
- **background:** `rgba(0, 0, 0, 0) none` ← transparent; 1080px override
- **border-radius:** `0px` ← 1080px override
- **box-shadow:** `none` ← 1080px override

Conclusion: When the glow is missing, the `@media (max-width: 1080px)` block is active. At a true 1280px viewport, these overrides should not apply.

---

## 2. The `::before` pseudo-element

### Expected (base rules)

From `.dp-resume-page-wrapper .dp-resume-container::before` (lines 1405–1419):

| Property   | Expected value |
|------------|----------------|
| opacity    | `0` (non-hover) → `1` (hover) |
| position   | `absolute`     |
| inset      | `0`            |
| background | `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--dp-accent-glow), transparent 40%)` |
| z-index    | `1`            |
| display    | default (not `none`) |

### Observed

- **opacity:** `0` (correct when not hovered)
- **position:** `absolute`
- **inset:** `0px`
- **z-index:** `1`
- **display:** `none` ← critical: this comes from `@media (max-width: 1080px)` or `@media (prefers-reduced-motion: reduce)`

### Rules that set `display: none` on `::before`

1. `@media (max-width: 1080px)` (line 1647–1649):
   ```css
   .dp-resume-container::before {
     display: none;
   }
   ```

2. `@media (prefers-reduced-motion: reduce)` (line 1821–1823):
   ```css
   .dp-resume-container::before {
     display: none;
   }
   ```

If `display: none` is applied, the glow cannot appear regardless of opacity or `--mouse-x`/`--mouse-y`.

### Inline styles `--mouse-x` and `--mouse-y`

Set by `effects.js` (lines 59–67) on `.dp-resume-page-wrapper .dp-resume-container` on `mousemove`, and removed on `mouseleave`. The JS runs only when `(hover: hover)` matches (line 33). If `--mouse-x` and `--mouse-y` are never set, either the element is not being hovered or `(hover: hover)` is false.

---

## 3. The masking layer `.dp-resume-page`

From lines 1235–1247:

| Property      | Value |
|---------------|-------|
| z-index       | `2`   |
| background    | `var(--dp-paper-surface)` (opaque) |
| position      | `relative` |
| border-radius | `calc(var(--dp-radius-sm) - 1px)` |
| overflow      | `hidden` |

`.dp-resume-page` sits above the `::before` layer (z-index 2 vs 1) and fully covers the content area with an opaque background. The glow is only visible in the 1px border gap between the container edge and `.dp-resume-page`. That design is correct; the problem is that `::before` is hidden by `display: none`.

---

## 4. JS execution check

From `effects.js`:

- Line 33: `if (!window.matchMedia('(hover: hover)').matches) return;` — cursor glow is not initialized on touch-only devices.
- Lines 56–68: resume container mousemove/mouseleave handlers attach to `.dp-resume-page-wrapper .dp-resume-container`.

Diagnostic console script (run at 1280px with resume in view):

```javascript
const rc = document.querySelector('.dp-resume-page-wrapper .dp-resume-container');
console.log('Element found:', !!rc);
console.log('Has position relative:', getComputedStyle(rc).position);
console.log('Has overflow hidden:', getComputedStyle(rc).overflow);
console.log('Padding:', getComputedStyle(rc).padding);

rc.addEventListener('mousemove', (e) => {
  console.log('mousemove fired, --mouse-x:', rc.style.getPropertyValue('--mouse-x'));
}, { once: true });

console.log('::before opacity:', getComputedStyle(rc, '::before').opacity);
console.log('::before display:', getComputedStyle(rc, '::before').display);
console.log('::before width:', getComputedStyle(rc, '::before').width);
console.log('::before height:', getComputedStyle(rc, '::before').height);
console.log('::before background:', getComputedStyle(rc, '::before').background);
```

Expected if working:

- `Element found: true`
- `position: relative`
- `overflow: hidden`
- `Padding: 1px`
- On hover: `mousemove fired, --mouse-x: <value>px`
- `::before opacity: 0` (non-hover) or `1` (hover)
- `::before display:` something other than `none`

---

## 5. After-hover checks

```javascript
console.log('After hover --mouse-x:', rc.style.getPropertyValue('--mouse-x'));
console.log('After hover --mouse-y:', rc.style.getPropertyValue('--mouse-y'));
console.log('::before opacity on hover:', getComputedStyle(rc, '::before').opacity);
```

If working: `--mouse-x` and `--mouse-y` are set (e.g. `"123px"`), and `::before opacity` is `1`. If `::before display` is `none`, the glow still won’t be visible.

---

## 6. Compare with `.dp-card`

**Note:** On `index.html`, the projects grid (`#projects-container`) is commented out (Phase 1 MVP). There are no `.dp-card` elements on the live page, so this comparison must be done on `dev/component-preview.html` or another page that renders cards.

For reference, `.dp-card::before` (lines 1655–1669) uses the same radial gradient pattern. Cards receive `--mouse-x`/`--mouse-y` from the grid’s `mousemove` handler (effects.js 38–45). The resume container has its own handler (56–68).

---

## 7. Conflicting rules and `prefers-reduced-motion`

### Cascade summary

| Rule | Location | Media | Effect |
|------|----------|-------|--------|
| `.dp-resume-page-wrapper .dp-resume-container::before` | 1405–1419 | none | Defines glow (opacity 0, radial gradient, z-index 1) |
| `.dp-resume-page-wrapper .dp-resume-container:hover::before` | 1421–1423 | none | `opacity: 1` on hover |
| `.dp-resume-container::before` | 1647–1649 | `max-width: 1080px` | `display: none` |
| `.dp-resume-container::before` | 1821–1823 | `prefers-reduced-motion: reduce` | `display: none` |

When viewport ≤1080px or `prefers-reduced-motion: reduce` is active, `display: none` hides the pseudo-element. No other rules override this.

### Struck-through / overridden rules

In DevTools, with `.dp-resume-container` selected and the `::before` pseudo-element shown, check:

- Whether `.dp-resume-container::before { display: none }` appears (and from which media block).
- Whether `prefers-reduced-motion: reduce` is active in the browser or OS.

---

## 8. Root cause analysis

The glow disappears when one of these is true:

1. **Viewport ≤ 1080px**  
   `@media (max-width: 1080px)` hides the `::before` and removes the border styling.

2. **`prefers-reduced-motion: reduce`**  
   `@media (prefers-reduced-motion: reduce)` hides the `::before`.

3. **`(hover: hover)` is false**  
   Effects.js exits early and never attaches mousemove handlers, so `--mouse-x`/`--mouse-y` are never set.

4. **Effective viewport ≠ reported viewport**  
   Zoom, browser chrome, or layout tools can make the effective width ≤1080px even when the reported width is 1280px.

---

## 9. Diagnostic page

A diagnostic page was added at `docs/qa/resume-border-diagnostic.html`. It:

- Loads the same CSS/JS as the main site
- Contains the resume structure
- Logs computed styles to `#diag-output`
- Updates with hover state when the user hovers the resume

To use:

1. Serve the project (e.g. `python3 -m http.server 8765` from project root).
2. Open `http://localhost:8765/docs/qa/resume-border-diagnostic.html`.
3. Set viewport to 1280px width.
4. Scroll so the resume is visible.
5. Check `#diag-output` for computed values.
6. Hover over the resume and see the “AFTER HOVER” section.

---

## 10. Recommended verification steps

1. **Confirm viewport**  
   Run `console.log(window.innerWidth)` at 1280px; it should be > 1080.

2. **Confirm reduced motion**  
   Run `console.log(window.matchMedia('(prefers-reduced-motion: reduce)').matches)`; it should be `false` for the glow to appear.

3. **Confirm hover capability**  
   Run `console.log(window.matchMedia('(hover: hover)').matches)`; it should be `true`.

4. **Confirm `::before` display**  
   Run `getComputedStyle(document.querySelector('.dp-resume-page-wrapper .dp-resume-container'), '::before').display`; it should not be `none`.

If all of these pass and the glow still doesn’t appear, the next step is to inspect the radial gradient and z-index stacking in more detail.
