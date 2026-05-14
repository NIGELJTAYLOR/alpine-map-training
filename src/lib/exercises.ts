/**
 * Shared exercise parser.
 *
 * Convention: a workbook exercise is an H3 heading whose text begins with
 * "Exercise". Examples accepted:
 *   "### Exercise 1 — Label the aspect"
 *   "### Exercise 1 - Label the aspect"
 *   "### Exercise 1: Label the aspect"
 *   "### Exercise 1 Label the aspect"
 *
 * Used by the trainer Markdown export (`@/lib/progress/export`) and the
 * AI grader (`@/lib/ai/grading-prompt`) to scan workbook content. The
 * per-question `<AnswerSlot>` fields are inserted at MDX build time by
 * `velite/remark-exercise-fields`.
 *
 * Framework note: content-agnostic. Any future customer's workbook that
 * adopts the "### Exercise N" convention reuses both surfaces unchanged.
 */

export interface ParsedExercise {
  /** Exercise number from the heading, or null if it couldn't be parsed. */
  number: number | null;
  /** The title portion after "Exercise N —". Falls back to the raw heading. */
  title: string;
}

export function parseExercises(body: string): ParsedExercise[] {
  const lines = body.split("\n");
  const out: ParsedExercise[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line.startsWith("### ")) continue;
    const text = line.slice(4).trim();
    if (!/^Exercise\b/i.test(text)) continue;
    const m = text.match(/^Exercise\s+(\d+)\s*(?:[—\-:·]\s*)?(.+)?$/i);
    if (m) {
      const number = parseInt(m[1], 10);
      const title = (m[2] ?? `Exercise ${m[1]}`).trim();
      out.push({ number: Number.isNaN(number) ? null : number, title });
    } else {
      out.push({ number: null, title: text });
    }
  }
  return out;
}

export interface ExerciseSection extends ParsedExercise {
  /** Body text that appears between this exercise's H3 and the next H3 / EOF. */
  body: string;
}

/**
 * Split a Markdown body by "### Exercise N" headings and return each
 * exercise alongside the body text underneath it (up to the next H3 of any
 * kind, or EOF).
 *
 * Used by:
 *   - the workbook page body to extract per-exercise prompts
 *   - the answer key body to extract per-exercise model answers
 *
 * Both consumers want the same per-exercise slicing so the AI grader can
 * pair the candidate's typed answer (keyed by exercise index) with the
 * matching prompt and model answer.
 */
export function splitByExerciseHeadings(body: string): ExerciseSection[] {
  const lines = body.split("\n");
  const out: ExerciseSection[] = [];
  let current: ExerciseSection | null = null;

  for (const raw of lines) {
    const line = raw;
    const trimmed = line.trim();
    const isH3 = trimmed.startsWith("### ");

    if (isH3) {
      // Close any open exercise
      if (current) {
        current.body = current.body.replace(/\s+$/, "");
        out.push(current);
        current = null;
      }
      const text = trimmed.slice(4).trim();
      if (/^Exercise\b/i.test(text)) {
        const m = text.match(/^Exercise\s+(\d+)\s*(?:[—\-:·]\s*)?(.+)?$/i);
        if (m) {
          const number = parseInt(m[1], 10);
          const title = (m[2] ?? `Exercise ${m[1]}`).trim();
          current = {
            number: Number.isNaN(number) ? null : number,
            title,
            body: "",
          };
        } else {
          current = { number: null, title: text, body: "" };
        }
      }
      // If it's a non-Exercise H3, current stays closed — we ignore the
      // intervening section for grading purposes.
      continue;
    }

    if (current) {
      current.body += line + "\n";
    }
  }

  if (current) {
    current.body = current.body.replace(/\s+$/, "");
    out.push(current);
  }

  return out;
}
