"use client";

import { useProgress } from "@/lib/progress/provider";

/**
 * Carta-style status dot:
 *   - completed → filled moss circle
 *   - in-progress → half-filled amber circle (left moss, right paper)
 *   - not-started → empty ring with rule border
 *
 * Shape AND colour together — colour-blind safe.
 */
export function PageStatusBadge({ pageId }: { pageId: string }) {
  const { hydrated, getPage } = useProgress();
  if (!hydrated) {
    return <span className="inline-block h-3.5 w-3.5" aria-hidden />;
  }
  const status = getPage(pageId).status;
  if (status === "completed") {
    return (
      <span
        title="Completed"
        className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-moss bg-moss"
      />
    );
  }
  if (status === "in-progress") {
    return (
      <span
        title="In progress"
        className="inline-block h-3.5 w-3.5 shrink-0 overflow-hidden rounded-full border border-amber"
        style={{
          background: `linear-gradient(90deg, var(--amber) 50%, var(--paper) 50%)`,
        }}
      />
    );
  }
  return (
    <span
      title="Not started"
      className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-rule bg-paper"
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
        <div className="carta-progress" />
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">Loading…</p>
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
      <div className="carta-progress">
        <i style={{ width: `${totalPct}%` }} />
      </div>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
        {completed} of {pageIds.length} complete
        {inProgress > 0 ? ` · ${inProgress} in progress` : ""}
      </p>
    </div>
  );
}

export function LevelProgressCount({ pageIds }: { pageIds: string[] }) {
  const { hydrated, getPage } = useProgress();
  if (!hydrated) {
    return (
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
        … of {pageIds.length}
      </span>
    );
  }
  const completed = pageIds.filter((id) => getPage(id).status === "completed").length;
  const pct = pageIds.length === 0 ? 0 : (completed / pageIds.length) * 100;
  return (
    <div className="space-y-2">
      <div className="carta-progress">
        <i style={{ width: `${pct}%` }} />
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
        {completed} of {pageIds.length} complete
      </p>
    </div>
  );
}
