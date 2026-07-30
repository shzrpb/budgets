"use client";

import { useAnySheetOpen } from "@/lib/sheetVisibility";

/** Locks the page's own scroll while any sheet is open, so a tall sheet's
 * internal scroll never chains into the page underneath it. */
export default function ScrollContainer({ children }: { children: React.ReactNode }) {
  const sheetOpen = useAnySheetOpen();

  return (
    <main
      className={`mesh-surface min-h-0 flex-1 ${sheetOpen ? "overflow-hidden" : "overflow-y-auto"}`}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        // TopNav is fixed to the true bottom of the screen instead of being
        // a flex child here, so reserve the same space it occupies.
        paddingBottom: "calc(13px + 56px + max(1rem, env(safe-area-inset-bottom)))",
      }}
    >
      {children}
    </main>
  );
}
