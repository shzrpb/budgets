"use client";

import AddGoalSheet from "@/components/AddGoalSheet";
import type { Goal } from "@/lib/types";

export default function AddGoalFab({ goal }: { goal: Goal | null }) {
  if (goal) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[92px] z-50 flex justify-center">
      <div className="flex w-full max-w-md justify-end px-4">
        <AddGoalSheet
          goal={null}
          triggerClassName="pointer-events-auto"
          trigger={
            <span
              aria-label="Add a goal"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-stone-700 shadow-lg ring-1 ring-stone-200 transition-transform active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
              </svg>
            </span>
          }
        />
      </div>
    </div>
  );
}
