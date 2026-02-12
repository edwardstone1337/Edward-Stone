# Design Token Architecture

## Token File: `assets/css/dev-tokens.css`

All tokens use the `dp-` prefix and follow a three-layer atomic model:

1. **Primitives** — Raw values (spacing, radii, typography, colours). Defined on `:root`.
2. **Semantic** — Purpose-driven tokens (surfaces, text, borders, accents). Defined on `:root` (dark-only, single theme).
3. **Component** — Scoped to specific UI (buttons, nav, strips, paper). Defined within the same `:root` block.

The site is dark-only. All semantic and component tokens are defined in a single `:root` block — there are no `[data-theme]` selector overrides. Contextual light tokens (e.g. `--dp-paper-surface-light`) exist for embedded light surfaces within the dark theme.

## Key Token Groups

### Spacing & Radius (Static)

| Token | Value | Use |
|-------|-------|-----|
| `--dp-space-xs` through `--dp-space-3xl` | 4px–64px | 8pt grid system |
| `--dp-radius-sm` | 8px | Buttons, small components |
| `--dp-radius-md` | 12px | Cards, glass panels |
| `--dp-radius-lg` | 16px | Large cards |
| `--dp-radius-xl` | 24px | Strips, testimonials |
| `--dp-radius-full` | 9999px | Pills, badges |

### Glass Backgrounds

Semi-transparent composited surfaces with backdrop blur.

| Token | Value | Use |
|-------|-------|-----|
| `--dp-glass-bg` | `rgba(255,255,255, 0.05)` | Base glass surface |
| `--dp-glass-bg-mid` | `rgba(30,30,30, 0.55)` | Dialogs, panels |
| `--dp-glass-bg-elevated` | `rgba(30,30,30, 0.85)` | Dropdown menus, modals |

### Borders

| Token | Value |
|-------|-------|
| `--dp-border-default` | `rgba(255,255,255, 0.06)` |
| `--dp-border-hover` | `rgba(255,255,255, 0.12)` |
| `--dp-border-active` | `rgba(255,255,255, 0.20)` |
| `--dp-border-divider` | `rgba(255,255,255, 0.04)` |

### Toggle Buttons

| Token | Value |
|-------|-------|
| `--dp-toggle-bg` | `rgba(255,255,255, 0.06)` |
| `--dp-toggle-bg-hover` | `rgba(255,255,255, 0.10)` |

### Nav (Static)

| Token | Value | Use |
|-------|-------|-----|
| `--dp-nav-action-height` | 40px | Shared height for nav links, toggles, hamburger button |

### Paper

Used for document-like surfaces (resume page). Contextual light variants (`--dp-paper-*-light`) exist for embedded light surfaces within the dark theme.

| Token | Value |
|-------|-------|
| `--dp-paper-surface` | `#18181B` |
| `--dp-paper-text-primary` | `#F7F8F8` |
| `--dp-paper-text-secondary` | `#95A2B3` |
| `--dp-paper-border` | `rgba(255,255,255, 0.08)` |
| `--dp-paper-shadow` | `0 8px 40px rgba(0,0,0, 0.5)` |
| `--dp-paper-accent` | `#5E6AD2` |
| `--dp-paper-surface-light` | `#FFFFFF` |
| `--dp-paper-text-primary-light` | `#111113` |
| `--dp-paper-text-secondary-light` | `#5A6170` |

### Product Strips

Each product has its own strip token set for branded sections on the homepage:

- **Fair Share**: `--dp-strip-bg`, `--dp-strip-orb-1`, `--dp-strip-orb-2`, `--dp-strip-title-color`, `--dp-strip-text-color`, `--dp-strip-badge-bg`, `--dp-strip-badge-text`
- **SCP Reader**: `--dp-strip-scp-bg`, `--dp-strip-scp-orb-1`, `--dp-strip-scp-orb-2`, `--dp-strip-scp-title-color`, `--dp-strip-scp-text-color`, `--dp-strip-scp-badge-bg`, `--dp-strip-scp-badge-text`
- **Flip 7**: `--dp-strip-flip7-bg`, `--dp-strip-flip7-orb-1`, `--dp-strip-flip7-orb-2`, `--dp-strip-flip7-title-from`, `--dp-strip-flip7-title-to` (uses LCh colour model for perceptual uniformity)

Full token contract: `docs/strip-branding-spec.md`.

## Shared CSS Components (in `dev-styles.css`)

These reusable class patterns are available to any page using the dev system:

| Class | Line | Purpose |
|-------|------|---------|
| `.dp-dropdown-menu` | ~300 | Glass dropdown with blur, border, shadow. Used by nav and download widget |
| `.dp-page-content` | ~694 | Content wrapper — top padding accounts for 64px fixed nav |
| `.dp-snackbar` | ~1924 | Fixed bottom toast notification with glass bg and slide-up animation |
| `.dp-snackbar--visible` | ~1945 | Visible state (opacity + transform transition) |

Nav-specific selectors are documented in `docs/architecture-nav.md`.

## Legacy System

`assets/css/tokens.css` + `assets/css/style.css` — the original token system without `dp-` prefix. Only used by `dev/old-index.html` and `dev/component-preview.html`. Being phased out. Do not add new tokens here.
