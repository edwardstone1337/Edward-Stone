# Analytics tagging (canonical)

Google Analytics 4 is required on all public pages for this site.

## Measurement ID

- `G-6MPMYG36LE`

## Canonical snippet

Place this in `<head>` on every public page:

```html
<!-- Google tag (gtag.js): canonical pattern documented in docs/analytics-tagging.md -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-6MPMYG36LE"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-6MPMYG36LE');
</script>
```

## Inclusion strategy

- Include on all public HTML pages in:
- `/index.html`, `/resume.html`, `/gallery.html`, `/404.html`
- `/projects/*.html`
- `/case-studies/*.html`

- Do not include on internal-only pages:
- `/dev/*`
- `/assets/previews/*`

Reason: internal pages and embedded preview iframes can create noisy/duplicated pageview data.

## New page checklist

1. Add the canonical GA snippet in `<head>`.
2. If the page is public, keep the snippet.
3. If the page is an internal dev page or iframe preview, omit the snippet.

## Verification command

Run:

```sh
./scripts/check-ga-coverage.sh
```

Expected result: `GA coverage check passed.`

## CI enforcement

- Workflow: `.github/workflows/ga-coverage.yml`
- Trigger: pull requests and pushes to `main`
- Behavior: fails the build if any public HTML page is missing `G-6MPMYG36LE`
