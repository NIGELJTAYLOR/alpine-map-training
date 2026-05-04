"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Quiz, QuizQuestion } from "@/lib/content";
import { MarkdownString } from "./markdown";
import { Button, buttonVariants } from "@/components/ui/button";

type ResponseStatus =
  | "unanswered"
  | "auto-correct"
  | "auto-incorrect"
  | "self-correct"
  | "self-partial"
  | "self-incorrect"
  | "skipped";

interface Response {
  value: unknown;
  status: ResponseStatus;
  submittedAt?: number;
}

type Responses = Record<string, Response>;

const SCORE_BY_STATUS: Record<ResponseStatus, number> = {
  unanswered: 0,
  "auto-correct": 1,
  "auto-incorrect": 0,
  "self-correct": 1,
  "self-partial": 0.5,
  "self-incorrect": 0,
  skipped: 0,
};

interface QuizPlayerProps {
  quiz: Quiz;
}

export function QuizPlayer({ quiz }: QuizPlayerProps) {
  const [idx, setIdx] = useState(0);
  const [responses, setResponses] = useState<Responses>({});
  const [finished, setFinished] = useState(false);
  const [startedAt] = useState(() => Date.now());

  const total = quiz.questions.length;
  const current = quiz.questions[idx];
  const response = responses[current.id] ?? { value: null, status: "unanswered" };

  function setResponse(id: string, partial: Partial<Response>) {
    setResponses((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? { value: null, status: "unanswered" }), ...partial },
    }));
  }

  function next() {
    if (idx < total - 1) setIdx(idx + 1);
    else setFinished(true);
  }
  function previous() {
    if (idx > 0) setIdx(idx - 1);
  }
  function skip() {
    setResponse(current.id, { status: "skipped", submittedAt: Date.now() });
    next();
  }
  function restart() {
    setIdx(0);
    setResponses({});
    setFinished(false);
  }

  if (finished) {
    return (
      <ScoreSummary
        quiz={quiz}
        responses={responses}
        elapsedMs={Date.now() - startedAt}
        onRestart={restart}
      />
    );
  }

  const answered = Object.values(responses).filter((r) => r.status !== "unanswered").length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>
            Question {idx + 1} of {total}
          </span>
          <span>{answered} answered</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((idx + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <QuestionCard
        key={current.id}
        question={current}
        response={response}
        setResponse={(p) => setResponse(current.id, p)}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border">
        <Button variant="outline" onClick={previous} disabled={idx === 0}>
          ← Previous
        </Button>
        <div className="flex gap-2">
          {response.status === "unanswered" ? (
            <Button variant="ghost" onClick={skip}>
              Skip
            </Button>
          ) : null}
          <Button onClick={next}>{idx === total - 1 ? "Finish" : "Next →"}</Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function QuestionCard({
  question,
  response,
  setResponse,
}: {
  question: QuizQuestion;
  response: Response;
  setResponse: (p: Partial<Response>) => void;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <header className="mb-4">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {question.id} · {question.title}
        </p>
        <div className="mt-2">
          <MarkdownString text={question.prompt} />
        </div>
      </header>

      <QuestionInput question={question} response={response} setResponse={setResponse} />

      <Feedback question={question} response={response} setResponse={setResponse} />
    </article>
  );
}

function QuestionInput({
  question,
  response,
  setResponse,
}: {
  question: QuizQuestion;
  response: Response;
  setResponse: (p: Partial<Response>) => void;
}) {
  const submitted = response.status !== "unanswered";

  if (question.type === "numeric") {
    return (
      <NumericInput
        question={question}
        response={response}
        setResponse={setResponse}
        submitted={submitted}
      />
    );
  }
  if (question.type === "mc") {
    return (
      <MultipleChoiceInput
        question={question}
        response={response}
        setResponse={setResponse}
        submitted={submitted}
      />
    );
  }
  if (question.type === "self-mark") {
    return (
      <SelfMarkInput
        question={question}
        response={response}
        setResponse={setResponse}
        submitted={submitted}
      />
    );
  }
  if (question.type === "practical") {
    return (
      <PracticalInput
        question={question}
        response={response}
        setResponse={setResponse}
        submitted={submitted}
      />
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Numeric
// ---------------------------------------------------------------------------

function NumericInput({
  question,
  response,
  setResponse,
  submitted,
}: {
  question: QuizQuestion;
  response: Response;
  setResponse: (p: Partial<Response>) => void;
  submitted: boolean;
}) {
  const inputs = question.inputs ?? [];
  const values = (response.value as Record<number, string> | null) ?? {};

  function update(i: number, v: string) {
    setResponse({ value: { ...values, [i]: v } });
  }

  function submit() {
    let allCorrect = true;
    for (let i = 0; i < inputs.length; i += 1) {
      const raw = values[i] ?? "";
      const parsed = Number(raw.replace(/[, ]/g, ""));
      const tol = inputs[i].tolerance ?? 0;
      if (Number.isNaN(parsed) || Math.abs(parsed - inputs[i].expected) > tol) {
        allCorrect = false;
        break;
      }
    }
    setResponse({
      status: allCorrect ? "auto-correct" : "auto-incorrect",
      submittedAt: Date.now(),
    });
  }

  return (
    <div className="space-y-3">
      {inputs.map((input, i) => (
        <label key={i} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <span className="font-sans text-sm font-medium text-foreground sm:w-56">
            {input.label}
          </span>
          <input
            type="text"
            inputMode="decimal"
            disabled={submitted}
            value={values[i] ?? ""}
            onChange={(e) => update(i, e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-base focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-70 sm:max-w-[14rem]"
          />
        </label>
      ))}
      {!submitted ? (
        <Button onClick={submit} className="mt-2">
          Submit answer
        </Button>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Multiple choice
// ---------------------------------------------------------------------------

function MultipleChoiceInput({
  question,
  response,
  setResponse,
  submitted,
}: {
  question: QuizQuestion;
  response: Response;
  setResponse: (p: Partial<Response>) => void;
  submitted: boolean;
}) {
  const options = question.options ?? [];
  const correct = question.correct;
  const value = response.value as number | null;

  function pick(i: number) {
    if (submitted) return;
    setResponse({ value: i });
  }
  function submit() {
    const isCorrect = Array.isArray(correct)
      ? value !== null && correct.includes(value)
      : value === correct;
    setResponse({
      status: isCorrect ? "auto-correct" : "auto-incorrect",
      submittedAt: Date.now(),
    });
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-2" role="radiogroup">
        {options.map((opt, i) => {
          const selected = value === i;
          const isCorrect = Array.isArray(correct) ? correct.includes(i) : i === correct;
          let stateClass = "";
          if (submitted) {
            if (isCorrect) stateClass = "border-success bg-success/10";
            else if (selected) stateClass = "border-destructive bg-destructive/10";
            else stateClass = "border-border opacity-70";
          } else if (selected) {
            stateClass = "border-primary bg-muted";
          } else {
            stateClass = "border-border hover:border-primary";
          }
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => pick(i)}
                disabled={submitted}
                className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${stateClass}`}
              >
                <span className="font-sans text-sm">{opt}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {!submitted ? (
        <Button onClick={submit} disabled={value === null} className="mt-2">
          Submit answer
        </Button>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Self-mark (open-text questions with model answer)
// ---------------------------------------------------------------------------

function SelfMarkInput({
  question,
  response,
  setResponse,
  submitted,
}: {
  question: QuizQuestion;
  response: Response;
  setResponse: (p: Partial<Response>) => void;
  submitted: boolean;
}) {
  const value = (response.value as string | null) ?? "";

  function update(v: string) {
    setResponse({ value: v });
  }
  function reveal() {
    setResponse({ status: "self-incorrect", submittedAt: Date.now() }); // initial; user re-marks below
  }

  return (
    <div className="space-y-3">
      <textarea
        rows={4}
        disabled={submitted}
        value={value}
        onChange={(e) => update(e.target.value)}
        placeholder="Type your answer here…"
        className="w-full rounded-md border border-input bg-background px-3 py-2 font-serif text-base leading-relaxed focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-70"
      />
      {!submitted ? (
        <Button onClick={reveal}>Show model answer & self-mark</Button>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Practical (sketch / field task — confirm done on paper)
// ---------------------------------------------------------------------------

function PracticalInput({
  question,
  response,
  setResponse,
  submitted,
}: {
  question: QuizQuestion;
  response: Response;
  setResponse: (p: Partial<Response>) => void;
  submitted: boolean;
}) {
  return (
    <div className="space-y-3">
      <p className="font-serif text-sm italic text-muted-foreground">
        Sketch tasks and field drills happen off-app. When you've completed it on
        paper or in the field, mark it below to log it against the quiz.
      </p>
      {!submitted ? (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setResponse({ status: "self-correct", value: "done", submittedAt: Date.now() })}>
            I have done this on paper
          </Button>
          <Button
            variant="outline"
            onClick={() => setResponse({ status: "skipped", value: "skipped", submittedAt: Date.now() })}
          >
            Skip for now
          </Button>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feedback strip (shown after submit)
// ---------------------------------------------------------------------------

function Feedback({
  question,
  response,
  setResponse,
}: {
  question: QuizQuestion;
  response: Response;
  setResponse: (p: Partial<Response>) => void;
}) {
  if (response.status === "unanswered") return null;

  const isAuto = question.type === "numeric" || question.type === "mc";
  const isCorrect = response.status === "auto-correct" || response.status === "self-correct";

  if (isAuto) {
    return (
      <aside
        className={`mt-4 rounded-lg border p-4 ${
          isCorrect
            ? "border-success/40 bg-success/10"
            : "border-destructive/40 bg-destructive/10"
        }`}
      >
        <p className="font-sans text-sm font-semibold">
          {isCorrect ? "Correct" : "Not quite"}
        </p>
        {question.explanation ? (
          <div className="mt-1">
            <MarkdownString text={question.explanation} />
          </div>
        ) : null}
      </aside>
    );
  }

  // Self-mark and practical: show model answer + self-mark buttons
  return (
    <aside className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <p className="font-sans text-xs uppercase tracking-[0.2em] text-primary">
        {question.type === "practical" ? "What good looks like" : "Model answer"}
      </p>
      <div className="mt-2">
        <MarkdownString
          text={question.modelAnswer ?? question.expectations ?? "—"}
          className="text-foreground"
        />
      </div>
      {question.type !== "practical" ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
          <p className="w-full font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Self-mark this answer
          </p>
          <SelfMarkButton
            label="Correct"
            active={response.status === "self-correct"}
            onClick={() => setResponse({ status: "self-correct" })}
            tone="success"
          />
          <SelfMarkButton
            label="Partially correct"
            active={response.status === "self-partial"}
            onClick={() => setResponse({ status: "self-partial" })}
            tone="warn"
          />
          <SelfMarkButton
            label="Incorrect"
            active={response.status === "self-incorrect"}
            onClick={() => setResponse({ status: "self-incorrect" })}
            tone="destructive"
          />
        </div>
      ) : null}
    </aside>
  );
}

function SelfMarkButton({
  label,
  active,
  onClick,
  tone,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone: "success" | "warn" | "destructive";
}) {
  const toneClass =
    tone === "success"
      ? "data-[active=true]:border-success data-[active=true]:bg-success/15 data-[active=true]:text-foreground"
      : tone === "warn"
      ? "data-[active=true]:border-contour data-[active=true]:bg-contour/15 data-[active=true]:text-foreground"
      : "data-[active=true]:border-destructive data-[active=true]:bg-destructive/15 data-[active=true]:text-foreground";

  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className={`rounded-md border border-border bg-background px-3 py-1.5 font-sans text-sm hover:border-foreground ${toneClass}`}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Score summary
// ---------------------------------------------------------------------------

function ScoreSummary({
  quiz,
  responses,
  elapsedMs,
  onRestart,
}: {
  quiz: Quiz;
  responses: Responses;
  elapsedMs: number;
  onRestart: () => void;
}) {
  const stats = useMemo(() => computeStats(quiz, responses), [quiz, responses]);
  const minutes = Math.max(1, Math.round(elapsedMs / 60000));

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-border bg-card p-6">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Result
        </p>
        <h2 className="mt-1 font-sans text-3xl font-semibold text-foreground">
          {stats.score} / {quiz.questions.length}
        </h2>
        <p className="mt-2 font-serif text-sm text-muted-foreground">
          {stats.autoCorrect} auto-graded correct · {stats.selfCorrect} self-marked correct ·{" "}
          {stats.selfPartial} partial · {stats.incorrect} incorrect ·{" "}
          {stats.skipped} skipped · {minutes} min
        </p>
        {stats.score >= 12 ? (
          <p className="mt-3 font-sans text-sm font-medium text-success">
            Above the readiness target (12+).
          </p>
        ) : (
          <p className="mt-3 font-sans text-sm font-medium text-destructive">
            Below the readiness target — see the error log below for the pages to revisit.
          </p>
        )}
      </header>

      <section>
        <h3 className="font-sans text-xl font-semibold text-foreground">
          By skill area
        </h3>
        <ul className="mt-3 space-y-2">
          {quiz.skillAreas.map((area) => {
            const inArea = stats.byArea[area.id] ?? { total: 0, score: 0 };
            return (
              <li
                key={area.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <span className="font-sans text-sm">{area.label}</span>
                <span className="font-mono text-sm text-muted-foreground">
                  {inArea.score} / {inArea.total}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h3 className="font-sans text-xl font-semibold text-foreground">Error log</h3>
        {stats.errorRows.length === 0 ? (
          <p className="mt-2 font-serif text-base text-muted-foreground">
            No incorrect or skipped questions.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="border border-border bg-muted px-3 py-2 font-sans">Q</th>
                  <th className="border border-border bg-muted px-3 py-2 font-sans">Skill area</th>
                  <th className="border border-border bg-muted px-3 py-2 font-sans">Page to revisit</th>
                  <th className="border border-border bg-muted px-3 py-2 font-sans">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.errorRows.map((row) => (
                  <tr key={row.id}>
                    <td className="border border-border px-3 py-2 font-mono">{row.id}</td>
                    <td className="border border-border px-3 py-2 font-sans">{row.skillLabel}</td>
                    <td className="border border-border px-3 py-2">
                      <Link
                        href={`/levels/${quiz.level}/${row.pageRef}`}
                        className="font-sans text-primary hover:underline"
                      >
                        {row.pageRef}
                      </Link>
                    </td>
                    <td className="border border-border px-3 py-2 font-sans">{row.statusLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button onClick={onRestart} variant="outline">
          Restart quiz
        </Button>
        <Link href={`/levels/${quiz.level}/${quiz.page}`} className={buttonVariants({ variant: "outline" })}>
          Back to {quiz.page}
        </Link>
        <Link href={`/levels/${quiz.level}`} className={buttonVariants({})}>
          Back to Level {quiz.level}
        </Link>
      </div>
    </div>
  );
}

function computeStats(quiz: Quiz, responses: Responses) {
  let autoCorrect = 0;
  let selfCorrect = 0;
  let selfPartial = 0;
  let incorrect = 0;
  let skipped = 0;
  let score = 0;
  const byArea: Record<string, { total: number; score: number }> = {};
  const errorRows: {
    id: string;
    skillLabel: string;
    pageRef: string;
    statusLabel: string;
  }[] = [];
  const skillLabel = (id: string) =>
    quiz.skillAreas.find((s) => s.id === id)?.label ?? id;
  const statusLabel = (s: ResponseStatus): string =>
    ({
      "auto-correct": "Correct",
      "auto-incorrect": "Incorrect",
      "self-correct": "Correct",
      "self-partial": "Partial",
      "self-incorrect": "Incorrect",
      skipped: "Skipped",
      unanswered: "Not answered",
    }[s]);

  for (const q of quiz.questions) {
    const r = responses[q.id] ?? { value: null, status: "unanswered" as const };
    const points = SCORE_BY_STATUS[r.status];
    score += points;
    byArea[q.skillArea] = byArea[q.skillArea] ?? { total: 0, score: 0 };
    byArea[q.skillArea].total += 1;
    byArea[q.skillArea].score += points;
    if (r.status === "auto-correct") autoCorrect += 1;
    else if (r.status === "self-correct") selfCorrect += 1;
    else if (r.status === "self-partial") selfPartial += 1;
    else if (r.status === "auto-incorrect" || r.status === "self-incorrect") incorrect += 1;
    else skipped += 1;
    if (
      r.status === "auto-incorrect" ||
      r.status === "self-incorrect" ||
      r.status === "self-partial" ||
      r.status === "skipped" ||
      r.status === "unanswered"
    ) {
      errorRows.push({
        id: q.id,
        skillLabel: skillLabel(q.skillArea),
        pageRef: q.pageRef,
        statusLabel: statusLabel(r.status),
      });
    }
  }

  return {
    score: Math.round(score * 2) / 2,
    autoCorrect,
    selfCorrect,
    selfPartial,
    incorrect,
    skipped,
    byArea,
    errorRows,
  };
}
