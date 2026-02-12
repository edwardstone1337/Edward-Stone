# Gallery Workflow

## Adding images

One command to resize, convert, and register a gallery image:

```bash
./scripts/gallery-add.sh <source-file> <kebab-name> <alt-text> [categories]
```

The script:
1. Validates inputs (file exists, name is kebab-case, alt text provided)
2. Resizes to 800px wide via `cwebp` (quality 80%, height auto)
3. Saves to `assets/images/gallery/{name}.webp`
4. Appends an entry to `assets/data/gallery.json` via `jq`

### Example

```bash
./scripts/gallery-add.sh ~/Downloads/screenshot.png playsport-onboarding \
  "Playsport onboarding flow with three welcome screens" \
  "ui-design,mobile,playsport"
```

## Naming conventions

Format: `{project}-{description}.webp` in kebab-case.

| Example | Why it works |
|---------|-------------|
| `playsport-onboarding.webp` | Project + feature |
| `lucid-film-poster.webp` | Project + artefact type |
| `es-logo-lettermark.webp` | Brand + variant |
| `neumorphic-music-player.webp` | Style + subject |

## Alt text guidance

Describe what's visually in the image, not just the project name.

- **Good:** "Three Playsport mobile screens showing Boxing, Yoga, and Crossfit sport detail pages"
- **Bad:** "Playsport screenshot"

## Categories

Optional. Comma-separated when using the script, stored as a JSON array. Can be added or updated later directly in `gallery.json`.

Current categories (will grow):

`branding` · `logo` · `ui-design` · `mobile` · `graphic-design` · `poster` · `concept` · `playsport`

## Removing images

No script needed — manual two-step:

1. Delete the file from `assets/images/gallery/`
2. Remove the corresponding entry from `assets/data/gallery.json`

## Image specs

| Property | Value |
|----------|-------|
| Format | WebP, quality 80% |
| Thumb size | 800px wide, height auto |
| Source formats | PNG, JPG, WebP, TIFF, GIF — script converts automatically |
| Full-res | Not yet used. Phase 2 (lightbox) will add a `srcFull` field pointing to an 1800px wide version. |

## Dependencies

- `cwebp` — `brew install webp`
- `jq` — `brew install jq`
