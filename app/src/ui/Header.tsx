// App header: brand, screen tabs, mode toggle, dark-mode toggle, flow toggle.

import type { WFFlow, WFScreen } from "../types";
import type { Mode } from "../hooks/useNav";
import { ScreenTabs } from "./ScreenTabs";
import { ModeToggle } from "./ModeToggle";

function BrandMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 text-primary" aria-hidden>
      <line x1="7.5" y1="1" x2="7.5" y2="14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      <line x1="1" y1="7.5" x2="14" y2="7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      <line x1="2.8" y1="2.8" x2="12.2" y2="12.2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      <line x1="12.2" y1="2.8" x2="2.8" y2="12.2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  );
}

export function Header(props: {
  feature: string;
  screens: WFScreen[];
  screenId: string;
  badgeCount: (screenName: string) => number;
  onGoto: (id: string) => void;
  mode: Mode;
  onMode: (m: Mode) => void;
  theme: "light" | "dark";
  onTheme: () => void;
  flows?: WFFlow[];
  showFlow?: boolean;
  onToggleFlow?: () => void;
}) {
  return (
    <header className="z-10 flex h-11 shrink-0 items-stretch border-b border-border bg-card">
      {/* Brand */}
      <div className="flex shrink-0 items-center gap-2 border-r border-border px-4">
        <BrandMark />
        <h1 className="m-0 max-w-[180px] truncate text-[12.5px] font-semibold tracking-tight text-foreground">
          {props.feature}
        </h1>
      </div>

      {/* Screen tabs — fills remaining space */}
      <ScreenTabs
        screens={props.screens}
        screenId={props.screenId}
        badgeCount={props.badgeCount}
        onGoto={props.onGoto}
      />

      {/* Right controls */}
      <div className="flex shrink-0 items-center gap-1.5 border-l border-border px-3">
        {props.flows && props.flows.length > 0 && (
          <button
            onClick={props.onToggleFlow}
            className={
              "rounded-md border px-2.5 py-1 text-[11.5px] font-medium transition-colors " +
              (props.showFlow
                ? "border-primary/30 bg-accent text-accent-foreground"
                : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground")
            }
          >
            Flow
          </button>
        )}
        <ModeToggle mode={props.mode} onMode={props.onMode} />
      </div>
    </header>
  );
}
