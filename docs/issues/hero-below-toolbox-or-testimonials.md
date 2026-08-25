# Hero-below section: toolbox/skills or testimonials

**Type:** feature  
**Priority:** normal  
**Effort:** medium  

> **Homepage v2 note (2026-08-24).** Already resolved independent of v2: `index.html` ships
> both options today — a `dp-toolbox` section (`data-prod-hide`d) and a
> `dp-testimonials-section` (both pre-date this branch). `dev/home-v2.html`, since shipped as `index.html`,
> doesn't reopen the choice, but settles it more decisively: testimonials are promoted to
> directly below the flagship hero and get their own design pass (serif italic quote voice,
> aligned to the page's full measure) — see `0c45a90` (floating teacher testimonials, headline
> reframed to "I lead design"), `c1d7592` (align testimonials to the page measure) and
> `847970d` (testimonials match the quote voice; Let's talk becomes a blue panel). The toolbox
> is not carried into v2 at all, so if v2 graduates, "toolbox" goes from a hidden-on-prod
> section to a fully removed one.

> **Homepage v3 note (2026-08-25).** The testimonials answer above survives, with one
> change: they are no longer *directly* below the hero. `index.html` is now hero, logo
> bar, testimonials, "Let's talk", so the logo bar sits between the hero and them. The
> testimonials keep their v2 design pass (serif italic quote voice, full page measure) and
> are now the page's only quoted voice, since the floating teacher quotes left with the
> Planner prototype. Option A (toolbox) is settled as **not happening**: it was absent from
> v2 and is absent from v3, so the class is fully removed rather than hidden on prod. See
> `docs/superpowers/specs/2026-08-25-homepage-v3-design.md`.

---

## TL;DR

Add a section directly under the hero that gives at-a-glance flavour: either **testimonials** (what people say about working with you) or a **toolbox/skills** block. The toolbox would mix professional tools (Figma, Useberry, Confluence, Jira Product Discovery) with personal interests (e.g. Casio Keyboard, soft skills, Bambu A1 3D printer), with a clear split between professional and personal so visitors get a quick, cutesey impression of who you are.

---

## Current state

- Hero (`dp-hero`) ends with the intro line and body copy; next thing is the projects `dp-split-row` (first strip + testimonial).
- No dedicated “toolbox” or skills strip; no consolidated testimonials block.
- One testimonial (Bella Jagger) exists inline next to the Fair Share strip, but there’s no section that could host multiple testimonials or a toolbox.

---

## Expected outcome

- **Option A — Toolbox/skills:** A new section under the hero listing tools/skills in two groups:
  - **Professional:** e.g. Figma, Useberry, Confluence, Jira Product Discovery (and any others).
  - **Personal / flavour:** e.g. Casio Keyboard, soft skills, Bambu A1 3D printer — things that add personality without cluttering the “hire me” message.
- **Option B — Testimonials:** A section that surfaces what people have said about working with you (could reuse/expand the existing `dp-testimonial` pattern).
- **Design:** Section should feel light and scannable (at-a-glance), not a long list. Tone can be a bit cutesey; distinct labels (e.g. “Professional toolbox” vs “Also into”) so the mix is clear.

---

## Relevant files

- `index.html` — hero and next-sibling section (insert new block between `</section>` of `dp-hero` and `<div class="dp-split-row" id="projects">`, or integrate into that row).
- `assets/css/dev-styles.css` — section layout and any new component classes (e.g. toolbox strip, testimonial block).
- `assets/css/dev-tokens.css` — only if new tokens (e.g. strip/section spacing) are needed.

---

## Notes / risks

- Deciding **toolbox vs testimonials** (or doing both in one section) is a product/design choice; this issue captures the opportunity, not the final pick.
- If both professional and personal items live in one section, keep the distinction obvious for accessibility and scanability (headings or visible groups).
- Existing `dp-testimonial` and strip patterns can be reused; avoid introducing a one-off layout that doesn’t align with `dp-strip` / design system.
