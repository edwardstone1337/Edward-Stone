# Flip 7 strip — why it looks flat and generic

Structured audit: token values, strip comparison, brand alignment, and contrast headroom. **No files were modified.**

---

## 1. Computed token values — `--dp-strip-flip7-*` (dev-tokens.css)

Full set of Flip 7 strip tokens as defined in `assets/css/dev-tokens.css`, for both themes.

### Dark theme `[data-theme="dark"]`

| Token | Value |
|-------|--------|
| `--dp-strip-flip7-bg` | `lch(27 0.16 265)` |
| `--dp-strip-flip7-title-from` | `lch(96 0.04 92)` |
| `--dp-strip-flip7-title-to` | `lch(88 0.04 185)` |
| `--dp-strip-flip7-border` | `1px solid lch(57 0.09 182 / 0.12)` |
| `--dp-strip-flip7-orb-1` | `lch(57 0.14 182)` |
| `--dp-strip-flip7-orb-2` | `lch(72 0.12 85)` |
| `--dp-strip-flip7-orb-dark` | `rgba(0, 0, 0, 0.22)` |
| `--dp-strip-flip7-orb-opacity` | `0.32` |
| `--dp-strip-flip7-title-color` | `lch(96 0.04 92)` |
| `--dp-strip-flip7-text-color` | `lch(92 0.035 92 / 0.9)` |
| `--dp-strip-flip7-badge-bg` | `lch(38 0.06 200 / 0.5)` |
| `--dp-strip-flip7-badge-text` | `lch(96 0.03 92)` |
| `--dp-strip-flip7-device-border` | `1px solid lch(38 0.08 265)` |
| `--dp-strip-flip7-device-shadow` | `0 4px 24px rgba(0, 0, 0, 0.4)` |

### Light theme `[data-theme="light"]`

| Token | Value |
|-------|--------|
| `--dp-strip-flip7-bg` | `lch(27 0.16 265)` |
| `--dp-strip-flip7-title-from` | `lch(96 0.04 92)` |
| `--dp-strip-flip7-title-to` | `lch(90 0.03 185)` |
| `--dp-strip-flip7-border` | `1px solid lch(57 0.09 182 / 0.12)` |
| `--dp-strip-flip7-orb-1` | `lch(57 0.14 182)` |
| `--dp-strip-flip7-orb-2` | `lch(72 0.12 85)` |
| `--dp-strip-flip7-orb-dark` | `rgba(0, 0, 0, 0.2)` |
| `--dp-strip-flip7-orb-opacity` | `0.38` |
| `--dp-strip-flip7-title-color` | `lch(98 0.025 92)` |
| `--dp-strip-flip7-text-color` | `lch(94 0.03 92 / 0.92)` |
| `--dp-strip-flip7-badge-bg` | `lch(38 0.06 200 / 0.52)` |
| `--dp-strip-flip7-badge-text` | `lch(98 0.02 92)` |
| `--dp-strip-flip7-device-border` | `1px solid lch(40 0.08 265)` |
| `--dp-strip-flip7-device-shadow` | `0 4px 24px rgba(0, 0, 0, 0.35)` |

**Summary:** Same strip bg and orb colours in both themes; only title-to, orb-opacity, title/text/badge text, device-border, and device-shadow differ for light.

---

## 2. Visual comparison — four strips

Resolved behaviour and tokens for Fair Share, Flip 7, SCP Reader, and Kaomoji (as used on index + dev-styles).

