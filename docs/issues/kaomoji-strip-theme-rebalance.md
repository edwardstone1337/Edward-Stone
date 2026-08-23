# Kaomoji strip theme rebalance

**Status:** ✅ Resolved — see the Kaomoji entry in `CHANGELOG.md` (unreleased).  
**Type:** improvement  
**Priority:** normal  
**Effort:** small  

> **Outcome.** The strip now tracks kaomoji.click's redesigned warm-neutral
> palette via the existing `--dp-strip-kaomoji-*` tokens, the preview iframe was
> rebuilt against the product's own two-tier token system (running its light
> theme, so the panel reads as a product shot against the always-dark strip), and
> every text pairing clears WCAG AAA. The hardcoded `#141414` / `#5a5a5a` noted
> below are gone — the media frame inherits from tokens. Kept for the record.

---

## TL;DR

Rebalance the Kaomoji strip (`.dp-strip--kaomoji`) theme — colours, contrast, or visual weight — so it fits better with the rest of the design system and strips.

---

## Current state

- `.dp-strip--kaomoji` uses a dark monochrome theme: `#141414`, `#3a3a3a`, `#2a2a2a`, `#f0f0f0`, `#5a5a5a` (dev-styles.css L1448–1470).
- Strip is intentionally dark (product strip style); iframe preview also hardcoded dark.
- May feel too heavy, low-contrast, or visually inconsistent with other strips (Fair Share, SCP Reader).

---

## Expected outcome

- Refined Kaomoji strip styling: adjust colours, contrast, or visual hierarchy so it:
  - Aligns better with other strips
  - Meets WCAG AAA if text is present
  - Feels balanced within the page flow
- No breaking changes to iframe preview or postMessage theme sync unless needed.
- Document any new tokens or overrides.

---

## Relevant files

- `assets/css/dev-styles.css` — `.dp-strip--kaomoji`, `.dp-strip--kaomoji .dp-strip-media`, etc.
- `assets/css/dev-tokens.css` — if strip tokens are introduced/updated.
- `index.html` — strip markup (`#strip-kaomoji`).
- `assets/previews/kaomoji/index.html` — if preview styling needs to match.

---

## Notes / risks

- Strips are always dark by design (`color-scheme: dark`); rebalance within that constraint.
- Ensure preview iframe and strip still read as one cohesive unit.
