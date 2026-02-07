# Dev Projects: Multiple theme switcher (Linear / Windows 95 / Geocities)

**Type:** feature  
**Priority:** normal  
**Effort:** medium  

---

## TL;DR

Add a theme switcher to `dev-projects.html` so the page can toggle between a “Linear”-style default, Windows 95, and Geocities looks. Theming is done by overriding design tokens on a scoped container; no component rewrites.

---

## Current state

- Single look: tokens in `tokens.css` define one visual style.
- No theme switch; page always uses default (current cool-toned) theme.

---

## Expected outcome

- User can choose a theme (e.g. Linear, Windows 95, Geocities) via buttons or a small control in the hero or a fixed corner.
- Only the main content (hero + side-quests) changes; nav can stay default or optionally be included (product decision).
- Theme choice persists on refresh (e.g. `localStorage`).
- Each theme overrides the same token names (colors, fonts, radius, borders, shadows) so existing components don’t need structural changes.

---

## Relevant files

- **`dev-projects.html`** — Add theme root (e.g. `data-theme="linear"` on `main.dev-projects-page`), theme switcher UI, and script to set attribute + optional persistence. Load themes CSS.
- **`assets/css/themes.css`** (new) — Token overrides per theme: `main.dev-projects-page[data-theme="win95"] { ... }`, same for `geocities` and optionally `linear`. Plus any theme-only rules (e.g. Win95 3D borders, Geocities tiled background).
- **`assets/css/tokens.css`** — No change; themes only override where used (under the theme scope).

---

## Implementation notes

- **Scope:** Prefer `main.dev-projects-page` as theme root so nav stays default; use `body` only if nav should theme too.
- **Fonts:** Win95/Geocities need webfonts (e.g. MS Sans Serif–style, Comic Sans–style); add `<link>`s on dev-projects or in theme CSS and set `--font-body` / `--font-heading` in each theme block.
- **Win95:** Besides tokens, add rules for chunky 3D inset/outset borders on cards/buttons.
- **Geocities:** Optional tiled background, animated or “under construction” flair via extra rules in the Geocities block.

---

## Risk / notes

- Loading a new font on theme switch can cause a brief reflow; loading all theme fonts up front avoids this.
- Keep theme CSS to token overrides + minimal extra rules so future token changes don’t require editing multiple places.
