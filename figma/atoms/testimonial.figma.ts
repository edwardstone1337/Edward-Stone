import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=36-3', {
  example: () => html`<div class="dp-testimonial-mark" aria-hidden="true"></div>`,
})

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=37-3', {
  props: { text: figma.string('Text') },
  example: ({ text }) => html`<p class="dp-testimonial-quote">${text}</p>`,
})

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=38-3', {
  props: { name: figma.string('Text') },
  example: ({ name }) => html`<cite class="dp-testimonial-name">${name}</cite>`,
})

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=39-3', {
  props: { role: figma.string('Text') },
  example: ({ role }) => html`<span class="dp-testimonial-role">${role}</span>`,
})
