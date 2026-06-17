// Default leaf renderer: a grey box with an optional kind glyph, label, and flow
// tag. The catch-all for `type: "box"` (and any unknown type via the registry).
//
// When a box carries a backend/ds annotation, it's wrapped in a collision-aware
// Radix Tooltip (replaces the old CSS ::after tooltip that was always above and
// clipped on edge rows).

import type { ReactNode } from "react";
import type { WFNode } from "../types";
import { Glyph } from "./Glyph";
import { Pin } from "./Pin";
import { FlowTag } from "./FlowTag";
import { useWF, handleClick } from "./context";
import { modClasses } from "./util";
import { Tooltip, TooltipTrigger, TooltipContent } from "../components/ui/tooltip";

export function Box(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const box = (
    <div
      className={"wf-box " + (n.kind ? "wf-kind " : "") + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <Glyph kind={n.kind} />
      {n.label && <span className="wf-box-label">{n.label}</span>}
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );
  return withAnnotation(box, n.backend, n.ds);
}

// Shared by Box / Table / Nav: wrap a trigger in an annotation tooltip when it
// has backend/ds metadata, otherwise return it untouched.
export function withAnnotation(trigger: ReactNode, backend?: string, ds?: string): ReactNode {
  if (!backend && !ds) return <>{trigger}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent>
        {backend && <div><span className="opacity-60">BE&nbsp;&nbsp;</span>{backend}</div>}
        {ds && <div><span className="opacity-60">DS&nbsp;&nbsp;</span>{ds}</div>}
      </TooltipContent>
    </Tooltip>
  );
}
