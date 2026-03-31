import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=56-6', {
  props: {
    width: figma.enum('Width', {
      Standard: '',
      Wide: ' dp-prose-image--wide',
      'Full Bleed': '',
    }),
    wrapperClass: figma.enum('Width', {
      Standard: 'dp-prose-figure',
      Wide: 'dp-prose-figure',
      'Full Bleed': 'dp-prose-figure dp-prose-figure--full',
    }),
  },
  example: ({ width, wrapperClass }) =>
    html`<figure class="${wrapperClass}">
  <img class="dp-prose-image${width}" src="image.webp" alt="" loading="lazy" />
</figure>`,
})
