# Product-strip.js and strip rendering pipeline — audit

**Date:** 2026-02-09  
**Scope:** `product-strip.js` internals, hardcoded strips on `index.html`, `projects.json` schema, theme/effects, migration risks.  
**No files modified.**

---

## Part 1 — product-strip.js internals

### 1.1 Function signature and config fields

**Signature:**  
`renderProductStrip(config, containerSelector, options)`

- **`config`** — object; all fields optional. Accepted keys:
  - **`ariaLabel`** — string; set as `section.setAttribute('aria-label', config.ariaLabel)`.
  - **`mediaSrc`** — string; URL for an `<img>` in `.dp-strip-media`. Sanitized via `sanitizeUrl()`; if invalid/blocked, no img is added.
  - **`mediaAlt`** — string; `img.alt` when `mediaSrc` is used.
  - **`mediaSkeleton`** — string; only `'fair-share'` is handled; appends Fair Share skeleton markup inside `.dp-strip-media`. No other skeletons.
  - **`emoji`** — string; rendered as a `<span class="dp-strip-emoji">` with `aria-hidden="true"` before the title.
  - **`title`** — string; `<h2 class="dp-strip-title">` (default `''`).
  - **`overline`** — string; optional `<span class="dp-strip-overline">` after the title.
  - **`badges`** — array of strings; each becomes `<span class="dp-strip-badge">`.
  - **`description`** — string; `<p class="dp-strip-description">`.
  - **`learnMoreLabel`** — string; if set, adds primary CTA `<a class="dp-btn dp-btn-primary-on-dark">` with `config.learnMoreUrl` (sanitized; `#` if invalid). Opens in new tab only when URL is not `#`.
  - **`learnMoreUrl`** — string; used with `learnMoreLabel`.
  - **`ctaLabel`** — string; secondary CTA text (default `''`).
  - **`ctaUrl`** — string; secondary CTA href (sanitized; `#` if invalid). CTA always has `target="_blank"` and `rel="noopener noreferrer"` and `aria-label="<ctaLabel> (opens in new tab)"`.
- **`containerSelector`** — CSS selector; container must exist and have a parent.
- **`options`** — optional object:
  - **`insertAfter`** — boolean; if `true`, strip is inserted after the container; otherwise before it.

**Not supported in config:** strip modifier classes (e.g. compact, flipped, kaomoji, scp), layout variant, media type (iframe), logo image, testimonial, section colour namespace, second CTA styling (e.g. primary vs secondary), hiding primary CTA.

---

### 1.2 HTML structure generated (pseudo-HTML)

```html
<section class="dp-strip" aria-label="…">   <!-- only if config.ariaLabel -->
  <div class="dp-strip-orbs">
    <div class="dp-strip-orb-dark dp-strip-orb-dark--1"></div>
    <div class="dp-strip-orb-dark dp-strip-orb-dark--2"></div>
  </div>
  <div class="dp-strip-inner">
    <div class="dp-strip-content">
      <!-- optional -->
      <span class="dp-strip-emoji" aria-hidden="true">…</span>
      <h2 class="dp-strip-title">…</h2>
      <!-- optional -->
      <span class="dp-strip-overline">…</span>
      <!-- optional -->
      <div class="dp-strip-badges">
        <span class="dp-strip-badge">…</span> …
      </div>
      <!-- optional -->
      <p class="dp-strip-description">…</p>
    </div>
    <div class="dp-strip-media">
      <!-- one of: img (if mediaSrc), fair-share skeleton (if mediaSkeleton === 'fair-share'), or empty -->
    </div>
    <div class="dp-strip-actions">
      <!-- optional -->
      <a class="dp-btn dp-btn-primary-on-dark" href="…">learnMoreLabel</a>
      <a class="dp-btn dp-btn-secondary-on-dark" href="…" target="_blank" rel="noopener noreferrer" aria-label="… (opens in new tab)">
        ctaLabel <span class="dp-btn-icon" aria-hidden="true"><svg>…</svg></span>
      </a>
    </div>
  </div>
</section>
```

**Fixed behaviour:** Section always has exactly `class="dp-strip"` (no modifiers). Orbs are always present. Inner order is always: content → media → actions. Media div is always present (possibly empty). Primary CTA is only added when `learnMoreLabel` is set; secondary CTA is always added.

---

### 1.3 Layout variants

