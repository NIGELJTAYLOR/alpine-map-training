"use client";

/**
 * DOCX renderer for the progress export.
 *
 * `buildProgressDocx(store, ctx)` turns the same Markdown that powers the
 * .md / .html / .pdf exports into a Word-compatible .docx Blob. Trainers
 * can open it in Word, add comments, and use tracked changes for feedback.
 *
 * The `docx` library (~1.5 MB) is lazily loaded via dynamic import so it
 * doesn't bloat the initial Progress page bundle. Cost is paid only when
 * the user actually clicks "Download .docx".
 *
 * Same Markdown subset is supported as the HTML renderer:
 *   - H1 / H2 / H3 / H4
 *   - Bullet lists (- ) with two-space indented sub-bullets
 *   - Blockquotes (> ) including multi-line
 *   - Horizontal rules (---)
 *   - Inline emphasis: **bold**, *italic*, _italic_
 *   - Trailing two-space soft breaks
 *
 * Glacier Lab palette is encoded in the heading styles so the trainer
 * report looks consistent across all four export formats.
 */

import type { ProgressStore } from "./types";
import {
  buildExportFilename,
  buildProgressMarkdown,
  type ExportContext,
} from "./export";

// ---------------------------------------------------------------- inline

interface InlineSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

/**
 * Tokenise a string into runs of bold/italic/plain text. Order of checks
 * matters: ** must be matched before single *.
 */
function parseInline(s: string): InlineSegment[] {
  const out: InlineSegment[] = [];
  let i = 0;
  let buf = "";
  function flush() {
    if (buf.length > 0) {
      out.push({ text: buf });
      buf = "";
    }
  }
  while (i < s.length) {
    if (s.startsWith("**", i)) {
      const end = s.indexOf("**", i + 2);
      if (end > i + 2) {
        flush();
        out.push({ text: s.slice(i + 2, end), bold: true });
        i = end + 2;
        continue;
      }
    }
    if (s[i] === "*") {
      const end = s.indexOf("*", i + 1);
      // Avoid matching ** by checking the char after the close
      if (end > i + 1 && s[end + 1] !== "*") {
        flush();
        out.push({ text: s.slice(i + 1, end), italic: true });
        i = end + 1;
        continue;
      }
    }
    if (s[i] === "_") {
      const end = s.indexOf("_", i + 1);
      if (end > i + 1) {
        flush();
        out.push({ text: s.slice(i + 1, end), italic: true });
        i = end + 1;
        continue;
      }
    }
    buf += s[i];
    i += 1;
  }
  flush();
  return out;
}

// ---------------------------------------------------------------- builder

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Build a Word-compatible .docx Blob from the candidate's progress.
 *
 * Async because the docx library is dynamically imported. Throws if the
 * library fails to load — the caller is expected to surface this clearly
 * in the UI (the Export block does).
 */
