# Homepage v3: the prototype moves to the case study

**Date:** 2026-08-25
**Status:** SHIPPED 2026-08-25. Built as described; see `CHANGELOG.md` (unreleased) for the as-built record and the in-browser verification results.
**Supersedes parts of:** `docs/superpowers/specs/2026-08-24-homepage-v2-design.md`

> **As built, later the same day.** The page kept moving after this spec was
> approved. Three changes, none of which alter the reasoning above:
>
> - **The work ticker came back**, directly under the logo bar, its
>   pre-redesign position. This spec's homepage showed none of Edward's actual
>   design work once the prototype left, which turned out to be the shape's one
>   real weakness. The logos say where the work happened; the ticker shows what
>   it looked like. It restored `data-prod-hide` for its four doodle tiles, now
>   the repo's only use of that attribute.
> - **The hero headline became three deliberate lines** with "I lead design" in
>   brand blue, and **"Get in touch" was dropped**, leaving one CTA. The hero
>   asks for one thing; contact stays in the "Let's talk" panel and the footer.
> - **Vertical rhythm was evened out** to two tiers, 96px within the hero block
>   and 192px between sections, flattening to ~96px on small screens.
>
> Final section order: hero, logo bar, work ticker, testimonials, "Let's talk".
> `CHANGELOG.md` carries the full as-built record for each.

## Why

Homepage v2 (shipped 2026-08-24) leads with the live Planner prototype. It is
the strongest thing on the site, but it is also the whole page: roughly 4,200
lines of prototype above the fold, carrying a homepage whose job is to say who
Edward is and route people to the work.

v3 moves the prototype to the case study it belongs to, and lets the homepage
be a homepage. The prototype loses nothing by moving, and gains something: on
the case study it sits below the fold, so it lazy-mounts for free instead of
competing with first paint.

## Final shape

| Page | Sections |
|---|---|
| `index.html` | hero, logo bar, testimonials, Let's talk |
| `case-studies/planner.html` | hero, impact banner, TL;DR, **prototype + snail + floating quotes**, wall of love, prose sections |
| `personal.html` | unchanged (hero, kaomoji strip) |

Prod nav becomes **Case Studies ▾ · Personal · Resume**.

## 1. Homepage (`index.html`)

### Removed

Markup:
- `.dp-flagship__stage` wrapper, the `.dp-flagship__widget` mount, the
  `.dp-flagship__poster` image, and the visually-hidden `<h2>` that existed
  only to keep the widget's injected `<h3>` column headings legal in the
  outline.
- `#kaomoji-mount` and its `<noscript>` fallback strip. The kaomoji strip
  already lives on `personal.html`, which is where it stays.

Head:
- `<link rel="stylesheet" href="assets/css/project-planner.css">`

Scripts:
- Imports of `initSnail`, `initFloatingTestimonials` / `PLANNER_TEACHER_QUOTES`,
  and `initKaomojiStrip`.
- The `mountSnail()` function and its `MutationObserver` fallback.
- The `initFloatingTestimonials({...})` call.
- The dynamic `import('./assets/js/dev-projects/planner/planner.js')` block and
  its poster-removal callback.
- Cursor-chat triggers for `.dp-float-hotzone` and the kaomoji strip.

Page-local CSS:
- `.dp-flagship__stage`, `.dp-flagship__widget`,
  `.dp-flagship__widget[data-project="planner"] .pl-column`,
  `.dp-flagship__poster` (including its `@media (max-width: 768px)` override),
  the `.dp-flagship__stage, .dp-flagship__widget { text-align: initial }`
  belt-and-braces rule, and the whole floating-testimonials block.
- The `gap` declaration on `.dp-flagship`. With the stage gone the section has
  a single child and the gap is dead. **This supersedes commit `a79d762`**,
  which raised that gap from 32px to 48px to give the snail clearance. The
  problem it solved reappears on the case study, where the snail again crawls
  above the frame, so the fix migrates there rather than being lost.

### Kept

`.dp-flagship` stays as the section (it owns `padding-top`, `max-width` and
centring) with `.dp-flagship__intro` as its single child (`max-width: 46rem`,
`text-align: center`). Both keep their current class names and CSS. Folding
them into the shared `.dp-hero` component used by `personal.html` and the case
studies is a reasonable later tidy-up, but doing it here risks a visual
regression for no user-facing gain, so it is explicitly out of scope.

