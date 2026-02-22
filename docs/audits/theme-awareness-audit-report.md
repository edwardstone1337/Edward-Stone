# Theme-awareness audit report — post–cutover discovery

**Context:** Restoring light/dark theme toggling. The toggle was removed in commit `c7d8b57` (2026-02-12: "feat: dark-only theme cutover — remove light mode, collapse tokens, AAA contrast fixes"). Any JS, CSS, or inline SVG added or significantly modified after that commit may assume dark-only and break under a light theme.

**Date:** 2026-02-22  
**Task:** Discovery only — no code changes.

---

## 1. JS theme-awareness audit

For every `.js` file in `assets/js/`, findings:

### 1.1 Files that read or observe `data-theme`

| File | Behaviour | Risk |
|------|-----------|------|
| `dev-projects/growth-chart.js` | `getAttribute('data-theme')` (L51), `MutationObserver` on `data-theme` (L185–192). `getGridColor()` returns `rgba(0,0,0,0.06)` for light, `rgba(255,255,255,0.06)` for dark. Theme-aware. | **Low** — already theme-aware |
| `dev-projects/snake-game.js` | `MutationObserver` on `data-theme` (L435–438). Re-reads token values when theme changes via `readColors()`. Uses `state.colors` from CSS tokens. | **Low** — already theme-aware |

### 1.2 Files with hardcoded colour values (hex, rgb, rgba)

| File | Location | Colours | Risk |
|------|----------|---------|------|
| `dev-projects/nav-component.js` | L285–290 | `#B8C2FF`, `#5E6AD2` in inline SVG gradient `stop-color`. Dark-theme hero gradient palette. | **High** — nav logo will look wrong on light bg |
| `dev-projects/growth-chart.js` | L56, L60, L65, L154 | Fallbacks: `#5BBFB5`, `#8A94A6`, `rgba(255/0,…)`. Used when tokens unavailable. | **Medium** — fallbacks are dark-theme tuned |
| `dev-projects/snake-game.js` | L198, L216, L231, L253, L270–278 | Fallbacks: `#4ade80`, `#E8E9ED`, `rgba(255,255,255,0.04)`, `#95A2B3`, `#F7F8F8`, `rgba(255,255,255,0.64)`. Canvas rendering uses tokens; fallbacks are dark-only. | **High** — Game Over text, grid, food will be invisible on light bg |
| `dev-projects/avatar-easter-egg.js` | L28 | `COLOR_PALETTE = ['#5B8DEF', '#7DD3C0', '#F7B955', '#EF6B6B', '#C084FC']`. Confetti particles — decorative, not text. | **Low** — decorative only; works on both themes |

### 1.3 Inline styles and inline SVGs with colour values

| File | Location | Type | Risk |
|------|----------|------|------|
| `dev-projects/nav-component.js` | L276–293 | Inline SVG logo: `fill="black"`, `fill="white"`, `stop-color="#B8C2FF"`, `stop-color="#5E6AD2"`. Hardcoded dark-theme palette. | **High** |
| `dev-projects/nav-component.js` | L43, L46 | Chevron and close SVGs use `stroke="currentColor"` — theme-safe. | Low |
| `dev-projects/resume-lightbox.js` | L61–87 | SVGs use `stroke="currentColor"` — theme-safe. | Low |
| `dev-projects/snake-game.js` | L11–12 | Snake/close icons use `fill="currentColor"` — theme-safe. | Low |
| `dev-projects/back-to-top.js` | L15 | Arrow SVG uses `stroke="currentColor"` — theme-safe. | Low |
| Other inline styles | nav-component (overflow), resume-lightbox (overflow), strip-effects (orb coords), effects (mouse coords), back-to-top (opacity/pointer-events), avatar-easter-egg (transform, will-change), magnetic-tilt (transform) | Layout/UX only, no colours | Low |

### 1.4 Theme-dependent class names

