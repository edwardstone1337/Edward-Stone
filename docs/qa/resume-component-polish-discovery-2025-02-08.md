# Resume component — Polish pass (discovery)

**Date:** 2025-02-08  
**Scope:** Bottom download breakpoint, animated border at 1280px, intro copy, full CSS rule inventory.  
**No code changes — findings only.**

---

## 1. Bottom download button breakpoint (`.dp-resume-mobile-download`)

### Every CSS rule that affects `.dp-resume-mobile-download` display

| # | Location | Media query | Line(s) | Rule |
|---|----------|-------------|---------|------|
| 1 | `dev-styles.css` | *(none — base)* | 1392–1394 | `.dp-resume-mobile-download { display: none; }` |
| 2 | `dev-styles.css` | `@media (max-width: 1080px)` | 1605–1610 | `.dp-resume-mobile-download { display: flex; justify-content: center; margin-top: var(--dp-space-10); }` |

There are **no other** rules in this project that target `.dp-resume-mobile-download`. The `@media (max-width: 768px)` block (lines 1821–1895) does **not** contain any rule for `.dp-resume-mobile-download`.

### Why it might not show at 1080px (despite resume reflow at 1080px)

- **Cascade:** At viewport width ≤1080px, the second rule (inside `@media (max-width: 1080px)`) applies and overrides the base `display: none` with `display: flex`. So **by CSS in this file**, the mobile download block should be visible at 1080px and below.
- **Inconsistency:** In `index.html` line 322 the comment says *"Mobile download (hidden on desktop, shown ≤768px)"*. That is **wrong** — the CSS breakpoint is 1080px, not 768px. If testing was guided by that comment, it could explain the belief that it only shows at ≤768px.
- **If it truly only appears at ≤768px in the browser:** Then either (1) another stylesheet or inline style is overriding, (2) the 1080px block is not loading, or (3) something else (e.g. scroll/position) is hiding it. There is **no rule in dev-styles.css** that would restrict visibility to 768px.

**Recommendation:** Align the HTML comment with the CSS (e.g. "shown ≤1080px") and verify at 1080px viewport with devtools (computed `display` and which rules apply).

---

## 2. Animated border audit (1280px)

At 1280px the resume uses the **base** (non–1080px) rules; the responsive block does not apply.

### 2a. Current CSS for `.dp-resume-container::before` and `.dp-resume-page` (masking layer)

**`.dp-resume-page-wrapper .dp-resume-container::before`** — full rule:

```css
/* dev-styles.css lines 1371–1386 */
.dp-resume-page-wrapper .dp-resume-container::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  transition: opacity var(--dp-duration-base) var(--dp-ease-out);
  background: radial-gradient(
    400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    var(--dp-accent-glow),
    transparent 40%
  );
  z-index: 1;
  pointer-events: none;
}
```

Hover (opacity 1): lines 1387–1389:

```css
.dp-resume-page-wrapper .dp-resume-container:hover::before {
  opacity: 1;
}
```

**`.dp-resume-page`** (masking inner layer) — full rule:

