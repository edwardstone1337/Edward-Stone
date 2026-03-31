import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=30-11', {
  props: {
    text: figma.string('Text'),
    style: figma.enum('Style', {
      Default: '',
      Accent: ' dp-hero-accent',
    }),
  },
  example: ({ text, style }) =>
    html`<span class="dp-hero-line${style}">${text}</span>`,
})
