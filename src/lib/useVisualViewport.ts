"use client";

import { useEffect, useState } from "react";

/**
 * iOS pins `position: fixed` elements to the layout viewport, not the area
 * actually visible above the keyboard — so a centered sheet with a text
 * input can end up with its bottom half hidden behind the keyboard. Tracking
 * `visualViewport` lets a sheet size itself to the space that's really free.
 */
export function useVisualViewportInsets(): { height: number | undefined; top: number } {
  const [insets, setInsets] = useState<{ height: number | undefined; top: number }>({
    height: undefined,
    top: 0,
  });

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function update() {
      setInsets({ height: vv!.height, top: vv!.offsetTop });
    }

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return insets;
}

/**
 * `100dvh`/`inset: 0` on a fixed shell should track the true visible screen,
 * but in an installed iOS home-screen app it can under-report the real
 * height and never get a follow-up resize to correct itself (there's no
 * browser chrome to animate in/out and trigger one), leaving the shell
 * short of the actual screen — the native white canvas shows through below
 * it. Track `visualViewport.height` directly and size the shell from it, so
 * it's driven by a live measurement instead of a CSS unit that may never
 * update.
 */
export function useVisualViewportHeight(): number | undefined {
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function update() {
      setHeight(vv!.height);
    }

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return height;
}
