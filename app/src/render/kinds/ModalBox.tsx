import type { WFNode } from "../../types";
import { Pin } from "../Pin";
import { FlowTag } from "../FlowTag";
import { useWF, handleClick } from "../context";
import { modClasses } from "../util";
import { withAnnotation } from "../Box";
import { Node } from "../Node";

export function ModalBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const footerButtons = n.modalFooter || [];

  const box = (
    <div
      className={"wf-box wf-modal-box " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-modal-content">
        <div className="wf-modal-header">
          <span className="wf-modal-title">{n.modalTitle || n.label || "Modal Window"}</span>
          <span className="wf-modal-close">×</span>
        </div>
        <div className="wf-modal-body">
          {n.children && n.children.length > 0 ? (
            n.children.map((child, idx) => (
              <Node key={child._id || idx} node={child} />
            ))
          ) : (
            <div className="wf-modal-body-placeholder" />
          )}
        </div>
        {footerButtons.length > 0 && (
          <div className="wf-modal-footer">
            {footerButtons.map((btn, i) => (
              <span key={i} className="wf-modal-footer-btn">
                {btn}
              </span>
            ))}
          </div>
        )}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n.backend, n.ds);
}
