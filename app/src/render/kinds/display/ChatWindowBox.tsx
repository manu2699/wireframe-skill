import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";

export function ChatWindowBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;

  const messages = n.messages || [];

  const box = (
    <div
      className={"wf-box wf-chat-window-box " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-chat-content">
        <div className="wf-chat-header">
          <span className="wf-chat-title">{n.label || "Chat Dialogue"}</span>
        </div>
        <div className="wf-chat-messages">
          {messages.map((msg, i) => {
            const isSent = !!msg.sent;
            return (
              <div
                key={i}
                className={"wf-chat-bubble-container" + (isSent ? " wf-chat-bubble-sent" : " wf-chat-bubble-received")}
              >
                <div className="wf-chat-bubble">
                  <div className="wf-chat-bubble-sender">{msg.from}</div>
                  <div className="wf-chat-bubble-text">{msg.text}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="wf-chat-footer">
          <span className="wf-chat-input-placeholder">Type a message...</span>
          <span className="wf-chat-send-btn">Send</span>
        </div>
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
