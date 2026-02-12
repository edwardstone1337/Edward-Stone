# Strip branding spec

Documentation for the product-strip branding system. Future strips can be branded via tokens only — no new CSS rules beyond a mapping block.

---

## 1. Full token contract

Every base `--dp-strip-*` token, what it controls, and its default value (Fair Share / default strip).

| Token | Controls | Default value |
|-------|----------|---------------|
| `--dp-strip-padding` | Inner padding of the strip container | `var(--dp-space-16) var(--dp-space-8)` |
| `--dp-strip-gap` | Gap between content, media, and actions in the strip grid | `var(--dp-space-8)` |
| `--dp-strip-bg` | Strip background colour | `#0a2020` |
| `--dp-strip-orb-1` | Colour of the second (bottom-right) decorative orb | `#2e7d76` |
| `--dp-strip-orb-2` | Colour of the first (top-left) decorative orb | `#E8919B` |
| `--dp-strip-orb-dark` | Colour of the dark overlay orbs (blurred circles) | `rgba(0, 0, 0, 0.22)` |
| `--dp-strip-orb-opacity` | Opacity of the coloured orbs (::before, ::after) | `0.4` |
| `--dp-strip-title-color` | Fallback/solid title colour (used when no gradient) | `#eafcf8` |
| `--dp-strip-text-color` | Description and overline text colour | `rgba(234, 252, 248, 0.85)` |
| `--dp-strip-badge-bg` | Badge pill background | `rgba(255, 255, 255, 0.15)` |
| `--dp-strip-badge-text` | Badge text colour | `rgba(234, 252, 248, 0.95)` |
| `--dp-strip-title-from` | Start colour of title gradient (top) | `var(--dp-strip-title-color)` |
| `--dp-strip-title-to` | End colour of title gradient (bottom) | `var(--dp-strip-title-color)` |
| `--dp-strip-border` | Strip container border | `1px solid transparent` |
| `--dp-device-border` | Border of the device/media frame (image or skeleton) | `1px solid rgba(255, 255, 255, 0.1)` |
| `--dp-device-shadow` | Box shadow of the device frame | `0 4px 24px rgba(0, 0, 0, 0.25)` |

**Note:** `--dp-device-radius` is a shared layout token (not strip-specific); strip media uses it for the device frame corner radius. Strip themes override `--dp-device-border` and `--dp-device-shadow` via the modifier mapping when needed.

---

## 2. How to brand a strip

Step-by-step: add a new strip theme using only tokens and one modifier block.

### Step 1 — Define named tokens in `dev-tokens.css`

Create `--dp-strip-[name]-*` tokens for your strip in the `:root` block of `dev-tokens.css` (the site is dark-only — there is no light theme block).

Define at least the required tokens (see Token checklist below). Add optional tokens (e.g. `title-from`, `title-to`, `border`, `device-border`, `device-shadow`) when the strip needs them.

Example (excerpt for a strip named `myapp`):

```css
/* In :root */
--dp-strip-myapp-bg: #0f1419;
--dp-strip-myapp-orb-1: #1d9bf0;
--dp-strip-myapp-orb-2: #8b5cf6;
--dp-strip-myapp-orb-dark: rgba(0, 0, 0, 0.2);
--dp-strip-myapp-orb-opacity: 0.28;
--dp-strip-myapp-title-color: #ffffff;
--dp-strip-myapp-text-color: rgba(255, 255, 255, 0.88);
--dp-strip-myapp-badge-bg: rgba(255, 255, 255, 0.12);
--dp-strip-myapp-badge-text: rgba(255, 255, 255, 0.95);
/* Optional, if needed: */
--dp-strip-myapp-title-from: var(--dp-strip-myapp-title-color);
--dp-strip-myapp-title-to: #e0e7ff;
--dp-strip-myapp-border: 1px solid rgba(255, 255, 255, 0.08);
--dp-strip-myapp-device-border: 1px solid rgba(255, 255, 255, 0.12);
--dp-strip-myapp-device-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
```

### Step 2 — Map tokens in `dev-styles.css`

Add a single modifier block for `.dp-strip--[name]` that maps the base strip tokens to your named tokens. **No other CSS rules are required** unless the strip has special layout (e.g. no orbs, different aspect ratio — those are exceptions).

Example:

