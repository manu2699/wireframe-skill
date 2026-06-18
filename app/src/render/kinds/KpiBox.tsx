import type { WFNode } from "../../types";
import { Pin } from "../Pin";
import { FlowTag } from "../FlowTag";
import { useWF, handleClick } from "../context";
import { modClasses } from "../util";
import { withAnnotation } from "../Box";

export function KpiBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const box = (
    <div
      className={"wf-box wf-kpi-box " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-kpi-content">
        {n.label && <span className="wf-kpi-label">{n.label}</span>}
        <div className="wf-kpi-value-row">
          <span className="wf-kpi-value">{n.value}</span>
          {n.trend && (
            <span className={`wf-kpi-trend wf-trend-${n.trend}`}>
              {n.trend === "up" ? "↑" : "↓"}
            </span>
          )}
        </div>
        {n.subtitle && <span className="wf-kpi-subtitle">{n.subtitle}</span>}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n.backend, n.ds);
}
