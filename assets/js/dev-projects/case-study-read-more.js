import { CASE_STUDIES } from './case-study-data.js';

export function initReadMore() {
  var target = document.getElementById('read-more-container');
  if (!target) return;

  // Suppressed on prod while the site leads with the Planner case study alone.
  // Every link this section renders points at a case study the prod nav no
  // longer offers, so leaving it would reintroduce the exact routes the nav
  // just closed. Off prod it renders as before.
  //
  // The placeholder is removed rather than left in the DOM: it is an empty div
  // today, but leaving a hook that no longer receives content invites a future
  // stylesheet to give it margins nobody can see the source of.
  //
  // Checked at call time, not at module scope, because env.js sets `is-prod`
  // in <head> and this module is imported at the end of <body>; reading it
  // here keeps the two independent of each other's ordering.
  if (document.documentElement.classList.contains('is-prod')) {
    target.remove();
    return;
  }

  var currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  var links = CASE_STUDIES.filter(function (item) {
    return item.href.replace(/\/$/, '') !== currentPath;
  });

  var section = document.createElement('section');
  section.className = 'dp-read-more dp-reveal';
  section.setAttribute('aria-label', 'More case studies');

  var heading = '<h2 class="dp-read-more__heading">Read another case study</h2>';
  var items = links.map(function (link) {
    return '<li><a class="dp-read-more__link" href="' + link.href + '">' + link.text + '</a></li>';
  }).join('');

  section.innerHTML = heading + '<ul class="dp-read-more__list">' + items + '</ul>';
  target.replaceWith(section);
}
