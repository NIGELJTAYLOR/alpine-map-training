"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Page-level context exposed to MDX-rendered child components.
 *
 * The remark-exercise-fields plugin inserts `<ExerciseField n="..." />`
 * elements directly into the compiled MDX. Those rendered components don't
 * know their host page on their own; this context carries:
 *   - pageId: the progress store key for the page
 *   - pageRawBody: the lesson's raw markdown, so the grader can be shown
 *     the exact exercise prompt the candidate was answering
 *   - answerKeyBody: the matching answer key's raw markdown, so the grader
 *     can extract the model answer for the exercise being graded
 */
export interface PageContextValue {
  pageId: string;
  /** Raw markdown of this lesson page (used by the AI grader). */
  pageRawBody?: string;
  /** Raw markdown of the matching answer key, or undefined if none exists. */
  answerKeyBody?: string;
}

const PageContext = createContext<PageContextValue | null>(null);

export function PageContextProvider({
  value,
  children,
}: {
  value: PageContextValue;
  children: ReactNode;
}) {
  return <PageContext value={value}>{children}</PageContext>;
}

export function usePageContext(): PageContextValue {
  const ctx = useContext(PageContext);
  if (!ctx) {
    throw new Error(
      "usePageContext must be used inside a PageContextProvider (PageBody).",
    );
  }
  return ctx;
}
