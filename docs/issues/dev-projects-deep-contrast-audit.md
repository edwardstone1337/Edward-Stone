# Deep contrast audit — card content area (dev-projects)

**Scope:** dev-projects.html using dev-tokens.css and dev-styles.css.  
**Goal:** Actual composited background under `.dp-card-title` and `.dp-card-description`, and WCAG AAA contrast against that background.

---

## 1. Layer stack under `.dp-card-content` text (bottom → top)

Stacking order under the text (both themes). `.dp-card-content` lives inside `.dp-card-inner` (z-index: 2). Pseudo-elements on `.dp-card` have z-index: 1, so they sit *under* `.dp-card-inner` and its background.

| # | Element/selector | Background value (resolved) | Opacity | Blend | z-index | Backdrop-filter |
|---|------------------|------------------------------|---------|-------|---------|------------------|
| 1 | `body` | Dark: `#08090A` (--dp-raw-grey-950). Light: `#FFFFFF` (--dp-raw-white) | 1 | — | — | no |
| 2 | `.dp-card` | Dark: `rgba(255,255,255,0.06)`. Light: `rgba(0,0,0,0.08)` | 1 | — | — | no |
| 3 | `.dp-card::before` (cursor glow) | Dark: `rgba(94,106,210,0.20)` (radial gradient; center value used for composite). Light: `rgba(94,106,210,0.10)` | **0 at rest, 1 on hover** | — | 1 | no |
| 4 | `.dp-card::after` (shimmer) | `--dp-border-active`: dark `rgba(255,255,255,0.20)`, light `rgba(0,0,0,0.20)` | **0 at rest, 1 on hover** | — | 1 | no |
| 5 | `.dp-card-inner` | Dark: `rgba(255,255,255,0.03)` (rest), `0.06` (hover). Light: `rgba(0,0,0,0.02)` (rest), `0.04` (hover) | 1 | — | 2 | **blur(16px)** |
| — | `.dp-noise` (fixed, full viewport) | SVG fractal noise texture | Dark: **0.04**, Light: **0.03** | **soft-light** | 9999 | no |

**Notes:**

- `::after` is a 1px border mask (content-box); it does not cover the content area. So for the *content* background, only layers 1, 2, 3 (when hover), 5 contribute; `::after` is excluded from the composite for the content region.
- Backdrop-filter on `.dp-card-inner` blurs what’s behind it; for a flat body/card background the effective color is still the source-over composite of those layers with the inner background (blur doesn’t change the mean color of a uniform field).
- `.dp-card` uses a 1px padding “trick”; its background is the full card rectangle, so the content area has that layer underneath `.dp-card-inner`.

---

## 2. Composited background (source-over, pre-noise)

Alpha compositing: `result = src × α_src + dst × (1 − α_src)` per channel, bottom to top.  
Glow (::before) included only in hover state. Shimmer (::after) not over content — omitted.

**Final composited hex (pre-noise):**

| State | Dark theme | Light theme |
|-------|------------|-------------|
| **At rest** (no hover) | **#1E1F20** | **#E6E6E6** |
| **On hover** (glow + inner hover bg) | **#323549** | **#D4D5DF** |

**Working (dark at rest):**

1. Base: `#08090A` → (8, 9, 10)
2. Over .dp-card: `rgba(255,255,255,0.06)` → R = 255×0.06 + 8×0.94 ≈ 22.8 → (23, 24, 25)
3. Over .dp-card-inner: `rgba(255,255,255,0.03)` → R = 255×0.03 + 23×0.97 ≈ 29.96 → **(30, 31, 32)** → **#1E1F20**

**Dark on hover:** after step 2, add glow `rgba(94,106,210,0.20)` then inner hover `rgba(255,255,255,0.06)` → **#323549**.

Noise sits on top with `mix-blend-mode: soft-light` and low opacity (0.04 / 0.03). It slightly modulates the perceived background; exact effect is texture-dependent. Contrast ratios below use the pre-noise composite; post-noise contrast may be marginally lower (e.g. dark theme slightly darker).

