import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      "@components": path.resolve(import.meta.dirname, "client", "src", "components"),
      "@utils": path.resolve(import.meta.dirname, "client", "src", "utils"),
      "@config": path.resolve(import.meta.dirname, "client", "src", "config"),
      "@types": path.resolve(import.meta.dirname, "client", "src", "types"),
      "@models": path.resolve(import.meta.dirname, "server", "models"),
    
      "@server": path.resolve(import.meta.dirname, "server"),},
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
});
