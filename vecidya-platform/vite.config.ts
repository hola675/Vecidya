import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    cloudflare({
      persistState: process.env.AUTHZ_D1_PERSIST_TO
        ? { path: process.env.AUTHZ_D1_PERSIST_TO }
        : true,
      viteEnvironment: { name: "ssr" },
    }),
    tailwindcss(),
    reactRouter(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
