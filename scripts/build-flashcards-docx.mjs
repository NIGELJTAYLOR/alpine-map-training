/**
 * One-off generator: read FLASHCARDS_CONTENT.md → produce FLASHCARDS_CONTENT.docx.
 *
 * Run:  node scripts/build-flashcards-docx.mjs
 *
 * Input:  FLASHCARDS_CONTENT.md (project root)
 * Output: FLASHCARDS_CONTENT.docx (project root)
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  LevelFormat,
  AlignmentType,
  BorderStyle,
} from "docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const SOURCE = path.join(PROJECT_ROOT, "FLASHCARDS_CONTENT.md");
const TARGET = path.join(PROJECT_ROOT, "FLASHCARDS_CONTENT.docx");

// ---------------------------------------------------------------------------
// Inline parser: split a string into runs, honouring **bold** segments.
// ---------------------------------------------------------------------------

function inlineRuns(text, baseProps = {}) {
  const runs = [];
  // Match **bold** segments greedily but non-greedily across the asterisks.
  const re = /\*\*(.+?)\*\*/g;
  let cursor = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > cursor) {
      runs.push(new TextRun({ text: text.slice(cursor, m.index), ...baseProps }));
    }
    runs.push(new TextRun({ text: m[1], bold: true, ...baseProps }));
    cursor = m.index + m[0].length;
  }
  if (cursor < text.length) {
    runs.push(new TextRun({ text: text.slice(cursor), ...baseProps }));
  }
  if (runs.length === 0) runs.push(new TextRun({ text: "", ...baseProps }));
  return runs;
}

function paragraph(text, opts = {}) {
  return new Paragraph({ children: inlineRuns(text), ...opts });
}

// ---------------------------------------------------------------------------
// Card-line parser: turn `- **Front:** xxx` into a paragraph with a bold label.
// ---------------------------------------------------------------------------

function fieldParagraph(label, body) {
  // Bold label, then the body in regular weight (with inline bold preserved).
  const labelRun = new TextRun({ text: `${label} `, bold: true });
  return new Paragraph({
    spacing: { before: 80, after: 60 },
    children: [labelRun, ...inlineRuns(body)],
  });
}

// ---------------------------------------------------------------------------
// Top-level converter
// ---------------------------------------------------------------------------

async function main() {
  const md = await fs.readFile(SOURCE, "utf8");
  const lines = md.split(/\r?\n/);
  const out = [];

  // Document title (H1 in markdown is the doc title)
  let i = 0;
  if (lines[i]?.startsWith("# ")) {
    const title = lines[i].slice(2).trim();
    out.push(
      new Paragraph({
        heading: HeadingLevel.TITLE,
        spacing: { after: 240 },
        children: [new TextRun({ text: title, bold: true, size: 40 })],
      }),
    );
    i += 1;
  }

  let skipBlank = false;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // Blank
    if (line === "") {
      if (!skipBlank) {
        out.push(new Paragraph({ children: [new TextRun("")] }));
        skipBlank = true;
      }
      i += 1;
      continue;
    }
    skipBlank = false;

    // HR
    if (line === "---") {
      out.push(
        new Paragraph({
          spacing: { before: 240, after: 240 },
          border: {
            bottom: { color: "999999", size: 6, style: BorderStyle.SINGLE, space: 1 },
          },
          children: [new TextRun("")],
        }),
      );
      i += 1;
      continue;
    }

    // H2 → docx Heading 1 (treating ## as the top section level inside the doc)
    if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      out.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 360, after: 200 },
          children: [new TextRun({ text, bold: true, size: 32 })],
        }),
      );
      i += 1;
      continue;
    }

    // H3 → docx Heading 2 (the per-card heading)
    if (line.startsWith("### ")) {
      const text = line.slice(4).trim();
      out.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 100 },
          children: [new TextRun({ text, bold: true, size: 26 })],
        }),
      );
      i += 1;
      continue;
    }

    // Card field line: `- **Front:** body` etc.
    const fieldMatch = line.match(/^- \*\*([^*:]+):\*\*\s*(.*)$/);
    if (fieldMatch) {
      const [, label, bodyStart] = fieldMatch;
      // Look-ahead: gather any continuation lines (sub-bullets or indented text)
      // that belong to this field.
      let body = bodyStart;
      i += 1;
      while (i < lines.length) {
        const cur = lines[i];
        const t = cur.trim();
        // Sub-bullet inside a field value
        if (cur.startsWith("  - ")) {
          // Emit the field paragraph first (only once, on the first sub-bullet).
          if (body !== null) {
            if (body) {
              out.push(fieldParagraph(`${label}:`, body));
            } else {
              out.push(
                new Paragraph({
                  spacing: { before: 80, after: 40 },
                  children: [new TextRun({ text: `${label}:`, bold: true })],
                }),
              );
            }
            body = null;
          }
          out.push(
            new Paragraph({
              numbering: { reference: "field-bullets", level: 0 },
              children: inlineRuns(t.replace(/^-\s+/, "")),
            }),
          );
          i += 1;
          continue;
        }
        // Continuation line (indented, not a new bullet, not blank)
        if (cur.startsWith("  ") && t !== "") {
          if (body !== null) {
            body = body + " " + t;
            i += 1;
            continue;
          }
        }
        // End of field value
        break;
      }
      // If we exit the loop with body still pending, emit the field paragraph.
      if (body !== null) {
        if (body) {
          out.push(fieldParagraph(`${label}:`, body));
        } else {
          out.push(
            new Paragraph({
              spacing: { before: 80, after: 40 },
              children: [new TextRun({ text: `${label}:`, bold: true })],
            }),
          );
        }
      }
      continue;
    }

    // Plain bullet (top-level)
    if (line.startsWith("- ")) {
      out.push(
        new Paragraph({
          numbering: { reference: "field-bullets", level: 0 },
          children: inlineRuns(line.slice(2)),
        }),
      );
      i += 1;
      continue;
    }

    // Numbered item (1. 2. etc.)
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      out.push(
        new Paragraph({
          numbering: { reference: "field-numbers", level: 0 },
          children: inlineRuns(numMatch[2]),
        }),
      );
      i += 1;
      continue;
    }

    // Default: plain paragraph (preserves inline bold)
    out.push(paragraph(line));
    i += 1;
  }

  const doc = new Document({
    creator: "Alpine Map Training build",
    description: "Flashcard content for review",
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 32, bold: true, font: "Calibri" },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 26, bold: true, font: "Calibri" },
          paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1 },
        },
        {
          id: "Title",
          name: "Title",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 40, bold: true, font: "Calibri" },
          paragraph: { spacing: { after: 280 }, alignment: AlignmentType.LEFT },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "field-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
        {
          reference: "field-numbers",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: out,
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  await fs.writeFile(TARGET, buf);
  console.log(`Wrote ${TARGET} (${(buf.length / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
