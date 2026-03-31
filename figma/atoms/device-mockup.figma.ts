import figma, { html } from '@figma/code-connect/html'

figma.connect('https://www.figma.com/file/TqbI9xNk3tOFR4aoPWA9HI?node-id=57-5', {
  example: () =>
    html`<div class="dp-strip-media">
  <iframe src="widget.html" title="Product preview" loading="lazy"></iframe>
</div>`,
})