### Changed

Standfirst, which currently points at a prototype that is leaving:

> **Before:** This one is used by 25,000 teachers every week, and lifted
> free-to-paid conversion by 30%. Have a play with it.
>
> **After:** One is used by 25,000 teachers every week, and lifted free-to-paid
> conversion by 30%.

Both CTAs stay. "Read the case study" → `/case-studies/planner.html` is now the
only link to Edward's work in the page body; everything else routes through the
Case Studies nav dropdown. This is deliberate and confirmed.

### Added

The logo bar, restored from `dev/old-index-2026-08-24.html:194`. Its
`.dp-logo-bar` CSS survived the v2 redesign in `dev-styles.css`, so this is
markup-only: the `<section class="dp-logo-bar">` with its five company logos.

Its five cursor-chat hover lines come back with it:

| Item | Message |
|---|---|
| 1 | The Rocket Man himself |
| 2 | Where I'm making teachers' lives easier |
| 3 | Where I transitioned to UX |
| 4 | My time in agency |
| 5 | My former clothing brand |

Final cursor-chat trigger set for the homepage: avatar, hero wave, the five
logo items, testimonials section.

## 2. Planner case study (`case-studies/planner.html`)

### Placement

The prototype inserts between the TL;DR `</aside>` (line 61) and
`#wall-of-love` (line 63).

### Width

`.dp-prose-layout` is `display: contents`, so its children are direct children
of `.dp-page`. `.dp-tldr` and `.dp-prose-section` opt into the 760px
`--dp-prose-max-width` reading measure; a child that declares no `max-width`
simply fills `.dp-page`'s 1152px. The prototype therefore gets exactly the
width it has on the homepage today with no full-bleed hack, and no need for the
`100vw` + `margin-left: calc(50% - 50vw)` trick that
`.dp-testimonials-masonry--full` uses.

### Added

Head: `project-planner.css` and `cursor-chat.css`.

Markup: a visually-hidden `<h2>` labelling the prototype, then the
`.pl-compact` / `data-project="planner"` mount containing the
`planner.png` poster.

Scripts, mirroring `index.html`'s current wiring:
- Dynamic `planner.js` import with the poster swap on successful mount. Less
  critical here than on the homepage, since below the fold it lazy-mounts
  anyway, but it keeps the section from being an empty box and preserves the
  degradation story if the import fails.
- `initSnail(widget, { size: 32, speed: 110, pathTarget: frame })` with the
  same `MutationObserver` wait, because `.pl-frame` only exists once the
  Planner has mounted, and the snail rides the outside of a border that
  `.pl-frame` would clip.
- `initFloatingTestimonials({ stage: widget, quotes: PLANNER_TEACHER_QUOTES })`.
- `initCursorChat` with the `.dp-float-hotzone` trigger.

Page-local CSS carried over from `index.html`, renamed from `.dp-flagship__*`
to case-study-appropriate names: the `.pl-column` `flex: 1 1` grow override and
the poster styling.

### Snail clearance

The snail overhangs the frame's top edge by half its 32px body, so it needs
roughly 48px of clear space above the frame, the same problem commit `a79d762`
solved on the homepage. Spacing between the TL;DR and the prototype gets tuned
in-browser rather than specified blind.

## 3. Wall of love becomes the floating quotes' fallback

Edward's position: the floating quotes do the job of the wall of love, so the
wall should not show, but should not be deleted either.

Measurement made that a real decision rather than a preference. The floating
layer's gate is `gutter + OVERLAP >= MIN_BUBBLE_WIDTH`, i.e. `gutter >= 102px`.
Below a 1200px viewport `.dp-page` never reaches its 1152px cap, so the widget
is always `viewport - 48` and **the gutter is pinned at 24px regardless of
window size**. Above 1200 the widget caps and the gutter grows as
`(viewport - 1152) / 2`, reaching 102px at **viewport ≥ 1356px**.

Verified in-browser:

| Viewport | Widget | Gutter | Float layer | Prototype |
|---|---|---|---|---|
| 1024 | 976px | 24px | hidden, 0 bubbles | 4 columns at 223px, no scroll |
| 1360 | 1152px | 104px | visible, 3 bubbles | fine |

