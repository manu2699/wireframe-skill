---
name: wireframe-preview
description: Generate fast, monochrome mid-fidelity wireframes to preview the UI/UX implications of a feature or change. Use whenever someone describes a feature, backend change, new endpoint, new field, schema change, or user flow and wants to see how the front-end is affected — phrases like "what would the UI look like", "wireframe this", "preview the screens for", "mock up the front-end", or "show me the UX impact". Works for developers, PMs, designers, and QA, with or without a backend defined. Reads an optional shared feature-spec.md (intent, persona, screens, API) and a DESIGN.md if present, otherwise asks a few quick questions. You author ONLY a small JSON model (screens, nav, boxes, flow); a prebuilt app renders it as grey boxes + line-art glyphs. Monochrome only — shows layout, information architecture, and flow, never colors, spacing, real copy, or production styling. Prefer this over building real UI any time the goal is a quick structural + flow sanity-check rather than a buildable interface.
---

# Wireframe Preview

Turn a described feature or change into a quick, throwaway wireframe so anyone can sanity-check the front-end impact before real UI is built. The point is **mid fidelity at low cost**: rough boxes labeling what each screen section is, **what's in the navigation**, where the new/changed pieces land, **how the screens connect** (clicks → screens, buttons → modals), and how each box maps back to (a) the feature/backend behavior and (b) the design system. Not a buildable interface, never colored or styled.

You author **only a small JSON model**. A prebuilt app (`wireframe-app.js`, copied verbatim) renders it into the operating layer — screens, tabs, enumerated nav, monochrome glyphs, a clickable prototype, the comment/approve loop. You never write HTML or CSS, and you never touch the app bundle.

This skill is for whoever shows up — a developer mid-feature, a PM scoping an idea, a designer thinking through flows, a QA engineer mapping states. It must produce a useful wireframe from a single sentence and a sharper one from a full spec. **Never block on missing input, never require backend knowledge.**

Two situations to serve, equally:
1. **The user knows their screens** — screens are an *input*; lay out where the changed pieces land.
2. **The user is blank on screens** — screens are an *output*; proposing the screen breakdown from their intent is the whole point. Be generous and concrete when proposing.

## Fidelity: monochrome, but structure + IA + flow

This is **mid-fidelity**, not a polished mockup and not a bag of unlabeled grey boxes. The model conveys the three things a wireframe exists to communicate — **information architecture**, **element type**, and **flow** — while staying strictly monochrome. You must **never**:

- Specify colors, gradients, shadows, spacing, fonts, or any visual design. There are no style fields in the schema; the app renders everything grey by design.
- Write real or realistic copy. Use short generic labels ("Refund reason field", "Submit", "Recovery vs mandate"). Table body cells are placeholders (`—`).
- Render real components or real data. A chart is a box with `kind:"chart:donut"` — a grey donut *glyph*, never a real chart with values. A `kind` is a shape hint, not a component.
- Pull in any framework, CDN, font, or external resource.

What mid-fi *does* add over plain boxes, all monochrome: enumerated navigation (the actual menu items, not one "Sidebar" block), `kind` glyphs so a region reads as kpi/chart/table/form/etc., and `goto`/`opens`/`action` flow so the preview is clickable. Use them — they're the value. If you catch yourself reaching for color or real design, stop.

## Workflow

### 1. Gather the input (read files, then ask only for gaps)

The only things you truly need to start are **the feature intent in one sentence** and **who uses it**. Everything else comes from optional files, or you propose it and the user reacts.

**Read these files if they exist** (look in `docs/specs/<feature>.md`, the project root, or a `docs/` dir):
- `feature-spec.md` (or `docs/specs/<feature>.md`) — the shared feature spec: intent, persona, screens & states, optional API surface / auth / field changes / frontend-impact. Single input contract; sections may be blank ("propose this for me"). The Auth/permissions section tells you which screens need a permission-denied state. For backward compatibility also read a legacy `feature.md`/`api.md` if no `feature-spec.md` exists.
- `DESIGN.md` — component vocabulary (see step 4).

