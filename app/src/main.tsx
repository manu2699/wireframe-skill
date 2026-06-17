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

createRoot(document.getElementById("wf-root")!).render(
  <App model={model} meta={meta} storage={storage} transport={transport} />,
);
