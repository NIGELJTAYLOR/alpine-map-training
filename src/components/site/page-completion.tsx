"use client";

import { useEffect } from "react";
import { useProgress } from "@/lib/progress/provider";

interface PageCompletionProps {
  pageId: string;
}

export function PageCompletionControls({ pageId }: PageCompletionProps) {
  const { hydrated, getPage, setPageStatus, markVisited } = useProgress();

  useEffect(() => {
    if (hydrated) markVisited(pageId);
  }, [hydrated, pageId, markVisited]);

  if (!hydrated) {
    return (
      <div className="no-print mt-12 rounded-md border border-rule bg-paper-3 p-4">
        <p className="page-code">Loading progress…</p>
      </div>
    );
  }

  const page = getPage(pageId);
  const isCompleted = page.status === "completed";

  return (
    <div className="no-print mt-12 rounded-md border border-rule bg-paper-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Status</p>
          <p className="mt-1 font-display text-base font-medium text-ink">
            {isCompleted
              ? "✓ Completed"
              : page.status === "in-progress"
              ? "In progress"
              : "Not started"}
          </p>
          {page.lastViewed ? (
            <p className="mt-1 page-code">
              Last viewed {new Date(page.lastViewed).toLocaleDateString()}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          {isCompleted ? (
            <button
              type="button"
              onClick={() => setPageStatus(pageId, "in-progress")}
              className="inline-flex items-center justify-center rounded-[4px] border border-rule bg-transparent px-4 py-2 font-sans text-sm font-semibold text-ink hover:border-ink"
            >
              Mark as in progress
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPageStatus(pageId, "completed")}
              className="inline-flex items-center justify-center rounded-[4px] border border-ink bg-ink px-4 py-2 font-sans text-sm font-semibold text-paper hover:bg-ink-2"
            >
              ✓ Mark page complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