**Then fill gaps by asking — adaptively, in the user's own language.** Match the persona: developers may get endpoint/schema questions; PMs get outcome questions. **If they're blank on screens, do not push them to invent any** — ask only what the feature is for and who uses it, then propose in step 2. If there's no backend yet, that's fine — backend annotations become guesses (step 4) or are omitted. Keep elicitation to a couple of questions; never re-ask what the spec already answers.

### 2. Propose the screens and states, confirm, then draw

Pruning a text list is free; pruning rendered output is not. **Always confirm the list before drawing.**

From the gathered intent, propose a **concrete, generous** breakdown — the screens and states a feature like this normally needs, named plainly. For each screen, propose only the states it actually exercises (default/filled, empty, loading, error, permission-denied). Also note the **navigation** (the menu the screens hang off) and any **modals** the flow opens.

Present compactly and invite pruning:
> A feature like this usually needs these screens:
> 1. **Members page** — list of teammates, Invite button, pending invites (states: default, empty)
> 2. **Invite modal** — enter emails, send (states: default, error)
> 3. **Invitee accept screen** — what the invited person lands on (states: pending, accepted, expired)
>
> I'll draw these. Want to drop, add, rename, or merge any first?

Wait for approval, adjust, then draw (step 3).

**After the list is agreed, offer to save it** to `docs/specs/<feature>.md` (intent + persona + screens + states), so the next run — or any consumer skill — starts from a real spec. Fill only the sections you have.

### 3. Write the wireframe (one JSON model + two copied assets)

Write to a predictable location, `./.wireframes/<feature-slug>/`:

- `wireframe.html` — copy `assets/template.html` (the thin shell). **Edit only the JSON inside `<script type="application/json" id="wf-model">…</script>`.** Leave the rest of the shell as-is; it links the stylesheet and the app bundle by relative path.
- `wireframe.css` — copy `assets/wireframe.css` **verbatim** as a sibling. Frozen; never edit or regenerate.
- `wireframe-app.js` — copy `assets/dist/wireframe-app.js` **verbatim** as a sibling. The prebuilt renderer/operating layer; never edit.

Copy the two assets with a shell copy (e.g. `cp`), not by writing their contents — they're large and frozen. (When you use the `wireframe_*` MCP tools, `wireframe_open` auto-copies `wireframe.css` and `wireframe-app.js` for you, so you only need to write `wireframe.html`. Copy them yourself only for the standalone/no-MCP path.)

The **only thing you author** is the `#wf-model` JSON. Its shape:

```jsonc
{
  "feature": "Recycler Overview",
  "change": "one-line backend change",         // shown in the review sidebar
  "designSource": "from DESIGN.md | detected: MUI | guess: generic primitives",
  "shared": {                                   // A: named fragments; ref with {"$ref":"key"}
    "left_nav": { "type":"nav", "side":"left", "groups":[...] }
  },
  "flows": [                                    // H: screen flow map (clickable strip in UI)
    { "from":"s_list", "via":"click row", "to":"s_detail" },
    { "from":"s_detail", "via":"Edit", "to":"s_edit" }
  ],
  "screens": [
    {
      "id": "s_overview", "name": "Overview",
      "role": "list",                           // I: IA role badge on tab (optional)
      "nodes": [ /* node tree */ ]              // D: single-state shorthand — omit "states" wrapper
    },
    {
      "id": "s_detail", "name": "Detail",
      "states": [                               // use states[] only when screen has >1 state
        { "id": "default", "name": "Default", "nodes": [ /* node tree */ ] },
        { "id": "empty",   "name": "Empty",   "nodes": [ /* node tree */ ] }
      ]
    }
  ],
  "modals": [                                   // optional; opened via opens:"<id>"
    { "id": "m_issue", "name": "Issue certificate", "nodes": [ /* node tree */ ] }
  ]
}
```

Use stable, meaningful `id`s for screens and modals — `goto`/`opens` reference them, and they keep comments anchored across edits.

### 4. Author the node tree (structure + IA + glyphs + flow + annotations)

Every `nodes` array holds a tree of **nodes**. Node `type` is a closed structural set; meaning lives in free-text fields.

#### Compact syntax — use this to cut ~35–40% of output tokens

