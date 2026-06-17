// Review sidebar: feature meta + annotation key, a scrollable comment list, and
// a sticky, non-shrinking footer with the send/approve actions (always visible at
// any viewport height). Collapsible to a thin rail; collapsed state persisted.

import { useCallback, useEffect, useState } from "react";
import { Check, MessageSquare, PanelRightClose, PanelRightOpen, X } from "../components/ui/icons";
import type { Comment, WFModel } from "../types";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

const COLLAPSE_KEY = "wfc:review-collapsed";

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

export function ReviewSidebar(props: {
  model: WFModel;
  comments: Record<string, Comment>;
  order: string[];
  connected: boolean;
  sent: string;
  onFeedback: () => void;
  onApprove: () => void;
  onDelete: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);
  const toggle = useCallback(() => setCollapsed((c) => !c), []);

  const ids = props.order.filter((id) => props.comments[id]);

  if (collapsed) {
    return (
      <aside className="flex w-11 flex-shrink-0 flex-col items-center gap-3 border-l border-border bg-card py-3">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Expand review panel" title="Expand">
          <PanelRightOpen className="h-4 w-4" />
        </Button>
        <div className="relative text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          {ids.length > 0 && (
            <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-wfc-accent px-1 text-[9px] font-bold text-white">
              {ids.length}
            </span>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-[284px] flex-shrink-0 flex-col overflow-hidden border-l border-border bg-card">
      {/* Meta */}
      <div className="flex-shrink-0 border-b border-border px-4 py-3.5">
        {props.model.change && <MetaRow label="Change" value={props.model.change} />}
        <MetaRow label="Screens" value={props.model.screens.map((s) => s.name).join(", ")} />
        {props.model.designSource && <MetaRow label="Design" value={props.model.designSource} />}
        <div className="mt-2.5 flex flex-wrap gap-2.5 border-t border-border pt-2.5">
          <KeyItem color="var(--wf-tag-be, #1d4ed8)" label="backend" />
          <KeyItem color="var(--wf-tag-ds, #047857)" label="design system" />
          <KeyItem color="var(--wf-tag-guess)" label="guessed" />
        </div>
      </div>

      {/* Comments header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-[12px] font-semibold text-foreground">Comments</span>
        <div className="flex items-center gap-1.5">
          {ids.length > 0 && (
            <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-wfc-accent px-1.5 text-[10.5px] font-bold text-white">
              {ids.length}
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Collapse review panel" title="Collapse">
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable comment list */}
      <div className="min-h-0 flex-1 overflow-auto">
        {ids.length === 0 ? (
          <p className="m-0 p-4 text-[11.5px] leading-relaxed text-muted-foreground">
            Click any box to add a comment. Switch to <strong>Click-through</strong> mode (top right)
            to walk the flow.
          </p>
        ) : (
          <ol className="m-0 list-none p-0">
            {ids.map((id, i) => {
              const c = props.comments[id];
              return (
                <li key={id} className="border-b border-border px-4 py-2.5">
                  <div className="flex items-start gap-1.5">
                    <span className="flex-1 text-[12px] leading-snug text-foreground">
                      <strong>{i + 1}.</strong> {c.label}{" "}
                      <em className="text-[11px] not-italic text-muted-foreground">
                        {c.screen}{c.state ? " / " + c.state : ""}
                      </em>
                    </span>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => props.onDelete(id)}
                      className="flex-shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-1 break-words text-[11.5px] leading-snug text-muted-foreground">
                    {c.text}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Sticky, non-shrinking footer */}
      <div className="flex flex-shrink-0 flex-col gap-2 border-t border-border px-4 py-3">
        <div className="flex gap-2">
          <Button className="flex-1" onClick={props.onFeedback}>
            {props.connected ? "Send to agent" : "Copy feedback"}
          </Button>
          <Button variant="approve" className="flex-1" onClick={props.onApprove}>
            <Check className="h-3.5 w-3.5" /> Approve
          </Button>
        </div>
        <div
          className="min-h-[14px] text-center text-[11px] font-medium text-wfc-approve transition-opacity"
          style={{ opacity: props.sent ? 1 : 0 }}
        >
          {props.sent}
        </div>
      </div>
    </aside>
  );
}

function MetaRow(props: { label: string; value: string }) {
  return (
    <div className="my-0.5 flex gap-1.5 text-[11.5px] leading-normal text-muted-foreground">
      <span className="flex-shrink-0 font-medium">{props.label}</span>
      <span className="truncate text-foreground/80">{props.value}</span>
    </div>
  );
}

function KeyItem(props: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <span className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: props.color }} />
      {props.label}
    </span>
  );
}
