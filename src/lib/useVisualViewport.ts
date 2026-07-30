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
 * iOS Safari and Chrome both draw their own chrome (address bar, tab bar)
 * inside the layout viewport rather than below it, and that bar can be
 * anchored to the bottom of the screen. A `position: fixed; bottom: 0`
 * element sizes itself to the layout viewport, so it ends up positioned
 * behind that browser UI instead of just above it, leaving what looks like
 * a solid block between our content and the real bottom edge. Track how
 * much of the layout viewport's bottom is currently covered so a fixed
 * element can offset itself above it instead.
 */
export function useVisualViewportBottomGap(): number {
  const [gap, setGap] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function update() {
      const layoutHeight = window.innerHeight;
      const visibleBottom = vv!.height + vv!.offsetTop;
      setGap(Math.max(0, layoutHeight - visibleBottom));
    }

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return gap;
}
