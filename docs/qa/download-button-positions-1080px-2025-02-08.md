# Download button positions at 1080px — detailed diagnostic

**Date:** 2025-02-08  
**Viewport:** 1080px width  
**Scope:** `.dp-resume-section` DOM order, computed layout, and position of both `[data-download-widget]` instances. Findings only — no fixes.

---

## 1. Breakpoint and tokens

- **Media query:** `@media (max-width: 1080px)` in `dev-styles.css` (line 1476) **applies** at 1080px.
- **Relevant tokens:** `--dp-space-4: 16px`, `--dp-space-6: 24px`, `--dp-space-8: 32px`, `--dp-space-10: 40px`, `--dp-space-12: 48px`, `--dp-space-20: 80px`.

---

## 2. Full DOM order inside `.dp-resume-section` at 1080px

Everything below is in document order. “Computed” values are from the cascade at 1080px (max-width: 1080px block).

| # | Element / class | Computed display | text-align | justify-content | Approx. Y from section top | Width / horizontal alignment |
|---|----------------|-------------------|------------|-----------------|----------------------------|-------------------------------|
| 1 | `.dp-resume-section` | flex | (N/A) | center | 0 | full viewport minus padding; content centered |
| 2 | `.dp-resume-layout` | grid | (N/A) | (N/A) | 48px (after section padding) | 100%; 1 column, centered via section |
| 3 | `.dp-resume-intro` | flex | **center** | (N/A) | 48px | 100% of layout; **align-items: center** |
| 4 | `.dp-overline` (text "Resume") | inline / block | center | (N/A) | ~48px | content width; centered |
| 5 | `.dp-resume-intro-heading` | block | center | (N/A) | ~80px | content width; centered |
| 6 | `.dp-resume-intro-body` | block | center | (N/A) | ~140px | content width; centered |
| 7 | `.dp-resume-download` (first) `[data-download-widget]` | **flex** | (N/A) | **center** | ~220px | content width (button); **centered** in intro |
| 8 | `.dp-resume-page-wrapper` | block | (N/A) | (N/A) | ~220px + 32px gap | 100% |
| 9 | `.dp-resume-container` | flex | (N/A) | (N/A) | ~300px+ | 100%; max-width: none at 1080px |
| 10 | `.dp-resume-page` | flex | (N/A) | (N/A) | (same) | 100% |
| 11 | `.dp-resume-header` | flex → column | (N/A) | (N/A) | (same) | 100% |
| 12 | `.dp-resume-header-main`, `.dp-resume-contact`, etc. | (various) | left (header content) | (N/A) | (flow) | full width of page; left-aligned |
| … | (all resume body: section-groups, roles, sidebar, etc.) | (various) | left | (N/A) | (flow) | full width; left-aligned |
| — | **gap** (layout) | — | — | — | after last content of .dp-resume-layout | 32px vertical |
| N | `.dp-resume-mobile-download` | **flex** | (N/A) | **center** | after layout + 40px margin-top | 100%; **justify-content: center** |
| N+1 | `.dp-resume-download` (second) `[data-download-widget]` | (inherits flex from parent flow) | (N/A) | (N/A) | (after resume content + 40px) | content width; **centered** in block |

**Y positions** are approximate from section top: section padding top = 48px; layout gap = 32px; intro has gap 16px between children; intro download has margin-top 16px. Exact pixel Y depends on line-heights and font sizes.

---

## 3. Each download widget — parent, size, position, alignment

### First `[data-download-widget]` (intro)

- **Parent:** `.dp-resume-intro` (first child of `.dp-resume-layout`).
- **Computed (at 1080px):**
  - `.dp-resume-intro`: `display: flex`, `flex-direction: column`, `gap: 16px`, `text-align: center`, `align-items: center`, `position: static`.
  - `.dp-resume-intro .dp-resume-download`: `display: flex`, `justify-content: center`, `margin-top: 16px`, `position: relative`.
- **Width:** No explicit width; width is content (the button). Button is `inline-flex`; widget shrinks to fit and is centered in the intro column via `align-items: center` on `.dp-resume-intro`.
- **Position:** In normal flow: after overline, heading, body; above `.dp-resume-page-wrapper`.
- **Intended alignment:** Visually **centered** (intro is full-width with `align-items: center` and `.dp-resume-download` has `justify-content: center`).

### Second `[data-download-widget]` (mobile block)

