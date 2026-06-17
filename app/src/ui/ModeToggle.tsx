// Comment vs click-through interaction-mode switch — branded segmented control.

import type { Mode } from "../hooks/useNav";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";

export function ModeToggle(props: { mode: Mode; onMode: (m: Mode) => void }) {
  return (
    <ToggleGroup
      type="single"
      value={props.mode}
      onValueChange={(v) => v && props.onMode(v as Mode)}
      aria-label="Interaction mode"
    >
      <ToggleGroupItem value="comment">Comment</ToggleGroupItem>
      <ToggleGroupItem value="click">Click-through</ToggleGroupItem>
    </ToggleGroup>
  );
}
