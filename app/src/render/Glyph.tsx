// Monochrome line-art placeholders per `kind`. No color, no real data — just a
// recognizable grey shape so a region reads as its type. All strokes use the
// wireframe ink/line vars via currentColor (set by .wf-glyph in CSS).

import type { ReactNode } from "react";
import type { Kind } from "../types";

const S = (children: ReactNode) => (
  <svg className="wf-glyph-svg" viewBox="0 0 64 40" fill="none" stroke="currentColor"
       strokeWidth="1.5" aria-hidden="true">{children}</svg>
);

const glyphs: Partial<Record<Kind, () => ReactNode>> = {
  "chart:donut": () =>
    S(<>
      <circle cx="32" cy="20" r="13" strokeOpacity="0.35" />
      <path d="M32 7 a13 13 0 0 1 11.3 19.5" strokeWidth="3.5" />
      <circle cx="32" cy="20" r="6" strokeOpacity="0.35" />
    </>),
  "chart:line": () =>
    S(<>
      <path d="M6 30 L20 18 L32 24 L44 10 L58 16" />
      <line x1="6" y1="34" x2="58" y2="34" strokeOpacity="0.3" />
    </>),
  "chart:bars": () =>
    S(<>
      <rect x="10" y="18" width="8" height="14" strokeOpacity="0.5" />
      <rect x="24" y="10" width="8" height="22" strokeOpacity="0.5" />
      <rect x="38" y="22" width="8" height="10" strokeOpacity="0.5" />
      <line x1="6" y1="34" x2="58" y2="34" strokeOpacity="0.3" />
    </>),
  kpi: () =>
    S(<>
      <line x1="12" y1="12" x2="30" y2="12" strokeOpacity="0.4" />
      <line x1="12" y1="22" x2="44" y2="22" strokeWidth="4" />
      <line x1="12" y1="31" x2="24" y2="31" strokeOpacity="0.4" />
    </>),
  stat: () =>
    S(<>
      <line x1="12" y1="14" x2="40" y2="14" strokeWidth="3.5" />
      <line x1="12" y1="26" x2="28" y2="26" strokeOpacity="0.4" />
    </>),
  card: () =>
    S(<>
      <rect x="10" y="8" width="44" height="24" rx="2" strokeOpacity="0.4" />
      <line x1="16" y1="16" x2="40" y2="16" strokeOpacity="0.5" />
      <line x1="16" y1="23" x2="32" y2="23" strokeOpacity="0.35" />
    </>),
  list: () =>
    S(<>
      <circle cx="12" cy="12" r="1.5" /><line x1="18" y1="12" x2="50" y2="12" strokeOpacity="0.4" />
      <circle cx="12" cy="20" r="1.5" /><line x1="18" y1="20" x2="50" y2="20" strokeOpacity="0.4" />
      <circle cx="12" cy="28" r="1.5" /><line x1="18" y1="28" x2="50" y2="28" strokeOpacity="0.4" />
    </>),
  form: () =>
    S(<>
      <rect x="10" y="9" width="44" height="8" rx="2" strokeOpacity="0.4" />
      <rect x="10" y="23" width="44" height="8" rx="2" strokeOpacity="0.4" />
    </>),
  button: () =>
    S(<rect x="16" y="13" width="32" height="14" rx="3" strokeOpacity="0.6" />),
  tabs: () =>
    S(<>
      <line x1="10" y1="14" x2="22" y2="14" strokeWidth="2.5" />
      <line x1="26" y1="14" x2="38" y2="14" strokeOpacity="0.35" />
      <line x1="42" y1="14" x2="54" y2="14" strokeOpacity="0.35" />
      <line x1="10" y1="18" x2="54" y2="18" strokeOpacity="0.25" />
    </>),
  avatar: () =>
    S(<>
      <circle cx="32" cy="16" r="6" strokeOpacity="0.5" />
      <path d="M22 32 a10 10 0 0 1 20 0" strokeOpacity="0.5" />
    </>),
  image: () =>
    S(<>
      <rect x="12" y="9" width="40" height="22" rx="2" strokeOpacity="0.4" />
      <circle cx="22" cy="17" r="2.5" strokeOpacity="0.5" />
      <path d="M14 29 L26 20 L34 26 L42 18 L50 25" strokeOpacity="0.5" />
    </>),
  table: () => null, // tables render their own grid, not a glyph
};

export function Glyph(props: { kind?: Kind }) {
  const fn = props.kind ? glyphs[props.kind] : undefined;
  if (!fn) return null;
  return <span className="wf-glyph">{fn()}</span>;
}
