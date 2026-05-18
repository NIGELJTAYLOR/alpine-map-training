#!/usr/bin/env node
/**
 * Generate Alpine_Map_Training_Companion_Manual_v11.docx
 *
 * Usage:  npm run manual:build
 *
 * Reads compiled MDX content from .velite/ and produces a single Word
 * document with all lesson pages, exercises (with paper-writable
 * underscore slots), and an answer-key appendix.
 *
 * The TOC is inserted as a Word TOC field — open the .docx in Word and
 * press F9 (or accept the "Update field" prompt) to populate it from the
 * Heading 1 / Heading 2 paragraphs throughout the document.
 *
 * v11 styling notes:
 *   - Typography and palette match the PWA's "Glacier Lab" design system
 *     (see src/lib/progress/export-docx.ts for the reference).
 *   - Keep-together hints are applied so headings stay with their
 *     following paragraph, paragraphs do not split across pages, and
 *     table rows are not torn across page breaks.
 *   - Underscore-only filler text inside table cells is stripped because
 *     the cell border already indicates a writeable area.
 *   - <Diagram fig="LX.Y" /> references are embedded as actual images
 *     (SVGs are rasterised to PNG via @resvg/resvg-js; PNGs and JPGs are
 *     embedded directly).
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  LevelFormat,
  TableOfContents,
  StyleLevel,
  convertMillimetersToTwip,
  Footer,
  PageNumber,
} from "docx";
import { Resvg } from "@resvg/resvg-js";
// image-size v2+ uses a named export `imageSize`; v1 uses a default export.
// Try the named export first, then fall back to the default.
import * as imageSizeMod from "image-size";
const imageSize =
  imageSizeMod.imageSize || imageSizeMod.default || imageSizeMod;

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const VELITE_DIR = path.join(PROJECT_ROOT, ".velite");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
const TARGET = path.join(
  PROJECT_ROOT,
  "Alpine_Map_Training_Companion_Manual_v11.docx",
);

// ---------------------------------------------------------------------------
// Glacier Lab palette (must match the PWA)
// ---------------------------------------------------------------------------

const COLOR_INK = "0E1A2E";      // body, headings
const COLOR_INK_2 = "2A3A55";    // secondary text / H4
const COLOR_INK_3 = "5A6B85";    // eyebrow, muted caption
const COLOR_RULE = "C8D0DB";     // thin separator
const COLOR_ICE = "2480B5";      // blockquote left bar (reserved for future blockquote handler)
void COLOR_ICE;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

// A4 portrait in twips (1 twip = 1/1440 inch; A4 = 210 x 297 mm)
const A4_WIDTH_TWIP = convertMillimetersToTwip(210);
const A4_HEIGHT_TWIP = convertMillimetersToTwip(297);
const MARGIN_TOP = convertMillimetersToTwip(20);
const MARGIN_BOTTOM = convertMillimetersToTwip(20);
const MARGIN_LEFT = convertMillimetersToTwip(25);
const MARGIN_RIGHT = convertMillimetersToTwip(25);

// Font sizes in docx are in half-points: 22 = 11pt body, etc.
const FONT = "Calibri";
const SIZE_BODY = 22; // 11pt
const SIZE_H1 = 48;   // 24pt — Level title
const SIZE_H2 = 36;   // 18pt — Page title
const SIZE_H3 = 28;   // 14pt — Section heading (Exercise N, Self-check)
const SIZE_H4 = 24;   // 12pt
const SIZE_EYEBROW = 18; // 9pt — eyebrow above page title
const SIZE_CAPTION = 18; // 9pt italic caption under images

// Line spacing — 1.4 leading => 22 (body half-point) * 1.4 * 10 in line-rule
// docx spacing.line is measured in 1/20pt (twips). 1.4 * body 11pt = 15.4pt = 308.
const LINE_BODY = 308;

// ---------------------------------------------------------------------------
// Image cache — read each image file once even if referenced from many pages
// ---------------------------------------------------------------------------

const imageCache = new Map();

async function loadDiagramImage(svgUrl) {
  // svgUrl is public-rooted, e.g. "/diagrams/L1/9-map-anatomy-annotated.svg"
  if (imageCache.has(svgUrl)) return imageCache.get(svgUrl);
  const abs = path.join(PUBLIC_DIR, svgUrl.replace(/^\//, ""));
  const ext = path.extname(abs).toLowerCase();
  let buf;
  try {
    buf = await fs.readFile(abs);
  } catch (err) {
    const result = { error: `Cannot read ${abs}: ${err.message}` };
    imageCache.set(svgUrl, result);
    return result;
  }

  let pngBuffer;
  let type;
  let width;
  let height;

  if (ext === ".svg") {
    try {
      const renderer = new Resvg(buf, {
        fitTo: { mode: "width", value: 1200 },
        font: { loadSystemFonts: false },
      });
      const rendered = renderer.render();
      pngBuffer = rendered.asPng();
      width = rendered.width;
      height = rendered.height;
      type = "png";
    } catch (err) {
      const result = { error: `Resvg failed for ${abs}: ${err.message}` };
      imageCache.set(svgUrl, result);
      return result;
    }
  } else if (ext === ".png") {
    pngBuffer = buf;
    type = "png";
    try {
      const dim = imageSize(buf);
      width = dim.width;
      height = dim.height;
    } catch {
      width = 1200;
      height = 800;
    }
  } else if (ext === ".jpg" || ext === ".jpeg") {
    pngBuffer = buf;
    type = "jpg";
    try {
      const dim = imageSize(buf);
      width = dim.width;
      height = dim.height;
    } catch {
      width = 1200;
      height = 800;
    }
  } else {
    const result = { error: `Unsupported image extension: ${ext}` };
    imageCache.set(svgUrl, result);
    return result;
  }

  const result = { data: pngBuffer, type, width, height };
  imageCache.set(svgUrl, result);
  return result;
}

/**
 * Given intrinsic (width,height) in px, fit into a max box of
 * MAX_WIDTH x MAX_HEIGHT and return docx transformation pixels.
 */
