// Multi-step form example: a wizard across screens with a validation/error
// state and a confirmation modal — exercises flow (goto/opens/action) and
// per-screen states.

import type { WFModel } from "../src/types";

const model: WFModel = {
  feature: "Onboarding Wizard",
  change: "3-step account setup with validation",
  designSource: "guess: generic primitives",
  screens: [
    {
      id: "s_step1", name: "Step 1 · Profile",
      states: [
        { id: "default", name: "Default", nodes: [
          { type: "col", children: [
            { type: "box", kind: "tabs", label: "Profile · Plan · Review" },
            { type: "box", kind: "form", label: "Name, email, role", backend: "GET /onboarding/profile", ds: "guess: Form" },
            { type: "row", children: [
              { type: "box", kind: "button", label: "Next: Plan", goto: "s_step2", action: "next" },
            ]},
          ]},
        ]},
        { id: "error", name: "Validation error", nodes: [
          { type: "col", children: [
            { type: "box", kind: "tabs", label: "Profile · Plan · Review" },
            { type: "box", kind: "form", mods: ["shaded"], label: "Email is required", ds: "guess: Form (error)" },
            { type: "box", kind: "button", label: "Next: Plan", action: "next" },
          ]},
        ]},
      ],
    },
    {
      id: "s_step2", name: "Step 2 · Plan",
      states: [
        { id: "default", name: "Default", nodes: [
          { type: "col", children: [
            { type: "box", kind: "tabs", label: "Profile · Plan · Review" },
            { type: "grid", cols: 3, children: [
              { type: "box", kind: "card", label: "Starter" },
              { type: "box", kind: "card", mods: ["solid"], label: "Pro (selected)" },
              { type: "box", kind: "card", label: "Enterprise" },
            ]},
            { type: "row", children: [
              { type: "box", kind: "button", label: "Back", goto: "s_step1", action: "back" },
              { type: "box", kind: "button", label: "Next: Review", goto: "s_step3", action: "next" },
            ]},
          ]},
        ]},
      ],
    },
    {
      id: "s_step3", name: "Step 3 · Review",
      states: [
        { id: "default", name: "Default", nodes: [
          { type: "col", children: [
            { type: "box", kind: "tabs", label: "Profile · Plan · Review" },
            { type: "box", kind: "list", label: "Summary of entered details", backend: "GET /onboarding/summary" },
            { type: "box", kind: "button", label: "Confirm & finish", opens: "m_done", action: "submit", backend: "POST /onboarding/complete" },
          ]},
        ]},
      ],
    },
  ],
  modals: [
    { id: "m_done", name: "All set", nodes: [
      { type: "box", kind: "stat", label: "Account created 🎉" },
      { type: "box", kind: "button", label: "Go to dashboard", action: "done" },
    ]},
  ],
};

export default model;
