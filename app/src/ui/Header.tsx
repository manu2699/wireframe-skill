// App header: brand, screen tabs, mode toggle, dark-mode toggle.

import type { WFScreen } from "../types";
import type { Mode } from "../hooks/useNav";
import { ScreenTabs } from "./ScreenTabs";
import { ModeToggle } from "./ModeToggle";
// import { ThemeToggle } from "./ThemeToggle";

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
}) {
  return (
    <header className="z-10 flex h-12 shrink-0 items-stretch border-b border-border bg-card">
      <div className="flex shrink-0 items-center gap-2.5 border-r border-border px-5">
        <span className="shrink-0 rounded border border-input bg-muted px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
          Wireframe
        </span>
        <h1 className="m-0 max-w-[200px] truncate text-[13.5px] font-semibold text-foreground">
          {props.feature}
        </h1>
      </div>
      <ScreenTabs
        screens={props.screens}
        screenId={props.screenId}
        badgeCount={props.badgeCount}
        onGoto={props.onGoto}
      />
      <div className="flex shrink-0 items-center gap-2 border-l border-border px-3">
        <ModeToggle mode={props.mode} onMode={props.onMode} />
        {/* <ThemeToggle theme={props.theme} onToggle={props.onTheme} /> */}
      </div>
    </header>
  );
}
