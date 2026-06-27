# Alpine Map Training — Companion Workbook

The printable companion to the Alpine Map Training app. This README documents the workbook deliverables added in the Cowork session on 9 June 2026 and how to rebuild them.

## What's here

| Path | What it is |
|---|---|
| `Alpine_Map_Training_Workbook.pdf` | Final 448-page PDF. Glacier Lab styled, full cover, page numbers, all v10 figures. |
| `Workbook/` | Live HTML workbook — open `Workbook/index.html` in a browser to navigate. One HTML file per workbook page in `Workbook/pages/`. |
| `Workbook/img/` | The 65 figures extracted from the v10 manual, one file per page-slot. |
| `Workbook/tokens.css`, `styles.css`, `workbook.css` | The styles the HTML pages depend on (also mirrored in `design/`). |
| `build/` | The Python build pipeline that produces the HTML and the PDF from `source/Alpine_Map_Training_Companion_Manual_v10.docx`. |
| `brand/` | Canonical brand assets. The build reads `brand/performos-logo.png`, `brand/cover-hero.jpg`, and `brand/cover-topo.jpg`. Drop a replacement file with the same name and re-run the build to swap. |
| `design/` | Design system tokens, component styles, and the workbook stylesheet. The CSS files here are the same as the ones in `Workbook/`; this folder is the canonical home for editing them. |
| `source/` | Original Word + PDF manuals (v10 and v11) and the design handoff bundle from the Claude design session. v10 is the authoritative version for figures; v11 had corrupted images. |

## How to rebuild

The build needs Python 3 with `pillow` and `playwright` (with Chromium). One-time setup:

```bash
pip install --break-system-packages pillow playwright
python3 -m playwright install chromium
```

Then, from the project root:

```bash
# (a) Regenerate the HTML workbook (66 pages + index)
python3 build/build_html.py

# (b) Regenerate the single combined PDF
python3 build/build_pdf.py
```

Both scripts read paths relative to their own location and produce output in `Workbook/` and at the project root respectively. Edit `brand/performos-logo.png` or any css token in `design/tokens.css` and rerun to see the change everywhere.

## Source-of-truth rules (so future sessions don't re-ask)

These are also written into `brand/README.md` so any tool that opens the project sees them.

- Company name: **PerformOS** — capital P, capital O, capital S. Never "Performos".
- Founder / primary contact: Nigel Taylor — nigel@performos.ai
- Typography: **Manrope** for display and body, **IBM Plex Mono** for codes, eyebrows, captions, page numbers.
- Palette: navy ink `#0E1A2E`, alpine red `#D7263D` (single heat accent, never decorative), glacier blue `#2480B5`, moss `#2E7D5B`, paper `#EEF1F4`.
- Logo: `brand/performos-logo.png` ("By PerformOS®" wordmark on transparent background). The build also keeps `brand/performos-wordmark.png` as an alternate wider version.
- Cover artwork: `brand/cover-hero.jpg` (the skiers + Tirol mountains photo, cropped to A4-portrait aspect) and `brand/cover-topo.jpg` (Swisstopo Verbier sheet, cropped to fill the lower band).

## v10 vs v11

The figures in `Alpine_Map_Training_Companion_Manual_v11.docx` are corrupted (the prior design handoff went out using v11, which is why the Glacier Lab reference workbook page showed blank symbol boxes for B3.3 etc.). v10 is the authoritative figure source. The build pipeline reads v10's images directly via `build/v10_aggregated.json`, which records each page's figure order. v11 is preserved in `source/` for archival reasons but is not used by the build.

## Build pipeline overview

`build/build_html.py` does the following:

1. Reads `build/outline.json` — a per-page JSON structure derived from v11's paragraph stream, with image references rewritten to point at v10's media (per `build/v10_aggregated.json`).
2. Reads `build/img_map.json` — synthetic image-key → filename map used by the page renderer.
3. For each page, walks the block list and emits the right HTML component: page title, learning-aim block, body paragraphs, lists, tables, figures with captions, exercise/worked-example/self-check/reflection blocks, answer-blank rule lines, pager.
4. Writes one HTML file per page to `Workbook/pages/<CODE>.html` plus the level-grouped `Workbook/index.html`.

`build/build_pdf.py` concatenates every page into a single print-styled HTML document, hides the app-only chrome (sidebar TOC, right aside), composes the full-bleed cover, then renders to PDF via Chromium with `displayHeaderFooter=true` to draw a `Page X of Y` footer right-aligned in the bottom margin of every page.

## Things still worth knowing

- The PDF is 448 pages because each workbook page typically expands to 6–10 A4 pages once paginated for print at 13–15px body. The workbook itself is 66 logical pages.
- One small concession: `outputs/img/` may contain a handful of orphaned files (e.g. `fig-B2.2-2.png`) that were created earlier from corrupted v11 sources before being dropped. They aren't referenced by any page and can be deleted, but the sandbox couldn't remove them in the last session.
