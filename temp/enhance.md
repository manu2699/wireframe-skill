# Enriched Kind Rendering for Wireframe Preview

## Context

All `kind` values (kpi, stat, card, form, button, list, tabs, avatar, image) render identically: a tiny SVG glyph icon + text label. Too abstract for mid-fidelity wireframes. Users expect to see internal structure — form fields with column layouts, cards with title/badges/stats, KPIs with actual values, buttons that look like buttons.

Goal: each kind renders with structural detail when enrichment fields are provided, falls back to current glyph when they aren't (backward compat).

## Approach: Flat Optional Fields + Per-Kind Renderers

Add optional fields directly on `WFNode` (same pattern as existing `headers`/`rows` for table, `groups` for nav). Create per-kind renderer components in `app/src/render/kinds/`. Box.tsx dispatches to them when enrichment fields present.

Also: let `type: "box"` render `children` when present (no kind-specific fields needed for custom layouts).

## Schema Changes — `types.ts`

New optional fields on `WFNode`:

```
// kpi / stat
value?: string;           // "87%", "$12.4M"
subtitle?: string;        // "Recovery rate"  
trend?: "up" | "down";    // arrow indicator

// form  
fields?: Array<{ label: string; type?: "text"|"select"|"textarea"|"toggle"; cols?: 1|2 }>;

// card
title?: string;           // bold heading inside card
meta?: string[];          // ["Due: Jan 5", "Assigned: AK"]
badges?: string[];        // ["Urgent", "Bug"] — rendered as chips
stats?: string[];         // ["3 comments", "2 attachments"] — footer row

// list
items?: string[];         // bullet items

// tabs
tabs?: string[];          // tab labels
activeTab?: number;       // 0-based, default 0

// avatar
initials?: string;        // "AK" — shown inside circle
```

No new fields for button (always pill), charts (keep glyph), image (keep glyph).

## Per-Kind Renderers — `app/src/render/kinds/`

### Priority order in Box.tsx dispatch:
1. `kind === "button"` → always ButtonBox (no glyph fallback)
2. Kind enrichment fields present → kind renderer  
3. `children` present → render children in box frame
4. `kind` set, no enrichment → glyph + label (current behavior)
5. No kind → plain labeled box (current behavior)

### KpiBox.tsx (kpi + stat)
Trigger: `value` exists.
Renders: large value text, subtitle below, optional trend arrow (↑/↓).

### FormBox.tsx
Trigger: `fields` array non-empty.
Renders: CSS grid of labeled input rectangles. `--fcols` = max cols across fields. Each field has label + input rect. Select shows ▾, textarea is taller.

### CardBox.tsx
Trigger: `title` exists.
Renders: title bar, meta row, badge chips, stats footer. All optional except title.

### ListBox.tsx
Trigger: `items` array non-empty.
Renders: bullet list with divider lines between items. `label` becomes header if both present.

### TabsBox.tsx
Trigger: `tabs` array non-empty.
Renders: horizontal tab bar with active state. `activeTab` index selects which.

### ButtonBox.tsx
Trigger: always (no glyph fallback for buttons).
Renders: pill/bar shape. `mods: ["solid"]` = filled variant.

### AvatarBox.tsx
Trigger: `initials` exists.
Renders: circle with initials text, optional label below.

### Charts / Image
No new renderers. Charts keep glyphs (can't show real data). Image keeps glyph but CSS scales SVG larger in tall/taller mode.

## Box.tsx Children Support

When `type: "box"` has `children` and no kind enrichment, render children inside the box frame using `<Node>` dispatcher. Preserves box border, pin, flow tag, annotations. Adds `.wf-box-with-children` class.

## CSS — `app/styles/index.css`

~120 lines added inside `@layer components`. All classes prefixed `wf-`. Monochrome only (`--wf-ink`, `--wf-line`, `--wf-muted`, `--wf-fill`). Key classes per kind listed in renderer sections above.

## Files to Create/Modify

**Create:**
- `app/src/render/kinds/KpiBox.tsx`
- `app/src/render/kinds/FormBox.tsx`
- `app/src/render/kinds/CardBox.tsx`
- `app/src/render/kinds/ListBox.tsx`
- `app/src/render/kinds/TabsBox.tsx`
- `app/src/render/kinds/ButtonBox.tsx`
- `app/src/render/kinds/AvatarBox.tsx`
- `app/examples/enriched-kinds.ts` — exercises all enriched kinds

**Modify:**
- `app/src/types.ts` — add optional fields
- `app/src/render/Box.tsx` — dispatch logic + children support
- `app/styles/index.css` — new CSS classes
- `app/examples/index.ts` — register new example
- `app/examples/recycler-overview.ts` — add enrichment fields to existing nodes

## Implementation Order

1. `types.ts` — schema fields
2. Kind renderers (ButtonBox first, then KpiBox, FormBox, CardBox, ListBox, TabsBox, AvatarBox)
3. `Box.tsx` — dispatch + children support
4. `index.css` — all CSS
5. Examples — enriched-kinds + update recycler-overview
6. Visual verification via dev server

## Verification

1. `npm run dev` — start dev server
2. Check enriched-kinds example — every kind renders with detail
3. Check recycler-overview — existing model still renders, enriched nodes show detail
4. Check glyph fallback — remove enrichment fields from a node, verify glyph appears
5. Check children support — box with children renders them inside frame