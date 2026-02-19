# Hero-below section: toolbox/skills or testimonials

**Type:** feature  
**Priority:** normal  
**Effort:** medium  

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
