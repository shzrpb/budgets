"use client";

import { useRef, useState } from "react";

const REVEAL_WIDTH = 76;
const DRAG_THRESHOLD = 10;

export default function SwipeToDelete({
  onDelete,
  children,
}: {
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const [translateX, setTranslateX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const openRef = useRef(0);
  const startXRef = useRef(0);
  const draggedRef = useRef(false);
  const wasOpenAtStartRef = useRef(false);

  function handlePointerDown(e: React.PointerEvent) {
    startXRef.current = e.clientX;
    draggedRef.current = false;
    wasOpenAtStartRef.current = openRef.current !== 0;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > DRAG_THRESHOLD) draggedRef.current = true;
    const next = Math.min(0, Math.max(-REVEAL_WIDTH, openRef.current + dx));
    setTranslateX(next);
  }

  function handlePointerUp() {
    setDragging(false);
    if (draggedRef.current) {
      const shouldOpen = translateX < -REVEAL_WIDTH / 2;
      openRef.current = shouldOpen ? -REVEAL_WIDTH : 0;
      setTranslateX(openRef.current);
    } else if (openRef.current !== 0) {
      // Tapping elsewhere on an already-open row closes it instead of
      // letting the tap reach whatever's underneath.
      openRef.current = 0;
      setTranslateX(0);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <button
          type="button"
          onClick={() => {
            openRef.current = 0;
            setTranslateX(0);
            onDelete();
          }}
          aria-label="Delete"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-500"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
          </svg>
        </button>
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClickCapture={(e) => {
          if (wasOpenAtStartRef.current || draggedRef.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className="w-full"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: dragging ? "none" : "transform 200ms ease-out",
          touchAction: "pan-y",
        }}
      >
        {children}
      </div>
    </div>
  );
}
