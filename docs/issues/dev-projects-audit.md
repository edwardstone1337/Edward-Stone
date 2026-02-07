# Dev Projects Diagnostic Audit

**Page:** `dev-projects.html`  
**Styles:** `dev-styles.css`, `dev-tokens.css`  
**Date:** 2025-02-07

---

## Issue 1 — Card flicker on page load

### 1a. When cards are first injected, do they have `dp-reveal` immediately?

**No. There is a gap.**

**Sequence:**
1. `DPProjectsGrid.init('projects-container')` runs on `DOMContentLoaded`.
2. `renderGrid` starts `fetch('assets/data/projects.json')` — async.
3. When fetch resolves: `container.innerHTML = html` runs synchronously.
4. `project-card.js` generates cards with **only** `class="dp-card"` — no `dp-reveal`.
5. DOM mutates (container gets new children).
6. `MutationObserver` callback is **queued as a microtask**.
7. When the microtask runs, it adds `dp-reveal` and `data-reveal-delay` to each card.

**Answer:** Cards are injected **without** `dp-reveal`. The MutationObserver adds it in a subsequent microtask. Theoretically, microtasks run before the next paint, so there *may* be no visible frame — but browser paint timing can vary (speculative paint, rAF, layout thrash). A single frame where cards render at full opacity (no `dp-reveal`) before the observer runs would cause the flicker.

---

### 1b. Exact MutationObserver code (from `dev-projects.html` init script)

```javascript
var mo = new MutationObserver(function () {
  var cards = document.querySelectorAll('.dp-card');
  for (var i = 0; i < cards.length; i++) {
    if (!cards[i].classList.contains('dp-reveal')) {
      cards[i].classList.add('dp-reveal');
      cards[i].setAttribute('data-reveal-delay', String(300 + (i * 100)));
    }
  }
  if (window.DPEffectsObserveReveals) window.DPEffectsObserveReveals();
});
mo.observe(container, { childList: true, subtree: true });
```

---

### 1c. Initial opacity and animation state of `.dp-card::after` (shimmer)

From `dev-styles.css`:

```css
.dp-card::after {
  /* ... */
  animation: dp-shimmer 4s ease-in-out infinite;
  opacity: 0;
  transition: opacity var(--dp-duration-slow) var(--dp-ease-out);
}
```

- **Initial opacity:** `0` — shimmer is invisible.
- **Animation:** `dp-shimmer` runs regardless of opacity. The pseudo-element animates `background-position` continuously. Opacity only affects visibility; the animation still runs.
- **When card first appears (without `dp-reveal`):** The card has default `opacity: 1`; `::after` has its own `opacity: 0`, so shimmer is not visible.
- **When `dp-reveal` is added:** `.dp-card` gets `opacity: 0` and `transform: translateY(20px)`. The entire card (including `::before` and `::after`) is hidden. The shimmer animation continues to run but is not visible.

---

### 1d. Is there a frame where the card is visible (opacity: 1, no `dp-reveal`) before the MutationObserver fires?

**Possibly yes.** Microtasks run before the next "update the rendering" step per spec. However:

- `innerHTML` assignment mutates the DOM and schedules the observer callback.
- If the browser performs an incremental or speculative paint after the sync DOM update but before the microtask queue is fully drained, the user could see cards at `opacity: 1` for one frame.
- Script load order and fetch timing can also affect when the first paint happens relative to the observer callback.

**Conclusion:** A one-frame flash is plausible and matches the reported flicker. The race is between the next paint and the MutationObserver microtask.

---

## Issue 2 — Text size and contrast audit

**Rem base:** 16px (default).  
**Breakpoints:** Desktop (default), 768px, 480px.

---

### 2a. Text elements — computed styles

| Element | Breakpoint | font-size (px) | font-weight | line-height | color (resolved) |
|---------|------------|----------------|-------------|-------------|------------------|
| `.dp-overline` | Desktop | 12 | 600 | 1.25 | Dark: #95A2B3, Light: #5A6170 |
| | 768px | 12 | 600 | 1.25 | (same) |
| | 480px | 12 | 600 | 1.25 | (same) |
| `.dp-hero-heading` | Desktop | 48 | 800 | 1.15 | Gradient (see 2c) |
| | 768px | 40 | 800 | 1.15 | (same) |
| | 480px | 32 | 800 | 1.15 | (same) |
| `.dp-hero-body` | Desktop | 20 | 400 | 1.6 | Dark: #95A2B3, Light: #5A6170 |
| | 768px | 20 | 400 | 1.6 | (same) |
| | 480px | 16 | 400 | 1.6 | (same) |
| `.dp-card-title` | All | 20 | 600 | 1.25 | Dark: #F7F8F8, Light: #18181B |
| `.dp-card-description` | All | 14 | 400 | 1.6 | Dark: #95A2B3, Light: #5A6170 |
| `.dp-empty` | All | 14 | 400 | 1.5 | Dark: rgba(255,255,255,0.40), Light: rgba(0,0,0,0.45) |
| `.dp-skip-link` | All | 14 | 500 | 1.5 | var(--dp-raw-white) on var(--dp-accent) |

