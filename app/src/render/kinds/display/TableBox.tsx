import type { CSSProperties } from "react";
import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";
import { useSketchBorder } from "../../SketchBorder";

export function TableBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const sketchBorder = useSketchBorder();

  const headers = n.headers || [];
  const rows = n.rows || [];
  const hasActions = n.actions && n.actions.length > 0;
  
  let colCount = headers.length;
  if (n.selectable) colCount += 1;
  if (hasActions) colCount += 1;

  const box = (
    <div
      className={"wf-box block w-full p-0 min-h-0 text-left overflow-visible " + modClasses(n)}
      style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      {sketchBorder}
      <Pin id={n._id} />
      <div className="wf-table-content w-full flex flex-col">
        <div
          className="grid border-t border-[var(--wf-c-line)] first:border-t-0"
          style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
        >
          {n.selectable && <div className="wf-th wf-table-checkbox-col w-8 text-center justify-center shrink-0 flex items-center py-2 px-2.5 min-w-0 border-l border-[var(--wf-c-line)] first:border-l-0">☐</div>}
          {headers.map((h, i) => (
            <div
              key={i}
              className="wf-th py-2 px-2.5 min-w-0 border-l border-[var(--wf-c-line)] first:border-l-0 whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {h}
            </div>
          ))}
          {hasActions && <div className="wf-th wf-table-actions-col justify-end flex items-center text-right py-2 px-2.5 min-w-0 border-l border-[var(--wf-c-line)] first:border-l-0">Actions</div>}
        </div>
        {rows.map((row, ri) => (
          <div
            key={ri}
            className="grid border-t border-[var(--wf-c-line)] first:border-t-0"
            style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
          >
            {n.selectable && <div className="wf-td wf-table-checkbox-col w-8 text-center justify-center shrink-0 flex items-center py-2 px-2.5 min-w-0 border-l border-[var(--wf-c-line)] first:border-l-0">☐</div>}
            {row.map((cell, ci) => (
              <div
                key={ci}
                className="wf-td py-2 px-2.5 min-w-0 border-l border-[var(--wf-c-line)] first:border-l-0 whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {cell}
              </div>
            ))}
            {hasActions && (
              <div className="wf-td wf-table-actions-col justify-end flex items-center text-right py-2 px-2.5 min-w-0 border-l border-[var(--wf-c-line)] first:border-l-0">
                <div className="wf-table-actions-container flex gap-1.5 justify-end">
                  {n.actions?.map((act, ai) => (
                    <span key={ai} className="wf-table-action-btn ml-1.5">
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

  return withAnnotation(box, n);
}
