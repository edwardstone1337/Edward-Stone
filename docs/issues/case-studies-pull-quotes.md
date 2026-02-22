# Pull quotes as standout sections in case studies (news article style)

**Type:** feature  
**Priority:** normal  
**Effort:** medium  

---

## TL;DR

Add pull-quote components to case study pages — news-article style standout blocks that surface a key quote or insight as a visually distinct break in the prose, improving scanability and emphasis.

---

## Current state

- Case studies (Planner, Product Discovery, Fair Share, SCP Reader) use hero + long-form prose.
- No pull-quote or standout quote styling; key insights are buried in the body text.

---

## Expected outcome

- Pull-quote component(s) that can be dropped into case study content.
- News-article style: larger type, distinct typography (e.g. serif, italic, or accent styling), optional decorative quotes.
- Accessible: semantic markup (`<blockquote>`, `cite`, `aria-label`), WCAG AAA contrast and focus states preserved.
- Works in both light (case studies) and dev system themes as needed.

---

## Relevant files

- `case-studies/planner.html`, `case-studies/product-discovery.html` — add example pull-quote markup.
- `projects/fair-share.html`, `projects/scp-reader.html` — add where content supports it.
- `assets/css/case-study-theme.css` — or new `assets/css/case-study-pull-quote.css` — styling for pull-quote.
- `assets/css/dev-styles.css` — if pull-quote becomes a shared component (e.g. `.dp-pull-quote`).

---

## Notes / risks

- Content: each case study needs curated pull-quotes; avoid overuse.
- Mobile: ensure large type doesn’t break layout or cause overflow.