- **None.** The script does not add `dp-strip--compact`, `dp-strip--flipped`, or any other modifier. It does not wrap the strip in `dp-split-row` or add a testimonial sibling. Layout is the default strip layout only (content + media + actions in one row on desktop; order and grid defined in CSS).

---

### 1.4 Media handling

- **Image:** Supported via `config.mediaSrc` (and optional `mediaAlt`). `loading="lazy"` is set. No explicit dimensions.
- **Iframe:** Not supported. No branch for iframe or `preview.src`; only `<img>` or skeleton.
- **Skeleton:** Only `mediaSkeleton === 'fair-share'` is supported; builds the Fair Share skeleton DOM. No other skeleton types.
- **Empty media:** If neither `mediaSrc` nor `mediaSkeleton: 'fair-share'` is set, `.dp-strip-media` is still created and appended (empty). So every strip has a media block in the DOM.

---

### 1.5 Testimonials, orbs, badges, emoji

- **Testimonials:** Not handled. No `blockquote.dp-testimonial` or related markup.
- **Orbs:** Always generated (two `.dp-strip-orb-dark` divs). No option to omit orbs (e.g. for Kaomoji strip).
- **Badges:** Supported via `config.badges` (array of strings).
- **Emoji:** Supported via `config.emoji` (single span, `aria-hidden="true"`).

---

### 1.6 Section-specific colour tokens (modifier classes)

- **Not handled.** The script never adds `dp-strip--kaomoji`, `dp-strip--scp`, or any other modifier. Colour/theme namespacing would have to be driven by config and applied to `section.className` (not implemented).

---

### 1.7 Effects initialisation (aurora, orbs, theme sync)

- **None.** `product-strip.js` only builds DOM. It does not call `initStripEffects`, does not send `postMessage` to iframes, and does not add `dp-strip--interactive`. All effects are the responsibility of the page that inserts the strip.

---

### 1.8 Helpers / imports

- **`sanitizeUrl`** — imported from `./utils.js`. Used for `mediaSrc`, `learnMoreUrl`, `ctaUrl`. No other utils (e.g. `escapeHTML`) are used; text is assigned via `textContent`, so no HTML injection.

---

## Part 2 — Gap analysis vs hardcoded strips

### 2.1 Fair Share (first strip, in first `dp-split-row`)

| Aspect | Hardcoded HTML | product-strip.js |
|--------|----------------|------------------|
| **Section classes** | `dp-strip dp-strip--compact` | Only `dp-strip` |
| **Wrapper** | Inside `<div class="dp-split-row" id="projects">` with testimonial sibling | No wrapper; no testimonial |
| **Orbs** | Present | Present (same) |
| **Media block** | **Absent** — `.dp-strip-inner` has only content + actions | **Always present** — content, media (empty or skeleton), actions |
| **Content order** | emoji, title, overline, badges, description | Same (emoji, title, overline, badges, description) |
| **Primary CTA** | "Learn more" → `projects/fair-share.html` | Supported via `learnMoreLabel` / `learnMoreUrl` |
| **Secondary CTA** | "Go to Fair Share" + external URL + icon | Supported; aria-label "Go to Fair Share (opens in new tab)" in hardcoded; JS uses `(config.ctaLabel \|\| 'Open') + ' (opens in new tab)'` |
| **aria-label** | `aria-label="Fair Share, featured project"` | Supported via `config.ariaLabel` |
| **Inline styles** | None | N/A |

**Summary:** Main gaps: (1) no `dp-strip--compact`, (2) no `dp-split-row` or testimonial, (3) hardcoded strip has **no** `.dp-strip-media`; JS always adds a media div (empty or skeleton) — so structure differs.

---

### 2.2 Kaomoji (second strip, full-width)

| Aspect | Hardcoded HTML | product-strip.js |
|--------|----------------|------------------|
| **Section classes** | `dp-strip dp-strip--flipped dp-strip--kaomoji` | Only `dp-strip` |
| **Orbs** | **Absent** — no `.dp-strip-orbs` | **Always present** |
| **Inner order** | content, media, actions | Same |
| **Media** | **iframe** with `src="assets/previews/kaomoji/index.html"`, `title="Kaomoji.click preview"`, `loading="lazy"`, `sandbox="allow-scripts allow-same-origin"`, inline style (width/height/aspect-ratio/border/border-radius/display) | Only `<img>` or fair-share skeleton; **no iframe** |
| **Primary CTA** | Hidden (`style="display:none"`) | Would show if `learnMoreLabel` set; **no way to hide** |
| **Secondary CTA** | Single CTA "Go to Kaomoji.click" with class `dp-btn-primary-on-dark` (not secondary) | Always adds secondary-style CTA; no option for single primary-only or to swap classes |
| **Inline styles** | iframe style; primary CTA `display:none` | None applied |

