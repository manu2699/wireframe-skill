import type { WFNode } from "../../types";
import { Pin } from "../Pin";
import { FlowTag } from "../FlowTag";
import { useWF, handleClick } from "../context";
import { modClasses } from "../util";
import { withAnnotation } from "../Box";

export function DatepickerBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const box = (
    <div
      className={"wf-box wf-datepicker-box " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-datepicker-content">
        {n.label && <span className="wf-datepicker-label">{n.label}</span>}
        <div className="wf-datepicker-field">
          <span className="wf-datepicker-value">{n.dateValue || "Select date..."}</span>
          <svg className="wf-datepicker-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="12" height="11" rx="1" />
            <line x1="2" y1="6" x2="14" y2="6" />
            <line x1="5" y1="1" x2="5" y2="3" />
            <line x1="11" y1="1" x2="11" y2="3" />
          </svg>
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n.backend, n.ds);
}
