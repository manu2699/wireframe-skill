// Review orchestration: the comment popover lifecycle (open / save / delete) and
// the feedback / approval send actions. Kept out of the App component so the
// container stays thin and this logic is testable on its own.
//
// Popover placement is delegated to Radix (collision-aware): we only record the
// clicked element's viewport rect so an invisible anchor can sit over it.

import { useCallback, useRef, useState } from "react";
import type { Comment, WFModel } from "../types";
import type { IdMeta } from "../model/stamp";
import type { Transport } from "../ports/transport";
import { buildApproval, buildFeedback } from "../lib/blocks";

export interface AnchorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PopoverState {
  id: string;
  label: string;
  screen: string;
  state: string;
  text: string;
  rect: AnchorRect;
}

interface ReviewDeps {
  model: WFModel;
  metaOf: (id: string) => IdMeta | undefined;
  comments: Record<string, Comment>;
  order: string[];
  upsert: (c: Comment) => void;
  remove: (id: string) => void;
  transport: Transport;
}

export function useReview(deps: ReviewDeps) {
  const { model, metaOf, comments, order, upsert, remove, transport } = deps;

  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [sent, setSent] = useState("");
  const flashTimer = useRef<ReturnType<typeof setTimeout>>();

  const flash = useCallback((msg: string) => {
    setSent(msg);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setSent(""), 2200);
  }, []);

  // Open the comment popover anchored to the clicked element.
  const openComment = useCallback((id: string, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const m = metaOf(id);
    const existing = comments[id];
    setPopover({
      id,
      label: existing?.label || m?.label || "(unlabeled)",
      screen: existing?.screen || m?.screen || "",
      state: existing?.state || m?.state || "",
      text: existing?.text || "",
      rect: { left: r.left, top: r.top, width: r.width, height: r.height },
    });
  }, [comments, metaOf]);

  const closeComment = useCallback(() => setPopover(null), []);

  const saveComment = useCallback((text: string) => {
    setPopover((p) => {
      if (!p) return null;
      const m = metaOf(p.id);
      upsert({
        id: p.id,
        label: m?.label || p.label,
        screen: m?.screen || p.screen,
        state: m?.state || p.state,
        text,
      });
      return null;
    });
  }, [metaOf, upsert]);

  const deleteComment = useCallback((id: string) => {
    remove(id);
    setPopover(null);
  }, [remove]);

  const onFeedback = useCallback(() => {
    const block = buildFeedback(model.feature, comments, order);
    if (block) transport.send(block, flash);
  }, [model, comments, order, transport, flash]);

  const onApprove = useCallback(
    () => transport.send(buildApproval(model, comments, metaOf), flash),
    [model, comments, metaOf, transport, flash],
  );

  return { popover, sent, openComment, closeComment, saveComment, deleteComment, onFeedback, onApprove };
}
