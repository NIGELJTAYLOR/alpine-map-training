# PerformOS brand assets — persistent location

Drop brand files here. Any Cowork or Claude session that opens this `outputs/` folder will see them.

## Active files

- `performos-logo.png` — primary "By PerformOS®" wordmark, 638×127, transparent background. Canonical for all deliverables.
- `performos-wordmark.png` — alternate stacked logo with "Connecting Your Business To AI" tagline (currently unused in the Alpine Map Training workbook).
- `performos-logo.svg` — drop an SVG version here if/when available; the build prefers SVG over PNG when both exist.

## How this is used

Anything I'm asked to brand (workbooks, decks, docs, packs) reads the logo from this folder. Specifically, the Alpine Map Training workbook reads from here when rendering the wordmark and the PDF cover — see `outputs/workbook/_build.py` and `outputs/workbook/_build_pdf.py`.

## Brand context (so I don't have to ask)

- Company: PerformOS
- Founder / primary user: Nigel — nigel@performos.ai
- Project examples: Alpine Map Training Programme (companion workbook + app)
- Typography: Manrope (display, 800/700/600/400), IBM Plex Mono (eyebrows/codes)
- Palette: navy ink #0E1A2E, alpine red #D7263D (single heat accent),
  glacier blue #2480B5, moss #2E7D5B, paper #EEF1F4
- Glyph rule: red is reserved for primary CTAs, active state, single accent — never decorative

## Capitalisation rule

PerformOS — capital P, capital O, capital S. Never "Performos" or "performOS".
