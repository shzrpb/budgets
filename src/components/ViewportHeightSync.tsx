"use client";

import { useEffect } from "react";

/**
 * This app never lets the page itself scroll, so on some mobile browsers the
 * `100dvh` unit never gets a scroll/resize signal to re-sync with the real
 * toolbar state and can stay stuck taller than what's actually visible —
 * leaving a blank strip between the app and the browser's own bottom bar.
 * Track the live visualViewport height in JS instead, which always reflects
 * what's really on screen, and expose it as a CSS variable.
 */
export default function ViewportHeightSync() {
  useEffect(() => {
    const vv = window.visualViewport;

    function update() {
      const height = vv?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${height}px`);
    }

    update();
    vv?.addEventListener("resize", update);
    window.addEventListener("resize", update);
    return () => {
      vv?.removeEventListener("resize", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return null;
}
