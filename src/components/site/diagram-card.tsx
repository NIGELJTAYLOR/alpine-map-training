import Image from "next/image";
import type { Diagram } from "@/lib/content";

interface DiagramCardProps {
  diagram: Diagram;
  showCaption?: boolean;
}

export function DiagramCard({ diagram, showCaption = true }: DiagramCardProps) {
  return (
    <figure className="my-6 rounded-md border border-rule bg-paper-3 p-3 sm:p-4">
      <div className="relative w-full overflow-hidden rounded-[4px] border border-rule bg-paper">
        <Image
          src={diagram.svgUrl}
          alt={diagram.title}
          width={800}
          height={600}
          className="h-auto w-full"
          unoptimized
        />
      </div>
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
