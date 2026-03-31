import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=51-10', {
  props: {
    state: figma.enum('State', {
      Closed: '',
      Open: ' is-open',
    }),
  },
  example: ({ state }) =>
    html`<button class="dp-nav-hamburger${state}" aria-label="Menu">
  <span class="dp-nav-hamburger-label">Menu</span>
</button>`,
})
