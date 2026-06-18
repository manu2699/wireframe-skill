// End-to-end smoke test for the wireframe-preview MCP server.
// Spins the server over stdio, opens a wireframe with an in-memory model,
// simulates the browser pushing a feedback block over WS, and asserts the
// agent receives it via MCP — no paste, no disk.
import assert from "assert";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { WebSocket } from "ws";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const TEST_MODEL = {
  feature: "Test Feature",
  change: "smoke test wireframe",
  screens: [
    {
      id: "s1", name: "Screen 1",
      states: [
        { id: "default", name: "Default", nodes: [
          { type: "box", kind: "kpi", label: "Total users", backend: "GET /users/count" },
          { type: "box", kind: "chart:bars", label: "Revenue by month" },
        ]},
      ],
    },
  ],
};

const transport = new StdioClientTransport({
  command: "node",
  args: [path.join(root, "mcp", "server.js")],
  env: { ...process.env, WF_NO_OPEN: "1" },
});
const client = new Client({ name: "smoke", version: "1.0.0" }, { capabilities: {} });
await client.connect(transport);

// 1. tool list
const tools = (await client.listTools()).tools.map((t) => t.name).sort();
assert.deepStrictEqual(tools, [
  "wireframe_open",
  "wireframe_poll_feedback",
  "wireframe_status",
  "wireframe_update",
  "wireframe_wait_feedback",
], "tool list");
console.log("✓ tools listed:", tools.join(", "));

// 2. open with model → URL
const open = await client.callTool({
  name: "wireframe_open",
  arguments: { feature: "Test Feature", model: TEST_MODEL },
});
const url = open.content[0].text.match(/http:\/\/[^\s]+/)[0];
assert.ok(url.includes("/test-feature/wireframe.html"), "url slug");
console.log("✓ wireframe_open →", url);

// 3. served HTML carries WS bootstrap + inlined model + app bundle
const html = await (await fetch(url)).text();
assert.ok(html.includes("window.__wfSend"), "injected WS sender present");
assert.ok(html.includes('id="wf-model"'), "inlined model present");
assert.ok(html.includes("Total users"), "model content served");
assert.ok(html.includes("Revenue by month"), "model content served (2)");
assert.ok(html.includes("wireframe-app.js"), "app bundle script tag present");
console.log("✓ served HTML has WS bootstrap + inlined model + app tag");

// 3b. frozen assets served from package dir
const cssRes = await fetch(url.replace("/wireframe.html", "/wireframe.css"));
assert.strictEqual(cssRes.status, 200, "CSS served 200");
assert.ok((await cssRes.text()).length > 1000, "CSS non-empty");

const jsRes = await fetch(url.replace("/wireframe.html", "/wireframe-app.js"));
assert.strictEqual(jsRes.status, 200, "JS served 200");
assert.ok((await jsRes.text()).length > 1000, "JS non-empty");
console.log("✓ wireframe.css + wireframe-app.js served from package");

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

// 6. wireframe_update → model changes reflected in served HTML
const UPDATED_MODEL = { ...TEST_MODEL, screens: [
  { id: "s1", name: "Screen 1", states: [
    { id: "default", name: "Default", nodes: [
      { type: "box", kind: "kpi", label: "Active sessions" },
    ]},
  ]},
]};
const updateResult = await client.callTool({
  name: "wireframe_update",
  arguments: { feature: "Test Feature", model: UPDATED_MODEL },
});
assert.ok(updateResult.content[0].text.includes("Model updated"), "update success");
const updatedHtml = await (await fetch(url)).text();
assert.ok(updatedHtml.includes("Active sessions"), "updated model served");
assert.ok(!updatedHtml.includes("Total users"), "old model replaced");
console.log("✓ wireframe_update → model updated in-memory, new HTML served");

// 7. approval flips status
const approveBlock = [
  "===== WIREFRAME APPROVED: Test Feature =====",
  "Screens: Screen 1",
  "No open comments.",
  "===== END APPROVAL (1 mapped boxes, 0 open comments) =====",
].join("\n");
ws.send(JSON.stringify({ feature: "test-feature", block: approveBlock }));
await new Promise((r) => setTimeout(r, 150));
const status = JSON.parse((await client.callTool({ name: "wireframe_status", arguments: { feature: "Test Feature" } })).content[0].text);
assert.strictEqual(status.approved, true, "approved flag");
assert.strictEqual(status.openComments, 0, "open comments");
assert.ok(status.url.includes("/test-feature/wireframe.html"), "status url");
console.log("✓ wireframe_status approved:", JSON.stringify(status));

ws.close();
await client.close();
console.log("\nALL PASS");
process.exit(0);
