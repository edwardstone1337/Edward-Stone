# Design Token Architecture

## Token File: `assets/css/dev-tokens.css`

All tokens use the `dp-` prefix and follow a three-layer atomic model:

1. **Primitives** — Raw values (spacing, radii, typography, colours). Defined on `:root`.
2. **Semantic** — Purpose-driven tokens (surfaces, text, borders, accents). Base values on `:root` (dark-first defaults).
3. **Component** — Scoped to specific UI (buttons, nav, strips, paper). Mostly in `:root`; some theme-specific tweaks live under `[data-theme="light"]`.

**Light theme:** `[data-theme="light"] { … }` in the same file remaps semantic/component tokens for full light pages. On **`main`**, most public HTML sets `data-theme="light"` on `<html>`. **`dev/design-system.html`** can switch themes via pre-init + toggle. Contextual light tokens (e.g. `--dp-paper-surface-light`) still support light-in-dark pockets where needed.

**Print:** an `@media print { :root { … } }` block at the end of the file holds the `--dp-print-*` scale for the resume PDF export, plus the light values print needs (print can't rely on the runtime `data-theme` attribute). It also overrides `--dp-font-display`/`--dp-font-body` to a self-hosted static `"Inter Print"` family (`assets/css/print-fonts.css`, loaded only by `resume.html`) ahead of the Google Fonts variable `Inter` — Chrome embeds a variable font as Type 3 when printing to PDF, which breaks ATS text extraction, so print gets true static font files instead. `getComputedStyle` cannot read any of this outside an actual print context — the design system page shows it as a transcribed table for that reason.

### Where values may live

Two files may carry raw token **values**:

- **`dev-tokens.css`** — the primary source of truth.
- **`assets/css/project-*.css`** — a per-project theme layer, scoped to `[data-project="…"]`, re-skinning semantic tokens for one page. `project-scp-reader.css` is the reference example; `project-planner.css` (Planner prototype, `--pl-*` token sheet) follows the same pattern — see below. Structurally this is the same idea as `[data-theme="light"]`, scoped to a project rather than a theme.

**`dev-styles.css` may not carry values.** It's the shared component layer. It may define *scoped* tokens on a class, but only ones that reference existing tokens — `.dp-counter` and `.dp-strip--scp` are the reference examples. Pointing an existing token at a raw literal there (e.g. `.dp-strip--kaomoji { --dp-strip-bg: #141414; }`) is the drift this rule exists to prevent, and `./scripts/check-token-hygiene.sh` fails the build on it.

The live reference for every token below is `dev/design-system.html` — sections 2–3 render swatches directly from the token file, so they can't fall out of date.

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

### Brand

| Token | Value | Use |
|-------|-------|-----|
| `--dp-raw-brand` | `#0066CC` | Primary brand blue — feeds `--dp-brand-text`, `--dp-accent` (both themes), and the nav logo gradient's `-to` stop |
| `--dp-raw-brand-deep` | `#004C99` | Deepened brand blue for light text on brand-coloured surfaces at body size or smaller. `--dp-raw-brand` carries white at only 5.57:1 — AA, but under this repo's AAA target of 7:1 for normal-size text. `--dp-raw-brand-deep` reaches ~8.4:1 against pure white and 7.91:1 against `--dp-raw-grey-50` (the off-white the cursor-chat bubble text uses). Used by `cursor-chat.css` for the cursor-chat bubble and dot (so every page carrying cursor-chat picks it up), and by `index.html` for the "Let's talk" panel background |

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

### Planner Token Sheet (`project-planner.css`)

The Planner prototype's per-project theme file — `--pl-*` tokens scoped to `[data-project="planner"]`, the reference example of a project theme file (alongside `project-scp-reader.css`). Planner components (`assets/js/dev-projects/planner/*`) consume only `--pl-*` tokens — this file is the single place a future prototype re-skins by overriding the token sheet, never by forking the components.

Values are sourced from the real `@inquisitive/ui` design system rather than invented: `--pl-line-strong` (resting card/row border) is grey-5 `#d9d9d9`; `--pl-good` (progress fill) is success green-6 `#52c41a`; `--pl-progress-height` is 8px (`ProgressBar size="sm"`); `--pl-canvas` / `--pl-canvas-strong` (`#fdfdfe` / `#f8f9fa`) are that system's cool-grey surface tiers, used for the frame body's ground and the Kanban columns / recommendation tray respectively — a three-tier canvas → tray/column → bordered-card stack. Brand accent is `--pl-accent: #531DAB` (purple-7, Edward's brand colour, 9.85:1 on white — AAA for normal text).

`.pl-compact` is a size-variant class (applied alongside `[data-project="planner"]` on the homepage's `.dp-case-promo__widget` mount) that shrinks only geometry tokens (`--pl-column-width`, `--pl-column-gap`, `--pl-card-gap`) for the compact embed — colour/radius/typography tokens are untouched, so the compact widget and the full `projects/planner.html` page share one visual identity at two densities.

The simulated product window (`.pl-frame` — titlebar, body, tab bar) is Planner-internal today; its CSS lives in this same file rather than a shared `dev-styles.css` component, but is intended for extraction once a second embedded-prototype consumer needs it.

## Shared CSS Components (in `dev-styles.css`)

**Check this table before writing new CSS.** A class is listed if it's used on 2+ pages, is a sitewide JS-injected widget, is accessibility-load-bearing, or is a documented extensible pattern. Modifiers and variants are grouped onto their parent component's row. Ordered by how central the component is, not alphabetically.

Single-page bespoke layout is intentionally left out — the resume page internals, the 404 page, and homepage-only sections (side quests, toolbox, split rows, hero card, logo bar). Read that page's own CSS block instead of reaching for these.

**Keeping this table and the reference page in sync:** when a new reusable `.dp-*` component meets the bar above, add it to this table **and** give it a demo in the "6. Organisms" tier of `dev/design-system.html`, in the same change. The two use the same inclusion test, so a component that earns one earns the other — and they only stay accurate if they move together.

| Class | Line | Purpose |
|-------|------|---------|
| `.dp-nav`, `.dp-nav-inner`, `.dp-nav--hidden` | ~563 | Fixed top nav bar shell (hides on scroll-down). Injected on every public page by `nav-component.js` via `#nav-container` — never hand-write nav markup |
| `.dp-nav-brand`, `.dp-nav-logo(-bg/-swirl/-grad-start/-grad-end)`, `.dp-nav-name` | ~597 | Nav logo mark + wordmark, left side of the bar |
| `.dp-nav-actions`, `.dp-nav-links`, `.dp-nav-link` | ~638 | Desktop nav link row; `.dp-nav-link[aria-current="page"]` marks the active page (a11y) |
| `.dp-nav-dropdown`, `-trigger`, `-menu`, `-item` | ~747 | Desktop "More" dropdown for overflow nav links |
| `.dp-nav-hamburger`, `-label` | ~788 | Mobile hamburger button (≤768px), toggles the drawer |
| `.dp-nav-drawer`, `-backdrop`, `-panel`, `-close`, `-links`, `-heading`, `-link`, `--open` | ~802 | Mobile right-side nav drawer. Focus-trapped + scroll-locked (`.dp-overlay-active`) — see `docs/architecture-nav.md` |
| `.dp-skip-link` | ~3773 | "Skip to content" link, first focusable element on every page. WCAG AAA requirement — do not remove |
| `.dp-page` | ~1090 | Root `<main>` wrapper on every page — sets base page padding/max-width |
| `.dp-footer`, `-inner`, `-text`, `-links`, `-link` | ~2754 | Sitewide footer (copyright, links). Hosts the page counter widget |
| `.dp-counter`, `__track`, `__digit`, `__reel` | ~2805 | Animated visit-count digits in the footer. Injected by `page-counter.js`, called on nearly every public page |
| `.dp-banner-ticker`, `__track`, `__content`, `__separator` | ~207 | Scrolling "currently open to new opportunities" marquee. Injected by `banner-ticker.js`, dynamically imported on every public page |
| `.dp-back-to-top` | ~985 | Floating scroll-to-top button. Injected by `back-to-top.js`, loaded via `<script src>` on every page except 404 |
| `.dp-reveal`, `.dp-revealed` | ~3656 | Scroll-triggered fade/slide-in entrance animation, applied via `effects.js` (IntersectionObserver). Fully respects `prefers-reduced-motion` — add `.dp-reveal` to any section you want to animate in |
| `body.dp-overlay-active` | ~3212 | Body class that locks background scroll while any overlay (nav drawer, lightbox, modal) is open. Toggled by 6+ overlay modules — pair with focus trapping per `docs/code-review.md` |
| `.dp-no-transition` | ~7 | Suppresses CSS transitions during the theme pre-init flash-guard. See `docs/theme-init-pattern.md` |
| `.dp-noise` | ~1352 | Subtle SVG noise texture overlay on `<body>`, `aria-hidden`. Injected sitewide by `effects.js` |
| `.dp-btn`, `-primary`, `-secondary`, `-primary-on-dark`, `-secondary-on-dark`, `-secondary-on-light`, `-icon` | ~106 | The button component. Pick the `-on-dark`/`-on-light` variant to match the surface it sits on — never restyle a raw `<button>` |
| `.dp-dropdown-menu` | ~697 | Shared glass dropdown (blur, border, shadow). Reused by the nav dropdown and the resume download menu — reach for this before inventing a new popover style |
| `.dp-snackbar`, `--visible` | ~3438 | Fixed bottom toast notification, glass bg + slide-up transition. Currently triggered from the resume page (download/print feedback); styled as a sitewide primitive |
| `.dp-hero`, `-heading`, `-line`, `-accent`, `-body` | ~1107 | Standard page-top hero (overline + heading + intro paragraph) used on the homepage and every case study / project page. Not the homepage's split hero — that's `.dp-hero--split` (excluded, index-only) |
| `.dp-overline` | ~93 | Small uppercase eyebrow label, typically sits above a hero heading or section title |
| `.dp-contact-cta`, `__heading`, `__body`, `__actions` | ~2332 | "Let's talk" closing CTA block. Hard-coded on the homepage, injected via `initContactCta()` on resume and all 4 case studies + Prang Out |
| `.dp-read-more`, `__heading`, `__list`, `__link` | ~2229 | "Read more" related-links list at the end of a case study. Injected by `case-study-read-more.js` on all 4 case studies + Prang Out |
| `.dp-prose`, `-section`, `-layout` | ~2475 | Long-form article wrapper for case-study body copy (headings/paragraphs/lists styled via bare-tag selectors inside `.dp-prose`) |
| `.dp-prose-image`, `-figure`, `-figure--wide`, `-figure--full`, `-caption` | ~2531 | Captioned image inside a case-study article, with wide/full-bleed size variants |
| `.dp-pullquote` | ~2437 | Large blockquote-style pullquote inside case-study prose |
| `.dp-tldr`, `__heading`, `__list`, `__item` | ~2692 | "TL;DR" summary callout box near the top of a case study |
| `.dp-impact-banner`, `__item`, `__value`, `__label` | ~2657 | Row of stat tiles (metric + label) inside a case study |
| `.dp-testimonial`, `-quote`, `-attribution`, `-details`, `-name`, `-role` | ~2004 | Single testimonial quote card |
| `.dp-testimonials`, `-section`, `-grid`, `-track`, `-masonry`, `--full` | ~2066 | Layout wrappers for arranging multiple `.dp-testimonial` cards (scroll track on homepage, masonry grid on Planner) |
| `.dp-card`, `-inner`, `-content`, `-title`, `-description`, `-grid` | ~1450 | Project card component (hover-glow tracks cursor via `effects.js`). Generated by `project-card.js` / `projects-grid.js` — don't hand-roll card markup |
| `.dp-card-media`, `-media-iframe`, `-media-placeholder`, `-media-fade` | ~1498 | Media slot inside a project card (image, iframe preview, or loading placeholder) |
| `.dp-strip`, `-inner`, `-content`, `-media`, `-title`, `-description`, `-badge(s)`, `-logo`, `-orbs`, `-skeleton`, `--compact`, `--flipped`, `--interactive`, `--scp`, `--flip7`, `--kaomoji` | ~1657 | Branded product strip — the most systematised pattern in the codebase. Brand a new one with **tokens only, no new CSS**: see `docs/strip-branding-spec.md`. Homepage-only today and `data-prod-hide`, but built for reuse |
| `.dp-lightbox`, `-backdrop`, `-close` | ~3216 | Shared modal/lightbox shell (backdrop + close button). Reused by the image lightbox, the resume lightbox, and the homepage "bears" modal — reach for this instead of building a new overlay |
| `.dp-about-lightbox__body`, `-image`, `-panel`, `-description`, `-prev`, `-next` | ~3315 | Prev/next image + caption content panel inside the lightbox shell. Used on gallery.html and index.html via `image-lightbox.js` |
| `.dp-gradient-text` | ~1347 | Gradient-fill text utility, used on gallery.html and 404.html headings |

Nav-specific selectors are documented in `docs/architecture-nav.md`.

## Legacy System

`assets/css/tokens.css` + `assets/css/style.css` — the original token system without `dp-` prefix. Only used by `dev/old-index.html` and `dev/component-preview.html`. Being phased out. Do not add new tokens here.
