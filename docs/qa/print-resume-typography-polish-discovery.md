# Exploration — Print Resume Typography Polish

**Date:** 2025-02-08  
**Purpose:** Report screen vs print typography, content volume, A4 area, font loading, two-column layout, and hierarchy ratios to inform a polish pass.

---

## 1. Screen typography for comparison

Screen values from `dev-styles.css`. Token definitions from `dev-tokens.css`: `--dp-text-xs` = 0.75rem (12px), `--dp-text-base` = 1rem (16px), `--dp-text-xl` = 1.5rem (24px), `--dp-leading-tight` = 1.15, `--dp-leading-normal` = 1.5, `--dp-tracking-wider` = 0.08em, `--dp-space-1` = 4px, `--dp-space-2` = 8px, `--dp-space-3` = 12px, `--dp-space-4` = 16px, `--dp-space-6` = 24px.

| Element | font-size (screen) | line-height (screen) | font-weight | letter-spacing | margin / padding (screen) |
|--------|---------------------|----------------------|-------------|----------------|---------------------------|
| **.dp-lightbox-page** (base) | Not set (inherits body 16px) | Not set (inherits 1.5) | — | — | — |
| **.dp-resume-name** | 1352: `var(--dp-text-xl)` → **24px** | 1355: `var(--dp-leading-tight)` → **1.15** | 1353: `var(--dp-weight-bold)` (700) | (none) | 1356: margin 0 |
| **.dp-resume-tagline** | 1361: `var(--dp-text-base)` → **16px** | (inherited) | (inherited 400) | (none) | 1363: margin 4px 0 0 |
| **.dp-resume-summary** | 1368: `var(--dp-text-xs)` → **12px** | 1369: `var(--dp-leading-normal)` → **1.5** | (inherited) | (none) | 1370: margin 8px 0 0 |
| **.dp-resume-section-title** | 1414: **11px** (hardcoded) | (inherited) | 1415: `var(--dp-weight-semibold)` (600) | 1418: `var(--dp-tracking-wider)` (0.08em) | 1419: margin 0 0 8px |
| **.dp-resume-role-title** | 1432: `var(--dp-text-xs)` → **12px** | (inherited) | 1433: `var(--dp-weight-semibold)` (600) | (none) | 1435: margin 0 |
| **.dp-resume-role-meta** | 1445: **11px** (hardcoded) | (inherited) | (inherited) | (none) | 1448: margin 2px 0 |
| **.dp-resume-role-desc** | 1453: `var(--dp-text-xs)` → **12px** | 1454: `var(--dp-leading-normal)` → **1.5** | (inherited) | (none) | 1455: margin 4px 0 |
| **.dp-resume-role-achievements** | 1461: `var(--dp-text-xs)` → **12px** | 1463: `var(--dp-leading-normal)` → **1.5** | (inherited) | (none) | 1465: padding-left 16px; 1466: margin 4px 0 0 |
| **.dp-resume-role-achievements li** | (inherited) | (inherited) | (inherited) | (none) | 1469: margin-bottom 2px |
| **.dp-resume-contact-item** | 1385: `var(--dp-text-xs)` → **12px** | (inherited) | (inherited) | (none) | (none on base) |
| **.dp-resume-skill-list li** | 1484: `var(--dp-text-xs)` → **12px** | 1486: `var(--dp-leading-normal)` → **1.5** | (inherited) | (none) | 1487: padding 1px 0 |

**Layout (screen):**  
- **.dp-resume-body** (1395–1400): `grid-template-columns: 1fr 200px`, `gap: var(--dp-space-6)` (24px).  
- **.dp-resume-main** (1402–1404): no font rules; min-width 0.  
- **.dp-resume-sidebar** (1406–1410): min-width 0; padding-left 16px; border-left 1px.

So on screen, body-scale text is 12px (role title, meta, desc, achievements, contact, skills) or 16px (tagline), with name at 24px and section titles at 11px. In print, base is 11px and most of that is pulled down to 10–12px as in your table — a clear compression from screen.

---

## 2. Resume content volume

Counts from `index.html` (resume markup, lines 219–331).

| Item | Count |
|------|--------|
| **Roles listed** | **7** (Inquisitive, PlaySport, Insignia Worldwide, john+john, Rocket Entertainment, Prang Out, The Office of Sir Elton John and David Furnish) |
| **Achievement bullet points total** | **8** (5 for Inquisitive, 3 for PlaySport; other roles have no bullets) |
| **Skills listed** (skill list items) | **19** (6 + 4 + 4 + 3 in UX/UI, Methodologies, Research & Analysis, Soft Skills; Education is 2 entries, see below) |
| **Education entries** | **2** (Ravensbourne University; Esher College) |

