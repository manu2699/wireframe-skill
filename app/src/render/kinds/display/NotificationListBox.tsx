import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";

export function NotificationListBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const notifications = n.notifications || [];

  const box = (
    <div
      className={"wf-box wf-notification-list-box " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-notification-list-content">
        {n.label && <span className="wf-notification-list-header-label">{n.label}</span>}
        <div className="wf-notification-items">
          {notifications.map((item, i) => {
            const isUnread = !!item.unread;
            return (
              <div
                key={i}
                className={"wf-notification-item" + (isUnread ? " wf-notification-unread" : "")}
              >
                <div className="wf-notification-indicator">
                  {isUnread && <span className="wf-notification-dot">●</span>}
                </div>
                <div className="wf-notification-item-body">
                  <span className="wf-notification-text">{item.text}</span>
                  {item.meta && <span className="wf-notification-meta">{item.meta}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