export async function buildProgressDocx(
  store: ProgressStore,
  ctx: ExportContext,
  now: Date = new Date(),
): Promise<Blob> {
  const md = buildProgressMarkdown(store, ctx, now);

  // Lazy-load to keep the docx bundle out of the initial page weight.
  const dx = await import("docx");
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    BorderStyle,
    AlignmentType,
    LevelFormat,
    convertInchesToTwip,
  } = dx;

  // ---- Inline run builder
  function buildRuns(text: string, baseProps: Record<string, unknown> = {}) {
    return parseInline(text).map(
      (seg) =>
        new TextRun({
          text: seg.text,
          bold: seg.bold,
          italics: seg.italic,
          ...baseProps,
        } as any),
    );
  }

  // ---- Convert each markdown line into zero or more docx Paragraphs
  const children: any[] = [];
  const lines = md.split("\n");
  let blockquoteLines: string[] = [];

  function flushBlockquote() {
    if (blockquoteLines.length === 0) return;
    const runs: any[] = [];
    blockquoteLines.forEach((line, idx) => {
      const segs = parseInline(line);
      for (const seg of segs) {
        runs.push(
          new TextRun({
            text: seg.text,
            italics: true,
            bold: seg.bold,
            color: "0E1A2E",
          } as any),
        );
      }
      if (idx < blockquoteLines.length - 1) {
        runs.push(new TextRun({ text: "", break: 1 } as any));
      }
    });
    children.push(
      new Paragraph({
        children: runs,
        indent: { left: convertInchesToTwip(0.3) },
        border: {
          left: {
            color: "2480B5",
            size: 18,
            style: BorderStyle.SINGLE,
            space: 12,
          },
        },
        spacing: { before: 80, after: 200 },
      } as any),
    );
    blockquoteLines = [];
  }

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");

    // Empty line — paragraph / blockquote break
    if (line.length === 0) {
      flushBlockquote();
      continue;
    }

    // Horizontal rule — render as an empty paragraph with a bottom border
    if (line === "---") {
      flushBlockquote();
      children.push(
        new Paragraph({
          children: [],
          border: {
            bottom: {
              color: "C8D0DB",
              size: 6,
              style: BorderStyle.SINGLE,
              space: 8,
            },
          },
          spacing: { before: 120, after: 180 },
        } as any),
      );
      continue;
    }

    // Heading
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushBlockquote();
      const level = heading[1].length;
      const headingLevels = [
        HeadingLevel.HEADING_1,
        HeadingLevel.HEADING_2,
        HeadingLevel.HEADING_3,
        HeadingLevel.HEADING_4,
      ];
      children.push(
        new Paragraph({
          heading: headingLevels[level - 1],
          children: buildRuns(heading[2]),
          spacing: { before: 280, after: 120 },
        } as any),
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ") || line === ">") {
      blockquoteLines.push(line === ">" ? "" : line.slice(2));
      continue;
    }
    flushBlockquote();

    // Bullet
    const bullet = line.match(/^(\s*)-\s+(.*)$/);
    if (bullet) {
      const indentLen = bullet[1].length;
      const bulletLevel = indentLen >= 2 ? 1 : 0;
      children.push(
        new Paragraph({
          children: buildRuns(bullet[2]),
          numbering: { reference: "default-bullets", level: bulletLevel },
          spacing: { before: 40, after: 40 },
        } as any),
      );
      continue;
    }

    // Plain paragraph
    children.push(
      new Paragraph({
        children: buildRuns(line),
        spacing: { before: 60, after: 100 },
      } as any),
    );
  }
  flushBlockquote();

  // ---- Assemble the document
  const doc = new Document({
    creator: "Alpine Map Training",
    title: "Alpine Map Training — Progress export",
    description: "Trainer progress export",
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 } as any,
        } as any,
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 44, bold: true, color: "0E1A2E", font: "Calibri" },
          paragraph: {
            spacing: { before: 400, after: 200 },
            border: {
              bottom: {
                color: "0E1A2E",
                size: 12,
                style: BorderStyle.SINGLE,
                space: 8,
              },
            },
          },
        } as any,
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 30, bold: true, color: "0E1A2E", font: "Calibri" },
          paragraph: {
            spacing: { before: 360, after: 160 },
            border: {
              bottom: {
                color: "C8D0DB",
                size: 6,
                style: BorderStyle.SINGLE,
                space: 6,
              },
            },
          },
        } as any,
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 26, bold: true, color: "0E1A2E", font: "Calibri" },
          paragraph: { spacing: { before: 260, after: 120 } },
        } as any,
        {
          id: "Heading4",
          name: "Heading 4",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 24, bold: true, color: "2A3A55", font: "Calibri" },
          paragraph: { spacing: { before: 220, after: 100 } },
        } as any,
      ],
    } as any,
    numbering: {
      config: [
        {
          reference: "default-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(0.3),
                    hanging: convertInchesToTwip(0.2),
                  },
                },
              },
            },
            {
              level: 1,
              format: LevelFormat.BULLET,
              text: "◦",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(0.6),
                    hanging: convertInchesToTwip(0.2),
                  },
                },
              },
            },
          ],
        },
      ],
    } as any,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.9),
              right: convertInchesToTwip(0.9),
              bottom: convertInchesToTwip(0.9),
              left: convertInchesToTwip(0.9),
            },
          },
        },
        children,
      } as any,
    ],
  });

  return await Packer.toBlob(doc);
}

/** Filename for the .docx download. Mirrors the .md filename pattern. */
export function buildExportDocxFilename(
  store: ProgressStore,
  now: Date = new Date(),
): string {
  return buildExportFilename(store, now).replace(/\.md$/, ".docx");
}
