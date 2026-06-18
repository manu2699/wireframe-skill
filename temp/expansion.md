# Plan: Add 21 New Wireframe Kinds + Layout Improvements

## Context

The wireframe preview package currently has 8 box kinds (kpi/stat, card, list, form, tabs, button, avatar, image + 3 chart types). Too few for real-world wireframing scenarios. Adding 21 new kinds covering navigation, data display, user input, feedback, and composite patterns. Also fixing layout gaps (no flex-end, no alignment mods, no gap control).

## Batch 0: Foundation — Types + Layout Mods

### `app/src/types.ts`

**Kind union** — add 20 new values (table already exists):
```
"search" | "breadcrumb" | "stepper" | "accordion" | "sidebar" | "pagination"
"timeline" | "progress" | "badge" | "rating"
"toggle" | "slider" | "datepicker" | "upload" | "radio-group" | "checkbox-group"
"alert" | "modal" | "notification-list" | "chat-window"
```

**Mod union** — add layout mods:
```
"end" | "center" | "between" | "middle" | "compact" | "loose" | "narrow"
```

**WFNode** — add props (naming avoids conflicts with existing fields):
- `flex?: number` — layout weight for cols
- `placeholder?: string; filters?: string[]` — search
- `crumbs?: string[]` — breadcrumb
- `steps?: string[]; activeStep?: number` — stepper
- `sections?: { title: string; expanded?: boolean }[]` — accordion
- `sidebarGroups?: { label?: string; items: string[] }[]; activeItem?: string` — sidebar (not `groups` — conflicts with NavGroup)
- `pages?: number; current?: number` — pagination
- `selectable?: boolean; actions?: string[]` — table enriched (headers/rows already exist)
- `events?: { label: string; meta?: string }[]` — timeline
- `percent?: number` — progress
- `text?: string; variant?: "default"|"success"|"warning"|"error"` — badge
- `rating?: number; max?: number` — rating (not `value` — conflicts with KPI)
- `checked?: boolean; toggleLabel?: string` — toggle
- `min?: number; sliderValue?: number` — slider (max shared with rating)
- `dateValue?: string` — datepicker
- `uploadLabel?: string` — upload
- `options?: string[]; selected?: number` — radio-group
- `checkedItems?: number[]` — checkbox-group (not `checked` as array — conflicts with toggle boolean)
- `message?: string; alertType?: "info"|"warning"|"error"|"success"` — alert
- `modalTitle?: string; modalFooter?: string[]` — modal
- `notifications?: { text: string; meta?: string; unread?: boolean }[]` — notification-list
- `messages?: { from: string; text: string; sent?: boolean }[]` — chat-window

### `app/styles/index.css` — Layout mod CSS (after `.wf-taller`)

```css
.wf-end { justify-content: flex-end; }
.wf-center { justify-content: center; }
.wf-between { justify-content: space-between; }
.wf-middle { align-items: center; }
.wf-compact { gap: 6px; }
.wf-loose { gap: 20px; }
.wf-narrow { flex: 0 0 auto; }
```

### `app/src/render/Layout.tsx` — `flex` prop support

For `col` type, apply `style={{ flex: n.flex }}` when defined.

## Batch 1–4: Kind Components (21 files)

All follow same pattern as existing kinds:
- File: `app/src/render/kinds/[Name]Box.tsx`
- Signature: `export function NameBox(props: { node: WFNode & { _id?: string } })`
- Root class: `"wf-box wf-[name]-box " + modClasses(n)`
- First child: `<Pin id={n._id} />`
- Last child: `<FlowTag goto={n.goto} opens={n.opens} action={n.action} />`
- Wrapped: `withAnnotation(box, n.backend, n.ds)`

### Batch 1: Navigation & Structure

| Kind | Component | Enrichment trigger | Renders |
|------|-----------|--------------------|---------|
| search | SearchBox | `kind === "search"` (always) | Magnifying glass + input bar + optional filter chips |
| breadcrumb | BreadcrumbBox | `crumbs?.length > 0` | `Home › Products › Current` (last bold) |
| stepper | StepperBox | `steps?.length > 0` | Connected circles: ● done, ◉ active, ○ pending |
| accordion | AccordionBox | `sections?.length > 0` | Stacked rows with ▾/▸ chevrons, expanded shows dashed body |
| sidebar | SidebarBox | `sidebarGroups?.length > 0` | Grouped vertical items, active item solid+filled |
| pagination | PaginationBox | `kind === "pagination"` (always) | `[‹] [1] [2] [■3■] [4] [5] [›]` |

