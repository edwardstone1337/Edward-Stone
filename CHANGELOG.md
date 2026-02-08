# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Fixed nav bar**: `.dp-nav` — glass-style fixed bar with brand (logo + name) and `#dp-nav-actions` (theme toggle, snake toggle). Toggles inject into nav when present, else body.
- **404 page** (`404.html`): Minimal page with nav, gradient 404, "Go home" / "Play Snake instead". `window.SnakeGame.open()` exposed for external pages. Inline theme init (no flash); favicon; meta robots noindex.
- **Resume download widget**: Dropdown with PDF, DOCX, copy-to-clipboard. `resume-download.js`. Mobile duplicate below resume.
- **Resume lightbox**: Click resume → fullscreen lightbox (desktop ≥1080px) with download CTA. `resume-lightbox.js`; focus trap, Escape, backdrop click.
- **SCP Reader strip**: Featured strip in split-row (2/3 + 1/3) — `.dp-strip--compact`, `.dp-strip--scp` theme. Excluded from projects grid. projects.json: URL scp-reader.co.
- **Split row**: `.dp-split-row` for side-by-side layout. **Testimonial card** `.dp-testimonial` in 1/3 slot — Jason Allen quote, glass styling, gradient decorative mark.
- **Secondary button**: `.dp-btn-secondary` — transparent, bordered.
- **Resume/paper tokens**: `--dp-paper-*` (surface, text, border, shadow, accent) light + dark.
- **Resume files**: `assets/files/Resume.pdf`, `assets/files/Resume.docx`.
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
- **Testimonial card typography (Phase 2 patch)**: Decorative quote mark — absolute, large (8rem), Georgia, opacity 0.07 (flat colour, no gradient). Quote text — Georgia italic at `--dp-text-lg` (20px), `z-index: 1`. Attribution — `position: relative; z-index: 1` so both sit above the faint mark. Container `.dp-testimonial` already has `position: relative`.
- **Resume component (Phase 9)**: Animated border now matches card technique — dual-layer with `.dp-resume-container` (1px padding, ::before radial glow at z-index 1) and `.dp-resume-page` as masking layer (z-index 2, solid `--dp-paper-surface`, inset border-radius). Glow uses `--dp-accent-glow`, opacity 1 on hover. Removed phone number from resume contact in index.html (email and location kept). At 1080px: intro download centered via `.dp-resume-intro .dp-resume-download { display: flex; justify-content: center }`, mobile download spacing set to `--dp-space-10`. Mobile (≤1080px) resume text sizes updated for WCAG AA: body/secondary ≥16px/14px (tagline, summary, role-title, role-desc, role-achievements → base; section-title, role-meta, skill-list li, contact-item → sm).
- **Back-to-top**: Moved to bottom-right. Arrow icon (replaces logo). Visible only after 1 viewport scroll; prefers-reduced-motion respected.
- **Theme toggle / snake toggle**: Inject into `#dp-nav-actions` when present.
- **Snake game**: Public `window.SnakeGame.open()` for 404.
- **Theme init**: Removed `data-theme` from `<html>` in index.html and dev/design-system.html; theme is set by theme-toggle.js after load. Added surface fallbacks in dev-tokens.css (`:root`: --dp-bg-base, --dp-bg-raised, --dp-bg-card, --dp-bg-card-hover, --dp-bg-overlay, --dp-text-primary, --dp-text-secondary) so initial paint matches dark theme and avoids flash before JS runs. Added `.dp-no-transition` utility to suppress transitions on initial load; inline script applies it during theme set, double rAF at end of body removes it after first paint.

### Fixed
- **Kaomoji strip**: `.dp-strip-media` now uses `justify-self: center` for centered layout.
- **Snake game (dev-projects)**: Single Play button only — original button hidden when overlay opens, shown on teardown; close button no longer reskinned/appended to body (removed with overlay). State (cols, rows, offsetX, offsetY, colors) and overlayClosing reset in stopGame/teardown.
- **Avatar spin (dev-projects)**: Removed spin jolt by simplifying to per-frame momentum (no deltaTime). Wiggle disabled while spin is active so CSS transform no longer overrides inline rotate; cooldown clicks during spin now add velocity instead of triggering wiggle.

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
