import type { WFNode } from "../../types";
import { Pin } from "../Pin";
import { FlowTag } from "../FlowTag";
import { useWF, handleClick } from "../context";
import { modClasses } from "../util";
import { withAnnotation } from "../Box";

export function TimelineBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const events = n.events || [];

  const box = (
    <div
      className={"wf-box wf-timeline-box " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-timeline-content">
        <div className="wf-timeline-line" />
        {events.map((event, i) => (
          <div key={i} className="wf-timeline-event">
            <div className="wf-timeline-dot" />
            <div className="wf-timeline-event-content">
              <span className="wf-timeline-event-label">{event.label}</span>
              {event.meta && <span className="wf-timeline-event-meta">{event.meta}</span>}
            </div>
          </div>
        ))}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n.backend, n.ds);
}