No JS was found that adds theme-dependent class names based on runtime theme. Class names are static (e.g. `dp-nav`, `dp-snake-overlay`).

### 1.5 Files added or significantly modified after `c7d8b57` (highest risk)

From `git log c7d8b57..HEAD --name-only`:

| File | Commits since cutover | Risk summary |
|------|------------------------|--------------|
| `nav-component.js` | 2a7a6da, 73f8a4e, a0b26be, 38a5b93, ede8331, 0bbf3c1, b22ef31 | **High** — inline SVG logo hardcodes `#B8C2FF`, `#5E6AD2`, `fill="black"`, `fill="white"` |
| `gallery.js` | a54dfb9, 0277f64, c9f5a70, 0bbf3c1 | Low — no colours; uses tokens via classes |
| `banner-ticker.js` | a63ee48, 09d5614 | Low — uses tokens; no hardcoded colours |

Other dev-projects and components: **no commits** after `c7d8b57` in the git range, so they predate or were unchanged since cutover.

---

## 2. CSS dark-theme assumptions

### 2.1 Raw colour values in `dev-styles.css` (not tokens)

| Line | Selector/Context | Value | Risk |
|------|------------------|-------|------|
| 289 | `.dp-nav-logo` | `box-shadow: 0 0 0 1px rgba(255, 255, 255, 1)` | **High** — white ring invisible on light bg. `case-study-theme.css` overrides for light with `rgba(0,0,0,0.12)` |
| 621 | `.dp-theme-toggle:hover` (theme toggle — removed in c7d8b57; CSS may be orphaned) | `border-color: rgba(7, 89, 133, 0.6)` | Low — toggle removed |
| 1049–1051 | (gradient) | `rgba(255, 255, 255, 0.03/0.06)` | High — dark bg assumed |
| 1320, 1327, 1340 | (likely nav/dropdown) | `rgba(255, 255, 255, 0.12)`, `rgba(255, 255, 255, 0.08)`, `rgba(255, 255, 255, 0.18)` | High — white tones for dark mode |
| 1441–1451 | `.dp-strip--kaomoji` | Full strip override: `#141414`, `#3a3a3a`, `#2a2a2a`, `#f0f0f0`, etc. | Medium — strip is always dark by design |
| 1466–1467 | `.dp-strip--kaomoji .dp-strip-media` | `background: #141414; border: 1px solid #5a5a5a` | Medium |
| 2199–2210 | `.dp-lightbox-close` | `rgba(255,255,255,0.12)`, `rgba(0,0,0,0.4)`, `rgba(255,255,255,0.85)`, `rgba(0,0,0,0.6)` | **High** — dark overlay; close btn would be low contrast on light |
| 2426–2427 | (mask) | `linear-gradient(#fff 0 0)` | Low — mask utility |
| 2805 | `.dp-404-glow` | `var(--dp-accent, #5E6AD2)` | Low — fallback |
| 2879–2887 | `@media print` | Light print overrides — correct for print | N/A |

### 2.2 `dev-styles.css` changes since cutover

Commits touching `dev-styles.css` since `c7d8b57`: 8aa4679, 91ae994, 2a7a6da, 314e838, 2f01c05, a0b26be, 560ca28, 3fd181e. Many of these add/modify nav, hero, case study, and strip styles. The `.dp-nav-logo` box-shadow (L289) and lightbox close button (L2199–2210) are likely pre-cutover but would break on light; `case-study-theme.css` already fixes nav logo for light.

### 2.3 Component styles that would break on light background

- **Nav logo ring** (L289): White ring; invisible on white. Fix present in `case-study-theme.css` for `[data-theme="light"]`.
- **Lightbox close button** (L2199–2210): Dark overlay styling; on light bg the button contrast would be poor.
- **Snackbar** (L2232+): Uses `var(--dp-glass-bg-mid)` — tokenised; should adapt.
- **404 glow** (L2805): Uses `--dp-accent`; should adapt.
- **Kaomoji strip** (L1439–1469): Intentionally dark; strip is on-dark by design.

