// Presentational canvas: the active screen panel, its state tabs (when a screen
// has more than one state), and the rendered node tree.

import type { WFScreen, WFState } from "../types";
import { Node, WFProvider, type WFActions } from "../render/Node";
import { cn } from "../lib/utils";

export function Canvas(props: {
  screen?: WFScreen;
  state?: WFState;
  onSetState: (screenId: string, stateId: string) => void;
  actions: WFActions;
}) {
  const sc = props.screen;
  if (!sc) return <div className="min-w-0 flex-1 overflow-hidden" />;
  return (
    <div className="wf-canvas-shell flex min-w-0 flex-1 flex-col overflow-hidden">
      {sc.states.length > 1 && (
        <div className="flex flex-shrink-0 flex-wrap gap-1.5 border-b border-border px-7 py-4" role="tablist">
          {sc.states.map((st) => {
            const active = props.state?.id === st.id;
            return (
              <button
                key={st.id}
                role="tab"
                aria-selected={active}
                onClick={() => props.onSetState(sc.id, st.id)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11.5px] transition-colors",
                  active
                    ? "border-foreground bg-foreground font-medium text-background"
                    : "border-input bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground",
                )}
              >
                {st.name}
              </button>
            );
          })}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-auto p-7">
        <WFProvider value={props.actions}>
          {props.state?.nodes.map((n, i) => <Node key={i} node={n} />)}
        </WFProvider>
      </div>
    </div>
  );
}

