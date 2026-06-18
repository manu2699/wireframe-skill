// Anchored comment popover → Radix Popover (collision-aware: auto side-flip +
// shift), so it stays on screen for boxes on the top, bottom, left, and right
// edges. An invisible anchor is positioned over the clicked box's viewport rect.

import { useMemo, useState } from "react";
import type { PopoverState } from "../hooks/useReview";
import { Popover, PopoverAnchor, PopoverContent } from "../components/ui/popover";
import { Button } from "../components/ui/button";

export function CommentPopover(props: {
  state: PopoverState;
  onSave: (text: string) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(props.state.text);
  const existing = !!props.state.text;
  const { rect } = props.state;

  // Anchor Radix to the clicked box's viewport rect via a virtual element, so it
  // collision-flips/shifts correctly without us injecting a positioned DOM node.
  const virtualRef = useMemo(
    () => ({
      current: {
        getBoundingClientRect: () =>
          ({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            right: rect.left + rect.width,
            bottom: rect.top + rect.height,
            toJSON() {},
          }) as DOMRect,
      },
    }),
    [rect.left, rect.top, rect.width, rect.height],
  );

  return (
    <Popover open onOpenChange={(o) => !o && props.onClose()}>
      <PopoverAnchor virtualRef={virtualRef} />
      <PopoverContent side="bottom" align="start" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 border-b border-border pb-2 text-[11px] text-muted-foreground">
          {props.state.label} <em className="not-italic">— {props.state.screen}</em>
        </div>
        <textarea
          autoFocus
          rows={3}
          placeholder="What should change here?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full resize-y rounded-md border border-input bg-card px-2 py-1.5 text-[12.5px] leading-snug text-foreground outline-none focus:border-ring"
        />
        <div className="mt-2.5 flex items-center justify-end gap-2">
          {existing && (
            <Button variant="destructive" size="sm" className="mr-auto" onClick={props.onDelete}>
              Delete
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={props.onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              const t = text.trim();
              if (!t) return props.onClose();
              props.onSave(t);
            }}
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
