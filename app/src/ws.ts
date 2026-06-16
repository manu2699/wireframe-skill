// MCP WebSocket integration. The injected bootstrap (mcp/server.js) defines
// window.__wfSend and calls window.__wfOnConnect/__wfOnDisconnect. We expose a
// reactive `connected` signal for the live indicator + button label, and a
// sendOrCopy() that pushes to the agent when live and always copies as fallback.

import { createSignal } from "solid-js";

const [connected, setConnected] = createSignal(false);
export { connected };

// Hooks called by the injected WS bootstrap.
(window as any).__wfOnConnect = () => setConnected(true);
(window as any).__wfOnDisconnect = () => setConnected(false);

function fallbackCopy(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;opacity:0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) {}
  ta.remove();
}

export function sendOrCopy(block: string, flash: (msg: string) => void) {
  const sent = !!(window as any).__wfSend;
  if (sent) { try { (window as any).__wfSend(block); } catch (e) {} }
  const done = () => flash(sent ? "Sent to agent ✓" : "Copied to clipboard ✓");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(block).then(done, () => { fallbackCopy(block); done(); });
  } else {
    fallbackCopy(block);
    done();
  }
}
