"use client";

import { MDXContent } from "@/lib/mdx";
import { mdxComponents } from "@/components/mdx/components";

/** Render an answer-key MDX body. No SelfCheckProvider — answer keys aren't progress-tracked. */
export function AnswerKeyBody({ body }: { body: string }) {
  return <MDXContent code={body} components={mdxComponents} />;
}
