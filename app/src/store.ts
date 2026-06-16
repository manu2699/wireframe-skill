// Reactive app state: parsed model with stable ids, navigation (screen/state/modal),
// review comments (localStorage-backed), and interaction mode.

import { createStore } from "solid-js/store";
import { createSignal } from "solid-js";
import type { Comment, WFModel, WFNode } from "./types";

// ── Stable id stamping ───────────────────────────────────────────────────────
// Walk the whole model once (screens → states → nodes depth-first, then modals)
// and stamp a stable `_id` ("wf-N") on every commentable element. Stable across
// reloads as long as the model structure is unchanged — mirrors the old DOM-order
// stamping, but order-independent of which screen is currently visible.

export interface IdMeta {
  id: string;
  label: string;
  screen: string;
  state: string;
}

const meta = new Map<string, IdMeta>(); // wf-id → context for block building

function labelOfNode(n: WFNode): string {
  let raw = n.label;
  if (!raw && n.type === "table" && n.headers?.length) raw = "Table: " + n.headers.join(" / ");
  const t = (raw || n.html || n.type || "").toString().trim().replace(/\s+/g, " ");
  return t.length > 60 ? t.slice(0, 57) + "…" : t || "(unlabeled)";
}

let counter = 0;
function stampNode(n: WFNode & { _id?: string }, screen: string, state: string) {
  // Containers (row/col/grid) carry no id; everything else is commentable.
  const isContainer = n.type === "row" || n.type === "col" || n.type === "grid";
  if (!isContainer) {
    n._id = "wf-" + ++counter;
    meta.set(n._id, { id: n._id, label: labelOfNode(n), screen, state });
  }
  // Nav items each get their own id.
  if (n.type === "nav" && n.groups) {
    for (const g of n.groups) {
      for (const it of g.items as Array<{ _id?: string; text: string }>) {
        it._id = "wf-" + ++counter;
        meta.set(it._id, { id: it._id, label: (it.text || "(nav item)").trim(), screen, state });
      }
    }
  }
  if (n.children) for (const c of n.children) stampNode(c, screen, state);
}

export function stampModel(model: WFModel) {
  counter = 0;
  meta.clear();
  for (const sc of model.screens) {
    for (const st of sc.states) {
      for (const n of st.nodes) stampNode(n, sc.name, st.name);
    }
  }
  for (const md of model.modals || []) {
    for (const n of md.nodes) stampNode(n, md.name, "modal");
  }
}

export function metaOf(id: string): IdMeta | undefined {
  return meta.get(id);
}

// ── Model + navigation ───────────────────────────────────────────────────────
export function readModel(): WFModel {
  const el = document.getElementById("wf-model");
  if (!el) throw new Error("wireframe: no #wf-model script found");
  const model = JSON.parse(el.textContent || "{}") as WFModel;
  stampModel(model);
  return model;
}

export type Mode = "comment" | "click";

interface Nav {
  screenId: string;
  stateByScreen: Record<string, string>; // screenId → active stateId
  modalId: string | null;
  mode: Mode;
}

export function createNav(model: WFModel) {
  const firstScreen = model.screens[0];
  const initState: Record<string, string> = {};
  for (const s of model.screens) initState[s.id] = s.states[0]?.id;

  const [nav, setNav] = createStore<Nav>({
    screenId: firstScreen?.id,
    stateByScreen: initState,
    modalId: null,
    mode: "comment",
  });

  const gotoScreen = (id: string) => {
    if (model.screens.some((s) => s.id === id)) setNav("screenId", id);
  };
  const setState = (screenId: string, stateId: string) =>
    setNav("stateByScreen", screenId, stateId);
  const openModal = (id: string) => setNav("modalId", id);
  const closeModal = () => setNav("modalId", null);
  const setMode = (m: Mode) => setNav("mode", m);

  return { nav, gotoScreen, setState, openModal, closeModal, setMode };
}

// ── Comments (localStorage) ──────────────────────────────────────────────────
const STORAGE_KEY = "wfc:" + location.pathname;

export function createComments() {
  let initial: Record<string, Comment> = {};
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) initial = JSON.parse(s);
  } catch (e) {}

  const [comments, setComments] = createStore<Record<string, Comment>>(initial);
  const [order, setOrder] = createSignal<string[]>(Object.keys(initial));

  const persist = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    } catch (e) {}
  };

  const upsert = (c: Comment) => {
    const isNew = !comments[c.id];
    setComments(c.id, c);
    if (isNew) setOrder([...order(), c.id]);
    persist();
  };

  const remove = (id: string) => {
    setComments(id, undefined as unknown as Comment);
    setOrder(order().filter((x) => x !== id));
    persist();
  };

  return { comments, order, upsert, remove };
}
