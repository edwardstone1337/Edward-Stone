# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Design Tokens File**: Extracted design tokens to `assets/css/tokens.css` for single source of truth
  - Primitive tokens (spacing, colors, typography)
  - Semantic tokens (contextual aliases)
  - Component tokens (button, card, nav, etc.)
- **Shared Utilities**: Created `assets/js/utils.js` with centralized `escapeHTML()` function
  - Includes double-load prevention guard
  - Reduces code duplication across 8 components
- **Case Studies Folder**: Added `case-studies/` directory with README for planned pages

### Changed
- **CSS Architecture**: Split into two files for better maintainability
  - `tokens.css` - Design tokens only (loaded first)
  - `style.css` - Component and layout styles
- **Image Naming**: Renamed images to URL-safe lowercase-kebab-case
  - `Fair Share Calculator.jpg` → `fair-share-calculator.jpg`
  - `Kaomoji.Click.jpg` → `kaomoji-click.jpg`
  - `Lost Cities Score Calculator.jpg` → `lost-cities-score-calculator.jpg`
- **Component Dependencies**: All 8 components now use shared `Utils.escapeHTML()` instead of duplicated local functions
- **HTML Load Order**: Updated `index.html` with proper script/stylesheet loading order

### Fixed
- **Navigation Bug**: Fixed undefined `parentLi` variable in keyboard navigation handler that would cause runtime errors
- **HTML Validation**: Added missing `rel="stylesheet"` attribute to Google Fonts link in `index.html`
- **Documentation**: Updated Skills Section documentation in `component-methodology.md` to reflect current implementation (`tools`, `principles`, `personality` arrays instead of outdated `skills`/`frameworks`)

### Removed
- **Empty File**: Deleted unused `assets/js/main.js`

### Security
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
- Reading section with design book covers image
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