function fitImage(width, height) {
  // docx ImageRun transformation is in pixels at 96 DPI. With a 25 mm side
  // margin on A4, the printable width is 160 mm ~= 605 px. Cap a little
  // smaller (~ 16 cm = 605 px) for breathing room.
  const MAX_W = 600;   // ~ 16 cm
  const MAX_H = 760;   // ~ 20 cm
  if (!width || !height) return { width: MAX_W, height: Math.round(MAX_W * 0.66) };
  const scale = Math.min(MAX_W / width, MAX_H / height, 1);
  return {
    width: Math.max(80, Math.round(width * scale)),
    height: Math.max(60, Math.round(height * scale)),
  };
}

// ---------------------------------------------------------------------------
// Load velite data
// ---------------------------------------------------------------------------

async function readJson(file) {
  const buf = await fs.readFile(path.join(VELITE_DIR, file), "utf8");
  return JSON.parse(buf);
}

// ---------------------------------------------------------------------------
// Underscore-filler stripping for table cells
// ---------------------------------------------------------------------------

/**
 * If a cell contains ONLY underscores and whitespace, return "".
 * If a cell has text + trailing underscores (e.g. "Map 1: ______"), trim
 * the trailing underscores but keep the leading text. Otherwise return
 * the raw cell text unchanged.
 */
function cleanTableCellText(s) {
  if (/^[_\s]+$/.test(s)) return "";
  const m = s.match(/^(.*?)\s*_{4,}\s*$/);
  if (m) return m[1].trim();
  return s;
}

// ---------------------------------------------------------------------------
// Inline parser — turn a string into TextRun[] honouring **bold**, *italic*,
// _italic_. We keep underscore RUNS of 4+ as literal underscores (they are
// answer slots for paper use) — they do NOT count as italic markers.
// ---------------------------------------------------------------------------