| Aspect | Fair Share | Flip 7 | SCP Reader | Kaomoji |
|--------|------------|--------|------------|---------|
| **Resolved `--dp-strip-bg`** | `#0a2020` | `lch(27 0.16 265)` ≈ navy | `#141414` | `#141414` |
| **Orb 1 colour** | `#2e7d76` (teal) | `lch(57 0.14 182)` (teal) | `#791a1f` (red) | `#3a3a3a` (grey) |
| **Orb 2 colour** | `#E8919B` (pink) | `lch(72 0.12 85)` (amber) | `#431418` (dark red) | `#2a2a2a` (dark grey) |
| **Orb opacity** | 0.4 | 0.32 (dark) / 0.38 (light) | 0.3 | 0.3 (orbs not visible) |
| **Gradient title active?** | No (title-from = title-to) | **Yes** (cream → teal) | No (solid white) | No (solid) |
| **Visible strip border?** | No (`1px solid transparent`) | **Yes** (teal whisper 12% opacity) | No | No |
| **Extra treatments** | — | Device border + shadow | Logo with `filter: brightness(0) invert(1)` | Orbs hidden (`::before`/`::after` `display:none`); custom media border |

Where Flip 7 stands out vs. blends in:

- **Stands out:** Only strip with gradient title (cream → teal) and only one with a visible strip border (subtle teal).
- **Blends in:** Orb opacity is low (0.32/0.38 vs Fair Share’s 0.4); orb colours are muted (C 0.12–0.14); same structural pattern as other strips (orbs + content + device). No unique asset (e.g. no logo like SCP); no layout quirk (e.g. orbs hidden like Kaomoji). So it reads as “another dark strip with soft orbs” rather than distinctly Flip 7.

---

## 3. Brand palette reference

Flip 7 product colours:

- **Navy:** `#2b3276`
- **Teal:** `#1d9995`
- **Cream:** `#fff4d2`
- **Orange:** `#fbb03a`
- **Red:** `#e53e3e`

Approximate LCH (for comparison; exact values depend on profile):

- Navy `#2b3276`: ~ L 25, C 0.18, H 275  
- Teal `#1d9995`: ~ L 55, C 0.12, H 185  
- Cream `#fff4d2`: ~ L 96, C 0.04, H 92  
- Orange `#fbb03a`: ~ L 78, C 0.16, H 75  
- Red `#e53e3e`: ~ L 50, C 0.22, H 25  

Token vs brand:

| Token | Current value (dark) | Brand reference | Assessment |
|-------|----------------------|------------------|------------|
| `--dp-strip-flip7-bg` | `lch(27 0.16 265)` | Navy #2b3276 (L~25, C~0.18, H~275) | **Close.** L and H align; C slightly lower (0.16 vs ~0.18) so bg is a bit less saturated than brand navy. |
| `--dp-strip-flip7-title-from` | `lch(96 0.04 92)` | Cream #fff4d2 (L~96, C~0.04, H~92) | **Close.** Matches cream well. |
| `--dp-strip-flip7-title-to` | `lch(88 0.04 185)` | Teal #1d9995 (L~55, C~0.12, H~185) | **Drift.** Hue matches; L much higher (88 vs 55) and C same — reads as very light muted teal, not the strong teal. Title gradient “feels” cream-to-pale-teal, not cream-to-brand-teal. |
| `--dp-strip-flip7-orb-1` | `lch(57 0.14 182)` | Teal #1d9995 | **Close.** L and C in the right ballpark; H 182 vs 185 is fine. Slightly more saturated than brand teal. |
| `--dp-strip-flip7-orb-2` | `lch(72 0.12 85)` | Orange #fbb03a (L~78, C~0.16, H~75) | **Drift.** L a bit lower (72 vs 78), C lower (0.12 vs 0.16) — orb reads as muted amber, not bold orange. Strip doesn’t “feel” the Flip 7 orange. |
| `--dp-strip-flip7-border` | `lch(57 0.09 182 / 0.12)` | Teal | In the family; 12% opacity makes it very subtle. |
| `--dp-strip-flip7-badge-bg` | `lch(38 0.06 200 / 0.5)` | Navy/teal area | Low chroma (0.06); reads neutral dark, not strongly branded. |
| `--dp-strip-flip7-device-border` | `lch(38 0.08 265)` | Navy | Reasonable navy tint. |

**Flags:**

