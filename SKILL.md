---
name: wireframe-preview
description: Generate fast, low-fidelity HTML wireframes to preview the UI/UX implications of a feature or change. Use whenever someone describes a feature, backend change, new endpoint, new field, schema change, or user flow and wants to see how the front-end is affected — phrases like "what would the UI look like", "wireframe this", "preview the screens for", "mock up the front-end", or "show me the UX impact". Works for developers, PMs, designers, and QA, with or without a backend defined. Reads an optional shared feature-spec.md (intent, persona, screens, API) and design.md if present, otherwise asks a few quick questions. Produces rough grey boxes showing screen sections, NOT polished or production HTML. Deliberately avoids rich styling, real copy, colors, and component detail to stay cheap and fast. Prefer this over building real UI any time the goal is a quick layout sanity-check rather than a buildable interface.
---

# Wireframe Preview

Turn a described feature or change into a quick, throwaway wireframe so anyone can sanity-check the front-end impact before real UI is built. The whole point is **low fidelity at low cost**: rough boxes labeling what each screen section is, where the new/changed pieces land, and how each box maps back to (a) the feature/backend behavior and (b) the design system. Not a buildable interface.

This skill is for whoever shows up — a developer mid-feature, a PM scoping an idea, a designer thinking through flows, a QA engineer mapping states. It must produce a useful wireframe from a single sentence and a sharper one from a full spec. **Never block on missing input, never require backend knowledge.** Meet the person where they are: gather what's missing in their own language, then preview.

Two situations to serve, equally:
1. **The user knows their screens** and wants to see the layout and where the changed pieces land. Here screens are an *input*.
2. **The user is blank on screens** — they have a feature idea but no mental picture of the surfaces it needs. Here screens are an *output*: proposing the screen breakdown from their intent is the whole point of the tool, not a fallback. Most people react far better to a concrete proposed set ("here are the screens this usually needs — prune what's wrong") than to producing the list cold. Be generous and concrete when proposing.

## What this is NOT

Do not produce production-quality UI. Do not waste tokens on aesthetics. Specifically, you must **never**:

- Write inline `style="..."` attributes (except the two layout helpers shown below: `--cols` on a grid and `margin-top` for spacing). All visual styling lives in the shared `assets/wireframe.css` and is never regenerated or modified.
- Add colors, gradients, shadows, icons, images, fonts, or any decorative CSS.
- Write real or realistic copy. Use short generic labels ("Refund reason field", "User table", "Submit"). Placeholder rows say things like "row" or "—".
- Build real components (no real dropdowns, no working forms, no charts). A chart is a box labeled "Chart". A table is a box labeled "Table (N cols)".
- Pull in any framework, CDN, font, or external resource.

If you catch yourself reaching for fidelity, stop. Boxes, not components.

## Workflow

### 1. Gather the input (read files, then ask only for gaps)

The only things you truly need to start are **the feature intent in one sentence** and **who uses it**. Everything else — screens, states, behaviors, backend details — either comes from optional files, or you propose it and the user reacts. Never make the user produce a screen list cold; that's the work the tool exists to help with.

**Read these files if they exist** (look in `docs/specs/<feature>.md`, the project root, or a `docs/` dir):
- `feature-spec.md` (or `docs/specs/<feature>.md`) — the shared feature spec: intent, persona, screens & states, and optional API surface / auth / field changes / frontend-impact sections. This is the single input contract. It may be authored by hand (a PM filling in intent + persona) or produced by the `feature-spec` skill (which reads a repo and fills the technical sections too). Whatever is present is source of truth; sections may be blank, which just means "propose this for me." The Auth / permissions section, when present, tells you which screens need a permission-denied state. For backward compatibility, also read a legacy `feature.md` or `api.md` if present and no `feature-spec.md` exists.
- `design.md` — component vocabulary (see step 4).

