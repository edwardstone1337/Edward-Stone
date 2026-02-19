# Component Methodology

This document outlines the approach we use for creating reusable components across the website. This methodology ensures consistency, maintainability, and a great user experience across all components.

## Core Principles

### 1. **Self-Contained Components**
Each component is a self-contained module that:
- Manages its own HTML structure
- Handles its own JavaScript functionality
- Works independently without external dependencies (except shared CSS tokens)
- Can be initialized automatically or manually

### 2. **Configuration-Driven**
Components accept configuration objects that define their behavior and content, making them flexible and reusable.

### 3. **Progressive Enhancement**
Components work without JavaScript when possible, and enhance functionality when JavaScript is available.

### 4. **Accessibility First**
All components include:
- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader considerations

### 5. **Responsive by Default**
Components are designed to work seamlessly across all device sizes, with mobile-first considerations.

## Component Structure

### File Organization
```
assets/
  css/
    tokens.css     # Design tokens (primitive, semantic, component)
    style.css      # Component and layout styles
  js/
    utils.js       # Shared utilities (escapeHTML, etc.)
    components/    # Component logic
```

**Note:** `tokens.css` and `utils.js` must be loaded before their dependent files. See `index.html` for correct load order.

### JavaScript Component Pattern

```javascript
(function() {
  'use strict';

  // 1. Configuration
  const componentConfig = {
    // Component-specific settings
  };

  // 2. Helper Functions
  
  // Use shared Utils.escapeHTML (requires utils.js to be loaded first)
  const escapeHTML = Utils.escapeHTML;
  
  function helperFunction() {
    // Utility functions
  }

  // 3. Core Functionality
  function generateComponentHTML() {
    // Generate HTML structure
  }

  function initComponentFunctionality() {
    // Initialize event listeners, interactions
  }

  // 4. Initialization
  function initComponent(containerId = 'component-container') {
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.warn(`Component container with ID "${containerId}" not found.`);
      return;
    }
    
    // Generate and inject HTML
    container.innerHTML = generateComponentHTML();
    
    // Initialize functionality
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initComponentFunctionality);
    } else {
      initComponentFunctionality();
    }
  }

  // 5. Auto-initialize or Export
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (document.getElementById('component-container')) {
        initComponent();
      }
    });
  } else {
    if (document.getElementById('component-container')) {
      initComponent();
    }
  }

  // Export for manual initialization
  window.ComponentName = {
    init: initComponent
  };

})();
```

## Implementation Guidelines

### 1. **HTML Generation**
- Use template literals for clean, readable HTML
- Generate semantic, accessible HTML structure
- Include necessary ARIA attributes
- Ensure proper nesting and structure
- **Always escape user-provided data** using `escapeHTML()` before inserting into template literals
- Never insert raw HTML from configuration or user input

### 2. **State Management**
- Use CSS classes for visual state (e.g., `.is-open`, `.is-active`)
- Use ARIA attributes for accessibility state (e.g., `aria-expanded`, `aria-hidden`)
- Keep JavaScript state minimal and synchronized with DOM

### 3. **Event Handling**
- Use event delegation when possible for dynamic content
- Clean up event listeners if components are removed
- Handle edge cases (e.g., rapid clicks, keyboard navigation)

### 4. **Mobile Considerations**
- Touch-friendly targets (minimum 44x44px)
- Prevent body scroll when modals/overlays are open
- Smooth animations and transitions
- Consider viewport and safe areas

### 5. **CSS Integration**
- Use CSS custom properties (variables) from `tokens.css`
- Follow the existing design token system
- Keep component styles scoped when possible
- Use BEM-like naming for component-specific classes

### 6. **Security First**
- Always escape user-provided data before inserting into HTML
- Use the `escapeHTML()` utility function for all dynamic content
- Never insert raw HTML from user input or configuration
- Validate required fields and return early if validation fails

## Component Examples

### Navigation Component
**File:** `assets/js/components/navigation.js`

**Features:**
- Auto-detects current page (including nested paths)
- Highlights active link and parent items when submenu items are active
- Mobile hamburger menu with slide-in navigation
- Desktop dropdown menus with hover and click interactions
- Mobile expandable submenus with inline expansion
- Keyboard accessible (Arrow keys, Enter/Space, Escape, Tab)
- ARIA attributes for screen readers
- Overlay and body scroll lock on mobile
- Click outside to close dropdowns on desktop
- **Security: All navigation text, links, and submenu items are escaped**

**Usage:**
```html
<div id="nav-container"></div>
<script src="assets/js/components/navigation.js"></script>
```

