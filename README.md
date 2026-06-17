# Wireframe-preview skill

Generate fast, low-fidelity HTML wireframes to preview the UI/UX implications of a feature or change — directly inside your AI agent.

Works from a `feature-spec.md`, pasted endpoint definitions, or a plain one-sentence description. You author **only a small JSON model** — screens, navigation, boxes, and flow — and a prebuilt app renders it into screen tabs, state tabs, enumerated nav, monochrome type glyphs, a clickable prototype, and hover annotations that map each box back to the backend change and your design system. Monochrome mid-fidelity: shows layout, information architecture, and flow, never colors, real copy, or production styling.

Pairs with [feature-spec](https://npmjs.com/package/feature-spec): that skill produces the spec, this one consumes it.

---

## Install

No global install needed — works with `npx`, `pnpm dlx`, or `bunx`:

```bash
npx wireframe-preview install
pnpm dlx wireframe-preview install
bunx wireframe-preview install
```

This auto-detects which agents are present in your project and installs accordingly. To target a specific agent (swap `npx` for `pnpm dlx` or `bunx` as preferred):

```bash
npx wireframe-preview install claude          # Claude Code (global ~/.claude/skills/)
npx wireframe-preview install claude-project  # Claude Code (project .claude/skills/)
npx wireframe-preview install cursor          # Cursor (.cursor/rules/)
npx wireframe-preview install kilocode        # Kilocode (.kilocode/rules/)
npx wireframe-preview install windsurf        # Windsurf (.windsurf/rules/)
npx wireframe-preview install agents          # Generic .agents/skills folder
npx wireframe-preview install codex           # Codex / OpenAI (.agents/skills)
npx wireframe-preview install antigravity     # Antigravity (.agents/skills)
npx wireframe-preview install copilot         # GitHub Copilot (.agents/skills)
npx wireframe-preview install amp-code        # Amp Code (.amp/rules/)
```

### Uninstall

```bash
npx wireframe-preview uninstall            # auto-detect and remove
npx wireframe-preview uninstall cursor     # remove from one platform
```

### List supported platforms

```bash
npx wireframe-preview list
```

---

## Usage

Once installed, invoke the skill inside your agent. Point it at whatever you have:

```
/wireframe-preview
```

- **From a feature spec** — `wireframe the refund flow from docs/specs/refund-flow.md`
- **From a description** — `show me the screens for letting users invite teammates`
- **From pasted endpoints** — paste your route definitions and say `wireframe this`
- **From nothing** — just describe what the feature does; the skill proposes the screens and you prune

You author one small JSON model (schema in [SKILL.md](SKILL.md)); the skill writes three files to `.wireframes/<feature-slug>/`:
- `wireframe.html` — a thin shell. The agent edits **only** the JSON inlined in its `<script id="wf-model">` block; the rest links the CSS and app bundle. Open this in your browser.
- `wireframe.css` — frozen stylesheet, copied verbatim, never edited
- `wireframe-app.js` — prebuilt React renderer/operating layer, copied verbatim, never edited

The MCP server auto-copies `wireframe.css` + `wireframe-app.js` on `wireframe_open`; for the standalone (no-MCP) path the skill copies them itself.

---

## What you get

You author a JSON model — a `screens → states → nodes` tree — and the prebuilt app turns it into:

**Screen tabs** — one tab per agreed screen (Members page, Accept screen).

**State tabs** — per screen, only for states that matter (default, empty, error, permission-denied).

**Enumerated nav** — a `nav` node lists the actual menu items grouped as IA (Workflow / Compliance), not one anonymous "Sidebar" block.

**Monochrome `kind` glyphs** — a box's `kind` (`kpi`, `chart:donut`, `chart:line`, `chart:bars`, `card`, `table`, `list`, `form`, `button`, …) renders a recognizable grey shape, never a real chart or real data. Still strictly monochrome — a shape hint, not a component.

**Clickable prototype** — flow fields make the preview walkable: `goto:"<screenId>"` switches screen, `opens:"<modalId>"` opens a modal overlay, `action:"submit"|"save"|…` labels intent. First-class `modals[]` are opened via `opens`.

**Annotated boxes** — every box that the backend change touches carries two annotations shown on hover:
- `backend` — the concrete backend element (column, endpoint, permission)
- `ds` — the design-system component mapped from your `DESIGN.md`, or a clearly marked `guess:` if no vocabulary exists

**Feedback layer** — click any box in the browser, type a note, hit "Copy feedback block," and paste it back to the agent for precise, element-anchored iteration.

---

## Live editing via MCP (optional)

The copy-paste feedback loop works in any harness, including pure chat. If you're on a **local** harness (Claude Code, Cursor, Cline, Windsurf, Codex), you can drop the paste step entirely with the bundled **MCP server**.

It serves your `.wireframes/<feature>/` on localhost, opens it in your browser, and streams the **"Copy feedback"** / **"✓ Approve"** blocks straight back to the agent over a WebSocket — clipboard stays as the offline fallback. The wireframe artifact and its frozen CSS are unchanged; the server only changes how the block reaches the agent.

It also serves a **direct-edit mode** at `/editor/?feature=<slug>` — a small Solid editor where you drag boxes to reorder or move them, relabel them, and remap their backend / design-system annotations yourself. Saving rewrites `wireframe.html` on disk and notifies the agent (which re-reads the file). The editor only manipulates the same layout primitives and never the frozen box styling, so the wireframe stays low-fidelity.

### Setup (two commands)

The skill and the MCP server install separately. After installing the skill (above), register the server in your harness:

```bash
npx wireframe-preview mcp cursor     # Cursor   → .cursor/mcp.json
npx wireframe-preview mcp windsurf   # Windsurf → ~/.codeium/windsurf/mcp_config.json
npx wireframe-preview mcp vscode     # VS Code  → .vscode/mcp.json
npx wireframe-preview mcp claude-project   # Claude Code → .mcp.json
```

This merges a `wireframe-preview` entry into that harness's MCP config (idempotent, backs up the original, never touches your other servers). If the config has comments it won't risk clobbering it — it prints the snippet to paste instead.

For harnesses without a stable config path (Codex's `config.toml`, Cline's VS Code storage), it prints the exact path + snippet:

```bash
npx wireframe-preview mcp codex            # prints the TOML block
npx wireframe-preview mcp                  # prints config for every harness
npx wireframe-preview mcp --print cursor   # print, never edit
npx wireframe-preview mcp --remove cursor  # unregister
```

The launch command is the same everywhere — `npx -y wireframe-mcp`, no global install. Once registered, the skill auto-detects the `wireframe_*` tools and uses them instead of asking you to paste. Tools exposed:

- `wireframe_open` — serve a wireframe on localhost and open the browser
- `wireframe_wait_feedback` — block until the next feedback/approval block arrives
- `wireframe_poll_feedback` — non-blocking drain of pending blocks
- `wireframe_status` — `{ approved, openComments, url }`

Requires a local execution environment — a pure cloud chat surface has no localhost and keeps the clipboard flow.

---

## Design principles

**Low fidelity is the point.** No colors, no real copy, no working components. A chart is a box labeled "Chart". The constraint forces focus on layout and flow, not aesthetics.

**Never block on missing input.** The skill works from a one-sentence description. It proposes screens; you prune. You don't need a spec, a backend, or a design system to start.

**Annotate what changed, leave the rest plain.** Only boxes that are new or modified by the backend change carry annotations. Nav, sidebar, and unchanged sections stay unmarked so the signal stays visible.

**Confirm before drawing.** The skill proposes the screen list as text first — cheap to adjust — then draws after you approve. This avoids regenerating HTML for a screen breakdown you didn't want.

---

## Pair with feature-spec

The `feature-spec` skill reads your repo (git diff, routes, schema) and produces a structured `docs/specs/<feature>.md`. `wireframe-preview` reads that file as its input contract. The two skills are designed to chain:

```bash
# 1. generate the spec
npx feature-spec install

# 2. generate the wireframe from it
npx wireframe-preview install
```

Then inside your agent:
```
/feature-spec      → writes docs/specs/refund-flow.md
/wireframe-preview → reads it, proposes screens, draws .wireframes/refund-flow/wireframe.html
```

---

## Build / development

The renderer is a React app (shadcn/ui + Tailwind chrome), built with Vite (`@vitejs/plugin-react`). Source lives in `app/src/`; the build compiles the Tailwind stylesheet and emits a single self-contained bundle:

```bash
npm run build   # tailwindcss → assets/wireframe.css, vite build → assets/dist/wireframe-app.js (~90KB gz)
```

The skill copies that bundle verbatim into each `.wireframes/<slug>/` alongside the frozen `wireframe.css`. Agents never edit `app/src/`, `wireframe.css`, or `wireframe-app.js` — they only author the `#wf-model` JSON inside the `wireframe.html` shell.

---

## License

MIT