**Then fill gaps by asking — adaptively, in the user's own language.** Detect the persona from how they phrase the request and match it:
- If they talk in endpoints, payloads, and schemas (a developer), you may ask in those terms.
- If they talk in outcomes ("the user issues a refund and sees a confirmation"), ask in outcome terms — never demand API details.
- **If they're blank on screens, do not push them to invent any.** Ask only what the feature is for and who uses it, then move to step 2 and *propose* the screens. A good prompt here is: "Tell me what this feature lets someone do and who does it — I'll propose the screens it probably needs and you can prune from there."
- If there's no backend yet, that's fine — wireframe the intended behavior; backend annotations become guesses (step 4) or are omitted.

Keep elicitation short: a couple of questions at most, targeting only what's missing. If `feature-spec.md` or the prompt already answers something, don't re-ask it. If the spec is rich, ask nothing.

### 2. Propose the screens and states, confirm, then draw

This step is where the tool earns its keep for a blank user — and it's cheap, because pruning a text list costs nothing while pruning rendered HTML wastes a whole generation. So **always confirm the list before drawing.**

From the gathered intent, propose a **concrete, generous** breakdown — the screens and states a feature like this normally needs, named plainly. Don't hedge or offer a thin two-item list; give the real set so the user has something substantial to react to. For each screen, propose the states that matter (default/filled, empty, loading, error, permission-denied) — only the ones this feature actually exercises.

Present it compactly and invite pruning:
> A feature like this usually needs these screens:
> 1. **Members page** — list of teammates, Invite button, pending invites (states: default, empty)
> 2. **Invite modal** — enter emails, send (states: default, error)
> 3. **Invitee accept screen** — what the invited person lands on (states: pending, accepted, expired)
>
> I'll draw these. Want to drop, add, rename, or merge any first?

Wait for approval. Adjust to their edits. Only then proceed to draw (step 3).

**After the list is agreed, always offer to save it.** Write the confirmed intent + persona + screens + states into a `feature-spec.md` (use `docs/specs/<feature>.md`; create if absent, update the Screens & states section if present) so the next run — or any other consumer skill — starts from a real spec instead of a blank session. Phrase it as a quick yes/no; if yes, write the file before or alongside the wireframe. This is what flips the spec from a form-the-user-fills into an artifact-the-skill-captures. Fill only the sections you have; leave API/technical sections blank if there's no backend info.

### 3. Write two linked files to disk

Wireframes are meant to be opened in a browser and edited in place, so write them as files on disk — not inlined, not pasted into chat. Produce **two files** in a predictable location, `./.wireframes/<feature-slug>/`:

- `wireframe.css` — copy `assets/wireframe.css` **verbatim**. This is the frozen stylesheet. You never edit or regenerate it, on this run or any follow-up.
- `wireframe.html` — copy `assets/template.html` as the starting structure. It already links the stylesheet via `<link rel="stylesheet" href="wireframe.css">`, so keep that as-is and just fill in the content.

Keeping the two files separate is deliberate: layout edits during iteration only ever touch `wireframe.html`, while styling stays locked in a file you're instructed never to modify. The user can also hand-edit boxes without risk of disturbing the visual system.

Then fill in `wireframe.html`:

- Fill the **legend** block: feature name, one-line backend change, the approved screen list, and the design-system source (e.g. "from design.md", "detected: MUI", or "generic primitives — no design.md found").
- One **screen tab** per approved screen.
- Within a screen, add **state tabs** only if that screen has more than one relevant state. Single-state screens get no state tabs.
- Lay out each screen with the layout primitives below. Keep it rough — match the real arrangement (sidebar beside content, cards in a grid) but don't fuss over proportions.

If the environment is a chat surface with an inline HTML renderer (no real filesystem the user can browse), fall back to inlining the CSS into a single self-contained `wireframe.html` so it renders standalone. On a coding-agent harness (Claude Code, Antigravity, Kilo, etc.) always prefer the two-file on-disk form.

### 4. Annotate the boxes that the change touches

This is the high-value part. Every box that is **new or modified by the backend change** carries both mappings as data attributes; the shared CSS reveals them on hover:

```html
<div class="wf-box"
     data-backend="refund_reason (new TEXT column); POST /refunds"
     data-ds="TextArea / size md">Refund reason field</div>
```

