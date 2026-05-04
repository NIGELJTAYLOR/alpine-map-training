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
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-8 sm:py-10 focus:outline-none">
        <header className="mb-8">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Reference
          </p>
          <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Schematic diagrams
          </h1>
          <p className="mt-3 font-serif text-base leading-relaxed text-muted-foreground">
            Idealised teaching diagrams for contour patterns, navigation aids
            and field techniques. Each diagram is referenced from the workbook
            page that it supports.
          </p>
        </header>

        {LEVELS_WITH_DIAGRAMS.map((level) => {
          const diagrams = getDiagramsForLevel(level);
          if (diagrams.length === 0) return null;
          return (
            <section key={level} id={`L${level}`} className="mb-12 scroll-mt-20">
              <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground">
                Level {level}
              </h2>
              <p className="mt-1 font-sans text-sm text-muted-foreground">
                {diagrams.length} diagram{diagrams.length === 1 ? "" : "s"}
              </p>
              {diagrams.map((d) => (
                <div key={d.id} id={`L${level}-${d.number}${d.sub}`} className="scroll-mt-20">
                  <DiagramCard diagram={d} />
                  {d.pageRefs.length > 0 ? (
                    <p className="-mt-3 mb-6 ml-3 font-sans text-xs text-muted-foreground">
                      Referenced on:{" "}
                      {d.pageRefs.map((ref, i) => (
                        <span key={ref}>
                          <Link
                            href={`/levels/${level}/${ref}`}
                            className="text-primary hover:underline"
                          >
                            {ref}
                          </Link>
                          {i < d.pageRefs.length - 1 ? ", " : ""}
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
