# "At a glance" page accessible from homepage — TLDR overview for recruiters

**Type:** feature  
**Priority:** normal  
**Effort:** medium  

> **Homepage v3 note (2026-08-25).** The "Current state" below is stale: the homepage has
> had no project strips or project grid since 2026-08-24, and as of v3 it is hero, logo bar,
> testimonials and "Let's talk". That materially changes this issue: the homepage is now
> much closer to the at-a-glance summary described here (positioning, the 25,000-teacher and
> 30%-conversion proof, where he has worked, what colleagues say, one CTA), so the open
> question is arguably whether a *separate* page is still warranted, or whether this is
> already most of the way built. Edward has also flagged possibly bringing "How I make an
> impact" (`dev/old-index-2026-08-24.html`, a `.dp-hero-card`) onto the homepage, which
> would overlap this issue further.

---

## TL;DR

Add a dedicated "At a glance" (or similar) page that gives recruiters a quick TLDR overview — skills, key projects, contact — and link to it from the homepage so busy recruiters can get the gist without diving into case studies.

---

## Current state

- Homepage has hero, project strips, and project grid; no single-page summary for recruiters.
- Existing TLDR work (`add-case-study-tldr-component.md`) targets per-case-study bullet summaries, not a standalone recruiter overview.

---

## Expected outcome

- New page (e.g. `at-a-glance.html` or `overview.html`) with:
  - Short bio / one-liner
  - Key skills (toolbox-style)
  - Highlight projects with one-line descriptions
  - Contact / CTA (resume, email)
- Linked from homepage (nav or hero CTA) and/or resume page.
- Dense, scannable layout; designed for 30–60 second skim.
- WCAG AAA and mobile-friendly.

---

## Relevant files

- New page: `at-a-glance.html` (or chosen path).
- `index.html` — add link in nav or hero.
- `assets/js/dev-projects/nav-component.js` — add nav link if appropriate.
- `assets/css/dev-styles.css` — layout and component styles.
- `docs/new-page-checklist.md` — follow for GA4, nav, etc.

---

## Notes / risks

- Naming: "At a glance", "Overview", "Quick summary" — pick one and be consistent.
- Content duplication: keep in sync with homepage/resume; consider shared data or minimal manual sync.