---

## 3. Inline SVGs and canvas elements

### 3.1 Inline SVGs with hardcoded colours

| File | Line | Colours used | Risk |
|------|------|--------------|------|
| `nav-component.js` | 276–293 | `fill="black"`, `fill="white"`, `stop-color="#B8C2FF"`, `stop-color="#5E6AD2"` | **High** |
| `index.html` | 123, 164, 199, 227 | External-link SVGs: `stroke="currentColor"` | Low |
| `resume.html` | 61–75, 257–271 | Chevron, download, external-link SVGs: `stroke="currentColor"` | Low |
| `projects/fair-share.html` | 99–112 | Star SVGs: `fill="currentColor"`, one uses `fill="url(#star5-partial)"` with `var(--dp-accent)`, `var(--dp-text-secondary)` | Low — tokenised |
| `projects/scp-reader.html` | 125 | External-link SVG: `stroke="currentColor"` | Low |
| `assets/previews/kaomoji/index.html` | 202–203 | Snackbar check: `stroke="currentColor"` | Low |
| `assets/previews/flip-7/index.html` | 342–343 | Snackbar check: `stroke="currentColor"` | Low |
| `assets/previews/fair-share/index.html` | 72 | SVG filter (no colour) | Low |

### 3.2 Canvas rendering with colours

| File | Line | Colours | Risk |
|------|------|---------|------|
| `snake-game.js` | 198, 216, 231, 253, 270–278 | Uses `state.colors` (tokens) with dark-theme fallbacks: `#4ade80`, `#E8E9ED`, `rgba(255,255,255,0.04)`, `#95A2B3`, `#F7F8F8`, `rgba(255,255,255,0.64)` | **High** — fallbacks would fail on light |
| `growth-chart.js` | (via Chart.js) | Uses `getAccentColor()`, `getGridColor()`, `getLabelColor()` — theme-aware | Low |
| `avatar-easter-egg.js` | 95–98 | `ctx.fillStyle = p.color` from `COLOR_PALETTE` (fixed hex). Decorative confetti. | Low |

---

## 4. Iframe preview components

| Preview | Listens for `postMessage` theme? | Own light theme? | Colours |
|---------|----------------------------------|------------------|---------|
| **kaomoji** | **No** — no `addEventListener('message')` found. Only sets `data-theme="dark"` on init (L214). | No | `:root` vars: `--km-bg: #141414`, `--km-text: #f0f0f0`, `--km-border: #5a5a5a`, etc. All hardcoded dark. |
| **flip-7** | **No** — sets `data-theme="dark"` (L351). No message listener. | No | `:root`: `--f7-bg: #0f0f0f`, `--f7-text: #f0f0f0`, etc. All hardcoded dark. |
| **fair-share** | **No** — sets `data-theme="dark"` (L87). No message listener. | No | `:root`: `--fs-bg: #112e2e`, `--fs-text: #eafcf8`, etc. Hardcoded dark. |
| **lost-cities** | No script setting `data-theme`; no message listener. | No | `background: #1a1612`, cards `#1d1d1d`, borders `rgba(255,255,255,0.45)`. All dark. |

**Note:** CHANGELOG/docs reference postMessage theme sync and `theme-toggle.js` broadcasting to iframes. `theme-toggle.js` was **removed** in `c7d8b57`. No current code sends `theme-change` postMessages to preview iframes. Previews are dark-only by design and would need full light-theme support and a new postMessage sender to sync.

---

## 5. Components added after cutover

Files added or modified since `c7d8b57` (from `git log c7d8b57..HEAD --name-only`):

