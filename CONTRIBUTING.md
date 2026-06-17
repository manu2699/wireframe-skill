# Contributing to wireframe-preview

Thanks for your interest in contributing. This is a focused tool — keep PRs tightly scoped.

## Quick start

```bash
git clone https://github.com/your-org/wireframe-preview
cd wireframe-preview
npm install
```

Node 18+ required.

## Running it locally

The everyday inner loop is the **dev server with HMR** — no rebuild needed:

```bash
npm run dev        # Vite dev server at http://localhost:5173 (HMR)
```

It mounts the renderer against the sample models in `app/examples/` and shows a
small switcher bar (top of the page) to flip between them. You can also pick one
directly via the URL:

```
http://localhost:5173/?example=recycler-overview   # dashboard: KPIs, charts, table, modal
http://localhost:5173/?example=form-flow           # multi-step wizard + validation state
http://localhost:5173/?example=empty-and-error     # one screen across default/loading/empty/error
```

Edit anything under `app/src/` and the page updates instantly. Dev uses in-memory
storage and an offline transport, so comments reset on reload and "Send" just
copies to the clipboard.

Other commands:

```bash
npm run build              # emit the shippable bundle → assets/dist/wireframe-app.js
node test/serve-demo.mjs   # serve a wireframe through the real MCP harness (HTTP + WS)
npm test                   # MCP smoke test + CLI registration tests
npx tsc --noEmit           # type-check
```

Use `npm run dev` while iterating; `npm run build` only when you're ready to ship
the bundle (see *Changing the renderer*).

## Project layout

```
app/
  index.html         Vite dev-server root (development only)
  dev/               Dev harness — example switcher, in-memory wiring (never shipped)
  examples/          Sample WFModel inputs for dev/test/authoring (never shipped)
  styles/index.css   Tailwind source → compiled to assets/wireframe.css (chrome + raw layer)
  src/               React renderer (source)
    main.tsx         Production entry: reads #wf-model, wires browser adapters, mounts <App>
    App.tsx          Container: composes hooks + presentational components
    types.ts         The wireframe JSON schema (source of truth)
    model/           Input: stamp.ts (stable ids), read.ts (DOM #wf-model adapter)
    hooks/           React state: useNav, useComments, useReview, useTheme
    ports/           Injected boundaries: storage (localStorage/in-memory), transport (WS/no-op)
    lib/             Pure helpers: utils (cn), blocks (feedback/approval builders)
    render/          Recursive node renderers + registry (type → component) + glyphs
    ui/              Presentational chrome: header, canvas, dialog, sidebar, comment popover
    components/ui/   shadcn primitives (button, dialog, popover, tooltip, toggle-group, icons)

assets/
  template.html   Thin shell — only the #wf-model JSON is authored per wireframe
  wireframe.css   Frozen stylesheet (copied verbatim per wireframe)
  DESIGN.md       Scaffold for the project-level design system vocabulary
  feature-spec.md Scaffold for the shared feature spec
  dist/           Build output — wireframe-app.js (generated, committed)

bin/cli.js        CLI: install / uninstall / mcp / list commands
mcp/server.js     MCP server: HTTP + WebSocket server + MCP tool handlers
test/             MCP smoke test (smoke.mjs) + CLI registration tests (cli-mcp.mjs)
```

## Architecture

The wireframe artifact is a **thin HTML shell** with a JSON model in `<script id="wf-model">`. The prebuilt React bundle (`wireframe-app.js`) reads that JSON and renders the interactive preview. Agents only author the JSON — they never edit the CSS or bundle.

**Dependency injection at the boundary.** `App` (`app/src/App.tsx`) takes its
inputs as props — `{ model, meta, storage, transport }` — and never reaches for
the DOM, `localStorage`, or the network itself. The concrete adapters are wired in
exactly two entry points:

- `app/src/main.tsx` (production): reads `#wf-model`, uses `localStorage` + the live
  MCP WebSocket transport.
- `app/dev/main.tsx` (dev): feeds an example model, in-memory storage, and an
  offline transport.

This is what makes the renderer testable and lets the dev server render and switch
between multiple models without leaking state. The `ports/` directory defines those
seams (`Storage`, `Transport`); `state/` holds the reactive logic; `ui/` and
`render/` are presentational.

**Adding a node type is open/closed.** Renderers are looked up in
`app/src/render/registry.ts` (`type → component`), so a new node type is a new
component plus one registry entry — no central switch to edit.

The MCP server injects a WebSocket bootstrap into served HTML so the browser's "Copy feedback" and "✓ Approve" buttons push blocks directly to the agent instead of requiring a clipboard paste.

