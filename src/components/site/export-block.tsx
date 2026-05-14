"use client";

import { useMemo, useState } from "react";
import { FLASHCARDS } from "@/data/flashcards.generated";
import { useProgress } from "@/lib/progress/provider";
import { BRAND } from "@/config/brand";
import {
  buildExportFilename,
  buildProgressMarkdown,
  type ExportContext,
} from "@/lib/progress/export";
import {
  buildExportHtmlFilename,
  buildProgressHtml,
} from "@/lib/progress/export-html";
import { ReportViewer } from "@/components/site/report-viewer";
import type { Page, Quiz } from "@/lib/content";

interface ExportBlockProps {
  pages: Pick<
    Page,
    "id" | "level" | "page" | "title" | "body" | "rawBody" | "order"
  >[];
  quizzes: Quiz[];
}

type Flash = "idle" | "ok" | "error" | "building";

/**
 * Trainer progress export panel.
 *
 * Six user actions, four formats:
 *   - View report   — opens a polished modal preview (no download)
 *   - Copy .md      — clipboard
 *   - Download .md  — raw markdown file
 *   - Download .html — styled standalone HTML, prints cleanly to PDF
 *   - Print to PDF  — opens the HTML in a new window and fires the print
 *                     dialog so the trainer can save as PDF without leaving
 *                     the app. Browsers prevent silent saves; one extra
 *                     click in the print dialog is the floor.
 *   - Download .docx — Word-compatible document for trainer mark-up. The
 *                     `docx` library is lazy-loaded on first click to keep
 *                     it out of the initial bundle.
 */
