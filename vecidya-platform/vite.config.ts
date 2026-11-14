import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { resolve } from "node:path";

const isLocalDemo = process.env.VECIDYA_LOCAL_DEMO === "1";
const localDemoConfigPath = process.env.VECIDYA_LOCAL_DEMO_CONFIG;
const localDemoEnvDir = process.env.VECIDYA_LOCAL_DEMO_ENV_DIR;

export default defineConfig({
  ...(isLocalDemo ? { cacheDir: ".tmp/local-demo-vite-cache" } : {}),
  ...(isLocalDemo && localDemoEnvDir ? { envDir: resolve(localDemoEnvDir) } : {}),
  plugins: [
    cloudflare({
      ...(isLocalDemo && localDemoConfigPath
        ? {
            configPath: localDemoConfigPath,
            config: (config) => ({
              vars: {
                ...config.vars,
                BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "",
              },
            }),
          }
        : {}),
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
