"use client";

import { useEffect } from "react";
import { useProgress } from "@/lib/progress/provider";
import { Button } from "@/components/ui/button";

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
      <div className="no-print mt-12 rounded-lg border border-border p-4">
        <p className="font-sans text-xs text-muted-foreground">
          Loading progress…
        </p>
      </div>
    );
  }

  const page = getPage(pageId);
  const isCompleted = page.status === "completed";

  return (
    <div className="no-print mt-12 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Status
          </p>
          <p className="mt-1 font-sans text-sm font-medium">
            {isCompleted
              ? "✓ Completed"
              : page.status === "in-progress"
              ? "In progress"
              : "Not started"}
          </p>
          {page.lastViewed ? (
            <p className="mt-1 font-sans text-xs text-muted-foreground">
              Last viewed {new Date(page.lastViewed).toLocaleDateString()}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          {isCompleted ? (
            <Button variant="outline" onClick={() => setPageStatus(pageId, "in-progress")}>
              Mark as in progress
            </Button>
          ) : (
            <Button onClick={() => setPageStatus(pageId, "completed")}>
              Mark page complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
