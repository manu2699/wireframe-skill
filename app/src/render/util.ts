// Shared render helpers.

import type { WFNode } from "../types";

export function modClasses(n: WFNode): string {
  return (n.mods || []).map((m) => "wf-" + m).join(" ");
}
