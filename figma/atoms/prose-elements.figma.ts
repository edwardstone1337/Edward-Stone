import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=31-7', {
  props: { text: figma.string('Text') },
  example: ({ text }) =>
    html`<blockquote class="dp-pullquote"><p>${text}</p></blockquote>`,
})

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=32-7', {
  props: { label: figma.string('Label') },
  example: ({ label }) => html`<a href="#">${label}</a>`,
})

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=33-3', {
  props: { value: figma.string('Value'), label: figma.string('Label') },
  example: ({ value, label }) =>
    html`<div class="dp-impact-banner__item">
  <span class="dp-impact-banner__value">${value}</span>
  <span class="dp-impact-banner__label">${label}</span>
</div>`,
})

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=55-3', {
  props: { text: figma.string('Text') },
  example: ({ text }) => html`<figcaption class="dp-prose-caption">${text}</figcaption>`,
})
