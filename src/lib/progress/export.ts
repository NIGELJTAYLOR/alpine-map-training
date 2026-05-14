/**
 * Trainer-facing Markdown export.
 *
 * `buildProgressMarkdown(store, ctx)` turns the local progress store into
 * a single self-contained Markdown document that a trainer can read in any
 * editor (or paste into email, Slack, a PDF, etc.). Everything is laid out
 * level-by-level for sequential review.
 *
 * Design rules:
 *   - Pure function. Deterministic for a given (store, ctx, now).
 *   - No I/O. No DOM. The UI layer (`<ExportBlock>`) handles clipboard /
 *     download, and is also responsible for picking a filename via
 *     `buildExportFilename()`.
 *   - No content coupling beyond the typed shapes from `@/lib/content`,
 *     so the same builder works for any future customer that swaps the
 *     workbook content but keeps the same `Page`/`Quiz` schemas.
 *   - Customer-specific strings (product name, byline) read from
 *     `@/config/brand`.
 *
 * If you change the section order, also update the table of contents at
 * the top of the document so the document is self-describing.
 */

import type { Page, Quiz } from "@/lib/content";
import { BRAND } from "@/config/brand";
import { exerciseInputKey, parseExercises } from "@/lib/exercises";
import type { ProgressStore } from "./types";

export interface ExportContext {
  /** All pages in the workbook, in display order. */
  pages: Page[];
  /** All quizzes available in the workbook. */
  quizzes: Quiz[];
  /** Total number of flashcards in the deck. */
  flashcardCount: number;
}

// ---------------------------------------------------------------- formatting