**Configuration:**
```javascript
const navConfig = {
  logo: 'Edward Stone',
  logoHref: 'index.html',
  links: [
    { text: 'Home', href: 'index.html' },
    { 
      text: 'Case Studies', 
      href: '#',
      submenu: [
        { text: 'How I design features people come back for', href: 'case-studies/planner.html' }
      ]
    }
  ]
};
```

**Submenu Configuration:**
- Add a `submenu` array to any link object to create a dropdown
- Submenu items follow the same structure as regular links: `{ text: 'Label', href: 'path.html' }`
- Parent link `href` can be `'#'` if it's only a container, or a real URL if it should navigate
- Active state detection automatically highlights parent items when submenu items are active
- Supports unlimited nesting (though single level is recommended for UX)

### Button Component
**File:** `assets/js/components/button.js`

**Features:**
- Variant system (primary, secondary, tertiary)
- Loading states with visual feedback
- Icon support (string class names only - no raw HTML for security)
- Disabled states
- Programmatic and declarative usage
- Backward compatible with existing CSS classes
- **Security: All text, labels, and class names are escaped**
- **Security: Removed support for `config.icon.html` to prevent XSS vulnerabilities**

**Usage:**
```html
<!-- Programmatic -->
<div id="button-container"></div>
<script src="assets/js/components/button.js"></script>
<script>
  Button.create({ text: 'Click Me', variant: 'primary' }, 'button-container');
</script>

<!-- Declarative -->
<div data-button='{"text":"Click Me","variant":"primary"}'></div>
<script src="assets/js/components/button.js"></script>
<script>Button.init();</script>

<!-- Backward compatible (CSS classes still work) -->
<a href="#" class="btn btn-primary">Existing Button</a>
```

**Configuration:**
```javascript
{
  text: 'Button Text',
  variant: 'primary' | 'secondary' | 'tertiary',
  loading: false,
  disabled: false,
  icon: 'icon-name', // Optional - string class name only (no raw HTML)
  href: 'url', // For link buttons
  target: '_blank', // For link buttons
  onClick: function() { /* handler */ } // Optional click handler
}
```

**Security Note:** The `config.icon.html` feature has been removed for security reasons. Icons must be provided as string class names only. All text, labels, and attributes are automatically escaped.

### Project Card Component
**File:** `assets/js/components/project-card.js`

**Features:**
- Standalone reusable card component
- Displays project image, title, and description
- Accessible link structure
- Lazy loading for images
- Can be used independently or composed with other components

**Usage:**
```html
<script src="assets/js/components/project-card.js"></script>
<script>
  const project = {
    title: 'Project Name',
    description: 'Project description',
    url: 'https://example.com',
    imagePath: 'assets/images/project.jpg',
    imageAlt: 'Project image'
  };
  
  const cardHTML = ProjectCard.generateHTML(project);
  document.getElementById('container').innerHTML = cardHTML;
</script>
```

**Configuration:**
```javascript
{
  title: 'Project Title', // Required
  url: 'https://example.com', // Required
  description: 'Project description', // Optional
  imagePath: 'path/to/image.jpg', // Optional
  imageAlt: 'Alt text' // Optional, defaults to title
}
```

**Security & Validation:** 
- Returns empty string immediately if required fields (`title` or `url`) are missing
- All user-provided data (title, description, URLs, alt text) is automatically escaped

### Side Quests Section Component
**File:** `assets/js/components/side-quests-section.js`

**Features:**
- Section component for displaying collections of projects
- Uses Project Card component internally (demonstrates component composition)
- Configurable heading and subheading
- Grid layout for project cards
- Manual initialization with custom configuration

**Usage:**
```html
<div id="side-quests-container"></div>
<script src="assets/js/components/project-card.js"></script>
<script src="assets/js/components/side-quests-section.js"></script>
<script>
  const projects = [
    {
      title: 'Project 1',
      description: 'Description 1',
      url: 'https://example.com/1',
      imagePath: 'assets/images/project1.jpg',
      imageAlt: 'Project 1'
    },
    {
      title: 'Project 2',
      description: 'Description 2',
      url: 'https://example.com/2',
      imagePath: 'assets/images/project2.jpg',
      imageAlt: 'Project 2'
    }
  ];

  SideQuestsSection.init('side-quests-container', {
    heading: 'Development Side Quests',
    subheading: 'Optional subheading text',
    projects: projects
  });
</script>
```

**Configuration:**
```javascript
{
  heading: 'Section Heading', // Optional, has default
  subheading: 'Section subheading', // Optional, has default
  projects: [ // Array of project objects (see Project Card configuration)
    { title: '...', url: '...', ... }
  ]
}
```

**Security:** All heading and subheading text is automatically escaped. Project data is handled by the ProjectCard component which also escapes all data.

