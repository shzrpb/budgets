"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

function subscribe() {
  return () => {};
}

/** True only once mounted client-side; document.body isn't available during SSR. */
function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/**
 * Renders children into document.body instead of in place. Sheets and
 * popups need this: several cards they're triggered from (.hero) use
 * backdrop-filter, which creates a containing block for `position: fixed`
 * descendants — without a portal, a "fullscreen" overlay opened from inside
 * one gets clipped to that card's box instead of covering the viewport.
 */
export default function Portal({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(children, document.body);
}