- **title-to:** LCH has drifted to a very light teal (L 88) so the gradient no longer lands on “brand teal”; it feels generic light-to-slightly-teal.
- **orb-2:** L and C are conservative vs orange #fbb03a; the strip underuses the signature orange, so it feels flat and safe.
- **badge-bg:** Very low chroma; no clear Navy/Teal/Orange accent, so badges don’t reinforce brand.

---

## 4. Contrast headroom

**Strip background:** `--dp-strip-flip7-bg` = `lch(27 0.16 265)`. From `dev/flip7-contrast.js`:

- Relative luminance **L_rel ≈ 0.0513**.
- For **WCAG AAA (7:1)** the lighter colour must have L_rel ≥ **7 × (0.0513 + 0.05) − 0.05 ≈ 0.66**.
- Current title-from: **9.34:1** ✓; title-to (dark): **7.63:1** ✓; title-to (light): **8.00:1** ✓.

So all title tokens have **substantial headroom** above 7:1 on the strip bg.

**Implications for being bolder:**

1. **Text on strip bg (title, body)**  
   We can **lower** the luminance of the gradient end (title-to) and/or body text and still stay AAA, as long as L_rel ≥ ~0.66. So we can push title-to toward **brand teal** (e.g. L ~55–60) only if we also ensure that the **lowest** part of the gradient still has L_rel ≥ 0.66 (e.g. by keeping a segment of the gradient lighter or by not going to full brand teal everywhere). So headroom exists to make the gradient **more teal** (lower L, same or slightly higher C) in the bottom part while keeping AAA by design (e.g. gradient stops or a lighter fallback).

2. **Orb colours**  
   Orbs are **decorative** (no text on them). There is **no contrast requirement** for the orbs themselves. We can increase chroma (e.g. orb-2 toward orange #fbb03a: C 0.16, L 78) and/or orb opacity (e.g. toward 0.4) without affecting text AAA. Headroom: **full** for saturation and opacity within the existing layout.

3. **Badge background**  
   **Badge text** must be **7:1 on badge-bg**. Badge-text is currently LCH ~96 (L_rel ~0.95). For 7:1, badge-bg can have L_rel down to about **(0.95 + 0.05)/7 − 0.05 ≈ 0.09**. So we can **darken and/or saturate** badge-bg (e.g. more navy or teal) as long as its effective L_rel (including alpha on strip bg) stays above ~0.09. Current badge-bg is L38, ~0.5 alpha on L27 bg, so effective luminance is well above 0.09. **Headroom:** we can increase chroma (e.g. C 0.08–0.12) and/or slightly lower L and still keep badge-text AAA.

4. **Strip border**  
   Border is **decorative**. No text contrast requirement. We can increase visibility (e.g. opacity from 0.12 to ~0.15–0.18) or chroma without affecting AAA. **Headroom:** full for border strength within “whispers, not lines”.

**Summary:**  
- **Text on strip bg:** Large headroom; gradient and body can be bolder (e.g. more teal, slightly darker) while still meeting AAA with careful gradient/stop choices.  
- **Orbs:** No contrast limit; can be bolder in saturation and opacity.  
- **Badge bg:** Can be more saturated and slightly darker while keeping badge-text at 7:1.  
- **Border:** No contrast limit; can be slightly more visible.

---

## Summary

- **Section 1:** All `--dp-strip-flip7-*` tokens are listed for dark and light in `dev-tokens.css`; only text, opacity, and device tokens differ by theme.
- **Section 2:** Flip 7 is the only strip with gradient title and visible border but uses low orb opacity and no unique asset; it blends in structurally.
- **Section 3:** title-to and orb-2 have drifted from brand teal and orange; badge-bg is very low-chroma. Those tokens are the main reason the strip doesn’t “feel like” Flip 7.
- **Section 4:** AAA is met with headroom; orbs and border can be pushed with no contrast cost; title/body and badge can be made bolder within AAA by keeping L_rel ≥ ~0.66 on text and ~0.09 for badge-bg.
