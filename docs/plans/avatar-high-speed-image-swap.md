# Feature Implementation Plan

**Overall Progress:** `50%`

## TLDR

When the dev-projects profile spinner reaches a high angular velocity, swap the avatar image to `profile-spun.jpg` once and leave it that way (no revert when spin stops).

## Critical Decisions

- **High-speed = velocity threshold in spinLoop:** Use a constant (e.g. `HIGH_SPEED_THRESHOLD`) and swap the first time `angularVelocity >=` that value during a spin. Keeps logic in one place and avoids extra timers.
- **One-way swap only:** No logic to revert to `profile.png` when velocity drops or on next page load; the spun image stays for the rest of the session.
- **Image path:** Use a single constant path `assets/images/profile-spun.jpg` in the script, matching the existing avatar path convention in `index.html` (script is used on the homepage).

## Tasks

- [x] 🟩 **Step 1: Add high-speed image swap in avatar-easter-egg.js**
  - [x] 🟩 Define `HIGH_SPEED_THRESHOLD` (e.g. 35–40 deg/frame) and `SPUN_IMAGE_PATH = 'assets/images/profile-spun.jpg'`.
  - [x] 🟩 Add a module-level flag (e.g. `spunImageShown`) to ensure we swap at most once per session.
  - [x] 🟩 In `spinLoop()`, after updating velocity/transform, if `!spunImageShown && angularVelocity >= HIGH_SPEED_THRESHOLD`, set `img.src` to `SPUN_IMAGE_PATH` and set `spunImageShown = true`.

- [ ] 🟥 **Step 2: Verify behaviour**
  - [ ] 🟥 Confirm that reaching high speed swaps to `profile-spun.jpg` and that the image does not change back when the spin slows or stops.