## The wireframe JSON model

The JSON in `#wf-model` is the contract between the agent (author) and the
renderer. The authoritative schema is `app/src/types.ts`; `app/examples/*` are
worked references. `SKILL.md` documents it for agents — keep the two in sync rather
than duplicating detail here.

```
WFModel
  feature        string   — title shown in the header
  change?        string   — backend change summary (sidebar)
  designSource?  string   — where the design vocabulary came from
  screens[]      WFScreen — { id, name, states[] }
  modals?[]      WFModal  — { id, name, nodes[] }

WFScreen → states: WFState[]   ( { id, name, nodes: WFNode[] } )

WFNode (recursive)
  type      box | row | col | grid | table | nav | raw
  kind?     kpi | stat | chart:donut | chart:line | chart:bars | card |
            table | list | form | button | tabs | avatar | image   (monochrome glyph)
  mods?     tall | taller | placeholder | solid | shaded
  children? WFNode[]                  (row / col / grid)
  cols?     number                    (grid)
  headers?, rows?                     (table)
  side?, groups?                      (nav: "left" | "top", grouped items)
  html?                               (raw escape hatch)
  backend?, ds?                       (annotations: API endpoint, design-system component)
  goto?, opens?, action?              (flow: screenId, modalId, intent label)
```

Containers (`row`/`col`/`grid`) are not commentable; every other node and each nav
item gets a stable `wf-N` id stamped at load (`app/src/model/stamp.ts`) so comments
re-anchor across reloads.

## Changing the renderer

Iterate with `npm run dev` (HMR). When the behavior is right, rebuild the shipped bundle:

```bash
npm run build
```

This emits a new `assets/dist/wireframe-app.js`. Commit both the source change and the rebuilt bundle. The bundle is committed so consumers get a working artifact without a build step.

Key constraints:
- The renderer must work from `file://` (standalone) and from the MCP `http://` server.
- No external CDN references — the bundle must be fully self-contained.
- Stay strictly monochrome. `wireframe.css` has no color variables on purpose.

## CSS conventions

`wireframe.css` has two zones:

- **Wireframe zone** (`.wf-*` box classes) — raw grey, no design. Deliberately plain.
- **Chrome zone** (header, sidebar, popovers) — uses `--c-*` variables for the operating layer UI.

Mod classes added by the renderer have the `wf-` prefix (e.g. `mods:["solid"]` → class `wf-solid`). CSS rules for mods must therefore use `.wf-box.wf-solid`, not `.wf-box.solid`.

## Adding a new `kind` glyph

1. Add the value to the `Kind` union in `app/src/types.ts`.
2. Add a monochrome SVG entry in `app/src/render/Glyph.tsx` (use `currentColor`, stroke only, 64×40 viewBox).
3. Document it in `SKILL.md` under the `kind` field description.
4. Verify with `npm run dev`, then rebuild for shipping: `npm run build`.

(To add a whole new **node type** rather than a glyph: create a renderer under
`app/src/render/` and register it in `app/src/render/registry.ts`.)

## Adding a new install platform

1. Add an entry to `PLATFORMS` in `bin/cli.js` with `label`, `type: "copy"`, and a `dest()` function.
2. Add it to the `autoDetect()` function if the platform has a recognizable project-level directory.
3. If the platform also has an MCP config, add a `MCP_TARGETS` entry in `bin/cli.js`.
4. Add an install test case in `test/cli-mcp.mjs` if relevant.

## Tests

```bash
npm test
```

Runs two test files:
- `test/smoke.mjs` — spins the full MCP server, opens a wireframe, simulates browser WS push, asserts the agent receives the block.
- `test/cli-mcp.mjs` — exercises all `mcp` CLI subcommands (register, idempotent rerun, JSONC safety, --print, --remove).

Manual browser testing:
```bash
npm run dev                # fastest: HMR + example switcher (renderer behavior)
node test/serve-demo.mjs   # boots MCP, prints URL — verify against the real harness
```

## Pull request guidelines

- One concern per PR — don't bundle unrelated changes.
- If you change `app/src/`, run `npx tsc --noEmit` and include the rebuilt `assets/dist/wireframe-app.js` in the same commit.
- If you change `wireframe.css`, verify the rendered output still looks correct (`npm run dev`, or `node test/serve-demo.mjs` for the harness path).
- Update `SKILL.md` if you add or change anything that affects how agents author the JSON model.
- No new dependencies without a good reason — the runtime dep list should stay minimal.
