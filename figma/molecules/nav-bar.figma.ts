import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=76-58', {
  example: () =>
    html`<nav class="dp-nav" aria-label="Site navigation">
  <div class="dp-nav-inner">
    <a class="dp-nav-brand" href="/">
      <svg class="dp-nav-logo"></svg>
      <span class="dp-nav-name">Edward Stone</span>
    </a>
    <div class="dp-nav-links">
      <div class="dp-nav-dropdown">
        <button class="dp-nav-dropdown-trigger" aria-expanded="false">Case Studies</button>
        <div class="dp-dropdown-menu dp-nav-dropdown-menu" role="menu" hidden>
          <a class="dp-nav-dropdown-item" role="menuitem" href="#">Planner</a>
        </div>
      </div>
      <a class="dp-nav-link" href="/resume">Resume</a>
    </div>
    <div class="dp-nav-actions" id="dp-nav-actions"></div>
  </div>
</nav>`,
})
