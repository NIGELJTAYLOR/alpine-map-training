"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress/provider";

interface PageRightRailProps {
  pageId: string;
  linkedCards: ReadonlyArray<{ id: string; title: string }>;
}

/**
 * Sticky right rail for the workbook page on desktop. Shows the page
 * status (driven by the progress store), linked flashcards, and a CTA
 * to review them. Hidden on mobile by the parent shell.
 */
export function PageRightRail({ pageId, linkedCards }: PageRightRailProps) {
  const { hydrated, store } = useProgress();
  const status = hydrated ? (store.pages[pageId]?.status ?? "not-started") : null;

  return (
    <div className="flex h-full flex-col gap-7">
      <section>
        <h4 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
          This page
        </h4>
        <div className="space-y-0">
          <RailStatRow label="Status">
            {status == null ? (
              <span className="text-ink-3">—</span>
            ) : (
              <span style={{ color: statusColor(status) }}>{statusLabel(status)}</span>
            )}
          </RailStatRow>
          <RailStatRow label="Linked cards">
            <span>{linkedCards.length}</span>
          </RailStatRow>
        </div>
      </section>

      {linkedCards.length > 0 ? (
        <section>
          <h4 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
            Linked cards
          </h4>
          <ul className="space-y-2">
            {linkedCards.slice(0, 5).map((c) => (
              <li
                key={c.id}
                className="border-t border-rule pt-2 text-[13px] leading-[1.4] text-ink first:border-t-0 first:pt-0"
              >
                <span className="font-display font-bold tracking-[-0.005em]">
                  {c.title}
                </span>
                <span className="mt-0.5 block font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-3">
                  {c.id}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link
        href="/flashcards"
        className="btn ghost block mt-auto"
        style={{ width: "100%", textAlign: "center" }}
      >
        Review linked cards →
      </Link>
    </div>
  );
}

function RailStatRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-t border-rule py-2 text-[13px] text-ink-2 first:border-t-0">
      <span>{label}</span>
      <span className="font-display text-[15px] font-extrabold tracking-[-0.005em]">
        {children}
      </span>
    </div>
  );
}

function statusLabel(s: "not-started" | "in-progress" | "completed"): string {
  if (s === "completed") return "Completed";
  if (s === "in-progress") return "In progress";
  return "Not started";
}

function statusColor(s: "not-started" | "in-progress" | "completed"): string {
  if (s === "completed") return "var(--moss)";
  if (s === "in-progress") return "var(--amber)";
  return "var(--ink-3)";
}