function inlineRuns(text, baseProps = {}) {
  const segments = [];
  let buf = "";
  let i = 0;
  const flush = () => {
    if (buf.length > 0) {
      segments.push({ text: buf });
      buf = "";
    }
  };
  while (i < text.length) {
    // Skip past underscore runs of 4+ as literal characters
    if (text[i] === "_") {
      // Count consecutive underscores
      let j = i;
      while (j < text.length && text[j] === "_") j += 1;
      const runLen = j - i;
      if (runLen >= 4) {
        buf += text.slice(i, j);
        i = j;
        continue;
      }
      // Otherwise try to treat as italic delimiter
      const end = text.indexOf("_", i + 1);
      if (end > i + 1 && end - i > 1) {
        flush();
        segments.push({ text: text.slice(i + 1, end), italic: true });
        i = end + 1;
        continue;
      }
      // Single stray underscore — keep literal
      buf += text[i];
      i += 1;
      continue;
    }
    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end > i + 2) {
        flush();
        segments.push({ text: text.slice(i + 2, end), bold: true });
        i = end + 2;
        continue;
      }
    }
    if (text[i] === "*") {
      const end = text.indexOf("*", i + 1);
      if (end > i + 1 && text[end + 1] !== "*") {
        flush();
        segments.push({ text: text.slice(i + 1, end), italic: true });
        i = end + 1;
        continue;
      }
    }
    buf += text[i];
    i += 1;
  }
  flush();

  if (segments.length === 0) {
    return [new TextRun({ text: "", ...baseProps })];
  }
  return segments.map(
    (seg) =>
      new TextRun({
        text: seg.text,
        bold: seg.bold,
        italics: seg.italic,
        ...baseProps,
      }),
  );
}

// ---------------------------------------------------------------------------
// Pre-process rawBody: strip MDX-only constructs we don't want to render,
// replace <Diagram fig="..." /> with a placeholder marker line we can detect
// in the line loop. Returns a string ready for line-by-line parsing.
// ---------------------------------------------------------------------------

function preprocessRawBody(rawBody) {
  let text = rawBody;

  // 1. Replace <Diagram fig="LX.Y" /> (and variations) with a marker line.
  //    The fig token is enough to look up the image later.
  text = text.replace(
    /<Diagram\s+fig=["']([^"']+)["']\s*\/>/g,
    (_, fig) => `\n@@DIAGRAM@@${fig}@@\n`,
  );

  // 2. Strip any other JSX components (AnswerSlot, ExerciseField, SketchSlot,
  //    etc.) — they're only meaningful in the PWA.
  text = text.replace(/<[A-Z][A-Za-z0-9]*(\s[^>]*)?\/>/g, "");
  text = text.replace(/<[A-Z][A-Za-z0-9]*(\s[^>]*)?>[\s\S]*?<\/[A-Z][A-Za-z0-9]*>/g, "");

  // 3. Strip HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  return text;
}

// ---------------------------------------------------------------------------
// Markdown → docx converter
//
// Supported subset:
//   ### Heading            → Heading 3
//   #### Heading           → Heading 4
//   - item                 → bullet
//   1. item                → numbered
//   | a | b |              → table (with header row in bold)
//   ---                    → horizontal rule
//   blank line             → paragraph break
//   **bold** *italic*      → inline
//   @@DIAGRAM@@fig         → embedded image + caption
// ---------------------------------------------------------------------------

