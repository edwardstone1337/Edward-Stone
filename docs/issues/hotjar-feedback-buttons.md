# Add Hotjar or feedback buttons to portfolio site

**Type:** feature  
**Priority:** low  
**Effort:** medium  

---

## TL;DR

Add Hotjar (or similar feedback/analytics tool) or standalone feedback buttons so visitors can give quick feedback or report issues. Improves signal on UX friction and helps prioritise improvements.

---

## Current state

- Site uses GA4 for analytics; no session replay, heatmaps, or explicit feedback mechanism.
- No way for visitors to report bugs, suggest improvements, or leave quick comments.

---

## Expected outcome

- **Option A — Hotjar (or similar):** Integrate Hotjar (or comparable tool) for:
  - Feedback widget (e.g. thumbs up/down, short comments)
  - Optional: heatmaps, session replays (review privacy/GDPR implications).
- **Option B — Lightweight feedback only:** Add a simple feedback button (e.g. "Got feedback?" or "Report an issue") that opens mailto or a Typeform/survey link.
- Accessible: button/link has clear label, focus visible, doesn’t interfere with WCAG AAA.
- Respect `prefers-reduced-motion` and avoid intrusive overlays.

---

## Relevant files

- All public pages — if global feedback widget: add script/link in shared layout or each page.
- `docs/analytics-tagging.md` — document alongside GA4 if adding Hotjar.
- Consider `docs/code-review.md` — XSS/privacy for any third-party scripts.

---

## Notes / risks

- **Privacy:** Hotjar and similar tools may require cookie consent / privacy policy updates.
- **Performance:** Lazy-load or defer feedback scripts; avoid blocking render.
- **Scope:** Decide if feedback is site-wide or limited to certain pages (e.g. case studies, resume).
