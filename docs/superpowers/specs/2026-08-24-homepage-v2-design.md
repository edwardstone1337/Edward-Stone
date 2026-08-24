# Homepage v2 — flagship-led redesign

Date: 2026-08-24
Status: SHIPPED 2026-08-24. Built at `dev/home-v2.html`, then promoted to
`index.html`; the previous homepage is archived at
`dev/old-index-2026-08-24.html`, kept browsable because some of its cut
sections are expected back. See "As built" below, which supersedes the
original page structure where the two disagree.

## Goal

The site's job is to land Edward a senior/lead product design role. The current homepage
(699 lines, 12 sections) spreads attention across four case studies, four side projects,
a toolbox, a logo bar, an image ticker and four product strips. v2 replaces breadth with
one strong proof point.

## Decisions (approved by Edward, 2026-08-24)

| Question | Decision |
|---|---|
| Site's job | Land a senior/lead design role |
| Preservation | Build at a new path; current `index.html` stays live and untouched |
| Case study count | Two, one flagship |
| Flagship | Planner |
| Second slot | Product Discovery *(assumed — see Open questions)* |
| Fair Share | Demoted, not featured |
| Above-the-fold structure | Flagship-led: open on the Planner story + live prototype |
| Personality | Exactly one piece: the kaomoji strip, at the bottom of the page |
| New page location | `dev/home-v2.html` |

### Why `dev/`

Everything under `dev/` is non-public, so while v2 is a work in progress it needs no GA4
tag, no `sitemap.xml` entry, no canonical URL and no OG tags. `scripts/check-ga-coverage.sh`
and `scripts/update-sitemap.sh` both exclude `dev/`. `dev/old-index.html` is the existing
precedent for an archived homepage. When v2 is approved it graduates to `index.html` and
picks up that machinery once, deliberately, via `docs/new-page-checklist.md`.

### Why not edit `index.html` in place

Edward wants to compare old and new side by side. Git preserves the old homepage
regardless (`6d6a2b8`), but a git object cannot be clicked through. Two live pages can.

## Page structure

1. **Nav** — shared component, `<div id="nav-container">`
2. **Flagship (above the fold)**
   - Avatar (kept — a face builds trust with a hiring audience), name + "Lead Product Designer"
   - Headline: "I designed the feature 25,000 teachers rely on every week."
   - Subtitle: "It turned a simple save-for-later into the platform's most-loved tool,
     and lifted free-to-paid conversion by 30%."
   - Live Planner widget (`initPlanner(root, { chrome: false })`, `.pl-compact`)
   - Single CTA: "Read the case study" → `case-studies/planner.html`
3. **Second case study** — compact promo for Product Discovery, its own CTA. Copy reuses the
   existing hero-card line, "Changing how an organisation decides what to build" (no new copy
   written)
4. **Testimonials** — the existing three-up grid
5. **Let's talk** — the existing `.dp-contact-cta` pattern (Email + LinkedIn)
6. **Kaomoji strip** — `initKaomojiStrip('#kaomoji-mount')`, the shared module already used
   by `index.html` and `personal.html`
7. **Footer**

### Cut from v1

Image ticker, logo bar, `.dp-side-quests` (Fair Share / Bears / Flip 7 / Lost Cities),
`.dp-toolbox`, and the Fair Share / Flip 7 / SCP Reader strips. Roughly 400 of 699 lines.

Note that the ticker, logo bar and side quests are currently **live on production** — this
is a real reduction in what visitors see, not just a tidy-up of already-hidden content.

## The three consequences, and how each is resolved

### 1. A 4,200-line JS prototype above the fold

The Planner kit is 14 modules totalling ~4,225 lines. On v1 it sits far down the page and
lazy-mounts, costing nothing until scrolled to. Above the fold it competes with first paint,
on a portfolio where load speed is itself a craft signal.

**Resolution — poster-swap.** Render `assets/images/planner.png` as a visible poster in the
widget container on first paint. Dynamically import `planner.js`; on successful mount, swap
the poster out for the live board. The section is never an empty box, LCP resolves against a
static image rather than a JS-built DOM, and `<noscript>` keeps the poster permanently.

This differs from v1, where the poster lives *only* inside `<noscript>`. v1's arrangement is
correct for a below-the-fold widget and wrong for an above-the-fold one.

### 2. Hiding the Case Studies nav orphans two pages

With the dropdown `prodHide`-ed and only two case studies on the homepage, Design Systems
and Fair Share keep their URLs and sitemap entries but lose every route in.

