// Renders a rough.js hand-drawn rectangle overlay that exactly fits the parent
// element. Only mounted when sketch mode is active (controlled by the caller).

import { useEffect, useRef } from "react";
import { useWF } from "./context";

/** Call at the top of a kind component; returns <SketchBorder/> or null. */
export function useSketchBorder(opts?: Omit<Props, never>) {
  const wf = useWF();
  return wf.drawMode() === "sketch" ? <SketchBorder {...(opts ?? {})} /> : null;
}
import rough from "roughjs";

interface Props {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  bowing?: number;
}

export function SketchBorder({
  fill = "none",
  stroke = "#3f3f46",
  strokeWidth = 1.125,
  roughness = 1.125,
  bowing = 1.4,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const parent = svg?.parentElement;
    if (!svg || !parent) return;

    const redraw = () => {
      const w = parent.offsetWidth;
      const h = parent.offsetHeight;
      if (!w || !h) return;

      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

      // Clear previous drawing
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      const rc = rough.svg(svg);
      const pad = strokeWidth + 1;
      const shape = rc.rectangle(pad, pad, w - pad * 2, h - pad * 2, {
        roughness,
        bowing,
        stroke,
        strokeWidth,
        fill,
        fillStyle: "solid",
        seed: Math.floor(w * 3 + h * 7), // stable per-box seed based on size
      });
      svg.appendChild(shape);
    };

    redraw();
    const ro = new ResizeObserver(redraw);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [fill, stroke, strokeWidth, roughness, bowing]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className="wf-sketch-border"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 0,
      }}
    />
  );
}
