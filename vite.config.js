import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      // Maintaining the app directory at root to ensure all existing files are processed
      appDirectory: ".",
      ssr: false, 
    }),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      // Added requested external packages for build optimization
      external: ['some-external-package']
    }
  }
});