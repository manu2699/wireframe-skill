// Layout containers: row / col / grid. These carry no id (not commentable) and
// just arrange their children. One component, registered under all three types.

import type { CSSProperties } from "react";
import type { WFNode } from "../types";
import { Node } from "./Node";
import { modClasses } from "./util";

export function Layout(props: { node: WFNode }) {
  const n = props.node;
  if (n.type === "grid") {
    return (
      <div
        className={"wf-grid " + modClasses(n)}
        style={{ "--cols": n.cols ?? 3 } as CSSProperties}
      >
        {n.children?.map((c, i) => <Node key={i} node={c} />)}
      </div>
    );
  }
  if (n.type === "col") {
    return (
      <div
        className={"wf-col " + modClasses(n)}
        style={n.flex !== undefined ? { flex: n.flex } : undefined}
      >
        {n.children?.map((c, i) => <Node key={i} node={c} />)}
      </div>
    );
  }
  const cls = "wf-row ";
  return (
    <div className={cls + modClasses(n)}>
      {n.children?.map((c, i) => <Node key={i} node={c} />)}
    </div>
  );
}
