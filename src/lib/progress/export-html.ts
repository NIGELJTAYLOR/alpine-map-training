/**
 * HTML renderer for the progress export.
 *
 * `buildProgressHtml(store, ctx)` wraps `buildProgressMarkdown` output in a
 * self-contained, styled HTML document. The result is a single .html file
 * that opens cleanly in any browser, prints cleanly to PDF, and has no
 * external dependencies (no fonts, no CSS, no JS to load).
 *
 * The Markdown subset used by `buildProgressMarkdown` is small and known.
 * The line-by-line converter below handles exactly that subset:
 *   - H1 / H2 / H3 / H4 (#, ##, ###, ####)
 *   - Bullet lists (- ) with two-space indented sub-bullets
 *   - Blockquotes (>) including multi-line
 *   - Horizontal rules (---)
 *   - Inline emphasis: **bold**, *italic*, _italic_
 *   - Trailing two-space soft breaks
 *
 * Intentionally not a general Markdown engine. If the export builder starts
 * using new syntax, this converter must learn it too. Keeping them in lock-
 * step is the cost of avoiding a runtime dependency.
 */

import type { ProgressStore } from "./types";
import { BRAND } from "@/config/brand";
import {
  buildExportFilename,
  buildProgressMarkdown,
  type ExportContext,
} from "./export";

// ---------------------------------------------------------------- inline

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(text: string): string {
  // Escape first, then re-introduce inline marks. Order matters: bold (**)
  // before single * for italic, to avoid greedy matches.
  let s = escapeHtml(text);
  s = s.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(?<!\w)\*([^*\n]+)\*(?!\w)/g, "<em>$1</em>");
  s = s.replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, "<em>$1</em>");
  return s;
}

// ---------------------------------------------------------------- block

interface RenderState {
  inUl: boolean;
  ulIndent: number;
  inBlockquote: boolean;
  blockquoteLines: string[];
  paragraphLines: string[];
}

function flushList(state: RenderState, out: string[]) {
  if (state.inUl) {
    out.push("</ul>");
    state.inUl = false;
    state.ulIndent = 0;
  }
}

function flushBlockquote(state: RenderState, out: string[]) {
  if (state.inBlockquote) {
    const inner = state.blockquoteLines
      .map((l) => renderInline(l))
      .join("<br />");
    out.push(`<blockquote>${inner}</blockquote>`);
    state.blockquoteLines = [];
    state.inBlockquote = false;
  }
}

function flushParagraph(state: RenderState, out: string[]) {
  if (state.paragraphLines.length > 0) {
    const joined = state.paragraphLines
      .map((l) => renderInline(l))
      .join("<br />");
    out.push(`<p>${joined}</p>`);
    state.paragraphLines = [];
  }
}

function flushAll(state: RenderState, out: string[]) {
  flushParagraph(state, out);
  flushList(state, out);
  flushBlockquote(state, out);
}

function markdownToHtmlBody(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  const state: RenderState = {
    inUl: false,
    ulIndent: 0,
    inBlockquote: false,
    blockquoteLines: [],
    paragraphLines: [],
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");

    // Empty line — paragraph / list / blockquote break
    if (line.length === 0) {
      flushAll(state, out);
      continue;
    }

    // Horizontal rule
    if (line === "---") {
      flushAll(state, out);
      out.push("<hr />");
      continue;
    }

    // Headings
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushAll(state, out);
      const level = heading[1].length;
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    // Blockquote
    if (line.startsWith("> ") || line === ">") {
      flushParagraph(state, out);
      flushList(state, out);
      state.inBlockquote = true;
      state.blockquoteLines.push(line === ">" ? "" : line.slice(2));
      continue;
    } else if (state.inBlockquote) {
      flushBlockquote(state, out);
    }

    // Bullet (top-level or indented)
    const bullet = line.match(/^(\s*)-\s+(.*)$/);
    if (bullet) {
      flushParagraph(state, out);
      const indent = bullet[1].length;
      if (!state.inUl) {
        out.push("<ul>");
        state.inUl = true;
        state.ulIndent = indent;
      } else if (indent > state.ulIndent) {
        out.push("<ul>");
        state.ulIndent = indent;
      } else if (indent < state.ulIndent) {
        out.push("</ul>");
        state.ulIndent = indent;
      }
      out.push(`<li>${renderInline(bullet[2])}</li>`);
      continue;
    } else if (state.inUl) {
      flushList(state, out);
    }

    // Default: paragraph line
    state.paragraphLines.push(line);
  }

  flushAll(state, out);
  return out.join("\n");
}

// ---------------------------------------------------------------- template

