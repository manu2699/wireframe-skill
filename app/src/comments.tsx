// Review sidebar (meta + comment list + actions) and the anchored comment popover.

import { For, Show, createSignal, type Accessor } from "solid-js";
import type { Comment, WFModel } from "./types";

export interface PopoverState {
  id: string;
  label: string;
  screen: string;
  state: string;
  text: string;
  x: number;
  y: number;
}

export function Popover(props: {
  state: PopoverState;
  onSave: (text: string) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [text, setText] = createSignal(props.state.text);
  const existing = !!props.state.text;
  return (
    <div class="wfc-pop" style={{ top: props.state.y + "px", left: props.state.x + "px" }}
         onClick={(e) => e.stopPropagation()}>
      <div class="wfc-pop-meta">{props.state.label} <em>— {props.state.screen}</em></div>
      <textarea class="wfc-pop-input" rows="3" placeholder="What should change here?"
                autofocus value={text()} onInput={(e) => setText(e.currentTarget.value)} />
      <div class="wfc-pop-actions">
        <Show when={existing}>
          <button type="button" class="wfc-pop-del" onClick={() => props.onDelete()}>Delete</button>
        </Show>
        <button type="button" class="wfc-pop-cancel" onClick={() => props.onClose()}>Cancel</button>
        <button type="button" class="wfc-pop-save" onClick={() => {
          const t = text().trim();
          if (!t) return props.onClose();
          props.onSave(t);
        }}>Save</button>
      </div>
    </div>
  );
}

export function ReviewSidebar(props: {
  model: WFModel;
  comments: Record<string, Comment>;
  order: Accessor<string[]>;
  connected: Accessor<boolean>;
  sent: Accessor<string>;
  onFeedback: () => void;
  onApprove: () => void;
  onDelete: (id: string) => void;
}) {
  const ids = () => props.order().filter((id) => props.comments[id]);
  return (
    <aside class="wf-review">
      <div class="wf-meta">
        <Show when={props.model.change}>
          <div class="wf-meta-row"><span class="wf-meta-label">Change</span>
            <span class="wf-meta-val">{props.model.change}</span></div>
        </Show>
        <div class="wf-meta-row"><span class="wf-meta-label">Screens</span>
          <span class="wf-meta-val">{props.model.screens.map((s) => s.name).join(", ")}</span></div>
        <Show when={props.model.designSource}>
          <div class="wf-meta-row"><span class="wf-meta-label">Design</span>
            <span class="wf-meta-val">{props.model.designSource}</span></div>
        </Show>
        <div class="wf-key">
          <span class="wf-key-item"><span class="wf-dot be" />backend</span>
          <span class="wf-key-item"><span class="wf-dot ds" />design system</span>
          <span class="wf-key-item"><span class="wf-dot guess" />guessed</span>
        </div>
      </div>

      <div class="wf-comments">
        <div class="wf-comments-header">
          <span class="wf-comments-title">Comments</span>
          <span class="wf-count-badge">{ids().length || ""}</span>
        </div>
        <Show when={ids().length === 0}>
          <p class="wf-hint">Click any box to add a comment. Switch to <strong>Click-through</strong> mode (top right) to walk the flow.</p>
        </Show>
        <ol class="wfc-list">
          <For each={ids()}>
            {(id, i) => {
              const c = () => props.comments[id];
              return (
                <li>
                  <div class="wfc-item-row">
                    <label class="wfc-item">
                      <input type="checkbox" class="wfc-done" />
                      <span class="wfc-meta-text"><strong>{i() + 1}.</strong> {c().label}{" "}
                        <em>{c().screen}{c().state ? " / " + c().state : ""}</em></span>
                    </label>
                    <button type="button" class="wfc-list-del" title="Delete"
                            onClick={() => props.onDelete(id)}>×</button>
                  </div>
                  <div class="wfc-body-text">{c().text}</div>
                </li>
              );
            }}
          </For>
        </ol>
      </div>

      <div class="wf-actions">
        <div class="wf-actions-row">
          <button class="wfc-btn wfc-btn-send" onClick={() => props.onFeedback()}>
            {props.connected() ? "Send to agent" : "Copy feedback"}
          </button>
          <button class="wfc-btn wfc-btn-approve" onClick={() => props.onApprove()}>✓ Approve</button>
        </div>
        <div class="wfc-sent-msg" style={{ opacity: props.sent() ? "1" : "0" }}>{props.sent()}</div>
      </div>
    </aside>
  );
}
