import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";

export function BarChartBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const defaultData = [
    { label: "A", value: 40 },
    { label: "B", value: 75, target: 80 },
    { label: "C", value: 50 },
    { label: "D", value: 90, target: 85 },
    { label: "E", value: 60 }
  ];

  const data = n.chartData && n.chartData.length > 0 ? n.chartData : defaultData;
  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.target ?? 0)), 1);

  const box = (
    <div
      className={"wf-box wf-barchart-box " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-chart-container">
        {n.label && <span className="wf-chart-label">{n.label}</span>}
        <div className="wf-chart-body wf-barchart-body">
          <div className="wf-chart-axis-y" />
          <div className="wf-chart-axis-x" />
          <div className="wf-chart-bars">
            {data.map((d, i) => {
              const valPct = (d.value / maxVal) * 100;
              const hasTarget = d.target !== undefined;
              const tgtPct = hasTarget ? ((d.target ?? 0) / maxVal) * 100 : 0;

              return (
                <div key={i} className="wf-chart-bar-group">
                  <div className="wf-chart-bar-cols">
                    <div
                      className="wf-chart-bar-main"
                      style={{ height: `${valPct}%` }}
                      title={`Value: ${d.value}`}
                    />
                    {hasTarget && (
                      <div
                        className="wf-chart-bar-target"
                        style={{ height: `${tgtPct}%` }}
                        title={`Target: ${d.target}`}
                      />
                    )}
                  </div>
                  <span className="wf-chart-bar-label">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