async function convertMarkdownToBlocks(md, diagramLookup, missingDiagrams) {
  const out = [];
  const lines = md.split(/\r?\n/);
  let i = 0;

  const isBlank = (s) => s.trim() === "";

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.replace(/\s+$/, "");

    // Blank line — emit nothing (paragraphs handle their own spacing)
    if (isBlank(line)) {
      i += 1;
      continue;
    }

    // Diagram placeholder — embed actual image
    const dgMatch = line.match(/^@@DIAGRAM@@(.+?)@@$/);
    if (dgMatch) {
      const fig = dgMatch[1];
      const dg = diagramLookup(fig);
      if (!dg || !dg.svgUrl) {
        missingDiagrams.push(fig);
        out.push(
          new Paragraph({
            spacing: { before: 120, after: 120 },
            alignment: AlignmentType.CENTER,
            keepLines: true,
            children: [
              new TextRun({
                text: `[Figure ${fig} — image not found]`,
                italics: true,
                color: COLOR_INK_3,
                font: FONT,
              }),
            ],
          }),
        );
      } else {
        const img = await loadDiagramImage(dg.svgUrl);
        if (img.error) {
          missingDiagrams.push(`${fig}: ${img.error}`);
          out.push(
            new Paragraph({
              spacing: { before: 120, after: 120 },
              alignment: AlignmentType.CENTER,
              keepLines: true,
              children: [
                new TextRun({
                  text: `[Figure ${fig} — ${dg.title} (image unavailable)]`,
                  italics: true,
                  color: COLOR_INK_3,
                  font: FONT,
                }),
              ],
            }),
          );
        } else {
          const dims = fitImage(img.width, img.height);
          out.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 80 },
              keepLines: true,
              keepNext: true,
              children: [
                new ImageRun({
                  data: img.data,
                  transformation: { width: dims.width, height: dims.height },
                  type: img.type,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 200 },
              keepLines: true,
              children: [
                new TextRun({
                  text: `Fig. ${fig} - ${dg.title}`,
                  italics: true,
                  size: SIZE_CAPTION,
                  color: COLOR_INK_3,
                  font: FONT,
                }),
              ],
            }),
          );
        }
      }
      i += 1;
      continue;
    }

    // Horizontal rule
    if (line === "---") {
      out.push(
        new Paragraph({
          spacing: { before: 120, after: 180 },
          keepLines: true,
          border: {
            bottom: {
              color: COLOR_RULE,
              size: 6,
              style: BorderStyle.SINGLE,
              space: 1,
            },
          },
          children: [new TextRun("")],
        }),
      );
      i += 1;
      continue;
    }

    // Heading 2 (## …) — a few pages (LevelCheck quizzes) use ## inside
    // their body. Render as Heading 3 so we don't pollute the TOC, which
    // is built from doc-level Heading 1 / Heading 2.
    if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      out.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 280, after: 120 },
          keepNext: true,
          keepLines: true,
          children: [
            new TextRun({ text, bold: true, size: SIZE_H3, font: FONT, color: COLOR_INK }),
          ],
        }),
      );
      i += 1;
      continue;
    }

    // Heading 3 (### …)
    if (line.startsWith("### ")) {
      const text = line.slice(4).trim();
      out.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 280, after: 120 },
          keepNext: true,
          keepLines: true,
          children: [
            new TextRun({ text, bold: true, size: SIZE_H3, font: FONT, color: COLOR_INK }),
          ],
        }),
      );
      i += 1;
      continue;
    }

    // Heading 4+ (defensive — Velite content typically only goes to ###)
    if (line.startsWith("#### ")) {
      const text = line.slice(5).trim();
      out.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 220, after: 100 },
          keepNext: true,
          keepLines: true,
          children: [new TextRun({ text, bold: true, size: SIZE_H4, font: FONT, color: COLOR_INK_2 })],
        }),
      );
      i += 1;
      continue;
    }

    // Table detect: a `|...|` line followed by a separator line `|---|---|`
    if (line.startsWith("|") && i + 1 < lines.length) {
      const sep = lines[i + 1].trim();
      if (/^\|[\s\-:|]+\|$/.test(sep) && sep.includes("---")) {
        // Collect all table rows
        const tableLines = [line];
        let k = i + 2;
        while (k < lines.length && lines[k].trim().startsWith("|")) {
          tableLines.push(lines[k]);
          k += 1;
        }
        out.push(buildTable(tableLines));
        i = k;
        continue;
      }
    }

    // Bullet list
    if (/^[-*]\s+/.test(line)) {
      // Collect contiguous bullets (including indented continuations)
      while (i < lines.length) {
        const r = lines[i];
        if (isBlank(r)) {
          // peek — does the next non-blank continue the list?
          let p = i + 1;
          while (p < lines.length && isBlank(lines[p])) p += 1;
          if (p < lines.length && /^[-*]\s+/.test(lines[p])) {
            i = p;
            continue;
          }
          break;
        }
        const m = r.match(/^[-*]\s+(.*)$/);
        if (!m) break;
        // Handle task-list checkbox: `- [ ] text` or `- [x] text`
        let bodyText = m[1];
        let prefix = "";
        const tl = bodyText.match(/^\[([ xX])\]\s+(.*)$/);
        if (tl) {
          prefix = tl[1].trim().toLowerCase() === "x" ? "[x] " : "[ ] ";
          bodyText = tl[2];
        }
        out.push(
          new Paragraph({
            numbering: { reference: "manual-bullets", level: 0 },
            spacing: { before: 40, after: 40, line: LINE_BODY },
            keepLines: true,
            children: [
              ...(prefix
                ? [new TextRun({ text: prefix, font: FONT })]
                : []),
              ...inlineRuns(bodyText, { font: FONT }),
            ],
          }),
        );
        i += 1;
      }
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      while (i < lines.length) {
        const r = lines[i];
        if (isBlank(r)) {
          let p = i + 1;
          while (p < lines.length && isBlank(lines[p])) p += 1;
          if (p < lines.length && /^\d+\.\s+/.test(lines[p])) {
            i = p;
            continue;
          }
          break;
        }
        const m = r.match(/^\d+\.\s+(.*)$/);
        if (!m) break;
        out.push(
          new Paragraph({
            numbering: { reference: "manual-numbers", level: 0 },
            spacing: { before: 40, after: 40, line: LINE_BODY },
            keepLines: true,
            children: inlineRuns(m[1], { font: FONT }),
          }),
        );
        i += 1;
        // Skip indented continuation lines that belong to this item.
        while (
          i < lines.length &&
          lines[i].startsWith("   ") &&
          !isBlank(lines[i])
        ) {
          // emit as a continuation paragraph indented to match the bullet
          const cont = lines[i].trim();
          out.push(
            new Paragraph({
              indent: { left: convertMillimetersToTwip(12) },
              spacing: { before: 20, after: 40, line: LINE_BODY },
              keepLines: true,
              children: inlineRuns(cont, { font: FONT }),
            }),
          );
          i += 1;
        }
      }
      continue;
    }

    // Plain paragraph. Handle markdown soft breaks (trailing two spaces).
    // Velite pages often use them inside answer-slot blocks so multiple
    // underscore lines stack vertically.
    const isSoftBreak = raw.endsWith("  ");
    out.push(
      new Paragraph({
        spacing: { before: 60, after: 100, line: LINE_BODY },
        keepLines: true,
        children: inlineRuns(line, { font: FONT }),
      }),
    );
    i += 1;
    // (Soft breaks are emitted as separate paragraphs above; close enough
    // for paper output — preserves the visual stacking of underscore lines.)
    void isSoftBreak;
  }

  return out;
}

