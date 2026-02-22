# Add og:image for social preview cards

**Type:** feature  
**Priority:** normal  
**Effort:** small  

---

## TL;DR

Add `og:image` (and related Open Graph meta tags) to public pages so link previews on social platforms (Twitter/X, LinkedIn, Slack, etc.) show a proper image and description instead of a blank or default card.

---

## Current state

- `index.html` has a comment: "Future: og:image for social preview card before launch".
- No `og:image`, `og:title`, `og:description`, or `twitter:card` meta tags on public pages.
- Shared links show fallback or no preview image.

---

## Expected outcome

- `og:image` on all public pages (or at minimum homepage, resume, key case studies).
- Image: 1200×630px recommended; one shared image or page-specific images.
- `og:title`, `og:description`, `og:url`; `twitter:card`, `twitter:image`, `twitter:title`, `twitter:description` where applicable.
- Images stored in `assets/images/` or similar; served from same domain or CDN.
- Document in `docs/analytics-tagging.md` or new `docs/social-meta.md`.

---

## Relevant files

- `index.html`, `resume.html`, `gallery.html`, `404.html`
- `projects/fair-share.html`, `projects/scp-reader.html`
- `case-studies/planner.html`, `case-studies/product-discovery.html`
- `assets/images/` — add og image(s).
- `docs/new-page-checklist.md` — add og:image to new-page steps.

---

## Notes / risks

- Image size: 1200×630 is standard; smaller may be cropped.
- Per-page vs shared: homepage can use a brand/hero image; case studies may use project-specific images for richer previews.
