/**
 * PreviewServer — HTTP + WebSocket server for browser preview.
 *
 * Serves wireframes dynamically from in-memory models (no disk I/O).
 * Frozen assets (CSS, JS) are cached from the package's assets/ directory.
 */

import fs from "fs";
import path from "path";
import http from "http";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import * as store from "./store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, "..", "assets");

const TEMPLATE_HTML = fs.readFileSync(path.join(ASSETS_DIR, "template.html"), "utf8");
const CACHED_CSS = fs.readFileSync(path.join(ASSETS_DIR, "wireframe.css"));
const CACHED_JS = fs.readFileSync(path.join(ASSETS_DIR, "dist", "wireframe-app.js"));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
};

let httpServer = null;
let wss = null;
let baseUrl = null;

export function getBaseUrl() {
  return baseUrl;
}

function wsBootstrap(slug) {
  return `
<script>
(function () {
  var slug = ${JSON.stringify(slug)};
  var ws, ready = false, delay = 1500;
  var BKEY = 'wf-bl-' + slug;
  function getLs() { try { return JSON.parse(localStorage.getItem(BKEY)||'[]'); } catch(e){ return []; } }
  function setLs(b) { try { localStorage.setItem(BKEY, JSON.stringify(b)); } catch(e){} }
  function connect() {
    try {
      ws = new WebSocket("ws://" + location.host + "/ws?feature=" + encodeURIComponent(slug));
    } catch (e) { return; }
    ws.onopen = function () {
      ready = true;
      delay = 1500;
      var bl = getLs(); localStorage.removeItem(BKEY);
      while (bl.length) ws.send(bl.shift());
      if (window.__wfOnConnect) window.__wfOnConnect();
    };
    ws.onclose = function () {
      ready = false;
      setTimeout(connect, delay);
      delay = Math.min(delay * 2, 30000);
      if (window.__wfOnDisconnect) window.__wfOnDisconnect();
    };
    ws.onerror = function () { try { ws.close(); } catch (e) {} };
    ws.onmessage = function (e) {
      try {
        var msg = JSON.parse(e.data);
        if (msg.type === "reload") window.location.reload();
      } catch (ex) {}
    };
  }
  connect();
  window.__wfSend = function (block) {
    var msg = JSON.stringify({ feature: slug, block: block });
    if (ready) ws.send(msg); else setLs([].concat(getLs(), [msg]));
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
    t.textContent = "Sent to agent \\u2713";
    t.style.opacity = "1";
    clearTimeout(window.__wfSentT);
    window.__wfSentT = setTimeout(function () { t.style.opacity = "0"; }, 1800);
  };
})();
<\\/script>`;
}

function composeHtml(slug) {
  const f = store.get(slug);
  if (!f.model) return null;

  let html = TEMPLATE_HTML.replace(
    /(<script[^>]+id="wf-model"[^>]*>)([\s\S]*?)(<\/script>)/,
    `$1\n${JSON.stringify(f.model, null, 2)}\n$3`,
  );
  const boot = wsBootstrap(slug);
  html = html.includes("</body>")
    ? html.replace("</body>", boot + "\n</body>")
    : html + boot;
  return html;
}

function handleRequest(req, res) {
  const url = new URL(req.url, "http://localhost");
  const parts = url.pathname.split("/").filter(Boolean);
  const slug = parts[0];
  const f = slug && store.get(slug);

  if (!f || !f.model) {
    const waiting = `<!doctype html><html><head><meta charset="utf-8"><title>Wireframe</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#71717a;background:#f4f4f5}
@keyframes s{to{transform:rotate(360deg)}}</style></head><body>
<svg width="20" height="20" viewBox="0 0 20 20" style="animation:s .8s linear infinite"><circle cx="10" cy="10" r="8" fill="none" stroke="#d4d4d8" stroke-width="2"/><path d="M10 2a8 8 0 0 1 8 8" fill="none" stroke="#3f3f46" stroke-width="2" stroke-linecap="round"/></svg>
<div style="font-size:13px;font-weight:500">Waiting for wireframe model…</div>
<div style="font-size:11px;color:#a1a1aa">The agent is building the wireframe. This page will refresh automatically.</div>
<script>setTimeout(function(){location.reload()},2000)</script></body></html>`;
    res.writeHead(200, { "content-type": MIME[".html"] }).end(waiting);
    return;
  }

  const file = parts[1] || "wireframe.html";

  if (file === "wireframe.html") {
    const html = composeHtml(slug);
    res.writeHead(200, { "content-type": MIME[".html"], "cache-control": "no-store" }).end(html);
    return;
  }
  if (file === "wireframe.css") {
    res.writeHead(200, { "content-type": MIME[".css"] }).end(CACHED_CSS);
    return;
  }
  if (file === "wireframe-app.js") {
    res.writeHead(200, { "content-type": MIME[".js"] }).end(CACHED_JS);
    return;
  }

  res.writeHead(404).end("Not found");
}

function handleWsConnection(socket, req) {
  socket.isAlive = true;
  socket.on("pong", () => { socket.isAlive = true; });

  const slug = new URL(req.url, "http://localhost").searchParams.get("feature");
  if (slug) {
    const f = store.get(slug);
    f.sockets.add(socket);
    socket.on("close", () => f.sockets.delete(socket));
  }
  socket.on("message", (data) => {
    let parsed;
    try { parsed = JSON.parse(data.toString()); } catch (_) { return; }
    const fslug = parsed.feature || slug;
    if (fslug && typeof parsed.block === "string") store.ingestBlock(fslug, parsed.block);
  });
}

export function start() {
  if (httpServer) return Promise.resolve();
  return new Promise((resolve) => {
    httpServer = http.createServer(handleRequest);
    wss = new WebSocketServer({ server: httpServer, path: "/ws" });
    wss.on("connection", handleWsConnection);

    const heartbeat = setInterval(() => {
      wss.clients.forEach((ws) => {
        if (!ws.isAlive) { ws.terminate(); return; }
        ws.isAlive = false;
        ws.ping();
      });
    }, 25000);
    httpServer.on("close", () => clearInterval(heartbeat));

    const port = process.env.WF_PORT ? parseInt(process.env.WF_PORT, 10) : 0;
    httpServer.listen(port, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${httpServer.address().port}`;
      resolve();
    });
  });
}

export function openInBrowser(url) {
  if (process.env.WF_NO_OPEN) return;
  const cmd =
    process.platform === "darwin" ? `open "${url}"` :
    process.platform === "win32"  ? `start "" "${url}"` :
                                    `xdg-open "${url}"`;
  exec(cmd, () => {});
}
