# Dev Projects: Multiple theme switcher (Linear / Windows 95 / Geocities)

**Type:** feature  
**Priority:** normal  
**Effort:** medium  

---

## TL;DR

Add a theme switcher to the homepage (index.html) so the page can toggle between a “Linear”-style default, Windows 95, and Geocities looks. Theming is done by overriding design tokens on a scoped container; no component rewrites.

---

## Current state

- Single look: tokens in `tokens.css` define one visual style.
- No theme switch; page always uses default (current cool-toned) theme.

---

## 2. Page background — background token audit

Inventory of every background-related token in `dev-tokens.css` (bg, background, surface, paper), with token name and resolved primitive value.

### Dark theme (`:root`)

| Token | Definition | Resolved value |
|-------|------------|----------------|
| `--dp-bg-base` | `var(--dp-raw-grey-950)` | `#08090A` |
| `--dp-bg-raised` | `var(--dp-raw-grey-900)` | `#111113` |
| `--dp-bg-card` | `rgba(255, 255, 255, 0.03)` | (primitive) |
| `--dp-bg-card-hover` | `rgba(255, 255, 255, 0.06)` | (primitive) |
| `--dp-bg-overlay` | `rgba(0, 0, 0, 0.7)` | (primitive) |
| `--dp-glass-bg` | `rgba(255, 255, 255, 0.05)` | (primitive) |
| `--dp-glass-bg-mid` | `rgba(30, 30, 30, 0.55)` | (primitive) |
| `--dp-glass-bg-elevated` | `rgba(30, 30, 30, 0.85)` | (primitive) |
| `--dp-on-dark-surface` | `var(--dp-raw-grey-900)` | `#111113` |
| `--dp-on-dark-surface-hover` | `var(--dp-raw-grey-50)` | `#F7F8F8` |
| `--dp-paper-surface` | `#18181B` | (primitive) |
| `--dp-paper-surface-light` | `#FFFFFF` | (primitive) |
| `--dp-banner-bg` | `var(--dp-accent)` | `var(--dp-raw-brand-on-dark)` → `#F7F8F8` |
| `--dp-dropdown-bg` | `rgba(30, 30, 30, 0.95)` | (primitive) |
| `--dp-drawer-bg` | `var(--dp-glass-bg)` | `rgba(255, 255, 255, 0.05)` |
| `--dp-tldr-bg` | `var(--dp-bg-raised)` | `#111113` |
| `--dp-nav-logo-bg` | `var(--dp-raw-black)` | `#000000` |
| `--dp-toggle-bg` | `rgba(255, 255, 255, 0.06)` | (primitive) |
| `--dp-toggle-bg-hover` | `rgba(255, 255, 255, 0.10)` | (primitive) |
| `--dp-btn-bg-primary` | `var(--dp-accent)` | `#F7F8F8` (dark) |
| `--dp-btn-bg-primary-on-dark` | `var(--dp-raw-white)` | `#FFFFFF` |
| `--dp-btn-hover-bg-primary-on-dark` | `var(--dp-on-dark-surface-hover)` | `#F7F8F8` |
| `--dp-btn-secondary-on-dark-hover-bg` | `rgba(255, 255, 255, 0.1)` | (primitive) |
| `--dp-btn-secondary-on-light-hover-bg` | `rgba(0, 0, 0, 0.12)` | (primitive) |
| `--dp-strip-bg` | `#0a2020` | (primitive) |
| `--dp-strip-scp-bg` | `#141414` | (primitive) |
| `--dp-strip-flip7-bg` | `lch(25 18 275)` | (primitive) |
| `--dp-strip-badge-bg` | `rgba(255, 255, 255, 0.15)` | (primitive) |
| `--dp-strip-scp-badge-bg` | `rgba(255, 255, 255, 0.08)` | (primitive) |
| `--dp-strip-flip7-badge-bg` | `lch(35 10 185 / 0.55)` | (primitive) |
| `--dp-theme-sun-bg-hover` | `linear-gradient(...)` | (primitive) |
| `--dp-theme-moon-bg-hover` | `#1e293b` | (primitive) |

### Light theme (`[data-theme="light"]`)