/** Inlined Glacier Lab styles tuned for both screen and print output. */
const STYLES = `
  :root {
    --paper: #eef1f4;
    --paper-2: #e3e7ec;
    --paper-3: #f6f7f9;
    --ink: #0e1a2e;
    --ink-2: #2a3a55;
    --ink-3: #5a6b85;
    --ink-4: #94a1b6;
    --rule: #c8d0db;
    --red: #d7263d;
    --moss: #6b8e23;
    --ice: #2480b5;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--paper);
    color: var(--ink);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
    line-height: 1.55;
  }
  .doc {
    max-width: 760px;
    margin: 40px auto;
    background: #ffffff;
    border: 1px solid var(--rule);
    padding: 48px 56px;
  }
  h1 {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0 0 12px;
    color: var(--ink);
    border-bottom: 2px solid var(--ink);
    padding-bottom: 12px;
  }
  h2 {
    font-size: 19px;
    font-weight: 800;
    letter-spacing: -0.012em;
    margin: 28px 0 10px;
    color: var(--ink);
    border-bottom: 1px solid var(--rule);
    padding-bottom: 6px;
  }
  h3 {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.005em;
    margin: 22px 0 8px;
    color: var(--ink);
  }
  h4 {
    font-size: 13.5px;
    font-weight: 700;
    margin: 18px 0 6px;
    color: var(--ink-2);
  }
  p { margin: 0 0 10px; color: var(--ink-2); }
  hr {
    border: none;
    border-top: 1px solid var(--rule);
    margin: 24px 0;
  }
  ul {
    margin: 4px 0 12px;
    padding-left: 22px;
    color: var(--ink-2);
  }
  ul ul { margin: 4px 0 4px; }
  li { margin: 2px 0; }
  blockquote {
    margin: 6px 0 14px;
    padding: 10px 14px;
    background: var(--paper-3);
    border-left: 3px solid var(--ice);
    color: var(--ink);
    font-style: italic;
    white-space: pre-wrap;
  }
  strong { color: var(--ink); }
  em { color: var(--ink-2); }
  .meta-banner {
    background: var(--paper-3);
    border: 1px solid var(--rule);
    padding: 14px 18px;
    margin: 0 0 24px;
    font-size: 12px;
    color: var(--ink-3);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .grade-score {
    display: inline-block;
    padding: 2px 9px;
    border-radius: 2px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.01em;
  }
  .grade-met { background: var(--moss); }
  .grade-nearly { background: #d49018; }
  .grade-not-yet { background: var(--red); }
  .footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid var(--rule);
    font-size: 12px;
    color: var(--ink-3);
  }
  @media print {
    body { background: #ffffff; font-size: 11pt; }
    .doc {
      max-width: none;
      margin: 0;
      padding: 18mm 16mm;
      border: none;
    }
    h1 { font-size: 22pt; page-break-after: avoid; }
    h2 { font-size: 14pt; page-break-after: avoid; }
    h3 { font-size: 11.5pt; page-break-after: avoid; }
    h4 { font-size: 11pt; page-break-after: avoid; }
    blockquote, ul, p { page-break-inside: avoid; }
    .meta-banner { background: #f5f5f5; }
  }
`;

export function buildProgressHtml(
  store: ProgressStore,
  ctx: ExportContext,
  now: Date = new Date(),
): string {
  const md = buildProgressMarkdown(store, ctx, now);
  let bodyHtml = markdownToHtmlBody(md);
  // Post-process: turn the AI grade label into a coloured pill. The label
  // shape comes from `buildProgressMarkdown` which always renders
  //   **AI grade — Met** | **AI grade — Nearly** | **AI grade — Not yet**
  // so a tight regex covers all three cases.
  bodyHtml = bodyHtml.replace(
    /<strong>AI grade — Met<\/strong>/g,
    '<strong class="grade-score grade-met">AI grade · Met</strong>',
  );
  bodyHtml = bodyHtml.replace(
    /<strong>AI grade — Nearly<\/strong>/g,
    '<strong class="grade-score grade-nearly">AI grade · Nearly</strong>',
  );
  bodyHtml = bodyHtml.replace(
    /<strong>AI grade — Not yet<\/strong>/g,
    '<strong class="grade-score grade-not-yet">AI grade · Not yet</strong>',
  );
  const title = `${BRAND.productName} — Progress export`;
  const banner = [
    store.settings.profileName?.trim() || "Unnamed candidate",
    BRAND.productName,
    now.toISOString().slice(0, 10),
  ].join(" · ");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>${STYLES}</style>
</head>
<body>
<div class="doc">
<div class="meta-banner">${escapeHtml(banner)}</div>
${bodyHtml}
</div>
</body>
</html>
`;
}

/** Filename for the HTML download. Mirrors the .md filename pattern. */
export function buildExportHtmlFilename(
  store: ProgressStore,
  now: Date = new Date(),
): string {
  return buildExportFilename(store, now).replace(/\.md$/, ".html");
}
