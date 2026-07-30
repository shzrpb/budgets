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
