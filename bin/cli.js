#!/usr/bin/env node

import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_SRC = path.join(__dirname, "..", "SKILL.md");
const SKILL_CONTENT = fs.readFileSync(SKILL_SRC, "utf8");
const ASSETS_SRC = path.join(__dirname, "..", "assets");
const PKG_NAME = "wireframe-preview";

const genericAgentSkill = {
  label: "Generic Agent Skill",
  type: "copy",
  dest: () =>
    path.join(process.cwd(), ".agents", "skills", PKG_NAME, "SKILL.md"),
};

// Each platform entry: where to write, and how (copy vs append-section)
const PLATFORMS = {
  claude: {
    label: "Claude Code (global)",
    type: "copy",
    dest: () =>
      path.join(os.homedir(), ".claude", "skills", PKG_NAME, "SKILL.md"),
  },
  "claude-project": {
    label: "Claude Code (project)",
    type: "copy",
    dest: () =>
      path.join(process.cwd(), ".claude", "skills", PKG_NAME, "SKILL.md"),
  },
  cursor: {
    label: "Cursor",
    type: "copy",
    dest: () =>
      path.join(process.cwd(), ".cursor", "rules", PKG_NAME, `${PKG_NAME}.md`),
  },
  kilocode: {
    label: "Kilocode",
    type: "copy",
    dest: () =>
      path.join(
        process.cwd(),
        ".kilocode",
        "rules",
        PKG_NAME,
        `${PKG_NAME}.md`,
      ),
  },
  windsurf: {
    label: "Windsurf",
    type: "copy",
    dest: () =>
      path.join(
        process.cwd(),
        ".windsurf",
        "rules",
        PKG_NAME,
        `${PKG_NAME}.md`,
      ),
  },
  agents: {
    ...genericAgentSkill,
    label: "Agents folder (.agents/) - Generic",
  },
  codex: {
    ...genericAgentSkill,
    label: "Codex (OpenAI)",
  },
  antigravity: {
    ...genericAgentSkill,
    label: "Antigravity",
  },
  copilot: {
    ...genericAgentSkill,
    label: "GitHub Copilot",
  },
  "amp-code": {
    label: "Amp Code",
    type: "copy",
    dest: () =>
      path.join(process.cwd(), ".amp", "rules", PKG_NAME, `${PKG_NAME}.md`),
  },
};

// Copy the assets/ folder (template.html, wireframe.css, feature-spec.md) next to the installed SKILL.md so its relative `assets/...` references resolve. Without this the agent has to reconstruct the frozen template/stylesheet from prose.
function copyAssets(dest) {
  if (!fs.existsSync(ASSETS_SRC)) return;
  const assetsDest = path.join(path.dirname(dest), "assets");
  fs.rmSync(assetsDest, { recursive: true, force: true });
  fs.cpSync(ASSETS_SRC, assetsDest, { recursive: true });
  console.log(`  ↳ assets/ → ${assetsDest}`);
}

function writePlatform(name, platform) {
  const dest = platform.dest();

  if (platform.type === "copy") {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, SKILL_CONTENT, "utf8");
    console.log(`✓ ${platform.label} → ${dest}`);
    copyAssets(dest);
    return;
  }

  if (platform.type === "append") {
    const marker = `<!-- wireframe-preview -->`;
    let existing = "";
    if (fs.existsSync(dest)) {
      existing = fs.readFileSync(dest, "utf8");
      if (existing.includes(marker)) {
        console.log(`  ${platform.label}: already installed, skipping`);
        return;
      }
    } else {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
    }
    fs.writeFileSync(dest, existing + marker + platform.section, "utf8");
    console.log(`✓ ${platform.label} → ${dest}`);
  }
}

function removePlatform(name, platform) {
  const dest = platform.dest();

  if (platform.type === "copy") {
    // Every copy install now lives in a dedicated <PKG_NAME>/ folder (SKILL file + assets/),
    // so remove the whole folder. Fall back to unlinking the lone file for any legacy flat install.
    const dir = path.dirname(dest);
    if (path.basename(dir) === PKG_NAME && fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✓ removed ${platform.label} → ${dir}`);
    } else if (fs.existsSync(dest)) {
      fs.unlinkSync(dest);
      console.log(`✓ removed ${platform.label} → ${dest}`);
    } else {
      console.log(`  ${platform.label}: not installed`);
    }
    return;
  }

  if (platform.type === "append") {
    if (!fs.existsSync(dest)) {
      console.log(`  ${platform.label}: not installed`);
      return;
    }
    const marker = `<!-- wireframe-preview -->`;
    const content = fs.readFileSync(dest, "utf8");
    if (!content.includes(marker)) {
      console.log(`  ${platform.label}: not installed`);
      return;
    }
    const cleaned = content.slice(0, content.indexOf(marker)).trimEnd();
    fs.writeFileSync(dest, cleaned + "\n", "utf8");
    console.log(`✓ removed ${platform.label} → ${dest}`);
  }
}

function autoDetect() {
  return ["agents"];
}

// ── CLI entry ──────────────────────────────────────────────────────────────

const [, , cmd, ...args] = process.argv;
const platformFlag = args.find((a) => !a.startsWith("--"));

if (!cmd || cmd === "help") {
  console.log(`
wireframe-preview — install a low-fidelity wireframe skill into your AI agent

Usage:
  npx feature-spec install                   auto-detect agents in this project
  npx feature-spec install <platform>        install for one platform
  npx feature-spec uninstall [platform]      remove (omit platform to auto-detect)
  npx feature-spec list                      show supported platforms

Platforms: ${Object.keys(PLATFORMS).join(", ")}
`);
  process.exit(0);
}

if (cmd === "list") {
  console.log("\nSupported platforms:\n");
  for (const [key, p] of Object.entries(PLATFORMS)) {
    console.log(`  ${key.padEnd(16)} ${p.label}`);
  }
  console.log();
  process.exit(0);
}

if (cmd === "install") {
  let targets;
  if (platformFlag) {
    if (!PLATFORMS[platformFlag]) {
      console.error(`Unknown platform: ${platformFlag}`);
      console.error(`Run: npx wireframe-preview list`);
      process.exit(1);
    }
    targets = [platformFlag];
  } else {
    targets = autoDetect();
    console.log(`Auto-detected: ${targets.join(", ")}\n`);
  }

  for (const t of targets) writePlatform(t, PLATFORMS[t]);
  console.log("\nDone. Restart your agent to pick up the skill.");
  process.exit(0);
}

if (cmd === "uninstall") {
  const targets = platformFlag ? [platformFlag] : autoDetect();

  if (!platformFlag) console.log(`Auto-detected: ${targets.join(", ")}\n`);

  for (const t of targets) {
    if (!PLATFORMS[t]) {
      console.error(`Unknown platform: ${t}`);
      continue;
    }
    removePlatform(t, PLATFORMS[t]);
  }
  process.exit(0);
}

console.error(`Unknown command: ${cmd}`);
console.error(`Run: npx wireframe-preview help`);
process.exit(1);
