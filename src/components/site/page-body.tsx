"use client";

import { MDXContent } from "@/lib/mdx";
import { mdxComponents } from "@/components/mdx/components";
import { PageContextProvider } from "./page-context";
import { SelfCheckProvider } from "./self-check-context";

interface PageBodyProps {
  pageId: string;
  /** Velite-compiled MDX body, used for rendering. */
  body: string;
  /**
   * Raw markdown of this lesson, passed through to the page context so
   * `<ExerciseField>` can extract the matching exercise prompt for AI
   * grading. Without this the grader is asked to mark answers blind.
   */
  pageRawBody?: string;
  /**
   * Raw markdown of the matching answer key, passed through to the
   * page context so the inline `<ExerciseField>` components can extract
   * the per-exercise model answer for AI grading.
   */
  answerKeyBody?: string;
}

/**
 * Renders a Velite-compiled MDX body inside:
 *   - SelfCheckProvider, so `- [ ]` checkboxes bind to the progress store
 *   - PageContextProvider, so any `<ExerciseField>` component inserted by
 *     the remark-exercise-fields plugin can look up its pageId, the
 *     matching exercise prompt, and the answer-key body without props on
 *     the JSX tag.
 */
export function PageBody({
  pageId,
  body,
  pageRawBody,
  answerKeyBody,
}: PageBodyProps) {
  return (
    <PageContextProvider value={{ pageId, pageRawBody, answerKeyBody }}>
      <SelfCheckProvider pageId={pageId}>
        <MDXContent code={body} components={mdxComponents} />
      </SelfCheckProvider>
    </PageContextProvider>
  );
}