**Component Composition:**
This component demonstrates how components can work together. The Side Quests Section component uses the Project Card component internally, showing the composition pattern where:
- `project-card.js` is a lower-level, reusable component
- `side-quests-section.js` is a higher-level component that composes multiple Project Cards
- Both components remain independent and can be used separately

### Testimonials Section Component
**File:** `assets/js/components/testimonials-section.js`

**Features:**
- Section component for displaying testimonials/recommendations
- Configurable heading
- Grid layout for testimonial cards
- Supports optional photo, role, and company information
- Manual initialization with custom configuration

**Usage:**
```html
<div id="testimonials-container"></div>
<script src="assets/js/components/testimonials-section.js"></script>
<script>
  TestimonialsSection.init('testimonials-container', {
    heading: 'What People Say',
    testimonials: [
      {
        name: 'John Doe',
        role: 'Product Manager',
        company: 'Company Name',
        text: 'Testimonial text here...',
        photo: 'path/to/photo.jpg' // Optional
      }
    ]
  });
</script>
```

**Configuration:**
```javascript
{
  heading: 'Section Heading', // Optional, defaults to 'What People Say'
  testimonials: [ // Array of testimonial objects
    {
      name: 'Person Name', // Required
      role: 'Job Title', // Optional
      company: 'Company Name', // Optional
      text: 'Testimonial text', // Required
      photo: 'path/to/photo.jpg' // Optional
    }
  ]
}
```

**Security:** All testimonial data (name, role, company, text, heading, photo paths) is automatically escaped before insertion into HTML.

### Case Study Card Component
**File:** `assets/js/components/case-study-card.js`

**Features:**
- Section component for displaying case study previews
- Configurable heading and subheading
- Grid layout for case study cards
- Supports optional metrics display
- Manual initialization with custom configuration

**Usage:**
```html
<div id="case-studies-container"></div>
<script src="assets/js/components/case-study-card.js"></script>
<script>
  CaseStudiesSection.init('case-studies-container', {
    heading: 'Featured Case Studies',
    subheading: 'A selection of projects showcasing my approach.',
    caseStudies: [
      {
        title: 'Case Study Title',
        description: 'Brief description',
        href: 'case-studies/page.html',
        imagePath: 'path/to/image.jpg',
        imageAlt: 'Case study image',
        metrics: '40% increase' // Optional
      }
    ]
  });
</script>
```

**Configuration:**
```javascript
{
  heading: 'Section Heading', // Optional, has default
  subheading: 'Section subheading', // Optional, has default
  caseStudies: [ // Array of case study objects
    {
      title: 'Case Study Title', // Required
      description: 'Brief description', // Optional
      href: 'path/to/case-study.html', // Required
      imagePath: 'path/to/image.jpg', // Optional
      imageAlt: 'Alt text', // Optional, defaults to title
      metrics: '40% increase' // Optional metrics display
    }
  ]
}
```

**Security:** All case study data (title, description, heading, subheading, href, image paths, metrics) is automatically escaped before insertion into HTML.

### Skills Section Component
**File:** `assets/js/components/skills-section.js`

**Features:**
- Section component for displaying skills organized into three categories
- Apple-inspired card-based design with hover animations
- Configurable heading
- Three category groups: Tools & Technologies, Guiding Principles, A Bit About Me
- Manual initialization with custom configuration

**Usage:**
```html
<div id="skills-container"></div>
<script src="assets/js/components/skills-section.js"></script>
<script>
  SkillsSection.init('skills-container', {
    heading: 'Skills & Expertise',
    tools: [
      'Figma',
      'Framer',
      'Product Design',
      'Wireframing'
    ],
    principles: [
      'True believer in the 8pt grid',
      'Double Diamond Design Process',
      'Jobs to be Done'
    ],
    personality: [
      'I secretly really enjoy copywriting',
      'Figma fanatic'
    ]
  });
</script>
```

**Configuration:**
```javascript
{
  heading: 'Section Heading', // Optional, defaults to 'Skills & Expertise'
  tools: [ // Array of tool/technology strings
    'Tool 1',
    'Tool 2'
  ],
  principles: [ // Array of guiding principle strings
    'Principle 1',
    'Principle 2'
  ],
  personality: [ // Array of personality trait strings
    'Trait 1',
    'Trait 2'
  ]
}
```

**Security:** All tools, principles, personality items, and heading text are automatically escaped before insertion into HTML.

### Contact Section Component
**File:** `assets/js/components/contact-section.js`

**Features:**
- Section component for displaying contact information
- Configurable heading and subheading
- Supports email, phone, LinkedIn, and location
- Optional availability status
- Clickable contact methods (mailto:, tel: links)
- Manual initialization with custom configuration

