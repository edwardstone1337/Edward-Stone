# Add AI or AI-related case studies to the portfolio

**Type:** feature  
**Priority:** normal  
**Effort:** medium  

---

## TL;DR

Add one or more case studies that showcase AI-related UX or product work so the portfolio reflects experience in AI product design.

---

## Current state

- Case studies cover Design Systems, Planner (retention), and Product Discovery (customer voice at Inquisitive). None explicitly highlight AI or AI-adjacent work.
- Visitors have no clear signal that the portfolio includes AI/ML product or UX experience.

---

## Expected outcome

- At least one case study (new page or substantial addition) that demonstrates AI-related work — e.g. AI features, ML-driven UX, discovery/ideation for AI products, or similar.
- Case study linked from the homepage strips and/or case studies index so it’s discoverable.
- Same quality bar as existing case studies: process, problem-solving, and outcomes.

---

## Relevant files

- `case-studies/` — new `*.html` (e.g. `ai-*.html`) following existing case study structure.
- `assets/css/case-study-theme.css` — shared case study styling (reuse; extend only if needed).
- `index.html` — add strip/link to new case study if it gets a homepage strip.
- `case-studies/README.md` — document the new case study and any assets.
- `docs/new-page-checklist.md` — use when adding the new page (GA, nav, etc.).

---

## Notes / risks

- Scope “AI-related” as needed (e.g. GenAI UX, ML pipelines, AI discovery, conversational UI) so the case study stays focused.
- No new dependencies or build changes; follow existing static HTML/CSS/JS and dev design system.
