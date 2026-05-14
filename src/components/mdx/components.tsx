"use client";

import type { ComponentPropsWithoutRef } from "react";
import { SelfCheckCheckbox } from "@/components/site/self-check-checkbox";
import { DiagramCard } from "@/components/site/diagram-card";
import { AnswerSlot } from "@/components/site/answer-slot";
import { ExerciseField } from "@/components/site/exercise-field";
import { getDiagramByRef } from "@/lib/content";

interface DiagramTagProps {
  /** Short reference like "L1.1", "L2.14", "L3.1a". */
  fig: string;
  /** Hide the caption block under the figure. Defaults to true. */
  showCaption?: boolean;
}

/** Replace native HTML elements emitted by MDX with Carta-styled versions. */
export const mdxComponents = {
  // Inserted by the remark-exercise-fields velite plugin.
  //   <AnswerSlot ex q size />  — one typeable answer field, placed inline
  //     wherever the author wrote `____` in the source MDX.
  //   <ExerciseField n />       — Grade with AI button + grade panel at the
  //     end of each Exercise N section. Reads every `ex-{n}-q*` slot value.
  AnswerSlot,
  ExerciseField,
  Diagram: ({ fig, showCaption = true }: DiagramTagProps) => {
    const diagram = getDiagramByRef(fig);
    if (!diagram) {
      return (
        <div className="my-6 rounded-md border border-dashed border-rule bg-paper-3 p-3 text-sm text-ink-3">
          Diagram not found: <code className="font-mono">{fig}</code>
        </div>
      );
    }
    return <DiagramCard diagram={diagram} showCaption={showCaption} />;
  },
  input: (props: ComponentPropsWithoutRef<"input">) => {
    if (props.type === "checkbox") {
      return <SelfCheckCheckbox {...props} />;
    }
    return <input {...props} />;
  },
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1
      {...props}
      className="font-display text-3xl font-medium tracking-[-0.015em] text-ink mt-12 mb-4"
    />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      {...props}
      className="font-display text-2xl font-medium tracking-[-0.01em] text-ink mt-12 mb-3"
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => {
    const text = String(props.children ?? "");
    const variant = h3Variant(text);
    return (
      <h3
        {...props}
        className={`font-display text-lg font-medium tracking-[-0.01em] ${variant} mt-8 mb-2`}
      />
    );
  },
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p {...props} className="font-sans text-[15px] leading-relaxed text-ink-2 my-3" />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul {...props} className="font-sans text-[15px] leading-relaxed text-ink-2 my-3 ml-6 list-disc space-y-1" />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol {...props} className="font-sans text-[15px] leading-relaxed text-ink-2 my-3 ml-6 list-decimal space-y-1" />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li {...props} className="pl-1 marker:text-ink-3" />,
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-5 overflow-x-auto rounded-md border border-rule">
      <table {...props} className="w-full border-collapse text-left text-sm" />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      {...props}
      className="border-b border-rule bg-paper-3 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3"
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td {...props} className="border-b border-rule px-3 py-2 align-top text-ink-2 last:border-b-0" />
  ),
  hr: () => (
    <hr className="my-10 border-0 border-t border-rule" />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code {...props} className="rounded-[3px] bg-paper-2 px-1.5 py-0.5 font-mono text-[13px] text-ink" />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      {...props}
      className="my-5 border-l-2 border-l-contour pl-4 italic text-ink-3"
    />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong {...props} className="font-semibold text-ink" />
  ),
};

/** Tag certain H3s with a Carta colour cue based on their text content. */
function h3Variant(text: string): string {
  if (/^learning aim$/i.test(text)) return "text-contour";
  if (/^worked example$/i.test(text)) return "text-contour";
  if (/^exercise\b/i.test(text)) return "text-ink";
  if (/^self[- ]check$/i.test(text)) return "text-moss";
  if (/^reflection$/i.test(text)) return "text-ink-3";
  if (/^questions?$/i.test(text)) return "text-ink";
  return "text-ink";
}