| Token | Definition | Resolved value |
|-------|------------|----------------|
| `--dp-bg-base` | `#EDF0F7` | (primitive) — **page background** |
| `--dp-bg-raised` | `#F0F2FA` | (primitive) |
| `--dp-bg-card` | `rgba(255, 255, 255, 0.75)` | (primitive) |
| `--dp-bg-card-hover` | `rgba(255, 255, 255, 0.8)` | (primitive) |
| `--dp-bg-overlay` | `rgba(255, 255, 255, 0.8)` | (primitive) |
| `--dp-glass-bg` | `rgba(255, 255, 255, 0.65)` | (primitive) |
| `--dp-glass-bg-mid` | `rgba(255, 255, 255, 0.75)` | (primitive) |
| `--dp-glass-bg-elevated` | `rgba(255, 255, 255, 0.85)` | (primitive) |
| `--dp-paper-surface` | `var(--dp-raw-white)` | `#FFFFFF` |
| `--dp-paper-surface-light` | `#FFFFFF` | (primitive) |
| `--dp-dropdown-bg` | `rgba(255, 255, 255, 0.95)` | (primitive) |
| `--dp-drawer-bg` | `rgba(255, 255, 255, 0.85)` | (primitive) |
| `--dp-tldr-bg` | `var(--dp-bg-raised)` | `#F0F2FA` |

### Near-white options (between page bg and pure white)

**Light theme page background:** `--dp-bg-base` = `#EDF0F7`

Tokens that sit between `#EDF0F7` and `#FFFFFF`, in ascending lightness:

| Token | Resolved value | Notes |
|-------|----------------|-------|
| `--dp-bg-raised` | `#F0F2FA` | Semantic surface token; one step lighter than page bg. **Best existing near-white option** — no new token needed. |
| `--dp-raw-grey-100` | `#F4F5F8` | Primitive; not a bg token (avoid direct use per architecture). |
| `--dp-raw-grey-50` | `#F7F8F8` | Primitive; used by `--dp-on-dark-surface-hover` (button hover on dark strips). |
| `--dp-dropdown-bg` | `rgba(255, 255, 255, 0.95)` | Composited; very near white but depends on underlying content. |
| `--dp-paper-surface` | `#FFFFFF` | Pure white; document/resume surface. |

**Recommendation:** Use `--dp-bg-raised` as the near-white option between page background and white. It already exists, is semantic, and resolves to `#F0F2FA` in light theme — lighter than page bg (`#EDF0F7`) without reaching pure white.

---

## Expected outcome

- User can choose a theme (e.g. Linear, Windows 95, Geocities) via buttons or a small control in the hero or a fixed corner.
- Only the main content (hero + side-quests) changes; nav can stay default or optionally be included (product decision).
- Theme choice persists on refresh (e.g. `localStorage`).
- Each theme overrides the same token names (colors, fonts, radius, borders, shadows) so existing components don’t need structural changes.

---

## Relevant files

- **`index.html`** — Add theme root (e.g. `data-theme="linear"` on `main.dp-page`), theme switcher UI, and script to set attribute + optional persistence. Load themes CSS.
- **`assets/css/themes.css`** (new) — Token overrides per theme: `main.dp-page[data-theme="win95"] { ... }`, same for `geocities` and optionally `linear`. Plus any theme-only rules (e.g. Win95 3D borders, Geocities tiled background).
- **`assets/css/tokens.css`** — No change; themes only override where used (under the theme scope).

---

## Implementation notes

- **Scope:** Prefer `main.dp-page` as theme root so nav stays default; use `body` only if nav should theme too.
- **Fonts:** Win95/Geocities need webfonts (e.g. MS Sans Serif–style, Comic Sans–style); add `<link>`s on index.html or in theme CSS and set `--font-body` / `--font-heading` in each theme block.
- **Win95:** Besides tokens, add rules for chunky 3D inset/outset borders on cards/buttons.
- **Geocities:** Optional tiled background, animated or “under construction” flair via extra rules in the Geocities block.

---

## Risk / notes

- Loading a new font on theme switch can cause a brief reflow; loading all theme fonts up front avoids this.
- Keep theme CSS to token overrides + minimal extra rules so future token changes don’t require editing multiple places.