**Summary:** Gaps: (1) no `dp-strip--flipped` or `dp-strip--kaomoji`, (2) orbs always added by JS (cannot omit), (3) no iframe media type, (4) no “hide primary CTA” or “single primary CTA” option, (5) no iframe-specific attributes/styles.

---

### 2.3 SCP Reader (third strip, in second `dp-split-row`)

| Aspect | Hardcoded HTML | product-strip.js |
|--------|----------------|------------------|
| **Section classes** | `dp-strip dp-strip--compact dp-strip--scp` | Only `dp-strip` |
| **Wrapper** | Inside `<div class="dp-split-row dp-split-row--flipped">` with testimonial as first child | No wrapper; no testimonial |
| **Orbs** | Present | Present |
| **Logo** | `<img src="assets/images/scp-logo.svg" alt="" aria-hidden="true" class="dp-strip-logo">` before title (in content) | **Not supported** — only emoji (text) in that slot; no logo image |
| **Media block** | **Absent** | Always present (empty or img/skeleton) |
| **Content** | logo, title, overline, badges, description | emoji (optional), title, overline, badges, description |
| **aria-label** | `aria-label="SCP Reader, featured project"` | Supported via `config.ariaLabel` |
| **Inline styles** | None | N/A |

**Summary:** Gaps: (1) no `dp-strip--compact` or `dp-strip--scp`, (2) no `dp-split-row` / `dp-split-row--flipped` or testimonial, (3) no logo image (only emoji), (4) hardcoded has no media block; JS adds one.

---

## Part 3 — projects.json schema gap

**Current schema (per project):**  
`title`, `description`, `url`, `imagePath`, `imageAlt`, and optionally `preview` with `preview.src`.

### 3.1 Fair Share Calculator

- **In JSON today:** title, description, url, imagePath, imageAlt, preview.src.
- **Missing for full strip from JSON:**  
  `overline` (e.g. "fairsharecalculator.com"), `emoji` ("🪷"), `badges` (["Calculator", "For couples"]), strip-specific `title` (long headline: "I built a tool that…"), `learnMoreUrl` / `learnMoreLabel` (case study link), `ctaUrl` / `ctaLabel` (external product link), `ariaLabel`, `mediaSkeleton: 'fair-share'` or no media, layout/modifier (`compact`), placement (e.g. in split-row with testimonial).  
  Note: current strip has **no** media block; JSON could omit media or set a flag for “no media”.

### 3.2 Kaomoji.click

- **In JSON today:** title, description, url, imagePath, imageAlt, preview.src.
- **Missing for full strip from JSON:**  
  `overline` ("kaomoji.click"), `emoji` ("ʕ•ᴥ•ʔ"), `badges` (["Tool", "Emoticons"]), `ariaLabel`, media type **iframe** (e.g. `mediaIframe: { src, title, sandbox }` or use `preview.src`), layout modifiers (`flipped`, `kaomoji`), **no orbs** (e.g. `orbs: false`), **hide primary CTA** (e.g. `learnMoreHidden: true`), single primary CTA for “Go to Kaomoji.click” (no secondary), theme sync (handled by page script, not config).

### 3.3 SCP Reader

- **In JSON today:** title, description, url, imagePath (""), imageAlt.
- **Missing for full strip from JSON:**  
  `overline` ("scp-reader.co"), `badges` (["Reader", "SCP Foundation"]), strip headline ("There are 9,800 monsters…"), `learnMoreUrl` / `learnMoreLabel` (case study), `ctaUrl` / `ctaLabel` (external), `ariaLabel`, **logo image** (e.g. `logoSrc`, `logoAlt`), layout/modifier (`compact`, `scp`), **no media block** (or flag), placement (split-row + testimonial).

---

## Part 4 — Theme sync and effects

### 4.1 Kaomoji iframe theme (postMessage) flow

- **Sender:** `index.html` inline script (DOMContentLoaded):
  - Selects `.dp-strip--kaomoji iframe`.
  - Defines `sendKmTheme()` which does `iframe.contentWindow.postMessage({ type: 'theme-change', theme: 'dark' }, '*')`.
  - Calls `sendKmTheme()` on iframe `load` and once immediately if `iframe.contentDocument.readyState === 'complete'`.
