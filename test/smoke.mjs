// End-to-end smoke test for the wireframe-preview MCP server.
// Spins the server over stdio, opens a wireframe, simulates the browser pushing
// a feedback block over WS, and asserts the agent receives it via MCP — no paste.
import fs from "fs";
import os from "os";
import path from "path";
import assert from "assert";
import { fileURLToPath } from "url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { WebSocket } from "ws";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

// 1. temp project with a generated wireframe
const proj = fs.mkdtempSync(path.join(os.tmpdir(), "wf-smoke-"));
const wfDir = path.join(proj, ".wireframes", "test-feature");
fs.mkdirSync(wfDir, { recursive: true });
fs.copyFileSync(path.join(root, "assets", "template.html"), path.join(wfDir, "wireframe.html"));
fs.copyFileSync(path.join(root, "assets", "wireframe.css"), path.join(wfDir, "wireframe.css"));

const transport = new StdioClientTransport({
  command: "node",
  args: [path.join(root, "mcp", "server.js")],
  cwd: proj,
  env: { ...process.env, WF_NO_OPEN: "1" },
});
const client = new Client({ name: "smoke", version: "1.0.0" }, { capabilities: {} });
await client.connect(transport);

const tools = (await client.listTools()).tools.map((t) => t.name).sort();
assert.deepStrictEqual(tools, [
  "wireframe_open",
  "wireframe_poll_feedback",
  "wireframe_status",
  "wireframe_wait_feedback",
], "tool list");
console.log("✓ tools listed:", tools.join(", "));

// 2. open → URL
const open = await client.callTool({ name: "wireframe_open", arguments: { feature: "Test Feature" } });
const url = open.content[0].text.match(/http:\/\/[^\s]+/)[0];
assert.ok(url.includes("/test-feature/wireframe.html"), "url slug");
console.log("✓ wireframe_open →", url);

// 3. served HTML carries the injected WS bootstrap + the inlined model + app bundle
const html = await (await fetch(url)).text();
assert.ok(html.includes("window.__wfSend"), "injected WS sender present");
assert.ok(html.includes('id="wf-model"'), "inlined model present");
assert.ok(html.includes("Recovery vs mandate"), "wireframe model content served");
assert.ok(html.includes("wireframe-app.js"), "app bundle script tag present");
assert.ok(html.includes("__wf-sent") || html.includes("WebSocket"), "ws bootstrap present");
console.log("✓ served HTML has WS bootstrap + inlined model + app tag");

// 3b. the built Solid bundle is auto-copied into the wireframe dir and served
assert.ok(fs.existsSync(path.join(wfDir, "wireframe-app.js")), "app bundle copied into wireframe dir");
const appJs = await fetch(url.replace("/wireframe.html", "/wireframe-app.js"));
assert.strictEqual(appJs.status, 200, "app bundle served 200");
assert.ok((await appJs.text()).length > 1000, "app bundle non-empty");
console.log("✓ wireframe-app.js auto-copied + served");

// 4. simulate browser pushing a feedback block over WS
const origin = url.slice(0, url.indexOf("/test-feature"));
const wsUrl = origin.replace("http://", "ws://") + "/ws?feature=test-feature";
const feedbackBlock = [
  "===== WIREFRAME FEEDBACK: Test Feature =====",
  "Apply ONLY these changes.",
  "",
  '[#wf-3] label="Refund reason field" | screen="Screen 1" | state="default"',
  "  → make this a Select",
  "",
  "===== END FEEDBACK (1 item) =====",
].join("\n");

const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => { ws.on("open", res); ws.on("error", rej); });

// 5. agent waits; browser sends; agent receives the identical block
const waitP = client.callTool({ name: "wireframe_wait_feedback", arguments: { feature: "Test Feature", timeoutMs: 5000 } });
await new Promise((r) => setTimeout(r, 100));
ws.send(JSON.stringify({ feature: "test-feature", block: feedbackBlock }));
const got = (await waitP).content[0].text;
assert.strictEqual(got, feedbackBlock, "received block matches sent block");
console.log("✓ wireframe_wait_feedback returned the exact block (no paste)");

// 6. approval flips status
const approveBlock = [
  "===== WIREFRAME APPROVED: Test Feature =====",
  "Screens: Screen 1, Screen 2",
  "No open comments.",
  "===== END APPROVAL (3 mapped boxes, 0 open comments) =====",
].join("\n");
ws.send(JSON.stringify({ feature: "test-feature", block: approveBlock }));
await new Promise((r) => setTimeout(r, 150));
const status = JSON.parse((await client.callTool({ name: "wireframe_status", arguments: { feature: "Test Feature" } })).content[0].text);
assert.strictEqual(status.approved, true, "approved flag");
assert.strictEqual(status.openComments, 0, "open comments");
console.log("✓ wireframe_status approved:", JSON.stringify(status));

ws.close();
await client.close();
fs.rmSync(proj, { recursive: true, force: true });
console.log("\nALL PASS");
process.exit(0);
