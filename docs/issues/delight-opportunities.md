# Delight opportunities — thoughtful, non-obnoxious play

**Type:** feature  
**Priority:** normal  
**Effort:** medium (per item; overall theme is ongoing)  

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
