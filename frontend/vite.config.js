import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: process.env.PORT || 4173,
    strictPort: true,
    hmr: {
      host: "yang-liu-project3-1.onrender.com",
    },
    proxy: {
      "/api": "http://localhost:5001",
    },
  },
  preview: {
    port: process.env.PORT || 4173,
    allowedHosts: ["yang-liu-project3-1.onrender.com"],
  },
});
