import Image from "next/image";

interface MarkerLegend {
  label: string;
  description: string;
  color?: "crimson" | "ink" | "moss" | "amber";
}

interface MapExtractProps {
  /** filename stem in /public/maps/, e.g. "c7-1" */
  id: string;
  title: string;
  caption?: string;
  /** "1:25,000 · 10 m contours" etc. */
  scaleNote?: string;
  markers: MarkerLegend[];
}

const COLOR_DOT: Record<NonNullable<MarkerLegend["color"]>, string> = {
  crimson: "bg-crimson",
  ink: "bg-ink",
  moss: "bg-moss",
  amber: "bg-amber",
};

/**
 * Static OpenTopoMap composite for a quiz extract. Markers are drawn into
 * the PNG as colored dots; this component renders the image plus a labelled
 * legend so a candidate can match each dot to its prompt.
 *
 * Attribution is mandatory under OpenTopoMap's CC-BY-SA license.
 */
export function MapExtract({
  id,
  title,
  caption,
  scaleNote = "Approximate · 1:25,000 equivalent · OpenTopoMap rendering",
  markers,
}: MapExtractProps) {
  return (
    <figure className="my-8 surface-card overflow-hidden p-0">
      <header className="border-b border-rule px-5 py-3 sm:px-6">
        <p className="eyebrow eyebrow-contour">Section extract</p>
        <p className="mt-1 font-display text-base font-medium text-ink">
          {title}
        </p>
        {scaleNote ? (
          <p className="mt-0.5 page-code">{scaleNote}</p>
        ) : null}
      </header>

      <div className="relative w-full overflow-hidden border-b border-rule bg-paper">
        <Image
          src={`/maps/${id}.png`}
          alt={`Quiz extract for ${title} — Courchevel area, OpenTopoMap rendering with marked points`}
          width={1024}
          height={768}
          className="h-auto w-full"
          unoptimized
          priority={false}
        />
      </div>

      <div className="px-5 py-4 sm:px-6">
        {caption ? (
          <p className="font-sans text-[14px] leading-relaxed text-ink-2 mb-4">
            {caption}
          </p>
        ) : null}
        <p className="page-code mb-2">Marked points</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {markers.map((m) => (
            <li
              key={m.label}
              className="flex items-start gap-3 text-[13px] leading-snug"
            >
              <span
                className={
                  "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-paper text-[10px] font-bold text-paper " +
                  (COLOR_DOT[m.color ?? "crimson"])
                }
                aria-hidden
              >
                {m.label.slice(0, 2)}
              </span>
              <span>
                <span className="font-display font-medium text-ink">
                  {m.label}
                </span>{" "}
                <span className="text-ink-2">— {m.description}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 page-code">
          Map data © OpenStreetMap contributors · rendering © OpenTopoMap (CC-BY-SA)
        </p>
        <p className="mt-1 page-code text-ink-3">
          Approximation for the demo. Your trainer may use a different printed extract.
        </p>
      </div>
    </figure>
  );
}
