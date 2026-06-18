import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// `build` produces ONE self-contained IIFE (assets/dist/wireframe-app.js) — React
// + ReactDOM inlined, no externals — so it runs from file:// and when MCP-served.
// CSS is built separately by the Tailwind CLI (see package.json "build"), so Vite
// emits JS only and never writes a competing dist/*.css.
// `serve` (npm run dev) roots at app/ and drives the HMR dev harness
// (app/index.html + app/dev/main.tsx) against the sample examples.
// The Tailwind Vite plugin runs in `serve` only, so the dev harness gets live
// CSS compilation + HMR on utility classes (no manual rebuild). Production CSS is
// still produced by the standalone Tailwind CLI (see package.json "build") into
// assets/wireframe.css — the lib build emits JS only and imports no CSS.
export default defineConfig(({ command }) => ({
  plugins: [react(), ...(command === "serve" ? [tailwindcss()] : [])],
  // Vite library builds don't replace process.env.NODE_ENV, so React would ship
  // its dev build (warnings + ~3x size). Pin production for the bundle; the dev
  // server (serve) handles NODE_ENV itself.
  ...(command === "build"
    ? { define: { "process.env.NODE_ENV": JSON.stringify("production") } }
    : {}),
  ...(command === "serve"
    ? { root: "app", server: { fs: { allow: [".."] } } }
    : {}),
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
}));
