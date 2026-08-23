# Flip 7 Widget — Playable Mini-Game

**Status:** ✅ Resolved — see the Flip 7 entries in `CHANGELOG.md` (unreleased).

> **Outcome.** Built as `assets/previews/flip-7/index.html`, embedded in the Flip 7 homepage strip (`#strip-flip-7`, still `data-prod-hide`). Every expected outcome below is met: tapping draws one random card from a full 0–12 deck, a duplicate ends the round, seven unique cards wins, and one action resets. Two decisions differ from the sketch below and are deliberate:
>
> - **Placement is settled:** it lives in the homepage strip, in a cream phone beside the copy, not in `dev-projects` or the nav.
> - **The rules question is settled the way the notes asked for:** seven unique cards is the win, and it awards the real game's +15 Flip 7 bonus rather than being a pure survival high-score.
>
> The presentation went further than "widget": it recreates the real app's screen — a banked-score numeral over the 5×3 card grid — so it reads as the product rather than an abstract game. Accessibility asks in the notes are all covered: full keyboard play via real `<button>`s, `aria-live` on the score and status, focus-visible rings, and a `prefers-reduced-motion` path that drops the flips and the count-up.

---

## Original issue

**TL;DR** — A tappable widget that opens a real Flip 7–style game: each tap reveals one random card from a deck. Duplicate = game over and reset; no duplicate = continue. Goal is to reach 7 unique cards (or “see how far you can get”).

**Type:** feature  
**Priority:** normal  
**Effort:** medium

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
