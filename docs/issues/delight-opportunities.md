# Delight opportunities — thoughtful, non-obnoxious play

**Type:** feature  
**Priority:** normal  
**Effort:** medium (per item; overall theme is ongoing)  

> **Homepage v2 note (2026-08-24).** `dev/home-v2.html`, since shipped as `index.html`, adds real work in the
> direction this issue asks for: cursor-chat quips reworked into brand blue (`05769a9`) and
> restored alongside the avatar click-to-spin easter egg (`c4c630c`, "restore cursor-chat and
> avatar spin, add hero CTAs, rework copy"), plus a new floating-testimonials layer with
> deliberate, `prefers-reduced-motion`-respecting animation (`0c45a90`, "floating teacher
> testimonials, headline reframed"; `13467d9`, "bubbles go dark serif, hug their text, and stop
> colliding"). This is partial, not full: it's copy/motion/one easter egg, not the
> konami-code-style "hunt" or new playable this issue also asks for. It also cuts the other way
> on the one playable the site already has — the same v2 change set gates `loadSnakeGame()`
> behind `!isProd` in `nav-component.js`, so snake no longer loads on production at all (still
> reachable off-prod / locally).

> **Homepage v3 note (2026-08-25).** The floating-testimonials layer cited above is no
> longer homepage delight: it moved to `case-studies/planner.html` with the Planner
> prototype and the snail, on the grounds that quotes about a feature you cannot see do not
> land. What remains on the homepage is the avatar and hero-wave cursor-chat, and five new
> logo-bar hover lines restored with the logo bar ("The Rocket Man himself", etc.). The
> layer also gained a real accessibility improvement worth copying elsewhere: it is
> `aria-hidden`, so its static equivalent is hidden with `.dp-visually-hidden` rather than
> `display: none`, keeping the content available to assistive tech at every width.

---

## TL;DR

Add deliberate moments of delight across the site: copy, micro-interactions, one-off animations, optional easter eggs (including something playable, e.g. snake). Goal: **delightful, not obnoxious** — enhance the visit without demanding attention or getting in the way.

---

## Current state

- Site is functional and on-brand; no systematic “delight” layer.
- No easter eggs, playable elements, or intentional one-off animations beyond basic UI behaviour.
- Copy and transitions are straightforward; no hidden play or discovery.

---

## Expected outcome (opportunity areas)

### Copy

- Small personality tweaks in headings, CTAs, or error/empty states.
- Optional hidden or hover-reveal lines (e.g. in footer, 404) that reward attention without blocking.

### Style & motion

- Subtle transitions (e.g. section in-view, card hover, nav) that feel smooth, not flashy.
- One-off animations on key actions (e.g. first scroll, first click) — use sparingly and preferably once per session.
- Optional GIFs or illustrated moments in specific sections; low motion, optional reduced-motion support.

### Easter eggs & discovery

- **Easter egg hunt:** One or more hidden interactions (e.g. konami code, click pattern, hidden link) that reveal a small reward (message, mini animation, or entry to playable).
- **Playable:** e.g. snake or a tiny game — reachable via easter egg or dedicated “play” entry (footer, 404, or corner). Should feel optional and fun, not central to the site.
- Design so discovery is optional; no prompts like “Find the easter egg!” unless that’s the chosen tone.

### Principles (UX / philosophy)

- **Not obnoxious:** No auto-playing sound, no modal “look at this”, no infinite motion in peripheral vision. Prefer user-initiated or one-time moments.
- **Respect preferences:** Honor `prefers-reduced-motion`; tone down or disable non-essential animation for those who need it.
- **Progressive:** Delight can be layered over time (copy first, then one transition, then an easter egg) so the site doesn’t depend on any single gimmick.
- **On-brand:** Easter eggs and playables should feel like “this person’s sense of humor” rather than generic meme drops.

---

## Relevant files

- **Copy:** `index.html`, section components, any 404 or error copy; `assets/data/` if copy is data-driven.
- **Style / motion:** `assets/css/style.css`, `assets/css/tokens.css`; component JS for scroll/hover triggers (e.g. `assets/js/components/navigation.js`, card components).
- **Easter eggs / playable:** New `assets/js/delight.js` or `assets/js/easter-eggs.js` for triggers (konami, click patterns); new small game bundle or inline (e.g. `assets/js/snake.js` or in a dedicated minimal page) if adding playable.
- **Reduced motion:** CSS `prefers-reduced-motion` in `style.css`; any JS that adds motion should check `window.matchMedia('(prefers-reduced-motion: reduce)')` before enabling heavy animation.

---

## Risk / notes

- **Scope creep:** “Delight” can expand forever. Prefer a short backlog of 3–5 concrete items (e.g. “one konami-code easter egg”, “snake in footer”, “hover transition on project cards”) and ship incrementally.
- **Performance:** Playable games and extra animations can add JS/CSS; keep snake (or similar) in a small, lazy-loaded script so the main bundle stays light.
- **Accessibility:** Easter eggs that rely on precise key/click sequences can be undiscoverable for keyboard/screen-reader users; consider a low-key, accessible way to reach the same reward (e.g. “Skip to fun” link) or accept that some eggs are sighted-mouse only and keep critical content independent.
- **First-time vs return:** One-off “wow” moments (e.g. first scroll animation) are fine; avoid repeating the same big animation every visit unless it’s very subtle.
