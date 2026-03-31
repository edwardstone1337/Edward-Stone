import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=66-2', {
  example: () =>
    html`<figure class="dp-testimonial">
  <div class="dp-testimonial-mark" aria-hidden="true"></div>
  <p class="dp-testimonial-quote">"Quote text here."</p>
  <figcaption class="dp-testimonial-attribution">
    <cite class="dp-testimonial-name">Full Name</cite>
    <span class="dp-testimonial-role">Role, Company</span>
  </figcaption>
</figure>`,
})
