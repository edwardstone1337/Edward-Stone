/**
 * Planner prototype — shared in-frame drawer shell.
 *
 * Extracted from drawer.js (brief §6) once a second consumer (unit-drawer.js,
 * round 4) needed the identical mechanics: slide-from-right within
 * `.pl-frame`, in-frame scrim, inert background, manual focus trap,
 * Escape/scrim-click to close, focus return to the trigger on close, ~200ms
 * slide (instant under `prefers-reduced-motion`).
 *
 * This module owns ONLY the shell: the `<dialog>` + scrim DOM, open/close
 * animation, the manual Tab focus trap (a non-modal dialog opened with
 * `.show()` gets none of `.showModal()`'s free modality — see the original
 * rationale preserved below), Escape handling, scrim click, and focus
 * return. Content — header controls beyond a bare title (e.g. the Add Units
 * drawer's back button), and the body — is entirely the caller's
 * responsibility: this module hands back the bare `dialog` element for the
 * caller to append its own header/body into.
 *
 * Exclusivity (both drawers must never be open at once — round 4): this
 * module does not enforce that itself, since it has no notion of "the other
 * drawer". The composition root (planner.js) does, by calling
 * `requestClose({ animate: false })` on whichever drawer is open before
 * calling `open()` on the other. Passing `animate: false` closes
 * synchronously (dialog.close() fires its 'close' event, including the
 * inert-restore, immediately rather than after a transition), so by the time
 * the caller's very next line opens the other drawer, there's no async
 * window where both are mid-transition and racing to set `inert` — the
 * inline doc on `requestClose` below has the detail.
 */

const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * @param {Object} config
 * @param {HTMLElement} config.frameEl - The product window frame
 *   (`.pl-frame`) the drawer and its scrim mount into as direct children —
 *   it's the frame's `position: relative` that anchors them.
 * @param {HTMLElement} config.inertEl - The frame's other content (toolbar +
 *   board), sent `inert` while the drawer is open so it can't be reached by
 *   Tab or assistive tech (no native modal dialog is doing this for free).
 * @param {HTMLElement} [config.fallbackFocusEl] - Focus target used when the
 *   element that opened the drawer no longer exists when it closes (e.g. a
 *   card/row replaced by a re-render while the drawer was open).
 * @param {string} [config.dialogClassName] - Base class on the `<dialog>`;
 *   also the open-state modifier is `{dialogClassName}--open`. Both drawers
 *   default to 'pl-drawer' so they share the existing slide/position CSS
 *   verbatim — there is nothing drawer-specific in that CSS to fork.
 * @param {string} [config.labelledBy] - id of the caller's own title element,
 *   set as the dialog's `aria-labelledby`.
 */
