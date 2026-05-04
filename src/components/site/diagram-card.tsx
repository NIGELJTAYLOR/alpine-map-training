import Image from "next/image";
import type { Diagram } from "@/lib/content";

interface DiagramCardProps {
  diagram: Diagram;
  showCaption?: boolean;
}

export function DiagramCard({ diagram, showCaption = true }: DiagramCardProps) {
  return (
    <figure className="my-6 rounded-lg border border-border bg-muted/30 p-3 sm:p-4">
      <div className="relative w-full">
        <Image
          src={diagram.svgUrl}
          alt={diagram.title}
          width={800}
          height={600}
          className="h-auto w-full rounded bg-white"
          unoptimized
        />
      </div>
      {showCaption ? (
        <figcaption className="mt-3 space-y-2">
          <p className="font-sans text-sm font-medium text-foreground">
            {diagram.number}
            {diagram.sub}. {diagram.title}
          </p>
          {diagram.whenToUse ? (
            <p className="font-serif text-sm leading-relaxed text-muted-foreground">
              {diagram.whenToUse}
            </p>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
