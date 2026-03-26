import { CASE_STUDIES } from './case-study-data.js';

export function initReadMore() {
  var target = document.getElementById('read-more-container');
  if (!target) return;

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
