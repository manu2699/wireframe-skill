// Presentational: the screen tab strip with per-screen comment-count badges.

import type { WFScreen } from "../types";
import { cn } from "../lib/utils";

export function ScreenTabs(props: {
  screens: WFScreen[];
  screenId: string;
  badgeCount: (screenName: string) => number;
  onGoto: (id: string) => void;
}) {
  return (
    <nav className="flex flex-1 items-stretch px-1" role="tablist">
      {props.screens.map((s) => {
        const active = props.screenId === s.id;
        const count = props.badgeCount(s.name);
        return (
          <button
            key={s.id}
            role="tab"
            aria-selected={active}
            onClick={() => props.onGoto(s.id)}
            className={cn(
              "inline-flex items-center whitespace-nowrap border-b-2 px-4 text-[13px] transition-colors",
              active
                ? "border-foreground font-semibold text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {s.name}
            {count > 0 && (
              <span className="ml-1.5 inline-flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-wfc-accent px-1 text-[9.5px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
