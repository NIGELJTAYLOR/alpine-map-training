import Link from "next/link";

interface RelatedDiagram {
  id: string;
  level: number;
  number: number;
  sub: string;
  title: string;
}

interface RelatedTemplate {
  id: string;
  number: number;
  title: string;
}

interface RelatedCard {
  id: string;
  title: string;
}

interface RelatedTerm {
  id: string;
  term: string;
}

interface RelatedNeighbour {
  page: string;
  title: string;
  status?: "completed" | "in-progress" | "not-started";
}

interface SeeAlsoProps {
  level: number;
  pageCode: string;
  diagrams?: RelatedDiagram[];
  templates?: RelatedTemplate[];
  flashcards?: RelatedCard[];
  glossaryTerms?: RelatedTerm[];
  neighbours?: { prev?: RelatedNeighbour; next?: RelatedNeighbour };
}

/**
 * "See also" panel rendered at the bottom of a workbook page. Surfaces
 * the related diagrams, templates, flashcards and glossary terms that
 * connect to the current page via the existing pageRefs / tag data.
 */
export function SeeAlso({
  level,
  pageCode,
  diagrams = [],
  templates = [],
  flashcards = [],
  glossaryTerms = [],
}: SeeAlsoProps) {
  const total =
    diagrams.length + templates.length + flashcards.length + glossaryTerms.length;
  if (total === 0) return null;

  return (
    <section className="mt-12 surface-card p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-medium text-ink">See also</h2>
        <span className="eyebrow eyebrow-contour">
          Related to {pageCode}
        </span>
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        {diagrams.length > 0 ? (
          <div>
            <p className="page-code mb-2">Schematic diagrams</p>
            <ul className="space-y-1.5">
              {diagrams.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/diagrams#L${d.level}-${d.number}${d.sub}`}
                    className="font-sans text-[14px] text-ink hover:text-contour"
                  >
                    Fig. {d.number}{d.sub} · {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {templates.length > 0 ? (
          <div>
            <p className="page-code mb-2">Templates</p>
            <ul className="space-y-1.5">
              {templates.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/templates/${t.id.replace(/^template\./, "")}`}
                    className="font-sans text-[14px] text-ink hover:text-contour"
                  >
                    {String(t.number).padStart(2, "0")} · {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {flashcards.length > 0 ? (
          <div>
            <p className="page-code mb-2">Flashcards</p>
            <ul className="space-y-1.5">
              {flashcards.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/flashcards/study/l${level}`}
                    className="font-sans text-[14px] text-ink hover:text-contour"
                    title={c.title}
                  >
                    {c.id} · {c.title}
                  </Link>
                </li>
              ))}
            </ul>
            {flashcards.length >= 5 ? (
              <p className="mt-2 page-code">
                <Link
                  href={`/flashcards/study/l${level}`}
                  className="text-contour hover:text-ink"
                >
                  Open the Level {level} deck →
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}

        {glossaryTerms.length > 0 ? (
          <div>
            <p className="page-code mb-2">Glossary</p>
            <ul className="space-y-1.5">
              {glossaryTerms.map((g) => (
                <li key={g.id}>
                  <Link
                    href={`/glossary#${g.id}`}
                    className="font-sans text-[14px] text-ink hover:text-contour"
                  >
                    {g.term}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
