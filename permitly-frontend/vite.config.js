import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        // SPA-style navigation fallback
        navigateFallback: "/index.html",
      },
      manifest: {
        name: "Permitly",
        short_name: "Permitly",
        description: "School Leave and Permission Management System",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icons/Permitly.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/Permitly.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        screenshots: [
          {
            src: "/icons/Permitly.png",
            sizes: "800x800",
            type: "image/png",
            form_factor: "wide",
            label: "Permitly dashboard wide layout",
          },
          {
            src: "/icons/Permitly.png",
            sizes: "800x800",
            type: "image/png",
            label: "Permitly main experience",
          },
        ],
      },
    }),
  ],
});
