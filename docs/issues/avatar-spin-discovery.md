# Avatar spin — implementation discovery

Discovery for the dev-projects hero avatar easter egg (click → spin + confetti). Use this when fixing or changing the spin behaviour.

## Where it lives

| What | File |
|------|------|
| Click handler, spin vs wiggle, confetti | `assets/js/dev-projects/avatar-easter-egg.js` |
| Spin/wiggle keyframes and classes | `assets/css/dev-styles.css` (avatar block ~254–283) |
| HTML | `.dp-magnetic-tilt.dp-avatar-wrap` wrapping `<img class="dp-hero-avatar ...">` (e.g. `index.html`, `dev-projects.html`) |

Script load order (e.g. in `index.html`): theme-toggle → utils → project-card → projects-grid → magnetic-tilt → **avatar-easter-egg** → effects → snake-game. No other script depends on the avatar egg.

## Current spin implementation

### Trigger and state

- **Target:** Click on `.dp-avatar-wrap` (the wrapper div). The script runs on DOMContentLoaded: `document.querySelector('.dp-avatar-wrap')`, gets the inner `img`, attaches one click listener on the wrapper.
- **Guard:** `wrap._dpAvatarEasterEggAttached` prevents attaching the listener twice. `prefers-reduced-motion: reduce` disables the egg entirely (no listener).
- **Cooldown:** 1500 ms (`COOLDOWN_MS`). First click after cooldown → full spin + confetti. Clicks during cooldown → wiggle (or velocity boost if already spinning).

### Spin (JS-driven, no CSS keyframes)

- **State:** `currentAngle` (degrees, never reset), `angularVelocity` (degrees per frame), `animFrameId`.
- **Constants:** `CLICK_BOOST = 12`, `MAX_VELOCITY = 50`, `FRICTION = 0.98`, `STOP_THRESHOLD = 0.1`. Per-frame model: no deltaTime.
- **spinLoop():** `currentAngle += angularVelocity`; `angularVelocity *= FRICTION`; `img.style.transform = 'rotate(' + currentAngle + 'deg)'`; stop when `angularVelocity < STOP_THRESHOLD` (leave final angle).
- **fireSpin():** Set `img.style.transition = 'none'` and `willChange = 'transform'`; add `CLICK_BOOST` to `angularVelocity` (capped at `MAX_VELOCITY`); start loop if not running. Does not run confetti (confetti is at high-speed threshold in spinLoop).
- **Wiggle during spin:** If `angularVelocity > 0`, `fireWiggle()` does **not** add the wiggle class; it adds `CLICK_BOOST` to velocity and ensures the loop is running. This avoids CSS wiggle transform overriding the inline rotate.

### High-speed image swap

- **Constants:** `HIGH_SPEED_THRESHOLD = 35` (deg/frame), `SPUN_IMAGE_PATH = 'assets/images/profile-spun.jpg'`, module flag `spunImageShown`.
- **In spinLoop():** After updating angle/velocity/transform, if `!spunImageShown && angularVelocity >= HIGH_SPEED_THRESHOLD`, set `img.src = SPUN_IMAGE_PATH`, `spunImageShown = true`, and call `runConfetti(wrap)`. One-way swap only; no revert for the rest of the session.

### Wiggle (cooldown feedback when not spinning)

- **JS:** When `angularVelocity === 0`, `fireWiggle()` adds `dp-avatar-wiggle` to the img, `animationend` removes it.
- **CSS:** `dp-avatar-wiggle` keyframes: 0°/100% 0°, 25% -5°, 50% 5°, 75% -3°. 300 ms, ease-in-out, forwards.

### Confetti

- **When:** When spin first reaches high speed (not on every spin, not on wiggle). `runConfetti(wrap)` is called from `spinLoop()` the first time `angularVelocity >= HIGH_SPEED_THRESHOLD` (same moment the avatar swaps to profile-spun.jpg).
- **How:** Canvas created, sized to 3× wrapper size, appended to wrapper. 35 particles, random angle, velocity 2–6, gravity 0.12, `PARTICLE_FRICTION` 0.98, 60 frames lifetime. Colors from a fixed palette. Canvas removed when all particles dead.

### Interaction with magnetic tilt

- The same element has both `.dp-magnetic-tilt` and `.dp-avatar-wrap`. `magnetic-tilt.js` runs on the wrapper and applies transform there. Spin sets inline `transform: rotate(Ndeg)` on the **img**. Tilt is on the wrapper; no explicit coordination between the two scripts.

## Summary

- **Spin:** JS-only: `spinLoop()` updates `currentAngle` and inline `transform: rotate(Ndeg)` each rAF; velocity accumulates per click, friction per frame. No CSS spin keyframes.
- **High-speed:** First time `angularVelocity >= HIGH_SPEED_THRESHOLD`, img swaps to profile-spun.jpg (once per session) and confetti runs.
- **Wiggle:** Class `dp-avatar-wiggle` on the img when **not** spinning; during spin, cooldown clicks boost velocity instead.
- To change spin: adjust `CLICK_BOOST`, `MAX_VELOCITY`, `FRICTION`, `STOP_THRESHOLD`, `HIGH_SPEED_THRESHOLD` in `avatar-easter-egg.js`.

---

# Discovery: Avatar spin jolt — status report

Investigation only. Temporary debug logging added in `avatar-easter-egg.js` (top of `spinLoop`) and `magnetic-tilt.js` (top of `setTilt` and `resetTilt`). Remove after testing.

## 1. CSS interference — .dp-reveal and scroll-reveal JS

### Full .dp-reveal CSS rules (dev-styles.css)

```css
.dp-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity var(--dp-duration-entrance) var(--dp-ease-out),
              transform var(--dp-duration-entrance) var(--dp-ease-out);
}

.dp-reveal.dp-revealed {
  opacity: 1;
  transform: translateY(0);
}
```

