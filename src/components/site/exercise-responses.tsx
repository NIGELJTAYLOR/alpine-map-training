"use client";

import { useMemo, useState } from "react";
import { useProgress } from "@/lib/progress/provider";
import {
  exerciseInputKey,
  parseExercises,
  splitByExerciseHeadings,
} from "@/lib/exercises";
import { GradePanel } from "@/components/site/grade-panel";
import type { ExerciseGrade } from "@/lib/progress/types";

interface ExerciseResponsesProps {
  /** Stable id for the page (e.g. "L1.B3.2"). */
  pageId: string;
  /** Raw markdown body of the page; exercises are detected by H3 heading. */
  body: string;
  /**
   * Raw markdown body of the matching answer key, when one exists for this
   * page. Used to pull the model answer per exercise for AI grading. When
   * absent, the grader still runs but with no reference answer (it falls
   * back to general subject knowledge).
   */
  answerKeyBody?: string;
}

type GradingState = "idle" | "building";

/**
 * Glacier Lab "Exercise responses" panel.
 *
 * For each "### Exercise N — Title" heading in the page body, renders a
 * labelled textarea, an AI grading button, and (when a grade exists) the
 * GradePanel below it.
 *
 * Framework-mode note: content-agnostic. The whole pipeline keys off the
 * "### Exercise N" convention, so any future customer's workbook that
 * follows it gets grading for free.
 */
