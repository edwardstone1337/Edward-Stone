# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Gallery page** (`gallery.html`): New public page showcasing design work — masonry grid layout (3/2/1 columns), data-driven via `assets/data/gallery.json`, scroll-reveal animations, GA4 tagged. Uses dev system tokens.
- **Gallery JS** (`assets/js/dev-projects/gallery.js`): ES6 module fetches gallery.json, renders masonry grid with category metadata, handles image errors gracefully (shows alt text placeholder), integrates with effects.js reveal system. Sanitises all dynamic content.
- **Gallery CSS** (`assets/css/gallery.css`): Masonry styles using CSS columns, responsive breakpoints (3→2→1 columns), hover lift, error state with alt text fallback, respects `prefers-reduced-motion`.
- **Gallery data** (`assets/data/gallery.json`): 15 images (Playsport UI, logos, illustrations, posters) with alt text, dimensions, categories.
- **Gallery workflow script** (`scripts/gallery-add.sh`): CLI tool to add images — resizes to 800px wide, converts to webp, appends entry to gallery.json. Requires cwebp and jq.
- **Gallery docs** (`docs/gallery-workflow.md`): Workflow documentation for adding images.
- **Release playbook** (`docs/release-playbook.md`): Checklist for preparing releases.

### Changed
- **Nav component**: Added "Gallery" link to main navigation. Snake game now loads dynamically via `loadSnakeGame()` instead of per-page `<script>` tags.
- **Snake game loading**: Removed inline `<script src="snake-game.js">` from 404.html, index.html, resume.html — nav component now loads it once via ES module resolution.

### Added
- **Nav component** (`assets/js/dev-projects/nav-component.js`): Shared site navigation rendered via JS. Injects into `#nav-container`. Desktop: dropdown menus with Projects submenu (Fair Share, SCP Reader) and Resume link. Mobile (≤768px): hamburger opens right-side drawer with grouped links. Accessible: `aria-expanded`, `aria-haspopup`, focus trap, Escape close.
- **Resume page** (`resume.html`): Standalone resume moved from index.html. Full A4 layout with download widget (Print to PDF, static PDF, copy to clipboard). Uses nav component.
- **Snackbar component** (`assets/js/dev-projects/snackbar.js`): Reusable toast notification. `showSnackbar(message, duration?)` — appends to body, auto-dismisses (default 2s), replaces if called while visible (no stacking), `role="status"` + `aria-live="polite"`, respects `prefers-reduced-motion`. Styles in `dev-styles.css` (`.dp-snackbar`). z-index 20000 (above lightbox).

### Changed
- **Resume lightbox**: Redesigned layout — content area + sidebar with Download Resume dropdown (Print to PDF, Download PDF, Copy to clipboard). Close button moved outside content. Copy now uses `showSnackbar()` instead of title tooltip. Scroll lock on both `<html>` and `<body>`. Click on lightbox container (outside content) closes it; backdrop has `pointer-events: none` so scroll works everywhere.
- **Navigation refactor**: All public pages (index.html, 404.html, fair-share.html, scp-reader.html, features-users-return.html) now use `<div id="nav-container"></div>` + `import { initNav }` pattern instead of inline nav HTML. Reduces duplication; single source for nav links.
- **Nav styles** (`dev-styles.css`): Added `.dp-nav-links`, `.dp-nav-link`, `.dp-nav-dropdown`, `.dp-nav-dropdown-trigger`, `.dp-nav-dropdown-menu`, `.dp-nav-hamburger`, `.dp-nav-drawer`, `.dp-nav-drawer-*` classes. Dropdown menu uses glass bg + blur. Drawer slides in from right. Hamburger hidden on desktop, shown at ≤768px.
- **Index.html**: Resume section removed (now at `/resume.html`). Skip link still targets `#projects`.

### Changed
- **Flip 7 strip (index)**: Title set to "I'm bad at maths, so I built an app"; description updated to mention scores, modifiers, running totals and focus on game vs arithmetic. Iframe preview uses `visibility: hidden`.
- **Copy, typography**: Replaced em dashes (—) with comma, period, or colon across user-facing copy: page titles, meta og:title, aria-labels, hero and strip body text, resume role titles, project descriptions in projects.json, design system labels (dev/design-system.html), case study title, 404 and Flip 7 preview titles. Flip 7 card face placeholder changed from em dash to period. Details in docs/em-dash-replacement-report.md.
- **CTA card (case studies)**: Fair Share and SCP Reader "What's Next" CTA card background changed from glass (backdrop-filter) to semi-opaque solid (rgba dark/light) for more reliable rendering; light theme uses rgba(255,255,255,0.92).