The renderer expands these shorthands automatically:

| Shorthand | Expands to | Savings |
|-----------|-----------|---------|
| Omit `type` — if node has `kind` or `label` | `type:"box"` inferred | ~5–8% |
| `{"row":[...]}` | `{type:"row", children:[...]}` | ~3–5% |
| `{"col":[...]}` | `{type:"col", children:[...]}` | ~3–5% |
| `{"$ref":"key"}` | shared fragment expanded in-place | ~25–40% on repeated nav/sidebar |
| Screen with `nodes:[...]` (no `states`) | `states:[{id:"default",name:"Default",nodes:[...]}]` | ~2–3% |

**Compact example vs. verbose:**
```jsonc
// verbose (old)
{"type":"row","children":[{"type":"box","kind":"button","label":"Save"}]}

// compact (preferred)
{"row":[{"kind":"button","label":"Save"}]}
```

**`$ref` example** — define nav once, reference on every screen:
```jsonc
"shared": {
  "left_nav": {"type":"nav","side":"left","groups":[{"items":[{"text":"Home","goto":"s_home"}]}]}
},
// on each screen's nodes:
{"row":[{"$ref":"left_nav"}, { ...main content... }]}
```

**Placeholder discipline (E):** enrichment content (items, messages, labels) — max 5 words. Use generic text, not realistic copy. The structure is the wireframe, not the content.

**Backend annotation required (F):** every node that is **new or changed** by the feature MUST carry a `backend` field. Layout containers and unchanged elements can omit it.

**Structural types:**

| type    | purpose                                   | key fields                                  |
|---------|-------------------------------------------|---------------------------------------------|
| `box`   | the atom (a labeled region)               | `label`, `kind`, `mods`, `backend`, `ds`, flow, `new`, `changed` |
| `row`   | horizontal flex row — shorthand: `{"row":[...]}` | `children`                         |
| `col`   | vertical stack — shorthand: `{"col":[...]}`      | `children`                         |
| `grid`  | N-column grid (cards/tiles)               | `cols`, `children`                          |
| `table` | a table                                   | `headers[]`, `rows[][]`, `backend`, `ds`    |
| `nav`   | enumerated navigation (IA)                | `side:"left"\|"top"`, `groups[]`            |
| `raw`   | escape hatch for anything else            | `html`                                      |

