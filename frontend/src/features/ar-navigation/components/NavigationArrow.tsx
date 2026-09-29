import { useEffect, useRef } from "react";
import type { NavigationDirection } from "../types/checkpointNavigation";
import type { createNavigationArrow } from "../services/navigationArrow";

const symbols: Record<NavigationDirection, string> = {
  straight: "↑",
  left: "↑",
  right: "↑",
  back: "↑",
  destination: "✓",
  unknown: "•",
};

export default function NavigationArrow({
  direction,
  relativeAngle = 0,
}: {
  direction: NavigationDirection;
  relativeAngle?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const renderer = useRef<ReturnType<typeof createNavigationArrow> | null>(
    null,
  );
  const latestDirection = useRef(direction);
  const latestAngle = useRef(relativeAngle);
  useEffect(() => {
    latestDirection.current = direction;
    latestAngle.current = relativeAngle;
    renderer.current?.setDirection(direction, relativeAngle);
  }, [direction, relativeAngle]);
  useEffect(() => {
    let cancelled = false;
    const element = host.current;
    if (!element) return;
    void import("../services/navigationArrow")
      .then(({ createNavigationArrow }) => {
        if (cancelled) return;
        renderer.current = createNavigationArrow(element);
        renderer.current.setDirection(
          latestDirection.current,
          latestAngle.current,
        );
      })
      .catch((error: unknown) => {
        // The visible symbol and instruction text remain usable without WebGL.
        if (!cancelled) {
          element.dataset.renderer = "fallback";
          if (import.meta.env.DEV)
            console.warn("[navigation arrow] Using text fallback:", error);
        }
      });
    return () => {
      cancelled = true;
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, []);
  return (
    <div
      ref={host}
      aria-hidden="true"
      data-direction={direction}
      className="group pointer-events-none relative mx-auto h-36 w-full max-w-xs"
    >
      <span
        className={`absolute inset-0 grid place-items-center text-7xl transition-transform duration-300 ${direction === "destination" ? "text-emerald-400" : "text-[#F5D76E]"} group-data-[renderer=ready]:hidden`}
        style={{
          transform:
            direction === "destination"
              ? undefined
              : `rotate(${relativeAngle}deg)`,
        }}
      >
        {symbols[direction]}
      </span>
    </div>
  );
}