### Fixed
- **Layout, overflow**: html and body set to overflow-x: clip to prevent horizontal scroll. Hero heading: text-wrap: balance on .dp-hero-line; smallest breakpoint uses max-width: 20ch and margin-inline: auto; removed overflow-x/y from .dp-hero in overlay-active breakpoint.
- **Reveal on load**: .dp-reveal elements already in the viewport on load are revealed immediately (0ms transition delay) so hero and above-fold content show without waiting for scroll; effects.js.

### Added
- **Glow section utility**: .dp-glow-section (position: relative) for sections with blurred glow ::before; will-change: transform on .dp-glow::before and project glow pseudo-elements (Fair Share, SCP Reader) for animation performance.
- **Fair Share strip**: "Learn more" primary button (`.dp-btn-primary-on-dark`) linking to `projects/fair-share.html`; secondary "Go to Fair Share" for external link.
- **Secondary-on-light button**: `.dp-btn-secondary-on-light` and tokens `--dp-btn-secondary-on-light-*` (text, border, hover-bg, focus-ring) for outline buttons on light overlays; light + dark theme in dev-tokens.
- **Resume print tokens**: `--dp-print-name`, `--dp-print-tagline`, `--dp-print-body`, `--dp-print-role-title`, `--dp-print-meta`, `--dp-print-section-title`, `--dp-print-leading`, `--dp-print-leading-tight`, `--dp-print-section-gap`, `--dp-print-role-gap`, `--dp-print-column-gap`, `--dp-print-li-gap`, `--dp-print-page-v`, `--dp-print-page-h`; used in `@media print` for resume lightbox typography and spacing.
- **Page section spacing**: `.dp-page section p + h3` — margin-top `var(--dp-space-12)` for breathing room when h3 follows paragraph (e.g. Product Decisions pattern).
- **Strip logo**: `.dp-strip-logo` — img in emoji slot (36×36px); `.dp-strip--scp .dp-strip-logo` white filter on dark strip; SCP Reader strip uses `scp-logo.svg`.
- **Project case study pages**: `projects/fair-share.html`, `projects/scp-reader.html` — full case studies linked from homepage strips; project-specific CSS (`project-fair-share.css`, `project-scp-reader.css`); `growth-chart.js` (Chart.js line chart) for Fair Share Origin/Growth section.

### Added (continued)
- **Fixed nav bar**: `.dp-nav` — glass-style fixed bar with brand (logo + name) and `#dp-nav-actions` (theme toggle, snake toggle). Toggles inject into nav when present, else body.
- **404 page** (`404.html`): Minimal page with nav, gradient 404, "Go home" / "Play Snake instead". `window.SnakeGame.open()` exposed for external pages. Inline theme init (no flash); favicon; meta robots noindex.
- **Resume download widget**: Dropdown with PDF, copy-to-clipboard. `resume-download.js`. Mobile duplicate below resume.
- **Resume lightbox**: Click resume → fullscreen lightbox (desktop ≥1080px) with download CTA. `resume-lightbox.js`; focus trap, Escape, backdrop click.
- **SCP Reader strip**: Featured strip in split-row (2/3 + 1/3) — `.dp-strip--compact`, `.dp-strip--scp` theme. Excluded from projects grid. projects.json: URL scp-reader.co.
- **Split row**: `.dp-split-row` for side-by-side layout. **Testimonial card** `.dp-testimonial` in 1/3 slot — Jason Allen quote, glass styling, gradient decorative mark.
- **Secondary button**: `.dp-btn-secondary` — transparent, bordered.
- **Resume/paper tokens**: `--dp-paper-*` (surface, text, border, shadow, accent) light + dark.
- **Resume files**: `assets/files/Resume.pdf`.
- **Resume glow**: effects.js adds cursor-reactive glow to resume container (same pattern as cards).
- **dev/design-system.html**: Design system living reference — tokens, swatches, utility demos (noise, glass, glow, shimmer, fade); uses dev-tokens + dev-styles.
- **Kaomoji strip (dev-projects)**: Featured strip for Kaomoji.click above Fair Share — flipped layout (content left, media right), dark monochrome theme `.dp-strip--kaomoji`; live iframe preview with postMessage theme sync. Strip-featured projects (Kaomoji, Fair Share) excluded from card grid to avoid duplication.
- **Back-to-top button (dev-projects)**: Glassy circle with logo SVG, left of snake toggle; smooth scroll to top. Same 40px circle style as theme/snake; logo has 2px white outer stroke ring (both themes), stroke drawn via separate circle so logo isn't cropped. `back-to-top.js`; styles in dev-styles.css. Included on index.html. (See Changed: now bottom-right, arrow icon, scroll-threshold.)
- **Product strip (dev-projects)**: Full-width Fair Share banner between hero and project grid — dark teal strip in both themes, orb gradient (teal + orange), device frame + content + CTA. `product-strip.js` renders strip from config; `strip-effects.js` (desktop only, hover-capable) adds cursor-reactive orbs with ambient Lissajous drift, opacity pulse (8s / 12s), and ±50px cursor nudge; mobile and prefers-reduced-motion keep CSS keyframe drift only. Strip tokens and `.dp-btn` / `.dp-btn-primary` in dev-tokens + dev-styles.
- **Avatar high-speed reveal (dev-projects)**: When spin reaches angular velocity ≥35 deg/frame, avatar swaps to `profile-spun.jpg` once per session and confetti bursts; confetti no longer on every spin. Asset `assets/images/profile-spun.jpg`.
- **Fair Share preview widget** (`assets/previews/fair-share/index.html`): Self-contained iframe preview for dev-projects — blurred orb gradient, theme-aware (light/dark), income/slider UI; listens for `theme-change` postMessage.
- **projects.json preview links**: Kaomoji.click and Fair Share Calculator now include `preview.src` for dev-projects product cards (Lost Cities already had one).
- **Favicon**: Added favicon link to index.html for improved branding.

