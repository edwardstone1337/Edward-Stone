export function initContactCta() {
  var target = document.getElementById('contact-cta-container');
  if (!target) return;

  var section = document.createElement('section');
  section.className = 'dp-contact-cta dp-reveal';
  section.setAttribute('aria-label', 'Contact');
  section.innerHTML =
    '<h2 class="dp-contact-cta__heading">Let\'s talk</h2>' +
    '<p class="dp-contact-cta__body">I\'m currently open to new opportunities.</p>' +
    '<div class="dp-contact-cta__actions">' +
      '<a href="mailto:edwardstone1337@gmail.com" class="dp-btn dp-btn-primary">Email me</a>' +
      '<a href="https://www.linkedin.com/in/edwardstone1337/" class="dp-btn dp-btn-secondary-on-light" target="_blank" rel="noopener noreferrer">LinkedIn</a>' +
    '</div>';

  target.replaceWith(section);
}