function formatDateTime(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  // Locale-neutral compact format: "2026-05-14, 15:42"
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}, ${hh}:${mi}`;
}

function formatDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function statusLabel(s: "not-started" | "in-progress" | "completed"): string {
  if (s === "completed") return "Complete";
  if (s === "in-progress") return "In progress";
  return "Not started";
}

function statusGlyph(s: "not-started" | "in-progress" | "completed"): string {
  if (s === "completed") return "[x]";
  if (s === "in-progress") return "[~]";
  return "[ ]";
}

function quizResponseLabel(
  status:
    | "unanswered"
    | "auto-correct"
    | "auto-incorrect"
    | "self-correct"
    | "self-partial"
    | "self-incorrect"
    | "skipped",
): string {
  switch (status) {
    case "auto-correct":
      return "Correct (auto)";
    case "auto-incorrect":
      return "Incorrect (auto)";
    case "self-correct":
      return "Correct (self-marked)";
    case "self-partial":
      return "Partial (self-marked)";
    case "self-incorrect":
      return "Incorrect (self-marked)";
    case "skipped":
      return "Skipped";
    case "unanswered":
    default:
      return "Unanswered";
  }
}

function serialiseAnswer(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") {
    return value.trim().length === 0 ? "—" : value.trim();
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  // objects and arrays — render as a small inline JSON snippet
  try {
    return JSON.stringify(value);
  } catch {
    return "[unserialisable answer]";
  }
}

/** Indent a multi-line block so it nests under a Markdown bullet. */
function indentBlock(text: string, prefix = "  "): string {
  return text
    .split("\n")
    .map((line) => (line.length === 0 ? line : prefix + line))
    .join("\n");
}

/** Markdown blockquote a multi-line string. */
function quote(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) return "> _(no response)_";
  return trimmed
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}

// ----------------------------------------------------------------- filename

function slugifyName(name: string | undefined): string {
  if (!name) return "Candidate";
  // Keep letters, numbers, hyphens. Replace whitespace with single hyphen.
  return (
    name
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .split(/\s+/)
      .filter((s) => s.length > 0)
      .join("-") || "Candidate"
  );
}

export function buildExportFilename(
  store: ProgressStore,
  now: Date = new Date(),
): string {
  const namePart = slugifyName(store.settings.profileName);
  return `${namePart}_${BRAND.exportSlug}_${formatDate(now)}.md`;
}

// -------------------------------------------------------------- main builder

export function buildProgressMarkdown(
  store: ProgressStore,
  ctx: ExportContext,
  now: Date = new Date(),
): string {
  const out: string[] = [];

  // ===== Header =====
  out.push(`# ${BRAND.productName} — Progress export`);
  out.push("");
  out.push(`**Candidate:** ${store.settings.profileName?.trim() || "_(not set)_"}  `);
  out.push(`**Email:** ${store.settings.profileEmail?.trim() || "_(not set)_"}  `);
  out.push(`**Generated:** ${formatDateTime(now.toISOString())}  `);
  out.push(`**Source:** ${BRAND.productName} (${BRAND.byline})  `);
  out.push(
    `**Last activity on device:** ${formatDateTime(store.lastUpdated)}  `,
  );
  out.push("");
  out.push("---");
  out.push("");

  // ===== Contents =====
  out.push("## Contents");
  out.push("");
  out.push("1. Summary");
  out.push("2. Onboarding choices");
  out.push("3. Pages — by level");
  out.push("4. Quizzes");
  out.push("5. Readiness checks");
  out.push("6. Confidence ratings");
  out.push("7. Flashcards");
  out.push("");
  out.push("---");
  out.push("");

  // ===== 1. Summary =====
  const totalPages = ctx.pages.length;
  let completed = 0;
  let inProgress = 0;
  for (const p of ctx.pages) {
    const s = store.pages[p.id]?.status ?? "not-started";
    if (s === "completed") completed += 1;
    else if (s === "in-progress") inProgress += 1;
  }
  const overallPct = totalPages
    ? Math.round(((completed + inProgress * 0.5) / totalPages) * 100)
    : 0;

  const completedQuizzes = ctx.quizzes.filter(
    (q) => store.quizzes[q.id]?.completedAt,
  ).length;

  const flashcardsStudied = Object.keys(store.flashcards).length;

  out.push("## 1. Summary");
  out.push("");
  out.push(`- **Overall:** ${overallPct}%`);
  out.push(`- **Pages complete:** ${completed} / ${totalPages}`);
  out.push(`- **Pages in progress:** ${inProgress}`);
  out.push(
    `- **Quizzes complete:** ${completedQuizzes} / ${ctx.quizzes.length}`,
  );
  out.push(
    `- **Flashcards studied:** ${flashcardsStudied} / ${ctx.flashcardCount}`,
  );
  out.push(
    `- **Readiness checks recorded:** ${Object.keys(store.readinessChecks).length}`,
  );
  out.push(
    `- **Confidence ratings recorded:** ${Object.keys(store.confidenceScores).length}`,
  );
  out.push("");

  // ===== 2. Onboarding =====
  out.push("## 2. Onboarding choices");
  out.push("");
  const s = store.settings;
  out.push(
    `- **Onboarding complete:** ${s.onboardingComplete ? "yes" : "no"}`,
  );
  out.push(
    `- **Starting level:** ${s.startingLevel != null ? `Level ${s.startingLevel}` : "—"}`,
  );
  out.push(
    `- **Target session length:** ${s.sessionMinutes != null ? `${s.sessionMinutes} min` : "—"}`,
  );
  out.push(
    `- **Target study days per week:** ${s.studyDaysPerWeek ?? "—"}`,
  );
  out.push(`- **Trainer mode:** ${s.trainerMode ? "on" : "off"}`);
  out.push("");

  // ===== 3. Pages — by level =====
  out.push("## 3. Pages — by level");
  out.push("");

  // Group pages by level, preserving the workbook order from ctx.pages.
  const byLevel = new Map<number, Page[]>();
  for (const p of ctx.pages) {
    const arr = byLevel.get(p.level) ?? [];
    arr.push(p);
    byLevel.set(p.level, arr);
  }
  const levels = [...byLevel.keys()].sort((a, b) => a - b);

  for (const level of levels) {
    const levelPages = byLevel.get(level) ?? [];
    let lvCompleted = 0;
    let lvInProgress = 0;
    for (const p of levelPages) {
      const st = store.pages[p.id]?.status ?? "not-started";
      if (st === "completed") lvCompleted += 1;
      else if (st === "in-progress") lvInProgress += 1;
    }
    const lvPct = levelPages.length
      ? Math.round(
          ((lvCompleted + lvInProgress * 0.5) / levelPages.length) * 100,
        )
      : 0;

    out.push(
      `### Level ${level} — ${lvCompleted} of ${levelPages.length} pages complete (${lvPct}%)`,
    );
    out.push("");

    for (const p of levelPages) {
      const progress = store.pages[p.id];
      const status = progress?.status ?? "not-started";
      out.push(
        `#### ${statusGlyph(status)} ${p.page} — ${p.title} · _${statusLabel(status)}_`,
      );

      if (progress?.lastViewed) {
        out.push(`- Last viewed: ${formatDateTime(progress.lastViewed)}`);
      }

      const selfCheck = progress?.selfCheck ?? {};
      const totalChecks = Object.keys(selfCheck).length;
      const tickedChecks = Object.values(selfCheck).filter(Boolean).length;
      if (totalChecks > 0) {
        out.push(`- Self-checks: ${tickedChecks} / ${totalChecks} ticked`);
      }

      // Per-exercise typed answers. We parse the raw markdown body, not the
      // compiled MDX — the "### Exercise N" headings only exist as text in
      // the raw source.
      const exercises = parseExercises(p.rawBody ?? p.body);
      const inputs = progress?.inputs ?? {};
      const hasAnyResponse = exercises.some((_e, idx) => {
        const v = inputs[exerciseInputKey(idx)];
        return v && v.trim().length > 0;
      });

      const pageGrades = progress?.grades ?? {};

      if (exercises.length > 0) {
        if (hasAnyResponse) {
          out.push("");
          out.push("**Exercise responses:**");
          out.push("");
          exercises.forEach((ex, idx) => {
            const k = exerciseInputKey(idx);
            const raw = inputs[k];
            const label = ex.number != null
              ? `Exercise ${ex.number} — ${ex.title}`
              : ex.title;
            out.push(`*${label}*`);
            out.push("");
            out.push(quote(raw ?? ""));
            out.push("");

            // Include any AI grade that exists for this exercise. The
            // structure below — bold score header, italic meta line,
            // blockquoted feedback, then bold sub-labels with bullet lists —
            // gives a clear visual hierarchy in every renderer (raw .md
            // reader, modal preview, styled HTML, Word .docx, PDF) without
            // needing any renderer-specific markup.
            const grade = pageGrades[k];
            if (grade) {
              const scoreLabel =
                grade.score === "met"
                  ? "Met"
                  : grade.score === "nearly"
                  ? "Nearly"
                  : "Not yet";
              out.push(`**AI grade — ${scoreLabel}**  `);
              out.push(
                `_${grade.model} · ${formatDateTime(grade.gradedAt)}_`,
              );
              out.push("");
              out.push(quote(grade.feedback));
              if (grade.strengths.length > 0) {
                out.push("");
                out.push("**Strengths**");
                for (const s of grade.strengths) {
                  out.push(`- ${s}`);
                }
              }
              if (grade.improvements.length > 0) {
                out.push("");
                out.push("**Improvements**");
                for (const s of grade.improvements) {
                  out.push(`- ${s}`);
                }
              }
              out.push("");
            }
          });
        } else if (status !== "not-started") {
          // Page has exercises but candidate hasn't written anything yet —
          // worth noting in case the trainer wonders why a page is in progress.
          out.push(
            `- Exercises: ${exercises.length} on this page, no responses yet`,
          );
        }
      }

      out.push("");
    }
  }

  out.push("---");
  out.push("");

  // ===== 4. Quizzes =====
  out.push("## 4. Quizzes");
  out.push("");

  if (ctx.quizzes.length === 0) {
    out.push("_No quizzes defined for this workbook._");
    out.push("");
  } else {
    for (const q of ctx.quizzes) {
      const attempt = store.quizzes[q.id];
      out.push(`### Level ${q.level} · ${q.page} — ${q.title}`);
      out.push("");

      if (!attempt) {
        out.push("_Not started._");
        out.push("");
        continue;
      }

      out.push(`- Started: ${formatDateTime(attempt.startedAt)}`);
      if (attempt.completedAt) {
        out.push(`- Completed: ${formatDateTime(attempt.completedAt)}`);
      }
      if (attempt.score != null && attempt.totalQuestions != null) {
        out.push(`- Score: ${attempt.score} / ${attempt.totalQuestions}`);
      }
      if (attempt.timeMinutes != null) {
        out.push(`- Time taken: ${attempt.timeMinutes} min`);
      }
      out.push("");

      out.push("**Per-question detail:**");
      out.push("");
      for (const question of q.questions) {
        const response = attempt.responses[question.id];
        const label = response
          ? quizResponseLabel(response.status)
          : "Unanswered";
        out.push(`- **${question.id} — ${question.title}** · _${label}_`);
        const prompt = question.prompt.replace(/\s+/g, " ").trim();
        if (prompt.length > 0) {
          out.push(indentBlock(`Prompt: ${prompt}`, "  "));
        }
        if (response) {
          out.push(indentBlock(`Answer: ${serialiseAnswer(response.value)}`, "  "));
        }
      }
      out.push("");
    }
  }

  out.push("---");
  out.push("");

  // ===== 5. Readiness checks =====
  out.push("## 5. Readiness checks");
  out.push("");
  const readinessEntries = Object.entries(store.readinessChecks);
  if (readinessEntries.length === 0) {
    out.push("_No readiness checks recorded._");
    out.push("");
  } else {
    for (const [key, check] of readinessEntries) {
      const label =
        check.status === "yes"
          ? "Met"
          : check.status === "not-quite"
          ? "Not quite"
          : "Not ready";
      out.push(`- **${key}** · _${label}_`);
      out.push(`  - Updated: ${formatDateTime(check.updatedAt)}`);
      if (check.notes && check.notes.trim().length > 0) {
        out.push("  - Notes:");
        out.push(indentBlock(quote(check.notes), "    "));
      }
    }
    out.push("");
  }

  out.push("---");
  out.push("");

  // ===== 6. Confidence ratings =====
  out.push("## 6. Confidence ratings");
  out.push("");
  const confidenceEntries = Object.entries(store.confidenceScores);
  if (confidenceEntries.length === 0) {
    out.push("_No confidence ratings recorded._");
    out.push("");
  } else {
    for (const [key, score] of confidenceEntries) {
      const v = score.value;
      out.push(
        `- **${key}** · ${v == null ? "—" : `${v} / 5`} · updated ${formatDateTime(score.updatedAt)}`,
      );
    }
    out.push("");
  }

  out.push("---");
  out.push("");

  // ===== 7. Flashcards =====
  out.push("## 7. Flashcards");
  out.push("");
  out.push(
    `- Studied: ${Object.keys(store.flashcards).length} / ${ctx.flashcardCount}`,
  );
  out.push("");
  out.push(
    "_Per-card schedules are stored on the device but omitted here to keep the export focused on trainer review. Ask the candidate to share if needed._",
  );
  out.push("");

  // ===== Footer =====
  out.push("---");
  out.push("");
  out.push(
    `_Generated by ${BRAND.productName} on ${formatDateTime(now.toISOString())}._  `,
  );
  out.push(
    `_Contact: [${BRAND.authorName}](${BRAND.authorUrl}) · ${BRAND.authorEmail}._`,
  );
  out.push("");

  return out.join("\n");
}