Education is marked up as `.dp-resume-skill-list` with two `<li>`s (each containing institution + line break + qualification), so they’re included in the “skills” list styling and count as 2 list items for typography.

---

## 3. A4 printable area

From `dev-styles.css` **2332–2335**:

```css
@page {
  size: A4;
  margin: 12mm 10mm;
}
```

- **A4:** 210mm × 297mm.  
- **Margins:** 12mm top and bottom, 10mm left and right.  
- **Usable content area:**  
  - Width: 210 − 10 − 10 = **190mm**.  
  - Height: 297 − 12 − 12 = **273mm**.  

Approximate px at 96dpi (1 inch = 25.4mm, 96px per inch):  
- Width: 190 × (96 / 25.4) ≈ **718px**.  
- Height: 273 × (96 / 25.4) ≈ **1032px**.  

So the content box is **190mm × 273mm** (~718px × 1032px at 96dpi).

---

## 4. Font rendering

- **How Inter is loaded:** **Google Fonts link only.**  
  - `index.html` lines 15–19: `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com`, then stylesheet  
    `https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap`.  
  - No `@font-face` is used anywhere in the project (grep: no matches).

- **Resume elements’ font-family:**  
  - All resume text uses `var(--dp-font-body)` or `var(--dp-font-display)` (`dev-styles.css` as above; tokens in `dev-tokens.css` 33–34):  
    `"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.  
  - The print block does **not** override `font-family` on `.dp-lightbox-page` or `:root`; it only overrides color/surface tokens (2184–2195). So in print, resume still uses `--dp-font-body` / `--dp-font-display` → Inter with system fallbacks.

- **Will Inter be available in print?**  
  - It’s not embedded via `@font-face`; it’s loaded from the network. When the user prints (lightbox or in-page), the browser typically uses whatever is already in memory. If the page was fully loaded, Inter usually renders in the PDF. If the print dialog is opened before Inter has loaded, or in a headless/automated context (e.g. Puppeteer) without waiting for fonts, the engine may fall back to system-ui / system sans. For a reliable PDF with Inter, consider loading the font in the print context (or using a print-specific stylesheet that ensures font readiness / fallback behavior).

---

## 5. Two-column split (print)

From `dev-styles.css` inside `@media print`:

- **2246–2251:**  
  `.dp-resume-body { display: grid !important; grid-template-columns: 1fr 200px !important; gap: var(--dp-space-8) !important; }`  
  (Later **2315–2317** overrides gap: `.dp-resume-body { gap: 8px !important; }`, so effective gap is **8px**.)

- **2256–2262:**  
  `.dp-resume-sidebar` gets `padding-left: var(--dp-space-4)` (16px) and border-left; no width override.

So in print:

- **Grid:** `grid-template-columns: 1fr 200px`, **gap: 8px**.  
- **Total content width:** 190mm ≈ 718px (from section 3).  
- **.dp-resume-sidebar:** **200px** fixed.  
- **.dp-resume-main:** 718px − 200px − 8px = **510px** (or 190mm − 200px − 8px in mixed units; at 96dpi the main column is ~510px).  

So sidebar is 200px; main fills the rest (~510px at 96dpi). Skill list typography lives in that 200px column (minus padding-left 16px and any internal padding).

---

## 6. Current visual hierarchy (print sizes)

Using the print sizes you listed:

- **Name vs body:**  
  - Name: **20px**. Body (base): **11px**.  
  - Ratio: 20 / 11 ≈ **1.82:1**.  
  - On screen the same ratio is 24 / 12 = 2:1, so print is slightly flatter but still a clear step.

- **Role title vs meta:**  
  - Role title: **12px**. Meta: **10px**.  
  - Ratio: 12 / 10 = **1.2:1**.  
  - Only 2px difference; hierarchy is quite flat. Screen is 12px vs 11px (similar); print tightens meta to 10px, so the step is small.

- **Section title vs body:**  
  - Section title: **11px**. Body: **11px**.  
  - Ratio: **1:1** — same size; hierarchy is carried only by weight (semibold) and uppercase + letter-spacing. So section titles don’t read as “one step up” in size.

Summary: Name stands out (1.82× body). Role title vs meta is a modest 1.2×. Section titles don’t get a size bump in print, so hierarchy is mostly weight and style, not scale. If the goal is “professional resume that could land on a hiring manager’s desk,” consider a slightly larger section title and/or role title in print to restore a bit more hierarchy without blowing the one-page fit.

---

*End of report. No code changes; findings only.*