```css
.dp-strip--myapp {
  --dp-strip-bg: var(--dp-strip-myapp-bg);
  --dp-strip-orb-1: var(--dp-strip-myapp-orb-1);
  --dp-strip-orb-2: var(--dp-strip-myapp-orb-2);
  --dp-strip-orb-dark: var(--dp-strip-myapp-orb-dark);
  --dp-strip-orb-opacity: var(--dp-strip-myapp-orb-opacity);
  --dp-strip-title-color: var(--dp-strip-myapp-title-color);
  --dp-strip-text-color: var(--dp-strip-myapp-text-color);
  --dp-strip-badge-bg: var(--dp-strip-myapp-badge-bg);
  --dp-strip-badge-text: var(--dp-strip-myapp-badge-text);
  /* Optional: only if you defined them in tokens */
  --dp-strip-title-from: var(--dp-strip-myapp-title-from);
  --dp-strip-title-to: var(--dp-strip-myapp-title-to);
  --dp-strip-border: var(--dp-strip-myapp-border);
  --dp-device-border: var(--dp-strip-myapp-device-border);
  --dp-device-shadow: var(--dp-strip-myapp-device-shadow);
}
```

### Step 3 — Use the modifier on the strip element

In HTML (or in the strip renderer config if modifiers are supported), add the class `dp-strip--[name]` to the strip section, e.g.:

```html
<section class="dp-strip dp-strip--myapp" aria-label="My App, featured project">
  ...
</section>
```

---

## 3. Token checklist per strip

Use this list when adding a new strip theme.

### Required (set for every branded strip)

| Token | Purpose |
|-------|---------|
| `--dp-strip-[name]-bg` | Background |
| `--dp-strip-[name]-orb-1` | Second orb colour |
| `--dp-strip-[name]-orb-2` | First orb colour |
| `--dp-strip-[name]-orb-dark` | Dark overlay orbs |
| `--dp-strip-[name]-orb-opacity` | Orb visibility (see design guidelines) |
| `--dp-strip-[name]-title-color` | Title colour (and fallback for gradient) |
| `--dp-strip-[name]-text-color` | Body/overline text |
| `--dp-strip-[name]-badge-bg` | Badge background |
| `--dp-strip-[name]-badge-text` | Badge text |

### Optional (set when the strip needs them)

| Token | Purpose |
|-------|---------|
| `--dp-strip-[name]-title-from` | Gradient title start (default: same as title-color) |
| `--dp-strip-[name]-title-to` | Gradient title end (default: same as title-color) |
| `--dp-strip-[name]-border` | Strip container border (default: transparent) |
| `--dp-strip-[name]-device-border` | Device/media frame border |
| `--dp-strip-[name]-device-shadow` | Device/media frame shadow |

If an optional token is omitted, the base strip token (or its default) is used.

---

## 4. Design guidelines

- **Color is earned.** Use a distinct colour family per strip so each project has a clear identity; avoid reusing the default teal/pink everywhere.
- **Orb opacity:** Keep `--dp-strip-[name]-orb-opacity` in the range **0.15–0.4**. Too high competes with content; too low makes the strip feel flat.
- **Border opacity:** If you set a visible strip or device border, keep opacity in the **0.06–0.15** range so borders stay subtle (“whispers, not lines”).
- **Gradient text:** If using `title-from` and `title-to`, the gradient should fade no more than ~**30% luminance** between endpoints so both ends meet WCAG AAA (see below) and remain readable.

---

## 5. WCAG AAA requirements

- **All text-on-background** (title, description, overline, badge text on badge background) must meet **7:1** contrast ratio against their backgrounds.
- **Gradient title:** Check contrast at **both** gradient endpoints (title-from on strip bg, title-to on strip bg). Both must meet 7:1.
- The site is dark-only — validate against the single dark theme.

---

## 6. Current strip inventory

| Strip | Modifier class | Colour family | Optional tokens used |
|-------|----------------|---------------|------------------------|
| Fair Share (default) | *(none)* | Teal / pink | — |
| SCP Reader | `.dp-strip--scp` | Dark red / maroon | `device-border`, `device-shadow` |
| Flip 7 | `.dp-strip--flip7` | Navy / teal + amber | `title-from`, `title-to`, `border`, `device-border`, `device-shadow` |
| Kaomoji | `.dp-strip--kaomoji` | Monochrome (grey) | *(values set in dev-styles.css block only; no named tokens in dev-tokens)* |

**Note:** Kaomoji is an exception: its colours are defined inline in the `.dp-strip--kaomoji` block in `dev-styles.css` and it hides orbs via extra CSS. A future pass could move Kaomoji to named tokens in `dev-tokens.css` for consistency.

---

## 7. Future: cross-page reuse

Strips currently live on the main dev projects page (`index.html`). To reuse the same strip styling on **case study pages**, the strip CSS (tokens + layout + modifier mappings) must be **extracted** or otherwise made available to those pages so that adding a class like `dp-strip dp-strip--scp` works there too. That extraction is a prerequisite before strips can appear on case study pages. See the product-strips backlog and case-study positioning in `docs/issues/dev-projects-product-strips.md`.
