import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=67-6', {
  example: () =>
    html`<div class="dp-dropdown-menu dp-nav-dropdown-menu" role="menu">
  <a class="dp-nav-dropdown-item" role="menuitem" href="#">Item 1</a>
  <a class="dp-nav-dropdown-item" role="menuitem" href="#">Item 2</a>
</div>`,
})

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=68-9', {
  example: () =>
    html`<div class="dp-impact-banner" aria-label="Key outcomes">
  <div class="dp-impact-banner__item">
    <span class="dp-impact-banner__value">25,000+</span>
    <span class="dp-impact-banner__label">Weekly users</span>
  </div>
  <div class="dp-impact-banner__item">
    <span class="dp-impact-banner__value">30%</span>
    <span class="dp-impact-banner__label">Conversion lift</span>
  </div>
</div>`,
})

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=69-28', {
  example: () =>
    html`<footer class="dp-footer">
  <div class="dp-footer-inner">
    <p class="dp-footer-text">&copy; 2026 Edward Stone</p>
    <nav class="dp-footer-links" aria-label="Footer links">
      <a class="dp-footer-link" href="mailto:hello@edwardstone.design">Email</a>
      <a class="dp-footer-link" href="https://linkedin.com/in/edwardstone1337">LinkedIn</a>
      <a class="dp-footer-link" href="#" data-hotjar-feedback>Feedback</a>
    </nav>
  </div>
</footer>`,
})

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=73-18', {
  example: () =>
    html`<div class="dp-resume-download" data-download-widget>
  <button class="dp-btn dp-btn-secondary dp-download-trigger" aria-haspopup="true" aria-expanded="false">
    Download Resume <svg class="dp-download-chevron" />
  </button>
  <div class="dp-dropdown-menu dp-download-menu" role="menu" hidden>
    <button class="dp-download-menu-item" role="menuitem" data-print-pdf>Print to PDF</button>
    <button class="dp-download-menu-item" role="menuitem" data-copy-resume>Copy to clipboard</button>
  </div>
</div>`,
})
