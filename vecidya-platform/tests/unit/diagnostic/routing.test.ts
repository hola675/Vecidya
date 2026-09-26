import assert from "node:assert/strict";
import { test } from "node:test";

import { deriveContext } from "../../../app/features/diagnostic/answers.ts";
import { findDependencyCycles, getDependencyGraph, QUESTION_DEFINITIONS, ROUTING_RULES } from "../../../app/features/diagnostic/questions.ts";
import { and, answered, collectDependencies, eq, evaluateRule, explainApplicability, isIn, multiExcluding, multiIntersects, not, notEq, or, type Rule } from "../../../app/features/diagnostic/routing.ts";

/**
 * DIAG-V3-03: contrato del DSL de routing. Un único evaluador puro (`evaluateRule`);
 * las reglas son datos serializables (§32), nunca funciones.
 */

test("eq/notEq/in resuelven campos de contexto y respuestas de forma uniforme y a salvo de undefined", () => {
  const ctx = deriveContext({ profile: "business", stage: "regular" } as never);
  assert.equal(evaluateRule(eq("profile", "business"), ctx), true);
  assert.equal(evaluateRule(eq("profile", "creator"), ctx), false);
  assert.equal(evaluateRule(notEq("stage", "idea"), ctx), true);
  assert.equal(evaluateRule(isIn("profile", ["project", "organization"]), ctx), false);
  assert.equal(evaluateRule(eq("team", "only_me"), ctx), false, "team sin responder nunca es igual a un valor");
});

test("answered distingue undefined de cualquier valor respondido, incluidas listas", () => {
  assert.equal(evaluateRule(answered("stage"), deriveContext({} as never)), false);
  assert.equal(evaluateRule(answered("assets"), deriveContext({ assets: ["none"] } as never)), true, "answered no exige sustancia");
});

test("multiExcluding / multiIntersects reproducen la semántica de hasAssets / hasAnyAsset", () => {
  const none = deriveContext({ assets: ["none"] } as never);
  const some = deriveContext({ assets: ["domain", "website"] } as never);
  assert.equal(evaluateRule(multiExcluding("assets", ["none", "unknown"]), none), false);
  assert.equal(evaluateRule(multiExcluding("assets", ["none", "unknown"]), some), true);
  assert.equal(evaluateRule(multiIntersects("assets", ["domain", "website"]), some), true);
  assert.equal(evaluateRule(multiIntersects("assets", ["domain", "website"]), deriveContext({ assets: ["social"] } as never)), false);
});

test("and/or/not componen y son deterministas", () => {
  const ctx = deriveContext({ stage: "idea" } as never);
  assert.equal(evaluateRule(or(eq("stage", "idea"), eq("stage", "launching")), ctx), true);
  assert.equal(evaluateRule(and(eq("stage", "idea"), answered("team")), ctx), false);
  assert.equal(evaluateRule(not(eq("stage", "idea")), ctx), false);
});

test("collectDependencies recorre todo el árbol, deduplicado", () => {
  const rule = and(eq("stage", "regular"), or(answered("sources"), multiExcluding("assets", ["none"])));
  assert.deepEqual([...collectDependencies(rule)].sort(), ["assets", "sources", "stage"]);
});

test("evaluateRule es determinista: misma regla + mismo contexto => mismo resultado, siempre", () => {
  const rule = and(notEq("stage", "idea"), multiIntersects("assets", ["domain", "website"]));
  const ctx = deriveContext({ stage: "regular", assets: ["domain"] } as never);
  const runs = Array.from({ length: 20 }, () => evaluateRule(rule, ctx));
  assert.ok(runs.every((r) => r === runs[0]));
});

test("contrato: el grafo derivado de ROUTING_RULES es acíclico y sin auto-dependencia", () => {
  const graph = getDependencyGraph();
  for (const [id, deps] of Object.entries(graph)) assert.ok(!deps.includes(id as never), `${id} depende de sí misma`);
  assert.deepEqual(findDependencyCycles(graph), []);
});

test("contrato: el detector de ciclos distingue un grafo cíclico de uno acíclico (caso mínimo)", () => {
  assert.deepEqual(findDependencyCycles({ a: ["b"], b: ["c"], c: ["a"] }), [["a", "b", "c", "a"]]);
  assert.deepEqual(findDependencyCycles({ a: [], b: ["a"], c: ["a", "b"] }), []);
});

test("contrato: todo literal comparado en ROUTING_RULES es una opción real de su pregunta", () => {
  const optionsOf = (id: string) => new Set(QUESTION_DEFINITIONS.find((definition) => definition.id === id)?.options.map((option) => option.value));
  const walk = (rule: Rule): void => {
    if (rule.op === "eq" || rule.op === "notEq") assert.ok(optionsOf(rule.ref.question)?.has(rule.value), `${rule.ref.question}: valor «${rule.value}» no es una opción real`);
    if (rule.op === "in") for (const value of rule.values) assert.ok(optionsOf(rule.ref.question)?.has(value), `${rule.ref.question}: valor «${value}» no es una opción real`);
    if (rule.op === "multiExcluding") for (const value of rule.exclude) assert.ok(optionsOf(rule.ref.question)?.has(value), `${rule.ref.question}: valor «${value}» no es una opción real`);
    if (rule.op === "multiIntersects") for (const value of rule.values) assert.ok(optionsOf(rule.ref.question)?.has(value), `${rule.ref.question}: valor «${value}» no es una opción real`);
    if (rule.op === "and" || rule.op === "or") rule.rules.forEach(walk);
    if (rule.op === "not") walk(rule.rule);
  };
  for (const rule of Object.values(ROUTING_RULES)) walk(rule as Rule);
});

test("explainApplicability: código de razón derivado de la misma traza que evalúa el resultado", () => {
  const rule = ROUTING_RULES.proof_professional!;
  const wrongProfile = explainApplicability(rule, deriveContext({ profile: "business", stage: "regular" } as never));
  assert.deepEqual(wrongProfile.applicable, false);
  assert.deepEqual(wrongProfile.reasonCode, "profile_mismatch");

  const applicable = explainApplicability(rule, deriveContext({ profile: "professional", stage: "regular" } as never));
  assert.deepEqual(applicable, { applicable: true, reasonCode: "rule_true", trace: applicable.trace });

  const teamRule = ROUTING_RULES.team!;
  const unanswered = explainApplicability(teamRule, deriveContext({} as never));
  assert.deepEqual(unanswered.applicable, false);
  assert.deepEqual(unanswered.reasonCode, "dependency_unanswered");
});
