# Nav light-theme gaps — blast radius (read-only)

Discovery report: nav dropdown and drawer on case study pages (light theme). No code changes.

---

## Section 1: Classes + inline styles (dropdown, drawer)

**Source:** `assets/js/dev-projects/nav-component.js`

### Dropdown menus (overflow/flyout under nav items)

| Element | CSS classes | Inline styles |
|--------|-------------|---------------|
| Wrapper | `dp-nav-dropdown` | — |
| Trigger button | `dp-nav-link`, `dp-nav-dropdown-trigger` | — |
| Menu container | `dp-dropdown-menu`, `dp-nav-dropdown-menu` | — |
| Menu items | `dp-nav-dropdown-item` (on `<a>`) | — |

JS sets only attributes: `aria-expanded` ("true" / "false"), `hidden` (present when closed, removed when open). No inline styles on dropdown elements.

### Mobile drawer (slide-out panel)

| Element | CSS classes | Inline styles |
|--------|-------------|---------------|
| Drawer root | `dp-nav-drawer` | — |
| Backdrop | `dp-nav-drawer-backdrop` | — |
| Panel | `dp-nav-drawer-panel` | — |
| Close button | `dp-nav-drawer-close` | — |
| Links container | `dp-nav-drawer-links` | — |
| Group heading | `dp-nav-drawer-heading` | — |
| Link | `dp-nav-drawer-link` | — |

JS sets:
- **On drawer root:** `hidden` (present when closed, removed when open); class `dp-nav-drawer--open` when open.
- **On `document.body`:** `style.overflow = 'hidden'` when drawer opens, `style.overflow = ''` when it closes.

No other inline styles on drawer elements.

### data-theme awareness

**None.** The nav component does not read or react to `data-theme`. No `getAttribute('data-theme')`, no theme checks, no class toggles. It relies entirely on CSS tokens and selectors; if tokens are not remapped for `[data-theme="light"]`, nav dropdown/drawer will keep dark-only values.

---

## Section 2: Token usage table (dropdown & drawer)

**Source:** `assets/css/dev-styles.css`. Only rules that target the classes from Section 1.  
Format: selector | property | token or value.

| Selector | Property | Token or value |
|----------|----------|----------------|
| `.dp-nav` | background | `var(--dp-glass-bg)` |
| `.dp-nav` | border-bottom | `1px solid var(--dp-border-default)` |
| `.dp-nav-link` | color | `var(--dp-text-primary)` |
| `.dp-nav-link:hover` | background | `var(--dp-toggle-bg-hover)` |
| `.dp-nav-link:focus-visible` | outline | `2px solid var(--dp-accent)` |
| `.dp-nav-link[aria-current="page"]` | background | `var(--dp-toggle-bg-hover)` |
| `.dp-dropdown-menu` | background | **hardcoded** `rgba(30, 30, 30, 0.95)` |
| `.dp-dropdown-menu` | border | `1px solid var(--dp-border-default)` |
| `.dp-dropdown-menu` | box-shadow | **hardcoded** `0 8px 32px rgba(0, 0, 0, 0.12)` |
| `.dp-dropdown-menu a, .dp-dropdown-menu button` | color | `var(--dp-text-primary)` |
| `.dp-dropdown-menu a:hover, .dp-dropdown-menu button:hover` | background | `var(--dp-toggle-bg-hover)` |
| `.dp-dropdown-menu a:focus-visible, .dp-dropdown-menu button:focus-visible` | outline | `2px solid var(--dp-accent)` |
| `.dp-nav-dropdown-menu a[aria-current="page"]` | background | `var(--dp-toggle-bg)` |
| `.dp-nav-drawer-backdrop` | background | `var(--dp-bg-overlay)` |
| `.dp-nav-drawer-panel` | background | `var(--dp-glass-bg)` |
| `.dp-nav-drawer-panel` | border-left | `1px solid var(--dp-border-default)` |
| `.dp-nav-drawer-close` | background | `var(--dp-toggle-bg)` |
| `.dp-nav-drawer-close` | color | `var(--dp-text-primary)` |
| `.dp-nav-drawer-close:hover` | background | `var(--dp-toggle-bg-hover)` |
| `.dp-nav-drawer-close:focus-visible` | outline | `2px solid var(--dp-accent)` |
| `.dp-nav-drawer-heading` | color | `var(--dp-text-secondary)` |
| `.dp-nav-drawer-link` | color | `var(--dp-text-primary)` |
| `.dp-nav-drawer-link:hover` | background | `var(--dp-toggle-bg-hover)` |
| `.dp-nav-drawer-link[aria-current="page"]` | background | `var(--dp-toggle-bg)` |
| `.dp-nav-drawer-link:focus-visible` | outline | `2px solid var(--dp-accent)` |

**Hardcoded values (not tokens):**
- `.dp-dropdown-menu` — `background: rgba(30, 30, 30, 0.95);` (dark panel)
- `.dp-dropdown-menu` — `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);`

**Note:** `.dp-nav` and `.dp-nav-logo` have light-theme overrides in `case-study-theme.css` (opaque white bar, dark ring). Dropdown and drawer have no overrides there.

---

## Section 3: Covered vs missing tokens in case-study-theme.css

**Source:** `assets/css/case-study-theme.css` — `[data-theme="light"]` block only.

### Tokens currently remapped for light

