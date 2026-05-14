/**
 * remark plugin: turn the author's "answer slot" conventions into typeable
 * <AnswerSlot> fields, and append a single <ExerciseField> grade button at
 * the end of each Exercise N section.
 *
 * Runs at content build time (velite). Operates on the parsed MDAST.
 *
 * Replaces three answer-slot conventions inside every Exercise section:
 *
 *   1. Standalone thematicBreak (a markdown line of 3+ underscores or
 *      hyphens parsed as a thematic break) → block-level AnswerSlot.
 *
 *   2. Inline runs of 4+ underscores within text nodes (e.g. "Map 1: ____",
 *      or a table cell containing "________") → inline AnswerSlot.
 *      Length of the run picks size: <20 chars = short input, else long
 *      textarea. Text-node walking is defensive — original node is left
 *      untouched if anything goes wrong.
 *
 *   3. Anything else is left alone.
 *
 * Slot numbering restarts at 1 within each Exercise section.
 *
 * After each exercise's body, an `<ExerciseField n="N" />` is appended
 * just before the next H3 (or end-of-file). That component renders the
 * Grade with AI button and grade panel covering all the exercise's slots.
 */

import type { Plugin } from "unified";
import type { Heading, Root, RootContent } from "mdast";

interface MdxJsxAttribute {
  type: "mdxJsxAttribute";
  name: string;
  value: string;
}

interface MdxJsxFlowElement {
  type: "mdxJsxFlowElement";
  name: string;
  attributes: MdxJsxAttribute[];
  children: RootContent[];
}

interface MdxJsxTextElement {
  type: "mdxJsxTextElement";
  name: string;
  attributes: MdxJsxAttribute[];
  children: RootContent[];
}

function headingText(node: Heading): string {
  let s = "";
  for (const child of node.children) {
    if (
      "value" in child &&
      typeof (child as { value?: unknown }).value === "string"
    ) {
      s += (child as { value: string }).value;
    }
  }
  return s.trim();
}

function makeExerciseField(n: number): MdxJsxFlowElement {
  return {
    type: "mdxJsxFlowElement",
    name: "ExerciseField",
    attributes: [{ type: "mdxJsxAttribute", name: "n", value: String(n) }],
    children: [],
  };
}

function makeAnswerSlotBlock(
  ex: number,
  q: number,
  size: "long" | "short",
): MdxJsxFlowElement {
  return {
    type: "mdxJsxFlowElement",
    name: "AnswerSlot",
    attributes: [
      { type: "mdxJsxAttribute", name: "ex", value: String(ex) },
      { type: "mdxJsxAttribute", name: "q", value: String(q) },
      { type: "mdxJsxAttribute", name: "size", value: size },
    ],
    children: [],
  };
}

function makeAnswerSlotInline(
  ex: number,
  q: number,
  size: "long" | "short",
): MdxJsxTextElement {
  return {
    type: "mdxJsxTextElement",
    name: "AnswerSlot",
    attributes: [
      { type: "mdxJsxAttribute", name: "ex", value: String(ex) },
      { type: "mdxJsxAttribute", name: "q", value: String(q) },
      { type: "mdxJsxAttribute", name: "size", value: size },
    ],
    children: [],
  };
}

function makeSketchSlot(
  ex: number,
  q: number,
  widthCm: number,
  heightCm: number,
): MdxJsxFlowElement {
  return {
    type: "mdxJsxFlowElement",
    name: "SketchSlot",
    attributes: [
      { type: "mdxJsxAttribute", name: "ex", value: String(ex) },
      { type: "mdxJsxAttribute", name: "q", value: String(q) },
      { type: "mdxJsxAttribute", name: "widthCm", value: String(widthCm) },
      { type: "mdxJsxAttribute", name: "heightCm", value: String(heightCm) },
    ],
    children: [],
  };
}

/**
 * Look for "[Sketch space - approximately N cm by M cm]" inside a text node.
 * If found, return the parsed dimensions. Tolerates minor variants:
 *   - "approximately" / "approx" / nothing
 *   - "cm by" / "cm x"
 *   - decimal dimensions
 * Returns null if not matched.
 */
function parseSketchMarker(
  value: string,
): { widthCm: number; heightCm: number } | null {
  const re =
    /\[\s*Sketch space\s*[-—]?\s*(?:approximately|approx\.?)?\s*([0-9.]+)\s*cm\s*(?:by|x|×)\s*([0-9.]+)\s*cm[^\]]*\]/i;
  const m = re.exec(value);
  if (!m) return null;
  const w = parseFloat(m[1]);
  const h = parseFloat(m[2]);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
  return { widthCm: w, heightCm: h };
}

