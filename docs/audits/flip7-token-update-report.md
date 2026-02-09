# Flip 7 strip token update — status report

**Date:** 2025-02-09  
**Scope:** Token changes only in `assets/css/dev-tokens.css` (no CSS rule or HTML changes).  
**Goal:** Align Flip 7 strip with brand palette (navy #2b3276, teal #1d9995, cream #fff4d2, orange #fbb03a) and verify WCAG AAA 7:1.

---

## 1. Token changes (old → new)

### [data-theme="dark"]

| Token | Old | New |
|-------|-----|-----|
| `--dp-strip-flip7-bg` | `lch(27 0.16 265)` | `lch(25 0.18 275)` |
| `--dp-strip-flip7-orb-1` | `lch(57 0.14 182)` | `lch(55 0.12 185)` |
| `--dp-strip-flip7-orb-2` | `lch(72 0.12 85)` | `lch(78 0.16 75)` |
| `--dp-strip-flip7-orb-opacity` | `0.32` | `0.4` |
| `--dp-strip-flip7-orb-dark` | `rgba(0, 0, 0, 0.22)` | `rgba(0, 0, 0, 0.18)` |
| `--dp-strip-flip7-title-to` | `lch(88 0.04 185)` | `lch(83 0.06 185)` ⚠️ walked back |
| `--dp-strip-flip7-badge-bg` | `lch(38 0.06 200 / 0.5)` | `lch(35 0.10 185 / 0.55)` |
| `--dp-strip-flip7-border` | `1px solid lch(57 0.09 182 / 0.12)` | `1px solid lch(55 0.12 185 / 0.15)` |

**Unchanged (dark):** `--dp-strip-flip7-title-from`, `--dp-strip-flip7-title-color`, `--dp-strip-flip7-text-color`, `--dp-strip-flip7-badge-text`, `--dp-strip-flip7-device-border`, `--dp-strip-flip7-device-shadow`.

### [data-theme="light"]

| Token | Old | New |
|-------|-----|-----|
| `--dp-strip-flip7-bg` | `lch(27 0.16 265)` | `lch(25 0.18 275)` |
| `--dp-strip-flip7-title-to` | `lch(90 0.03 185)` | `lch(84 0.05 185)` ⚠️ walked back |
| `--dp-strip-flip7-border` | `1px solid lch(57 0.09 182 / 0.12)` | `1px solid lch(55 0.12 185 / 0.15)` |
| `--dp-strip-flip7-orb-1` | `lch(57 0.14 182)` | `lch(55 0.12 185)` |
| `--dp-strip-flip7-orb-2` | `lch(72 0.12 85)` | `lch(78 0.16 75)` |
| `--dp-strip-flip7-orb-dark` | `rgba(0, 0, 0, 0.2)` | `rgba(0, 0, 0, 0.15)` |
| `--dp-strip-flip7-orb-opacity` | `0.38` | `0.45` |
| `--dp-strip-flip7-badge-bg` | `lch(38 0.06 200 / 0.52)` | `lch(35 0.10 185 / 0.55)` |

**Unchanged (light):** `--dp-strip-flip7-title-from`, `--dp-strip-flip7-title-color`, `--dp-strip-flip7-text-color`, `--dp-strip-flip7-badge-text`, `--dp-strip-flip7-device-border`, `--dp-strip-flip7-device-shadow`.

---

## 2. WCAG AAA 7:1 verification

**Background:** `lch(25 0.18 275)` → relative luminance **0.0438**.

| Pair | Ratio | Pass (≥ 7:1) |
|------|-------|--------------|
| 1. title-from vs new bg | **10.08:1** | ✓ AAA |
| 2. title-to (dark) vs new bg | **7.18:1** | ✓ AAA |
| 3. title-to (light) vs new bg | **7.33:1** | ✓ AAA |
| 4. text-color (composited 0.9) vs new bg | **7.77:1** | ✓ AAA |
| 5. badge-text vs effective badge-bg on bg | **8.24:1** | ✓ AAA |

All five pairs meet AAA 7:1.

---

## 3. Walkbacks

- **`--dp-strip-flip7-title-to` (dark):** Target was `lch(80 0.06 185)`. Against new bg, contrast was **6.55:1** (fail). Walked back to **L 83** → **7.18:1** ✓.
- **`--dp-strip-flip7-title-to` (light):** Target was `lch(82 0.05 185)`. Against new bg, contrast was **6.97:1** (fail). Walked back to **L 84** → **7.33:1** ✓.

No other tokens required walkback.

---

## 4. Verification script

Contrast figures were produced by `node dev/flip7-contrast.js`, which converts LCH → sRGB → relative luminance and composites alpha where needed (text-color over bg, badge-bg over bg).
