MCP servers run over **stdio** — harness spawns `node mcp/server.js` as child process, talks JSON-RPC through stdin/stdout. No HTTP needed for the MCP connection itself (HTTP is only for serving wireframes to the browser).

**To connect locally:**

```bash
# From the project root
npx wireframe-preview mcp claude
```

This writes to `~/.claude/claude_desktop_config.json` (or equivalent) something like:

```json
{
  "mcpServers": {
    "wireframe-preview": {
      "command": "node",
      "args": ["/absolute/path/to/wireframe-preview/mcp/server.js"]
    }
  }
}
```

Let me check what it actually writes:

Got it. Here's how it works:

**For any harness — the config it writes:**

```json
{
  "wireframe-preview": {
    "command": "npx",
    "args": ["-y", "--package=wireframe-preview", "wf-preview-mcp"]
  }
}
```

**For local dev (pointing to your local clone instead of npm):**

```bash
# Option 1: Register pointing to local source
# Manually add to your harness config:
{
  "wireframe-preview": {
    "command": "node",
    "args": ["/Users/manu/Work/Personals/wireframe-preview/mcp/server.js"]
  }
}

# Option 2: npm link, then register normally
cd /Users/manu/Work/Personals/wireframe-preview
npm link
npx wireframe-preview mcp claude-project   # writes .mcp.json in current project
```

**Config file locations by harness:**

| Harness | Config file |
|---------|------------|
| Claude Code (project) | `.mcp.json` in project root |
| Cursor | `.cursor/mcp.json` |
| VS Code Copilot | `.vscode/mcp.json` |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` |

**Quick test right now:**

```bash
# This project already has Claude Code — just run:
npx wireframe-preview mcp claude-project
```

That drops a `.mcp.json` in your project root. Next Claude Code session picks it up, and any `wireframe_open` call goes through your local server.

Want me to run the registration for Claude Code?