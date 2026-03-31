import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=60-9', {
  props: {
    state: figma.enum('State', {
      Collapsed: 'false',
      Expanded: 'true',
    }),
  },
  example: ({ state }) =>
    html`<button class="dp-btn dp-btn-secondary dp-download-trigger" aria-expanded="${state}" aria-haspopup="true">
  Download Resume
  <svg class="dp-download-chevron" />
</button>`,
})