export function ExportBlock({ pages, quizzes }: ExportBlockProps) {
  const { hydrated, store } = useProgress();
  const [copyState, setCopyState] = useState<Flash>("idle");
  const [mdDlState, setMdDlState] = useState<Flash>("idle");
  const [htmlDlState, setHtmlDlState] = useState<Flash>("idle");
  const [pdfState, setPdfState] = useState<Flash>("idle");
  const [docxState, setDocxState] = useState<Flash>("idle");
  const [viewerOpen, setViewerOpen] = useState(false);

  const ctx: ExportContext = useMemo(
    () => ({
      pages: pages as ExportContext["pages"],
      quizzes,
      flashcardCount: FLASHCARDS.length,
    }),
    [pages, quizzes],
  );

  if (!hydrated) {
    return (
      <section className="mt-2 border-t border-rule bg-paper-3 px-4 py-6 md:col-span-2 md:mt-4 md:px-0 md:py-6">
        <h3 className="mb-1 font-display text-[16px] font-extrabold tracking-[-0.012em] text-ink">
          Export
        </h3>
        <p className="text-[13px] leading-[1.5] text-ink-2">Loading export…</p>
      </section>
    );
  }

  function flashOk(setter: (v: Flash) => void) {
    setter("ok");
    window.setTimeout(() => setter("idle"), 2500);
  }
  function flashErr(setter: (v: Flash) => void) {
    setter("error");
    window.setTimeout(() => setter("idle"), 4000);
  }

  function downloadBlob(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleCopyMarkdown() {
    try {
      const md = buildProgressMarkdown(store, ctx);
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(md);
      } else {
        const ta = document.createElement("textarea");
        ta.value = md;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try {
          document.execCommand("copy");
        } finally {
          document.body.removeChild(ta);
        }
      }
      flashOk(setCopyState);
    } catch (err) {
      console.error("Progress export copy failed:", err);
      flashErr(setCopyState);
    }
  }

  function handleDownloadMarkdown() {
    try {
      const md = buildProgressMarkdown(store, ctx);
      downloadBlob(md, buildExportFilename(store), "text/markdown");
      flashOk(setMdDlState);
    } catch (err) {
      console.error("Progress export markdown download failed:", err);
      flashErr(setMdDlState);
    }
  }

  function handleDownloadHtml() {
    try {
      const html = buildProgressHtml(store, ctx);
      downloadBlob(html, buildExportHtmlFilename(store), "text/html");
      flashOk(setHtmlDlState);
    } catch (err) {
      console.error("Progress export HTML download failed:", err);
      flashErr(setHtmlDlState);
    }
  }

  async function handleDownloadDocx() {
    setDocxState("building");
    try {
      // Lazy-import the renderer so the docx library only loads when used.
      const { buildProgressDocx, buildExportDocxFilename } = await import(
        "@/lib/progress/export-docx"
      );
      const blob = await buildProgressDocx(store, ctx);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = buildExportDocxFilename(store);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      flashOk(setDocxState);
    } catch (err) {
      console.error("Progress export DOCX download failed:", err);
      flashErr(setDocxState);
    }
  }

  function handlePrintPdf() {
    try {
      const html = buildProgressHtml(store, ctx);
      const w = window.open("", "_blank", "noopener,noreferrer");
      if (!w) {
        // Pop-up blocked. Surface this clearly rather than silently failing.
        console.warn(
          "Progress export print: pop-up blocked. Trying same-window fallback.",
        );
        // Fallback — download HTML so the user can open and print manually.
        downloadBlob(html, buildExportHtmlFilename(store), "text/html");
        flashErr(setPdfState);
        return;
      }
      w.document.open();
      w.document.write(html);
      w.document.close();
      const fire = () => {
        try {
          w.focus();
          w.print();
        } catch (err) {
          console.error("Print failed:", err);
        }
      };
      // Wait a tick for the new window's DOM to settle, then trigger print.
      // Use both onload (Chrome) and a timer fallback (Safari sometimes
      // resolves earlier).
      w.onload = () => fire();
      window.setTimeout(fire, 600);
      flashOk(setPdfState);
    } catch (err) {
      console.error("Progress export PDF print failed:", err);
      flashErr(setPdfState);
    }
  }

  const mdFilename = buildExportFilename(store);
  const htmlFilename = buildExportHtmlFilename(store);
  const subtitle = [
    store.settings.profileName?.trim() || "Unnamed candidate",
    BRAND.productName,
    new Date().toISOString().slice(0, 10),
  ].join(" · ");

  return (
    <section className="mt-2 border-t border-rule bg-paper-3 px-4 py-6 md:col-span-2 md:mt-4 md:border md:border-rule md:bg-paper-3 md:px-6 md:py-6">
      <h3 className="mb-1 font-display text-[16px] font-extrabold tracking-[-0.012em] text-ink">
        Export
      </h3>
      <p className="mb-4 max-w-[62ch] text-[13px] leading-[1.55] text-ink-2 md:text-[14px]">
        View, copy, or download a complete report of your progress: candidate
        identity, page-by-page completion, every typed exercise answer,
        every quiz response, readiness checks, and confidence ratings. Useful
        for sending to a trainer for review, or keeping a record before you
        reset.
      </p>

      {/* Filename preview */}
      <div className="mb-4 grid gap-2 md:grid-cols-2">
        <div className="flex flex-col gap-1.5 rounded-[2px] border border-rule bg-paper-2 px-3 py-2.5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            Markdown filename
          </span>
          <span className="break-all font-mono text-[12px] font-semibold text-ink">
            {mdFilename}
          </span>
        </div>
        <div className="flex flex-col gap-1.5 rounded-[2px] border border-rule bg-paper-2 px-3 py-2.5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            HTML filename
          </span>
          <span className="break-all font-mono text-[12px] font-semibold text-ink">
            {htmlFilename}
          </span>
        </div>
      </div>

      {/* Primary action: view */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setViewerOpen(true)}
          className="btn red sm"
        >
          View report
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
          Opens a formatted preview, no download
        </span>
      </div>

      {/* Download actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCopyMarkdown}
          className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink"
        >
          Copy Markdown
        </button>
        <button
          type="button"
          onClick={handleDownloadMarkdown}
          className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink"
        >
          Download .md
        </button>
        <button
          type="button"
          onClick={handleDownloadHtml}
          className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink"
        >
          Download .html
        </button>
        <button
          type="button"
          onClick={handlePrintPdf}
          className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink"
        >
          Print to PDF
        </button>
        <button
          type="button"
          onClick={handleDownloadDocx}
          disabled={docxState === "building"}
          className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink disabled:cursor-progress disabled:text-ink-3"
        >
          {docxState === "building" ? "Building .docx…" : "Download .docx"}
        </button>
      </div>

      {/* Feedback row */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {copyState === "ok" ? (
          <span className="tag moss">
            <span className="dot" /> Copied Markdown
          </span>
        ) : copyState === "error" ? (
          <span className="tag crimson">Copy failed — see console</span>
        ) : null}
        {mdDlState === "ok" ? (
          <span className="tag moss">
            <span className="dot" /> .md downloaded
          </span>
        ) : mdDlState === "error" ? (
          <span className="tag crimson">.md download failed</span>
        ) : null}
        {htmlDlState === "ok" ? (
          <span className="tag moss">
            <span className="dot" /> .html downloaded
          </span>
        ) : htmlDlState === "error" ? (
          <span className="tag crimson">.html download failed</span>
        ) : null}
        {pdfState === "ok" ? (
          <span className="tag moss">
            <span className="dot" /> Print dialog opened
          </span>
        ) : pdfState === "error" ? (
          <span className="tag crimson">
            Pop-up blocked — .html downloaded as fallback
          </span>
        ) : null}
        {docxState === "ok" ? (
          <span className="tag moss">
            <span className="dot" /> .docx downloaded
          </span>
        ) : docxState === "error" ? (
          <span className="tag crimson">.docx build failed — see console</span>
        ) : null}
      </div>

      <p className="mt-3 max-w-[62ch] font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
        All formats build from the same source. Nothing leaves this device
        until you send it.
      </p>

      {viewerOpen ? (
        <ReportViewer
          markdown={buildProgressMarkdown(store, ctx)}
          subtitle={subtitle}
          onClose={() => setViewerOpen(false)}
          onPrint={handlePrintPdf}
        />
      ) : null}
    </section>
  );
}