- **Payload:** `{ type: 'theme-change', theme: 'dark' }` — **theme is hardcoded to `'dark'`**, not the page’s current theme.
- **Receiver:** `assets/previews/kaomoji/index.html` — `window.addEventListener('message', …)`; if `e.data.type === 'theme-change'` it sets `document.documentElement.setAttribute('data-theme', e.data.theme)`.
- **theme-toggle.js:** Only broadcasts to `document.querySelectorAll('.dp-card-media-iframe')` (grid card iframes). It does **not** target the Kaomoji strip iframe. So toggling theme on the page does **not** update the Kaomoji iframe; it only gets the initial `'dark'` on load.

### 4.2 Strip orb/glow effects

- **File:** `assets/js/dev-projects/strip-effects.js`.
- **Entry:** `initStripEffects(stripSelector)`.
- **Called from:** `index.html` script: `initStripEffects('.dp-strip:has(.dp-strip-orbs)')` after DOM ready.
- **Behaviour:** Uses `document.querySelector(stripSelector)` — **single element only**. So only the **first** strip that has orbs (Fair Share) gets cursor-reactive orbs and `dp-strip--interactive`. The SCP strip (also has orbs) is never passed to `initStripEffects`.
- **Scope:** One global `strip` variable; one RAF loop, one IntersectionObserver, one set of mouse listeners. Not designed for multiple strips.

### 4.3 Dynamically rendered strips and initialisation

- **Strip effects:** If strips are inserted after DOMContentLoaded, the current `initStripEffects('.dp-strip:has(.dp-strip-orbs)')` has already run and will not see the new nodes. New strips would get no orb animation unless the page explicitly calls `initStripEffects` again (or a new selector that includes the new strip). Even then, the module only supports one strip (single `strip` ref).
- **Kaomoji theme:** The inline script runs once and queries `.dp-strip--kaomoji iframe`. If that iframe is added later (e.g. by JS-rendered strip), the listener is never attached unless the page re-runs equivalent logic after insertion (and no such re-run exists today).
- **Reveal (effects.js):** Reveal runs once on load over `querySelectorAll('.dp-reveal')`. Current strips do not use `dp-reveal`. If future strips did, they would need to be observed by calling `DPEffectsObserveReveals()` after insertion.

---

## Part 5 — Migration risk checklist (Fair Share hardcoded → JS-rendered)

- **CSS specificity:** Same classes; no extra specificity in hardcoded markup. Risk low if JS emits the same classes. Today JS does not add `dp-strip--compact`, so layout would differ until config/modifiers are added.
- **DOM order:** Hardcoded Fair Share has (content, actions) inside inner; JS has (content, media, actions). An empty or skeleton media block may change layout (e.g. grid rows/columns, spacing). Need to either add “no media” behaviour or accept a visible media slot.
- **Split-row and testimonial:** Replacing only the strip in the first `dp-split-row` would leave the testimonial; if the whole row is replaced by a single strip, testimonial is lost unless the renderer or page builds split-row + testimonial from config.
- **aria-label:** JS supports it via config; ensure `ariaLabel` is set to match current "Fair Share, featured project".
- **Animation triggers:** Strips don’t use `dp-reveal` today; no risk for reveal. Orb animation: only the first strip with orbs is initialised; if Fair Share stays first and still has orbs, behaviour is unchanged. If order or presence of orbs changes, which strip is “interactive” could change.
- **Orb positioning:** strip-effects.js sets CSS custom properties on the strip element; no dependency on DOM order beyond which element is selected. Risk low if the same strip element is still the first with orbs.
- **Scroll-reveal timing:** N/A for current strips (no `dp-reveal` on strips).
- **Noscript fallback:** Current index has no noscript content for strips (only hero/resume/etc.). If strips become JS-only, users without JS would see no strips unless a noscript block is added with static strip HTML.
- **Learn more / CTA links:** Must be supplied in config (`learnMoreUrl`, `learnMoreLabel`, `ctaUrl`, `ctaLabel`); JSON currently doesn’t have them — would need to be added or derived.
- **Overline / badges / headline:** Hardcoded strip uses a long headline and overline "fairsharecalculator.com"; projects.json has short title and description. Need a strip-specific headline and overline in config or convention.
- **Id on container:** First split-row has `id="projects"`; if that’s the target for “Skip to projects” or anchors, replacing the row must preserve the id on the appropriate wrapper.

---

**End of audit.**