### Batch 2: Data Display

| Kind | Component | Enrichment trigger | Renders |
|------|-----------|--------------------|---------|
| table (enriched) | TableBox | `kind === "table" && headers?.length > 0` | Grid with headers, rows, optional checkboxes + action column |
| timeline | TimelineBox | `events?.length > 0` | Vertical line with dots + labels + meta |
| progress | ProgressBox | `kind === "progress"` (always) | Horizontal bar with fill at `percent%` |
| badge | BadgeBox | `kind === "badge"` (always) | Pill chip; variant changes border style (solid/dashed/double) |
| rating | RatingBox | `kind === "rating"` (always) | Row of star SVGs, filled up to `rating` value |

**Note:** TableBox is for `type: "box", kind: "table"` — distinct from existing `Table.tsx` which handles `type: "table"`.

### Batch 3: User Input

| Kind | Component | Enrichment trigger | Renders |
|------|-----------|--------------------|---------|
| toggle | ToggleBox | `kind === "toggle"` (always) | Switch graphic + label |
| slider | SliderBox | `kind === "slider"` (always) | Track + thumb positioned proportionally |
| datepicker | DatepickerBox | `kind === "datepicker"` (always) | Input field + calendar icon |
| upload | UploadBox | `kind === "upload"` (always) | Dashed zone + upload arrow icon + label |
| radio-group | RadioGroupBox | `options?.length > 0` | ◉/○ circles + labels vertically |
| checkbox-group | CheckboxGroupBox | `options?.length > 0` | ☑/☐ squares + labels vertically |

### Batch 4: Feedback & Composite

| Kind | Component | Enrichment trigger | Renders |
|------|-----------|--------------------|---------|
| alert | AlertBox | `kind === "alert"` (always) | Icon + message bar; alertType changes border style |
| modal | ModalBox | `kind === "modal"` (always) | Title bar + body (children render here) + footer buttons |
| notification-list | NotificationListBox | `notifications?.length > 0` | Items with unread dot + text + meta |
| chat-window | ChatWindowBox | `messages?.length > 0` | Bubbles left/right + input bar at bottom |

## Batch 5: Glyphs — `app/src/render/Glyph.tsx`

Add 20 glyph entries (table already returns null). All 64×40 viewBox, stroke only, currentColor:

| Kind | Glyph concept |
|------|--------------|
| search | Magnifying glass |
| breadcrumb | 3 short lines with `>` arrows |
| stepper | 3 circles connected by line |
| accordion | 3 stacked lines with triangles |
| sidebar | Vertical rect with indented lines |
| pagination | Row of small squares |
| timeline | Vertical line with 3 dots |
| progress | Horizontal bar with partial fill |
| badge | Small rounded pill |
| rating | 3 star outlines |
| toggle | Rounded rect with circle |
| slider | Horizontal line with circle thumb |
| datepicker | Calendar icon |
| upload | Cloud with up arrow |
| radio-group | 3 circles vertically, one filled |
| checkbox-group | 3 squares vertically, one checked |
| alert | Exclamation in rounded rect |
| modal | Rectangle with header bar |
| notification-list | 3 lines with dots on left |
| chat-window | Two offset speech bubbles |

## Batch 6: Dispatch — `app/src/render/Box.tsx`

Add 21 imports + dispatch conditions after existing avatar check (line 52), before children check (line 55). Order matches batches above.

## Batch 7: CSS — `app/styles/index.css`

Add enriched kind styles after existing `.wf-avatar-label` block. Each kind gets its own section with `.wf-[name]-box` and child selectors. All monochrome using existing CSS vars. Variant differentiation via border-style only (solid/dashed/double), not color.

## Batch 8: Example + Docs

- `app/examples/new-kinds-showcase.ts` — 5-screen example demonstrating all 21 kinds + layout mods
- `app/examples/index.ts` — add import
- Update SKILL.md kind reference if it exists

## Verification

1. `npm run dev` — start dev server
2. Load new-kinds-showcase example
3. Verify all 21 kinds render correctly with enrichment props
4. Verify glyph fallback works for each kind (without enrichment props)
5. Test layout mods: row with `mods: ["end"]` should right-align children
6. Test `flex` prop on cols
7. Check no regressions on existing kinds