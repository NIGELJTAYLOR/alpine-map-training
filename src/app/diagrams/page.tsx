import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { DiagramCard } from "@/components/site/diagram-card";
import { getDiagramsForLevel } from "@/lib/content";

export const metadata: Metadata = { title: "Schematic diagrams" };

const LEVELS_WITH_DIAGRAMS = [2, 3];

export default function DiagramsIndex() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-10 sm:py-14 focus:outline-none">
        <header className="mb-10">
          <p className="eyebrow eyebrow-contour">Reference</p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[44px]">
            Schematic diagrams
          </h1>
          <p className="mt-3 font-sans text-base leading-relaxed text-ink-2">
            Idealised teaching diagrams for contour patterns, navigation aids
            and field techniques. Each plate is referenced from the workbook
            page that it supports.
          </p>
        </header>

        {LEVELS_WITH_DIAGRAMS.map((level) => {
          const diagrams = getDiagramsForLevel(level);
          if (diagrams.length === 0) return null;
          return (
            <section key={level} id={`L${level}`} className="mb-12 scroll-mt-20">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-ink">
                  Level {level}
                </h2>
                <span className="eyebrow eyebrow-contour">
                  {diagrams.length} {diagrams.length === 1 ? "plate" : "plates"}
                </span>
              </div>
              {diagrams.map((d) => (
                <div key={d.id} id={`L${level}-${d.number}${d.sub}`} className="scroll-mt-20">
                  <DiagramCard diagram={d} />
                  {d.pageRefs.length > 0 ? (
                    <p className="-mt-3 mb-6 ml-3 page-code">
                      Ref:{" "}
                      {d.pageRefs.map((ref, i) => (
                        <span key={ref}>
                          <Link
                            href={`/levels/${level}/${ref}`}
                            className="text-contour hover:text-ink"
                          >
                            {ref}
                          </Link>
                          {i < d.pageRefs.length - 1 ? " · " : ""}
                        </span>
                      ))}
                    </p>
                  ) : null}
                </div>
              ))}
            </section>
          );
        })}
      </main>
    </>
  );
}