**`nav` — enumerate the menu (don't blob it).** This is how "what's in the left nav" gets conveyed. Group the items and mark the active one:

```jsonc
{ "type":"nav", "side":"left", "groups":[
  { "label":"Workflow", "items":[
    { "text":"Overview", "active":true, "goto":"s_overview" },
    { "text":"Battery Intake", "goto":"s_intake" },
    { "text":"Inbox", "badge":4 }
  ]},
  { "label":"Compliance", "items":[ { "text":"EPR Certificates", "goto":"s_certs" } ] }
]}
```

**`kind` — monochrome type glyphs** (a recognizable grey shape, never a real component or real data). One of: `kpi`, `stat`, `chart:donut`, `chart:line`, `chart:bars`, `card`, `table`, `list`, `form`, `button`, `tabs`, `avatar`, `image`. Omit `kind` for a plain labeled box.

**`mods`** — sizing/emphasis only: `["tall"]`, `["taller"]`, `["placeholder"]` (muted empty/error text), `["solid"]`, `["shaded"]`.

**Flow — make the prototype clickable** (the reviewer walks the IA):
- `goto:"<screenId>"` — clicking switches to that screen.
- `opens:"<modalId>"` — clicking opens that modal overlay.
- `action:"submit"|"save"|"delete"|…` — labels intent (pair with `backend`).

Put these on nav items and on `kind:"button"` boxes (or any box). A small affordance (`→`/`⊕`) shows on the node so flow is visible even in Comment mode.

**Annotations — the high-value mapping.** Every box that is **new or modified by the change** carries both:
- `backend` — the concrete backend element: new/changed column, endpoint, field, event, permission. Source from the spec's API/field sections, else from what the user described. Be specific. If there's genuinely no backend, describe behavior ("saves refund reason") or omit — don't invent endpoint names.
- `ds` — the design-system mapping: component name + variant/size from the user's real vocabulary (below). When nothing fits, prefix with `guess: ` (e.g. `"guess: Badge / status"`); the app renders guesses in amber on hover. Never pass a guess off as confirmed.
- `new: true` — (G) marks element as newly added by this feature. Renders a `✦ new` badge on the node in the wireframe.
- `changed: true` — (G) marks element as modified by this feature. Renders a `~ changed` badge.

Pure layout context (nav containers, unchanged sections) gets no annotations — keep the signal on what changed.

**Table example** — real column names in `headers`, placeholder body rows:

```jsonc
{ "type":"table", "headers":["Order","Status","Total"],
  "rows":[["—","—","—"],["—","—","—"]],
  "backend":"GET /orders", "ds":"DataGrid / striped" }
```

Keep it cheap: a screen is a handful of nodes, short labels, only the states that matter.

#### Sourcing the design-system vocabulary (`DESIGN.md`)

The `ds` mapping is only useful if it uses the names the user's team uses. Don't guess from your own library knowledge. The vocabulary lives in a **`DESIGN.md`** — the open [Google Labs DESIGN.md format](https://github.com/google-labs-code/design.md). The **Components** section is the vocabulary you read. Source it in order:

1. **Read an existing `DESIGN.md`** at the project root (accept legacy lowercase `design.md` or one under `docs/`). Constrain every `ds` value to names that appear there, spelled exactly.
2. **When none exists, auto-detect and create one.**
   - **Step A — spawn a detection agent** (`Agent`, subagent_type `Explore`): "Scan this repo for a component library. Check package.json deps (MUI, Chakra, Ant Design, shadcn/ui, Radix, etc.), a `components/`/`src/components/` dir, a Storybook `stories/` dir, or an internal design package. Return: (1) the detected library + version if any, (2) up to 30 component names with key variants/sizes/states as `ComponentName — variants: x, y; sizes: sm, md, lg`. Return ONLY this list."
   - **Step B — write `DESIGN.md`** from `assets/DESIGN.md`, filling the Components section with the agent's findings; set the `name:` frontmatter to the detected library. Tell the user you created it.
   - **Step C — generic fallback.** If detection finds nothing concrete, write no file; map boxes with generic primitives and mark every `ds` as `guess: `. Tell the user how to add a `DESIGN.md` later.

   Detection/write happens once per project; if `DESIGN.md` exists (even a stub), read it and skip. The user owns the vocabulary; you own the assignment.

### 5. Open the preview, then iterate on the model

After writing, give the user the path to `wireframe.html` and offer to open it. Mention they can **click any box to comment** (Comment mode), **toggle Click-through mode (top right) to walk the flow**, then hit **"Copy feedback"** to paste a block back, or **"✓ Approve"** to sign off (step 6). To open directly:

- macOS: `open .wireframes/<feature-slug>/wireframe.html`
- Linux: `xdg-open .wireframes/<feature-slug>/wireframe.html`
- Windows: `start .wireframes/<feature-slug>/wireframe.html`

Treat the model as a living file. Follow-up requests ("make Reason a Select", "drop the empty state", "add a loading state", "Submit should open a confirm modal") are **edits to the `#wf-model` JSON only** — change the node's fields, add a state, add a `modals[]` entry + `opens`, and tell the user to refresh. Never edit `wireframe.css` or `wireframe-app.js`.

#### Live loop via the wireframe MCP server (no paste)

If the `wireframe_*` MCP tools are available, prefer them over copy-paste:

1. After writing `wireframe.html`, call **`wireframe_open`** with `{ feature: "<feature-slug>" }`. It copies the frozen assets if needed, serves `.wireframes/<slug>/` on localhost, opens the browser, returns the URL. The browser's **"Send to agent"/"Copy feedback"** and **"✓ Approve"** buttons stream their block straight to you.
2. Tell the user to comment/approve, then call **`wireframe_wait_feedback`** with `{ feature, timeoutMs }`. It blocks until the next block arrives and returns the **exact structured text** parsed below.
3. Apply the feedback (edit the model only), tell the user to refresh, call `wireframe_wait_feedback` again. Use `wireframe_status` for `{ approved, openComments }`. Loop until a `WIREFRAME APPROVED` block arrives, then go to step 6.

The MCP server only changes the *transport* — it never generates, renders, or restyles. If the tools aren't present, use the clipboard flow; everything still works.

#### Consuming a feedback block

When you receive a block delimited `===== WIREFRAME FEEDBACK: <feature> =====` … `===== END FEEDBACK (N items) =====`, treat it as a strict instruction set:

- **Apply only the listed items. Change nothing else.** No "improving" adjacent boxes, no restyling, no touching unnamed screens/states.
- **Match each item by its `#wf-id`**, not the label. The id is stamped on the element and is stable across relabeling; `label="…"` is human reference only. In the model, the id maps to a node in document order — find the node the item describes within its `screen`/`state` scope.
- **Respect the `screen=` and `state=` scope.**
- **Verify the count** in the footer; if you parse fewer/more than N, say so (possible truncated paste).
- **Confirm what you did** — "applied N of N", each id + change. Flag any id that no longer exists.

### 6. Approval & handoff (the terminal signal)

The loop ends in more changes (a feedback block) or **sign-off** ("✓ Approve"). An approval block is delimited `===== WIREFRAME APPROVED: <feature> =====` … `===== END APPROVAL (K mapped boxes, N open comments) =====` and carries the agreed **screens** plus every annotated element's `id | label | screen | state | API | COMPONENT | FLOW` mapping. When you receive one:

- **Read it as understanding, not a build spec.** It's the low-fidelity grasp of *what the feature needs* — screens, IA, flow, and how each changed piece ties to a backend element and a component. Not code, not visual design. Never reproduce grey boxes as components or infer pixels/spacing/color.
- **Check open comments first.** If `N open comments`, surface and resolve them before going further.
- **Lock the spec.** Persist to `docs/specs/<feature>.md`: `status: approved`, the confirmed screens & states, and the box→backend→component(→flow) mapping. This is the single source of truth other tools consume.
- **Produce a plan, then wait.** Turn the mapping into an implementation plan — each annotated box becomes "build component X (from `COMPONENT`) wired to backend Y (from `API`) on screen Z, reachable via `FLOW`" — present it, and **wait for a greenlight** before writing feature code. Approval signs off the *idea*, not the implementation.

Lifecycle: confirm screens (step 2) → draw the model (3–4) → iterate via feedback blocks (5) → **approve → lock spec → plan → wait** (6).

## Examples

**Example A — developer, full input.** `feature-spec.md` (API filled) and `DESIGN.md` exist.
Input: "Wireframe the refund flow."
- Step 1: read both; ask nothing.
- Step 2: "Admins issue refunds, customers see confirmation. Screens: Admin refund form (default, error), Customer confirmation, Admin order list (adds Refunded badge); nav: Orders / Refunds. Drawing these — adjust?"
- Steps 3–4: write `.wireframes/refund-flow/wireframe.html` with the model — a `nav` listing Orders/Refunds, the refund form (`kind:"form"`) with the reason box (`backend`,`ds` from the spec), a `kind:"button"` Submit with `action:"submit"`, the order list as a `table`. "Make Reason a Select" → edit that node's `ds`/label, refresh.

**Example B — PM, blank on screens, no files.**
Input: "Show me what the screens look like for letting users invite teammates."
- Step 1: no files. Ask only: "What does this let someone do, and who does it?"
- Step 2: propose the Members page / Invite modal / Invitee accept screen set with states; confirm; offer to save to `docs/specs/invite-teammates.md`.
- Steps 3–4: model the agreed set — a `nav` with the menu, the Members `table`, an "Invite" `kind:"button"` with `opens:"m_invite"`, the invite `modals[]` entry. `backend` describes behavior ("sends invite") since no endpoints; `ds` values are `guess: ` (no `DESIGN.md`).

## Keep it cheap
The token budget is the constraint, and you only write JSON. A screen is a handful of nodes, not a layout study. Fewer nodes, shorter labels, only the states and flow that matter. Start lean; the user can ask for more.