`--dp-duration-entrance` is **600ms** (dev-tokens.css). So **the avatar img has a 600ms CSS transition on `transform`**. Every time JS sets `img.style.transform = 'rotate(Ndeg)'`, the browser applies that transition: it interpolates from the previous computed transform to the new one over 600ms. Per-frame updates (~16ms) are therefore fighting a long transition, causing visible lag/jolt.

In `@media (prefers-reduced-motion: reduce)`:

```css
.dp-reveal {
  opacity: 0;
  transform: none;
  transition: opacity var(--dp-duration-base) var(--dp-ease-out);
}
.dp-reveal.dp-revealed {
  transform: none;
}
```

No transform transition in reduced-motion; spin is disabled there anyway.

### Other rules that could affect avatar/img

- **.dp-hero-avatar** (dev-styles.css ~239): `width`, `height`, `border-radius`, `object-fit`, `display`. No transition or transform.
- **.dp-avatar-wrap** (~254): `position: relative`, `border-radius`, `cursor`, `overflow`. No transition or transform.
- **.dp-magnetic-tilt** (~247): `display: inline-block`, `transform: perspective(600px) rotateY(0deg) rotateX(0deg)`. No transition. (Tilt script overwrites transform on the wrapper.)
- **.dp-avatar-wrap canvas** (~273): `position: absolute`, `top/left 50%`, `translate: -50% -50%`, `pointer-events: none`, `z-index: 10`. Does not target the img.
- **.dp-avatar-wiggle** (~267): `animation: dp-avatar-wiggle 300ms ...`. Only when class is applied; not applied during spin.

### Scroll-reveal JS (effects.js)

- **Does not set inline transform or transition on the img.** When an element enters the viewport, effects.js does:
  - `entry.target.style.transitionDelay = delay + 'ms';`
  - `entry.target.classList.add('dp-revealed');`
- So the avatar img gets inline `transitionDelay = '0ms'` when revealed. The **transition property itself** (including `transform 600ms ...`) comes only from CSS `.dp-reveal` and remains in effect after reveal.

### Inline styles in dev-projects.html

- Noscript block: `.dp-reveal { opacity: 1 !important; transform: none !important; }`. No script-set inline transition/transform on the avatar.

---

## 2. Magnetic tilt interference

- **Target:** Only the wrapper. `magnetic-tilt.js` queries `.dp-magnetic-tilt` and calls `setTilt(el, xDeg, yDeg)` / `resetTilt(el)` with `el` = the wrapper (same node as `.dp-avatar-wrap`). It **never** touches the inner `img`.
- **Exact transform string:** `'perspective(600px) rotateY(' + xDeg + 'deg) rotateX(' + yDeg + 'deg)'` (setTilt), and `'perspective(600px) rotateY(0deg) rotateX(0deg)'` (resetTilt).
- **When:** On every **mousemove** (no rAF throttling) and on **mouseleave** (resetTilt). So on click, if the cursor moves or leaves, tilt updates the wrapper in the same timeframe as spin updating the img.
- **Conflict:** Tilt and spin are on different elements (wrapper vs img). A possible but secondary issue: wrapper transform changes every mousemove can cause repaints; combined with img transform updates each rAF, the two could contribute to composite/repaint timing. The **primary** interference is not tilt overwriting the img (it doesn’t); it’s the **.dp-reveal transition on the img** (see §1).

---

## 3. Confetti layout impact

- **runConfetti(wrap):** Creates a `<canvas>`, sets `canvas.width`, `canvas.height`, `canvas.style.width`, `canvas.style.height` (to `canvasW`/`canvasH` = 3× wrapper size), then `wrapper.appendChild(canvas)`.
- **Canvas CSS** (dev-styles.css `.dp-avatar-wrap canvas`): `position: absolute`, `top: 50%`, `left: 50%`, `translate: -50% -50%`, `pointer-events: none`, `z-index: 10`. So the canvas is out of flow; it does **not** change the wrapper’s size or the img’s layout.
- **Layout shift:** Appending/removing an absolutely positioned child can trigger layout recalc and repaint of the wrapper, but the img’s position/size in the layout does not change. Unlikely to be the main cause of the spin jolt; possible minor contribution from repaint timing when canvas is added/removed mid-spin.

---

## 4. Browser compositing

- **will-change:** Set in code during spin: `fireSpin()` sets `img.style.willChange = 'transform'`; cleared in `spinLoop()` when spin stops (setTimeout 200ms). Tilt is on the wrapper only.
- **Implication:** The img is promoted to its own compositor layer while spinning, which reduces repaint cost. The main jolt fix was overriding the .dp-reveal transition (see Assessment).

---

## 5. Debug logging (investigation only)

- Temporary logging was added in `avatar-easter-egg.js` (spinLoop) and `magnetic-tilt.js` (setTilt/resetTilt) during the jolt investigation. **Removed after testing.** No debug code remains in the codebase.

---

## Assessment: most likely cause of the jolt

**CSS transition on the avatar img.** The img has class `.dp-reveal` and keeps the rule:

`transition: opacity var(--dp-duration-entrance) var(--dp-ease-out), transform var(--dp-duration-entrance) var(--dp-ease-out);`

(600ms on both opacity and transform.) So every time `spinLoop()` sets `img.style.transform = 'rotate(Ndeg)'`, the browser interpolates from the previous transform to the new one over **600ms**. The per-frame angle updates are then smoothed over a long window, so the visual rotation lags and “catches up” in a way that feels like a jolt or drag. Fix: remove or override the **transform** part of the transition on the img when driving spin (e.g. set `transition` on the img to something that excludes `transform`, or use a class that removes the transform transition during spin).