**Token resolution:**
- `--dp-text-xs`: 0.75rem = 12px  
- `--dp-text-sm`: 0.875rem = 14px  
- `--dp-text-base`: 1rem = 16px  
- `--dp-text-lg`: 1.25rem = 20px  
- `--dp-text-4xl`: 3rem = 48px  
- `--dp-text-3xl`: 2.5rem = 40px  
- `--dp-text-2xl`: 2rem = 32px  
- `--dp-leading-snug`: 1.25, `--dp-leading-tight`: 1.15, `--dp-leading-relaxed`: 1.6, `--dp-leading-normal`: 1.5  

---

### 2b. Background colors for text elements

**Hero area (`.dp-hero-heading`, `.dp-hero-body`):**

| Theme | Variable | Resolved hex |
|-------|----------|--------------|
| Dark | `--dp-bg-base` | #08090A |
| Light | `--dp-bg-base` | #FFFFFF |

**Card area (`.dp-card-title`, `.dp-card-description`):**

Card background: `--dp-bg-card` over `--dp-bg-base`.

| Theme | `--dp-bg-card` | Composited over base | Effective background |
|-------|----------------|----------------------|----------------------|
| Dark | rgba(255,255,255,0.03) | #08090A | ~#0F1011 |
| Light | rgba(0,0,0,0.02) | #FFFFFF | ~#FAFAFA |

---

### 2c. Contrast ratios (WCAG 2.1)

**AA:** 4.5:1 normal text, 3:1 large text (≥18px bold or ≥24px regular).

| Pair | Dark theme | Light theme | WCAG AA |
|------|------------|-------------|---------|
| `.dp-overline` vs `--dp-bg-base` | ~8:1 | ~6.7:1 | Pass |
| `.dp-hero-heading` (gradient end `--dp-gradient-text-to`) vs `--dp-bg-base` | ~12:1 (rgba(255,255,255,0.55) on #08090A) | ~3.9:1 (rgba(0,0,0,0.55) on #FFFFFF) | Pass (large text) |
| `.dp-hero-body` vs `--dp-bg-base` | ~8:1 | ~6.7:1 | Pass |
| `.dp-card-title` vs composited card bg | ~19:1 | ~15:1 | Pass |
| `.dp-card-description` vs composited card bg | ~7.9:1 | ~6.7:1 | Pass |
| `.dp-empty` vs `--dp-bg-base` | ~5.7:1 (effective tertiary) | ~1.8:1 (rgba(0,0,0,0.45) on white) | **FAIL** (light theme) |
| `.dp-skip-link` | White on accent (#5E6AD2) — typically >4.5:1 | (same) | Pass |

**Flag:** `.dp-empty` in light theme — tertiary text `rgba(0,0,0,0.45)` on white yields ~1.8:1 contrast, below 4.5:1 for normal text.

---

### 2d. WCAG minimum font size check (below 12px)

| Element | Desktop | 768px | 480px | Below 12px? |
|---------|---------|-------|-------|-------------|
| `.dp-overline` | 12px | 12px | 12px | No (exactly 12px) |
| `.dp-hero-heading` | 48px | 40px | 32px | No |
| `.dp-hero-body` | 20px | 20px | 16px | No |
| `.dp-card-title` | 20px | 20px | 20px | No |
| `.dp-card-description` | 14px | 14px | 14px | No |
| `.dp-empty` | 14px | 14px | 14px | No |
| `.dp-skip-link` | 14px | 14px | 14px | No |

**Result:** No text falls below 12px at any breakpoint. `.dp-overline` is exactly 12px.

---

## Summary

| Issue | Finding |
|-------|---------|
| **1. Card flicker** | Cards are injected without `dp-reveal`; MutationObserver adds it in a microtask. A one-frame flash is plausible before the observer runs. |
| **2c. Contrast** | `.dp-empty` in light theme fails WCAG AA (tertiary text on white ~1.8:1). |
| **2d. Font size** | All text ≥12px. |