---

## 3. Contrast ratios vs composited backgrounds (AAA)

Text and AAA targets:

| Element | Font-size | Font-weight | WCAG category | AAA target |
|---------|-----------|-------------|---------------|------------|
| `.dp-card-title` | 20px | 600 | Large text (≥18.66px bold) | **4.5:1** |
| `.dp-card-description` | 14px | 400 | Normal text | **7:1** |

Resolved text colors:  
- Dark: primary `#F7F8F8`, secondary `#95A2B3`  
- Light: primary `#18181B`, secondary `#4B5060`

Relative luminance and contrast computed per WCAG 2.1 (sRGB linearization, then L, then CR = (L_max + 0.05)/(L_min + 0.05)).

**Full contrast table:**

| Background state | .dp-card-title (primary) | AAA 4.5:1 | .dp-card-description (secondary) | AAA 7:1 |
|------------------|--------------------------|------------|-----------------------------------|--------|
| **Dark at rest** | **15.61:1** | ✅ Pass | **6.41:1** | ❌ Fail |
| **Light at rest** | **14.23:1** | ✅ Pass | **6.43:1** | ❌ Fail |
| **Dark on hover** | **11.32:1** | ✅ Pass | **4.65:1** | ❌ Fail |
| **Light on hover** | **12.16:1** | ✅ Pass | **5.49:1** | ❌ Fail |

Summary:

- **Title:** AAA pass in all four states.
- **Description:** Fails AAA (7:1) in every state; at rest ~6.4:1, on hover worse (dark 4.65:1, light 5.49:1). Hover glow and inner hover background lighten the card and reduce contrast for the secondary text.

---

## 4. Image fade overlay (`.dp-card-image-fade`) and content area

**Does the fade affect the card content area?**

**No.**  

- `.dp-card-image-fade` is inside `.dp-card-image` (sibling of `.dp-card-content`).
- It is `position: absolute; bottom: 0; left: 0; right: 0; height: 40%` with `pointer-events: none`.
- So it only covers the **bottom 40% of the image** and does not extend over `.dp-card-content`. The content sits below the image in the layout; the fade is scoped to the image box only.

---

## 5. Tertiary fix and `.dp-empty` contrast (dark theme)

**Change applied:** In `assets/css/dev-tokens.css`, in `[data-theme="dark"]`,  
`--dp-text-tertiary` updated from `rgba(255, 255, 255, 0.53)` to `rgba(255, 255, 255, 0.64)`.

**.dp-empty** uses `--dp-text-tertiary` on `body` background `--dp-bg-base` (`#08090A`). No card layers involved.

**Contrast (dark theme, body background):**

- **Before (0.53):** ~**5.58:1** — fails AAA (7:1).
- **After (0.64):** ~**7.95:1** — passes AAA.

So the tertiary change is confirmed: `.dp-empty` in dark theme now meets AAA for normal text.

---

## 6. Additional legibility concerns

1. **Description text (14px 400)** fails AAA in all card states; at hover it also drops below 4.5:1 in dark theme. Options: darken description color, or treat as large text (e.g. 18px or 14px bold) only if design allows.
2. **Noise overlay** adds a small, variable reduction in contrast; the numbers above are conservative (pre-noise). Real perceived contrast may be slightly lower.
3. **Hover state** is the worst case: glow + lighter inner background make the card brighter and reduce contrast for secondary text; dark hover (4.65:1) is below AA for normal text.
4. **Backdrop-filter** is not reflected in the math; we assumed it doesn’t change mean color. If the view behind the card is not uniform (e.g. hero glow), the effective background could differ locally.

---

## 7. Reference: calculation script

Numerical results above were produced by `dev/contrast-audit-calc.js` (alpha compositing + WCAG luminance/contrast). Run with:

```bash
node dev/contrast-audit-calc.js
```
