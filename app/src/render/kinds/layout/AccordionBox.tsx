import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";

export function AccordionBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const sections = n.sections || [];

  const box = (
    <div
      className={"wf-box wf-accordion-box " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-accordion-content">
        {sections.map((section, i) => {
          const isExpanded = !!section.expanded;
          return (
            <div key={i} className="wf-accordion-section">
              <div className="wf-accordion-header">
                <span className="wf-accordion-title">{section.title}</span>
                <span className="wf-accordion-chevron">{isExpanded ? "▾" : "▸"}</span>
              </div>
              {isExpanded && (
                <div className="wf-accordion-body">
                  <div className="wf-accordion-body-placeholder" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
