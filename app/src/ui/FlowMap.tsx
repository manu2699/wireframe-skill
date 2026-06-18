// FlowMap: compact strip rendering the model's top-level flows[] array.
// Shows screen-to-screen transitions as clickable nodes so reviewers can
// grasp the feature navigation without clicking through all screens.

import type { WFFlow } from "../types";

export function FlowMap(props: { flows: WFFlow[]; onGoto?: (id: string) => void }) {
  return (
    <div className="wf-flowmap">
      <span className="wf-flowmap-label">Flow</span>
      <div className="wf-flowmap-rows">
        {props.flows.map((f, i) => (
          <div key={i} className="wf-flowmap-row">
            <button className="wf-flowmap-node" onClick={() => props.onGoto?.(f.from)}>
              {f.from}
            </button>
            <span className="wf-flowmap-arrow">→</span>
            <button className="wf-flowmap-node" onClick={() => props.onGoto?.(f.to)}>
              {f.to}
            </button>
            <span className="wf-flowmap-via">via {f.via}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
