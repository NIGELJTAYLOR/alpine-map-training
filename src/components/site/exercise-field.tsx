"use client";

import { useState } from "react";
import { useProgress } from "@/lib/progress/provider";
import { splitByExerciseHeadings } from "@/lib/exercises";
import { usePageContext } from "@/components/site/page-context";
import { GradePanel } from "@/components/site/grade-panel";
import type { ExerciseGrade } from "@/lib/progress/types";

interface ExerciseFieldProps {
  /**
   * Exercise number, supplied by the remark plugin as a string attribute
   * (`<ExerciseField n="3" />`). Falls back to NaN when missing — the
   * component returns null in that case rather than render a broken slot.
   */
  n: string | number;
}

type GradingState = "idle" | "building";

/**
 * Inline "Grade with AI" button + grade panel rendered at the end of each
 * Exercise N section.
 *
 * This component does NOT render a textarea. The per-question textareas
 * are <AnswerSlot> components inserted by the same remark plugin into
 * each exercise body. ExerciseField gathers every `inputs["ex-{N}-q*"]`
 * value when grading and concatenates them so the model sees the full
 * set of answers for the exercise.
 *
 * Stable storage:
 *   - grades[`ex-{N}`]   = the single grade for this whole exercise
 *
 * pageId and the answer-key body come from PageContext so the JSX tag
 * stays minimal at the call site.
 */
export function ExerciseField({ n }: ExerciseFieldProps) {
  const exerciseNumber = typeof n === "number" ? n : parseInt(String(n), 10);
  const { pageId, answerKeyBody } = usePageContext();
  const { hydrated, getPage, setGrade, clearGrade } = useProgress();
  const [gState, setGState] = useState<GradingState>("idle");
  const [gErr, setGErr] = useState<string>("");

  if (!Number.isFinite(exerciseNumber) || exerciseNumber < 1) return null;

  const gradeKey = `ex-${exerciseNumber}`;
  const pageProgress = hydrated ? getPage(pageId) : undefined;
  const inputs = pageProgress?.inputs ?? {};
  const grade = pageProgress?.grades?.[gradeKey];

  // Collect every per-question slot value for this exercise, in q order.
  const slotPrefix = `ex-${exerciseNumber}-q`;
  const slotEntries = Object.entries(inputs)
    .filter(([k]) => k.startsWith(slotPrefix))
    .map(([k, v]) => {
      const q = parseInt(k.slice(slotPrefix.length), 10);
      return { q, value: v };
    })
    .filter((e) => Number.isFinite(e.q))
    .sort((a, b) => a.q - b.q);

  const combinedAnswer = slotEntries
    .map((e) => `Q${e.q}: ${e.value.trim() || "(no answer)"}`)
    .join("\n\n");
  const hasAnyAnswer = slotEntries.some((e) => e.value.trim().length > 0);
  const stale =
    grade?.answerHash !== undefined &&
    grade.answerHash !== fingerprint(combinedAnswer);
  const gradingDisabled =
    !hydrated || gState === "building" || !hasAnyAnswer;

  async function gradeOne() {
    let modelBody = "";
    if (answerKeyBody) {
      const sections = splitByExerciseHeadings(answerKeyBody);
      const match = sections.find((s) => s.number === exerciseNumber);
      modelBody = match?.body ?? "";
    }

    setGState("building");
    setGErr("");
    try {
      const resp = await fetch("/api/grade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          exerciseTitle: `Exercise ${exerciseNumber}`,
          exercisePrompt: "",
          modelAnswer: modelBody,
          candidateAnswer: combinedAnswer,
        }),
      });
      if (!resp.ok) {
        const errPayload = await resp
          .json()
          .catch(() => ({ error: `HTTP ${resp.status}` }));
        const msg =
          errPayload && typeof errPayload.error === "string"
            ? errPayload.error
            : "Grading failed.";
        throw new Error(msg);
      }
      const data = (await resp.json()) as {
        feedback: string;
        score: ExerciseGrade["score"];
        strengths: string[];
        improvements: string[];
        model: string;
      };
      const next: ExerciseGrade = {
        feedback: data.feedback,
        score: data.score,
        strengths: data.strengths ?? [],
        improvements: data.improvements ?? [],
        model: data.model,
        gradedAt: new Date().toISOString(),
        answerHash: fingerprint(combinedAnswer),
      };
      setGrade(pageId, gradeKey, next);
    } catch (err) {
      console.error("Grading failed for", gradeKey, err);
      setGErr(err instanceof Error ? err.message : String(err));
    } finally {
      setGState("idle");
    }
  }

  return (
    <div className="not-prose my-6 border border-rule bg-paper-3 px-4 py-3 md:px-5 md:py-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={gradeOne}
          disabled={gradingDisabled}
          className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:text-ink-4"
        >
          {gState === "building"
            ? "Grading…"
            : grade
            ? "Grade again"
            : `Grade Exercise ${exerciseNumber} with AI`}
        </button>
        {hydrated && !hasAnyAnswer ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
            Type answers above to enable grading
          </span>
        ) : null}
        {gErr ? (
          <span className="tag crimson">Grading failed — see console</span>
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
          onRegrade={gradeOne}
          onClear={() => clearGrade(pageId, gradeKey)}
        />
      ) : null}
    </div>
  );
}

/** Same fingerprint as elsewhere in the progress pipeline. */
function fingerprint(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
