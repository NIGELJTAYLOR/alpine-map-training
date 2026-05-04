"use client";

import { useProgress } from "@/lib/progress/provider";

export function PageStatusBadge({ pageId }: { pageId: string }) {
  const { hydrated, getPage } = useProgress();
  if (!hydrated) return <span className="inline-block h-3 w-3" aria-hidden />;
  const status = getPage(pageId).status;
  if (status === "completed") {
    return (
      <span
        title="Completed"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-success/20 font-mono text-[10px] text-success"
      >
        ✓
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span
        title="In progress"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-contour/20 font-mono text-[10px] text-contour"
      >
        ◐
      </span>
    );
  }
  return (
    <span
      title="Not started"
      className="inline-block h-4 w-4 rounded-full border border-border bg-background"
    />
  );
}

export function LevelProgressBar({
  pageIds,
  className,
}: {
  pageIds: string[];
  className?: string;
}) {
  const { hydrated, getPage } = useProgress();
  if (!hydrated || pageIds.length === 0) {
    return (
      <div className={className}>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" />
        <p className="mt-1 font-sans text-xs text-muted-foreground">Loading…</p>
      </div>
    );
  }
  let completed = 0;
  let inProgress = 0;
  for (const id of pageIds) {
    const s = getPage(id).status;
    if (s === "completed") completed += 1;
    else if (s === "in-progress") inProgress += 1;
  }
  const totalPct = ((completed + inProgress * 0.5) / pageIds.length) * 100;
  return (
    <div className={className}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${totalPct}%` }}
        />
      </div>
      <p className="mt-1 font-sans text-xs text-muted-foreground">
        {completed} complete · {inProgress} in progress · {pageIds.length - completed - inProgress} not started
      </p>
    </div>
  );
}

export function LevelProgressCount({ pageIds }: { pageIds: string[] }) {
  const { hydrated, getPage } = useProgress();
  if (!hydrated) {
    return (
      <span className="font-sans text-xs text-muted-foreground">… of {pageIds.length}</span>
    );
  }
  const completed = pageIds.filter((id) => getPage(id).status === "completed").length;
  return (
    <span className="font-sans text-xs text-muted-foreground">
      {completed} of {pageIds.length} complete
    </span>
  );
}
