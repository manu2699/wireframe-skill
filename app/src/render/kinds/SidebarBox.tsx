import type { WFNode } from "../../types";
import { Pin } from "../Pin";
import { FlowTag } from "../FlowTag";
import { useWF, handleClick } from "../context";
import { modClasses } from "../util";
import { withAnnotation } from "../Box";

export function SidebarBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const groups = n.sidebarGroups || [];
  const activeItem = n.activeItem;

  const box = (
    <div
      className={"wf-box wf-sidebar-box " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-sidebar-content">
        {groups.map((group, gi) => (
          <div key={gi} className="wf-sidebar-group">
            {group.label && <div className="wf-sidebar-group-label">{group.label}</div>}
            <div className="wf-sidebar-items">
              {group.items.map((item, ii) => {
                const isActive = item === activeItem;
                return (
                  <div
                    key={ii}
                    className={"wf-sidebar-item" + (isActive ? " wf-sidebar-active" : "")}
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n.backend, n.ds);
}
