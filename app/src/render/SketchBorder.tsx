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
  fill,
  stroke,
  strokeWidth = 1.125,
  roughness = 1.125,
  bowing = 1.4,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const parent = svg?.parentElement;
    if (!svg || !parent) return;

    let prevW = 0;
    let prevH = 0;
    let raf = 0;

    const redraw = () => {
      raf = 0;
      const w = parent.offsetWidth;
      const h = parent.offsetHeight;
      if (!w || !h) return;
      if (w === prevW && h === prevH) return;
      prevW = w;
      prevH = h;

      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

      while (svg.firstChild) svg.removeChild(svg.firstChild);

      const styles = getComputedStyle(parent);
      const resolvedStroke = stroke ?? styles.color;
      const parentBg = styles.backgroundColor;
      const hasOwnBg = parentBg && parentBg !== "rgba(0, 0, 0, 0)" && parentBg !== "transparent";
      const resolvedFill = fill ?? (hasOwnBg ? parentBg : (styles.getPropertyValue("--wf-bg").trim() || "none"));

      const rc = rough.svg(svg);
      const pad = strokeWidth / 2 + 0.5;
      const shape = rc.rectangle(
        pad, pad,
        w - pad * 2, h - pad * 2,
        {
          roughness,
          bowing,
          stroke: resolvedStroke,
          strokeWidth,
          fill: resolvedFill,
          fillStyle: "solid",
          seed: Math.floor(w * 3 + h * 7),
        },
      );
      svg.appendChild(shape);
    };

    const scheduleRedraw = () => {
      if (!raf) raf = requestAnimationFrame(redraw);
    };

    redraw();
    const ro = new ResizeObserver(scheduleRedraw);
    ro.observe(parent);
    const forceRedraw = () => { prevW = 0; prevH = 0; scheduleRedraw(); };
    const mo = new MutationObserver(forceRedraw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => { ro.disconnect(); mo.disconnect(); if (raf) cancelAnimationFrame(raf); };
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
        overflow: "hidden",
        zIndex: -1,
      }}
    />
  );
}
