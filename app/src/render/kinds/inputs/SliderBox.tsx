import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";

export function SliderBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const min = n.min ?? 0;
  const max = n.max ?? 100;
  const val = n.sliderValue ?? 50;
  const pct = max > min ? Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100)) : 50;

  const box = (
    <div
      className={"wf-box wf-slider-box " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-slider-content">
        <div className="wf-slider-header">
          {n.label && <span className="wf-slider-label">{n.label}</span>}
          <span className="wf-slider-value">{val}</span>
        </div>
        <div className="wf-slider-track">
          <div className="wf-slider-track-fill" style={{ width: `${pct}%` }} />
          <div className="wf-slider-thumb" style={{ left: `${pct}%` }} />
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
