import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

// Builds the operating layer into ONE self-contained IIFE file
// (assets/dist/wireframe-app.js) — Solid runtime inlined, no externals — so it
// runs both from file:// (standalone) and when MCP-served.
export default defineConfig({
  plugins: [solid()],
  build: {
    outDir: "assets/dist",
    emptyOutDir: false,
    minify: true,
    target: "es2019",
    lib: {
      entry: "app/src/main.tsx",
      formats: ["iife"],
      name: "WireframeApp",
      fileName: () => "wireframe-app.js",
    },
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
});