/**
 * Walk every node in `nodes`, replacing answer-slot patterns as we go.
 * Returns the new node list and the next slot index. Recurses into any
 * node with a children array.
 */
function rewriteSubtree(
  nodes: RootContent[],
  ex: number,
  startQ: number,
): { out: RootContent[]; nextQ: number } {
  let q = startQ;
  const result: RootContent[] = [];

  for (const node of nodes) {
    // ----- Standalone underscore line (parsed as thematic break) -----
    if (node.type === "thematicBreak") {
      q += 1;
      result.push(makeAnswerSlotBlock(ex, q, "long") as unknown as RootContent);
      continue;
    }

    // ----- "[Sketch space - approximately N cm by M cm]" marker -----
    // Detected at the paragraph level (a paragraph containing only this
    // marker text). Replace the whole paragraph with a block SketchSlot.
    if (
      node.type === "paragraph" &&
      Array.isArray((node as { children?: unknown }).children)
    ) {
      const para = node as { children: { type: string; value?: string }[] };
      // Collect the paragraph's combined text content
      let combined = "";
      for (const child of para.children) {
        if (child.type === "text" && typeof child.value === "string") {
          combined += child.value;
        }
      }
      const sketch = parseSketchMarker(combined);
      if (sketch && /^\s*\[\s*Sketch space/i.test(combined)) {
        q += 1;
        result.push(
          makeSketchSlot(ex, q, sketch.widthCm, sketch.heightCm) as unknown as RootContent,
        );
        continue;
      }
    }

    // ----- Inline underscore runs inside a text node -----
    if (node.type === "text") {
      const raw = (node as { value?: unknown }).value;
      if (typeof raw === "string" && /_{4,}/.test(raw)) {
        const split = splitTextOnUnderscores(raw);
        // Defensive: must produce at least one slot to be a worthwhile
        // substitution. If it doesn't, leave the original alone.
        const hasSlot = split.some((s) => s.kind === "slot");
        if (hasSlot) {
          for (const seg of split) {
            if (seg.kind === "text") {
              if (seg.value.length > 0) {
                result.push({
                  type: "text",
                  value: seg.value,
                } as unknown as RootContent);
              }
            } else {
              q += 1;
              const size: "long" | "short" =
                seg.value.length < 20 ? "short" : "long";
              result.push(
                makeAnswerSlotInline(ex, q, size) as unknown as RootContent,
              );
            }
          }
          continue;
        }
      }
      result.push(node);
      continue;
    }

    // ----- Container nodes: recurse into children -----
    if (
      node !== null &&
      typeof node === "object" &&
      "children" in node &&
      Array.isArray((node as { children?: unknown }).children)
    ) {
      const inner = rewriteSubtree(
        (node as { children: RootContent[] }).children,
        ex,
        q,
      );
      (node as { children: RootContent[] }).children = inner.out;
      q = inner.nextQ;
    }
    result.push(node);
  }

  return { out: result, nextQ: q };
}

interface UnderscoreSegment {
  kind: "text" | "slot";
  value: string;
}

function splitTextOnUnderscores(value: string): UnderscoreSegment[] {
  const re = /_{4,}/g;
  const out: UnderscoreSegment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(value)) !== null) {
    if (m.index > last) {
      out.push({ kind: "text", value: value.slice(last, m.index) });
    }
    out.push({ kind: "slot", value: m[0] });
    last = m.index + m[0].length;
  }
  if (last < value.length) {
    out.push({ kind: "text", value: value.slice(last) });
  }
  return out;
}

export const remarkExerciseFields: Plugin<[], Root> = function () {
  return (tree) => {
    const out: RootContent[] = [];
    let currentN: number | null = null;
    let buffer: RootContent[] = [];

    function flush() {
      if (currentN !== null) {
        const rewritten = rewriteSubtree(buffer, currentN, 0);
        out.push(...rewritten.out);
        out.push(makeExerciseField(currentN) as unknown as RootContent);
      } else {
        out.push(...buffer);
      }
      buffer = [];
      currentN = null;
    }

    for (const node of tree.children) {
      if (node.type === "heading" && (node as Heading).depth === 3) {
        const text = headingText(node as Heading);
        const m = /^Exercise\s+(\d+)/i.exec(text);
        if (m) {
          flush();
          currentN = parseInt(m[1], 10);
          buffer.push(node);
          continue;
        }
        flush();
        out.push(node);
        continue;
      }
      if (currentN !== null) {
        buffer.push(node);
      } else {
        out.push(node);
      }
    }
    flush();

    tree.children = out;
  };
};

export default remarkExerciseFields;
