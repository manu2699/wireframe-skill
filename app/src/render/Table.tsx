// Table block: header row + placeholder body rows. Commentable as a whole.

import type { CSSProperties } from "react";
import type { WFNode } from "../types";
import { Pin } from "./Pin";
import { useWF, handleClick } from "./context";
import { withAnnotation } from "./Box";

export function Table(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const cols = n.headers?.length || (n.rows?.[0]?.length ?? 3);
  const table = (
    <div
      className="wf-box wf-table"
      style={{ "--tcols": cols } as CSSProperties}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      {n.headers && (
        <div className="wf-tr">
          {n.headers.map((h, i) => <div key={i} className="wf-th">{h}</div>)}
        </div>
      )}
      {n.rows?.map((r, ri) => (
        <div key={ri} className="wf-tr">
          {r.map((c, ci) => <div key={ci} className="wf-td wf-placeholder">{c}</div>)}
        </div>
      ))}
    </div>
  );
  return withAnnotation(table, n.backend, n.ds);
}