**Usage:**
```html
<div id="contact-container"></div>
<script src="assets/js/components/contact-section.js"></script>
<script>
  ContactSection.init('contact-container', {
    heading: 'Let\'s Work Together',
    subheading: 'I\'m always open to discussing new opportunities.',
    email: 'email@example.com',
    phone: '0401 234 567',
    linkedInUrl: 'https://www.linkedin.com/in/profile/',
    location: 'City, State',
    availability: 'Available for freelance work' // Optional
  });
</script>
```

**Configuration:**
```javascript
{
  heading: 'Section Heading', // Optional, has default
  subheading: 'Section subheading', // Optional, has default
  email: 'email@example.com', // Optional
  phone: 'Phone number', // Optional (formatted as '0401 068 837' for Australian numbers)
  linkedInUrl: 'LinkedIn URL', // Optional
  location: 'Location string', // Optional
  availability: 'Availability status' // Optional
}
```

**Security:** All contact data (heading, subheading, email, phone, location, availability, LinkedIn URL) is automatically escaped before insertion into HTML. Phone numbers are cleaned for tel: links but displayed text is escaped.

## Creating New Components

### Step-by-Step Process

1. **Plan the Component**
   - Define functionality and requirements
   - Identify configuration options
   - Consider accessibility needs
   - Plan responsive behavior

2. **Create the JavaScript File**
   - Follow the component pattern above
   - Implement configuration object
   - Write helper functions
   - Generate HTML structure
   - Initialize functionality

3. **Add CSS Styles**
   - Use existing design tokens
   - Add component-specific styles to `style.css`
   - Include responsive breakpoints
   - Add animations/transitions

4. **Test Thoroughly**
   - Test on multiple devices
   - Verify keyboard navigation
   - Check screen reader compatibility
   - Test edge cases

5. **Document Usage**
   - Add usage examples
   - Document configuration options
   - Note any dependencies
   - Include accessibility notes

## Component Checklist

When creating a new component, ensure:

- [ ] Self-contained and reusable
- [ ] Configuration-driven
- [ ] Accessible (ARIA, keyboard navigation)
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Touch-friendly (44px minimum targets)
- [ ] Smooth animations/transitions
- [ ] Error handling and edge cases
- [ ] Clean, semantic HTML
- [ ] Uses design tokens from `tokens.css`
- [ ] Documented with usage examples
- [ ] **Security: All user-provided data escaped with `escapeHTML()`**
- [ ] **Security: Input validation for required fields**
- [ ] **Security: No raw HTML injection from configuration**

## Future Components

Components to implement following this methodology:

### Overflow Menu Component
- Dropdown/popover positioning
- Keyboard navigation (arrow keys, Escape)
- Click outside to close
- Mobile-friendly touch interactions
- Animation and transitions

### Modal/Dialog Component
- Focus trap
- Body scroll lock
- Backdrop overlay
- Close on Escape
- Accessible dialog structure

### Form Components
- Input fields with validation
- Checkboxes and radio buttons
- Select dropdowns
- Error states and messages
- Accessible labels and descriptions

## Best Practices

### Security
- **Always escape user-provided data** using `escapeHTML()` before inserting into HTML
- Never trust configuration data - escape all strings from config objects
- Validate required fields and return early if validation fails
- Avoid features that allow raw HTML injection (e.g., `config.icon.html`)
- Test components with malicious input (e.g., `<script>`, `&`, quotes)
- Use `textContent` property for safe escaping (as in `escapeHTML()` implementation)

### Performance
- Minimize DOM manipulation
- Use event delegation
- Debounce/throttle where appropriate
- Lazy load if needed

### Maintainability
- Keep functions small and focused
- Use descriptive variable names
- Comment complex logic
- Follow consistent patterns

### Accessibility
- Always include ARIA attributes
- Support keyboard navigation
- Ensure focus management
- Test with screen readers

### User Experience
- Provide visual feedback
- Handle loading states
- Show error states clearly
- Maintain consistent interactions

## Design Token Usage

All components should use the design tokens defined in `tokens.css`:

```css
/* Spacing */
var(--spacing-xs)    /* 2px */
var(--spacing-sm)    /* 4px */
var(--spacing-md)    /* 8px */
var(--spacing-lg)    /* 12px */
var(--spacing-xl)    /* 16px */
var(--spacing-2xl)   /* 24px */

/* Colors */
var(--color-text-primary)
var(--color-text-secondary)
var(--color-text-tertiary)
var(--color-cta)
var(--color-background-primary)

/* Typography */
var(--font-body)
var(--font-heading)
var(--font-size-base)
var(--font-size-lg)
/* etc. */
```

## Questions or Issues?

When implementing new components:
1. Refer to existing components (like `navigation.js`) as examples
2. Follow the patterns outlined in this document
3. Test thoroughly before deploying
4. Update this documentation if patterns evolve
