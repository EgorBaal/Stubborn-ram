import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,
    strictPort: true,
    watch: {
      // Docs are not part of the frontend bundle and may be locked by external tools.
      ignored: ["**/docs/**", "**/docs_archive/**", "**/*.md", "**/*.txt"],
    },
  },

  base: "/",
});