- **Parent:** `.dp-resume-mobile-download` (sibling of `.dp-resume-layout`, directly under `.dp-resume-section`).
- **Computed (at 1080px):**
  - `.dp-resume-mobile-download`: `display: flex`, `justify-content: center`, `margin-top: 40px`.
- **Width:** Content width (same button as above).
- **Position:** In normal flow: after the entire `.dp-resume-layout` (including the full resume content), with 40px space above.
- **Intended alignment:** Visually **centered** (parent has `justify-content: center`).

**Observed (browser search at 1080px):** Two “Download Resume” matches reported at approximate positions (278, 2793) and (685, 2639). At viewport width 1080px, horizontal center ≈ 540px. One button near x=278 (left of center), one near x=685 (right of center) suggests that at least one button is **not** visually centered in the viewport at the time of the hit, or the coordinates are relative to a scrolled/transformed context. So despite CSS centering, **perceived position can feel off** (e.g. one left, one right, or both shifted).

---

## 4. `.dp-resume-intro` at 1080px — centering and width

- **Centered vs left-aligned:** At 1080px the intro is **centered**: `text-align: center`, `align-items: center`, `position: static`.
- **Computed:**
  - `text-align: center`
  - `align-items: center` (flex cross-axis)
  - `display: flex`, `flex-direction: column`, `gap: var(--dp-space-4)` (16px)
- **Width of intro block:** **100%** of `.dp-resume-layout`. At 1080px the layout is `grid-template-columns: 1fr`, `max-width: none`, so the layout (and thus the intro) is full width of the section content area. Section horizontal padding is `var(--dp-space-4)` = 16px each side, so intro width = **1080 − 32 = 1048px**. The intro block is full width; its **content** (overline, heading, body, download widget) is centered within that block.

---

## 5. What the user sees scrolling through the resume section at 1080px

1. **Top of section:** 48px top padding, then the intro block: “Resume” overline, “Experience & Skills” heading, body copy, then the **first** “Download Resume” button. All of this is centered in the column. The first button sits just below the body text with 16px margin-top and 16px gap from the next sibling.
2. **Below the first button:** 32px layout gap, then the resume content (no card chrome at 1080px): header (name, tagline, summary, contact), then experience and sidebar content, all left-aligned in a single column. This block is long and scrollable.
3. **After the resume content:** 40px margin-top, then the **second** “Download Resume” button inside `.dp-resume-mobile-download`, intended to be centered. So the two buttons **bookend** the section: one at the top (after intro text) and one at the bottom (after all resume content).

**Position of both buttons relative to the content between them:**

- The **content between** the two buttons is the entire `.dp-resume-layout` main content: the full resume (header + body + sidebar in one column). So there is a large vertical block of left-aligned resume content between the two centered download buttons.
- If the first button appears left of center or the second right of center (or vice versa), the “wrongly positioned” feeling is likely from **asymmetric horizontal placement** of the two buttons relative to the viewport or to the content column, even though CSS specifies centering for both. The exact pixel positions would need a live computed-style/bounding-box check at 1080px to confirm.

---

## 6. Summary table

| Item | Finding |
|------|--------|
| **Breakpoint at 1080px** | `max-width: 1080px` applies; single-column layout; both download blocks visible. |
| **First button parent** | `.dp-resume-intro`. Intended: centered (flex + justify-content: center on widget). |
| **Second button parent** | `.dp-resume-mobile-download`. Intended: centered (flex + justify-content: center). |
| **Intro at 1080px** | `text-align: center`, `align-items: center`, width 100% of layout → **1048px** (1080 − 32 padding). |
| **Observed positions** | Search reported buttons near x=278 and x=685 (center ≈ 540); suggests one or both may not appear centered in viewport. |
| **Content between buttons** | Full resume content (header + body + sidebar) in one column; first button above it, second below with 40px margin-top. |

**Conclusion (diagnostic):** At 1080px the CSS consistently centers both the intro block and the two download widgets. The “wrongly positioned” feeling may be due to (1) actual computed/rendered position differing from center (e.g. one button left, one right), (2) the large block of left-aligned content between two centered buttons creating a visual imbalance, or (3) viewport/scroll context affecting where the buttons appear. Recommend capturing getComputedStyle and getBoundingClientRect for `.dp-resume-section`, `.dp-resume-intro`, both `[data-download-widget]`, and `.dp-resume-mobile-download` at 1080px with section in view for pixel-level verification.
