"use client";

import { useRef } from "react";

const LONG_PRESS_MS = 450;
const MOVE_CANCEL_PX = 10;

export default function CategoryPill({
  name,
  amount,
  selected,
  onClick,
  onLongPress,
}: {
  name: string;
  amount?: number;
  selected?: boolean;
  onClick?: () => void;
  /** e.g. long-press to rename/delete a category. Suppresses the click that follows. */
  onLongPress?: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });

  const content = (
    <>
      <span className="font-medium">{name}</span>
      {amount !== undefined && (
        <span className={selected ? "text-stone-300" : "text-stone-500"}>
          ${amount.toLocaleString()}
        </span>
      )}
    </>
  );

  const classes = `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
    selected ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700"
  }`;

  if (onClick) {
    function clearTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    function handlePointerDown(e: React.PointerEvent) {
      if (!onLongPress) return;
      firedRef.current = false;
      startRef.current = { x: e.clientX, y: e.clientY };
      clearTimer();
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        onLongPress();
      }, LONG_PRESS_MS);
    }

    function handlePointerMove(e: React.PointerEvent) {
      if (!timerRef.current) return;
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) clearTimer();
    }

    return (
      <button
        type="button"
        onClick={() => {
          if (firedRef.current) {
            firedRef.current = false;
            return;
          }
          onClick();
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={clearTimer}
        onPointerLeave={clearTimer}
        onContextMenu={(e) => onLongPress && e.preventDefault()}
        className={`${classes} select-none`}
      >
        {content}
      </button>
    );
  }

  return <span className={classes}>{content}</span>;
}