So a 1024px visitor sees the prototype perfectly well but gets no teacher voice
at all. Two ways of forcing the quotes on at 1024 were costed and rejected:
narrowing the prototype to manufacture a gutter would drop the widget to 820px
against the ~880px four columns need, so the board would scroll and show about
three columns; letting bubbles overlap the board needs 106px of overlap, putting
a 130px bubble over nearly half a 223px column of live UI.

**Resolution:** the two treatments become alternatives keyed to available room.

| Viewport | Floating quotes | Wall of love |
|---|---|---|
| ≥ 1356px | drifting beside the prototype | visually hidden |
| < 1356px | off | shown |

### Mechanism

`measure()` in `floating-testimonials.js` already computes `enabled` on every
resize, so it is the single source of truth. The 1356px figure is derived, and
must not be hard-coded as a media query anywhere: it falls out of the gutter
maths and would drift the moment `.dp-page`'s cap or the bubble constants
changed.

The module gains one optional config field:

```js
initFloatingTestimonials({
  stage:    widget,
  quotes:   PLANNER_TEACHER_QUOTES,
  fallback: document.querySelector('#wall-of-love'),  // new
});
```

When `fallback` is supplied, `measure()` toggles `.dp-visually-hidden` on that
element to the same value as `enabled`. The module stays generic: it knows it
has something to suppress while it is live, not that the something is a wall of
teacher quotes on a Planner case study. The case study owns that wiring, which
keeps the page knowledge on the page.

`fallback` is optional and absent everywhere else, so no existing caller
changes behaviour.

Both degradation paths fall the safe way, because the fallback is the default
and the float layer has to actively suppress it:
- **JavaScript off** — the module never runs, no class is set, the wall of love
  shows.
- **`prefers-reduced-motion`** — the module renders nothing, so floats are never
  enabled and the wall of love shows.

### Accessibility

The float layer carries `aria-hidden="true"`; it is decorative, and a screen
reader should not be read twenty-odd drifting quotes it did not ask for.

That makes `display: none` the wrong tool for the wall of love: at ≥1356px it
would leave a screen reader user with **no** teacher testimonials, because the
only remaining copy sits in an aria-hidden layer. On a WCAG AAA target that is a
regression.

The wall of love is therefore hidden with `.dp-visually-hidden`, not
`display: none`. Sighted wide-screen visitors get the ambient treatment;
assistive technology keeps the real, readable list at every width. Relative to
today, where the wall is plain visible content, nothing is lost.

Nothing in the repo links to `#wall-of-love` (verified), so hiding it breaks no
anchor. The existing `shuffle-testimonials.js` call is unaffected.

## 4. Nav (`assets/js/dev-projects/nav-component.js`)

Remove `prodHide: true` from the `Personal` entry. `NAV_LINKS` order already
produces **Case Studies ▾ · Personal · Resume** on prod once it is unhidden.

`personal.html` needs no changes: hero, kaomoji strip and cursor-chat are
already wired, and the page is already in `sitemap.xml`.

## Out of scope

- **"Read how I make an impact"** (`dev/old-index-2026-08-24.html:118`, a
  `.dp-hero-card` rather than a standalone section). Edward may bring a version
  of this to the homepage later. Not part of this change.
- Folding `.dp-flagship__intro` into the shared `.dp-hero` component.
- Any change to the other three case studies.

## Verification

Scripts (all three are CI-enforced):
```
./scripts/check-ga-coverage.sh
./scripts/update-sitemap.sh --check
./scripts/check-token-hygiene.sh
```

In-browser, homepage and Planner case study at 1440px, 1360px, 1024px, 768px
and 375px:
- Zero console errors.
- No page-level horizontal scroll at any width.
- Homepage: logo bar renders, all five cursor-chat hover lines fire, no orphaned
  references to the removed planner/snail/kaomoji modules.
- Case study: all four Planner terms visible with no board or frame overflow at
  ≥1024px; snail completes a lap and its click-to-retract toggles both ways.
- The 1356px swap: floating quotes and wall of love are never both visible and
  never both hidden. Check by resizing across the boundary in both directions,
  not just by loading at each width.
- Wall of love remains in the accessibility tree at 1440px (visually hidden, not
  removed).
- `prefers-reduced-motion`: no floating layer, no snail lap, wall of love shown.
- `?prod=1` on the homepage: nav shows Case Studies, Personal, Resume.

Performance note to confirm rather than assume: the homepage should get
materially lighter, since roughly 4,200 lines of prototype no longer load above
the fold, and the case study should absorb it without an LCP regression because
it mounts below the fold.