### Changed
- **Fair Share strip orb**: `--dp-strip-orb-2` updated from amber (#a66b18) to pinky peach (#E8919B) in dark and light theme (dev-tokens.css).
- **Resume lightbox**: Backdrop `position: fixed`. Content wrapper and page container simplified (no max-height, aspect-ratio, overflow-y). Page padding `40px 56px`. Action buttons (Print/Copy) use secondary-on-light outline styling (light theme) and secondary-on-dark in dark theme; removed `dp-btn-secondary` from button markup.
- **Resume (screen)**: Body gap `24px`; section title margin-top `20px` (first-child `10px`); `.dp-resume-role + .dp-resume-role` spacing `16px`.
- **Resume (print)**: Typography and spacing refactored to print tokens; @page margin `15mm`; section/role gaps and first-child margin use tokens.
- **Side projects section order**: DOM order is now Hero → section label → Fair Share split-row → Kaomoji strip → SCP split-row → Resume → Footer. Skip link target `#projects` moved to Fair Share split-row wrapper. Full testimonial quotes (Bella Jagger, Jason Allen). SCP split-row uses `.dp-split-row--flipped` (testimonial left, strip right); at ≤768px both split-rows stack to single column. `.dp-testimonial-quote` font-size set to `var(--dp-text-base)` for longer quotes.
- **Fair Share strip**: Compact split-row layout — added `dp-strip--compact`, removed `.dp-strip-media` (skeleton), removed hidden "Learn more" button; wrapped in `.dp-split-row` with Bella Jagger testimonial (1/3). Same pattern as SCP strip; single "Go to Fair Share" CTA with `dp-btn-primary-on-dark`.
- **Testimonial card typography (Phase 2 patch)**: Decorative quote mark — absolute, large (8rem), Georgia, opacity 0.07 (flat colour, no gradient). Quote text — Georgia italic at `--dp-text-lg` (20px), `z-index: 1`. Attribution — `position: relative; z-index: 1` so both sit above the faint mark. Container `.dp-testimonial` already has `position: relative`.
- **Resume component (Phase 9)**: Animated border now matches card technique — dual-layer with `.dp-resume-container` (1px padding, ::before radial glow at z-index 1) and `.dp-resume-page` as masking layer (z-index 2, solid `--dp-paper-surface`, inset border-radius). Glow uses `--dp-accent-glow`, opacity 1 on hover. Removed phone number from resume contact in index.html (email and location kept). At 1080px: intro download centered via `.dp-resume-intro .dp-resume-download { display: flex; justify-content: center }`, mobile download spacing set to `--dp-space-10`. Mobile (≤1080px) resume text sizes updated for WCAG AA: body/secondary ≥16px/14px (tagline, summary, role-title, role-desc, role-achievements → base; section-title, role-meta, skill-list li, contact-item → sm).
- **Back-to-top**: Moved to bottom-right. Arrow icon (replaces logo). Visible only after 1 viewport scroll; prefers-reduced-motion respected.
- **Theme toggle / snake toggle**: Inject into `#dp-nav-actions` when present.
- **Snake game**: Public `window.SnakeGame.open()` for 404.
- **Theme init**: Removed `data-theme` from `<html>` in index.html and dev/design-system.html; theme is set by theme-toggle.js after load. Added surface fallbacks in dev-tokens.css (`:root`: --dp-bg-base, --dp-bg-raised, --dp-bg-card, --dp-bg-card-hover, --dp-bg-overlay, --dp-text-primary, --dp-text-secondary) so initial paint matches dark theme and avoids flash before JS runs. Added `.dp-no-transition` utility to suppress transitions on initial load; inline script applies it during theme set, double rAF at end of body removes it after first paint.

### Removed
- **Resume DOCX**: `assets/files/Resume.docx` deleted; download widget and docs now reference PDF only.
- **QA diagnostics**: Deleted `docs/qa/download-button-positions-1080px-2025-02-08.md`, `resume-animated-border-1280px-diagnostic-2025-02-08.md`, `resume-component-polish-discovery-2025-02-08.md`, `resume-border-diagnostic.html` — one-off findings, no longer needed.

### Fixed
- **Resume section mobile scroll void**: Tall resume section (`.dp-reveal--early`) now uses a second IntersectionObserver (threshold 0.05, rootMargin 200px bottom) so it reveals as the content above leaves view — no empty scroll gap on narrow viewports. Other `.dp-reveal` elements unchanged.
- **Reveal (prefers-reduced-motion)**: `.dp-reveal` under `prefers-reduced-motion: reduce` now uses `opacity: 1`, `transform: none`, `transition: none` — content visible immediately; previously used `opacity: 0` which hid content.
- **Fair Share case study**: Removed `overflow: clip` from `.dp-glow-section` so glass cards (growth chart, CTA) and backdrop-filter render fully; Origin/Growth/What's Next no longer clip. Testimonial breakout at ≥768px unchanged; no horizontal overflow.
- **Resume copy**: Log copy failures to console for debugging.
- **Kaomoji strip**: `.dp-strip-media` now uses `justify-self: center` for centered layout.
- **Snake game (dev-projects)**: Single Play button only — original button hidden when overlay opens, shown on teardown; close button no longer reskinned/appended to body (removed with overlay). State (cols, rows, offsetX, offsetY, colors) and overlayClosing reset in stopGame/teardown.
- **Avatar spin (dev-projects)**: Removed spin jolt by simplifying to per-frame momentum (no deltaTime). Wiggle disabled while spin is active so CSS transform no longer overrides inline rotate; cooldown clicks during spin now add velocity instead of triggering wiggle.

### Added (continued)
- **Side Quests data source**: Projects loaded from `assets/data/projects.json` (shared with dev-projects); graceful fallback to empty array on fetch error.
- **Snake button asset**: `assets/images/snake.svg` — inlined in snake-game.js with `currentColor` for theme-aware icon; used for Play Snake toggle.
- **Lost Cities preview widget** (`assets/previews/lost-cities/index.html`): Self-contained iframe preview for dev-projects 1:1 square slots
  - 6 expedition columns × 4 cards (wager + 2–4), flip on click, hover lift + color tint
  - Live score display (sum of flipped card values, no negatives)
  - No external CSS/JS/fonts; images in `images/` subfolder
- **Snake game (dev-projects page)**: Playable classic snake in full-screen overlay
  - `snake-game.js` — IIFE: top-left "Play Snake" button, overlay with canvas; arrow/WASD, eat food, avoid walls/body; score on canvas; game over + Space to restart; colours from dp- tokens; theme change mid-game (MutationObserver); resize debounced, focus trap, Escape to close; prefers-reduced-motion skips decorative pulse only
  - Styles in `dev-styles.css`: `.dp-snake-toggle` (top-left, mirror of theme toggle), `.dp-snake-overlay`, `.dp-snake-canvas`, `.dp-snake-toggle--in-overlay`; hidden at 768px
- **dev-projects.html redesign**: Standalone page with independent design system
  - `dev-tokens.css` — primitives + semantic tokens (light/dark)
  - `dev-styles.css` — atoms, molecules, organisms, effects, a11y (skip link, reduced-motion)
  - `theme-toggle.js` — system pref + manual toggle, persists to localStorage
  - `project-card.js` — glass card component
  - `projects-grid.js` — fetches `projects.json`, renders grid
  - `effects.js` — noise overlay, cursor-tracking glow, scroll reveal
- **Design token hierarchy**: Primitive → Semantic → Component structure
  - Primitives: radius, size (avatar, touch target, icon), opacity, duration, easing, shadow, overlay
  - Semantic: border-radius, focus-ring, size-touch-target-min, line-height-body, letter-spacing variants
  - Purpose-based section backgrounds: surface, surface-alt, surface-subtle, surface-accent-tint
- **Retention case study page**: `case-studies/features-users-return.html` — long-form case study (Planner, teachers, retention) with intro, hero screenshot, Problem/Goal/Process/Solution/Outcome/End Result sections and feedback callout. Styled via `.case-study-page` in `style.css` using design tokens.
- **Nav subfolder support**: Navigation component resolves logo and case study links correctly when viewed from `case-studies/` (e.g. logo → `../index.html`, sibling case studies → filename only).
- **Design Tokens File**: Extracted design tokens to `assets/css/tokens.css` for single source of truth
  - Primitive tokens (spacing, colors, typography)
  - Semantic tokens (contextual aliases)
  - Component tokens (button, card, nav, etc.)
- **Shared Utilities**: Created `assets/js/utils.js` with centralized `escapeHTML()` function
  - Includes double-load prevention guard
  - Reduces code duplication across 8 components
- **Case Studies Folder**: Added `case-studies/` directory with README for planned pages

### Changed
- **dev-tokens.css**: Added semantic `--dp-on-dark-*` tokens (text-primary, text-secondary, surface, surface-hover, focus-ring) for inverse/on-dark contexts; button-primary/secondary-on-dark now reference these instead of hardcoded hex. Added `--dp-glass-bg`; light theme surfaces updated (--dp-bg-base, --dp-bg-raised, --dp-bg-card, --dp-glass-bg, --dp-bg-card-hover) for paper-on-desk hierarchy and opaque glass/cards.
- **dev-styles.css (ATOMS)**: Gradient-text moved; noise moved from EFFECTS into new "ATOMS (reusable utilities)" block; added dp-glass, dp-glow, dp-shimmer, dp-fade-edge.
- **Homepage (index.html)**: Meta description and og:description updated to "A collection of tools and apps designed and built by Edward Stone...". Two featured strips inlined above projects grid: Kaomoji.click (flipped, dark strip with live iframe preview; postMessage forces dark theme on iframe load) and Fair Share (static strip with skeleton placeholder, cursor orbs). Strip effects loaded via ES module (`strip-effects.js`); projects grid via ES module (`projects-grid.js` imports project-card). Removed standalone `utils.js` and separate project-card script (grid module handles load order).
- **dev/old-index.html**: Asset paths (CSS, JS, images, data) use `../` so page resolves correctly when opened from `dev/` folder.
- **Section rhythm (dev-projects)**: New token `--dp-section-gap` (24px desktop, 12px tablet, 8px mobile) — hero padding-bottom, strip margin-top, grid padding now use it instead of hardcoded spacing.
- **Hero typography (dev-projects)**: Heading font-weight bold (was extrabold), letter-spacing normal (was tight).
- **Strip variants (dev-projects)**: `.dp-strip--flipped` for content-left/media-right layout; `.dp-strip--kaomoji` dark theme (no orbs, monochrome). Both responsive (flipped collapses on mobile).
- **Kaomoji preview** (`assets/previews/kaomoji/index.html`): 4th row, vmin-based layout with `.km-wrap` centering; 10 more kaomoji; bg #141414; clamp() font sizes; small-screen padding bump.
- **Fair Share strip (dev-projects)**: Overline under title (e.g. fairsharecalculator.com), same typography as hero overline (xs, semibold, uppercase). Strip is static HTML in index.html (above projects-container) so it always shows; `initStripEffects('.dp-strip')` still runs for cursor orbs. `.dp-strip-overline` in dev-styles.css. `product-strip.js` supports optional `overline` config when rendering strips programmatically.
- **Product strip (dev-projects) — responsive & a11y**: Mobile order copy → device → CTA (grid placement reset). Device frame fixed ratio (9:16, max-width 280px / 240px), no collapse. Strip spacing on 8px grid (tokens: `--dp-strip-padding` / `--dp-strip-gap` from `--dp-space-*`); content/actions gaps and breakpoint padding use tokens. Buttons: `--dp-btn-min-height` 48px (a11y touch); strip actions on mobile full-width stacked, 16px gap. DOM: actions sibling of content/media; noscript fallback aligned.
- **theme-toggle.js (dev-projects)**: Broadcasts theme to `.dp-card-media-iframe` via postMessage; iframes receive theme on load so preview widgets (Kaomoji, Fair Share, Lost Cities) stay in sync.
- **Light theme (dev-tokens.css)**: Updated light theme colors for better visual consistency.
- **Logo.svg**: Modified dimensions and design for improved aesthetics.
- **Kaomoji preview** (`assets/previews/kaomoji/index.html`): Replaced centered green toast with Linear-style snackbar — dark pill at bottom, blur, slide-up + fade-in (8px), 3s visible (UX snackbar duration), exit slides up 4px + fade (150ms); checkmark icon + "Copied to clipboard"; theme-aware (light/dark); reduced-motion instant show/hide; re-copy clears timeouts and re-triggers. Screen reader `.km-status` aria-live unchanged. "Click to copy" tooltip restyled to match snackbar (pill, blur, theme-aware).
- **Kaomoji preview** (`assets/previews/kaomoji/index.html`): Rows frozen by default (`animation-play-state: paused`); all rows drift on container hover (`.km-container:hover`). Row-level hover rule removed; focus-within still pauses for keyboard users. Reduced motion unchanged.
- **Homepage (index.html)**: Replaced with dev-projects-style landing (dp-hero, projects grid, theme toggle, magnetic tilt, avatar easter egg, effects); previous portfolio sections (nav, testimonials, case studies, skills, contact, reading) removed. Original saved as dev/old-index.html.
- **Component template**: Uses shared Utils.escapeHTML guard instead of local escapeHTML; aligns new components with utils.js dependency.
- **Meta viewport**: Added `viewport-fit=cover` for safe-area-inset-* support on notched devices (iPhone X+).
- **Dev-projects toggles (snake, theme)**: Snake button uses `snake.svg` with theme-aware colour; hover = luminous green + drop-shadow (tokens: `--dp-snake-icon-hover`, `--dp-snake-icon-glow`). Theme toggle: sun hover = darker sky gradient + filled sun centre; moon hover = dark bg + filled moon glow. Toggle transitions use `--dp-duration-base` (200ms).
- **Shadow tokenization**: Tokenized remaining shadows (skills-category, skill-item hover, nav drawer) in style.css and component-preview; added `--shadow-blur-card`, `--shadow-blur-card-hover`, `--shadow-accent-soft`, `--shadow-drawer`.
- **Design token restructure**: Aligned with best-practice hierarchy
  - Component tokens now reference semantic only (no direct primitives)
  - Button/card/nav use border-radius-lg, opacity-hover, duration-fast, size-icon-sm
  - Deprecated section-1/section-2 in favour of surface/surface-alt
  - style.css and component-preview.html use tokens throughout (no hardcoded px/rem)
- **Case studies README**: Updated from "Coming Soon" to reflect single live case study; added planner.png asset note.
- **Case study links alignment**: Standardised title to "How I design features people come back for" across hero, nav, case studies section, page title, and README. Removed placeholder links (Increasing conversion rates, How I reduced support enquiries) until those pages exist. Nav keeps Case Studies dropdown with single item.
- **Security & robustness (code review fixes)**:
  - Added `Utils.sanitizeUrl()` — blocks `javascript:`, `vbscript:`, `data:` in config-derived href/src; all components that set links or image src now use it before `escapeHTML`.
  - Components guard on `Utils.escapeHTML` at load — if utils.js is missing or load order is wrong, they throw a clear error instead of failing later.
  - Documented utils double-load `console.warn` as intentional dev feedback in `utils.js`.
- **Case study page design system**: Case study article (`.case-study-page`) now uses existing design tokens only — screenshot wrapper shadow uses `var(--case-study-card-hover-shadow)`, intro uses `var(--letter-spacing-tight)`. No new case-study-page–specific tokens; callout shadow remains literal (no matching token).
- **Mobile Navigation UX Overhaul**: Improved navigation accessibility and reduced interaction cost
  - Replaced hamburger icon with explicit "Menu"/"Close" text button (better discoverability for non-tech-savvy users)
  - Nav toggle now uses `.btn .btn-secondary` classes for visual consistency with other buttons
  - Flattened mobile nav structure - case study links now visible immediately without accordion interaction
  - Added "CASE STUDIES" section label for visual grouping in mobile menu
  - Desktop dropdown behavior unchanged
- **CSS Architecture**: Split into two files for better maintainability
  - `tokens.css` - Design tokens only (loaded first)
  - `style.css` - Component and layout styles
- **Image Naming**: Renamed images to URL-safe lowercase-kebab-case
  - `Fair Share Calculator.jpg` → `fair-share-calculator.jpg`
  - `Kaomoji.Click.jpg` → `kaomoji-click.jpg`
  - `Lost Cities Score Calculator.jpg` → `lost-cities-score-calculator.jpg`
- **Component Dependencies**: All 8 components now use shared `Utils.escapeHTML()` instead of duplicated local functions
- **HTML Load Order**: Updated `index.html` with proper script/stylesheet loading order
- **Document command** (`.cursor/commands/document.md`): Added Component Preview update steps — when to add new section, variant demos, and script loading for new components

### Removed
- **dev-projects.html**: Standalone dev-projects page removed; all content (hero, strips, grid, toggles) now lives on index.html only.
- **Deprecated section tokens**: Removed `--color-background-section-*` tokens (use `--color-background-surface*`).
- **Old dev-projects rules from style.css**: dev-projects now uses its own dev-styles.css; main site style.css no longer contains dev-projects-specific rules.
- **Completed plan docs**: Deleted `docs/plan-unify-case-study-design-system.md` and `docs/plan-case-study-links-alignment.md` — both 100% complete; CHANGELOG records the changes.

### Fixed
- **Snake game food visibility**: Food now uses `--dp-text-primary` (fallback `#E8E9ED`) instead of low-opacity `--dp-glow-1` so it contrasts on both light and dark overlay.
- **Snake overlay**: Rapid open-close no longer starts game after teardown (`overlayClosing` flag). Resize mid-game respawns food when it falls outside the new grid.
- **Button dataAttributes XSS**: Escaped key and value in `config.dataAttributes` to prevent attribute injection.
- **Component preview tokens**: Preview page now uses design tokens (font-size, border-radius, duration, etc.).
- **Component methodology doc**: Corrected "design tokens in style.css" to "tokens.css" (3 references).
- **Mobile Navigation Clipping**: Fixed logo and menu button being clipped on tablet/mobile
  - Restructured DOM: `nav` and `nav-overlay` moved outside `header` as siblings (standard practice for fixed drawers)
  - Header now only contains logo and button in normal document flow
  - Logo uses `flex: 1` to push menu button to right edge (matches component-preview pattern)
  - Added `min-height: 48px` to header for consistent sizing
  - Added `safe-area-inset-top` support for notched devices (iPhone X+)
- **Navigation Menu Button Positioning**: Fixed mobile/tablet menu button appearing centered instead of right-aligned at 768px
  - Resolved CSS specificity conflict where `.btn`'s `position: relative` overrode `.nav-toggle`'s `position: absolute`
  - Added `.nav-toggle.btn` selector with higher specificity for reliable positioning
  - Button now correctly positioned on right edge of header across all mobile/tablet breakpoints
- **Navigation Bug**: Fixed undefined `parentLi` variable in keyboard navigation handler that would cause runtime errors
- **HTML Validation**: Added missing `rel="stylesheet"` attribute to Google Fonts link in `index.html`
- **Documentation**: Updated Skills Section documentation in `component-methodology.md` to reflect current implementation (`tools`, `principles`, `personality` arrays instead of outdated `skills`/`frameworks`)
- **Component Preview**: Added missing `Navigation.init('nav-preview')` call so navigation component renders in preview page

### Added (Component Preview)
- **Viewport Width Toolbar**: Sticky toolbar with Desktop (1200px), Tablet (768px), Mobile (375px) presets to constrain preview width
- **Mobile Navigation Demo**: Dedicated 375px container showing Menu/Close text button and slide-in panel (no hamburger icon)
- **Reading Section**: Preview section and init for Reading Section component (book covers + heading)

### Removed
- **Empty File**: Deleted unused `assets/js/main.js`

### Security
- **Button href sanitization**: Button component now sanitizes `config.href` via `Utils.sanitizeUrl` before insertion (XSS hardening for link buttons).
- **XSS Protection**: Added `escapeHTML()` utility function to all components to prevent cross-site scripting attacks
- **Input Validation**: Enhanced validation in `project-card.js` to return empty string immediately if required fields are missing
- **Icon Security**: Removed `config.icon.html` feature from button component to prevent HTML injection vulnerabilities
- **Data Escaping**: All user-provided data (text, labels, attributes, URLs) is now automatically escaped before insertion into HTML across all components:
  - `button.js` - Escapes text, ariaLabel, className, icon classes
  - `testimonials-section.js` - Escapes name, role, company, text, heading
  - `case-study-card.js` - Escapes title, description, heading, subheading, metrics, image paths
  - `contact-section.js` - Escapes heading, subheading, email, phone, location, availability
  - `skills-section.js` - Escapes heading, tools, principles, and personality array items
  - `side-quests-section.js` - Escapes heading, subheading
  - `navigation.js` - Escapes logo, link text, submenu items, hrefs
  - `project-card.js` - Escapes title, description, URL, image paths, alt text

### Added
- Navigation component (`navigation.js`) with mobile menu support and automatic active page detection
- **Case Studies navigation with dropdown/submenu support**
  - Desktop dropdown menus with hover and click interactions
  - Mobile expandable submenus with inline expansion
  - Keyboard navigation support (Arrow keys, Enter/Space, Escape, Tab)
  - ARIA attributes for accessibility (`aria-haspopup`, `aria-expanded`)
  - Active state detection for nested pages
  - Scalable configuration-driven submenu structure
- Button component (`button.js`) with primary, secondary, and tertiary variants
- Project Card component (`project-card.js`) for reusable project display
- Side Quests Section component (`side-quests-section.js`) for displaying project collections
- Testimonials Section component (`testimonials-section.js`) for displaying recommendations
- Case Study Card component (`case-study-card.js`) for displaying case study previews
- Skills Section component (`skills-section.js`) for displaying skills and frameworks
- Contact Section component (`contact-section.js`) for displaying contact information
- Development Side Quests section showcasing three web projects (Lost Cities Calculator, Fair Share Calculator, Kaomoji.click)
- Reading Section component (`reading-section.js`) for displaying book covers image with configurable heading
- Mobile hamburger menu with overlay and body scroll lock
- CSS design token system (primitive → semantic → component tokens)
- Responsive breakpoints for mobile (480px), tablet (481-768px), desktop (769-1024px), and large desktop (1025px+)
- Industry-standard file structure reorganization (`assets/` folder structure)
- Component documentation (`docs/component-methodology.md`) with usage examples and best practices

### Changed
- Refactored navigation from inline HTML to reusable JavaScript component
- Complete CSS refactor with new token-based architecture
- Updated main layout to support wider content (max-width: 1200px)
- Enhanced mobile navigation with slide-in menu and overlay
- **File Structure Reorganization**: Reorganized project structure following industry standards
  - Moved components to `assets/js/components/`
  - Moved styles to `assets/css/`
  - Moved images to `assets/images/` (lowercase naming)
  - Moved downloadable files to `files/`
  - Renamed `script.js` to `assets/js/main.js`
  - Renamed `Edward Stone Resume.pdf` to `files/resume.pdf`
  - Updated all file references in HTML, documentation, and components
- **Phone Number Formatting**: Updated contact phone number to Australian format (0401 068 837)
- **Placeholder Images**: Removed placeholder.com URLs, components now handle missing images gracefully
- **Hero Section Layout**: Moved action buttons into hero-left section and vertically centered hero-right content for better visual balance
- **Navigation Active State**: Redesigned active navigation state with accent color and underline for improved visibility and consistency with design system
- **Navigation Dropdown Arrow**: Updated dropdown arrow from triangle (▼) to chevron (⌄) for more modern appearance
- **Testimonials Section**: Updated heading to more conversational tone and added subheading support with smaller typeface styling
- **Skills Section Redesign**: Complete restructure from badge-based layout to Apple-inspired card-based design with three categories (Tools & Technologies, Guiding Principles, A Bit About Me), featuring smooth hover animations and refined typography

### Removed
- `about.html` page
- Inline navigation HTML and scripts from `index.html`
- Old CSS variable naming convention (replaced with token system)
