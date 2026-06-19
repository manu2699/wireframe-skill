const MAX_ENTRIES = 500;
const logs = [];
const subscribers = [];

function ts() {
  return new Date().toISOString().slice(11, 23);
}

function entry(level, mod, msg, extra) {
  const e = { t: ts(), level, mod, msg };
  if (extra !== undefined) e.extra = extra;
  logs.push(e);
  if (logs.length > MAX_ENTRIES) logs.shift();
  for (const fn of subscribers) fn(e);

  // Write to stderr so the MCP host/harness (Cursor, Claude Code, etc.) can capture and display server logs
  const extraStr = extra !== undefined ? " " + JSON.stringify(extra) : "";
  process.stderr.write(`[${e.t}] [${level}] [${mod}] ${msg}${extraStr}\n`);

  return e;
}

export function info(mod, msg, extra) { entry("INFO", mod, msg, extra); }
export function warn(mod, msg, extra) { entry("WARN", mod, msg, extra); }
export function error(mod, msg, extra) { entry("ERR", mod, msg, extra); }
export function debug(mod, msg, extra) { entry("DBG", mod, msg, extra); }

export function getAll() { return logs.slice(); }

export function onLog(fn) {
  subscribers.push(fn);
  return () => {
    const i = subscribers.indexOf(fn);
    if (i !== -1) subscribers.splice(i, 1);
  };
}
