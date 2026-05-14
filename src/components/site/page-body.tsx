"use client";

import { MDXContent } from "@/lib/mdx";
import { mdxComponents } from "@/components/mdx/components";
import { PageContextProvider } from "./page-context";
import { SelfCheckProvider } from "./self-check-context";

interface PageBodyProps {
  pageId: string;
  body: string;
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
 *     the remark-exercise-fields plugin can look up its pageId and the
 *     matching answer-key body without props on the JSX tag.
 */
export function PageBody({ pageId, body, answerKeyBody }: PageBodyProps) {
  return (
    <PageContextProvider value={{ pageId, answerKeyBody }}>
      <SelfCheckProvider pageId={pageId}>
        <MDXContent code={body} components={mdxComponents} />
      </SelfCheckProvider>
    </PageContextProvider>
  );
}
