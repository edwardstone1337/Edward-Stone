# Avatar spin — implementation discovery

Discovery for the dev-projects hero avatar easter egg (click → spin + confetti). Use this when fixing or changing the spin behaviour.

## Where it lives

| What | File |
|------|------|
| Click handler, spin vs wiggle, confetti | `assets/js/dev-projects/avatar-easter-egg.js` |
| Spin/wiggle keyframes and classes | `assets/css/dev-styles.css` (avatar block ~254–283) |
| HTML | `dev-projects.html`: `.dp-magnetic-tilt.dp-avatar-wrap` wrapping `<img class="dp-hero-avatar ...">` |

Script load order in `dev-projects.html`: theme-toggle → utils → project-card → projects-grid → magnetic-tilt → **avatar-easter-egg** → effects → snake-game. No other script depends on the avatar egg.

## Current spin implementation

### Trigger and state

- **Target:** Click on `.dp-avatar-wrap` (the wrapper div). The script runs on DOMContentLoaded: `document.querySelector('.dp-avatar-wrap')`, gets the inner `img`, attaches one click listener on the wrapper.
- **Guard:** `wrap._dpAvatarEasterEggAttached` prevents attaching the listener twice. `prefers-reduced-motion: reduce` disables the egg entirely (no listener).
- **Cooldown:** 1500 ms (`COOLDOWN_MS`). First click after cooldown → full spin + confetti. Clicks during cooldown → wiggle only (no confetti).

### Spin (full animation)

1. **JS:** `fireSpin()` adds class `dp-avatar-spin` to the **img** (not the wrap), adds `animationend` listener to remove the class and listener when animation name is `dp-avatar-spin`.
2. **CSS:** `.dp-avatar-spin` runs:
   - **Keyframes:** `dp-avatar-spin` — 750 ms, ease-in-out, forwards.
   - **Effect:** 0°→360° rotation plus squash/stretch: 0% scale(1,1); 20% scale(0.9,1.1); 50% scale(1.1,0.9); 75% scale(0.95,1.05); 100% scale(1,1).
3. **Cleanup:** On `animationend` for `dp-avatar-spin`, class and listener are removed so the animation can run again next time.

### Wiggle (cooldown feedback)

- **JS:** `fireWiggle()` adds `dp-avatar-wiggle` to the img, `animationend` removes it (same pattern as spin).
- **CSS:** `dp-avatar-wiggle` keyframes: 0°/100% 0°, 25% -5°, 50% 5°, 75% -3°. 300 ms, ease-in-out, forwards.

### Confetti

- **When:** Only on full spin (not on wiggle). `runConfetti(wrap)` is called from `fireSpin()` after adding the spin class.
- **How:** Canvas created, sized to 3× wrapper size, appended to wrapper. 35 particles, random angle, velocity 2–6, gravity 0.12, friction 0.98, 60 frames lifetime. Colors from a fixed palette. Canvas removed when all particles dead.

### Interaction with magnetic tilt

- The same element has both `.dp-magnetic-tilt` and `.dp-avatar-wrap`. `magnetic-tilt.js` runs on `.dp-magnetic-tilt` and applies transform. The spin animation also sets `transform` on the **img** inside the wrap. So during spin, the keyframe transform on the img overrides; tilt is on the wrapper. No explicit coordination between the two scripts.

## Summary

- **Spin:** Class `dp-avatar-spin` on the inner img → CSS keyframes `dp-avatar-spin` (750 ms, rotate 360° + squash/stretch). Class/listener removed on `animationend`.
- **Wiggle:** Class `dp-avatar-wiggle` on the img → keyframes `dp-avatar-wiggle` (300 ms, small rotation wobble). Same cleanup pattern.
- To change spin behaviour: adjust keyframes and/or duration in `dev-styles.css`, or the class/add/remove logic in `avatar-easter-egg.js`.
