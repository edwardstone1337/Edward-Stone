import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=54-3', {
  example: () =>
    html`<aside class="dp-tldr">
  <h2 class="dp-tldr__heading">TL;DR</h2>
  <ul class="dp-tldr__list">
    <li class="dp-tldr__item">Key takeaway one</li>
    <li class="dp-tldr__item">Key takeaway two</li>
  </ul>
</aside>`,
})
