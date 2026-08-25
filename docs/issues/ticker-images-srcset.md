# Work ticker: serve right-sized images via srcset

**Status:** open
**Type:** performance
**Priority:** normal
**Effort:** medium

---

## TL;DR

The homepage work ticker ships **2560×1664** source images to fill **320×208**
tiles. That is 8× oversized on the longest edge, ~64× the pixels, and it makes
the ticker roughly **85% of the homepage's total weight**. Add `srcset` so the
tiles get a small derivative and the lightbox keeps the full-size original.

## Measured (2026-08-25, localhost, DPR 2)

| | |
|---|---|
| Homepage total | 3,353 KB |
| Ticker images | 2,854 KB (85%) |
| Everything else | 499 KB |
| Natural size | 2560×1664 |
| Displayed size | 320×208 |
| Scale factor | 8× linear |

Core Web Vitals are **not** currently affected: LCP is 305 ms and CLS is 0.00,
because the ticker sits below the fold, every image is `loading="lazy"` with
`decoding="async"`, and the LCP element is above it. This is a bandwidth problem,
not a vitals problem — which is why it was filed rather than fixed inline when
the ticker was restored.

The caveat: the ticker sits high (directly under the logo bar), so "lazy" defers
very little in practice. 17 of the 16 files fetched on a normal load. A visitor
on mobile data pays most of the 2.8 MB.

## Why the originals are big at all

They are not simply mis-exported. Clicking a tile opens the shared lightbox
(`image-lightbox.js`, "Portfolio work viewer") at full size, so a large original
has a real job. A 1440px-wide lightbox at DPR 2 wants ~2880px, so 2560px is
defensible **for the lightbox**. The waste is exclusively in the tiles.

## Expected outcome

- A small derivative per ticker image, sized for the tile: 640×416 covers the
  320×208 tile at DPR 2.
- `srcset` / `sizes` on `.dp-ticker__img` so browsers pick the small one for the
  strip.
- The lightbox continues to load the full-size original on click, so nothing is
  lost visually where it counts.
- Target: ticker payload on first load drops from ~2.8 MB to roughly 400–600 KB.

## Constraints

- **No build tools, no npm** (see `CLAUDE.md`). Derivatives have to be generated
  out of band and committed, e.g. a small `scripts/` helper shelling out to
  `sips` (macOS, already available) or `cwebp`. Follow the pattern in
  `docs/gallery-workflow.md`, which already solves "add images via a script".
- Keep filenames predictable so `srcset` can be written by hand without a
  manifest, e.g. `ticker-01.webp` plus `ticker-01@sm.webp`.
- `image-lightbox.js` reads `getAttribute('src')`, so `src` must stay the
  full-size original, or the lightbox extractor needs updating in the same
  change. Worth checking before assuming `srcset` alone is safe.

## Relevant files

- `index.html` — ticker markup (`.dp-ticker__item` / `.dp-ticker__img`)
- `assets/images/ticker/` — 14 work images plus `background-1.png`,
  `foreground-1.png`, `ticker-pretty.png`
- `assets/js/dev-projects/image-lightbox.js` — the `getImageSrc` extractor
- `assets/css/dev-styles.css` — `.dp-ticker*` rules
- `docs/gallery-workflow.md` — existing precedent for scripted image handling

## Notes / risks

- Four tiles carry `data-prod-hide` (the "so pretty!" and "COOL HUH" doodles) and
  never render on prod, so they do not need derivatives — but they are also the
  repo's only use of that attribute, so do not "tidy" them away while working
  here. See `docs/release-playbook.md`.
- Check the derivative quality on the doodles specifically if they do get
  resized: hand-drawn brush edges degrade more visibly than UI screenshots.
