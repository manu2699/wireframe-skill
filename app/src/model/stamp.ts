// Stable id stamping. Walk the whole model once (screens → states → nodes
// depth-first, then modals) and stamp a stable `_id` ("wf-N") on every
// commentable element. Ids are stable across reloads as long as the model
// structure is unchanged.
//
// Returns a fresh meta map per call (no module-global state) so two models can
// be stamped/rendered independently — e.g. the dev example switcher.

import type { WFModel, WFNode } from "../types";

export interface IdMeta {
  id: string;
  label: string;
  screen: string;
  state: string;
}

export type StampedNode = WFNode & { _id?: string };

export function labelOfNode(n: WFNode): string {
  let raw = n.label;
  if (!raw && n.type === "table" && n.headers?.length) raw = "Table: " + n.headers.join(" / ");
  const t = (raw || n.html || n.type || "").toString().trim().replace(/\s+/g, " ");
  return t.length > 60 ? t.slice(0, 57) + "…" : t || "(unlabeled)";
}

export function stampModel(model: WFModel): Map<string, IdMeta> {
  const meta = new Map<string, IdMeta>();
  let counter = 0;

  const stampNode = (n: StampedNode, screen: string, state: string) => {
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
  };

  for (const sc of model.screens) {
    for (const st of sc.states ?? []) {
      for (const n of st.nodes) stampNode(n, sc.name, st.name);
    }
  }
  for (const md of model.modals || []) {
    for (const n of md.nodes) stampNode(n, md.name, "modal");
  }
  return meta;
}
