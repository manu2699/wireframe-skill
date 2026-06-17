// Flow affordance: a small marker showing an element navigates (→), opens a
// modal (⊕), or performs an action (↵).

export function FlowTag(props: { goto?: string; opens?: string; action?: string }) {
  const label =
    props.goto ? "→ " + props.goto :
    props.opens ? "⊕ " + props.opens :
    props.action ? props.action : "";
  if (!label) return null;
  return (
    <span className="wf-flow" title={label}>
      {props.goto ? "→" : props.opens ? "⊕" : "↵"}
    </span>
  );
}
