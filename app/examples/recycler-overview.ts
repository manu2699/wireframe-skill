// Dashboard example: KPIs, charts, a data table, a form flow, and a modal.
// This is the model previously inlined in assets/template.html, extracted here
// so it can be loaded standalone in the dev server.

import type { WFModel } from "../src/types";

const model: WFModel = {
  feature: "Recycler Overview",
  change: "EPR recovery dashboard + certificate inventory",
  designSource: "guess: generic primitives",
  screens: [
    {
      id: "s_overview", name: "Overview",
      states: [
        { id: "default", name: "Default", nodes: [
          { type: "row", children: [
            { type: "nav", side: "left", groups: [
              { label: "Workflow", items: [
                { text: "Overview", active: true, goto: "s_overview" },
                { text: "Battery Intake", goto: "s_intake" },
                { text: "Inbox", badge: 4 },
              ]},
              { label: "Compliance", items: [
                { text: "EPR Certificates", goto: "s_certs" },
                { text: "CPCB Filing" },
              ]},
            ]},
            { type: "col", children: [
              { type: "grid", cols: 4, children: [
                { type: "box", kind: "kpi", label: "Processed (qtr)", backend: "GET /recovery/summary" },
                { type: "box", kind: "kpi", label: "Certificates available", backend: "GET /certificates?status=available" },
                { type: "box", kind: "kpi", label: "Avg recovery rate" },
                { type: "box", kind: "kpi", label: "Active EC alerts", goto: "s_alerts" },
              ]},
              { type: "row", children: [
                { type: "col", children: [
                  { type: "box", kind: "chart:bars", mods: ["tall"], label: "Recovery vs mandate", backend: "GET /recovery/by-type", ds: "guess: BarChart" },
                ]},
                { type: "col", children: [
                  { type: "box", kind: "chart:donut", mods: ["tall"], label: "Certificate inventory", backend: "GET /certificates/inventory", ds: "guess: DonutChart" },
                ]},
              ]},
              { type: "row", children: [
                { type: "col", children: [
                  { type: "box", kind: "chart:line", label: "Processed quantity trend" },
                ]},
                { type: "col", children: [
                  { type: "box", kind: "card", label: "Mode A · Collection shortfall", goto: "s_alerts" },
                ]},
              ]},
            ]},
          ]},
        ]},
      ],
    },
    {
      id: "s_intake", name: "Battery Intake",
      states: [
        { id: "default", name: "Default", nodes: [
          { type: "box", kind: "form", label: "New intake form", backend: "POST /intake", ds: "guess: Form" },
          { type: "box", kind: "button", label: "Submit intake", action: "submit", backend: "POST /intake" },
        ]},
        { id: "empty", name: "Empty", nodes: [
          { type: "box", mods: ["taller", "placeholder"], label: "No intakes yet" },
        ]},
      ],
    },
    {
      id: "s_certs", name: "EPR Certificates",
      states: [
        { id: "default", name: "Default", nodes: [
          { type: "box", kind: "button", label: "Issue certificate", opens: "m_issue" },
          { type: "table", headers: ["Certificate", "Type", "Qty (kg)", "Status"],
            rows: [["—", "—", "—", "—"], ["—", "—", "—", "—"]],
            backend: "GET /certificates", ds: "guess: DataGrid" },
        ]},
      ],
    },
    {
      id: "s_alerts", name: "Alerts",
      states: [
        { id: "default", name: "Default", nodes: [
          { type: "box", kind: "list", mods: ["tall"], label: "EC early-warning alerts", backend: "GET /alerts" },
        ]},
      ],
    },
  ],
  modals: [
    { id: "m_issue", name: "Issue certificate", nodes: [
      { type: "box", kind: "form", label: "Issue form", backend: "POST /certificates", ds: "guess: Form" },
      { type: "box", kind: "button", label: "Confirm issue", action: "submit", backend: "POST /certificates" },
    ]},
  ],
};

export default model;
