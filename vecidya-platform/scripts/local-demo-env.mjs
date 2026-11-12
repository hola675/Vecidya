import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = resolve(projectDirectory, "wrangler.local-demo.jsonc");
const persistPath = resolve(projectDirectory, ".wrangler", "local-demo");
const xdgConfigPath = resolve(persistPath, "xdg-config");
const xdgStatePath = resolve(persistPath, "xdg-state");
const wranglerCli = resolve(projectDirectory, "node_modules", "wrangler", "bin", "wrangler.js");
const reactRouterCli = resolve(projectDirectory, "node_modules", "@react-router", "dev", "bin.cjs");
const baseUrl = "http://127.0.0.1:4173";

function runWrangler(args) {
  const result = spawnSync(process.execPath, [wranglerCli, ...args], {
    cwd: projectDirectory,
    encoding: "utf8",
    timeout: 600_000,
    maxBuffer: 8 * 1024 * 1024,
    stdio: "inherit",
    env: { ...process.env, XDG_CONFIG_HOME: xdgConfigPath, XDG_STATE_HOME: xdgStatePath },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Wrangler local terminó con código ${result.status ?? "desconocido"}.`);
}

function localWorkerEnvironment() {
  const env = { ...process.env };
  for (const name of [
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_API_KEY",
    "CLOUDFLARE_EMAIL",
    "CF_API_TOKEN",
    "GMAIL_OAUTH_CLIENT_ID",
    "GMAIL_OAUTH_CLIENT_SECRET",
    "GMAIL_OAUTH_REFRESH_TOKEN",
    "DIAGNOSTIC_V9_ATTESTATION_PRIVATE_KEY_PKCS8",
  ]) delete env[name];

  return {
    ...env,
    APP_ENV: "local-demo",
    EMAIL_PROVIDER: "fake",
    BETTER_AUTH_SECRET: randomBytes(32).toString("base64url"),
    VECIDYA_LOCAL_DEMO: "1",
    VECIDYA_LOCAL_DEMO_CONFIG: configPath,
    AUTHZ_D1_PERSIST_TO: persistPath,
    LOCAL_DEMO_BASE_URL: baseUrl,
    XDG_CONFIG_HOME: xdgConfigPath,
    XDG_STATE_HOME: xdgStatePath,
    DIAGNOSTIC_REPORT_FUNNEL_ENABLED: "false",
    DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_ENABLED: "false",
    DIAGNOSTIC_IDENTIFIED_REPORT_PURGE_APPROVED: "false",
    LEARN_OPERATION_RECEIPT_PURGE_ENABLED: "false",
    LEARN_OPERATION_RECEIPT_PURGE_APPROVED: "false",
  };
}

function quoteSql(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function queryLocalD1(sql) {
  const result = spawnSync(process.execPath, [
    wranglerCli,
    "d1", "execute", "DB", "--local", "--config", configPath,
    "--persist-to", persistPath, "--json", "--command", sql,
  ], {
    cwd: projectDirectory,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 4 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`No se pudo consultar la D1 local: ${result.stderr || result.stdout}`);
  const jsonStart = result.stdout.indexOf("[");
  if (jsonStart < 0) throw new Error("Wrangler no devolvió resultados JSON para la D1 local.");
  return JSON.parse(result.stdout.slice(jsonStart)).flatMap((entry) => entry.results ?? []);
}

const command = process.argv[2] ?? "help";

if (command === "dev") {
  mkdirSync(persistPath, { recursive: true });
  runWrangler(["d1", "migrations", "apply", "DB", "--local", "--config", configPath, "--persist-to", persistPath]);
  const initializedAt = Date.now();
  runWrangler([
    "d1", "execute", "DB", "--local", "--config", configPath, "--persist-to", persistPath,
    "--command",
    `INSERT INTO platform_meta (key, value, updated_at) VALUES ('platform_name', 'Vecidya', ${initializedAt}) ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
  ]);
  const child = spawn(process.execPath, [reactRouterCli, "dev", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {
    cwd: projectDirectory,
    env: localWorkerEnvironment(),
    stdio: "inherit",
    windowsHide: true,
  });
  child.on("error", (error) => {
    console.error(`No se pudo iniciar el Worker local: ${error.message}`);
    process.exitCode = 1;
  });
  child.on("exit", (code, signal) => {
    process.exitCode = signal ? 1 : (code ?? 1);
  });
} else if (command === "status") {
  const rows = queryLocalD1(`SELECT
    (SELECT COUNT(*) FROM organization WHERE slug LIKE 'qa-local-%') AS organizations,
    (SELECT COUNT(*) FROM business_profile WHERE slug LIKE 'qa-local-%') AS profiles,
    (SELECT COUNT(*) FROM business_media_asset WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE 'qa-local-%') AND is_active = 1) AS media_assets,
    (SELECT COUNT(*) FROM miniweb_v2_site WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE 'qa-local-%')) AS miniweb_sites,
    (SELECT COUNT(*) FROM miniweb_v2_site WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE 'qa-local-%') AND active_publication_id IS NOT NULL) AS published_sites`);
  const counts = rows[0];
  console.log(`D1/R2 local-demo: organizaciones=${counts.organizations}, perfiles=${counts.profiles}, assets registrados=${counts.media_assets}, MiniWeb=${counts.miniweb_sites}, publicados=${counts.published_sites}`);
  console.log(`Persistencia local: ${persistPath}`);
} else {
  console.log("Uso: pnpm run dev:local-demo | seed:local-demo | status:local-demo");
  process.exitCode = command === "help" ? 0 : 2;
}
