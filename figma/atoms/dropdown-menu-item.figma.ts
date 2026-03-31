import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=48-7', {
  props: {
    label: figma.string('Label'),
  },
  example: ({ label }) =>
    html`<a class="dp-nav-dropdown-item" role="menuitem" href="#">${label}</a>`,
})
