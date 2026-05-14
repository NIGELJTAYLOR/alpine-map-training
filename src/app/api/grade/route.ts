/**
 * AI grading endpoint.
 *
 *   POST /api/grade
 *
 * The candidate's browser sends the resolved exercise prompt, model answer,
 * and candidate's typed answer; this server route forwards them to the
 * Anthropic API with a structured prompt and returns a typed grade.
 *
 * Why server-side:
 *   - The Anthropic API key must never reach the browser. It lives in
 *     `process.env.ANTHROPIC_API_KEY` (set in `.env.local` during dev and
 *     in Vercel's project env vars in production).
 *   - Lets us add caching, rate limiting, and model selection on the
 *     server later without changing the client surface.
 *
 * Default model is Claude Haiku 4.5 (claude-haiku-4-5-20251001). The
 * client may override with `body.model` if the user has chosen a different
 * model in settings.
 */

import { NextResponse } from "next/server";
import {
  buildGradingSystemPrompt,
  buildGradingUserPrompt,
  parseGradeJson,
  type GradingInputs,
} from "@/lib/ai/grading-prompt";

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const ANTHROPIC_VERSION = "2023-06-01";
const MAX_TOKENS = 1024;

// Models the route is willing to forward to. Defensive allowlist so a
// caller can't spend money on, say, Opus by typing it into a query string.
const ALLOWED_MODELS = new Set([
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-6",
  "claude-opus-4-6",
]);

export const runtime = "nodejs";
// Edge runtime would also work, but Node gives us slightly easier debugging
// and parity with the Anthropic SDK should we adopt it later.

interface GradeRequestBody extends GradingInputs {
  model?: string;
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY is not set on the server. Add it to .env.local and restart the dev server.",
      },
      { status: 500 },
    );
  }

  let body: GradeRequestBody;
  try {
    body = (await request.json()) as GradeRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  // ---- Validate inputs
  const required: Array<keyof GradingInputs> = [
    "exerciseTitle",
    "exercisePrompt",
    "modelAnswer",
    "candidateAnswer",
  ];
  for (const k of required) {
    if (typeof body[k] !== "string") {
      return NextResponse.json(
        { error: `Missing or invalid field: ${k}` },
        { status: 400 },
      );
    }
  }

  const model =
    typeof body.model === "string" && ALLOWED_MODELS.has(body.model)
      ? body.model
      : DEFAULT_MODEL;

  // ---- Build prompts
  const systemPrompt = buildGradingSystemPrompt();
  const userPrompt = buildGradingUserPrompt({
    exerciseTitle: body.exerciseTitle,
    exercisePrompt: body.exercisePrompt,
    modelAnswer: body.modelAnswer,
    candidateAnswer: body.candidateAnswer,
  });

  // ---- Call Anthropic
  let upstream: Response;
  try {
    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
  } catch (err) {
    console.error("Anthropic fetch failed:", err);
    return NextResponse.json(
      { error: "Could not reach the Anthropic API." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");
    console.error("Anthropic non-200:", upstream.status, errText);
    return NextResponse.json(
      {
        error: `Anthropic API returned ${upstream.status}. ${errText.slice(0, 400)}`,
      },
      { status: upstream.status },
    );
  }

  const payload = (await upstream.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = payload.content
    ?.filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("\n")
    .trim();

  if (!text) {
    return NextResponse.json(
      { error: "Empty grading response." },
      { status: 502 },
    );
  }

  // The system prompt asks for raw JSON. Some models still wrap it in
  // ```json ... ``` despite the instruction. Strip defensively.
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("Grade JSON parse failed:", err, "raw:", cleaned);
    return NextResponse.json(
      {
        error:
          "The grader returned text that wasn't valid JSON. Try again or switch to a different model.",
        raw: cleaned,
      },
      { status: 502 },
    );
  }

  const grade = parseGradeJson(parsed);
  if (!grade) {
    return NextResponse.json(
      {
        error:
          "The grader returned JSON but it didn't match the expected shape.",
        raw: parsed,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ...grade, model });
}
