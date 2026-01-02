import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // Vite looks for the 'public' directory at the project root by default
  publicDir: 'public',
  plugins: [
    remix({
      appDirectory: ".",
      ssr: false, 
    }),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      external: ['some-external-package']
    }
  }
});