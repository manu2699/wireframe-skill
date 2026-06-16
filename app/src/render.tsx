// Recursive node → .wf-* renderer. Renders kind glyphs, enumerated nav, flow
// affordances, and annotation attributes. Interaction is delegated to the host
// via WFContext (comment vs click mode).

import { createContext, useContext, For, Show, type JSX } from "solid-js";
import type { NavItem, WFNode } from "./types";
import { Glyph } from "./glyphs";

export interface WFActions {
  mode: () => "comment" | "click";
  comment: (id: string, e: MouseEvent) => void;
  goto: (screenId: string) => void;
  openModal: (modalId: string) => void;
  pinOf: (id?: string) => number; // 1-based comment ordinal, or 0
}

function Pin(props: { id?: string }) {
  const wf = useWF();
  return (
    <Show when={wf.pinOf(props.id) > 0}>
      <span class="wfc-pin">{wf.pinOf(props.id)}</span>
    </Show>
  );
}

const WFContext = createContext<WFActions>();
export const WFProvider = WFContext.Provider;
const useWF = () => useContext(WFContext)!;

function modClasses(n: WFNode): string {
  return (n.mods || []).map((m) => "wf-" + m).join(" ");
}

// Resolve what an element does when clicked, honoring the current mode.
function handleClick(
  wf: WFActions,
  id: string | undefined,
  goto: string | undefined,
  opens: string | undefined,
  e: MouseEvent,
) {
  e.stopPropagation();
  if (wf.mode() === "click") {
    if (goto) return wf.goto(goto);
    if (opens) return wf.openModal(opens);
    // non-actionable in click mode: ignore
    return;
  }
  // comment mode: any commentable element opens a comment
  if (id) wf.comment(id, e);
}

function FlowTag(props: { goto?: string; opens?: string; action?: string }) {
  const label = () =>
    props.goto ? "→ " + props.goto :
    props.opens ? "⊕ " + props.opens :
    props.action ? props.action : "";
  return (
    <Show when={label()}>
      <span class="wf-flow" title={label()}>{props.goto ? "→" : props.opens ? "⊕" : "↵"}</span>
    </Show>
  );
}

function NavBlock(props: { node: WFNode }) {
  const wf = useWF();
  return (
    <nav class={"wf-ia-nav " + (props.node.side === "top" ? "wf-ia-top" : "wf-ia-left")}>
      <For each={props.node.groups}>
        {(g) => (
          <div class="wf-nav-group">
            <Show when={g.label}><div class="wf-nav-group-label">{g.label}</div></Show>
            <For each={g.items}>
              {(it: NavItem & { _id?: string }) => (
                <div
                  class="wf-box wf-nav-item"
                  classList={{ "wf-nav-active": !!it.active }}
                  data-wf-id={it._id}
                  data-wf-commented={wf.pinOf(it._id) > 0 ? "1" : undefined}
                  data-backend={it.backend}
                  data-ds={it.ds}
                  onClick={(e) => handleClick(wf, it._id, it.goto, it.opens, e)}
                >
                  <Pin id={it._id} />
                  <span class="wf-nav-text">{it.text}</span>
                  <Show when={it.badge != null}><span class="wf-nav-badge">{String(it.badge)}</span></Show>
                  <FlowTag goto={it.goto} opens={it.opens} />
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </nav>
  );
}

function TableBlock(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const cols = n.headers?.length || (n.rows?.[0]?.length ?? 3);
  return (
    <div
      class="wf-box wf-table"
      style={{ "--tcols": cols }}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <Show when={n.headers}>
        <div class="wf-tr">
          <For each={n.headers}>{(h) => <div class="wf-th">{h}</div>}</For>
        </div>
      </Show>
      <For each={n.rows}>
        {(r) => (
          <div class="wf-tr">
            <For each={r}>{(c) => <div class="wf-td wf-placeholder">{c}</div>}</For>
          </div>
        )}
      </For>
    </div>
  );
}

export function Node(props: { node: WFNode & { _id?: string } }): JSX.Element {
  const wf = useWF();
  const n = props.node;

  switch (n.type) {
    case "row":
      return <div class={"wf-row " + modClasses(n)}><For each={n.children}>{(c) => <Node node={c} />}</For></div>;
    case "col":
      return <div class={"wf-col " + modClasses(n)}><For each={n.children}>{(c) => <Node node={c} />}</For></div>;
    case "grid":
      return (
        <div class={"wf-grid " + modClasses(n)} style={{ "--cols": n.cols ?? 3 }}>
          <For each={n.children}>{(c) => <Node node={c} />}</For>
        </div>
      );
    case "nav":
      return <NavBlock node={n} />;
    case "table":
      return <TableBlock node={n} />;
    case "raw":
      return (
        <div class={"wf-box " + modClasses(n)} data-wf-id={n._id}
             data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
             onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}>
          <Pin id={n._id} />
          <div innerHTML={n.html} />
        </div>
      );
    case "box":
    default: {
      return (
        <div
          class={"wf-box " + (n.kind ? "wf-kind " : "") + modClasses(n)}
          data-wf-id={n._id}
          data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
          data-kind={n.kind}
          data-backend={n.backend}
          data-ds={n.ds}
          onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
        >
          <Pin id={n._id} />
          <Glyph kind={n.kind} />
          <Show when={n.label}><span class="wf-box-label">{n.label}</span></Show>
          <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
        </div>
      );
    }
  }
}
