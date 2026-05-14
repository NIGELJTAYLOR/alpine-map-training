import type { Metadata } from "next";
import Link from "next/link";
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

interface SourceMapEntry {
  /** Path relative to /public for the raster preview. */
  imgSrc: string;
  /** Path relative to /public for the vector / high-resolution version. */
  zoomPdfSrc?: string;
  title: string;
  caption: string;
  pageRefs: { level: number; page: string }[];
}

const SOURCE_MAPS: SourceMapEntry[] = [
  {
    imgSrc: "/diagrams/L1/11-swisstopo-verbier-1-25000.png",
    zoomPdfSrc: "/diagrams/L1/11-swisstopo-verbier-1-25000.pdf",
    title: "Swisstopo 1:25,000 — Verbier sheet (with legend)",
    caption:
      "Swisstopo 1:25,000 extract of the Verbier area with the standard Swiss legend column visible on the left (contour lines, water, buildings, paths, scrub, rock symbology). Used through Level 1 for symbol-hunt, legend-comparison and timed anatomy drills. Pair with the IGN Trois Vallées sheet below to compare how the same feature types render across two national series at two different scales.",
    pageRefs: [
      { level: 1, page: "B2.2" },
      { level: 1, page: "B3.2" },
      { level: 1, page: "B3.3" },
      { level: 2, page: "C1.1" },
    ],
  },
  {
    imgSrc: "/diagrams/L1/12-ign-1-50000-trois-vallees.png",
    zoomPdfSrc: "/diagrams/L1/12-ign-1-50000-trois-vallees.pdf",
    title: "IGN 1:50,000 — Trois Vallées sheet",
    caption:
      "French IGN 1:50,000 extract of the Trois Vallées (Courchevel, Méribel, Val Thorens) sourced from Géoportail. Brown contours at 10 m intervals, blue water, green forest, pink hatching for built-up areas and lift infrastructure. Each centimetre on the page covers 500 m on the ground — half the scale of the Swisstopo 1:25,000 sheet above. Map data © IGN.",
    pageRefs: [
      { level: 1, page: "B2.2" },
      { level: 1, page: "B3.2" },
      { level: 1, page: "B3.3" },
      { level: 2, page: "C4.2" },
    ],
  },
];

export default function DiagramsIndex() {
  const totalDiagrams = LEVELS_WITH_DIAGRAMS.reduce(
    (acc, l) => acc + getDiagramsForLevel(l).length,
    0,
  );

  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      {/* Header band */}
      <header className="border-b border-rule bg-paper-3 px-[22px] pb-5 pt-5 md:px-14 md:pt-10">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
          Reference
        </p>
        <h1 className="mb-1.5 mt-2 font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.025em] text-ink md:text-[40px]">
          Diagrams &amp; maps
        </h1>
        <p className="max-w-[62ch] text-[14px] leading-[1.55] text-ink-2 md:text-[15px]">
          Every visual reference in the app — {totalDiagrams} idealised
          teaching diagrams, {QUIZ_MAPS.length} OpenTopoMap extracts for
          the closing quizzes, and {SOURCE_MAPS.length} full source maps
          (Swisstopo and IGN) used throughout the course. Click any image
          to open a fullscreen zoom-pan view.
        </p>
      </header>

      <div className="px-[22px] pb-12 pt-5 md:mx-auto md:max-w-3xl md:px-14 md:pt-8">
        {/* ===== Quick jump strip ===== */}
        <nav
          aria-label="Sections"
          className="mb-8 flex flex-wrap gap-1 border border-rule bg-paper-3 p-2"
        >
          {LEVELS_WITH_DIAGRAMS.map((l) => (
            <a
              key={`jump-L${l}`}
              href={`#L${l}`}
              className="rounded-[2px] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3 no-underline hover:bg-paper hover:text-ink"
            >
              Level {l} diagrams
            </a>
          ))}
          <a
            href="#maps"
            className="rounded-[2px] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3 no-underline hover:bg-paper hover:text-ink"
          >
            Quiz maps
          </a>
          <a
            href="#source-maps"
            className="rounded-[2px] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3 no-underline hover:bg-paper hover:text-ink"
          >
            Source maps
          </a>
        </nav>

        {/* ===== Schematic diagrams ===== */}
        {LEVELS_WITH_DIAGRAMS.map((level) => {
          const diagrams = getDiagramsForLevel(level);
          if (diagrams.length === 0) return null;
          return (
            <section key={level} id={`L${level}`} className="mb-12 scroll-mt-20">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-[24px] font-extrabold tracking-[-0.02em] text-ink md:text-[28px]">
                  Level {level} — schematic diagrams
                </h2>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
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
                            className="text-red hover:text-ink"
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
        <section id="maps" className="mb-12 scroll-mt-20 border-t border-rule pt-10">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-[24px] font-extrabold tracking-[-0.02em] text-ink md:text-[28px]">
              Quiz map extracts
            </h2>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
              {QUIZ_MAPS.length} OpenTopoMap composites
            </span>
          </div>
          <p className="mt-2 mb-6 text-[14px] leading-[1.55] text-ink-2">
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
                        className="text-red hover:text-ink"
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

        {/* ===== Source maps (full Swisstopo / IGN sheets) ===== */}
        <section id="source-maps" className="mb-12 scroll-mt-20 border-t border-rule pt-10">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-[24px] font-extrabold tracking-[-0.02em] text-ink md:text-[28px]">
              Source maps
            </h2>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
              {SOURCE_MAPS.length} sheets
            </span>
          </div>
          <p className="mt-2 mb-6 text-[14px] leading-[1.55] text-ink-2">
            The two full source maps used throughout the workbook — the
            Swisstopo 1:25,000 Verbier sheet and the IGN 1:50,000 Trois
            Vallées sheet. Feel free to zoom in and explore: pinch or scroll
            to zoom, drag to pan. Each sheet has a vector PDF version linked
            below for unlimited-resolution study.
          </p>

          {SOURCE_MAPS.map((m) => (
            <figure
              key={m.imgSrc}
              className="my-6 rounded-md border border-rule bg-paper-3 p-3 sm:p-4"
            >
              <ZoomableImage
                src={m.imgSrc}
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
                  Used on:{" "}
                  {m.pageRefs.map((r, i) => (
                    <span key={`${r.level}-${r.page}`}>
                      <Link
                        href={`/levels/${r.level}/${r.page}`}
                        className="text-red hover:text-ink"
                      >
                        L{r.level}/{r.page}
                      </Link>
                      {i < m.pageRefs.length - 1 ? " · " : ""}
                    </span>
                  ))}
                  {m.zoomPdfSrc ? (
                    <>
                      {" · "}
                      <a
                        href={m.zoomPdfSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red hover:text-ink"
                      >
                        Open vector PDF →
                      </a>
                    </>
                  ) : null}
                </p>
              </figcaption>
            </figure>
          ))}

          <p className="mt-2 page-code">
            Swisstopo data © Swiss Federal Office of Topography (swisstopo) ·
            IGN data © Institut national de l&apos;information géographique
            et forestière, served via Géoportail (geoportail.gouv.fr)
          </p>
        </section>
      </div>
    </main>
  );
}
