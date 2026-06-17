// Transport port: how a feedback/approval block leaves the browser. The live
// adapter talks to the MCP WebSocket bootstrap (window.__wfSend) injected by
// mcp/server.js and always copies to the clipboard as a fallback. The no-op
// adapter (dev/tests) only copies and reports itself offline.
//
// Connection state is exposed framework-agnostically (isConnected + subscribe)
// so React can adapt it via useSyncExternalStore — no Solid signal dependency.

export interface Transport {
  isConnected(): boolean;
  subscribe(cb: () => void): () => void;
  // Send a block; `flash` shows a transient confirmation message.
  send(block: string, flash: (msg: string) => void): void;
}

function copyToClipboard(text: string): void {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    return;
  }
  fallbackCopy(text);
}

function fallbackCopy(text: string): void {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;opacity:0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } catch {
    /* ignore */
  }
  ta.remove();
}

// Live MCP transport. Registers the WS bootstrap hooks and notifies subscribers
// when connection state changes (drives the send-button label).
export function createLiveTransport(): Transport {
  let connected = false;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());
  const set = (v: boolean) => {
    if (v === connected) return;
    connected = v;
    emit();
  };
  (window as any).__wfOnConnect = () => set(true);
  (window as any).__wfOnDisconnect = () => set(false);

  return {
    isConnected: () => connected,
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    send(block, flash) {
      const live = !!(window as any).__wfSend;
      if (live) {
        try {
          (window as any).__wfSend(block);
        } catch {
          /* fall through to clipboard */
        }
      }
      copyToClipboard(block);
      flash(live ? "Sent to agent ✓" : "Copied to clipboard ✓");
    },
  };
}

// Offline transport for the dev harness: never "live", just copies.
export function createNoopTransport(): Transport {
  return {
    isConnected: () => false,
    subscribe: () => () => {},
    send(block, flash) {
      copyToClipboard(block);
      flash("Copied to clipboard ✓");
    },
  };
}
