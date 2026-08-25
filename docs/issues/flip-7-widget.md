# Flip 7 Widget — Playable Mini-Game

**TL;DR** — A tappable widget that opens a real Flip 7–style game: each tap reveals one random card from a deck. Duplicate = game over and reset; no duplicate = continue. Goal is to reach 7 unique cards (or “see how far you can get”).

**Type:** feature  
**Priority:** normal  
**Effort:** medium

> **Homepage v2 note (2026-08-24).** One of this issue's candidate placements, "homepage", gets
> narrower. Per `docs/superpowers/specs/2026-08-24-homepage-v2-design.md`, `dev/home-v2.html`
> (since shipped as `index.html`) cuts `.dp-side-quests` (Fair Share / Bears / Flip
> 7 / Lost Cities) and the Fair Share / Flip 7 / SCP Reader strips entirely — there's no "Flip
> 7" mention anywhere on the flagship-led homepage for a future widget to hang off of. If v2
> graduates, this widget's entry point would need to live in `dev-projects`, its own page, or
> nav instead of the homepage.

> **Homepage v3 note (2026-08-25).** Closes the door the v2 note left ajar. v3 cuts the
> homepage back to hero, logo bar, testimonials and "Let's talk", so there is no section a
> widget could hang off. `personal.html` is the realistic home for this, matching the v2
> note's "dev-projects or nav instead of the homepage" steer.

---

## Current State

- No Flip 7 widget or mini-game exists.

## Expected Outcome

- **Entry:** User taps a widget (placement TBD — e.g. dev-projects, homepage, or nav).
- **Deck:** Full deck defined in code (standard 52 or a smaller set as needed).
- **Gameplay:** Each tap/click draws one random card and shows it.
  - If the card was **already drawn this round** → game over, show result, offer reset.
  - If the card is **new** → add to “seen” set and continue.
- **Win condition:** Reach 7 unique cards (or define “Flip 7” win as 7 unique); alternatively, “high score” = most unique cards before a duplicate.
- **Reset:** After game over, one action (e.g. “Play again”) clears state and starts a new round.

## Relevant Files

- New: widget entry point and game UI (e.g. modal or inline panel).
- New: game logic module — deck representation, shuffle/draw, duplicate check, round state.
- Possibly: `index.html` or main layout if widget lives there; any shared JS/CSS for modals or overlays.

## Notes / Risks

- Confirm exact Flip 7 rules (7 unique = win vs. “survival” high score) before locking UI copy.
- Deck size and draw animation (or instant reveal) affect feel — keep first version simple, enhance later.
- Consider accessibility: keyboard play, focus management, and screen-reader-friendly state (e.g. “Card 3 of 7”, “Duplicate — game over”).
