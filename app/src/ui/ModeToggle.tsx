// Comment vs prototype interaction-mode switch — flat nav-link style.

import type { Mode } from "../hooks/useNav";
import { cn } from "../lib/utils";

const MODES: { value: Mode; label: string }[] = [
  { value: "comment", label: "Comment" },
  { value: "prototype", label: "Prototype" },
];

export function ModeToggle(props: { mode: Mode; onMode: (m: Mode) => void }) {
  return (
    <div
      className="flex items-center rounded-md border border-input bg-background p-0.5"
      role="group"
      aria-label="Interaction mode"
    >
      {MODES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => props.onMode(value)}
          aria-pressed={props.mode === value}
          className={cn(
            "rounded px-2.5 py-0.5 text-[12px] font-medium transition-colors cursor-pointer",
            props.mode === value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
