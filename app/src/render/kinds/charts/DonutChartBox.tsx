import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";

export function DonutChartBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const defaultData = [
    { label: "Category A", value: 60 },
    { label: "Category B", value: 25 },
    { label: "Category C", value: 15 }
  ];

  const data = n.chartData && n.chartData.length > 0 ? n.chartData : defaultData;
  const sum = data.reduce((acc, d) => acc + d.value, 0) || 1;

  let accumulated = 0;

  const box = (
    <div
      className={"wf-box wf-donutchart-box " + modClasses(n)}
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
        <div className="wf-chart-body wf-donutchart-body">
          <div className="wf-donut-chart-wrapper">
            <div className="wf-donut-svg-container">
              <svg viewBox="0 0 40 40" className="wf-donut-svg">
                <circle
                  cx="20"
                  cy="20"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke="var(--wf-c-line)"
                  strokeWidth="3.5"
                />
                {data.map((d, i) => {
                  const pct = (d.value / sum) * 100;
                  const dashOffset = 100 - accumulated;
                  accumulated += pct;

                  return (
                    <circle
                      key={i}
                      cx="20"
                      cy="20"
                      r="15.91549430918954"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={`${pct} ${100 - pct}`}
                      strokeDashoffset={dashOffset}
                      className="wf-donut-segment"
                      style={{ opacity: 1 - i * 0.25 } as React.CSSProperties}
                    />
                  );
                })}
              </svg>
              <div className="wf-donut-center">
                <span className="wf-donut-center-value">{n.value || sum}</span>
                <span className="wf-donut-center-label">{n.subtitle || "Total"}</span>
              </div>
            </div>
            <div className="wf-donut-legend">
              {data.map((d, i) => (
                <div key={i} className="wf-donut-legend-item">
                  <span
                    className="wf-donut-legend-indicator"
                    style={{ opacity: 1 - i * 0.25 }}
                  >
                    ■
                  </span>
                  <span className="wf-donut-legend-text">
                    {d.label} ({d.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
