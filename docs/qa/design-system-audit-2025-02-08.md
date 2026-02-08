# Design System Audit — dev/design-system.html

**Date:** 2025-02-08  
**Purpose:** Precise audit for planning a refresh. Exhaustive token/class names.

---

## 1. Current page structure

Every `<section>` or major content block with heading and what it demos; for each block, the exact token names or class names shown.

| # | Section / block | Heading | What it demos | Token/class names shown |
|---|-----------------|--------|----------------|-------------------------|
| 1 | Header | (no h2) | Page title, subtitle; theme toggle (injected by JS) | — (uses ds-* scaffolding only) |
| 2 | Primitives | **2. Primitives** | | |
| 2a | Spacing scale | 2a. Spacing scale | Boxes sized by spacing tokens | **Tokens:** `--dp-space-1`, `--dp-space-2`, `--dp-space-3`, `--dp-space-4`, `--dp-space-5`, `--dp-space-6`, `--dp-space-8`, `--dp-space-10`, `--dp-space-12`, `--dp-space-16`, `--dp-space-20`, `--dp-space-24`, `--dp-space-30`, `--dp-space-40`. (Also uses `--dp-bg-card-hover`, `--dp-border-default` in demo boxes.) |
| 2b | Radii | 2b. Radii | Squares with radius applied | **Tokens:** `--dp-radius-sm`, `--dp-radius-md`, `--dp-radius-lg`, `--dp-radius-xl`, `--dp-radius-full`. (Uses `--dp-accent` for fill.) |
| 2c | Typography scale | 2c. Typography scale | “The quick brown fox” at each size | **Tokens:** `--dp-text-xs`, `--dp-text-sm`, `--dp-text-base`, `--dp-text-lg`, `--dp-text-xl`, `--dp-text-2xl`, `--dp-text-3xl`, `--dp-text-4xl`. (Uses `--dp-text-primary`.) |
| 2d | Font weights | 2d. Font weights | Inline text at 400, 500, 600, 700, 800 | **Tokens:** `--dp-weight-normal`, `--dp-weight-medium`, `--dp-weight-semibold`, `--dp-weight-bold`, `--dp-weight-extrabold`. (Uses `--dp-text-primary`.) |
| 2e | Duration & easing | 2e. Duration & easing | Hover-to-translate boxes | **Tokens:** `--dp-duration-fast`, `--dp-duration-base`, `--dp-duration-slow`, `--dp-duration-entrance`; `--dp-ease-out`. (Uses `--dp-bg-card-hover`, `--dp-border-default`, `--dp-radius-sm`.) |
| 3 | Semantic Tokens | **3. Semantic Tokens** | | |
| 3a | Surfaces | 3a. Surfaces | Swatches | **Tokens:** `--dp-bg-base`, `--dp-bg-raised`, `--dp-bg-card`, `--dp-bg-card-hover`, `--dp-bg-overlay`. (Uses `--dp-border-default`, `--dp-radius-sm`.) |
| 3b | Text hierarchy | 3b. Text hierarchy | Sample lines | **Tokens:** `--dp-text-primary`, `--dp-text-secondary`, `--dp-text-tertiary`, `--dp-text-ghost`. |
| 3c | Borders | 3c. Borders | Rectangles with border tokens | **Tokens:** `--dp-border-default`, `--dp-border-hover`, `--dp-border-active`, `--dp-border-divider`. (Uses `--dp-bg-raised`, `--dp-radius-sm`.) |
| 3d | Accent & glow | 3d. Accent & glow colors | Swatches + blurred orbs | **Tokens:** `--dp-accent`, `--dp-accent-hover`, `--dp-accent-glow`, `--dp-glow-1`, `--dp-glow-2`, `--dp-glow-3`. |
| 4 | Atoms | **4. Atoms** | | |
| 4a | Gradient text | 4a. .dp-gradient-text | Heading with gradient clip | **Classes:** `.dp-gradient-text`. |
| 4b | Noise | 4b. .dp-noise | Noise overlay in a scoped box | **Classes:** `.dp-noise`. |
| 4c | Glass | 4c. .dp-glass | Blur panel on gradient bg | **Classes:** `.dp-glass`. |
| 4d | Glow | 4d. .dp-glow | Glow blob with `.is-visible` | **Classes:** `.dp-glow`, `.is-visible`. (Uses `--dp-glow-color: var(--dp-glow-1)`.) |
| 4e | Shimmer | 4e. .dp-shimmer | Sweep animation on a rectangle | **Classes:** `.dp-shimmer`. (Uses `--dp-bg-card`, `--dp-border-default`, `--dp-radius-md`.) |
| 4f | Fade edge | 4f. .dp-fade-edge | Text fading at bottom | **Classes:** `.dp-fade-edge`. |
| 5 | Molecules | **5. Molecules** | | |
| 5a | Hero | 5a. Hero | Hero block with overline, lines, body | **Classes:** `.dp-hero`, `.dp-overline`, `.dp-hero-heading`, `.dp-hero-line`, `.dp-hero-accent`, `.dp-hero-body`. |
| 5b | Buttons | 5b. Buttons | Primary, primary-on-dark, secondary-on-dark | **Classes:** `.dp-btn`, `.dp-btn-primary`, `.dp-btn-primary-on-dark`, `.dp-btn-secondary-on-dark`. (Uses `--dp-strip-bg` for on-dark container.) |
| 5c | Card | 5c. Card (static preview) | Single card with media placeholder and content | **Classes:** `.dp-card`, `.dp-card-inner`, `.dp-card-media`, `.dp-card-media-placeholder`, `.dp-card-content`, `.dp-card-title`, `.dp-card-description`. |
| 5d | Product strip | 5d. Product strip (static preview) | Strip with orbs, content, media, actions | **Classes:** `.dp-strip`, `.dp-strip-orbs`, `.dp-strip-orb-dark`, `.dp-strip-orb-dark--1`, `.dp-strip-orb-dark--2`, `.dp-strip-inner`, `.dp-strip-content`, `.dp-strip-overline`, `.dp-strip-title`, `.dp-strip-description`, `.dp-strip-badges`, `.dp-strip-badge`, `.dp-strip-media`, `.dp-strip-actions`. (Tokens: `--dp-strip-orb-1`, `--dp-strip-orb-2` in gradient; buttons as above.) |
| 5d-2 | Strip Kaomoji | 5d. Product strip — Kaomoji variant | Strip with iframe preview | **Classes:** `.dp-strip`, `.dp-strip--flipped`, `.dp-strip--kaomoji`, `.dp-strip-orbs`, `.dp-strip-orb-dark`, `.dp-strip-orb-dark--1`, `.dp-strip-orb-dark--2`, `.dp-strip-inner`, `.dp-strip-content`, `.dp-strip-emoji`, `.dp-strip-title`, `.dp-strip-overline`, `.dp-strip-badges`, `.dp-strip-badge`, `.dp-strip-description`, `.dp-strip-media`, `.dp-card-media-iframe`, `.dp-strip-actions`, `.dp-btn`, `.dp-btn-primary-on-dark`. |
| 5e | Overline | 5e. Overline | Standalone overline label | **Classes:** `.dp-overline`. |

