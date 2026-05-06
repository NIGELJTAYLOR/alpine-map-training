import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { DiagramCard } from "@/components/site/diagram-card";
import { ZoomableImage } from "@/components/site/zoomable-image";
import { getDiagramsForLevel } from "@/lib/content";

export const metadata: Metadata = { title: "Diagrams & maps" };

const LEVELS_WITH_DIAGRAMS = [2, 3];

interface QuizMapEntry {
  id: string;
  title: string;
  caption: string;
  pageRefs: { level: number; page: string }[];
}

const QUIZ_MAPS: QuizMapEntry[] = [
  {
    id: "c7-1",
    title: "C7.1 — Mixed contour quiz extract",
    caption:
      "Courchevel area. Markers Q1 (crimson) / Q2 (ink) / Q3 (moss) for the steepness, aspect and standing-description questions on the C7.1 mixed quiz.",
    pageRefs: [{ level: 2, page: "C7.1" }],
  },
  {
    id: "c7-2",
    title: "C7.2 — Virtual terrain walk extract",
    caption:
      "Same Courchevel area with the A → B → C → D walk drawn in. Use this for the four-part standing descriptions and the line-choice questions on C7.2.",
    pageRefs: [{ level: 2, page: "C7.2" }],
  },
  {
    id: "d10-1",
    title: "D10.1 — Mixed Level 3 quiz extract",
    caption:
      "Resection-friendly extract. Q4 is the bearing setup point; F1 + F2 are two distant features ~90° apart for the resection question.",
    pageRefs: [{ level: 3, page: "D10.1" }],
  },
  {
    id: "d10-2",
    title: "D10.2 — Virtual day on a tour extract",
    caption:
      "Multi-leg tour with three pre-agreed decision points (DP1 / DP2 / DP3). Use for bearings, altimeter triggers and decision-point criteria.",
    pageRefs: [{ level: 3, page: "D10.2" }],
  },
];

export default function DiagramsIndex() {
  const totalDiagrams = LEVELS_WITH_DIAGRAMS.reduce(
    (acc, l) => acc + getDiagramsForLevel(l).length,
    0,
  );

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-10 sm:py-14 focus:outline-none">
        <header className="mb-10">
          <p className="eyebrow eyebrow-contour">Reference</p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[44px]">
            Diagrams &amp; maps
          </h1>
          <p className="mt-3 font-sans text-base leading-relaxed text-ink-2">
            Every visual reference in the app — {totalDiagrams} idealised
            teaching diagrams plus {QUIZ_MAPS.length} OpenTopoMap extracts
            for the closing quizzes. Click any image to open a fullscreen
            zoom-pan view.
          </p>
        </header>

        {/* ===== Quick jump strip ===== */}
        <nav
          aria-label="Sections"
          className="surface-card mb-10 flex flex-wrap gap-1 p-3"
        >
          {LEVELS_WITH_DIAGRAMS.map((l) => (
            <a
              key={`jump-L${l}`}
              href={`#L${l}`}
              className="rounded-[3px] px-2 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3 hover:bg-paper-2 hover:text-ink"
            >
              Level {l} diagrams
            </a>
          ))}
          <a
            href="#maps"
            className="rounded-[3px] px-2 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3 hover:bg-paper-2 hover:text-ink"
          >
            Quiz maps
          </a>
        </nav>

        {/* ===== Schematic diagrams ===== */}
        {LEVELS_WITH_DIAGRAMS.map((level) => {
          const diagrams = getDiagramsForLevel(level);
          if (diagrams.length === 0) return null;
          return (
            <section key={level} id={`L${level}`} className="mb-12 scroll-mt-20">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-ink">
                  Level {level} — schematic diagrams
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

        {/* ===== Quiz map extracts ===== */}
        <section id="maps" className="mb-12 scroll-mt-20 border-t border-rule pt-12">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-ink">
              Quiz map extracts
            </h2>
            <span className="eyebrow eyebrow-contour">
              {QUIZ_MAPS.length} OpenTopoMap composites
            </span>
          </div>
          <p className="mt-2 mb-6 font-sans text-[14px] leading-relaxed text-ink-2">
            Real Courchevel-area renderings drawn from OpenStreetMap data via
            OpenTopoMap, with quiz markers overlaid. These accompany the
            mixed-quiz pages but live here as a study reference too. Pinch /
            scroll to zoom; drag to pan.
          </p>

          {QUIZ_MAPS.map((m) => (
            <figure key={m.id} className="my-6 rounded-md border border-rule bg-paper-3 p-3 sm:p-4">
              <ZoomableImage
                src={`/maps/${m.id}.png`}
                alt={m.title}
                width={1024}
                height={768}
                caption={m.title}
              />
              <figcaption className="mt-3 space-y-2">
                <p className="page-code">{m.title}</p>
                <p className="font-sans text-[14px] leading-relaxed text-ink-2">
                  {m.caption}
                </p>
                <p className="page-code">
                  Ref:{" "}
                  {m.pageRefs.map((r, i) => (
                    <span key={`${r.level}-${r.page}`}>
                      <Link
                        href={`/levels/${r.level}/${r.page}`}
                        className="text-contour hover:text-ink"
                      >
                        {r.page}
                      </Link>
                      {i < m.pageRefs.length - 1 ? " · " : ""}
                    </span>
                  ))}
                </p>
              </figcaption>
            </figure>
          ))}

          <p className="mt-2 page-code">
            Map data © OpenStreetMap contributors · rendering © OpenTopoMap (CC-BY-SA)
          </p>
        </section>
      </main>
    </>
  );
}
