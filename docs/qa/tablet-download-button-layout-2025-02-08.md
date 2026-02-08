# Tablet download button layout — diagnostic report

**Date:** 2025-02-08  
**Scope:** Resume section at 768px, 900px, 1024px viewport widths. Findings only — no fixes.

---

## 1. Which download buttons are visible; `display` computed value

There are two instances:

- **Desktop:** button inside `.dp-resume-intro` (first column of `.dp-resume-layout`).
- **Mobile:** block `.dp-resume-mobile-download` (sibling below `.dp-resume-layout`, contains its own download widget).

Breakpoint in CSS is a single **`@media (max-width: 768px)`**. No other width-dependent rules affect these.

| Viewport width | `.dp-resume-intro` (desktop button container) | `.dp-resume-mobile-download` (mobile block) |
|----------------|-------------------------------------------------|---------------------------------------------|
| **768px**      | **Visible.** `display: flex` (unchanged). Intro is first row in single-column layout; button is in flow. | **Visible.** `display: flex` (overrides base `display: none` in the 768px media block). |
| **900px**      | **Visible.** `display: flex`. Intro is left column of 2-col grid. | **Hidden.** `display: none` (base rule; 768px media does not apply). |
| **1024px**     | **Visible.** `display: flex`. Same as 900px. | **Hidden.** `display: none`. |

So:

- **768px:** Both download buttons are visible (intro + mobile block).
- **900px and 1024px:** Only the desktop button inside `.dp-resume-intro` is visible; `.dp-resume-mobile-download` is not shown.

*(Computed values inferred from cascade; no `display: none` or `visibility: hidden` is applied to `.dp-resume-intro` at any width.)*

---

## 2. At 900px: `.dp-resume-layout` computed layout

- **`grid-template-columns`:**  
  `280px 1fr` (desktop rule; 768px media does not apply).

- **Section / layout width:**  
  - `.dp-resume-section` padding: `var(--dp-space-20)` vertical, `var(--dp-space-6)` horizontal → 24px left + 24px right.  
  - Content width at 900px viewport: **900 − 48 = 852px**.  
  - `.dp-resume-layout` has `max-width: calc(280px + var(--dp-space-12) + 210mm)` → 280 + 48 + 210mm. With 210mm ≈ 793.7px that’s ~1121.7px, so the layout is limited by the viewport: **852px**.

- **Column widths at 900px:**  
  - Intro column: **280px** (fixed).  
  - Gap: **48px** (`--dp-space-12`).  
  - Page wrapper column: **852 − 280 − 48 = 524px**.

- **A4 page (max-width: 210mm) fit:**  
  - `.dp-resume-container` has `max-width: 210mm` (~793.7px).  
  - It lives in the second column, which is **524px** at 900px.  
  - So the A4 area is **squeezed**: it gets 524px, not its full 793.7px.

---

## 3. At 900px: Position of the visible download button(s)

- **Desktop button (inside `.dp-resume-intro`):**  
  In the left grid column (280px), below the intro heading and body. It does **not** overlap the resume container and is **not** outside the viewport. It sits in normal flow in the first column; placement is consistent with the grid.

- **Mobile block (`.dp-resume-mobile-download`):**  
  **Not visible** at 900px (`display: none`), so no position to report.

So at 900px the only visible download control is the intro one; it is in the left column and is not overlapping or floating oddly — the main issue at tablet widths is the **single breakpoint at 768px**: between 769px and ~1024px the layout is already “desktop” (2 columns, fixed 280px + 1fr) while the viewport is still narrow, so the A4 column is squeezed and there is no tablet-specific layout or second download placement.

---

## 4. Visual state at 900px (light and dark)

- **Light theme (observed):**  
  Two-column layout: left column “Resume” / “Experience & Skills” + body copy + purple “Download Resume” button; right column is the resume card (paper-style). The resume card is narrower than full A4 width and fits in the 524px column; text wraps inside the card. Button is clearly in the intro column, not overlapping the card.

- **Dark theme (inferred):**  
  Same structure; only colors change (dark background, light text, card and button restyled per theme). Layout and button position are unchanged; no overlap or viewport escape.

---

## 5. Summary

| Item | Finding |
|------|--------|
| **768px** | Both buttons visible (intro + mobile). Single-column layout. |
| **900px, 1024px** | Only intro button visible; mobile block hidden. Two-column grid 280px + 1fr. |
| **900px grid** | `grid-template-columns: 280px 1fr`; intro ≈ 280px, page column ≈ 524px (viewport 900px). |
| **A4 at 900px** | Squeezed: container gets 524px vs max 210mm (~794px). |
| **Button position at 900px** | Single (intro) button in left column; not overlapping, not off-viewport; layout is just the desktop grid on a narrow viewport. |

**Root cause (diagnostic):** A single breakpoint at 768px. Between 769px and ~1024px the layout behaves as desktop (fixed 280px column + 1fr) so the right column is narrow and the A4 area is squeezed; there is no tablet-specific breakpoint or rules for the download blocks.
