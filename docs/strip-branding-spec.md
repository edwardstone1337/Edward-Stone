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

Create `--dp-strip-[name]-*` tokens for your strip in the `:root` block of `dev-tokens.css`. Strips default to dark via `color-scheme: dark` regardless of page theme, so they need no `[data-theme="light"]` variants — note the *pages* are light, the strips are not.

**A light strip is possible but is an opt-out, not a variant.** Two strips take it — `.dp-strip--kaomoji` and `.dp-strip--flip7` — each setting `color-scheme: light` in its modifier block and giving every token it maps a light value. If you take that route, budget for all of it — background, title, text, badge, strip border (a light strip on the white page needs a real border to read as a section), device border and shadow, and the button. The last one is the trap: `.dp-btn-primary-on-dark` is white-on-dark and disappears on a light strip. Retheme `.dp-btn-primary` in place by overriding `--dp-btn-bg-primary` / `--dp-btn-text-primary` / `--dp-btn-hover-bg-primary` inside the modifier, rather than adding a strip-only button class. Both light strips are worked examples of exactly this: Kaomoji retheme's to its near-black accent, Flip 7 to a cream fill with navy text.

Define at least the required tokens (see Token checklist below). Add optional tokens when the strip needs them — `title-from`, `title-to`, `border`, `device-border`, `device-shadow` are the common set, and a strip may add its own beyond those (Kaomoji has `padding`, `panel-bg`, `accent`; Flip 7 has `band`, `band-border`, `accent*`, `title-font`, `title-size`, `title-tracking`, `phone-radius`, `media-ratio`, `media-max-h`). The optional list in §3 is the shared vocabulary, not a closed set: a per-strip token is fine as long as its **value** lives in `dev-tokens.css` and the modifier only maps it.

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

### Gotcha: `title-from` / `title-to` and where custom properties resolve

`.dp-strip-title` never reads `--dp-strip-title-color` directly — it paints
`linear-gradient(--dp-strip-title-from → --dp-strip-title-to)` and clips it to the
text. Those two default to `var(--dp-strip-title-color)`, but a custom property is
substituted **where it is declared, not where it is used**. While that default lived
in `:root`, it resolved against the *default* title colour and froze there, so a
modifier setting only `--dp-strip-title-color` was silently ignored: SCP Reader
declared `#ffffff` and Kaomoji `#F2F0EE`, and both painted Fair Share's mint.

The fallback pair is now re-declared on `.dp-strip` itself — the same element the
modifiers land on — so a strip that sets only `title-color` gets it. Setting
`title-from` / `title-to` explicitly still wins on source order (Flip 7 does this).
**If you move that pair back to `:root`, every strip silently goes mint again.**

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
- Strips render dark on every page via `color-scheme: dark`, so validate against the dark strip surface — not the (light) page around it. **Two exceptions, both light:** validate `.dp-strip--kaomoji` against its own `#FFFFFF` surface and its preview panel against `#FAF9F8`; validate `.dp-strip--flip7` against its teal band `#1d9995` and its cream phone `#fff4d2`, never against the generic dark surface. Flip 7 also carries a documented AAA failure — see below.

### Documented exception: `.dp-strip--flip7`

Flip 7 is the one strip that does **not** meet the 7:1 bar throughout, by explicit design decision. It is a full-bleed band of flip7scorecard.com's brand teal `#1d9995`, with the heading set in the app's cream `#fff4d2` directly on that teal:

| Pair | Where | Ratio | AA body (4.5) | AAA body (7) |
|------|-------|-------|---------------|--------------|
| cream `#fff4d2` on teal `#1d9995` | **heading** | **3.16:1** | fail | fail |
| white `#ffffff` on teal | (rejected) | 3.48:1 | fail | fail |
| navy `#2b3276` on teal | (rejected) | 3.32:1 | fail | fail |
| navy on cream | CTA label, phone UI | 10.50:1 | pass | pass |

Nothing legible sits on this teal — it is a mid-tone, so every candidate foreground lands in the 3.1–3.5 dead zone. Darkening the same hue to `#115c59` reaches 7.09:1 with cream and still reads as the brand teal; that option was offered and declined in favour of exact brand fidelity. If the bar is ever reinstated, `#115c59` is the drop-in value — change `--dp-strip-flip7-band` and nothing else.

**The failure is confined to the heading.** Everything else on the strip clears AAA, deliberately:

