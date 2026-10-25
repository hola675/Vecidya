import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
const configUrl = new URL("./visual-qa-demo-config.mjs", import.meta.url).href;
function importConfig(env) {
  const childEnv = { ...process.env };
  delete childEnv.BASE_URL;
  delete childEnv.VISUAL_QA_DEMO_PORT;
  Object.assign(childEnv, env);
  return spawnSync(process.execPath, ["--input-type=module", "-e", `import { demoBaseUrl } from ${JSON.stringify(configUrl)}; console.log(demoBaseUrl);`], {
    encoding: "utf8",
    env: childEnv,
    windowsHide: true,
  });
}

const defaultConfig = importConfig({});
assert.equal(defaultConfig.status, 0, defaultConfig.stderr);
assert.equal(defaultConfig.stdout.trim(), "http://127.0.0.1:5180");
const configuredPort = importConfig({ VISUAL_QA_DEMO_PORT: "5290", BASE_URL: "http://localhost:5290" });
assert.equal(configuredPort.status, 0, configuredPort.stderr);
assert.equal(configuredPort.stdout.trim(), "http://127.0.0.1:5290");
for (const BASE_URL of ["https://example.com", "http://127.0.0.1:5173", "http://127.0.0.1:5180/path"]) {
  const rejected = importConfig({ BASE_URL });
  assert.notEqual(rejected.status, 0, `Debe rechazar BASE_URL=${BASE_URL}`);
  assert.match(rejected.stderr, /BASE_URL debe apuntar al origen local/);
}

const { getVisualQaBrowserOptions } = await import("./visual-qa-browser.mjs");
assert.deepEqual(getVisualQaBrowserOptions({ executableOverride: null, edgeExists: () => false }), {}, "sin Edge ni override debe usar Chromium de Playwright");
assert.deepEqual(getVisualQaBrowserOptions({ executableOverride: "C:/browser/custom", edgeExists: () => false }), { executablePath: "C:/browser/custom" });
assert.deepEqual(getVisualQaBrowserOptions({ executableOverride: null, edgeExists: () => true }), { executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
console.log(JSON.stringify({ defaultPort: 5180, configurablePort: 5290, rejectedOrigins: 3, browserSelection: "explicit override / available Edge / Playwright Chromium fallback selection PASS" }));
