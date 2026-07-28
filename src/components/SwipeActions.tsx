"use client";

import { useRef, useState } from "react";

const ACTION_WIDTH = 56;
const DRAG_THRESHOLD = 10;

export interface SwipeAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export default function SwipeActions({
  actions,
  children,
}: {
  actions: SwipeAction[];
  children: React.ReactNode;
}) {
  const revealWidth = actions.length * ACTION_WIDTH;
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
    const next = Math.min(0, Math.max(-revealWidth, openRef.current + dx));
    setTranslateX(next);
  }

  function handlePointerUp() {
    setDragging(false);
    if (draggedRef.current) {
      const shouldOpen = translateX < -revealWidth / 2;
      openRef.current = shouldOpen ? -revealWidth : 0;
      setTranslateX(openRef.current);
    } else if (openRef.current !== 0) {
      openRef.current = 0;
      setTranslateX(0);
    }
  }

  function close() {
    openRef.current = 0;
    setTranslateX(0);
  }

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => {
              close();
              action.onClick();
            }}
            aria-label={action.label}
            className={`flex h-11 w-11 items-center justify-center rounded-full ${action.className ?? "bg-stone-100 text-stone-500"}`}
          >
            {action.icon}
          </button>
        ))}
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
