"use client";

import { useEffect, useRef, useState } from "react";

const ACTION_WIDTH = 56;
const CONFIRM_WIDTH = 104;
const DRAG_THRESHOLD = 10;
const CONFIRM_TIMEOUT_MS = 3000;

export interface SwipeAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  /** When set, the first tap swaps the icon for this label and a second tap commits. */
  confirmLabel?: string;
}

export default function SwipeActions({
  actions,
  children,
}: {
  actions: SwipeAction[];
  children: React.ReactNode;
}) {
  const [confirming, setConfirming] = useState<string | null>(null);
  const revealWidth =
    actions.length * ACTION_WIDTH + (confirming ? CONFIRM_WIDTH - ACTION_WIDTH : 0);
  const [translateX, setTranslateX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const openRef = useRef(0);
  const startXRef = useRef(0);
  const draggedRef = useRef(false);
  const wasOpenAtStartRef = useRef(false);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingXRef = useRef(0);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function clearConfirm() {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    confirmTimerRef.current = null;
    setConfirming(null);
  }

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
    pendingXRef.current = next;
    // Native pointermove can fire far more often than the display repaints
    // (e.g. 120Hz), so batch the state update to one per animation frame
    // instead of re-rendering on every event — otherwise the drag stutters.
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setTranslateX(pendingXRef.current);
      });
    }
  }

  function handlePointerUp() {
    setDragging(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (draggedRef.current) {
      const shouldOpen = pendingXRef.current < -revealWidth / 3;
      openRef.current = shouldOpen ? -revealWidth : 0;
      setTranslateX(openRef.current);
      if (!shouldOpen) clearConfirm();
    } else if (openRef.current !== 0) {
      close();
    }
  }

  function close() {
    openRef.current = 0;
    setTranslateX(0);
    clearConfirm();
  }

  function handleAction(action: SwipeAction) {
    if (action.confirmLabel && confirming !== action.label) {
      setConfirming(action.label);
      // Widen the tray so the confirm pill isn't clipped by the row edge.
      openRef.current = -(actions.length * ACTION_WIDTH + CONFIRM_WIDTH - ACTION_WIDTH);
      setTranslateX(openRef.current);
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = setTimeout(clearConfirm, CONFIRM_TIMEOUT_MS);
      return;
    }
    close();
    action.onClick();
  }

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2">
        {actions.map((action) => {
          const isConfirming = confirming === action.label;
          return (
            <button
              key={action.label}
              type="button"
              onClick={() => handleAction(action)}
              aria-label={isConfirming ? action.confirmLabel : action.label}
              className={`flex h-11 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                isConfirming ? "w-[6rem]" : "w-11"
              } ${action.className ?? "bg-stone-100 text-stone-500"}`}
            >
              {isConfirming ? action.confirmLabel : action.icon}
            </button>
          );
        })}
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
        className="w-full select-none"
        style={{
          transform: `translate3d(${translateX}px, 0, 0)`,
          transition: dragging ? "none" : "transform 200ms ease-out",
          touchAction: "pan-y",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}
