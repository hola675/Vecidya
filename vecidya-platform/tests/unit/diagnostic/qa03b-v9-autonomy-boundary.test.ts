import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const boundaryFiles = {
  "qa03b/v9-answer-validation.ts": ["../qbv2-contract"],
  "qa03b/applicability.ts": ["../qbv2-applicability", "../qbv2-dimensions", "./context"],
  "qa03b/context.ts": ["../context-resolver", "../contracts", "../qbv2-rules", "../signals"],
  "qa03b/engine.ts": ["../contracts", "../qbv2-contract", "../qbv2-rules", "../qbv2-signals", "../taxonomy", "./context"],
  "qa03b/bank.ts": ["../qbv2-contract", "../qbv2-evidence-v3", "../qbv2-reviewed-evidence", "../qbv2-rules"],
  "qa03b/v9-candidate-scoring.ts": [
    "../qbv2-candidate-calibration",
    "../qbv2-contextual-scoring",
    "../qbv2-contract",
    "../qbv2-coverage",
    "../qbv2-dimensions",
    "../qbv2-evidence-v3",
    "../qbv2-rules",
    "./applicability",
    "./bank",
    "./context",
    "./engine",
  ],
  "qa03b/v9-candidate-planner.ts": [
    "../qbv2-contradictions",
    "../qbv2-contract",
    "../qbv2-dimensions",
    "../qbv2-planner",
    "../qbv2-priorities",
    "../qbv2-rules",
    "../qbv2-signals",
    "./bank",
    "./context",
    "./engine",
  ],
  "qa03b/v9-session-prototype.ts": [
    "../qbv2-contract",
    "../qbv2-rules",
    "./qbv2-candidate-planner",
    "./qbv2-candidate-session",
    "./specialty-branches-wave1",
  ],
  "qa03b/v9-observation-correlation.ts": ["../qbv2-contextual-scoring"],
  "qa03b/v9-classification-bundle.ts": ["../qbv2-rules", "../taxonomy", "./engine", "./specialty-branches-wave1", "./specialty-candidate-bank"],
  "qa03b/specialty-branches-wave1.ts": ["../qbv2-contract", "../qbv2-rules", "./specialty-candidate-bank"],
  "qa03b/specialty-candidate-bank.ts": [
    "../qbv2-contract",
    "../qbv2-lote-c",
    "../qbv2-lote-d",
    "../qbv2-lote-f",
    "../qbv2-rules",
    "../taxonomy",
    "./bank",
    "./editorial-copy",
    "./recovery-wave2",
  ],
  "qa03b/worker-replay-v9.server.ts": ["./specialty-branches-wave1"],
  "qa03b/v9-finalization.server.ts": ["./qbv2-candidate-recommendations", "./specialty-branches-wave1"],
} as const;

const boundaryPattern = /^(?:\.\/qbv2-|\.\/specialty-|\.\/(?:bank|context|engine|applicability|editorial-copy|recovery-wave2)$|\.\.\/(?:qbv2-|context-resolver$|contracts$|signals$|taxonomy$))/;

function relativeImports(path: string): string[] {
  const source = readFileSync(new URL(`../../../app/features/diagnostic/${path}`, import.meta.url), "utf8");
  const values = new Set<string>();
  for (const match of source.matchAll(/\bfrom\s+["']([^"']+)["']/g)) {
    const value = match[1]!;
    if (boundaryPattern.test(value)) values.add(value);
  }
  return [...values].sort();
}

test("V9 F01: dependencias legacy/transicionales quedan congeladas en una allowlist explícita", () => {
  for (const [path, expected] of Object.entries(boundaryFiles)) {
    assert.deepEqual(relativeImports(path), [...expected].sort(), path);
  }
});

test("V9 F01: el núcleo graph/question-selection permanece autónomo de QBV2 y QA03B", () => {
  const graph = readFileSync(new URL("../../../app/features/diagnostic/v9/graph-evaluation.ts", import.meta.url), "utf8");
  const selection = readFileSync(new URL("../../../app/features/diagnostic/v9/question-selection.ts", import.meta.url), "utf8");
  for (const [name, source] of [["graph-evaluation", graph], ["question-selection", selection]] as const) {
    assert.equal(/qbv2|qa03b|context-resolver|legacy-signal-adapter/.test(source), false, name);
  }
});

test("V9 F01: las rutas autoritativas públicas no importan QBV2 directamente", () => {
  const routes = [
    "diagnostic-v9.tsx",
    "diagnostic-v9-run.tsx",
    "api-diagnostic-v9-runs.ts",
    "api-diagnostic-v9-run-events.ts",
    "api-diagnostic-v9-run-state.ts",
    "api-diagnostic-v9-run-finalize.ts",
    "api-diagnostic-v9-run-result.ts",
    "api-diagnostic-anonymous-identity.ts",
    "api-diagnostic-claim-anonymous.ts",
  ];
  for (const route of routes) {
    const source = readFileSync(new URL(`../../../app/routes/${route}`, import.meta.url), "utf8");
    assert.equal(/from\s+["'][^"']*qbv2/.test(source), false, route);
  }
});
