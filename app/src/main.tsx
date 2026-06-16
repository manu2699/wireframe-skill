// Entry: read the inlined #wf-model, compose the operating layer, mount.

import { render } from "solid-js/web";
import { For, Show, createSignal, createMemo } from "solid-js";
import { Node, WFProvider, type WFActions } from "./render";
import { ReviewSidebar, Popover, type PopoverState } from "./comments";
import { readModel, createNav, createComments, metaOf } from "./store";
import { buildFeedback, buildApproval } from "./blocks";
import { connected, sendOrCopy } from "./ws";
import type { WFScreen } from "./types";

function App() {
  const model = readModel();
  const { nav, gotoScreen, setState, openModal, closeModal, setMode } = createNav(model);
  const { comments, order, upsert, remove } = createComments();

  const [popover, setPopover] = createSignal<PopoverState | null>(null);
  const [sent, setSent] = createSignal("");
  let flashTimer: ReturnType<typeof setTimeout>;
  const flash = (msg: string) => {
    setSent(msg);
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => setSent(""), 2200);
  };

  const pinOf = (id?: string) => (id ? order().indexOf(id) + 1 : 0);

  const activeScreen = createMemo<WFScreen | undefined>(() =>
    model.screens.find((s) => s.id === nav.screenId));
  const activeState = createMemo(() => {
    const sc = activeScreen();
    if (!sc) return undefined;
    return sc.states.find((st) => st.id === nav.stateByScreen[sc.id]) || sc.states[0];
  });
  const activeModal = createMemo(() =>
    (model.modals || []).find((m) => m.id === nav.modalId));

  const badgeCount = (screenName: string) =>
    order().filter((id) => comments[id] && metaOf(id)?.screen === screenName).length;

  const comment = (id: string, e: MouseEvent) => {
    const el = (e.currentTarget as HTMLElement) || (e.target as HTMLElement);
    const r = el.getBoundingClientRect();
    const margin = 8, pw = 260, ph = 150;
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const left = Math.max(margin, Math.min(r.left, vw - pw - margin));
    let top = r.bottom + 6;
    if (top + ph > vh - margin) top = r.top - ph - 6;
    top = Math.max(margin, top);
    const m = metaOf(id);
    const existing = comments[id];
    setPopover({
      id,
      label: existing?.label || m?.label || "(unlabeled)",
      screen: existing?.screen || m?.screen || "",
      state: existing?.state || m?.state || "",
      text: existing?.text || "",
      x: window.scrollX + left,
      y: window.scrollY + top,
    });
  };

  const actions: WFActions = {
    mode: () => nav.mode,
    comment,
    goto: gotoScreen,
    openModal,
    pinOf,
  };

  const saveComment = (text: string) => {
    const p = popover();
    if (!p) return;
    const m = metaOf(p.id);
    upsert({ id: p.id, label: m?.label || p.label, screen: m?.screen || p.screen, state: m?.state || p.state, text });
    setPopover(null);
  };

  const onFeedback = () => {
    const block = buildFeedback(model.feature, comments, order());
    if (block) sendOrCopy(block, flash);
  };
  const onApprove = () => sendOrCopy(buildApproval(model, comments), flash);

  return (
    <div class="wf-app" onClick={() => setPopover(null)}>
      <header class="wf-header">
        <div class="wf-header-brand">
          <span class="wf-badge">Wireframe</span>
          <h1 class="wf-title">{model.feature}</h1>
        </div>
        <nav class="wf-screen-tabs" role="tablist">
          <For each={model.screens}>
            {(s) => (
              <button class="wf-tab" role="tab" aria-selected={String(nav.screenId === s.id)}
                onClick={() => gotoScreen(s.id)}>
                {s.name}
                <Show when={badgeCount(s.name) > 0}>
                  <span class="wf-tab-badge">{badgeCount(s.name)}</span>
                </Show>
              </button>
            )}
          </For>
        </nav>
        <div class="wf-header-end">
          <div class="wf-mode" role="group" aria-label="Interaction mode">
            <button classList={{ "wf-mode-on": nav.mode === "comment" }} onClick={() => setMode("comment")}>Comment</button>
            <button classList={{ "wf-mode-on": nav.mode === "click" }} onClick={() => setMode("click")}>Click-through</button>
          </div>
          <span class="wf-live" classList={{ connected: connected() }}>{connected() ? "Live" : "Agent"}</span>
        </div>
      </header>

      <div class="wf-body">
        <div class="wf-canvas-wrap">
          <Show when={activeScreen()}>
            {(sc) => (
              <div class="wf-panel">
                <Show when={sc().states.length > 1}>
                  <div class="wf-states" role="tablist">
                    <For each={sc().states}>
                      {(st) => (
                        <button class="wf-tab" role="tab"
                          aria-selected={String((activeState()?.id) === st.id)}
                          onClick={() => setState(sc().id, st.id)}>{st.name}</button>
                      )}
                    </For>
                  </div>
                </Show>
                <WFProvider value={actions}>
                  <For each={activeState()?.nodes}>{(n) => <Node node={n} />}</For>
                </WFProvider>
              </div>
            )}
          </Show>
        </div>

        <ReviewSidebar
          model={model} comments={comments} order={order}
          connected={connected} sent={sent}
          onFeedback={onFeedback} onApprove={onApprove} onDelete={remove}
        />
      </div>

      <Show when={activeModal()}>
        {(md) => (
          <div class="wf-modal-overlay" onClick={() => closeModal()}>
            <div class="wf-modal" onClick={(e) => e.stopPropagation()}>
              <div class="wf-modal-head">
                <span class="wf-modal-title">{md().name}</span>
                <button class="wf-modal-close" onClick={() => closeModal()}>×</button>
              </div>
              <div class="wf-modal-body">
                <WFProvider value={actions}>
                  <For each={md().nodes}>{(n) => <Node node={n} />}</For>
                </WFProvider>
              </div>
            </div>
          </div>
        )}
      </Show>

      <Show when={popover()}>
        {(p) => (
          <Popover state={p()} onClose={() => setPopover(null)} onSave={saveComment}
            onDelete={() => { remove(p().id); setPopover(null); }} />
        )}
      </Show>
    </div>
  );
}

render(() => <App />, document.getElementById("wf-root")!);
