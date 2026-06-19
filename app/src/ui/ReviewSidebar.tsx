// Review sidebar: a top header with the collapse control, a de-emphasized feature
// summary, the annotation key, a scrollable comment list, a shortcuts cheat sheet
// that fills otherwise-empty space, and a sticky footer with the send/approve
// actions (always visible at any viewport height). Collapse state is owned by the
// parent so a keyboard shortcut can toggle it too.

import type { ReactNode } from "react";
import { Check, Component, Keyboard, MessageSquare, PanelRightClose, PanelRightOpen, Server, Sparkle, X } from "../components/ui/icons";
import type { Comment, WFModel } from "../types";
import { Button } from "../components/ui/button";
import { SHORTCUTS } from "../hooks/useShortcuts";

export function ReviewSidebar(props: {
  model: WFModel;
  comments: Record<string, Comment>;
  order: string[];
  connected: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onFeedback: () => void;
  onApprove: () => void;
  onDelete: (id: string) => void;
}) {
  const ids = props.order.filter((id) => props.comments[id]);

  if (props.collapsed) {
    return (
      <aside className="flex w-10 shrink-0 flex-col items-center gap-4 border-l border-border bg-card py-3">
        <Button variant="ghost" size="icon" onClick={props.onToggleCollapse} aria-label="Expand review panel" title="Expand panel  (\)" className="h-7 w-7">
          <PanelRightOpen className="h-3.5 w-3.5" />
        </Button>
        <div className="relative text-muted-foreground">
          <MessageSquare className="h-3.5 w-3.5" />
          {ids.length > 0 && (
            <span className="absolute -right-2 -top-2 inline-flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-wfc-accent px-0.5 text-[8.5px] font-bold text-white">
              {ids.length}
            </span>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-[272px] shrink-0 flex-col overflow-hidden border-l border-border bg-card">
      {/* Header: title + collapse control, anchored at the top */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
        <span className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">Review</span>
        <Button variant="ghost" size="icon" onClick={props.onToggleCollapse} aria-label="Collapse review panel" title="Collapse panel  (\)" className="h-7 w-7">
          <PanelRightClose className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* De-emphasized feature summary */}
      <div className="shrink-0 border-b border-border px-4 py-3">
        {props.model.change && <MetaRow label="Change" value={props.model.change} />}
        <MetaRow label="Screens" value={props.model.screens.map((s) => s.name).join(", ")} />
        {props.model.designSource && <MetaRow label="Design" value={props.model.designSource} />}
        <div className="mt-2.5 flex flex-wrap gap-2.5 border-t border-border pt-2.5">
          <KeyItem color="var(--wf-tag-be, #1d4ed8)" icon={<Server className="h-3 w-3" />} label="endpoint" />
          <KeyItem color="var(--wf-tag-ds, #047857)" icon={<Component className="h-3 w-3" />} label="design system" />
          <KeyItem color="var(--wf-tag-guess)" icon={<Sparkle className="h-3 w-3" />} label="guessed" />
        </div>
      </div>

      {/* Comments header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-[12px] font-semibold text-foreground">Comments</span>
        {ids.length > 0 && (
          <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-wfc-accent px-1.5 text-[10.5px] font-bold text-white">
            {ids.length}
          </span>
        )}
      </div>

      {/* Scrollable comment list */}
      <div className="min-h-0 flex-1 overflow-auto">
        {ids.length === 0 ? (
          <p className="m-0 p-4 text-[11.5px] leading-relaxed text-muted-foreground">
            Click any box to add a comment. Switch to <strong>Prototype</strong> mode (top right)
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
                      className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
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

      {/* Shortcuts cheat sheet — fills the lower dead space */}
      <div className="shrink-0 border-t border-border px-4 py-3">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Keyboard className="h-3.5 w-3.5" /> Shortcuts
        </div>
        <ul className="m-0 grid list-none grid-cols-2 gap-x-3 gap-y-1.5 p-0">
          {SHORTCUTS.map((s) => (
            <li key={s.keys} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] text-foreground">
                {s.keys}
              </kbd>
              <span className="truncate">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sticky, non-shrinking footer */}
      <div className="flex shrink-0 flex-col gap-2 border-t border-border px-4 py-3">
        <div className="flex items-center justify-end min-h-[14px]">
          <span className={`inline-flex items-center gap-1 text-[10px] ${props.connected ? "text-emerald-600" : "text-amber-500"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${props.connected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
            {props.connected ? "Live" : "Disconnected"}
          </span>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={props.onFeedback} title={props.connected ? undefined : "Agent not connected — block will be copied to clipboard"}>
            Send feedback
          </Button>
          <Button variant="approve" className="flex-1" onClick={props.onApprove} title={props.connected ? undefined : "Agent not connected — block will be copied to clipboard"}>
            <Check className="h-3.5 w-3.5" /> Approve
          </Button>
        </div>
      </div>
    </aside>
  );
}

function MetaRow(props: { label: string; value: string }) {
  return (
    <div className="my-0.5 flex gap-1.5 text-[11.5px] leading-normal text-muted-foreground">
      <span className="shrink-0 font-medium">{props.label}</span>
      <span className="truncate text-foreground/80">{props.value}</span>
    </div>
  );
}

function KeyItem(props: { color: string; icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
      <span className="inline-flex shrink-0 items-center" style={{ color: props.color }}>{props.icon}</span>
      {props.label}
    </span>
  );
}
