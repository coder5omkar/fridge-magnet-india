"use client";

import { useRef, type PointerEvent } from "react";
import {
  BEZEL_ZOOM_MAX,
  BEZEL_ZOOM_MIN,
  FULL_ZOOM_MAX,
  FULL_ZOOM_MIN,
  computeTransform,
  type PhotoEdit,
} from "@/lib/fitting";

interface PhotoEditorProps {
  photoUrl: string;
  photoAspect: number;
  boardAspect: number;
  boardWidthIn: number;
  boardHeightIn: number;
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
  photoAspect,
  boardAspect,
  boardWidthIn,
  boardHeightIn,
  edit,
  onChange,
}: PhotoEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const transform = computeTransform(photoAspect, boardAspect, edit);
  const zoomMin = edit.mode === "bezel" ? BEZEL_ZOOM_MIN : FULL_ZOOM_MIN;
  const zoomMax = edit.mode === "bezel" ? BEZEL_ZOOM_MAX : FULL_ZOOM_MAX;

  function clampOffsets(next: PhotoEdit): PhotoEdit {
    const nextTransform = computeTransform(photoAspect, boardAspect, next);
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
        className="relative w-full cursor-grab touch-none select-none overflow-hidden rounded-2xl border border-slate-200 active:cursor-grabbing"
        style={{
          aspectRatio: String(boardAspect),
          backgroundColor:
            edit.boardColor === "white" ? "#ffffff" : "#111827",
        }}
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

      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
        <span className="text-xs font-medium text-slate-500">Board size</span>
        <span className="text-xs font-bold text-slate-800">
          {boardWidthIn} x {boardHeightIn} inch, matched to your photo
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() =>
            onChange({ ...edit, mode: "full", zoom: 1, offsetX: 0, offsetY: 0 })
          }
          aria-pressed={edit.mode === "full"}
          className={chipClasses(edit.mode === "full")}
        >
          No bezel
        </button>
        <button
          type="button"
          onClick={() =>
            onChange({ ...edit, mode: "bezel", zoom: 1, offsetX: 0, offsetY: 0 })
          }
          aria-pressed={edit.mode === "bezel"}
          className={chipClasses(edit.mode === "bezel")}
        >
          With margin
        </button>
      </div>

      <p className="text-center text-[11px] leading-4 text-slate-500">
        No bezel fills the whole board. With margin adds a border on every
        side.
      </p>

      <div>
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Zoom</span>
          <span>{Math.round(edit.zoom * 100)}%</span>
        </div>
        <input
          type="range"
          min={zoomMin}
          max={zoomMax}
          step={0.05}
          value={edit.zoom}
          onChange={(event) =>
            onChange(clampOffsets({ ...edit, zoom: Number(event.target.value) }))
          }
          aria-label="Zoom"
          className="mt-2 w-full accent-ocean-600"
        />
        {edit.mode === "bezel" ? (
          <p className="mt-1 text-[11px] text-slate-400">
            Slide left to make the photo smaller on the board.
          </p>
        ) : null}
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
            onChange({
              ...edit,
              mode: "full",
              zoom: 1,
              offsetX: 0,
              offsetY: 0,
            })
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
