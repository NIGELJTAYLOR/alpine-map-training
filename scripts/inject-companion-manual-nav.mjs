#!/usr/bin/env node
/**
 * Inject the "Back to app" nav bar into every static HTML file in
 * public/companion-manual/.
 *
 * For each .html file under public/companion-manual/{index.html,pages/*.html}:
 *
 *   1. Adds two tags to <head>:
 *        <link rel="stylesheet" href="/companion-manual/amt-nav.css">
 *        <script src="/companion-manual/amt-nav.js" defer></script>
 *
 *   2. Inserts the nav-bar markup as the first child of <body>.
 *
 * Idempotent: each insertion is guarded by an HTML comment marker, so
 * re-running the script after re-extracting the workbook ZIP is safe.
 *
 * Usage:
 *   node scripts/inject-companion-manual-nav.mjs
 *
 * Re-run after any time you replace the contents of
 * public/companion-manual/ from a new workbook export.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "public", "companion-manual");

const HEAD_MARK = "<!-- amt-nav:head -->";
const BODY_MARK = "<!-- amt-nav:body -->";

const HEAD_INJECTION = `${HEAD_MARK}
<link rel="stylesheet" href="/companion-manual/amt-nav.css">
<script src="/companion-manual/amt-nav.js" defer></script>`;

const NAV_HTML = `${BODY_MARK}
<header class="amt-app-nav" role="navigation" aria-label="Return to Alpine Map Training app">
  <div class="amt-app-nav__label">
    <span class="amt-app-nav__sub">Companion manual</span>
    <span>Alpine Map Training</span>
  </div>
  <div class="amt-app-nav__actions">
    <a href="/" class="amt-app-nav__btn" data-amt-nav-back>
      <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 12 6 8l4-4"/>
      </svg>
      <span>Back to app</span>
    </a>
    <a href="/" class="amt-app-nav__btn amt-app-nav__btn--primary" data-amt-nav-close>
      <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 4l8 8M12 4l-8 8"/>
      </svg>
      <span><span class="amt-app-nav-label-long">Close </span>tab</span>
    </a>
  </div>
</header>`;

function collectHtmlFiles(root) {
  const files = [];
  const index = path.join(root, "index.html");
  if (fs.existsSync(index)) files.push(index);
  const pagesDir = path.join(root, "pages");
  if (fs.existsSync(pagesDir)) {
    for (const f of fs.readdirSync(pagesDir)) {
      if (f.toLowerCase().endsWith(".html")) {
        files.push(path.join(pagesDir, f));
      }
    }
  }
  return files;
}

function injectInto(html) {
  let out = html;
  let changed = false;

  if (!out.includes(HEAD_MARK)) {
    // Insert just before </head>
    out = out.replace(/<\/head>/i, `${HEAD_INJECTION}\n</head>`);
    changed = true;
  }
  if (!out.includes(BODY_MARK)) {
    // Insert just after <body ...>
    out = out.replace(/<body[^>]*>/i, (match) => `${match}\n${NAV_HTML}`);
    changed = true;
  }
  return { out, changed };
}

function main() {
  if (!fs.existsSync(ROOT)) {
    console.error(`[inject-nav] No companion-manual folder at ${ROOT}`);
    process.exit(1);
  }
  const files = collectHtmlFiles(ROOT);
  if (files.length === 0) {
    console.error("[inject-nav] No HTML files found.");
    process.exit(1);
  }
  let updated = 0;
  let skipped = 0;
  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    const { out, changed } = injectInto(src);
    if (changed) {
      fs.writeFileSync(file, out, "utf8");
      updated += 1;
    } else {
      skipped += 1;
    }
  }
  console.log(
    `[inject-nav] ${files.length} files processed: ${updated} updated, ${skipped} already had the bar.`,
  );
}

main();
