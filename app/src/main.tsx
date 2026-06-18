// Production entry: read the inlined #wf-model, wire the browser adapters
// (localStorage + live MCP transport), and mount the App. This is the only file
// that binds the app to the harness HTML — everything else is injectable.

import { createRoot } from "react-dom/client";
import { App } from "./App";
import { readModel } from "./model/read";
import { localStorageAdapter } from "./ports/storage";
import { createLiveTransport } from "./ports/transport";

const { model, meta } = readModel();
const storage = localStorageAdapter("wfc:" + location.pathname);
const transport = createLiveTransport();

// Guard against createRoot being called twice on the same container (React
// error #299). This can happen if the IIFE bundle is evaluated more than once
// (e.g. duplicate <script> injection). Store the root globally and reuse it.
declare global {
  interface Window { __wfRoot?: ReturnType<typeof createRoot>; }
}
const container = document.getElementById("wf-root")!;
const app = <App model={model} meta={meta} storage={storage} transport={transport} />;
if (window.__wfRoot) {
  window.__wfRoot.render(app);
} else {
  window.__wfRoot = createRoot(container);
  window.__wfRoot.render(app);
}
