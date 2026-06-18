/**
 * MCP tool definitions and handlers for wireframe-preview.
 */

import * as store from "./store.js";
import * as preview from "./preview.js";

export const TOOLS = [
  {
    name: "wireframe_open",
    description:
      "Serve a wireframe on localhost and open it in the browser. " +
      "Pass the full WFModel JSON as the model parameter — no files are written to disk. " +
      "Returns the URL. The browser's 'Send to agent' / '✓ Approve' buttons stream " +
      "their block straight back — call wireframe_wait_feedback to receive it.",
    inputSchema: {
      type: "object",
      properties: {
        feature: { type: "string", description: "Feature name or slug." },
        model:   { type: "object", description: "The full WFModel JSON object (with a \"screens\" array)." },
      },
      required: ["feature", "model"],
    },
  },
  {
    name: "wireframe_wait_feedback",
    description:
      "Block until the user sends the next feedback or approval block from the browser, or until timeout. " +
      "Returns the exact structured block text.",
    inputSchema: {
      type: "object",
      properties: {
        feature:   { type: "string" },
        timeoutMs: { type: "number", description: "Max wait in ms (default 600000)." },
      },
      required: ["feature"],
    },
  },
  {
    name: "wireframe_poll_feedback",
    description: "Non-blocking: return any feedback/approval blocks queued since the last call, or empty if none.",
    inputSchema: {
      type: "object",
      properties: { feature: { type: "string" } },
      required: ["feature"],
    },
  },
  {
    name: "wireframe_update",
    description:
      "Push a revised wireframe model to the already-open browser tab. " +
      "Updates the in-memory model and sends a reload signal over WebSocket " +
      "so the browser refreshes automatically. " +
      "Call after applying feedback from wireframe_wait_feedback to close the iteration loop.",
    inputSchema: {
      type: "object",
      properties: {
        feature: { type: "string" },
        model:   { type: "object", description: "The full updated WFModel JSON object." },
      },
      required: ["feature", "model"],
    },
  },
  {
    name: "wireframe_status",
    description: "Return { approved, openComments, url } for a feature.",
    inputSchema: {
      type: "object",
      properties: { feature: { type: "string" } },
      required: ["feature"],
    },
  },
];

function reply(s, isError = false) {
  return { content: [{ type: "text", text: s }], isError };
}

async function handleOpen(slug, args) {
  const result = store.validateModel(args.model);
  if (!result.ok) return reply(result.error, true);

  store.setModel(slug, result.model);
  await preview.start();
  const url = `${preview.getBaseUrl()}/${slug}/wireframe.html`;
  preview.openInBrowser(url);

  return reply(
    `Wireframe open at ${url}\n\n` +
    `Click any box to comment, then hit "Send to agent" (or "✓ Approve") — ` +
    `the block streams back without clipboard paste.\n\n` +
    `Call wireframe_wait_feedback with feature "${slug}" to receive it.`,
  );
}

async function handleWaitFeedback(slug, args) {
  const timeoutMs = typeof args.timeoutMs === "number" ? args.timeoutMs : 600000;
  const block = await store.waitForBlock(slug, timeoutMs);
  return reply(
    block ||
    `(no feedback within ${timeoutMs}ms — wireframe still open; call wireframe_wait_feedback again or ask the user if they're done.)`,
  );
}

function handlePollFeedback(slug) {
  const drained = store.drainQueue(slug);
  return reply(drained.length ? drained.join("\n\n") : "(no pending feedback)");
}

function handleUpdate(slug, args) {
  const f = store.get(slug);
  if (!f.model) return reply(`wireframe_open must be called first for "${slug}".`, true);

  const result = store.validateModel(args.model);
  if (!result.ok) return reply(result.error, true);

  store.setModel(slug, result.model);
  store.broadcast(slug, { type: "reload" });
  const count = f.sockets.size;
  return reply(`Model updated. Reload signal sent to ${count} connected client(s). Browser will refresh automatically.`);
}

function handleStatus(slug) {
  const f = store.get(slug);
  const url = f.model && preview.getBaseUrl() ? `${preview.getBaseUrl()}/${slug}/wireframe.html` : null;
  return reply(JSON.stringify({ approved: f.approved, openComments: f.openComments, url }, null, 2));
}

export async function handleTool(name, args) {
  const slug = store.slugify(args.feature);

  switch (name) {
    case "wireframe_open":          return handleOpen(slug, args);
    case "wireframe_wait_feedback": return handleWaitFeedback(slug, args);
    case "wireframe_poll_feedback": return handlePollFeedback(slug);
    case "wireframe_update":        return handleUpdate(slug, args);
    case "wireframe_status":        return handleStatus(slug);
    default:                        return reply(`Unknown tool: ${name}`, true);
  }
}
