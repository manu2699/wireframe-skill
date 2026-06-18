// Information-architecture nav: enumerated, grouped nav items (left rail or top
// bar). Each item is individually commentable and can drive flow.

import type { NavItem, WFNode } from "../types";
import { Pin } from "./Pin";
import { FlowTag } from "./FlowTag";
import { useWF, handleClick } from "./context";
import { withAnnotation } from "./Box";

export function Nav(props: { node: WFNode }) {
  const wf = useWF();
  return (
    <nav className={"wf-ia-nav " + (props.node.side === "top" ? "wf-ia-top" : "wf-ia-left")}>
      {props.node.groups?.map((g, gi) => (
        <div key={gi} className="wf-nav-group">
          {g.label && <div className="wf-nav-group-label">{g.label}</div>}
          {g.items.map((it: NavItem & { _id?: string }, ii) => {
            const item = (
              <div
                className={"wf-box wf-nav-item" + (it.active ? " wf-nav-active" : "")}
                data-wf-id={it._id}
                data-wf-commented={wf.pinOf(it._id) > 0 ? "1" : undefined}
                data-backend={it.backend}
                data-ds={it.ds}
                onClick={(e) => handleClick(wf, it._id, it.goto, it.opens, e)}
              >
                <Pin id={it._id} />
                <span className="wf-nav-text">{it.text}</span>
                {it.badge != null && <span className="wf-nav-badge">{String(it.badge)}</span>}
                <FlowTag goto={it.goto} opens={it.opens} />
              </div>
            );
            return <span key={ii} className="contents">{withAnnotation(item, it)}</span>;
          })}
        </div>
      ))}
    </nav>
  );
}
