import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=16-23', {
  props: {
    label: figma.string('Label'),
    type: figma.enum('Type', {
      Primary: 'primary',
      Secondary: 'secondary',
    }),
    theme: figma.enum('Theme', {
      Default: '',
      'On Dark': '-on-dark',
      'On Light': '-on-light',
    }),
  },
  example: ({ label, type, theme }) =>
    html`<a class="dp-btn dp-btn-${type}${theme}" href="#">${label}</a>`,
})
