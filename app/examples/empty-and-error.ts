// State-coverage example: one screen with default / empty / loading / error
// states so the renderer's state-tab switching and placeholder mods are easy to
// eyeball.

import type { WFModel } from "../src/types";

const model: WFModel = {
  feature: "Orders List — States",
  change: "List view across loading / empty / error",
  designSource: "guess: generic primitives",
  screens: [
    {
      id: "s_orders", name: "Orders",
      states: [
        { id: "default", name: "Default", nodes: [
          { type: "col", children: [
            { type: "row", children: [
              { type: "box", kind: "button", label: "New order", action: "create" },
              { type: "box", kind: "form", label: "Search / filter", ds: "guess: SearchBar" },
            ]},
            { type: "table", headers: ["Order", "Customer", "Total", "Status"],
              rows: [["—", "—", "—", "—"], ["—", "—", "—", "—"], ["—", "—", "—", "—"]],
              backend: "GET /orders", ds: "guess: DataGrid" },
          ]},
        ]},
        { id: "loading", name: "Loading", nodes: [
          { type: "col", children: [
            { type: "box", kind: "list", mods: ["placeholder", "tall"], label: "Loading orders…" },
          ]},
        ]},
        { id: "empty", name: "Empty", nodes: [
          { type: "box", mods: ["taller", "placeholder"], label: "No orders yet — create your first" },
        ]},
        { id: "error", name: "Error", nodes: [
          { type: "col", children: [
            { type: "box", mods: ["shaded", "tall"], label: "Couldn’t load orders", backend: "GET /orders (500)" },
            { type: "box", kind: "button", label: "Retry", action: "retry" },
          ]},
        ]},
      ],
    },
  ],
};

export default model;
