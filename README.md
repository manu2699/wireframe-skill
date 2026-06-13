# Wireframe-preview skill

Generate fast, low-fidelity HTML wireframes to preview the UI/UX implications of a feature or change — directly inside your AI agent.

Works from a `feature-spec.md`, pasted endpoint definitions, or a plain one-sentence description. Produces rough grey-box wireframes with screen tabs, state tabs, and hover annotations that map each box back to the backend change and your design system. Deliberately avoids colors, real copy, and component fidelity to stay cheap and fast.

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
npx wireframe-preview install claude       # Claude Code (global ~/.claude/skills/)
npx wireframe-preview install cursor       # Cursor (.cursor/rules/)
npx wireframe-preview install kilocode     # Kilocode (.kilocode/rules/)
npx wireframe-preview install windsurf     # Windsurf (.windsurf/rules/)
npx wireframe-preview install copilot      # GitHub Copilot (.github/copilot-instructions.md)
npx wireframe-preview install codex        # Codex / OpenAI (AGENTS.md)
npx wireframe-preview install gemini       # Gemini CLI (GEMINI.md)
npx wireframe-preview install amp-code     # Amp Code (.amp/rules/)
npx wireframe-preview install --all        # every supported platform
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

The skill writes two files to `.wireframes/<feature-slug>/`:
- `wireframe.html` — open this in your browser
- `wireframe.css` — frozen stylesheet, never edited

---

## What you get

**Screen tabs** — one tab per agreed screen (Members page, Invite modal, Accept screen).

**State tabs** — per screen, only for states that matter (default, empty, error, permission-denied).

**Annotated boxes** — every box that the backend change touches shows two hover annotations:
- `data-backend` — the concrete backend element (column, endpoint, permission)
- `data-ds` — the design-system component mapped from your `design.md`, or a clearly marked guess if no vocabulary exists

**Feedback layer** — click any box in the browser, type a note, hit "Copy feedback block," and paste it back to the agent for precise, element-anchored iteration.

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

## License

MIT
