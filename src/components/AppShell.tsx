"use client";

import { useVisualViewportHeight } from "@/lib/useVisualViewport";

/**
 * Sizes the app shell from a live `visualViewport.height` measurement rather
 * than `100dvh`/`fixed inset-0`, both of which can under-report the real
 * screen height in an installed iOS home-screen app and never get a
 * follow-up resize to correct themselves — leaving a strip of the native
 * white canvas showing below our content.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const height = useVisualViewportHeight();
  
  return (
    <div
      className="fixed inset-x-0 top-0 flex flex-col text-stone-900">
      style={{ height: height ?? "100dvh"}}
      {children}
    </div>
  );
}