// ---------------------------------------------------------------------------
// Table builder. Header row in bold; all cells get single-line borders.
// ---------------------------------------------------------------------------

function buildTable(tableLines) {
  // Strip leading/trailing | then split on |
  const rows = tableLines.map((l) =>
    l
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim()),
  );
  const header = rows[0];
  const body = rows.slice(1);

  const border = {
    top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_RULE },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_RULE },
    left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_RULE },
    right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_RULE },
  };

  const makeCell = (text, opts = {}) =>
    new TableCell({
      borders: border,
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      children: [
        new Paragraph({
          spacing: { before: 20, after: 20 },
          keepLines: true,
          children: inlineRuns(text, { font: FONT, ...opts }),
        }),
      ],
    });

  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: header.map((c) => makeCell(cleanTableCellText(c), { bold: true })),
  });
  const bodyRows = body.map(
    (cells) =>
      new TableRow({
        cantSplit: true,
        children: cells.map((c) => makeCell(cleanTableCellText(c))),
      }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
  });
}

// ---------------------------------------------------------------------------
// Heading + page-break helpers (use the Heading1/Heading2 paragraph styles)
// ---------------------------------------------------------------------------

let pageBreakCounter = 0;

function heading1(text, { pageBreakBefore = true } = {}) {
  if (pageBreakBefore) pageBreakCounter += 1;
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 240 },
    keepNext: true,
    keepLines: true,
    pageBreakBefore,
    children: [
      new TextRun({ text, bold: true, size: SIZE_H1, font: FONT, color: COLOR_INK }),
    ],
  });
}

