// Phase 3: `wireframe-preview mcp` cross-harness registration.
import fs from "fs";
import os from "os";
import path from "path";
import assert from "assert";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const CLI = path.join(root, "bin", "cli.js");

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "wf-cli-"));
}
function run(args, cwd, extraEnv = {}) {
  return execFileSync("node", [CLI, ...args], {
    cwd,
    env: { ...process.env, HOME: cwd, USERPROFILE: cwd, ...extraEnv },
    encoding: "utf8",
  });
}
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

// 1. register cursor → .cursor/mcp.json
let d = tmp();
run(["mcp", "cursor"], d);
let cfg = path.join(d, ".cursor", "mcp.json");
let obj = readJson(cfg);
assert.ok(obj.mcpServers["wireframe-preview"].args.includes("serve"), "cursor registered");
console.log("✓ mcp cursor → .cursor/mcp.json with wireframe-mcp");

// 2. idempotent rerun → byte-identical + "already registered"
const before = fs.readFileSync(cfg, "utf8");
const out2 = run(["mcp", "cursor"], d);
assert.strictEqual(fs.readFileSync(cfg, "utf8"), before, "idempotent: file unchanged");
assert.ok(/already registered/.test(out2), "idempotent: message");
console.log("✓ rerun is idempotent");

// 3. preserve a user server + write .bak
d = tmp();
fs.mkdirSync(path.join(d, ".cursor"), { recursive: true });
cfg = path.join(d, ".cursor", "mcp.json");
fs.writeFileSync(cfg, JSON.stringify({ mcpServers: { other: { command: "x" } } }, null, 2));
run(["mcp", "cursor"], d);
obj = readJson(cfg);
assert.ok(obj.mcpServers.other, "preserved user server");
assert.ok(obj.mcpServers["wireframe-preview"], "added our server");
assert.ok(fs.existsSync(cfg + ".bak"), "wrote .bak");
console.log("✓ preserves existing servers + writes .bak");

// 4. JSONC comment → safety valve: file untouched, snippet printed
d = tmp();
fs.mkdirSync(path.join(d, ".cursor"), { recursive: true });
cfg = path.join(d, ".cursor", "mcp.json");
const commented = '{\n  // my servers\n  "mcpServers": {}\n}';
fs.writeFileSync(cfg, commented);
const out4 = run(["mcp", "cursor"], d);
assert.strictEqual(fs.readFileSync(cfg, "utf8"), commented, "commented config untouched");
assert.ok(/comments/.test(out4) && /add this MCP server manually/.test(out4), "printed snippet");
console.log("✓ JSONC comments → prints snippet, never clobbers");

// 5. vscode uses "servers" key, not "mcpServers"
d = tmp();
run(["mcp", "vscode"], d);
obj = readJson(path.join(d, ".vscode", "mcp.json"));
assert.ok(obj.servers && obj.servers["wireframe-preview"], "vscode uses servers key");
assert.ok(!obj.mcpServers, "vscode has no mcpServers key");
console.log("✓ mcp vscode → .vscode/mcp.json with `servers` key");

// 5.5 copilot / github uses "mcpServers" key in ~/.copilot/mcp-config.json
d = tmp();
run(["mcp", "copilot"], d);
obj = readJson(path.join(d, ".copilot", "mcp-config.json"));
assert.ok(obj.mcpServers && obj.mcpServers["wireframe-preview"], "copilot uses mcpServers key");
console.log("✓ mcp copilot → ~/.copilot/mcp-config.json with `mcpServers` key");

// 6. codex is print-only (TOML) — writes nothing
d = tmp();
const out6 = run(["mcp", "codex"], d);
assert.ok(!fs.existsSync(path.join(d, ".codex", "config.toml")), "codex: no file written");
assert.ok(/\[mcp_servers\.wireframe-preview\]/.test(out6), "codex: TOML snippet printed");
console.log("✓ mcp codex → prints TOML, writes nothing");

// 7. --print never writes
d = tmp();
const out7 = run(["mcp", "--print", "cursor"], d);
assert.ok(!fs.existsSync(path.join(d, ".cursor", "mcp.json")), "--print: no file written");
assert.ok(/"wireframe-preview"/.test(out7), "--print: snippet printed");
console.log("✓ mcp --print cursor → prints, writes nothing");

// 8. --remove deletes only our key, leaves others
d = tmp();
fs.mkdirSync(path.join(d, ".cursor"), { recursive: true });
cfg = path.join(d, ".cursor", "mcp.json");
fs.writeFileSync(cfg, JSON.stringify({ mcpServers: { other: { command: "x" }, "wireframe-preview": { command: "npx" } } }, null, 2));
run(["mcp", "--remove", "cursor"], d);
obj = readJson(cfg);
assert.ok(obj.mcpServers.other, "remove: kept other");
assert.ok(!obj.mcpServers["wireframe-preview"], "remove: dropped ours");
console.log("✓ mcp --remove cursor → removes only our key");

console.log("\nPHASE 3 PASS");
process.exit(0);