**Resolution — accepted deliberately.** They are being retired from the sales path, not
deleted. They stay live so existing links keep working. If Edward still wants to hand out
those links, revisit before v2 goes to prod.

### 3. Stripping to one case study removes all personality

The snake, kaomoji, bears, cursor chat and easter eggs currently signal "someone you would
want to work with" — a lead hire is also a culture hire.

**Resolution — one piece, deliberately placed.** The kaomoji strip goes at the bottom, after
the contact CTA. Focus above, personality below. Everything else goes.

## Implementation constraints

**Additive CSS only.** `dev/home-v2.html` and `index.html` share `dev-styles.css`. While both
pages coexist, v2 must not modify any existing `.dp-*` class — new components get new class
names. Modifying a shared class would silently change the "preserved" v1 page, which is the
exact failure mode this whole approach exists to avoid.

Per `CLAUDE.md`: tokens carrying values live in `dev-tokens.css`; `dev-styles.css` may define
scoped tokens only if they reference existing tokens. No raw hex or `rgba()` as values. Any
new shared `.dp-*` component also needs a `dev/design-system.html` Organisms entry.

**Copy rule.** No em dashes in prod-visible copy (`CLAUDE.md` Rules). Comma, colon or full
stop instead.

**Accessibility.** WCAG AAA target as everywhere else: skip link, `prefers-reduced-motion`,
`focus-visible`, `noscript` fallback, and the poster-swap must not move focus.

## Nav and site-wide changes

These are separate from the v2 page and affect production immediately, so they ship as their
own change, not bundled with the page build:

- `prodHide: true` on Personal and Case Studies in `NAV_LINKS` (`nav-component.js`)
- Gate `loadSnakeGame()` (`nav-component.js:319`) behind `!isProd`. Note this is called from
  `initNav()`, so the snake currently loads on **every page**, not just the homepage
- Add `{ text: 'Contact', href: '/contact.html' }` — must sit **after** both dropdown entries,
  or the mobile drawer renders it under the wrong "More" heading
  (`docs/architecture-nav.md:50-56`)

**Ordering constraint.** The Contact nav entry must NOT ship before `contact.html` exists, or
production gets a nav link to a 404. Either build the page first, or land the nav entry with
`prodHide: true` and remove that flag when the page goes live. The first two bullets have no
such dependency and can ship immediately.

## Local prod-simulation switch (`assets/js/env.js`)

`is-prod` is set from `location.hostname`, so on localhost it is never set. Both v1 and v2
therefore render the full nav with the snake loaded, and the stripped-down experience cannot
be seen locally at all. Extend `env.js` so the class can be forced on for local preview
(`?prod=1`, optionally persisted to `localStorage`).

**Security constraint — one direction only.** The switch may only ever ADD `is-prod`, and only
when the hostname is NOT a production host. It must never remove `is-prod` on a real
production hostname. `data-prod-hide` is what keeps unfinished and deliberately-private work
off the public site; a flag that clears the class on `edwardstone.design` would let any
visitor reveal all of it with a query string. Forcing the class on can only ever hide more,
which is safe. Clearing it on prod is the failure mode to design out.

## Contact page

Edward's email is already public on the homepage (`index.html:428`, `:617`), so `mailto:`
adds no new exposure and no third-party form service is required.

`.dp-contact-cta` (`index.html:424-431`) already offers Email + LinkedIn. A separate
`/contact.html` only earns its place if it does something that block cannot: state which
roles are wanted, availability, and what a useful first message contains.

**Not yet specified.** Contact page content is deferred to its own design pass.

## As built (supersedes "Page structure" above)

Ten rounds of review with Edward moved this a long way from the spec. Where this
section and the original disagree, this section is what exists.

### Final page order

1. **Nav** — shared component
2. **Flagship** — avatar, name + role, headline, standfirst, two CTAs, then the live
   Planner prototype at full width with teacher quotes drifting up both gutters
3. **Testimonials** — colleague quotes, serif italic with quote marks
4. **Kaomoji strip** — the one piece of personality
5. **Let's talk** — a full blue panel with on-dark buttons
6. **Footer** — outside `<main>`, unlike `index.html`

Order is deliberate: prototype, then proof, then personality, then the ask.

### Changed from the spec

- **The second case study is gone.** Product Discovery was built as a promo block, then
  removed at Edward's request ("it kind of speaks for itself"). This is now a
  **one-case-study homepage** — the option weighed and rejected during design. Flagged
  because it drifted back by increments rather than by decision. Its WIP banner was
  still cleared, so `product-discovery.html` is ready if it returns.
