# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
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
