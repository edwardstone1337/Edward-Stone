import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=23-3', {
  example: () => html`<div class="dp-glass"></div>`,
})

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=24-3', {
  example: () => html`<div class="dp-fade-edge"></div>`,
})

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=25-3', {
  example: () => html`<div class="dp-glow"></div>`,
})
