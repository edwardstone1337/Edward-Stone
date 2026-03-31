import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=74-26', {
  example: () =>
    html`<div class="dp-hero-card">
  <h2 class="dp-hero-card__heading">Read how I make an impact</h2>
  <ul class="dp-hero-card__list">
    <li><a class="dp-hero-card__link" href="/case-studies/planner">Planner</a></li>
    <li><a class="dp-hero-card__link" href="/case-studies/product-discovery">Product Discovery</a></li>
    <li><a class="dp-hero-card__link" href="/case-studies/design-systems">Design Systems</a></li>
    <li><a class="dp-hero-card__link" href="/case-studies/fair-share">Fair Share</a></li>
  </ul>
</div>`,
})
