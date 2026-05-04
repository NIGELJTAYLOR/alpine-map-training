/**
 * Source-to-MDX migration for the Alpine Map Training workbook.
 *
 * Reads:  C:/Users/mrnig_ndtz4tw/OneDrive - performos.ai/Documents/Alpine_Map_Training/...
 * Writes: <project>/content/{pages,answer-keys,trainer-notes}/L<n>/*.mdx
 *
 * Source content is read-only. We never write back to OneDrive.
 *
 * Run:  node scripts/migrate-content.mjs [level]
 *   level defaults to "1". Use "all" for every defined level.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const CONTENT_DIR = path.join(PROJECT_ROOT, "content");

const SOURCE_ROOT =
  "C:/Users/mrnig_ndtz4tw/OneDrive - performos.ai/Documents/Alpine_Map_Training";

const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");

const DIAGRAMS = {
  2: "08_Schematic_Diagrams/Level_2_Schematic_Diagrams.md",
  3: "08_Schematic_Diagrams/Level_3_Schematic_Diagrams.md",
};

const TEMPLATES_FILE = "08_Schematic_Diagrams/Templates.md";

const LEVELS = {
  1: {
    learner: "02_Workbook_Level_1Learner_Pages",
    answers: "02_Workbook_Level_1Answer_Keys",
    trainer: "07_Trainer_Manual/Level_1",
    sectionPrefixes: ["B1", "B2", "B3", "B4", "B5", "B6"],
  },
  2: {
    learner: "03_Workbook_Level_2/Learner_Pages",
    answers: "03_Workbook_Level_2/Answer_Keys",
    trainer: "07_Trainer_Manual/Level_2",
    sectionPrefixes: ["C1", "C2", "C3", "C4", "C5", "C6", "C7"],
  },
  3: {
    learner: "04_Workbook_Level_3/Learner_Pages",
    answers: "04_Workbook_Level_3/Answer_Keys",
    trainer: "07_Trainer_Manual/Level_3",
    sectionPrefixes: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"],
  },
};

// ---------------------------------------------------------------------------
// Page splitting
// ---------------------------------------------------------------------------

const PAGE_CODE_RE = /^([BCD]\d{1,2}\.\d{1,2})\b/;

/**
 * Split a markdown file into pages at H2 boundaries.
 * Returns [{ heading, body }, ...].
 */
function splitH2(markdown) {
  const lines = markdown.split(/\r?\n/);
  const pages = [];
  let current = null;
  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) pages.push(current);
      current = { heading: line.slice(3).trim(), bodyLines: [] };
    } else if (current) {
      current.bodyLines.push(line);
    }
  }
  if (current) pages.push(current);

  return pages.map((p) => ({
    heading: p.heading,
    body: stripTrailingHrSeparators(p.bodyLines).join("\n").trim(),
  }));
}

/** Remove the `---` horizontal-rule separators that source files use between pages. */
function stripTrailingHrSeparators(lines) {
  // Trim from the end any blank lines + a single `---` line that was used as a
  // page separator in the source.
  const out = [...lines];
  while (out.length && out[out.length - 1].trim() === "") out.pop();
  if (out.length && out[out.length - 1].trim() === "---") out.pop();
  while (out.length && out[out.length - 1].trim() === "") out.pop();
  return out;
}

/**
 * From an H2 heading like "B1.1 Map Purpose and Perspective" or
 * "B1.1 Map Purpose and Perspective — Answer Key" derive { code, title, kind }.
 */
function parsePageHeading(heading) {
  const stripped = heading
    .replace(/\s*[—-]\s*Answer Key\s*$/i, "")
    .trim();
  const codeMatch = stripped.match(PAGE_CODE_RE);
  if (codeMatch) {
    const code = codeMatch[1];
    const title = stripped.slice(code.length).trim() || code;
    return { code, title, kind: "page" };
  }
  if (/^Level \d+ Contents/i.test(stripped)) {
    return { code: "Contents", title: stripped, kind: "contents" };
  }
  if (/^Level \d+ Reflection/i.test(stripped)) {
    return { code: "Reflection", title: stripped, kind: "reflection" };
  }
  if (/^Instructions$/i.test(stripped) || /^Level \d+ Check Quiz/i.test(stripped)) {
    return { code: "LevelCheck", title: stripped, kind: "quiz" };
  }
  // Fallback — treat the whole heading as title with a slugged code.
  return { code: slug(stripped), title: stripped, kind: "page" };
}