---

## 2. Token gap analysis

Comparison: what’s demoed in design-system.html vs what’s defined in dev-tokens.css.

### 2.1 Already demoed — token names present on the page

- **Primitives (spacing):** `--dp-space-1`, `--dp-space-2`, `--dp-space-3`, `--dp-space-4`, `--dp-space-5`, `--dp-space-6`, `--dp-space-8`, `--dp-space-10`, `--dp-space-12`, `--dp-space-16`, `--dp-space-20`, `--dp-space-24`, `--dp-space-30`, `--dp-space-40`
- **Primitives (radii):** `--dp-radius-sm`, `--dp-radius-md`, `--dp-radius-lg`, `--dp-radius-xl`, `--dp-radius-full`
- **Primitives (typography):** `--dp-text-xs`, `--dp-text-sm`, `--dp-text-base`, `--dp-text-lg`, `--dp-text-xl`, `--dp-text-2xl`, `--dp-text-3xl`, `--dp-text-4xl`
- **Primitives (font weight):** `--dp-weight-normal`, `--dp-weight-medium`, `--dp-weight-semibold`, `--dp-weight-bold`, `--dp-weight-extrabold`
- **Primitives (duration/easing):** `--dp-duration-fast`, `--dp-duration-base`, `--dp-duration-slow`, `--dp-duration-entrance`, `--dp-ease-out`
- **Semantic (surfaces):** `--dp-bg-base`, `--dp-bg-raised`, `--dp-bg-card`, `--dp-bg-card-hover`, `--dp-bg-overlay`
- **Semantic (text):** `--dp-text-primary`, `--dp-text-secondary`, `--dp-text-tertiary`, `--dp-text-ghost`
- **Semantic (borders):** `--dp-border-default`, `--dp-border-hover`, `--dp-border-active`, `--dp-border-divider`
- **Semantic (accent/glow):** `--dp-accent`, `--dp-accent-hover`, `--dp-accent-glow`, `--dp-glow-1`, `--dp-glow-2`, `--dp-glow-3`
- **Strip (used in demos):** `--dp-strip-bg`, `--dp-strip-orb-1`, `--dp-strip-orb-2`

