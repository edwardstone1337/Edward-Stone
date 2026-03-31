import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=13-2', {
  props: { label: figma.string('Label') },
  example: ({ label }) => html`<p class="dp-overline">${label}</p>`,
})

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=13-4', {
  props: { text: figma.string('Text') },
  example: ({ text }) => html`<span class="dp-gradient-text">${text}</span>`,
})

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=14-2', {
  props: { label: figma.string('Label') },
  example: ({ label }) =>
    html`<div class="dp-section-label"><p class="dp-overline">${label}</p></div>`,
})
