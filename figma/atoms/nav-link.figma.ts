import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=46-11', {
  props: {
    label: figma.string('Label'),
  },
  example: ({ label }) =>
    html`<a class="dp-nav-link" href="#">${label}</a>`,
})