- `--dp-bg-base`, `--dp-bg-raised`, `--dp-bg-card`, `--dp-bg-card-hover`, `--dp-bg-overlay`
- `--dp-text-primary`, `--dp-text-secondary`, `--dp-text-tertiary`, `--dp-text-ghost`
- `--dp-border-default`, `--dp-border-hover`, `--dp-border-active`, `--dp-border-divider`
- `--dp-glass-bg`, `--dp-glass-bg-mid`, `--dp-glass-bg-elevated`
- `--dp-accent-glow`
- `--dp-btn-*` (primary set)
- `--dp-toggle-bg`, `--dp-toggle-bg-hover`, `--dp-toggle-icon`
- `--dp-hero-accent-from/to`, `--dp-gradient-text-from/to`
- `--dp-card-text-primary`, `--dp-card-text-secondary`
- `--dp-tldr-bg`, `--dp-tldr-border`

### Tokens used by dropdown/drawer (Section 2) — status

| Token | Used by | In case-study-theme.css? |
|-------|--------|---------------------------|
| `--dp-glass-bg` | .dp-nav, .dp-nav-drawer-panel | ✅ Yes |
| `--dp-border-default` | .dp-nav, .dp-dropdown-menu, .dp-nav-drawer-panel | ✅ Yes |
| `--dp-text-primary` | .dp-nav-link, .dp-dropdown-menu a/button, .dp-nav-drawer-close, .dp-nav-drawer-link | ✅ Yes |
| `--dp-toggle-bg-hover` | .dp-nav-link:hover, .dp-dropdown-menu hover, .dp-nav-drawer-link:hover, .dp-nav-drawer-close:hover | ✅ Yes (via --dp-toggle-bg-hover) |
| `--dp-toggle-bg` | .dp-nav-dropdown-menu a[aria-current], .dp-nav-drawer-close, .dp-nav-drawer-link[aria-current] | ✅ Yes |
| `--dp-accent` | All focus-visible outlines | ❌ **Not remapped** (light theme uses same accent; OK for focus ring) |
| `--dp-bg-overlay` | .dp-nav-drawer-backdrop | ✅ Yes |

**Missing for light theme (blast radius):**

1. **Dropdown menu background** — Not tokenised. Rule uses **hardcoded** `rgba(30, 30, 30, 0.95)`. So on light pages the dropdown stays dark and is not affected by any token remap. To fix: either introduce a token (e.g. `--dp-dropdown-bg` or reuse `--dp-glass-bg-elevated`) and use it in dev-styles.css, then set it in case-study-theme.css for light, or add a direct override in case-study-theme.css for `[data-theme="light"] .dp-dropdown-menu { background: ... }`.

2. **Dropdown menu box-shadow** — Hardcoded `0 8px 32px rgba(0, 0, 0, 0.12)`. Works on light but could be tokenised for consistency; not a functional gap.

All **token** usages for nav/dropdown/drawer are covered in case-study-theme.css **except** that the dropdown panel itself is not using a token — it’s the hardcoded dark value that creates the visible gap.

---

## Section 4: Existing light primitives in dev-tokens.css

**Source:** `assets/css/dev-tokens.css`. Tokens whose name contains "light".

| Token | Value |
|-------|--------|
| `--dp-raw-accent-light` | #7C85E0 |
| `--dp-paper-surface-light` | #FFFFFF |
| `--dp-paper-text-primary-light` | #111113 |
| `--dp-paper-text-secondary-light` | #5A6170 |
| `--dp-paper-border-light` | rgba(0, 0, 0, 0.06) |
| `--dp-paper-shadow-light` | 0 8px 32px rgba(0, 0, 0, 0.12) |
| `--dp-paper-accent-light` | #5E6AD2 |

These are “contextual light” tokens for use **within** the default dark theme (e.g. resume/paper in light mode). They are not used by the nav. The nav uses semantic tokens (`--dp-glass-bg`, `--dp-toggle-bg`, etc.) which case-study-theme.css remaps for `[data-theme="light"]`.

---

## Section 5: Legacy light values (tokens.css)

**Source:** `assets/css/tokens.css`.

- **No `[data-theme="light"]` block** and no theme-based overrides. The legacy system is single-theme.
- Semantic tokens are **light-by-default**: e.g. `--color-background-primary: var(--color-grey-0)` (white), `--color-text-primary: var(--color-grey-1000)` (black), `--color-border: var(--color-grey-300)`.
- Surfaces: `--color-background-surface: var(--color-grey-0)`, `--color-background-surface-alt: var(--color-grey-50)`, `--color-background-surface-subtle: var(--color-grey-100)`.
- Shadows: `--shadow-blur-light`, `--shadow-blur-medium`, etc. use dark rgba values (e.g. `rgba(0, 0, 0, 0.08)`).
- **Drawer:** `--shadow-drawer: -2px 0 10px rgba(0, 0, 0, 0.3)`.

These can inform **values** for a light-theme dropdown/drawer (e.g. light surface, dark text, subtle shadow) but are not wired to the dev nav (which uses `dp-` tokens only).

---

## Summary

- **Nav JS:** No theme awareness; behaviour is theme-agnostic. Only body overflow is set inline; no inline styles on dropdown/drawer nodes.
- **Gap:** The **dropdown menu** is the main problem: its background is hardcoded `rgba(30, 30, 30, 0.95)` in dev-styles.css, so it never switches for light. All other nav/dropdown/drawer visuals use tokens that are already remapped in case-study-theme.css.
- **Fix direction:** Either (1) add a token for dropdown menu background (and optionally shadow), use it in dev-styles.css, and set it in case-study-theme.css for `[data-theme="light"]`, or (2) add `[data-theme="light"] .dp-dropdown-menu { background: ... }` (and optionally panel styling for drawer if any edge cases appear) in case-study-theme.css. Drawer and rest of nav already use tokens that light theme remaps.
