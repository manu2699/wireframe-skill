import type { CSSProperties } from "react";
import type { WFNode } from "../../types";
import { Pin } from "../Pin";
import { FlowTag } from "../FlowTag";
import { useWF, handleClick } from "../context";
import { modClasses } from "../util";
import { withAnnotation } from "../Box";

export function TableBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const headers = n.headers || [];
  const rows = n.rows || [];
  const hasActions = n.actions && n.actions.length > 0;
  
  let colCount = headers.length;
  if (n.selectable) colCount += 1;
  if (hasActions) colCount += 1;

  const box = (
    <div
      className={"wf-box wf-table-box wf-table " + modClasses(n)}
      style={{ "--tcols": colCount } as CSSProperties}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-table-content">
        <div className="wf-tr">
          {n.selectable && <div className="wf-th wf-table-checkbox-col">☐</div>}
          {headers.map((h, i) => (
            <div key={i} className="wf-th">
              {h}
            </div>
          ))}
          {hasActions && <div className="wf-th wf-table-actions-col">Actions</div>}
        </div>
        {rows.map((row, ri) => (
          <div key={ri} className="wf-tr">
            {n.selectable && <div className="wf-td wf-table-checkbox-col">☐</div>}
            {row.map((cell, ci) => (
              <div key={ci} className="wf-td">
                {cell}
              </div>
            ))}
            {hasActions && (
              <div className="wf-td wf-table-actions-col">
                <div className="wf-table-actions-container">
                  {n.actions?.map((act, ai) => (
                    <span key={ai} className="wf-table-action-btn">
                      {act}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n.backend, n.ds);
}
