import type { WFNode } from "../../types";
import { Pin } from "../Pin";
import { FlowTag } from "../FlowTag";
import { useWF, handleClick } from "../context";
import { modClasses } from "../util";
import { withAnnotation } from "../Box";

export function SearchBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const box = (
    <div
      className={"wf-box wf-search-box " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-search-content">
        <div className="wf-search-input-container">
          <svg className="wf-search-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="4" />
            <line x1="10" y1="10" x2="14" y2="14" />
          </svg>
          <span className="wf-search-placeholder">{n.placeholder || "Search..."}</span>
        </div>
        {n.filters && n.filters.length > 0 && (
          <div className="wf-search-filters">
            {n.filters.map((filter, i) => (
              <span key={i} className="wf-search-filter-chip">
                {filter}
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