| Category | Files | Theme-sensitive? | Risk |
|----------|-------|------------------|------|
| **CSS** | `dev-styles.css`, `dev-tokens.css`, `case-study-theme.css` | Yes — tokens, nav, hero, prose, TL;DR, strips | `case-study-theme.css` adds light overrides; `dev-styles.css` has dark-only values in places |
| **JS** | `nav-component.js`, `gallery.js`, `banner-ticker.js` | nav: Yes (SVG logo); gallery/banner: minimal | **High** for nav |
| **HTML** | case studies, gallery, index, resume, 404, projects | Mostly tokenised; fair-share star rating uses `var(--dp-accent)` | Low |
| **Previews** | (unchanged in range; may have been modified in other branch) | All dark-only | Medium for future light-mode sync |

**Highlight:** `nav-component.js` and the nav logo inline SVG are the highest-impact post-cutover additions that would visually break on a light background (logo gradient and ring tuned for dark).

---

## 6. Token coverage gap

### 6.1 Tokens in current `dev-tokens.css` (:root, dark-only) with no `[data-theme="light"]` block

Current `dev-tokens.css` has semantic tokens in `:root` (dark-only; no `[data-theme="dark"]` wrapper). The reference `_archive/light-theme-tokens-reference.css` has `[data-theme="light"]` with a subset.

### 6.2 Tokens in current dark theme with NO light-theme counterpart in reference

| Token | Current (dark) | In light reference? |
|-------|----------------|---------------------|
| `--dp-hero-line-from`, `--dp-hero-line-to` | Yes | Yes |
| `--dp-theme-sun-icon-hover`, `--dp-theme-sun-bg-hover` | In c7d8b57^ (removed in cutover) | N/A — were theme-toggle specific |
| `--dp-theme-moon-icon-hover`, `--dp-theme-moon-bg-hover` | Not in current | Yes in reference (light-theme toggle) |
| `--dp-dropdown-bg`, `--dp-dropdown-shadow` | Yes | **No** in reference |
| `--dp-drawer-bg`, `--dp-drawer-overlay`, `--dp-drawer-border` | Yes | **No** in reference |
| `--dp-tldr-*` (6 tokens) | Yes | **No** in reference |
| `--dp-banner-bg`, `--dp-banner-text`, `--dp-banner-speed` | Yes | **No** in reference |
| `--dp-prose-*` (6 tokens) | Yes | **No** in reference |
| `--dp-paper-surface-light`, etc. (contextual light) | Yes | N/A — used for print/light overlay |

### 6.3 Tokens added after cutover (in dev-tokens)

`dev-tokens.css` was modified in 91ae994, a0b26be (case study work). New/updated tokens may include TL;DR, prose, dropdown, drawer. The reference file predates these.

### 6.4 Summary of gaps to fill for light theme

1. **Dropdown:** `--dp-dropdown-bg`, `--dp-dropdown-shadow` — need light values.
2. **Drawer:** `--dp-drawer-bg`, `--dp-drawer-overlay`, `--dp-drawer-border` — need light values.
3. **TL;DR:** All `--dp-tldr-*` — need light overrides if used on light pages.
4. **Banner:** `--dp-banner-bg`, `--dp-banner-text` — accent/white; likely OK, verify contrast.
5. **Prose:** `--dp-prose-*` are layout/sizing; no colour. No gap.
6. **`case-study-theme.css`** already defines many light overrides; reconcile with token layer.

---

## Summary: risk levels

| Area | High risk | Medium risk | Low risk |
|------|-----------|-------------|----------|
| **JS** | nav-component (SVG logo), snake-game (canvas fallbacks) | growth-chart (fallbacks) | avatar-easter-egg, others |
| **CSS** | .dp-nav-logo ring, .dp-lightbox-close | Strip overrides, gradient fills | Print, masks |
| **SVGs** | nav-component logo | — | All others use currentColor/tokens |
| **Canvas** | snake-game | — | growth-chart, avatar-easter-egg |
| **Iframes** | — | All four need postMessage + light theme to restore sync | — |
| **Tokens** | — | dropdown, drawer, TL;DR, banner | prose (no colour) |

---

*End of audit. No code changes made.*
