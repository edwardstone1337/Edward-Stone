# Em dash replacement — status report

**Goal:** Remove all em dashes (—) from user-facing copy across HTML and `projects.json`. Replace with comma or period as appropriate. Do not touch code, attributes, class names, or comments.

---

## Summary

| Metric | Count |
|--------|-------|
| **Total em dashes found and replaced** | **70** |
| Files modified | 8 |
| Left unchanged (comments/code) | 6 occurrences in 4 files |

**Intentionally not changed (per rules):**
- `index.html` line 423: HTML comment
- `dev/design-system.html` line 563: code fallback `val \|\| '—'`
- `dev/design-system.html` line 824: HTML comment
- `projects/fair-share.html` lines 124, 145: HTML comments
- `projects/scp-reader.html` lines 67, 98: HTML comments

---

## Replacements by file

### index.html (21 replaced)

| Original line | Updated line |
|--------------|--------------|
| `<title>Edward Stone — Lead UX Designer</title>` | `<title>Edward Stone, Lead UX Designer</title>` |
| `<meta property="og:title" content="Edward Stone — Lead UX Designer">` | `...content="Edward Stone, Lead UX Designer">` |
| `aria-label="Edward Stone — Go to homepage"` | `aria-label="Edward Stone, Go to homepage"` |
| `...agencies — turning user research...` | `...agencies, turning user research...` |
| `aria-label="Fair Share — featured project"` | `aria-label="Fair Share, featured project"` |
| `...couples use — and therapists recommend` | `...couples use, and therapists recommend` |
| `...proportional split — making money...` | `...proportional split, making money...` |
| `aria-label="Kaomoji.click — featured project"` | `aria-label="Kaomoji.click, featured project"` |
| `One click to copy — designed to work...` | `One click to copy, designed to work...` |
| `aria-label="SCP Reader — featured project"` | `aria-label="SCP Reader, featured project"` |
| `Head of User Experience — <em>Inquisitive</em>` | `Head of User Experience, <em>Inquisitive</em>` |
| `...long-term retention — shown to increase...` | `...long-term retention, shown to increase...` |
| `...methodology — delivered 5+ features...` | `...methodology. Delivered 5+ features...` |
| `...business rules — reducing mid-sprint...` | `...business rules, reducing mid-sprint...` |
| `...Useberry) — uncovering 10+ critical...` | `...Useberry), uncovering 10+ critical...` |
| `Product Designer — <em>PlaySport</em>` | `Product Designer, <em>PlaySport</em>` |
| `Graphic Designer — <em>Rocket Entertainment...` | `Graphic Designer, <em>Rocket Entertainment...` |
| `Co-Owner & Designer — <em>Prang Out</em>` | `Co-Owner & Designer, <em>Prang Out</em>` |
| `Graphic Designer — <em>Insignia Worldwide</em>` | `Graphic Designer, <em>Insignia Worldwide</em>` |
| `Digital Designer — <em>john+john</em>` | `Digital Designer, <em>john+john</em>` |
| `Archivist — <em>The Office of Sir Elton John...` | `Archivist, <em>The Office of Sir Elton John...` |

### projects/fair-share.html (9 replaced)

| Original line | Updated line |
|--------------|--------------|
| `<title>Fair Share Calculator — Edward Stone</title>` | `<title>Fair Share Calculator, Edward Stone</title>` |
| `aria-label="Back to Edward Stone — Home"` | `aria-label="Back to Edward Stone, Home"` |
| `of couples use — and therapists recommend` | `of couples use, and therapists recommend` |
| `Fair Share Calculator — a tool for couples...` | `Fair Share Calculator: a tool for couples...` |
| `Such a great tool — I'll be sharing...` | `Such a great tool. I'll be sharing...` |
| `We found proportional splitting — each person pays... — and built` | `We found proportional splitting, each person pays..., and built` |
| `...vibe coded a simple calculator — ugly, hosted...` | `...vibe coded a simple calculator, ugly, hosted...` |
| `No ads, no marketing — just people searching...` | `No ads, no marketing, just people searching...` |
| `...what that looks like — stay tuned.` | `...what that looks like. Stay tuned.` |

### projects/scp-reader.html (11 replaced)

| Original line | Updated line |
|--------------|--------------|
| `<title>SCP Reader — Edward Stone</title>` | `<title>SCP Reader, Edward Stone</title>` |
| `aria-label="Back to Edward Stone — Home"` | `aria-label="Back to Edward Stone, Home"` |
| `...SCP Foundation — a purpose-built tool` | `...SCP Foundation, a purpose-built tool` |
| `...at a glance — by series, by range...` | `...at a glance: by series, by range...` |
| `...paranormal forum — a clinical report...` | `...paranormal forum, a clinical report...` |
| `...loves humanity — all documented...` | `...loves humanity, all documented...` |
| `But for completionists — people who want... — you're left` | `But for completionists, people who want..., you're left` |
| `...save progress — helpful, not blocking.` | `...save progress, helpful, not blocking.` |
| `A daily featured SCP — deterministically... — gives` | `A daily featured SCP, deterministically..., gives` |
| `Every action — marking as read, bookmarking — updates` | `Every action, marking as read, bookmarking, updates` |
| `...growing backlog — progress celebrations...` | `...growing backlog: progress celebrations...` |

