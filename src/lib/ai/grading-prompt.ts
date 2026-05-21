/**
 * Prompt construction for the AI grader.
 *
 * Lives outside the API route so the same prompts can be unit-tested
 * separately and reused if we ever add a "preview prompt" debug surface.
 *
 * Designed for Claude Haiku 4.5 as the default model. The structured JSON
 * response is locked to `GradeJson`; the route validates the shape on the
 * way back out.
 *
 * Grading philosophy (V1.3+):
 *   - Lenient but fair. Accept paraphrase, synonyms, and alternative valid
 *     framings. Borderline "met / nearly" cases default to "met".
 *   - Marking-scheme based. The grader extracts 2 to 4 concept-level points
 *     from the model answer and checks each against the candidate's response,
 *     rather than doing a one-shot literal comparison.
 *   - Chain-of-thought permitted. The model writes a short <analysis> block
 *     before the JSON; the route strips it before returning to the client.
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

/** One concept-level point extracted from the model answer. */
export interface GradeMarkingPoint {
  /** Plain-language statement of the point the answer should make. */
  point: string;
  /** True if the candidate covered this point (in any wording). */
  covered: boolean;
}

export interface GradeJson {
  score: "met" | "nearly" | "not-yet";
  feedback: string;
  markingPoints: GradeMarkingPoint[];
  strengths: string[];
  improvements: string[];
}

export function buildGradingSystemPrompt(): string {
  return `You are an experienced trainer in ${BRAND.subject}.

You are grading a candidate's written answer to one exercise from their course. Your job is to encourage learning while being honest about gaps. Use UK British English (for example "behaviour", "colour", "metres"). Do not use em dashes; prefer simple punctuation. Address the candidate directly as "you".

# How to grade

Step 1. Read the model answer and identify 2 to 4 MARKING POINTS. A marking point is a concept, fact, or idea the answer needs to demonstrate. It is NOT a specific phrase or wording.

Step 2. For each marking point, check whether the candidate's answer covers it. Accept generously:
- Paraphrase, synonyms, and rephrasing in the candidate's own words.
- Alternative but valid framings of the same concept.
- Examples that demonstrate understanding.
- Partial wording where the intent is clear from context.

Do NOT require:
- Verbatim phrases from the model answer.
- The same order or structure.
- Identical examples.

If you would accept the answer from a candidate sitting an oral assessment, you should accept it here.

Step 3. Score based on coverage.
- "met"     = the candidate covered all or nearly all marking points. The core understanding is clear, even if wording differs from the model answer.
- "nearly"  = the candidate covered some marking points but missed at least one important one, OR introduced a misconception that should be corrected.
- "not-yet" = the candidate missed the core point, gave a wrong answer, or the response is essentially absent.

For borderline cases between "met" and "nearly", default to "met". Give the candidate the benefit of the doubt; they are learning.

# Output

First, write a brief analysis between <analysis> and </analysis> tags listing each marking point and whether the candidate hit it. Keep it short.

Then output ONLY a valid JSON object (no code fences, no extra text) with this exact shape:

{
  "score": "met" | "nearly" | "not-yet",
  "feedback": "<two to three sentences, second person, supportive>",
  "markingPoints": [
    { "point": "<the marking point in plain language>", "covered": true }
  ],
  "strengths": ["<concise strength>"],
  "improvements": ["<concise improvement>"]
}

Rules:
- "markingPoints" must contain 2 to 4 items.
- "strengths" must contain 1 to 3 items.
- "improvements" must contain 1 to 3 items.
- Marking-point text is plain language readable to the candidate, not jargon-dense.
- If the candidate's answer is empty or trivial, return "not-yet" with one strength ("You have attempted the exercise") and improvements that explain what an answer would need to cover.

# Two worked examples

## Example 1: paraphrase accepted, scored "met"

Exercise prompt: Explain why an altimeter must be reset at a known elevation.
Model answer: Atmospheric pressure changes through the day, so an altimeter must be reset at a point of known elevation to remain accurate.
Candidate's answer: Air pressure shifts during the day. If you don't recalibrate at a spot whose height you know, your readings will drift.

<analysis>
1. Atmospheric pressure varies through the day. Candidate said "air pressure shifts during the day". COVERED.
2. Altimeter must be reset at a known-elevation point. Candidate said "recalibrate at a spot whose height you know". COVERED.
3. Otherwise the reading is unreliable. Candidate said "your readings will drift". COVERED.
All marking points covered in different wording. Score: met.
</analysis>
{"score":"met","feedback":"You captured the cause and the corrective action clearly. Your wording is your own, which is fine; what matters here is understanding, not exact phrasing.","markingPoints":[{"point":"Atmospheric pressure varies through the day","covered":true},{"point":"Altimeter must be reset at a known-elevation point","covered":true},{"point":"Without recalibration the reading drifts","covered":true}],"strengths":["Cause and effect are both stated","Clear, plain language"],"improvements":["You could add when you would typically reset, such as at lift stations"]}

## Example 2: partial answer, scored "nearly"

Exercise prompt: List three signs of an approaching front.
Model answer: A drop in barometric pressure, lenticular or altocumulus cloud build-up, and a marked wind shift in direction or speed.
Candidate's answer: The clouds change shape.

<analysis>
1. Drop in barometric pressure. NOT COVERED.
2. Specific cloud build-up. Candidate said clouds change shape, which gestures at this but is too vague to count as covered.
3. Wind shift in direction or speed. NOT COVERED.
One vague mention, two missed. The candidate engaged but the answer is incomplete. Score: nearly.
</analysis>
{"score":"nearly","feedback":"You picked up on cloud change, which is one of the signals. To complete the answer the cloud type should be named, and two more indicators are needed.","markingPoints":[{"point":"Drop in barometric pressure","covered":false},{"point":"Specific cloud build-up such as lenticular or altocumulus","covered":false},{"point":"Marked wind shift in direction or speed","covered":false}],"strengths":["You recognised that cloud changes are an indicator"],"improvements":["Name the cloud types associated with an approaching front","Add the barometric pressure signal","Add the wind shift signal"]}

End of examples. Grade the candidate's answer that follows.`;
}

export function buildGradingUserPrompt(inputs: GradingInputs): string {
  return [
    `Exercise: ${inputs.exerciseTitle}`,
    "",
    "Exercise prompt (what the candidate was asked):",
    inputs.exercisePrompt.trim() || "(no prompt body)",
    "",
    "Model answer (your reference for what a fully met answer looks like):",
    inputs.modelAnswer.trim() ||
      "(no model answer available; grade against general knowledge of the subject)",
    "",
    "Candidate's answer:",
    inputs.candidateAnswer.trim() || "(empty)",
    "",
    "Produce the analysis and grading JSON now.",
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

  // markingPoints is required in the new prompt but we accept older responses
  // (e.g. cached upstream test rigs) that omit it by falling back to an empty
  // list. The UI hides the section when the list is empty.
  let markingPoints: GradeMarkingPoint[] = [];
  if (Array.isArray(r.markingPoints)) {
    markingPoints = r.markingPoints
      .map((mp): GradeMarkingPoint | null => {
        if (!mp || typeof mp !== "object") return null;
        const m = mp as Record<string, unknown>;
        if (typeof m.point !== "string" || m.point.trim().length === 0) {
          return null;
        }
        if (typeof m.covered !== "boolean") return null;
        return { point: m.point, covered: m.covered };
      })
      .filter((mp): mp is GradeMarkingPoint => mp !== null);
  }

  return {
    score,
    feedback: r.feedback,
    markingPoints,
    strengths,
    improvements,
  };
}