- The CTA takes a **cream fill with navy text** (10.50:1) rather than cream text on teal. A cream-filled button still reads as "the cream button" without inheriting the heading's ratio.
- The preview is a cream phone whose entire UI is navy-on-cream at 10.50:1. Inside it, the Bank and Bust cards use darkened `#115c59` and `#952828` rather than the app's `#1d9995` and `#e53e3e`, because cream glyphs on the brand values are only 3.16:1 and 3.76:1 — the darkened pair reach 7.09:1 and 7.32:1.
- Orange `#fbb03a` is never used as text anywhere (1.68:1 on cream). Fills, borders and glows only.

**Do not copy this exception to a new strip.** It is a one-off tied to this specific brand colour, not a relaxation of the standard.

---

## 6. Current strip inventory

| Strip | Modifier class | Colour family | Optional tokens used |
|-------|----------------|---------------|------------------------|
| Fair Share (default) | *(none)* | Teal / pink | — |
| SCP Reader | `.dp-strip--scp` | Dark red / maroon | `device-border`, `device-shadow` |
| Flip 7 | `.dp-strip--flip7` | Brand teal + cream / navy (**light**, **full-bleed**) | `title-from`, `title-to`, `band`, `band-border`, `device-border`, `device-shadow`, `accent`, `title-font`, `title-size`, `title-tracking`, `phone-radius`, `media-ratio`, `media-max-h` |
| Kaomoji | `.dp-strip--kaomoji` | Warm neutral (**light**) | `border`, `device-border`, `device-shadow`, `padding`, `panel-bg`, `accent` |

**Note on Flip 7 — the one strip that is not just a token mapping.** Everything else on this page brands with tokens and a mapping block. Flip 7 additionally carries real CSS, because it is a different *shape*, not a different palette:

- **Full-bleed band.** `width: 100vw; max-width: 100vw; margin-inline: calc(-50vw + 50%); border-radius: 0` — the house breakout idiom, also used by `.dp-ticker` and `.dp-prose-figure--full` — plus `min-height: 100svh` and a flex column that centres its content. It is the only strip that is not an inset rounded card.
- **No orbs.** `::before` / `::after` are `display: none` and the `.dp-strip-orbs` div is absent from the markup, same opt-out as Kaomoji. Consequence worth knowing: `strip-effects.js` selects on `.dp-strip:has(.dp-strip-orbs)`, so this strip is no longer driven by the cursor-reactive orb code at all. Its orb tokens stay defined and mapped anyway, per the convention below.
- **The media slot is a phone.** `aspect-ratio: 9 / 19.5`, a 32px radius, no border and no shadow, and `max-height: min(700px, calc(100svh - 10rem))` — capped against the viewport as well as absolutely, so the phone plus the band's padding can never push the band past the `100svh` it is filling.
- **No card, no badges, no overline.** The heading and CTA sit directly on the teal. The badge tokens stay defined and mapped, per the convention below.
- **A scoped display face.** `--dp-strip-flip7-title-font` puts Bebas Neue (the product's own face) on `.dp-strip--flip7 .dp-strip-title` only; the family is appended to the homepage's existing Google Fonts request.

When flip7scorecard.com's palette changes, update the `--dp-strip-flip7-*` tokens and the preview widget (`assets/previews/flip-7/index.html`) together — the widget carries its own `--f7-*` namespace and does not read these tokens.

**Note:** Kaomoji hides its orbs via extra CSS in the modifier block, and renders no badges — its `badge-bg` / `badge-text` tokens stay defined and mapped so the strip remains re-brandable if badges return. Its colours track kaomoji.click's own palette: `bg` is that site's `--n-900`, `title-color` its `--n-100`, and `device-shadow` its `--shadow-hi`. When the product's palette changes, update these eleven tokens and the preview widget (`assets/previews/kaomoji/index.html`) together — nothing else needs to move.

Kaomoji's colours previously lived inline in `dev-styles.css`; they now follow this spec as `--dp-strip-kaomoji-*` tokens in `dev-tokens.css`, so all four strips are consistent. `./scripts/check-token-hygiene.sh` fails the build if a strip regresses to inline values.

---

## 7. Future: cross-page reuse

Strips currently live on the main dev projects page (`index.html`). To reuse the same strip styling on **case study pages**, the strip CSS (tokens + layout + modifier mappings) must be **extracted** or otherwise made available to those pages so that adding a class like `dp-strip dp-strip--scp` works there too. That extraction is a prerequisite before strips can appear on case study pages. See the product-strips backlog and case-study positioning in `docs/issues/dev-projects-product-strips.md`.
