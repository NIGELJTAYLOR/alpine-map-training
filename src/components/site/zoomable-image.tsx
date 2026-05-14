"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  TransformWrapper,
  TransformComponent,
} from "react-zoom-pan-pinch";

interface ZoomableImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Caption text for the lightbox header (e.g. figure number + title) */
  caption?: string;
}

/**
 * Inline image that becomes a fullscreen zoom-pan lightbox on click / tap.
 *
 * Inline:   shows the image with a small "Zoom" hint overlay on hover.
 * Lightbox: scroll / pinch to zoom, drag / swipe to pan, controls top-right,
 *           click backdrop or press ESC to close.
 */
export function ZoomableImage({
  src,
  alt,
  width,
  height,
  caption,
}: ZoomableImageProps) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the lightbox is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full cursor-zoom-in overflow-hidden rounded-[4px] border border-rule bg-paper p-0"
        aria-label={`Open ${alt} in zoom view`}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="h-auto w-full"
          unoptimized
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-2 top-2 rounded-full border border-rule bg-paper/90 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          ⤢ Zoom
        </span>
      </button>

      {open ? (
        <Lightbox
          src={src}
          alt={alt}
          width={width}
          height={height}
          caption={caption}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function Lightbox({
  src,
  alt,
  width,
  height,
  caption,
  onClose,
}: ZoomableImageProps & { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-ink/90 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <header className="flex items-center justify-between gap-3 border-b border-paper/20 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="font-display text-base font-medium text-paper sm:text-lg">
            {caption ?? alt}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-2/70">
            Scroll or pinch to zoom · drag to pan · ESC to close · rotate phone for a wider landscape view
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md border border-paper/30 px-3 py-1.5 font-sans text-sm font-semibold text-paper hover:border-paper hover:bg-paper/10"
          aria-label="Close zoom view"
        >
          Close ✕
        </button>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={6}
          centerOnInit
          centerZoomedOut
          // Per-step scale change. Lower values = gentler zoom on every input.
          // wheel.step is per scroll-wheel tick; pinch.step is per pinch unit;
          // doubleClick.step is the multiplier per double-click; the +/- buttons
          // pass an explicit step below (default would be 0.7, which doubles each
          // click; 0.25 gives a slower, more controllable increment).
          doubleClick={{ mode: "zoomIn", step: 0.2 }}
          // wheel.step controls per-scroll-tick zoom. v4 of the library
          // only honours `step` (smoothStep was a v2/v3 prop, silently
          // dropped in v4). 0.01 = 1% scale change per wheel detent, well
          // below the library default of 0.2; this gives fine control on
          // detailed maps with a real mouse wheel.
          wheel={{ step: 0.01 }}
          pinch={{ step: 3 }}
          velocityAnimation={{ disabled: true }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5 sm:right-4 sm:top-4">
                <ZoomBtn label="+" onClick={() => zoomIn(0.15)} />
                <ZoomBtn label="−" onClick={() => zoomOut(0.15)} />
                <ZoomBtn label="↺" onClick={() => resetTransform()} />
              </div>
              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* maxWidth + maxHeight + auto width/height keeps a landscape
                    image fit-to-screen on both landscape and portrait viewports
                    without stretching, with letterboxed empty space if the
                    aspect ratios disagree. */}
                <img
                  src={src}
                  alt={alt}
                  width={width}
                  height={height}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                  }}
                  draggable={false}
                />
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
}

function ZoomBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-8 w-8 rounded-md border border-paper/30 bg-ink/60 font-mono text-base font-semibold text-paper backdrop-blur hover:border-paper hover:bg-paper/10"
      aria-label={label}
    >
      {label}
    </button>
  );
}
