import type { WFNode } from "../../types";
import { Pin } from "../Pin";
import { FlowTag } from "../FlowTag";
import { useWF, handleClick } from "../context";
import { modClasses } from "../util";
import { withAnnotation } from "../Box";

export function ProgressBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const percent = Math.min(100, Math.max(0, n.percent ?? 0));

  const box = (
    <div
      className={"wf-box wf-progress-box " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-progress-content">
        <div className="wf-progress-header">
          {n.label && <span className="wf-progress-label">{n.label}</span>}
          <span className="wf-progress-text">{percent}%</span>
        </div>
        <div className="wf-progress-track">
          <div className="wf-progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n.backend, n.ds);
}
