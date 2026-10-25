import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import { fileURLToPath } from "node:url";

setDefaultAutoSelectFamilyAttemptTimeout(5_000);
const port = Number(process.env.VISUAL_QA_DEMO_PORT ?? 5180);
const baseUrl = `http://127.0.0.1:${port}`;
const wrangler = fileURLToPath(import.meta.resolve("wrangler"));
const child = spawn(process.execPath, [
  wrangler, "dev", "--local", "--persist-to", ".wrangler/visual-qa-demo",
  "--ip", "127.0.0.1", "--port", String(port),
  "--var", "APP_ENV:development", "--var", "EMAIL_PROVIDER:fake",
  "--var", `APP_URL:${baseUrl}`, "--var", `BETTER_AUTH_URL:${baseUrl}`,
  "--show-interactive-dev-session=false", "--log-level", "info",
], {
  cwd: process.cwd(),
  env: { ...process.env, BETTER_AUTH_SECRET: randomBytes(32).toString("base64url"), VECIDYA_E2E_BASE_URL: baseUrl },
  stdio: "inherit",
  windowsHide: true,
});

child.on("error", (error) => {
  console.error(`No se pudo iniciar el Worker local: ${error.message}`);
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
