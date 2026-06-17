// Feedback / approval block builders. The FEEDBACK format is byte-identical to
// the original template (mcp/server.js regex-parses the header + item count).
// APPROVAL adds an optional `flow=` column, additively — header/count unchanged.
//
// `metaOf` is injected (not imported from a global) so these stay pure functions
// of their inputs.

import type { Comment, WFModel, WFNode } from "../types";
import type { IdMeta } from "../model/stamp";

type MetaLookup = (id: string) => IdMeta | undefined;

interface Annotated {
  id: string;
  label: string;
  screen: string;
  state: string;
  backend?: string;
  ds?: string;
  flow?: string;
}

function flowOf(n: { goto?: string; opens?: string; action?: string }): string | undefined {
  if (n.goto) return "goto " + n.goto;
  if (n.opens) return "opens " + n.opens;
  if (n.action) return n.action;
  return undefined;
}

// Collect every annotated (backend/ds/flow) element in stable id order.
export function collectAnnotated(model: WFModel, metaOf: MetaLookup): Annotated[] {
  const out: Annotated[] = [];
  const visit = (n: WFNode & { _id?: string }) => {
    if (n.type === "nav") {
      for (const g of n.groups || []) {
        for (const it of (g.items || []) as Array<any>) {
          if (it.backend || it.ds || it.goto || it.opens) {
            const m = metaOf(it._id);
            out.push({
              id: it._id, label: m?.label ?? it.text, screen: m?.screen ?? "", state: m?.state ?? "",
              backend: it.backend, ds: it.ds, flow: flowOf(it),
            });
          }
        }
      }
    } else if (n._id && (n.backend || n.ds || n.goto || n.opens || n.action)) {
      const m = metaOf(n._id);
      out.push({
        id: n._id, label: m?.label ?? n.label ?? "", screen: m?.screen ?? "", state: m?.state ?? "",
        backend: n.backend, ds: n.ds, flow: flowOf(n),
      });
    }
    for (const c of n.children || []) visit(c);
  };
  for (const sc of model.screens) for (const st of sc.states) for (const n of st.nodes) visit(n);
  for (const md of model.modals || []) for (const n of md.nodes) visit(n);
  return out;
}

export function buildFeedback(feature: string, comments: Record<string, Comment>, order: string[]): string | null {
  const ids = order.filter((id) => comments[id]);
  if (!ids.length) return null;
  const lines = [
    "===== WIREFRAME FEEDBACK: " + feature + " =====",
    "Apply ONLY these changes. Do not modify any element not listed below.",
    "Match each item by its id (the label is for human reference). Each item is",
    "scoped to one screen and state — edit it only there.",
    "",
  ];
  ids.forEach((id) => {
    const c = comments[id];
    lines.push('[#' + c.id + '] label="' + c.label + '" | screen="' + c.screen + '" | state="' + (c.state || "default") + '"');
    lines.push("  → " + c.text);
    lines.push("");
  });
  lines.push("===== END FEEDBACK (" + ids.length + " item" + (ids.length === 1 ? "" : "s") + ") =====");
  return lines.join("\n");
}

export function buildApproval(model: WFModel, comments: Record<string, Comment>, metaOf: MetaLookup): string {
  const screens = model.screens.map((s) => s.name);
  const boxes = collectAnnotated(model, metaOf);
  const openCount = Object.keys(comments).length;
  const lines = [
    "===== WIREFRAME APPROVED: " + model.feature + " =====",
    "This LOW-FIDELITY wireframe is approved as the agreed understanding of the",
    "feature's UI/UX — which screens exist and how each changed piece maps to the",
    "backend and the design system. NOT an implementation or visual spec.",
    "Next: turn the mapping below into an implementation PLAN, then wait for greenlight.",
    "Also persist this as the approved feature-spec.",
    "",
    "Screens: " + (screens.join(", ") || "(none)"),
    "",
    "Mapping (id | label | screen | state | backend | design-system | flow):",
  ];
  boxes.forEach((b) => {
    let line =
      '[#' + b.id + '] label="' + b.label + '"' +
      ' | screen="' + b.screen + '"' +
      ' | state="' + (b.state || "default") + '"' +
      ' | API="' + (b.backend || "—") + '"' +
      ' | COMPONENT="' + (b.ds || "—") + '"';
    if (b.flow) line += ' | FLOW="' + b.flow + '"';
    lines.push(line);
  });
  lines.push("");
  lines.push(openCount
    ? "⚠ " + openCount + " comment" + (openCount === 1 ? "" : "s") + " still open — resolve or confirm before building."
    : "No open comments.");
  lines.push("===== END APPROVAL (" + boxes.length + " mapped box" + (boxes.length === 1 ? "" : "es") + ", " + openCount + " open comment" + (openCount === 1 ? "" : "s") + ") =====");
  return lines.join("\n");
}
