import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=47-9', {
  props: {
    label: figma.string('Label'),
    state: figma.enum('State', {
      Closed: 'false',
      Open: 'true',
    }),
  },
  example: ({ label, state }) =>
    html`<div class="dp-nav-dropdown">
  <button class="dp-nav-dropdown-trigger" aria-expanded="${state}">${label} <svg /></button>
</div>`,
})
