import type { Diagram } from "@/lib/content";
import { ZoomableImage } from "./zoomable-image";

interface DiagramCardProps {
  diagram: Diagram;
  showCaption?: boolean;
}

export function DiagramCard({ diagram, showCaption = true }: DiagramCardProps) {
  return (
    <figure className="my-6 rounded-md border border-rule bg-paper-3 p-3 sm:p-4">
      <ZoomableImage
        src={diagram.svgUrl}
        alt={diagram.title}
        width={800}
        height={600}
        caption={`Fig. ${diagram.number}${diagram.sub} · ${diagram.title}`}
      />
      {showCaption ? (
        <figcaption className="mt-3 space-y-2">
          <p className="page-code">
            FIG. {diagram.number}{diagram.sub} · {diagram.title}
          </p>
          {diagram.whenToUse ? (
            <p className="font-sans text-[14px] leading-relaxed text-ink-2">
              {diagram.whenToUse}
            </p>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