```css
/* dev-styles.css lines 1201–1213 */
.dp-resume-page {
  position: relative;
  z-index: 2;
  background: var(--dp-paper-surface);
  border-radius: calc(var(--dp-radius-sm) - 1px);
  padding: 32px 36px 28px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

### 2b. JS mousemove handler for `--mouse-x` / `--mouse-y` on the resume container

**File:** `assets/js/dev-projects/effects.js`

- **Line 33:** `if (!window.matchMedia('(hover: hover)').matches) return;` — cursor glow (including resume) only runs when hover is available.
- **Lines 56–68:** Resume container glow:

```javascript
// Line 57
var resumeContainer = document.querySelector('.dp-resume-page-wrapper .dp-resume-container');
if (resumeContainer) {
  resumeContainer.addEventListener('mousemove', function (e) {
    var rect = resumeContainer.getBoundingClientRect();
    resumeContainer.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
    resumeContainer.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
  });

  resumeContainer.addEventListener('mouseleave', function () {
    resumeContainer.style.removeProperty('--mouse-x');
    resumeContainer.style.removeProperty('--mouse-y');
  });
}
```

So `--mouse-x` and `--mouse-y` are set on `.dp-resume-page-wrapper .dp-resume-container` (lines 61–62), removed on mouseleave (66–67).

### 2c. Does `.dp-resume-container` have `position: relative`?

**Yes.** Base rule at lines 1186–1199:

```css
.dp-resume-container {
  ...
  position: relative;
  ...
}
```

So the `::before` (position: absolute; inset: 0) is correctly positioned relative to the container.

### 2d. Does `.dp-resume-container` have `overflow: hidden`?

**Yes.** Same block, line 1194: `overflow: hidden;`. So the container **does** clip its contents. The cards use overflow on the inner (e.g. `.dp-card-inner`), not the outer. Here, the **inner** `.dp-resume-page` also has `overflow: hidden` (line 1211). So we have:

- **Outer:** `.dp-resume-container` — `overflow: hidden`, `padding: 1px`, `background: var(--dp-paper-border)`.
- **Glow:** `::before` at z-index 1, behind the inner.
- **Inner:** `.dp-resume-page` at z-index 2, solid background and `overflow: hidden`.

The glow is only visible in the 1px “gap” between the container’s inner edge and the rounded `.dp-resume-page`. So the outer `overflow: hidden` does not remove the border effect; it just clips the pseudo-element to the container. **Layering is correct** for the intended border-glow effect.

### 2e. Z-index layering

- `::before`: **z-index: 1** (lines 1383).
- `.dp-resume-page`: **z-index: 2** (line 1204).

So the glow is behind the inner page; only the edge shows. **Correct.**

### 2f. At 1280px, is `padding: 1px` and `background: var(--dp-paper-border)` set on `.dp-resume-container`?

**Yes.** Base rule (lines 1189–1190): `padding: 1px;` and `background: var(--dp-paper-border);`. At 1280px the `@media (max-width: 1080px)` block does not apply, so these values are in effect. The 1px padding creates the border gap for the glow.

**Note:** Inside `@media (prefers-reduced-motion: reduce)` (lines 1785–1787), `.dp-resume-container::before` is set to `display: none`, so the animated border is disabled for users who prefer reduced motion.

---

## 3. Current intro copy (`.dp-resume-intro`)

**File:** `index.html`. Content of `.dp-resume-intro`:

| Element | Line(s) | HTML / text |
|--------|---------|-------------|
| Overline | 160 | `<span class="dp-overline">Resume</span>` |
| Heading | 161 | `<h2 class="dp-resume-intro-heading">Experience <br/>& Skills</h2>` |
| Body | 162 | `<p class="dp-resume-intro-body">A decade of designing user experiences across ed-tech, sports, and digital agencies.</p>` |

The intro also contains the download widget (`.dp-resume-download`, lines 163–191), which is part of the same block but not “copy” in the sense of overline/heading/body.

---

## 4. Full CSS rule inventory (resume, download, lightbox)

All rules targeting `.dp-resume-*`, `.dp-download-*`, or `.dp-lightbox-*` in `dev-styles.css`, grouped by context. Line numbers are the start of the selector or block.

### Base rules (no media query)

| Line(s) | Selector |
|---------|----------|
| 1056–1061 | `.dp-resume-section` |
| 1064–1071 | `.dp-resume-layout` |
| 1073–1079 | `.dp-resume-intro` |
| 1081–1088 | `.dp-resume-intro-heading` |
| 1090–1096 | `.dp-resume-intro-body` |
| 1099–1102 | `.dp-resume-download` |
| 1104–1108 | `.dp-download-trigger` |
| 1110–1113 | `.dp-download-chevron` |
| 1115–1117 | `.dp-download-trigger[aria-expanded="true"] .dp-download-chevron` |
| 1119–1130 | `.dp-download-menu` |
| 1132–1142 | `@keyframes dp-menu-enter` (used by menu) |
| 1144–1146 | `.dp-download-menu[hidden]` |
| 1148–1164 | `.dp-download-menu-item` |
| 1167–1170 | `.dp-download-menu-item:hover` |
| 1172–1175 | `.dp-download-menu-item:focus-visible` |
| 1177–1180 | `.dp-download-menu-item svg` |
| 1182–1184 | `.dp-download-menu-item:hover svg` |
| 1186–1199 | `.dp-resume-container` |
| 1202–1213 | `.dp-resume-page` |
| 1215–1223 | `.dp-resume-header` |
| 1225–1232 | `.dp-resume-name` |
| 1234–1238 | `.dp-resume-tagline` |
| 1241–1247 | `.dp-resume-summary` |
| 1250–1257 | `.dp-resume-contact` |
| 1259–1264 | `.dp-resume-contact-item` |
| 1266–1268 | `a.dp-resume-contact-item:hover` |
| 1270–1276 | `.dp-resume-body` |
| 1278–1280 | `.dp-resume-main` |
| 1282–1286 | `.dp-resume-sidebar` |
| 1288–1296 | `.dp-resume-section-title` |
| 1298–1300 | `.dp-resume-role` |
| 1302–1304 | `.dp-resume-role:last-child` |
| 1306–1312 | `.dp-resume-role-title` |
| 1314–1317 | `.dp-resume-role-title em` |
| 1319–1325 | `.dp-resume-role-meta` |
| 1327–1333 | `.dp-resume-role-desc` |
| 1335–1342 | `.dp-resume-role-achievements` |
| 1344–1346 | `.dp-resume-role-achievements li` |
| 1348–1350 | `.dp-resume-sidebar .dp-resume-section-group` |
| 1352–1356 | `.dp-resume-skill-list` |
| 1358–1364 | `.dp-resume-skill-list li` |
| 1366–1369 | `.dp-resume-container:hover` |
| 1372–1386 | `.dp-resume-page-wrapper .dp-resume-container::before` |
| 1388–1390 | `.dp-resume-page-wrapper .dp-resume-container:hover::before` |
| 1393–1395 | `.dp-resume-mobile-download` |
| 1398–1400 | `body.dp-overlay-active` (lightbox open) |
| 1402–1410 | `.dp-lightbox` |
| 1412–1418 | `.dp-lightbox-backdrop` |
| 1420–1428 | `.dp-lightbox-content` |
| 1432–1440 | `.dp-lightbox-page` |
| 1443–1446 | `.dp-lightbox-controls` |
| 1449–1463 | `.dp-lightbox-close` |
| 1466–1470 | `.dp-lightbox-close:hover` |
| 1472–1475 | `.dp-lightbox-close:focus-visible` |

### Inside `@media (max-width: 1080px)` (starts line 1478)

| Line(s) | Selector |
|---------|----------|
| 1480–1483 | `.dp-resume-section` |
| 1484–1488 | `.dp-resume-layout` |
| 1490–1494 | `.dp-resume-intro` |
| 1496–1499 | `.dp-resume-intro .dp-resume-download` |
| 1501–1504 | `.dp-resume-intro-heading` |
| 1506–1516 | `.dp-resume-container` |
| 1518–1520 | `.dp-resume-container:hover` |
| 1523–1526 | `.dp-resume-header` |
| 1528–1531 | `.dp-resume-contact` |
| 1533–1536 | `.dp-resume-name` |
| 1538–1541 | `.dp-resume-tagline` |
| 1543–1548 | `.dp-resume-summary` |
| 1550–1553 | `.dp-resume-contact-item` |
| 1555–1557 | `.dp-resume-header` (border-bottom-color) |
| 1560–1563 | `.dp-resume-body` |
| 1565–1570 | `.dp-resume-sidebar` |
| 1573–1576 | `.dp-resume-section-title` |
| 1578–1581 | `.dp-resume-role-title` |
| 1583–1586 | `.dp-resume-role-meta` |
| 1588–1592 | `.dp-resume-role-desc` |
| 1594–1598 | `.dp-resume-role-achievements` |
| 1600–1603 | `.dp-resume-skill-list li` |
| 1606–1610 | `.dp-resume-mobile-download` |
| 1613–1615 | `.dp-resume-container::before` |

### Inside `@media (prefers-reduced-motion: reduce)` (starts line 1724)

| Line(s) | Selector |
|---------|----------|
| 1730–1732 | `.dp-download-menu` |
| 1734–1736 | `.dp-download-chevron` |
| 1787–1789 | `.dp-resume-container::before` |

### Other media queries

- **`@media (max-width: 768px)`** (1821) and **`@media (max-width: 480px)`** (1898): **no** rules targeting `.dp-resume-*`, `.dp-download-*`, or `.dp-lightbox-*` in the scanned sections.

---

## 5. Inconsistencies, dead rules, conflicts

- **HTML comment vs CSS:** `index.html` line 322 says the mobile download is "shown ≤768px". CSS shows it at **≤1080px**. Comment is outdated/wrong.
- **Mobile download visibility:** No CSS in this file limits the mobile download to 768px; the only override is at 1080px. If it only appears at ≤768px in practice, the cause is outside this file or environmental.
- **Animated border:** At 1280px, base rules apply; `position: relative`, `overflow: hidden`, `padding: 1px`, `background: var(--dp-paper-border)` on `.dp-resume-container` are set; z-index (::before 1, .dp-resume-page 2) is correct; JS sets `--mouse-x`/`--mouse-y` on the container. Reduced motion disables the glow via `::before { display: none }`.
- **No dead or conflicting rules** identified for `.dp-resume-*` / `.dp-download-*` / `.dp-lightbox-*` within the scope of this audit.
