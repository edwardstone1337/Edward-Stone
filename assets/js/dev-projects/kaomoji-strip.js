/**
 * Kaomoji Strip
 *
 * The kaomoji.click product strip, owned in one place and mounted by every page
 * that shows it (currently index.html and personal.html). Before this module the
 * markup lived in index.html and the behaviour lived in a ~70-line inline script
 * beside it; a second page would have meant a second copy of both.
 *
 * Usage:
 *   import { initKaomojiStrip } from './assets/js/dev-projects/kaomoji-strip.js';
 *   const kaomoji = initKaomojiStrip('#kaomoji-mount');
 *   // then pass kaomoji.cursorTrigger into the page's initCursorChat() call
 *
 * The module deliberately does NOT call initCursorChat itself. index.html
 * registers ten hover triggers in a single call (avatar, logo bar, testimonials,
 * hero wave, counter, and this strip) and cursor-chat.js builds one bubble per
 * call, so ownership of that call has to stay with the page. This module hands
 * back a trigger object instead and lets the caller compose it in.
 *
 * Ordering requirement: initCursorChat resolves every trigger's selector once,
 * at init, and silently skips selectors that match nothing. Mount the strip
 * BEFORE the page calls initCursorChat, or the hover bubble never binds.
 *
 * All strings below are module-owned literals — nothing here is user- or
 * iframe-supplied, so there is no dynamic content to sanitise. The one message
 * that crosses a trust boundary (the iframe's copy signal) carries no text: see
 * the postMessage listener below.
 *
 * Styles: .dp-strip / .dp-strip--kaomoji in assets/css/dev-styles.css,
 * tokens in assets/css/dev-tokens.css. The bubble needs assets/css/cursor-chat.css.
 */

const STRIP_ID = 'strip-kaomoji';
const PREVIEW_SRC = '/assets/previews/kaomoji/index.html';
const KAOMOJI_URL = 'https://www.kaomoji.click/';

/* Hover bubble wording. The prompt is the resting state; a successful copy swaps
   in the thanks, and leaving the strip resets it back to the prompt. */
const KAOMOJI_PROMPT = 'Try clicking one';
const KAOMOJI_THANKS = 'Great choice';

const EXTERNAL_ICON =
  '<span class="dp-btn-icon" aria-hidden="true">' +
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
  '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' +
  '<polyline points="15 3 21 3 21 9"/>' +
  '<line x1="10" y1="14" x2="21" y2="3"/>' +
  '</svg></span>';

function stripMarkup() {
  return `
<section class="dp-strip dp-strip--flipped dp-strip--kaomoji" id="${STRIP_ID}" aria-label="Kaomoji.click, featured project">
  <div class="dp-strip-inner">
    <div class="dp-strip-content">
      <span class="dp-strip-emoji" aria-hidden="true">ʕ•ᴥ•ʔ</span>
      <h2 class="dp-strip-title">There are hundreds of kaomoji.<br>I built a home to find the one you need.</h2>
    </div>
    <div class="dp-strip-media">
      <iframe
        src="${PREVIEW_SRC}"
        title="Kaomoji.click preview"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
        style="width: 100%; height: 100%; aspect-ratio: 1 / 1; border: none; border-radius: inherit; display: block;"
      ></iframe>
    </div>
    <div class="dp-strip-actions">
      <a href="${KAOMOJI_URL}" class="dp-btn dp-btn-primary" target="_blank" rel="noopener noreferrer" aria-label="Go to Kaomoji.click (opens in new tab)">Go to Kaomoji.click ${EXTERNAL_ICON}</a>
    </div>
  </div>
</section>`;
}

/**
 * Render the strip and wire its behaviour.
 *
 * @param {string} mountSelector - selector for a placeholder element. The
 *   placeholder is REPLACED by the strip rather than filled, so the strip ends
 *   up as a direct child of whatever contained the placeholder and no extra
 *   wrapper div enters the layout.
 * @returns {{ section: HTMLElement, cursorTrigger: Object }|null}
 *   null when the mount point is absent, so a page can drop the strip by
 *   deleting its placeholder alone.
 */
export function initKaomojiStrip(mountSelector) {
  const mount = document.querySelector(mountSelector);
  if (!mount) return null;

  const template = document.createElement('template');
  template.innerHTML = stripMarkup().trim();
  const section = template.content.firstElementChild;
  mount.replaceWith(section);

  /* Held by reference and handed to the caller. cursor-chat.js reads
     trigger.message when the hover event fires, not at init, so mutating this
     object below changes what the next hover shows with no change needed
     inside cursor-chat.js. */
  const cursorTrigger = {
    type: 'hover',
    selector: '#' + STRIP_ID,
    message: KAOMOJI_PROMPT,
  };

  /* The preview posts { type: 'kaomoji-copy' } after a successful clipboard
     write. It carries no display text by design — the wording is ours, so
     nothing from the iframe is ever rendered. Origin is still checked because
     the embed is same-origin by construction (root-relative src +
     allow-same-origin), which makes any other origin a signal to ignore. */
  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    if (!event.data || event.data.type !== 'kaomoji-copy') return;
    cursorTrigger.message = KAOMOJI_THANKS;
  });

  /* The trigger covers the whole section, padding included, but the preview is
     an iframe and pointer events inside it never reach this document — so the
     bubble would hang at the boundary while the cursor moved on. mouseenter and
     mouseleave on the iframe element DO fire here, so they bridge the gap:
     entering the preview fakes a leave, exiting it fakes an enter. `bridging`
     marks those synthetic events so the reset below ignores them and only fires
     on a real exit. */
  const frame = section.querySelector('iframe');
  let bridging = false;

  if (frame) {
    const bridge = (type) => {
      bridging = true;
      section.dispatchEvent(new MouseEvent(type));
      bridging = false;
    };
    frame.addEventListener('mouseenter', () => bridge('mouseleave'));
    frame.addEventListener('mouseleave', () => bridge('mouseenter'));
  }

  section.addEventListener('mouseleave', () => {
    if (!bridging) cursorTrigger.message = KAOMOJI_PROMPT;
  });

  return { section, cursorTrigger };
}
