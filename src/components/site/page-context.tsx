"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Page-level context exposed to MDX-rendered child components.
 *
 * The remark-exercise-fields plugin inserts `<ExerciseField n="..." />`
 * elements directly into the compiled MDX. Those rendered components don't
 * know their host page on their own — this context carries `pageId` (for
 * the progress store key) and `answerKeyBody` (so the AI grader can look
 * up the matching model answer for grading).
 */
export interface PageContextValue {
  pageId: string;
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
