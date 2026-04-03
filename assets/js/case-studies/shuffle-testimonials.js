/**
 * Shuffle testimonials — Fisher-Yates in-place DOM reorder.
 *
 * Finds .dp-testimonials-masonry--full, collects direct .dp-testimonial
 * children, shuffles them, and re-appends in shuffled order.
 * Called once on page load; no animation, no dependencies.
 */

export function initShuffleTestimonials() {
  var container = document.querySelector('.dp-testimonials-masonry--full');
  if (!container) return;

  var items = Array.from(container.querySelectorAll(':scope > .dp-testimonial'));
  if (items.length < 2) return;

  // Fisher-Yates shuffle
  for (var i = items.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }

  items.forEach(function (item) {
    container.appendChild(item);
  });
}
