import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      // We set the app directory to the root to follow your existing structure
      appDirectory: ".",
      ssr: false, // Set to false if you want a pure SPA deployment
    }),
    tsconfigPaths(),
  ],
});