function heading2(text, eyebrow, { pageBreakBefore = true } = {}) {
  if (pageBreakBefore) pageBreakCounter += 1;
  const out = [];
  if (eyebrow) {
    // Eyebrow paragraph: tight letter-spacing-ish wide caps in ink-3
    out.push(
      new Paragraph({
        spacing: { before: 0, after: 80 },
        keepNext: true,
        keepLines: true,
        pageBreakBefore,
        children: [
          new TextRun({
            text: eyebrow.toUpperCase(),
            size: SIZE_EYEBROW,
            font: FONT,
            color: COLOR_INK_3,
            characterSpacing: 40, // ~ 2pt tracking
          }),
        ],
      }),
    );
  }
  out.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: eyebrow ? 0 : 360, after: 160 },
      keepNext: true,
      keepLines: true,
      // If eyebrow already provided the page break, don't add it again
      pageBreakBefore: eyebrow ? false : pageBreakBefore,
      children: [
        new TextRun({ text, bold: true, size: SIZE_H2, font: FONT, color: COLOR_INK }),
      ],
    }),
  );
  return out;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const [pages, answerKeys, diagrams] = await Promise.all([
    readJson("pages.json"),
    readJson("answerKeys.json"),
    readJson("diagrams.json"),
  ]);

  // Diagram lookup by `LX.Y` reference. The MDX <Diagram fig="L1.7" />
  // matches a diagram with level=1 and number=7 (ignoring sub).
  const diagramLookup = (fig) => {
    const m = fig.match(/^L(\d+)\.(\d+)([a-z]*)$/i);
    if (!m) return undefined;
    const level = Number(m[1]);
    const number = Number(m[2]);
    const sub = (m[3] || "").toLowerCase();
    return diagrams.find(
      (d) =>
        d.level === level && d.number === number && (d.sub || "") === sub,
    );
  };

  // Level titles — pulled from PerformOS naming. (Could also be inferred
  // from the level-index pages, but those are not in pages.json as a
  // distinct collection.)
  const LEVEL_TITLES = {
    1: "Map literacy",
    2: "Map and compass — applied skills",
    3: "Mountain navigation in real terrain",
  };

  // Sort helpers
  const sortByOrder = (a, b) => a.order - b.order;

  // Group pages by level
  const pagesByLevel = new Map();
  for (const p of pages) {
    if (!pagesByLevel.has(p.level)) pagesByLevel.set(p.level, []);
    pagesByLevel.get(p.level).push(p);
  }
  for (const arr of pagesByLevel.values()) arr.sort(sortByOrder);

  // Group answer keys by pageId so we can match them in lookup
  const akByPageId = new Map();
  for (const ak of answerKeys) {
    const key = ak.pageId || ak.id;
    akByPageId.set(key, ak);
  }

  // Collect warnings to report at the end
  const warnings = {
    pagesMissingRawBody: [],
    pagesMissingAk: [],
    akMissingPage: [],
    missingDiagrams: [],
  };

  // -----------------------------------------------------------------
  // Build the children list
  // -----------------------------------------------------------------

  const children = [];

  // Title page (centred)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 3600, after: 240 },
      children: [
        new TextRun({
          text: "Alpine Map Training",
          bold: true,
          size: 96, // 48pt
          font: FONT,
          color: COLOR_INK,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 },
      children: [
        new TextRun({
          text: "Companion Manual",
          size: 48, // 24pt
          font: FONT,
          color: COLOR_INK_2,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 360, after: 0 },
      children: [
        new TextRun({ text: "Version 11", size: 28, font: FONT, color: COLOR_INK_3 }),
      ],
    }),
    // Push the byline towards the bottom of the title page
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 8000, after: 0 },
      children: [
        new TextRun({
          text: "By PerformOS",
          size: 28,
          italics: true,
          color: COLOR_INK_3,
          font: FONT,
        }),
      ],
    }),
  );

  // TOC heading + table of contents field (page break embedded in H1)
  children.push(heading1("Contents"));
  children.push(
    new TableOfContents("Companion manual contents", {
      hyperlink: true,
      headingStyleRange: "1-2",
      stylesWithLevels: [
        new StyleLevel("Heading1", 1),
        new StyleLevel("Heading2", 2),
      ],
    }),
  );

  // -----------------------------------------------------------------
  // Level sections
  // -----------------------------------------------------------------

  const levels = [...pagesByLevel.keys()].filter((l) => l >= 1 && l <= 3).sort();

  for (const level of levels) {
    const lvlPages = pagesByLevel.get(level);
    const title = LEVEL_TITLES[level] || `Level ${level}`;

    children.push(heading1(`Level ${level} — ${title}`));

    for (const page of lvlPages) {
      // Eyebrow + page heading (page-break baked into eyebrow)
      const eyebrow = `Level ${level} · ${LEVEL_TITLES[level] || ""} · Page ${page.page}`;
      children.push(...heading2(`${page.page} — ${page.title}`, eyebrow));

      const rawBody = page.rawBody;
      if (!rawBody || !rawBody.trim()) {
        warnings.pagesMissingRawBody.push(page.id);
        children.push(
          new Paragraph({
            keepLines: true,
            children: [
              new TextRun({
                text: "(No content available for this page.)",
                italics: true,
                color: COLOR_INK_3,
                font: FONT,
              }),
            ],
          }),
        );
        continue;
      }

      const pre = preprocessRawBody(rawBody);
      const blocks = await convertMarkdownToBlocks(pre, diagramLookup, warnings.missingDiagrams);
      children.push(...blocks);
    }
  }

  // -----------------------------------------------------------------
  // Appendix — Answer Keys
  // -----------------------------------------------------------------

  children.push(heading1("Appendix — Answer Keys"));

  for (const level of levels) {
    const lvlPages = pagesByLevel.get(level);
    for (const page of lvlPages) {
      const ak = akByPageId.get(page.id);
      if (!ak) {
        // Many pages won't have answer keys (e.g. reflection-only pages).
        // Only warn for pages that have exercises but no key.
        if (page.exerciseCount > 0) {
          warnings.pagesMissingAk.push(page.id);
        }
        continue;
      }
      const eyebrow = `Answer Key · Level ${level} · Page ${page.page}`;
      children.push(...heading2(`${page.page} — Answer Key`, eyebrow));
      const rawBody = ak.rawBody;
      if (!rawBody || !rawBody.trim()) {
        children.push(
          new Paragraph({
            keepLines: true,
            children: [
              new TextRun({
                text: "(No answer key content available.)",
                italics: true,
                color: COLOR_INK_3,
                font: FONT,
              }),
            ],
          }),
        );
        continue;
      }
      const pre = preprocessRawBody(rawBody);
      const blocks = await convertMarkdownToBlocks(pre, diagramLookup, warnings.missingDiagrams);
      children.push(...blocks);
    }
  }

  // Answer keys that don't match any page (file-level marking-guide records,
  // for example, may have pageId undefined)
  for (const ak of answerKeys) {
    if (!ak.pageId) continue;
    if (!pages.some((p) => p.id === ak.pageId)) {
      warnings.akMissingPage.push(ak.id);
    }
  }

  // -----------------------------------------------------------------
  // Assemble Document
  // -----------------------------------------------------------------

  const doc = new Document({
    creator: "Alpine Map Training",
    title: "Alpine Map Training — Companion Manual v11",
    description: "Companion manual for the Alpine Map Training programme",
    features: { updateFields: true },
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE_BODY, color: COLOR_INK },
          paragraph: { spacing: { line: LINE_BODY } },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: SIZE_H1, bold: true, font: FONT, color: COLOR_INK },
          paragraph: {
            spacing: { before: 480, after: 240 },
            outlineLevel: 0,
            border: {
              bottom: {
                color: COLOR_INK,
                size: 12,
                style: BorderStyle.SINGLE,
                space: 8,
              },
            },
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: SIZE_H2, bold: true, font: FONT, color: COLOR_INK },
          paragraph: {
            spacing: { before: 360, after: 160 },
            outlineLevel: 1,
            border: {
              bottom: {
                color: COLOR_RULE,
                size: 6,
                style: BorderStyle.SINGLE,
                space: 6,
              },
            },
          },
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: SIZE_H3, bold: true, font: FONT, color: COLOR_INK },
          paragraph: {
            spacing: { before: 280, after: 120 },
            outlineLevel: 2,
          },
        },
        {
          id: "Heading4",
          name: "Heading 4",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: SIZE_H4, bold: true, font: FONT, color: COLOR_INK_2 },
          paragraph: {
            spacing: { before: 220, after: 100 },
            outlineLevel: 3,
          },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "manual-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 360 },
                },
              },
            },
          ],
        },
        {
          reference: "manual-numbers",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 360 },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: A4_WIDTH_TWIP, height: A4_HEIGHT_TWIP },
            margin: {
              top: MARGIN_TOP,
              right: MARGIN_RIGHT,
              bottom: MARGIN_BOTTOM,
              left: MARGIN_LEFT,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "Page ",
                    font: FONT,
                    size: 18,
                    color: COLOR_INK_3,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT,
                    size: 18,
                    color: COLOR_INK_3,
                  }),
                  new TextRun({
                    text: " of ",
                    font: FONT,
                    size: 18,
                    color: COLOR_INK_3,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: FONT,
                    size: 18,
                    color: COLOR_INK_3,
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  // -----------------------------------------------------------------
  // Pack & write
  // -----------------------------------------------------------------

  const buf = await Packer.toBuffer(doc);
  await fs.writeFile(TARGET, buf);

  // Image cache stats
  let imagesEmbedded = 0;
  let imagesFailed = 0;
  for (const entry of imageCache.values()) {
    if (entry.error) imagesFailed += 1;
    else imagesEmbedded += 1;
  }

  // Real page count is computed by Word during layout. The page-break
  // count below is a lower bound — each printed page typically spans
  // multiple physical pages once Word reflows.
  console.log(`Wrote ${TARGET}`);
  console.log(`  Size:           ${(buf.length / 1024).toFixed(1)} KB`);
  console.log(`  Lesson pages:   ${pages.length}`);
  console.log(`  Answer keys:    ${answerKeys.length}`);
  console.log(`  Page breaks:    ${pageBreakCounter}`);
  console.log(`  Images cached:  ${imagesEmbedded} embedded, ${imagesFailed} failed`);
  console.log(
    `  Approx printed pages (lower bound): ~${pageBreakCounter + 1} sections (Word will reflow longer pages to multiple sheets — typical real total ~${Math.round((pageBreakCounter + 1) * 1.4)}+)`,
  );

  if (warnings.pagesMissingRawBody.length > 0) {
    console.warn(
      `\n[warn] Pages missing rawBody (${warnings.pagesMissingRawBody.length}):`,
    );
    for (const id of warnings.pagesMissingRawBody) console.warn(`   - ${id}`);
  }
  if (warnings.pagesMissingAk.length > 0) {
    console.warn(
      `\n[note] Pages with exercises but no answer key (${warnings.pagesMissingAk.length}):`,
    );
    for (const id of warnings.pagesMissingAk) console.warn(`   - ${id}`);
  }
  if (warnings.akMissingPage.length > 0) {
    console.warn(
      `\n[warn] Answer keys with no matching page (${warnings.akMissingPage.length}):`,
    );
    for (const id of warnings.akMissingPage) console.warn(`   - ${id}`);
  }
  if (warnings.missingDiagrams.length > 0) {
    console.warn(
      `\n[warn] Diagram references that could not be embedded (${warnings.missingDiagrams.length}):`,
    );
    for (const msg of warnings.missingDiagrams) console.warn(`   - ${msg}`);
  }

  console.log(
    "\nReminder: open the .docx in Word and press F9 (or accept the\n" +
      "update-fields prompt) to populate the Table of Contents.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
