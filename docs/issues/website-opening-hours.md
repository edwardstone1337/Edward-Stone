# Website opening hours — “closed” outside configured times

**Type:** feature  
**Priority:** low  
**Effort:** medium  

---

## TL;DR

Site has configurable “opening hours” (e.g. 8am–8pm). Outside that window, visitors see a “closed” experience (overlay or dedicated state) instead of the full site. Optional: show “Opens at 8am” / “Back tomorrow” and treat it as a deliberate boundary, not an error.

---

## Current state

- Site is always fully accessible; no time-based gating or alternate state.
- No existing “closed” or maintenance view.

---

## Expected outcome

- Config: opening time, closing time, and timezone (e.g. `08:00`–`20:00`, `Europe/London`).
- On load (and optionally on interval or `visibilitychange`): if current time is outside the window → show “closed” state.
- Closed state: clear, friendly message; ideally show when the site “reopens” (e.g. “Opens at 8:00” or “Back at 8:00 tomorrow”).
- Optional: allow calendar exceptions (e.g. closed on certain dates) later.
- Behaviour is intentional and discoverable (e.g. small “We’re open/closed” indicator when open, or consistent copy when closed).

---

## How it could work (technical)

- **Config:** Single source of truth for `openAt`, `closeAt`, `timezone` (e.g. in a small JSON, data attribute, or inline script config).
- **Check:** On DOMContentLoaded (and optionally every N minutes or on tab focus): get current time in configured TZ, compare to range. If outside range → show closed UI; else show normal site.
- **Closed UI options:**  
  - **A.** Full-page overlay (e.g. a single “closed” section that covers content; nav/rest hidden or disabled).  
  - **B.** Dedicated route (e.g. `/closed` or `closed.html`) and redirect when outside hours.  
  - **C.** Same document: swap or hide main content and show a “closed” block (no redirect).
- **Edge cases:** Span midnight (e.g. 22:00–06:00); “closed all day” (same open/close or flag); first load (avoid flash of full site then closed — run check as early as possible, or hide body until decided).

---

## UX considerations

- **Not an error:** Copy and design should feel intentional and friendly (“We’re closed”, “See you at 8am”), not like a 403 or “access denied”.
- **Reopen time:** Show “Opens at 8:00” or “Back at 8:00 tomorrow” so visitors know when to return; reduces frustration.
- **Timezone:** Use the site’s “business” timezone (config) so “8am–8pm” is consistent; optionally show “8am–8pm UK time” on the closed view so international visitors understand.
- **Optional when open:** When within hours, a small “We’re open” or “Open until 8pm” can set the expectation that the site has hours (and make the closed state less surprising if they come back later).

---

## Philosophical / why do it

- **Boundaries:** Treats the site (or the person behind it) as having “hours” like a physical place — resists “always on” and infinite availability.
- **Personality:** Fits an indie / personal-site vibe: this is my space, it has opening times; memorable and distinctive.
- **Attention / ethics:** Can be framed as a small stand against the expectation of 24/7 engagement: we’re not always available for clicks; the site itself goes to sleep.
- **Whimsy:** Doesn’t have to be serious — “closed” can be playful and on-brand.

---

## Relevant files

- **New:** Small config (e.g. `assets/data/site-hours.json` or inline in `index.html`) for `openAt`, `closeAt`, `timezone`.
- **New:** Closed-state HTML/CSS/JS — either a component (e.g. `closed-banner.js` or overlay) or a static `closed.html` plus redirect logic.
- **`index.html`** (and any other entry points): Include the hours check early; optionally hide `<body>` until open/closed is decided to avoid flash.
- **`assets/js/utils.js`** (or new `assets/js/site-hours.js`): Time-in-range logic with timezone (e.g. `Intl` or date library); no heavy dependencies if possible.

---

## Risk / notes

- **Timezone:** Use `Intl` (e.g. resolved timezone) or a small, well-tested dependency; avoid hand-rolled UTC offsets.
- **SEO / crawlers:** If the whole site is replaced by “closed” during crawl times, consider whether you want crawlers to see content (e.g. only show closed state for real users, not for common bot user-agents) — optional and depends on goal.
- **First paint:** Run the check as early as possible (inline script or first JS) and optionally hide main content until decided to prevent “full site → closed” flash.
- **Span midnight:** Document behaviour (e.g. “open from 22:00 to 06:00” = open overnight); implement with a simple “in range” that handles wraparound.