- `data-backend` — the concrete backend element: new/changed column, endpoint, field, event, permission. Source it from the spec's API surface / field-changes sections if present; otherwise from what the user described. Be specific; this is what makes the wireframe a review tool. If there's genuinely no backend defined yet, describe the intended behavior (e.g. "saves refund reason") or omit the attribute — don't invent endpoint names.
- `data-ds` — the design-system mapping: component name + variant/size, drawn from the user's real vocabulary (see below). Never invent component names silently.

Boxes that are pure layout context (nav, sidebar, unchanged sections) get **no** annotations — keep the signal on what changed. Annotated boxes show a small `·` marker so the user knows to hover.

#### Sourcing the design-system vocabulary (`design.md`)

The `data-ds` mapping is only useful if it uses the names the user's team actually uses. Do not guess from your own knowledge of component libraries. Source the vocabulary in this order:

1. **Read `design.md`.** Look for a `design.md` (or `DESIGN.md`) in the project root or a `docs/` directory. Parse the component vocabulary from it — component names, variants, sizes, states. Constrain every `data-ds` value to names that appear in that file, spelled exactly as written there.
2. **Bootstrap if missing.** If there's no `design.md`, do not fabricate one or silently fall back. Offer the user a choice: "I don't see a `design.md`. I can (a) scan the repo to detect your component library, (b) take a one-line description of your design system from you, or (c) proceed with generic primitives. Whichever you pick, I'll note the vocabulary so I don't ask again." If they give you a vocabulary, write a minimal `design.md` capturing it before generating.
3. **Optional repo detect.** If asked to detect, scan for signals: `package.json` dependencies (e.g. MUI, Chakra, Ant Design, shadcn/ui, Mantine), a `components/` directory, or Storybook config. Use detected component names as the vocabulary. Confirm what you found before relying on it.

The user owns the vocabulary; you own the assignment. The config file guarantees the names are real and correctly spelled — deciding *which* component a box maps to is still your judgment.

#### When no component matches a box: mark it a guess

If a box needs a design-system mapping but nothing in the vocabulary fits (or no vocabulary exists yet), still annotate it with your best generic guess, but **mark it explicitly as a guess** by prefixing the `data-ds` value with `guess: `:

```html
<div class="wf-box"
     data-backend="status enum"
     data-ds="guess: Badge / status">Status pill</div>
```

The shared CSS renders guessed mappings differently on hover (amber, with a "guess" prefix) so the user can see at a glance which mappings are grounded in their `design.md` and which are Claude filling a gap. Never pass off a guess as a confirmed mapping.

### 5. Open the preview, then iterate on the HTML

After writing the files, give the user the path to `wireframe.html` and offer to open it in their browser. Mention they can **click any box to leave a comment, then hit "Copy feedback block" and paste it back** for precise, element-anchored changes. If the harness can run shell commands, open it directly with the platform-appropriate command:

- macOS: `open .wireframes/<feature-slug>/wireframe.html`
- Linux: `xdg-open .wireframes/<feature-slug>/wireframe.html`
- Windows: `start .wireframes/<feature-slug>/wireframe.html`

Then treat the wireframe as a living file. Follow-up requests ("make the sidebar narrower", "drop the empty state", "that field should be a Select not a TextArea", "add a loading state") are **edits to `wireframe.html` only** — change the boxes, classes, tabs, or annotations in place and tell the user to refresh the browser. Never touch `wireframe.css`: width, spacing, and emphasis are all expressible through the existing layout primitives (`.wf-fill1/2/3`, `.wf-sidebar`, `.wf-tall`, `.wf-shaded`, the `--cols` grid value, and the one permitted `margin-top` inline style). If a request seems to need new styling, it almost certainly maps to an existing primitive — reach for those, not new CSS.

This write → open → tweak loop is the core of how the skill is used on a coding-agent harness. Keep edits surgical and the file readable so the user can also hand-edit boxes themselves.

#### Consuming a pasted feedback block

The wireframe has a built-in comment layer: the user clicks boxes in the browser, types notes, and copies a structured **feedback block** to paste back to you. When you receive a block delimited by `===== WIREFRAME FEEDBACK: <feature> =====` ... `===== END FEEDBACK (N items) =====`, treat it as a strict instruction set, not a loose suggestion:

