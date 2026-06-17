#!/usr/bin/env node
/**
 * wireframe-preview MCP server.
 *
 * Closes the wireframe feedback loop without the clipboard paste step:
 *   - serves an already-generated .wireframes/<slug>/ over localhost,
 *   - injects a tiny WebSocket sender into the served wireframe.html so the
 *     existing "Copy feedback" / "✓ Approve" buttons ALSO push their block to
 *     this server (clipboard stays as the offline fallback),
 *   - exposes MCP tools so the agent reads those blocks directly.
 */

import fs from "fs";
import path from "path";
import http from "http";
import { exec } from "child_process";
import { fileURLToPath } from "url";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { WebSocketServer } from "ws";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, "..", "assets");
const PKG_VERSION = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")).version;

// ── Feature registry ─────────────────────────────────────────────────────────
// slug → { dir, queue:[block], waiters:[resolve], approved:bool, openComments:int }
const features = new Map();

function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "wireframe";
}

function getFeature(slug) {
  let f = features.get(slug);
  if (!f) {
    f = { dir: null, queue: [], waiters: [], approved: false, openComments: 0 };
    features.set(slug, f);
  }
  return f;
}

// A browser pushed a block. Classify it, update status, hand to a waiter or queue.
function ingestBlock(slug, block) {
  const f = getFeature(slug);
  if (/^=====\s*WIREFRAME APPROVED/m.test(block)) {
    f.approved = true;
    const m = block.match(/(\d+)\s+open comment/);
    if (m) f.openComments = parseInt(m[1], 10);
  } else if (/^=====\s*WIREFRAME FEEDBACK/m.test(block)) {
    const m = block.match(/END FEEDBACK \((\d+)\s+item/);
    if (m) f.openComments = parseInt(m[1], 10);
  }
  const waiter = f.waiters.shift();
  if (waiter) waiter(block);
  else f.queue.push(block);
}

// ── HTTP + WebSocket server ───────────────────────────────────────────────────
let httpServer = null;
let wss = null;
let baseUrl = null;

function wsBootstrap(slug) {
  return `
<script>
(function () {
  var slug = ${JSON.stringify(slug)};
  var ws, ready = false, backlog = [];
  function connect() {
    try {
      ws = new WebSocket("ws://" + location.host + "/ws?feature=" + encodeURIComponent(slug));
    } catch (e) { return; }
    ws.onopen = function () {
      ready = true;
      while (backlog.length) ws.send(backlog.shift());
      if (window.__wfOnConnect) window.__wfOnConnect();
    };
    ws.onclose = function () {
      ready = false;
      setTimeout(connect, 1500);
      if (window.__wfOnDisconnect) window.__wfOnDisconnect();
    };
    ws.onerror = function () { try { ws.close(); } catch (e) {} };
  }
  connect();
  window.__wfSend = function (block) {
    var msg = JSON.stringify({ feature: slug, block: block });
    if (ready) ws.send(msg); else backlog.push(msg);
    // Flash "Sent to agent" confirmation (fallback if template hook not present)
    var t = document.getElementById("__wf-sent");
    if (!t) {
      t = document.createElement("div");
      t.id = "__wf-sent";
      t.style.cssText = "position:fixed;bottom:80px;right:20px;z-index:2000;" +
        "background:#16a34a;color:#fff;font:500 12px/1 -apple-system,sans-serif;" +
        "padding:8px 14px;border-radius:999px;box-shadow:0 4px 14px rgba(22,163,74,.3);" +
        "opacity:0;transition:opacity .15s ease;";
      document.body.appendChild(t);
    }
    t.textContent = "Sent to agent ✓";
    t.style.opacity = "1";
    clearTimeout(window.__wfSentT);
    window.__wfSentT = setTimeout(function () { t.style.opacity = "0"; }, 1800);
  };
})();
<\/script>`;
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
};

function startHttp() {
  if (httpServer) return Promise.resolve();
  return new Promise((resolve) => {
    httpServer = http.createServer((req, res) => {
      const url = new URL(req.url, "http://localhost");
      const pathname = url.pathname;
      const parts = pathname.split("/").filter(Boolean); // [slug, file?]
      const slug = parts[0];
      const f = slug && features.get(slug);

      if (!f || !f.dir) {
        res.writeHead(404).end("Unknown wireframe");
        return;
      }

      // Serve files from the wireframe dir, injecting WS bootstrap into HTML.
      const file = parts[1] || "wireframe.html";
      const filePath = path.join(f.dir, path.basename(file));
      if (!filePath.startsWith(f.dir) || !fs.existsSync(filePath)) {
        res.writeHead(404).end("Not found");
        return;
      }
      const ext = path.extname(filePath);
      let body = fs.readFileSync(filePath);
      if (ext === ".html") {
        let html = body.toString("utf8");
        const boot = wsBootstrap(slug);
        html = html.includes("</body>")
          ? html.replace("</body>", boot + "\n</body>")
          : html + boot;
        body = Buffer.from(html, "utf8");
      }
      res.writeHead(200, { "content-type": MIME[ext] || "application/octet-stream" });
      res.end(body);
    });

    wss = new WebSocketServer({ server: httpServer, path: "/ws" });
    wss.on("connection", (socket, req) => {
      const slug = new URL(req.url, "http://localhost").searchParams.get("feature");
      socket.on("message", (data) => {
        let parsed;
        try { parsed = JSON.parse(data.toString()); } catch (e) { return; }
        const fslug = parsed.feature || slug;
        if (fslug && typeof parsed.block === "string") ingestBlock(fslug, parsed.block);
      });
    });

    const port = process.env.WF_PORT ? parseInt(process.env.WF_PORT, 10) : 0;
    httpServer.listen(port, "127.0.0.1", () => {
      const { port } = httpServer.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
}

function openInBrowser(url) {
  if (process.env.WF_NO_OPEN) return;
  const cmd =
    process.platform === "darwin" ? `open "${url}"` :
    process.platform === "win32"  ? `start "" "${url}"` :
                                    `xdg-open "${url}"`;
  exec(cmd, () => {});
}

// Copy the frozen assets (stylesheet + built React app bundle) into the
// wireframe dir if absent, so the agent only authors wireframe.html (the model).
function ensureAssets(dir) {
  const copies = [
    ["wireframe.css", path.join(ASSETS_DIR, "wireframe.css")],
    ["wireframe-app.js", path.join(ASSETS_DIR, "dist", "wireframe-app.js")],
  ];
  for (const [name, src] of copies) {
    const dest = path.join(dir, name);
    if (!fs.existsSync(dest) && fs.existsSync(src)) fs.copyFileSync(src, dest);
  }
}

function serveStatic(res, filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404).end("Not found");
    return;
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { "content-type": MIME[ext] || "application/octet-stream" });
  res.end(fs.readFileSync(filePath));
}

// ── MCP tools ─────────────────────────────────────────────────────────────────
const TOOLS = [
  {
    name: "wireframe_open",
    description:
      "Serve an already-written .wireframes/<feature>/ wireframe on localhost and open it in the browser. " +
      "Returns the URL. The browser's 'Send to agent' / 'Copy feedback' / '✓ Approve' buttons then stream " +
      "their block straight back to you — call wireframe_wait_feedback to receive it (no clipboard paste needed).",
    inputSchema: {
      type: "object",
      properties: {
        feature: { type: "string", description: "Feature name or slug (matches the .wireframes/<slug>/ folder)." },
        dir:     { type: "string", description: "Project root that contains .wireframes/. Defaults to cwd." },
      },
      required: ["feature"],
    },
  },
  {
    name: "wireframe_wait_feedback",
    description:
      "Block until the user sends the next feedback or approval block from the browser, or until timeout. " +
      "Returns the exact structured block text (===== WIREFRAME FEEDBACK … ===== / ===== WIREFRAME APPROVED … =====).",
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
    name: "wireframe_status",
    description: "Return { approved, openComments, url } for a feature.",
    inputSchema: {
      type: "object",
      properties: { feature: { type: "string" } },
      required: ["feature"],
    },
  },
];

const server = new Server(
  { name: "wireframe-preview", version: PKG_VERSION },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;
  const slug = slugify(args.feature);

  if (name === "wireframe_open") {
    const root = args.dir || process.cwd();
    const dir  = path.join(root, ".wireframes", slug);
    if (!fs.existsSync(dir)) {
      return text(
        `No wireframe found at ${dir}.\n` +
        `Write wireframe.html (and wireframe.css) there first — e.g. via the wireframe-preview skill — then call wireframe_open again.`,
        true,
      );
    }
    ensureAssets(dir);
    const f = getFeature(slug);
    f.dir = dir;
    await startHttp();
    const url = `${baseUrl}/${slug}/wireframe.html`;
    openInBrowser(url);
    return text(
      `Wireframe open at ${url}\n\n` +
      `Click any box to comment, then hit "Send to agent" (or "✓ Approve") — ` +
      `the block streams back without clipboard paste.\n\n` +
      `Call wireframe_wait_feedback with feature "${slug}" to receive it.`,
    );
  }

  if (name === "wireframe_wait_feedback") {
    const f = getFeature(slug);
    if (f.queue.length) return text(f.queue.shift());
    const timeoutMs = typeof args.timeoutMs === "number" ? args.timeoutMs : 600000;
    const block = await new Promise((resolve) => {
      const onBlock = (b) => { clearTimeout(timer); resolve(b); };
      const timer = setTimeout(() => {
        const i = f.waiters.indexOf(onBlock);
        if (i !== -1) f.waiters.splice(i, 1);
        resolve(null);
      }, timeoutMs);
      f.waiters.push(onBlock);
    });
    return text(
      block ||
      `(no feedback within ${timeoutMs}ms — wireframe still open; call wireframe_wait_feedback again or ask the user if they're done.)`,
    );
  }

  if (name === "wireframe_poll_feedback") {
    const f = getFeature(slug);
    const drained = f.queue.splice(0);
    return text(drained.length ? drained.join("\n\n") : "(no pending feedback)");
  }

  if (name === "wireframe_status") {
    const f   = getFeature(slug);
    const url = f.dir && baseUrl ? `${baseUrl}/${slug}/wireframe.html` : null;
    return text(JSON.stringify({ approved: f.approved, openComments: f.openComments, url }, null, 2));
  }

  return text(`Unknown tool: ${name}`, true);
});

function text(s, isError = false) {
  return { content: [{ type: "text", text: s }], isError };
}

const transport = new StdioServerTransport();
await server.connect(transport);