export function createDrawerShell(config) {
  const { frameEl, inertEl, fallbackFocusEl, dialogClassName = 'pl-drawer', labelledBy } = config;

  let lastTrigger = null;
  let isClosing = false;
  let openState = false;

  const scrim = document.createElement('div');
  scrim.className = 'pl-drawer-scrim';

  const dialog = document.createElement('dialog');
  dialog.className = dialogClassName;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  if (labelledBy) dialog.setAttribute('aria-labelledby', labelledBy);

  frameEl.appendChild(scrim);
  frameEl.appendChild(dialog);

  function setInert(value) {
    if (inertEl) inertEl.inert = value;
  }

  function getFocusable() {
    return Array.from(
      dialog.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((el) => el.offsetParent !== null);
  }

  function finishClose() {
    isClosing = false;
    if (dialog.open) dialog.close();
  }

  /**
   * @param {{ animate?: boolean }} [opts] - `animate: false` closes
   *   synchronously (no slide-out), used by planner.js to force-close the
   *   OTHER drawer immediately before opening this one (see module doc).
   *   Defaults to true for the normal user-initiated paths (✕ / scrim /
   *   Escape).
   */
  function requestClose(opts) {
    const animate = !(opts && opts.animate === false);
    if (!dialog.open || isClosing) return;

    if (!animate || reduceMotionQuery.matches) {
      dialog.classList.remove(dialogClassName + '--open');
      scrim.classList.remove('pl-drawer-scrim--visible');
      dialog.close();
      return;
    }

    isClosing = true;
    dialog.classList.remove(dialogClassName + '--open');
    scrim.classList.remove('pl-drawer-scrim--visible');

    const onTransitionEnd = (e) => {
      if (e.target !== dialog || e.propertyName !== 'transform') return;
      dialog.removeEventListener('transitionend', onTransitionEnd);
      finishClose();
    };
    dialog.addEventListener('transitionend', onTransitionEnd);

    // Fallback in case the transition never fires (e.g. this browser lacks
    // support for something above) — matches the nav drawer's own
    // transitionend + timeout pattern (nav-component.js closeDrawer()).
    window.setTimeout(() => {
      dialog.removeEventListener('transitionend', onTransitionEnd);
      finishClose();
    }, 300);
  }

  // Scrim click closes — the in-frame stand-in for a modal dialog's
  // ::backdrop click (there's no native backdrop without showModal()).
  scrim.addEventListener('click', () => requestClose());

  // Manual focus trap + Escape: open() below uses .show(), not
  // .showModal(), so neither of the browser's usual conveniences apply
  // here — a non-modal dialog doesn't fire 'cancel' on Escape, and Tab
  // isn't confined to it. Reimplemented by hand, same idiom as
  // nav-component.js's mobile drawer keydown handler.
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      requestClose();
      return;
    }

    if (e.key !== 'Tab') return;
    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first || !dialog.contains(document.activeElement)) {
        e.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last || !dialog.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    }
  });

  dialog.addEventListener('close', () => {
    openState = false;
    setInert(false);
    scrim.classList.remove('pl-drawer-scrim--visible');
    const target =
      lastTrigger && document.body.contains(lastTrigger) ? lastTrigger : fallbackFocusEl;
    if (target && typeof target.focus === 'function') target.focus({ preventScroll: true });
    lastTrigger = null;
  });

  /**
   * Open the drawer. `triggerEl` is the element that opened it — focus
   * returns there on close (or to `fallbackFocusEl` if it's gone by then).
   * `renderFn`, if given, runs AFTER the dialog is shown (so any `.focus()`
   * call inside it actually works — see the note below) and BEFORE the
   * slide-in transition starts.
   * @param {HTMLElement} [triggerEl]
   * @param {() => void} [renderFn]
   */
  function open(triggerEl, renderFn) {
    lastTrigger = triggerEl || document.activeElement;
    openState = true;

    // Open (and become visible) BEFORE running renderFn: a focus() call on
    // an element inside a still-closed <dialog> is a silent no-op (the UA
    // hides everything under dialog:not([open])). .show() (not
    // .showModal()) keeps this in normal document flow, inside .pl-frame,
    // instead of promoting it to the browser's top layer.
    if (typeof dialog.show === 'function') {
      dialog.show();
    } else {
      dialog.setAttribute('open', '');
    }

    // Root cause of "everything underneath slides": show() runs the HTML
    // spec's dialog-focusing steps synchronously and — since nothing inside
    // has [autofocus] yet before renderFn runs — focuses the <dialog>
    // itself. At this instant the drawer is still in its closed-state
    // position (`transform: translateX(100%)`, off-canvas past .pl-frame's
    // clipped right edge), so the browser's default focus-scrolls-into-view
    // behaviour scrolls .pl-frame (the nearest clipping/scrollable
    // ancestor) horizontally to reveal it — and nothing ever scrolls it
    // back, so the frame's whole content stays shifted sideways underneath.
    // This focus step has no options we can pass (it isn't our .focus()
    // call), so the fix is to stamp the scroll straight back to (0,0)
    // synchronously, before any paint. .pl-frame is a clip-only surface —
    // it should never actually scroll — so this is safe unconditionally.
    frameEl.scrollLeft = 0;
    frameEl.scrollTop = 0;

    setInert(true);
    if (typeof renderFn === 'function') renderFn();

    // Force a reflow so the slide-in transition plays from the off-screen
    // base state rather than jumping straight to open (same trick as the
    // nav drawer's openDrawer()).
    void dialog.offsetHeight;
    dialog.classList.add(dialogClassName + '--open');
    scrim.classList.add('pl-drawer-scrim--visible');
  }

  function isOpen() {
    return openState;
  }

  return { dialog, scrim, open, requestClose, isOpen, getFocusable };
}
