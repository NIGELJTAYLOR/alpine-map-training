"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ChangeEvent,
} from "react";
import { useProgress } from "@/lib/progress/provider";
import { usePageContext } from "@/components/site/page-context";

interface SketchSlotProps {
  /** Exercise number from the remark plugin (string from JSX attribute). */
  ex: string | number;
  /** Slot index within the exercise (1-based). */
  q: string | number;
  /** Canvas width in centimetres, used to size the on-screen canvas. */
  widthCm?: string | number;
  /** Canvas height in centimetres, used to size the on-screen canvas. */
  heightCm?: string | number;
}

/** Pixels per centimetre when mapping the source dimensions to screen. */
const PX_PER_CM = 38;

/**
 * Inline sketch field for "[Sketch space - approximately N cm by M cm]"
 * markers in the workbook source MDX.
 *
 * Renders an HTML5 canvas the candidate can draw on with mouse or finger,
 * plus a "describe what you've drawn" textarea beneath. Two storage keys:
 *
 *   - inputs["ex-{N}-q{K}"]      — the text description (this is what the
 *                                  Grade with AI pipeline picks up)
 *   - inputs["ex-{N}-q{K}-img"]  — the canvas as a PNG dataURL
 *
 * The Grade-AI handler in ExerciseField filters strictly to text-only keys
 * (those matching `ex-N-q\d+$`) so the image data never gets shipped to
 * Claude. That keeps API payloads tight and lets us add vision grading
 * separately when we want it.
 *
 * Drawing is intentionally minimal for v1: single pen colour, single line
 * width, clear button, no undo stack. Touch and mouse both work via the
 * Pointer Events API.
 */
export function SketchSlot({
  ex,
  q,
  widthCm = 8,
  heightCm = 5,
}: SketchSlotProps) {
  const exNum = typeof ex === "number" ? ex : parseInt(String(ex), 10);
  const qNum = typeof q === "number" ? q : parseInt(String(q), 10);
  const wCm = parseFloat(String(widthCm));
  const hCm = parseFloat(String(heightCm));
  const widthPx = Math.round(wCm * PX_PER_CM);
  const heightPx = Math.round(hCm * PX_PER_CM);

  const { pageId } = usePageContext();
  const { hydrated, getPage, setInput } = useProgress();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [restored, setRestored] = useState(false);

  const textKey = `ex-${exNum}-q${qNum}`;
  const imgKey = `ex-${exNum}-q${qNum}-img`;

  const pageInputs = hydrated ? getPage(pageId)?.inputs ?? {} : {};
  const textValue = pageInputs[textKey] ?? "";
  const savedImg = pageInputs[imgKey] ?? "";

  // Restore the saved drawing once after hydration. Don't replay on every
  // re-render — that would erase live strokes the candidate is making.
  useEffect(() => {
    if (!hydrated || restored) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (savedImg) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = savedImg;
    }
    setRestored(true);
  }, [hydrated, restored, savedImg]);

  const saveCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL("image/png");
      setInput(pageId, imgKey, dataUrl);
    } catch (err) {
      // toDataURL throws on tainted canvases or if storage quota's full.
      console.warn("SketchSlot save failed:", err);
    }
  }, [imgKey, pageId, setInput]);

  function getCanvasPoint(
    e: ReactPointerEvent<HTMLCanvasElement>,
  ): { x: number; y: number } {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!hydrated) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastPointRef.current = getCanvasPoint(e);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const next = getCanvasPoint(e);
    const prev = lastPointRef.current ?? next;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#0e1a2e";
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    lastPointRef.current = next;
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore — release can throw if capture was already lost.
      }
    }
    drawingRef.current = false;
    lastPointRef.current = null;
    saveCanvas();
  }

  function handleClear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveCanvas();
  }

  function handleTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setInput(pageId, textKey, e.target.value);
  }

  if (!Number.isFinite(exNum) || !Number.isFinite(qNum)) return null;

  return (
    <div className="not-prose my-4 border border-rule bg-paper-3 p-3 md:p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-red">
          Sketch · approximately {wCm} cm by {hCm} cm
        </p>
        <button
          type="button"
          onClick={handleClear}
          disabled={!hydrated}
          className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3 hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:text-ink-4"
        >
          Clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={widthPx}
        height={heightPx}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        aria-label={`Exercise ${exNum} sketch ${qNum}`}
        className="block max-w-full touch-none rounded-[2px] border border-rule bg-paper"
        style={{
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          touchAction: "none",
          cursor: hydrated ? "crosshair" : "wait",
        }}
      />

      <label className="mt-3 block">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          Describe what you&rsquo;ve drawn (graded by AI)
        </span>
        <textarea
          value={textValue}
          onChange={handleTextChange}
          disabled={!hydrated}
          rows={3}
          placeholder="In a sentence or two, describe what the sketch shows…"
          aria-label={`Exercise ${exNum} sketch description ${qNum}`}
          className="mt-1 block w-full resize-y rounded-[2px] border border-rule bg-paper px-3 py-2 font-sans text-[14px] leading-[1.5] text-ink-2 outline-none placeholder:text-ink-4 focus:border-ink focus:text-ink"
        />
      </label>
    </div>
  );
}