### dev/design-system.html (19 replaced; 1 code + 1 comment left)

| Original line | Updated line |
|--------------|--------------|
| `<title>Dev-Projects Design System — Living Reference</title>` | `...Design System, Living Reference</title>` |
| `Living reference — all components render...` | `Living reference: all components render...` |
| `The quick brown fox — display` | `The quick brown fox. Display` |
| `The quick brown fox — body` | `The quick brown fox. Body` |
| `Primary text — main content` | `Primary text, main content` |
| `Secondary text — supporting copy` | `Secondary text, supporting copy` |
| `Tertiary text — de-emphasised` | `Tertiary text, de-emphasised` |
| `Ghost text — placeholder / faint` | `Ghost text, placeholder / faint` |
| `Reference value — used by .dp-noise overlay` | `Reference value, used by .dp-noise overlay` |
| `Noise overlay — subtle texture...` | `Noise overlay, subtle texture...` |
| `...colourful background — backdrop-filter blur...` | `...colourful background, backdrop-filter blur...` |
| `.dp-glow.is-visible — --dp-glow-color...` | `.dp-glow.is-visible, --dp-glow-color...` |
| `.dp-shimmer — sweep animation` | `.dp-shimmer, sweep animation` |
| `aria-label="Design system reference — product strip"` | `...reference, product strip"` |
| `5d. Product strip — Kaomoji variant` | `5d. Product strip, Kaomoji variant` |
| `.dp-strip--kaomoji — component-level...` | `.dp-strip--kaomoji, component-level...` |
| `aria-label="Kaomoji.click — side project"` | `aria-label="Kaomoji.click, side project"` |
| `On light-theme surface — for comparison with 5b` | `On light-theme surface, for comparison with 5b` |

### 404.html (2 replaced)

| Original line | Updated line |
|--------------|--------------|
| `<title>404 — Edward Stone</title>` | `<title>404, Edward Stone</title>` |
| `aria-label="Edward Stone — Go to homepage"` | `aria-label="Edward Stone, Go to homepage"` |

### case-studies/features-users-return.html (1 replaced)

| Original line | Updated line |
|--------------|--------------|
| `<title>How I design features people come back for — Edward Stone</title>` | `...come back for, Edward Stone</title>` |

### assets/previews/flip-7/index.html (4 replaced)

| Original line | Updated line |
|--------------|--------------|
| `<title>Flip 7 — Preview</title>` | `<title>Flip 7, Preview</title>` |
| `<div class="f7-card-face" ...>—</div>` | `...>.</div>` |
| `cardFace.textContent = '—';` (×2) | `cardFace.textContent = '.';` |

*Note: Card face placeholder changed from em dash to period so no user-facing em dash is shown when the card is face-down or reset.*

### assets/data/projects.json (3 replaced)

| Original (description string) | Updated |
|------------------------------|--------|
| `One click to copy — designed to work...` | `One click to copy, designed to work...` |
| `proportional split—making money conversations...` | `proportional split, making money conversations...` |
| `running totals — no pen and paper needed.` | `running totals, no pen and paper needed.` |

---

## Flagged for manual review (awkward or forced)

1. **projects/fair-share.html — “We found proportional splitting, each person pays a share of expenses based on their income, and built...”**  
   Comma splice: “splitting, each person pays” reads as run-on. Consider: “We found proportional splitting (each person pays a share of expenses based on their income) and built...” or splitting into two sentences.

2. **projects/scp-reader.html — “Every action, marking as read, bookmarking, updates the interface...”**  
   Reads like a list then “updates”; the original em dash set off the aside. Consider: “Every action—marking as read, bookmarking—updates...” if you ever allow em dashes again, or “Every action (marking as read, bookmarking) updates...” for parentheses.

3. **projects/scp-reader.html — “Sign-in is only prompted when they try to save progress, helpful, not blocking.”**  
   “Helpful, not blocking” is a bit dangling after a comma. Consider: “Sign-in is only prompted when they try to save progress; helpful, not blocking.” or “...when they try to save progress (helpful, not blocking).”

4. **projects/fair-share.html — “So I vibe coded a simple calculator, ugly, hosted on a default GitHub Pages URL, but it worked.”**  
   “ugly, hosted” as parenthetical is fine but the comma chain is long. Optional: “...calculator (ugly, hosted on a default GitHub Pages URL) but it worked.”

5. **assets/previews/flip-7/index.html — Card face placeholder “—” → “.”**  
   The card back/blank state now shows a period. If a different placeholder (e.g. “·” or “−”) is preferred for visual design, change in both the HTML and the two JS assignments.

---

## Files not in scope / no em dashes

- **dev-projects.html** — Not found in repo (only `dev/component-preview.html`, `dev/old-index.html` exist; neither had em dashes in the initial scan).
- **design-system.html** — Listed in scope; all copy replacements done; one code fallback and one comment left as-is.

---

*Report generated after completing all replacements.*