(Scaffolding/labels on the page also use: `--dp-space-1`–`--dp-space-8`, `--dp-space-12`, `--dp-space-16`, `--dp-font-display`, `--dp-font-body`, `--dp-text-*`, `--dp-weight-*` in ds-* styles — already covered above.)

### 2.2 Missing — token names defined in dev-tokens.css but not shown on the page

Grouped by category as in dev-tokens.css.

**Primitives (not demoed):**

- **Font families:** `--dp-font-display`, `--dp-font-body` (used in page scaffolding but no “token demo” swatch/label)
- **Line heights:** `--dp-leading-none`, `--dp-leading-tight`, `--dp-leading-snug`, `--dp-leading-normal`, `--dp-leading-relaxed`
- **Letter spacing:** `--dp-tracking-tight`, `--dp-tracking-normal`, `--dp-tracking-wide`, `--dp-tracking-wider`
- **Easing (second):** `--dp-ease-in-out` (only `--dp-ease-out` is demoed)
- **Raw colors (primitives, :root only):**  
  `--dp-raw-white`, `--dp-raw-black`, `--dp-raw-grey-50`, `--dp-raw-grey-100`, `--dp-raw-grey-200`, `--dp-raw-grey-400`, `--dp-raw-grey-500`, `--dp-raw-grey-800`, `--dp-raw-grey-900`, `--dp-raw-grey-950`, `--dp-raw-accent`, `--dp-raw-accent-light`, `--dp-raw-glow-purple`, `--dp-raw-glow-blue`, `--dp-raw-glow-teal`, `--dp-raw-glow-amber`, `--dp-raw-glow-green`
- **Button (shared):** `--dp-btn-radius`, `--dp-btn-padding`, `--dp-btn-min-height`, `--dp-btn-font-size`, `--dp-btn-font-weight`
- **Strip/device (shared):** `--dp-strip-padding`, `--dp-strip-gap`, `--dp-device-radius`
- **Page rhythm:** `--dp-section-gap`

**Semantic — dark/light (theme-specific, not shown as token swatches):**

- **Glass:** `--dp-glass-bg`
- **On-dark (inverse context):** `--dp-on-dark-text-primary`, `--dp-on-dark-text-secondary`, `--dp-on-dark-surface`, `--dp-on-dark-surface-hover`, `--dp-on-dark-focus-ring`
- **Card text:** `--dp-card-text-primary`, `--dp-card-text-secondary`
- **Gradient text:** `--dp-gradient-text-from`, `--dp-gradient-text-to`
- **Hero line gradients:** `--dp-hero-line-from`, `--dp-hero-line-to`, `--dp-hero-accent-from`, `--dp-hero-accent-to`
- **Noise:** `--dp-noise-opacity`
- **Theme toggle:** `--dp-toggle-bg`, `--dp-toggle-bg-hover`, `--dp-toggle-icon`, `--dp-theme-sun-icon-hover`, `--dp-theme-sun-bg-hover`, `--dp-theme-moon-icon-hover`, `--dp-theme-moon-bg-hover`
- **Snake toggle:** `--dp-snake-icon-hover`, `--dp-snake-icon-glow`
- **Button (semantic):**  
  `--dp-btn-bg-primary`, `--dp-btn-text-primary`, `--dp-btn-hover-bg-primary`, `--dp-btn-focus-ring`,  
  `--dp-btn-bg-primary-on-dark`, `--dp-btn-text-primary-on-dark`, `--dp-btn-hover-bg-primary-on-dark`, `--dp-btn-focus-ring-on-dark`,  
  `--dp-btn-secondary-on-dark-border`, `--dp-btn-secondary-on-dark-text`, `--dp-btn-secondary-on-dark-hover-bg`, `--dp-btn-secondary-on-dark-focus-ring`,  
  `--dp-btn-secondary-on-light-text`, `--dp-btn-secondary-on-light-border`, `--dp-btn-secondary-on-light-hover-bg`, `--dp-btn-secondary-on-light-focus-ring`