- **Apply only the listed items. Change nothing else.** The block says this explicitly; honor it. Do not "improve" adjacent boxes, restyle, or touch screens/states not named. Unrequested changes are the main failure mode here.
- **Match each item by its `#wf-id`**, not by the label. The id is stamped on the box as `data-wf-id` and is stable across relabeling; the `label="..."` is only for human reference and may be stale. Find `<div class="wf-box" data-wf-id="wf-3" ...>` and edit that element.
- **Respect the `screen=` and `state=` scope.** Edit the box only within the named screen panel and state panel — the same `data-wf-id` should be unique, but the scope tells you which rendered context the user was looking at.
- **Verify the count.** The footer states `(N items)`. Parse exactly N items; if you see fewer or more, say so rather than guessing — the paste may have been truncated.
- **Confirm what you did.** After editing, report "applied N of N" and list each id with the change made, so a dropped or misread item is visible to the user. If an id no longer exists (the box was removed in a prior edit), flag it instead of silently skipping.

This block is the precise feedback channel; without it the user can only describe changes vaguely. Trust its structure and stay strictly within its scope.

## Layout primitives (the only classes you use)

Structure:
- `.wf-row` — horizontal flex row. `.wf-col` — vertical stack (use inside a row for a content column).
- `.wf-grid` with `style="--cols:N"` — N-column grid (cards, tiles).
- `.wf-fill1/2/3` — relative width weighting inside a row.

Boxes:
- `.wf-box` — the base dashed box. Add `.solid` for emphasis, `.shaded` for a filled-looking region.
- `.wf-nav` — full-width top bar. `.wf-sidebar` — fixed-width side column.
- `.wf-tall` / `.wf-taller` — taller boxes for content regions, charts, tables.
- `.wf-placeholder` — muted italic text for empty/error placeholder copy.

Spacing between stacked rows: `style="margin-top:12px"` is the one permitted inline style.

## Examples

**Example A — developer, full input.** `feature-spec.md` (with API surface filled) and `design.md` both exist.
Input: "Wireframe the refund flow."
- Step 1: read both files; nothing missing, so ask nothing.
- Step 2 confirm: "Feature: admins issue refunds, customers see confirmation. Screens: Admin refund form (default, error), Customer confirmation, Admin order list (adds Refunded badge). Drawing these — adjust?"
- Steps 3–5: write `.wireframes/refund-flow/wireframe.html` linking `wireframe.css`, three screen tabs, state tabs only on the admin form, refund field + submit annotated from the spec's API surface and `design.md`, unchanged nav/sidebar left plain. Open it. "Make the reason a Select" → edit that one box's `data-ds` and label, refresh.

**Example B — PM, blank on screens, no files.** No `feature-spec.md`, no `design.md`.
Input: "Show me what the screens look like for letting users invite teammates."
- Step 1: no files to read. The PM has intent but no screen model, so ask only the essentials in plain language: "What does this let someone do, and who does it?" Don't ask them to list screens or states.
- Step 2 propose + confirm: "A feature like this usually needs: 1) **Members page** — teammate list, Invite button, pending invites (default, empty); 2) **Invite modal** — enter emails, send (default, error); 3) **Invitee accept screen** — what the invited person lands on (pending, accepted, expired). I'll draw these — drop, add, rename, or merge any first?" The PM reacts to the concrete list rather than producing one.
- After they approve (say they drop the expired state), offer: "Want me to save this to docs/specs/invite-teammates.md so it's ready next time and other tools can use it?"
- Steps 3–5: wireframe the agreed set. `data-backend` annotations describe intended behavior ("sends invite", "marks invite accepted") since no endpoints are defined; `data-ds` mappings are guesses (amber) because there's no `design.md`.

## Keep it cheap
The token budget is the constraint. A screen is a handful of boxes, not a layout study. When in doubt, fewer boxes, shorter labels, no extra states. The user can always ask for more detail on one screen — start lean.
