// Recursive node dispatcher. Looks up the renderer for a node's type in the
// registry and delegates; the chosen renderer recurses back into <Node> for its
// children.

import type { WFNode } from "../types";
import { registry, fallbackRenderer } from "./registry";

export function Node(props: { node: WFNode & { _id?: string } }) {
  const Comp = registry[props.node.type] ?? fallbackRenderer;
  return <Comp node={props.node} />;
}

export { WFProvider } from "./context";
export type { WFActions } from "./context";