- **Strip (product/Fair Share):**  
  `--dp-strip-orb-dark`, `--dp-strip-orb-opacity`, `--dp-strip-title-color`, `--dp-strip-text-color`, `--dp-strip-badge-bg`, `--dp-strip-badge-text`, `--dp-device-border`, `--dp-device-shadow`
- **Strip theme — SCP:**  
  `--dp-strip-scp-bg`, `--dp-strip-scp-orb-1`, `--dp-strip-scp-orb-2`, `--dp-strip-scp-orb-dark`, `--dp-strip-scp-orb-opacity`, `--dp-strip-scp-title-color`, `--dp-strip-scp-text-color`, `--dp-strip-scp-badge-bg`, `--dp-strip-scp-badge-text`, `--dp-strip-scp-device-border`, `--dp-strip-scp-device-shadow`
- **Resume / paper:**  
  `--dp-paper-surface`, `--dp-paper-text-primary`, `--dp-paper-text-secondary`, `--dp-paper-border`, `--dp-paper-shadow`, `--dp-paper-accent`

---

## 3. Atom + molecule gap analysis

Comparison: what’s demoed in design-system.html vs classes defined in dev-styles.css. **Atoms and molecules only** — organisms (nav, footer, resume, lightbox, 404, split-row, strip, grid) skipped.

**Classification used:**  
- **Atoms:** utility/single-purpose classes (e.g. gradient-text, noise, glass, glow, shimmer, fade-edge, overline, hero-line, hero-accent; plus no-transition, reveal, skip-link, avatar-wiggle, magnetic-tilt, avatar-wrap where they are single-purpose).  
- **Molecules:** composite components (button, theme-toggle, back-to-top, snake-toggle, hero block, card, testimonial).  
- **Organisms (excluded):** dp-nav, dp-footer, dp-resume-*, dp-lightbox*, dp-404-*, dp-split-row*, dp-strip* (and strip modifiers), dp-card-grid, dp-grid-section, dp-snake-overlay, dp-snake-canvas, etc.

### 3.1 Already demoed — class names with a visual example on the page

- **Atoms:** `.dp-gradient-text`, `.dp-noise`, `.dp-glass`, `.dp-glow`, `.dp-shimmer`, `.dp-fade-edge`, `.dp-overline`, `.dp-hero-line`, `.dp-hero-accent`
- **Molecules (hero):** `.dp-hero`, `.dp-hero-heading`, `.dp-hero-body`
- **Molecules (buttons):** `.dp-btn`, `.dp-btn-primary`, `.dp-btn-primary-on-dark`, `.dp-btn-secondary-on-dark`
- **Molecules (card):** `.dp-card`, `.dp-card-inner`, `.dp-card-media`, `.dp-card-media-placeholder`, `.dp-card-content`, `.dp-card-title`, `.dp-card-description`
- **Molecules (strip — shown as static demos only):** `.dp-strip`, `.dp-strip-inner`, `.dp-strip-orbs`, `.dp-strip-orb-dark`, `.dp-strip-orb-dark--1`, `.dp-strip-orb-dark--2`, `.dp-strip-content`, `.dp-strip-overline`, `.dp-strip-title`, `.dp-strip-description`, `.dp-strip-badges`, `.dp-strip-badge`, `.dp-strip-media`, `.dp-strip-actions`, `.dp-strip--flipped`, `.dp-strip--kaomoji`, `.dp-strip-emoji`, `.dp-card-media-iframe`
- **Modifier:** `.dp-glow.is-visible`

