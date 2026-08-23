# Resume Word (.docx) companion

`files/Edward Stone Resume.docx` is a Word companion to the resume PDF, for older ATS parsers (Taleo-era, some Workday configs) that handle `.docx` more reliably than any PDF.

## How it's generated

Hand-generated from `resume.html`'s resume content via a `python-docx` script — same source of truth as the PDF, transcribed manually into the Word object model:

- Single-column document (no tables, no text boxes — both break ATS parsers)
- Heading 1 — name
- Heading 2 — section titles
- Heading 3 — role titles
- Native Word bullet lists for achievements
- Core properties (title, author, language) set

This mirrors the same ATS-safety constraints the PDF print pipeline enforces (see `CHANGELOG.md`'s "Resume PDF/print pipeline" entry and `docs/architecture-tokens.md`'s Print section) — plain document structure over visual layout tricks.

## Regeneration

**Manual step — no CI automation.** The generation script currently lives outside this repo.

Whenever `resume.html`'s resume content changes (roles, achievements, skills, summary, contact details, section copy), `files/Edward Stone Resume.docx` must be regenerated and re-committed to stay in sync. There is no CI check enforcing this — unlike the PDF, which is regenerated and validated automatically by `.github/workflows/generate-resume-pdf.yml`, the `.docx` will silently drift if forgotten.
