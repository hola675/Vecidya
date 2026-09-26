import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";

import { deriveContext, evaluateRule, QUESTION_DEFINITIONS, ROUTING_RULES, type Context } from "../../../app/features/diagnostic/index.ts";

/**
 * DIAG-V3-03: equivalencia entre las 23 closures originales (congeladas aquí, tal como existían en
 * el commit `5586d32`, ANTES de esta migración) y el nuevo evaluador declarativo. Nunca se importan
 * en producción (§20/§21): existen solo para demostrar 0 divergencias sobre 20.000 contextos.
 */

function hasAssets(context: Context): boolean {
  const raw = context.answers.assets as string | string[] | undefined;
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return values.length > 0 && !values.includes("none") && !values.includes("unknown");
}
function hasAnyAsset(context: Context, assets: string[]): boolean {
  const raw = context.answers.assets as string | string[] | undefined;
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return assets.some((asset) => values.includes(asset));
}
function captureExists(context: Context): boolean {
  const capture = context.answers.capture;
  return typeof capture === "string" && capture !== "no";
}
function inquiriesArrive(context: Context): boolean {
  const raw = context.answers.sources as string | string[] | undefined;
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return values.length > 0 && !values.includes("none");
}
function isOperating(stage: unknown): boolean {
  return stage === "occasional" || stage === "regular" || stage === "growing";
}
function isEstablished(stage: unknown): boolean {
  return stage === "regular" || stage === "growing";
}
function hasTeam(team: unknown): boolean {
  return Boolean(team) && team !== "only_me";
}
const LOCAL_SEARCH_PROFILES = ["business", "professional", "organization"];

const LEGACY: Record<string, (context: Context) => boolean> = {
  team: (c) => Boolean(c.stage) && c.stage !== "idea",
  assets: (c) => Boolean(c.stage),
  clarity_presence: (c) => hasAssets(c),
  offer_clarity: (c) => c.stage === "idea" || c.stage === "launching" || c.profile === "creator" || c.profile === "project" || (Boolean(c.answers.assets) && !hasAssets(c)),
  validation: (c) => c.stage === "idea" || c.stage === "launching",
  proof_professional: (c) => c.profile === "professional" && c.stage !== "idea",
  proof_business: (c) => c.profile === "business" && c.stage !== "idea",
  proof_creator: (c) => c.profile === "creator" && c.stage !== "idea",
  proof_org: (c) => (c.profile === "project" || c.profile === "organization") && c.stage !== "idea",
  control: (c) => hasAnyAsset(c, ["domain", "website"]),
  sources: (c) => isOperating(c.stage),
  discoverability: (c) => isOperating(c.stage) && c.profile !== undefined && LOCAL_SEARCH_PROFILES.includes(c.profile),
  audience: (c) => c.profile === "creator" && c.stage !== "idea",
  reach: (c) => c.profile === "project" && c.stage !== "idea",
  contact_path: (c) => Boolean(c.stage) && c.stage !== "idea",
  capture: (c) => isOperating(c.stage) && inquiriesArrive(c),
  response: (c) => isOperating(c.stage) && inquiriesArrive(c),
  follow_up: (c) => isOperating(c.stage) && inquiriesArrive(c),
  pipeline: (c) => isEstablished(c.stage) && inquiriesArrive(c) && captureExists(c),
  responsibilities: (c) => hasTeam(c.team) && isOperating(c.stage) && inquiriesArrive(c),
  repetitive: (c) => isEstablished(c.stage) && inquiriesArrive(c) && captureExists(c),
  post_sale: (c) => isEstablished(c.stage) && inquiriesArrive(c),
  measurement: (c) => isOperating(c.stage) && inquiriesArrive(c),
};

/** Mismo generador que el baseline de Task 1 (semilla y recorrido idénticos). */
function randomAnswers(count: number, seed: number): Record<string, string | string[]>[] {
  let state = seed;
  const random = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  const cases: Record<string, string | string[]>[] = [];
  for (let index = 0; index < count; index += 1) {
    const answers: Record<string, string | string[]> = {};
    for (const definition of QUESTION_DEFINITIONS) {
      if (random() < 0.2) continue;
      const values = definition.options.map((option) => option.value);
      answers[definition.id] = definition.type === "single" ? values[Math.floor(random() * values.length)] : values.filter(() => random() < 0.35);
    }
    cases.push(answers);
  }
  return cases;
}

test("equivalencia: 20.000 contextos, legacy vs declarativo, 0 divergencias, mismo digest SHA-256", () => {
  assert.equal(Object.keys(LEGACY).length, 23, "deben congelarse exactamente las 23 closures originales");
  const contexts = randomAnswers(20000, 20260926).map((answers) => deriveContext(answers as never));
  const table: Record<string, boolean[]> = {};
  let divergences = 0;
  for (const [id, legacyFn] of Object.entries(LEGACY)) {
    const rule = ROUTING_RULES[id as keyof typeof ROUTING_RULES];
    assert.ok(rule, `${id}: sin regla declarativa en ROUTING_RULES`);
    const row: boolean[] = [];
    contexts.forEach((ctx, index) => {
      const legacy = legacyFn(ctx);
      const declared = evaluateRule(rule!, ctx);
      if (legacy !== declared) {
        divergences += 1;
        assert.equal(declared, legacy, `${id} @ contexto ${index}: legacy=${legacy} nuevo=${declared} ctx=${JSON.stringify(ctx)}`);
      }
      row.push(legacy);
    });
    table[id] = row;
  }
  assert.equal(divergences, 0);
  const digest = createHash("sha256").update(JSON.stringify(table)).digest("hex");
  // Debe coincidir con BEFORE_DIGEST capturado en Task 1 sobre las closures actuales (pre-migración):
  // afa037f1546a8afe19565ff78b236d7a8d86363ca274f1535de6cd5cdc9b823c
  assert.equal(digest, "afa037f1546a8afe19565ff78b236d7a8d86363ca274f1535de6cd5cdc9b823c", "el digest de la tabla de verdad de 20.000 contextos cambió");
});
