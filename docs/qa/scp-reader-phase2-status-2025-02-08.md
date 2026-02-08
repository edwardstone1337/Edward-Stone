# SCP Reader Phase 2 — Status Report
**Date:** 2025-02-08

## 1. Glow Section

**Section updated:** "The Source Material" (The World) — `projects/scp-reader.html` line 79.

**Class added:** `dp-glow-section` and `data-reveal-delay="0"`.

**Colours applied** (in `assets/css/project-scp-reader.css`):
- **The Source Material** (3rd section, `nth-of-type(3)`): `rgba(121, 26, 31, 0.25)` — primary SCP red (#791a1f)
- **What's Next** (6th section, `nth-of-type(6)`): `rgba(67, 20, 24, 0.2)` — darker red (#431418)

Both use `filter: blur(100px)` on the `::before` pseudo-element. Structure follows Fair Share’s nth-of-type pattern.

---

## 2. Screenshot Pair

**Insert location:** Between "The Problem" (section 4) and "Product Decisions" (section 5).

**Markup used:**
```html
<div class="dp-screenshot-placeholder dp-screenshot--pair dp-reveal">
  <div class="dp-screenshot-placeholder-inner dp-screenshot--desktop">
    <span class="dp-screenshot-placeholder-label">Desktop screenshot</span>
  </div>
  <div class="dp-screenshot-placeholder-inner dp-screenshot--mobile">
    <span class="dp-screenshot-placeholder-label">Mobile screenshot</span>
  </div>
</div>
```

**Layout:** Added `.dp-screenshot--pair` layout in `project-scp-reader.css` (desktop 2:1 flex, mobile stacks, using `--dp-border-default: #303030` and existing device tokens).

---

## 3. h3 Spacing (Design System)

**File:** `assets/css/dev-styles.css`

**Rule:**
```css
.dp-page section p + h3 {
  margin-top: var(--dp-space-12);
}
```

**Rationale:** Extra top margin when an h3 follows a paragraph (e.g. Product Decisions h3 + p + h3 + p pattern).

**Verification:** Confirmed on SCP Reader (Product Decisions) and Fair Share (no section h3s; rule does not apply, no layout impact).

---

## 4. Accessibility

### Skip link
- **Status:** Pass  
- `.dp-skip-link` is first child of `<body>` and targets `#main`.
- Visible on focus via `top: var(--dp-space-4)` in `:focus` (dev-styles).
- Suggested test: Tab from address bar; skip link appears before nav.

### Focus rings
- **Status:** Pass  
- Added overrides in `project-scp-reader.css` for `.dp-nav-brand`, `.dp-theme-toggle`, `.dp-back-to-top`, `.dp-footer-link`: `outline: 2px solid #ffffff; outline-offset: 2px`.
- CTA and secondary buttons already use `--dp-btn-focus-ring-on-dark` (#e53935) and `--dp-btn-secondary-on-dark-focus-ring` (#ffffff).
- White (#fff) on #141414 > 14:1 contrast (WCAG AAA).

### prefers-reduced-motion
- **Status:** Pass  
- Updated `assets/css/dev-styles.css`:
  - `.dp-reveal` now uses `opacity: 1`, `transform: none`, `transition: none` under `prefers-reduced-motion: reduce`.
- Content is visible immediately without reveal animations.

### Colour contrast
- **Body text** `rgba(255, 255, 255, 0.85)` on #141414: ~12:1 — Pass (WCAG AAA 7:1).
- **Secondary** `--dp-text-secondary` (same as body): Pass.
- **Tertiary** `--dp-text-tertiary` `rgba(255, 255, 255, 0.64)` on #141414: ~7:1 — Pass.
- **Ghost** `--dp-text-ghost` `rgba(255, 255, 255, 0.2)` on #141414: ~2.2:1 — Below 4.5:1 for normal text. Use only for decorative/secondary UI (e.g. placeholders), not body text. No body copy uses ghost.

---

## 5. Homepage Strip Update

**File:** `index.html`

**Changes:**
- **Link:** Primary CTA now "Learn more" → `projects/scp-reader.html`. Secondary "Go to SCP Reader" → `https://www.scp-reader.co/` (external).
- **Title:** Updated from "SCP Reader" to "There are 9,800 monsters in an online archive. I built a way to track them all."
- **Description and badges:** Unchanged.

**Verification:** Strip uses `dp-strip--scp` tokens; renders in both light and dark themes. Primary button `.dp-btn-primary-on-dark`, secondary `.dp-btn-secondary-on-dark`.

---

## Files Changed

| File | Changes |
|------|---------|
| `projects/scp-reader.html` | Added `dp-glow-section` to The Source Material; inserted screenshot pair block |
| `assets/css/project-scp-reader.css` | Glow nth-of-type rules, screenshot pair layout, focus ring overrides |
| `assets/css/dev-styles.css` | `.dp-page section p + h3` spacing, `prefers-reduced-motion` reveal fix |
| `index.html` | SCP strip: title, primary/secondary links |

---

## Issues / Judgement Calls

1. **nth-of-type counting:** SCP sections ordered as: 1 Hero, 2 What It Does, 3 The Source Material, 4 The Problem, 5 Product Decisions, 6 What's Next. `nth-of-type` applied to these `<section>` elements; divs (screenshot placeholders) do not affect counts.

2. **Glow colours:** The Source Material uses #791a1f; What's Next uses #431418 for differentiation.

3. **prefers-reduced-motion:** Previous `.dp-reveal` used `opacity: 0` under reduced motion. Updated so content is visible immediately and no motion/transition is used.

4. **Focus overrides:** Overrides added for nav, theme toggle, back-to-top, and footer links. Buttons already had token-based focus styles; no changes needed.