export function ExerciseResponses({
  pageId,
  body,
  answerKeyBody,
}: ExerciseResponsesProps) {
  const { hydrated, getPage, setInput, setGrade, clearGrade } = useProgress();

  const exercises = useMemo(() => parseExercises(body), [body]);
  const promptSections = useMemo(() => splitByExerciseHeadings(body), [body]);
  const answerSections = useMemo(
    () =>
      answerKeyBody ? splitByExerciseHeadings(answerKeyBody) : [],
    [answerKeyBody],
  );

  const [gradingState, setGradingState] = useState<
    Record<string, GradingState>
  >({});
  const [gradingError, setGradingError] = useState<Record<string, string>>({});

  if (exercises.length === 0) return null;

  const pageProgress = hydrated ? getPage(pageId) : undefined;
  const inputs = pageProgress?.inputs ?? {};
  const grades = pageProgress?.grades ?? {};

  async function gradeOne(idx: number) {
    const key = exerciseInputKey(idx);
    const ex = exercises[idx];
    const answer = (inputs[key] ?? "").trim();

    const promptBody = promptSections[idx]?.body ?? "";
    // Try to match the model answer to this exercise by number (preferred)
    // or fall back to position.
    let modelBody = "";
    if (ex.number != null) {
      const match = answerSections.find((s) => s.number === ex.number);
      modelBody = match?.body ?? "";
    }
    if (!modelBody) {
      modelBody = answerSections[idx]?.body ?? "";
    }

    setGradingState((s) => ({ ...s, [key]: "building" }));
    setGradingError((s) => ({ ...s, [key]: "" }));

    try {
      const resp = await fetch("/api/grade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          exerciseTitle:
            ex.number != null
              ? `Exercise ${ex.number} — ${ex.title}`
              : ex.title,
          exercisePrompt: promptBody,
          modelAnswer: modelBody,
          candidateAnswer: answer,
        }),
      });

      if (!resp.ok) {
        const errPayload = await resp
          .json()
          .catch(() => ({ error: `HTTP ${resp.status}` }));
        const msg =
          (errPayload && typeof errPayload.error === "string"
            ? errPayload.error
            : null) ?? "Grading failed.";
        throw new Error(msg);
      }

      const data = (await resp.json()) as {
        feedback: string;
        score: ExerciseGrade["score"];
        strengths: string[];
        improvements: string[];
        model: string;
      };

      const grade: ExerciseGrade = {
        feedback: data.feedback,
        score: data.score,
        strengths: data.strengths ?? [],
        improvements: data.improvements ?? [],
        model: data.model,
        gradedAt: new Date().toISOString(),
        answerHash: fingerprint(answer),
      };
      setGrade(pageId, key, grade);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Grading failed for", key, msg);
      setGradingError((s) => ({ ...s, [key]: msg }));
    } finally {
      setGradingState((s) => ({ ...s, [key]: "idle" }));
    }
  }

  return (
    <section
      aria-labelledby="exercise-responses-heading"
      className="mt-10 border-t border-rule bg-paper-3 px-[22px] py-6 md:px-0 md:py-8"
    >
      <h2
        id="exercise-responses-heading"
        className="mb-1.5 font-display text-[20px] font-extrabold tracking-[-0.015em] text-ink md:text-[24px]"
      >
        Your responses
      </h2>
      <p className="mb-5 max-w-[58ch] text-[13px] leading-[1.5] text-ink-2 md:text-[14px]">
        Type your answer below each exercise. Everything is saved on this
        device automatically. When you&rsquo;re ready, click &ldquo;Grade with
        AI&rdquo; to get feedback against the model answer.
      </p>

      <ol className="flex flex-col gap-5">
        {exercises.map((ex, idx) => {
          const key = exerciseInputKey(idx);
          const value = inputs[key] ?? "";
          const grade = grades[key];
          const gState = gradingState[key] ?? "idle";
          const gErr = gradingError[key];
          const trimmedAnswer = value.trim();
          const stale =
            grade?.answerHash !== undefined &&
            grade.answerHash !== fingerprint(trimmedAnswer);
          const gradingDisabled =
            !hydrated || gState === "building" || trimmedAnswer.length === 0;

          return (
            <li
              key={key}
              className="border border-rule bg-paper-3 px-4 py-4 md:px-5 md:py-5"
            >
              <label className="block">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-red">
                  Exercise {ex.number ?? idx + 1}
                </span>
                <span className="mt-1 block font-display text-[15px] font-bold leading-tight tracking-[-0.005em] text-ink md:text-[16px]">
                  {ex.title}
                </span>
                <textarea
                  value={value}
                  onChange={(e) => setInput(pageId, key, e.target.value)}
                  placeholder={
                    hydrated
                      ? "Type your answer here…"
                      : "Loading your saved response…"
                  }
                  disabled={!hydrated}
                  rows={Math.max(3, Math.min(10, value.split("\n").length + 1))}
                  className="mt-3 block w-full resize-y rounded-[2px] border border-rule bg-paper px-3 py-2.5 font-sans text-[14px] leading-[1.5] text-ink-2 outline-none placeholder:text-ink-4 focus:border-ink focus:text-ink"
                />
                {hydrated && value.trim().length > 0 ? (
                  <span className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-moss">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-moss" />
                    Saved · {value.trim().length} chars
                  </span>
                ) : null}
              </label>

              {/* Grade action row */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => gradeOne(idx)}
                  disabled={gradingDisabled}
                  className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:text-ink-4"
                >
                  {gState === "building"
                    ? "Grading…"
                    : grade
                    ? "Grade again"
                    : "Grade with AI"}
                </button>
                {!hydrated ? null : trimmedAnswer.length === 0 ? (
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
                    Type an answer to enable grading
                  </span>
                ) : null}
                {gErr ? (
                  <span className="tag crimson">
                    Grading failed — see console
                  </span>
                ) : null}
              </div>

              {gErr ? (
                <p className="mt-2 max-w-[58ch] text-[12px] leading-[1.5] text-red">
                  {gErr}
                </p>
              ) : null}

              {grade ? (
                <GradePanel
                  grade={grade}
                  stale={stale}
                  onRegrade={() => gradeOne(idx)}
                  onClear={() => clearGrade(pageId, key)}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/**
 * Cheap, deterministic fingerprint of an answer string. Used purely to flag
 * when a stored grade has gone stale because the candidate edited their
 * answer afterwards. Not a security hash — we just need a fast, collision-
 * resistant-enough integer for one input.
 */
function fingerprint(s: string): string {
  let h = 2166136261; // FNV-1a 32-bit offset basis
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

// Exercise parser lives in `@/lib/exercises` so the trainer Markdown export
// in `@/lib/progress/export` keys off the exact same logic.