- **Headline rewritten twice.** "I designed the feature 25,000 teachers rely on every
  week" → "I design the features people actually rely on" (read as snarky) → **"Hi, I'm
  Edward 👋 I lead design on products people rely on."** The greeting and wave came back
  because the standfirst is the line people skip, so the claim belongs in the headline;
  "lead" carries the seniority signal a lead-role application needs.
- **Two hero CTAs**, not one: "Read the case study" and "Get in touch", above the
  prototype.
- **A project bar** was added below the prototype to give the CTA a home, then removed
  for the same "speaks for itself" reason. A project card to the *right* of the
  prototype was tried first and reverted: it cost the board ~280px, forced the kanban
  columns down to 200px and truncated a card title.
- **Floating teacher testimonials** — not in the original spec at all. See below.
- **Cursor chat and the avatar easter egg** were dropped in the first build and restored
  later; both are v1 features that the rebuild silently lost.
- **`--dp-raw-brand-deep` (#004C99)** added to `dev-tokens.css`, used by the cursor chat
  and the "Let's talk" panel.

### Floating teacher testimonials

`assets/js/dev-projects/floating-testimonials.js`. Real quotes from the Planner case
study's wall of love drift up the gutters either side of the prototype, because a kanban
board on its own only reads as "a kanban board" — the quotes are what say why it
mattered. Dark serif italic bubbles with curly quote marks, hugging their text so a
short quote is a small pill.

Decorative by construction: `pointer-events: none`, `aria-hidden`, renders nothing under
`prefers-reduced-motion`, animates transform and opacity only, `textContent` never
`innerHTML`, and pauses while off screen.

Two things that are easy to get wrong and were:
- The layer is sized from `documentElement.clientWidth`, **not** `100vw`, which includes
  the scrollbar and causes horizontal scroll.
- Collision avoidance measures **real bounding boxes**, not `top` percentages. Bubbles
  hug their text, so a four-line quote is several times taller than "Love it!" and a
  percentage gap that clears one will not clear the other.

Because the bubbles are `pointer-events: none` and moving, they cannot be hover targets.
Two transparent `.dp-float-hotzone` elements fill the gutters instead, stopping exactly
at the board edge, so cursor-chat can say "Real feedback, from real teachers" without
intercepting any prototype interaction.

### Production bug found on the way

`.pl-frame` derived its height from its width via `aspect-ratio: 1440/1024` and only
dropped that below 600px, but `.pl-tabbar` wraps to two rows from roughly 960px down. In
that band the wrapped tabbar ate height the frame never budgeted for and `.pl-frame-body`
clipped its own content: **61px hidden at 768px on the live `index.html`**, 84px on v2.
Breakpoint raised to 960px. This fix affects production, not just v2.

### Still not done

- `contact.html` does not exist, so the Contact nav entry was never added.
- v2 has not graduated to `index.html`.
- All v2 CSS is still page-local and needs promoting into `dev-styles.css` (with a
  `dev/design-system.html` Organisms entry) when it does.
- The cursor-chat colour override is page-local too; promote it into `cursor-chat.css`
  at the same time rather than leaving the site two-toned.
- `.dp-btn-primary` is white on `--dp-raw-brand` at 5.57:1 sitewide, which passes AA but
  misses this repo's AAA target. Unresolved, and a brand decision rather than a bug fix.

## Out of scope

- Adding real imagery to the case studies. Flagged as the single highest-value work for a
  lead-role application — all four case studies currently contain **zero** `<img>` tags —
  but it is a separate project and should not be bundled into the homepage build.
- Finishing `product-discovery.html`, which flags itself "This page is a work in progress"
  (line 159, dev-only banner).
- Retiring or rewriting Design Systems and Fair Share.
- Graduating v2 to `index.html`.

## Resolved (Edward, 2026-08-24)

1. **Second case study: Product Discovery.** Confirmed. It carries real numbers (95% feedback
   captured, 300+ ideas, 2× onboarding) where Design Systems has only qualitative outcomes.
   Consequence: its self-flagged "work in progress" banner (`product-discovery.html:159`,
   dev-only) should be removed as part of promoting it, or it stays an unresolved marker on a
   page now doing real work.
2. **Design Systems and Fair Share are retired.** They keep their URLs and sitemap entries so
   existing links keep working, but get no route in from nav or homepage. No further work on
   either page.
