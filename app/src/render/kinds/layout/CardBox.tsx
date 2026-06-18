import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { Node } from "../../Node";

export function CardBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const hasMeta = n.meta && n.meta.length > 0;
  const hasBadges = n.badges && n.badges.length > 0;
  const hasStats = n.stats && n.stats.length > 0;

  const box = (
    <div
      className={"wf-box wf-card-box " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-card-content">
        <div className="wf-card-header">
          <div className="wf-card-title">{n.title ?? n.label}</div>
        </div>

        {hasMeta && (
          <div className="wf-card-meta-row">
            {n.meta!.map((m, idx) => (
              <span key={idx} className="wf-card-meta-item">
                {m}
              </span>
            ))}
          </div>
        )}

        {hasBadges && (
          <div className="wf-card-badge-row">
            {n.badges!.map((b, idx) => (
              <span key={idx} className="wf-card-badge">
                {b}
              </span>
            ))}
          </div>
        )}

        {n.children && n.children.length > 0 && (
          <div className="wf-card-children">
            {n.children.map((child, idx) => (
              <Node key={child._id || idx} node={child} />
            ))}
          </div>
        )}

        {hasStats && (
          <div className="wf-card-footer">
            {n.stats!.map((s, idx) => (
              <span key={idx} className="wf-card-stat">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
