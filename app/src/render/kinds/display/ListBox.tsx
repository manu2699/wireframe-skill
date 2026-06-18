import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";

export function ListBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const items = n.items || [];

  const box = (
    <div
      className={"wf-box wf-list-box " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-list-content">
        {n.label && <div className="wf-list-header">{n.label}</div>}
        <ul className="wf-list-items">
          {items.map((item, idx) => (
            <li key={idx} className="wf-list-item">
              <span className="wf-list-bullet">•</span>
              <span className="wf-list-text">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
