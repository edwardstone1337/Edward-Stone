import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=52-3', {
  example: () =>
    html`<a class="dp-nav-brand" href="/">
  <svg class="dp-nav-logo"></svg>
  <span class="dp-nav-name">Edward Stone</span>
</a>`,
})
