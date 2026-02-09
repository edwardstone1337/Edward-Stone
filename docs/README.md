# Documentation

This folder contains documentation for the website's component system and development practices.

## Files

- **[component-methodology.md](./component-methodology.md)** - Comprehensive guide to the component architecture, patterns, and best practices
- **[component-template.js](./component-template.js)** - Template file for creating new components
- **[analytics-tagging.md](./analytics-tagging.md)** - Canonical Google Analytics tagging pattern and required coverage rules for public pages

## Quick Start

1. Read the [Component Methodology](./component-methodology.md) to understand the approach
2. Copy [component-template.js](./component-template.js) as a starting point for new components
3. Follow the patterns and checklist outlined in the methodology document

## Security

All components include built-in XSS protection through HTML escaping. The `escapeHTML()` utility function is included in the component template and should be used for all user-provided or configuration data before inserting into HTML. See the [Component Methodology](./component-methodology.md) for details on security best practices.

## Component Examples

See the following components in `assets/js/components/` for reference:
- `navigation.js` - Navigation bar with mobile menu and dropdown support
- `button.js` - Button component with variants
- `project-card.js` - Reusable project card component for displaying individual projects
- `side-quests-section.js` - Section component for displaying project collections
- `testimonials-section.js` - Section component for displaying testimonials
- `case-study-card.js` - Section component for displaying case study previews
- `skills-section.js` - Section component for displaying skills and frameworks
- `contact-section.js` - Section component for displaying contact information

## Questions?

Refer to the methodology document for detailed guidance, or use existing components as examples.
