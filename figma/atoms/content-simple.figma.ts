import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=17-3', {
  props: { label: figma.string('Label') },
  example: ({ label }) => html`<span class="dp-strip-badge">${label}</span>`,
})

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=40-7', {
  props: { label: figma.string('Label') },
  example: ({ label }) => html`<a class="dp-footer-link" href="#">${label}</a>`,
})

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=61-3', {
  props: { message: figma.string('Text') },
  example: ({ message }) =>
    html`<div class="dp-snackbar dp-snackbar--visible" role="status">${message}</div>`,
})
