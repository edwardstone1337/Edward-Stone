# Strips: Differentiate SCP and Kaomoji visually

**Status:** ✅ Resolved — see the Kaomoji entry in `CHANGELOG.md` (unreleased).  
**TL;DR** — SCP and Kaomoji strips look too similar (both dark strips, light text, same component). Make one or both stand out so they feel distinct.

**Type:** improvement  
**Priority:** normal  
**Effort:** medium

> **Outcome.** Resolved as a side effect of the Kaomoji theme rebalance
> (`kaomoji-strip-theme-rebalance.md`), not a dedicated pass on this ticket.
> `.dp-strip--kaomoji` now opts into `color-scheme: light` with kaomoji.click's
> warm-neutral palette — the only light strip on the page — while SCP stays on
> the dark base. The two no longer read as interchangeable dark blocks; the
> "Options" below (stronger SCP identity, or push Kaomoji further from SCP)
> were superseded by Kaomoji going light rather than picking one. Kept for the
> record.

> **Homepage v2 addendum (2026-08-24).** Separate from the resolution above, which concerns
> today's `index.html`: `dev/home-v2.html`, since shipped as `index.html`, removes the SCP Reader strip from
> the homepage altogether, per `docs/superpowers/specs/2026-08-24-homepage-v2-design.md` ("Cut
> from v1" — Fair Share / Flip 7 / SCP Reader strips). Only the kaomoji strip survives, reused
> as-is via `initKaomojiStrip()` with no styling changes. If v2 graduates, this issue's
> "differentiate SCP from Kaomoji" question becomes moot outright: there would be nothing left
> on the homepage to differentiate it from.

---

## Current state

- **Kaomoji strip**: `.dp-strip--kaomoji`, `.dp-strip--flipped`. Dark bg `#141414`, grey orb tokens (orbs hidden via `::before/::after { display: none }`), monochrome, content + iframe media.
- **SCP strip**: `.dp-strip--compact`, `.dp-strip--scp`. Same dark base `#141414`, red orbs (`#791a1f`, `#431418`), logo in emoji slot, text-only (compact), lives in split-row with testimonial.
- Both use the same strip component, similar typography (white/off-white title and text), similar badge treatment, same CTA style. At a glance they read as two dark blocks.

## Expected outcome

- **Either** the SCP strip reads more distinctly (e.g. stronger SCP identity: colour, shape, or layout), **or** the Kaomoji strip is pushed further from SCP (e.g. different tone, accent, or treatment).
- Goal: clear visual separation so the two strips don’t blur together.

## Options (to decide)

- **SCP stands out:** Lean into SCP red/brand (stronger orb presence, accent border, or typographic treatment); keep Kaomoji as the “neutral” dark strip.
- **Kaomoji stands out:** Give Kaomoji a clearer identity (e.g. subtle accent colour, different background tone, or layout quirk); SCP stays red-orbs.
- **Both differentiated:** Adjust both (e.g. SCP = red strip, Kaomoji = cooler or warmer dark, or different structure) so each has a clear role.

## Relevant files

- `index.html` — Kaomoji strip (lines ~113–138), SCP strip (lines ~150–171); section order and wrappers.
- `assets/css/dev-styles.css` — `.dp-strip--kaomoji` (≈970–996), `.dp-strip--scp` (≈1032–1044), `.dp-strip-logo`, compact/flipped layout.
- `assets/css/dev-tokens.css` — `--dp-strip-scp-*` and any Kaomoji overrides; base strip tokens.
- `dev/design-system.html` — strip demos and SCP/Kaomoji token docs (keep in sync).

## Notes

- Related: [strips-less-text-focus-headlines.md](./strips-less-text-focus-headlines.md) — less body copy will change density; good time to refine visual distinction.
- Risk: Avoid making either strip clash with Fair Share (first strip) or resume section; keep contrast/readability.
