// Boots the MCP server, opens a demo wireframe, prints the URL, and stays alive
// so a browser can verify rendering + the live WS feedback toast.
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const proj = fs.mkdtempSync(path.join(os.tmpdir(), "wf-demo-"));
const wfDir = path.join(proj, ".wireframes", "demo");
fs.mkdirSync(wfDir, { recursive: true });
fs.copyFileSync(path.join(root, "assets", "template.html"), path.join(wfDir, "wireframe.html"));
fs.copyFileSync(path.join(root, "assets", "wireframe.css"), path.join(wfDir, "wireframe.css"));

const transport = new StdioClientTransport({
  command: "node",
  args: [path.join(root, "mcp", "server.js")],
  cwd: proj,
  env: { ...process.env, WF_NO_OPEN: "1", WF_PORT: process.env.WF_PORT || "5199" },
});
const client = new Client({ name: "demo", version: "1.0.0" }, { capabilities: {} });
await client.connect(transport);
const open = await client.callTool({ name: "wireframe_open", arguments: { feature: "demo" } });
console.log("URL:", open.content[0].text.match(/http:\/\/[^\s]+/)[0]);
// keep alive
setInterval(() => {}, 1 << 30);
