/**
 * Prompt construction for the AI grader.
 *
 * Lives outside the API route so the same prompts can be unit-tested
 * separately and reused if we ever add a "preview prompt" debug surface.
 *
 * Designed for Claude Haiku 4.5 as the default model. The structured JSON
 * response is locked to `GradeJson`; the route validates the shape on the
 * way back out.
 */

import { BRAND } from "@/config/brand";

export interface GradingInputs {
  /** "Exercise N — title" used in the prompt header for context. */
  exerciseTitle: string;
  /**
   * Body markdown taken from the workbook page between this exercise's
   * "### Exercise N" heading and the next H3 / EOF. Gives the model the
   * full prompt the candidate was answering.
   */
  exercisePrompt: string;
  /**
   * Body markdown taken from the matching section of the answer-key MDX.
   * The grader treats this as the gold standard for "met".
   */
  modelAnswer: string;
  /** The candidate's typed answer, raw. */
  candidateAnswer: string;
}

export interface GradeJson {
  score: "met" | "nearly" | "not-yet";
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export function buildGradingSystemPrompt(): string {
  return `You are an experienced trainer in ${BRAND.subject}.

You are grading a candidate's written answer to one exercise from their workbook.
Be supportive but honest. Use UK British English throughout (e.g. "behaviour",
"colour", "metres"). Do not use em dashes (—); prefer simple punctuation.
Address the candidate directly as "you".

Return ONLY a valid JSON object on a single response with this exact shape:

{
  "score": "met" | "nearly" | "not-yet",
  "feedback": "<two to three sentences of trainer-style feedback, second person>",
  "strengths": ["<concise strength>", "..."],
  "improvements": ["<concise improvement>", "..."]
}

Scoring rubric:
  - "met"     = the candidate's answer covers the model answer's key points correctly.
  - "nearly"  = the answer is on the right track but missing detail or contains a minor error.
  - "not-yet" = the answer misses the core point, contains a significant error, or is essentially absent.

Rules for the lists:
  - "strengths" must contain two or three items, each a short phrase or single sentence.
  - "improvements" must contain two or three items, each a short phrase or single sentence.
  - If the candidate's answer is genuinely empty or trivial, return score "not-yet",
    a single "feedback" sentence acknowledging there is nothing to grade yet, one item in
    "strengths" ("You have attempted the exercise"), and two items in "improvements"
    explaining what an answer would need to cover.

Do not include any text, markdown, or code fences outside the JSON object.`;
}

export function buildGradingUserPrompt(inputs: GradingInputs): string {
  return [
    `Exercise: ${inputs.exerciseTitle}`,
    "",
    "Exercise prompt (what the candidate was asked):",
    inputs.exercisePrompt.trim() || "(no prompt body)",
    "",
    "Model answer (your reference for what a fully met answer looks like):",
    inputs.modelAnswer.trim() || "(no model answer available — grade against general knowledge of the subject)",
    "",
    "Candidate's answer:",
    inputs.candidateAnswer.trim() || "(empty)",
    "",
    "Produce the grading JSON now.",
  ].join("\n");
}

/**
 * Validate and narrow a parsed JSON value into a `GradeJson`. Returns null
 * if any required field is missing or has the wrong shape.
 */
export function parseGradeJson(raw: unknown): GradeJson | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const score = r.score;
  if (score !== "met" && score !== "nearly" && score !== "not-yet") return null;
  if (typeof r.feedback !== "string" || r.feedback.trim().length === 0) {
    return null;
  }
  const strengths = Array.isArray(r.strengths)
    ? r.strengths.filter((s): s is string => typeof s === "string")
    : null;
  const improvements = Array.isArray(r.improvements)
    ? r.improvements.filter((s): s is string => typeof s === "string")
    : null;
  if (!strengths || !improvements) return null;
  return {
    score,
    feedback: r.feedback,
    strengths,
    improvements,
  };
}
