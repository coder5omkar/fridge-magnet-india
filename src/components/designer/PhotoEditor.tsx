"use client";

import { useRef, type PointerEvent } from "react";
import { computeTransform, type PhotoEdit } from "@/lib/fitting";

interface PhotoEditorProps {
  photoUrl: string;
  aspect: number;
  edit: PhotoEdit;
  onChange: (edit: PhotoEdit) => void;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  startOffsetX: number;
  startOffsetY: number;
}

function chipClasses(active: boolean): string {
  return `rounded-xl border px-3 py-2 text-xs font-semibold transition ${
    active
      ? "border-ocean-500 bg-ocean-50 text-ocean-700"
      : "border-slate-200 bg-white text-slate-600 hover:border-ocean-200 hover:text-ocean-700"
  }`;
}

export default function PhotoEditor({
  photoUrl,
  aspect,
  edit,
  onChange,
}: PhotoEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const transform = computeTransform(aspect, edit);

  function clampOffsets(next: PhotoEdit): PhotoEdit {
    const nextTransform = computeTransform(aspect, next);
    return {
      ...next,
      offsetX: nextTransform.centerX - 0.5,
      offsetY: nextTransform.centerY - 0.5,
    };
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const container = containerRef.current;
    if (!container) return;
    container.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: edit.offsetX,
      startOffsetY: edit.offsetY,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const container = containerRef.current;
    if (!drag || !container || drag.pointerId !== event.pointerId) return;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    onChange(
      clampOffsets({
        ...edit,
        offsetX: drag.startOffsetX + (event.clientX - drag.startX) / rect.width,
        offsetY: drag.startOffsetY + (event.clientY - drag.startY) / rect.height,
      })
    );
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  return (
    <div className="space-y-4 p-5">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative aspect-square w-full cursor-grab touch-none select-none overflow-hidden rounded-2xl border border-slate-200 active:cursor-grabbing"
        style={{ backgroundColor: edit.boardColor === "white" ? "#ffffff" : "#111827" }}
      >
        <div
          className="pointer-events-none absolute"
          style={{
            left: `${transform.centerX * 100}%`,
            top: `${transform.centerY * 100}%`,
            width: `${transform.drawWidth * 100}%`,
            height: `${transform.drawHeight * 100}%`,
            transform: "translate(-50%, -50%)",
            backgroundImage: `url("${photoUrl}")`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() =>
            onChange({ ...edit, fit: "fill", zoom: 1, offsetX: 0, offsetY: 0 })
          }
          aria-pressed={edit.fit === "fill"}
          className={chipClasses(edit.fit === "fill")}
        >
          Fill square
        </button>
        <button
          type="button"
          onClick={() =>
            onChange({ ...edit, fit: "fit", zoom: 1, offsetX: 0, offsetY: 0 })
          }
          aria-pressed={edit.fit === "fit"}
          className={chipClasses(edit.fit === "fit")}
        >
          Fit whole photo
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Zoom</span>
          <span>{Math.round(edit.zoom * 100)}%</span>
        </div>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={edit.zoom}
          onChange={(event) =>
            onChange(clampOffsets({ ...edit, zoom: Number(event.target.value) }))
          }
          aria-label="Zoom"
          className="mt-2 w-full accent-ocean-600"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Board</span>
          {(["white", "black"] as const).map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ ...edit, boardColor: color })}
              aria-label={`${color} board`}
              aria-pressed={edit.boardColor === color}
              className={`h-8 w-8 rounded-full border-2 transition ${
                edit.boardColor === color
                  ? "border-ocean-500 ring-2 ring-ocean-200"
                  : "border-slate-200"
              }`}
              style={{
                backgroundColor: color === "white" ? "#ffffff" : "#111827",
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            onChange({ ...edit, fit: "fill", zoom: 1, offsetX: 0, offsetY: 0 })
          }
          className="text-xs font-semibold text-ocean-700 transition hover:underline"
        >
          Reset
        </button>
      </div>

      <p className="rounded-xl bg-slate-50 px-3 py-2 text-center text-[11px] leading-4 text-slate-500">
        Drag the photo to move it. What you see here is exactly what gets
        printed and shared.
      </p>
    </div>
  );
}