function slug(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sectionFromCode(code) {
  const m = code.match(/^([BCD]\d{1,2})/);
  return m ? m[1] : null;
}

// ---------------------------------------------------------------------------
// Section/page metadata extraction from body
// ---------------------------------------------------------------------------

const H3_RE = /^###\s+(.+)$/gm;

function extractMeta(body) {
  const meta = {
    learningAim: undefined,
    exerciseCount: 0,
    selfCheckCount: 0,
    sections: [],
  };

  const sections = splitH3(body);
  for (const sec of sections) {
    meta.sections.push(sec.heading);
    const lower = sec.heading.toLowerCase();
    if (lower === "learning aim") {
      meta.learningAim = sec.body.trim().split(/\r?\n/).slice(0, 4).join(" ").trim();
    }
    if (/^exercise\b/i.test(sec.heading)) {
      meta.exerciseCount += 1;
    }
    if (lower === "self-check" || lower === "completion check") {
      meta.selfCheckCount = (sec.body.match(/^- \[ \]/gm) || []).length;
    }
  }
  return meta;
}

function splitH3(body) {
  const lines = body.split(/\r?\n/);
  const out = [];
  let current = null;
  for (const line of lines) {
    const m = line.match(/^###\s+(.+)$/);
    if (m) {
      if (current) out.push(current);
      current = { heading: m[1].trim(), bodyLines: [] };
    } else if (current) {
      current.bodyLines.push(line);
    }
  }
  if (current) out.push(current);
  return out.map((s) => ({ heading: s.heading, body: s.bodyLines.join("\n").trim() }));
}

// ---------------------------------------------------------------------------
// MDX writing
// ---------------------------------------------------------------------------

function yamlString(s) {
  if (s == null) return "";
  // Quote-and-escape — keep it simple, our values don't contain double quotes much
  return `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function buildFrontMatter(obj) {
  const lines = ["---"];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "number" || typeof v === "boolean") {
      lines.push(`${k}: ${v}`);
    } else if (Array.isArray(v)) {
      if (v.length === 0) {
        lines.push(`${k}: []`);
      } else {
        lines.push(`${k}:`);
        for (const item of v) lines.push(`  - ${yamlString(item)}`);
      }
    } else {
      lines.push(`${k}: ${yamlString(v)}`);
    }
  }
  lines.push("---", "");
  return lines.join("\n");
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function writeMdx(outPath, frontMatter, body) {
  await ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, frontMatter + body.trim() + "\n", "utf8");
}

// ---------------------------------------------------------------------------
// Per-collection processors
// ---------------------------------------------------------------------------

async function listMd(dir) {
  const entries = await fs.readdir(dir);
  return entries.filter((f) => f.endsWith(".md")).sort();
}

async function processLearnerPages(level, sourceDir, outDir) {
  const files = await listMd(sourceDir);
  let written = 0;
  const ids = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(sourceDir, file), "utf8");
    let pages = splitH2(raw);

    // Quiz files (e.g. L1 Level Check Quiz) carry their content under an H1
    // with only sub-section H2s. Treat the whole post-H1 body as one record.
    const hasPageCodedH2 = pages.some((p) => PAGE_CODE_RE.test(p.heading));
    if (pages.length === 0 || (!hasPageCodedH2 && /Check_Quiz/i.test(file))) {
      const titleMatch = raw.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : file;
      const body = raw.replace(/^#\s+.+$/m, "").trim();
      pages = [{ heading: title, body }];
    }

    for (const page of pages) {
      let { code, title, kind } = parsePageHeading(page.heading);
      // Quiz files: prefer the file H1 ("Level 1 Check Quiz") over the H2 ("Instructions").
      if (code === "LevelCheck") {
        const h1 = raw.match(/^#\s+(.+)$/m);
        if (h1) title = h1[1].trim();
      }
      const section = sectionFromCode(code) || code;
      const id = `L${level}.${code}`;
      const meta = extractMeta(page.body);
      const order = canonicalOrder(code, kind);
      const fm = buildFrontMatter({
        id,
        level,
        section,
        page: code,
        title,
        kind,
        order,
        learningAim: meta.learningAim,
        exerciseCount: meta.exerciseCount,
        selfCheckCount: meta.selfCheckCount,
        sourceFile: file,
      });
      const outPath = path.join(outDir, `${code}.mdx`);
      await writeMdx(outPath, fm, page.body);
      written += 1;
      ids.push(id);
    }
  }
  return { written, ids };
}

/**
 * Canonical reading order within a level.
 * Contents → numbered pages (B1.1=101, B6.3=603, etc.) → LevelCheck → Reflection.
 */
function canonicalOrder(code, kind) {
  if (kind === "contents") return 0;
  if (kind === "reflection") return 9999;
  if (kind === "quiz" || code === "LevelCheck") return 9000;
  const m = code.match(/^[BCD](\d+)\.(\d+)/);
  if (m) return parseInt(m[1], 10) * 100 + parseInt(m[2], 10);
  return 5000;
}

async function processAnswerKeys(level, sourceDir, outDir) {
  const files = await listMd(sourceDir);
  let written = 0;
  for (const file of files) {
    const raw = await fs.readFile(path.join(sourceDir, file), "utf8");
    const pages = splitH2(raw);

    // If no H2 in the file is a page code (e.g. Level Check Quiz where the
    // questions live at file level and the only H2 is "Marking guide"),
    // treat the whole post-H1 body as one record.
    const hasPageCodedH2 = pages.some((p) => PAGE_CODE_RE.test(p.heading));
    if (pages.length === 0 || !hasPageCodedH2) {
      const titleMatch = raw.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].replace(/\s*[—-]\s*Answer Key\s*$/i, "").trim() : file;
      const body = raw.replace(/^#\s+.+$/m, "").trim();
      const code = deriveCodeFromFilename(file);
      const section = sectionFromCode(code) || code;
      const id = `L${level}.${code}`;
      const fm = buildFrontMatter({
        id,
        pageId: id,
        level,
        section,
        page: code,
        title,
        kind: code === "LevelCheck" ? "quiz" : "page",
        sourceFile: file,
      });
      await writeMdx(path.join(outDir, `${code}.mdx`), fm, body);
      written += 1;
      continue;
    }

    // Capture file-level "Coaching notes for marking" as a separate marking-guide
    // record so it survives but doesn't shadow the page-level keys.
    const markingNotesIdx = pages.findIndex((p) => /^coaching notes/i.test(p.heading));
    let markingNotes = null;
    let pageList = pages;
    if (markingNotesIdx >= 0) {
      markingNotes = pages[markingNotesIdx];
      pageList = pages.filter((_, i) => i !== markingNotesIdx);
    }

    for (const page of pageList) {
      const { code, title, kind } = parsePageHeading(page.heading);
      const section = sectionFromCode(code) || code;
      const id = `L${level}.${code}`;
      const fm = buildFrontMatter({
        id,
        pageId: id,
        level,
        section,
        page: code,
        title,
        kind,
        sourceFile: file,
      });
      await writeMdx(path.join(outDir, `${code}.mdx`), fm, page.body);
      written += 1;
    }

    if (markingNotes) {
      // File-level marking guidance — write under a per-file slug so we don't collide.
      const slug = file.replace(/\.md$/, "").toLowerCase();
      const id = `L${level}.${slug}.marking`;
      const fm = buildFrontMatter({
        id,
        level,
        title: markingNotes.heading,
        kind: "marking-guide",
        sourceFile: file,
      });
      await writeMdx(path.join(outDir, `${slug}-marking.mdx`), fm, markingNotes.body);
      written += 1;
    }
  }
  return { written };
}

/** Derive a page code from a filename for files that don't carry an H2 heading. */
function deriveCodeFromFilename(filename) {
  if (/Check_Quiz/i.test(filename)) return "LevelCheck";
  if (/Contents/i.test(filename)) return "Contents";
  if (/Reflection/i.test(filename)) return "Reflection";
  // Fall back to a slug of the filename minus extension.
  return slug(filename.replace(/\.md$/, ""));
}

async function processTrainerNotes(level, sourceDir, outDir) {
  const files = await listMd(sourceDir);
  let written = 0;
  for (const file of files) {
    const raw = await fs.readFile(path.join(sourceDir, file), "utf8");
    // Trainer notes are bundles. Use the H1 as the title, and derive a slug from the filename.
    const titleMatch = raw.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : file.replace(/\.md$/, "");
    const slugBase = file.replace(/\.md$/, "");
    const id = `L${level}.${slugBase}`;
    // Body is everything after the H1.
    const body = raw.replace(/^#\s+.+$/m, "").trim();

    // Try to extract which sections this bundle covers (e.g. "B1_to_B3" or "B5_to_B6").
    const rangeMatch = file.match(/(B\d+|C\d+|D\d+)_to_(B\d+|C\d+|D\d+)/i);
    const sections = rangeMatch
      ? sectionRange(rangeMatch[1], rangeMatch[2])
      : detectSectionsFromBody(body);

    const fm = buildFrontMatter({
      id,
      level,
      title,
      sections,
      sourceFile: file,
    });
    const outPath = path.join(outDir, `${slugBase}.mdx`);
    await writeMdx(outPath, fm, body);
    written += 1;
  }
  return { written };
}

function sectionRange(from, to) {
  const pre = from[0];
  const start = parseInt(from.slice(1), 10);
  const end = parseInt(to.slice(1), 10);
  const out = [];
  for (let i = start; i <= end; i += 1) out.push(`${pre}${i}`);
  return out;
}

function detectSectionsFromBody(body) {
  const found = new Set();
  for (const m of body.matchAll(/\b([BCD]\d{1,2})\b/g)) found.add(m[1]);
  return [...found].sort();
}

// ---------------------------------------------------------------------------
// Diagram processor
// ---------------------------------------------------------------------------

const DIAGRAM_NUM_RE = /^(\d+)([a-z]?)\.\s*(.+)$/;

async function processDiagrams(level, sourceFile, mdxOutDir, svgOutDir) {
  const raw = await fs.readFile(path.join(SOURCE_ROOT, sourceFile), "utf8");
  const sections = splitH2(raw);
  let written = 0;

  for (const sec of sections) {
    const m = sec.heading.match(DIAGRAM_NUM_RE);
    if (!m) continue; // Skip "How to use", "Production notes", etc.

    const num = parseInt(m[1], 10);
    const sub = m[2] || "";
    const title = m[3].trim();
    const idCode = `${num}${sub}`;
    const slug = `${idCode}-${slugifyDiagram(title)}`;
    const id = `L${level}.diagram.${slug}`;

    const whenToUse = extractFieldFromBody(sec.body, "When to use");
    const pointOut = extractFieldFromBody(sec.body, "What to point out");
    const pageRefs = extractPageRefs(whenToUse + " " + (pointOut || ""));
    const svg = extractSvgBlock(sec.body);

    if (!svg) continue;

    // Write SVG to public/diagrams/L<n>/<slug>.svg
    await ensureDir(svgOutDir);
    const svgPath = path.join(svgOutDir, `${slug}.svg`);
    await fs.writeFile(svgPath, svg, "utf8");
    const svgUrl = `/diagrams/L${level}/${slug}.svg`;

    // Write MDX record (body holds the pedagogical notes)
    const fm = buildFrontMatter({
      id,
      level,
      number: num,
      sub,
      title,
      svgUrl,
      pageRefs,
      whenToUse: whenToUse?.trim(),
      sourceFile,
    });
    const bodyParts = [];
    if (pointOut) {
      bodyParts.push("**What to point out:** " + pointOut.trim());
    }
    await writeMdx(path.join(mdxOutDir, `${slug}.mdx`), fm, bodyParts.join("\n\n"));
    written += 1;
  }
  return { written };
}

function extractFieldFromBody(body, label) {
  // Match `**<label>:** <content>` up to a blank line, the next bold field,
  // or a code-fence opener.
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\*\\*${escaped}:\\*\\*\\s*([\\s\\S]+?)(?=\\n\\s*\\n|\\*\\*[A-Z][^*]+:\\*\\*|\\n\`\`\`|$)`);
  const m = body.match(re);
  return m ? m[1].trim() : undefined;
}

function extractPageRefs(text) {
  if (!text) return [];
  const refs = new Set();
  for (const m of text.matchAll(/\b([BCD]\d{1,2}\.\d{1,2})\b/g)) {
    refs.add(m[1]);
  }
  return [...refs];
}

function extractSvgBlock(body) {
  const m = body.match(/```svg\s*\n([\s\S]+?)\n```/);
  return m ? m[1] : undefined;
}

function slugifyDiagram(s) {
  return s
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// Templates processor
// ---------------------------------------------------------------------------

async function processTemplates(outDir) {
  const raw = await fs.readFile(path.join(SOURCE_ROOT, TEMPLATES_FILE), "utf8");
  const sections = splitH2(raw);
  let written = 0;

  for (const sec of sections) {
    // Skip non-template H2s (Contents, How to print, Closing note).
    const numMatch = sec.heading.match(/^(\d+)\.\s*(.+)$/);
    if (!numMatch) continue;
    const num = parseInt(numMatch[1], 10);
    const title = numMatch[2].trim();
    const slug = slugifyDiagram(title);
    const id = `template.${slug}`;

    // Templates label the page they're for inconsistently ("Used in", "Linked
    // to", "When to use"), so just scan the whole body for page-code refs.
    const pageRefs = extractPageRefs(title + " " + sec.body);

    const fm = buildFrontMatter({
      id,
      number: num,
      title,
      pageRefs,
      sourceFile: TEMPLATES_FILE,
    });
    await writeMdx(path.join(outDir, `${num.toString().padStart(2, "0")}-${slug}.mdx`), fm, sec.body);
    written += 1;
  }
  return { written };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function processLevel(level) {
  const cfg = LEVELS[level];
  if (!cfg) {
    console.error(`No config for level ${level}`);
    return;
  }
  const learnerSrc = path.join(SOURCE_ROOT, cfg.learner);
  const answersSrc = path.join(SOURCE_ROOT, cfg.answers);
  const trainerSrc = path.join(SOURCE_ROOT, cfg.trainer);

  const pagesOut = path.join(CONTENT_DIR, "pages", `L${level}`);
  const answersOut = path.join(CONTENT_DIR, "answer-keys", `L${level}`);
  const trainerOut = path.join(CONTENT_DIR, "trainer-notes", `L${level}`);

  // Wipe existing per-level output for a clean run.
  for (const dir of [pagesOut, answersOut, trainerOut]) {
    await fs.rm(dir, { recursive: true, force: true });
    await ensureDir(dir);
  }

  const pageResult = await processLearnerPages(level, learnerSrc, pagesOut);
  const answerResult = await processAnswerKeys(level, answersSrc, answersOut);
  const trainerResult = await processTrainerNotes(level, trainerSrc, trainerOut);

  let diagramResult = { written: 0 };
  if (DIAGRAMS[level]) {
    const diagramOut = path.join(CONTENT_DIR, "diagrams", `L${level}`);
    const svgOut = path.join(PUBLIC_DIR, "diagrams", `L${level}`);
    await fs.rm(diagramOut, { recursive: true, force: true });
    await fs.rm(svgOut, { recursive: true, force: true });
    await ensureDir(diagramOut);
    await ensureDir(svgOut);
    diagramResult = await processDiagrams(level, DIAGRAMS[level], diagramOut, svgOut);
  }

  console.log(
    `Level ${level}: ${pageResult.written} pages, ${answerResult.written} answer keys, ${trainerResult.written} trainer-notes bundles, ${diagramResult.written} diagrams`,
  );
}

async function runTemplates() {
  const outDir = path.join(CONTENT_DIR, "templates");
  await fs.rm(outDir, { recursive: true, force: true });
  await ensureDir(outDir);
  const r = await processTemplates(outDir);
  console.log(`Templates: ${r.written} ingested`);
}

async function main() {
  const arg = process.argv[2] || "1";
  if (arg === "all") {
    for (const level of Object.keys(LEVELS)) {
      await processLevel(parseInt(level, 10));
    }
    await runTemplates();
  } else if (arg === "templates") {
    await runTemplates();
  } else {
    await processLevel(parseInt(arg, 10));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