### 3.2 Missing — atom/molecule classes defined in dev-styles.css but not shown

**Atoms (defined, not on design-system page):**

- `.dp-no-transition` (utility, no visual demo)
- `.dp-hero-heading` (only its children `.dp-hero-line` / `.dp-hero-accent` are shown in hero demo — the heading is shown but not called out as its own atom)
- `.dp-magnetic-tilt`, `.dp-avatar-wrap`, `.dp-avatar-wiggle` (avatar/hero context)
- `.dp-reveal`, `.dp-revealed` (reveal state)
- `.dp-skip-link` (a11y, no visual demo)
- `.dp-btn-icon` (button sub-part, no standalone demo)
- `.dp-card-media-fade` (card sub-part)

**Molecules (defined, not on design-system page):**

- **Button variants:** `.dp-btn-secondary`, `.dp-btn-secondary-on-light` (only primary and on-dark variants are demoed)
- **Theme toggle:** `.dp-theme-toggle` (present in header via JS but not in a “molecule demo” section with label)
- **Back to top:** `.dp-back-to-top`
- **Snake toggle:** `.dp-snake-toggle` (not on this page; snake is on 404)
- **Hero:** `.dp-hero-avatar` (not shown in hero demo)
- **Testimonial:** `.dp-testimonial`, `.dp-testimonial-mark`, `.dp-testimonial-quote`, `.dp-testimonial-attribution`, `.dp-testimonial-name`, `.dp-testimonial-role`

All organism-level classes (nav, footer, resume, lightbox, 404, split-row, strip layout modifiers like `--compact`/`--scp`, grid, download widget, etc.) are omitted from this list per instructions.

---

## 4. dev/component-preview.html

### What this page contains

- **Stack:** tokens.css + style.css (legacy), Montserrat + Inter. **Not** dev-tokens.css / dev-styles.css.
- **Purpose:** “Isolated preview of all components” with viewport toolbar (Desktop / Tablet / Mobile) and a TOC (Navigation, Buttons, Testimonials, Case Studies, Skills, Side Quests, Contact, Reading).
- **Sections:**  
  Navigation (desktop + mobile in `.mobile-nav-container`), Button (variants, states, as links), Testimonials Section, Case Studies Section, Skills Section, Side Quests Section, Contact Section (default + with availability), Reading Section.
- **Scripts:** utils.js; components: button.js, navigation.js, project-card.js, testimonials-section.js, case-study-card.js, skills-section.js, side-quests-section.js, contact-section.js, reading-section.js. Components are rendered into placeholder divs by JS.

### Is anything here that isn’t in design-system.html?

- **Yes.** component-preview.html is a **different system**: it uses the **legacy** token/component set (tokens.css, style.css, different component JS), with different naming (e.g. `--color-*`, `--spacing-*`, `--font-*`) and different components (navigation, case studies, skills, side quests, contact, reading, viewport toolbar). design-system.html is the **dev-projects** design system (dev-tokens.css, dev-styles.css, dp-* classes, theme-toggle.js, no legacy sections).
- **Overlap:** Both have “buttons” and “navigation” in some form, but implementation and tokens are different. design-system.html has no viewport toolbar, no case studies/skills/side quests/contact/reading sections, and no legacy component scripts.

### Can it be safely deleted?

- **Cannot be declared “safe to delete” without product decision.**  
  - If the **legacy** portfolio (tokens.css / style.css and those JS components) is still in use or referenced anywhere, component-preview.html is the preview for that stack; deleting it would remove that preview.  
  - If the legacy stack is **fully retired** and the site uses only dev-tokens.css + dev-styles.css, then component-preview.html is obsolete for the current design system and could be removed after confirming no links or docs point to it.  
- **Recommendation:** Confirm whether any page or build still uses the legacy CSS/JS; if yes, keep component-preview.html or migrate its useful demos into the dev-projects design system. If no, it can be safely deleted.

---

**End of audit.**
