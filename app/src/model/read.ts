// DOM adapter: read the inlined #wf-model JSON the harness HTML carries, parse
// it, and stamp stable ids. This is the only place the renderer touches the
// document for its input — dev/tests construct the model directly instead.

import type { WFModel } from "../types";
import { stampModel, type IdMeta } from "./stamp";

export function readModel(): { model: WFModel; meta: Map<string, IdMeta> } {
  const el = document.getElementById("wf-model");
  if (!el) throw new Error("wireframe: no #wf-model script found");
  const model = JSON.parse(el.textContent || "{}") as WFModel;
  const meta = stampModel(model);
  return { model, meta };
}
