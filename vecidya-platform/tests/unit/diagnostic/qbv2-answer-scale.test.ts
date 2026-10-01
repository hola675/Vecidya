import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ANSWER_SEMANTICS, CAPABILITY_CONTRIBUTION, EVIDENCE_DIRECTNESS, GOLDEN_PERSONAS, QUESTION_BANK_V2, QUESTION_LANGUAGE, deriveConstraintsAndPriorities, deriveContextualEvidence,
  deriveSemanticFacts, renderQuestionV2, resolveEligibleQuestionsV2, resultCategory, resultCertainty, runGoldenPersonaPipeline, scoreContextualDimensions, visibleCopyOf,
  type AnswersV2, type DigitalDimensionId,
} from "../../../app/features/diagnostic/index.ts";

/** DIAG-V3-08F.1 — cierre de las dos escalas de respuesta diferidas por la auditoría de lenguaje 08F. */

const byId = new Map(QUESTION_BANK_V2.map((question) => [question.id, question]));
const golden = (id: string) => runGoldenPersonaPipeline(GOLDEN_PERSONAS.find((persona) => persona.id === id)!).answers;
const evidence = (answers: AnswersV2, dimension: DigitalDimensionId) => deriveContextualEvidence(answers).filter((entry) => entry.dimension === dimension);
function analyze(answers: AnswersV2, dimension: DigitalDimensionId) {
  const scoring = scoreContextualDimensions({ answers, context: {}, evidence: [] });
  const priorities = deriveConstraintsAndPriorities(scoring);
  const facts = deriveSemanticFacts({ answers, scoring, priorities }).facts.filter((fact) => fact.dimension === dimension);
  return { result: scoring.dimensions.find((item) => item.id === dimension)!, priorities: priorities.priorities, facts };
}
const live = { q2_has_customers: "yes", q2_regularity: "regular" } as const;
const PROFILES: Record<string, AnswersV2> = {
  generic: { ...live, q2_delivery: "fixed_no_inventory", q2_monetization: "time_or_project" },
  clinical: { ...live, q2_delivery: "scheduled", q2_sector: "health_wellness", q2_monetization: "licensed" },
  creator: { ...live, q2_delivery: "audience_content", q2_monetization: "audience" },
  nonprofit: { ...live, q2_entity: "organization", q2_delivery: "fixed_no_inventory", q2_monetization: "mission" },
};

// ── q2_reputation_flow ───────────────────────────────────────────────────────

test("08F.1 reputation scale: steady → occasional → rare, plus unknown; version 2 and no repurposed IDs", () => {
  const question = byId.get("q2_reputation_flow")!;
  assert.equal(question.version, 2);
  assert.deepEqual(question.options.map((option) => [option.value, option.kind ?? "value"]), [["steady", "value"], ["occasional", "value"], ["rare", "value"], ["unknown", "unknown"]]);
  assert.deepEqual(ANSWER_SEMANTICS.q2_reputation_flow, { values: { steady: "established", occasional: "partial", rare: "weak" } });
  const states = (value: string) => evidence({ q2_reputation_flow: value }, "trust_reputation").map((entry) => [entry.state, entry.directness, entry.contribution]);
  assert.deepEqual(states("steady"), [["established", "direct", 0.75]]);
  assert.deepEqual(states("occasional"), [["partial", "direct", 0.5]]);
  assert.deepEqual(states("rare"), [["weak", "direct", 0.25]]);
  assert.deepEqual(states("unknown"), [["uncertainty", "direct", null]]);
  // El nivel intermedio nunca forma un par de contradicción (no es ≥ established ni < partial); «rara vez» frente a una prueba fuerte sí.
  const contradictions = (value: string) => analyze({ ...golden("creator_personal_brand"), q2_professional_authority_signals: "clearly_visible", q2_reputation_flow: value }, "trust_reputation").result.explainability.contradictions.length;
  assert.deepEqual([contradictions("occasional"), contradictions("rare")], [0, 1]);
  assert.equal(CAPABILITY_CONTRIBUTION.partial, 0.5);
});

test("08F.1 reputation semantics: the intermediate state reads as inconsistent, never as absent; unknown never upgrades", () => {
  const creator = golden("creator_personal_brand");
  assert.equal(creator.q2_reputation_flow, "rare", "golden fixture unchanged");
  const read = (value: string) => analyze({ ...creator, q2_reputation_flow: value }, "trust_reputation");
  const [steady, occasional, rare, unknown] = ["steady", "occasional", "rare", "unknown"].map(read);
  assert.deepEqual([steady!.result.score, occasional!.result.score, rare!.result.score], [63, 50, 38], "strictly ordered, no ceiling");
  assert.equal(steady!.result.confidence.level, occasional!.result.confidence.level);
  const reading = (item: ReturnType<typeof read>) => item.facts.find((fact) => ["strength", "partial", "weakness"].includes(fact.type))!;
  assert.deepEqual([reading(occasional!).semanticCode, resultCategory(reading(occasional!))], ["limited_visible_trust", "partial_capability"]);
  assert.deepEqual([reading(rare!).semanticCode, resultCategory(reading(rare!))], ["low_visible_trust", "constraint"]);
  assert.equal(unknown!.result.confidence.level, "low");
  assert.ok(unknown!.facts.some((fact) => fact.id === "uncertainty:q2_reputation_flow" && resultCertainty(fact) === "unknown"));
  assert.equal(resultCertainty(reading(unknown!)), "probable");
});

test("08F.1 reputation language: every profile renders the same four answers; only the noun changes", () => {
  const prompts = new Set<string>();
  for (const [profile, answers] of Object.entries(PROFILES)) {
    const rendered = renderQuestionV2(byId.get("q2_reputation_flow")!, { context: resolveEligibleQuestionsV2(answers, QUESTION_BANK_V2).context, answers });
    assert.deepEqual(rendered.options.map((option) => option.value), ["steady", "occasional", "rare", "unknown"], profile);
    assert.match(rendered.options[1]!.label, /De vez en cuando/);
    prompts.add(rendered.prompt);
  }
  assert.equal(prompts.size, 4, "generic, clinical, creator and nonprofit keep their own subject");
  const help = byId.get("q2_reputation_flow")!.helpIntent!;
  assert.match(help.distinction, /algunos meses sí y otros no/, "help describes the observable behaviour");
  assert.match(byId.get("q2_reputation_flow")!.hint!, /reseñas en internet, testimonios o recomendaciones/, "broader than online reviews");
});

// ── q2_ecommerce_traffic_sources ─────────────────────────────────────────────

const SOURCES = (values: readonly string[]) => ({ ...golden("ecommerce"), q2_ecommerce_traffic_sources: values }) as AnswersV2;

test("08F.1 traffic taxonomy: previous values keep their order; marketplace, email, direct and other are added; other ≠ unknown", () => {
  const question = byId.get("q2_ecommerce_traffic_sources")!;
  assert.equal(question.version, 2);
  assert.equal(question.type, "multi");
  assert.deepEqual(question.options.map((option) => option.value), ["social", "search", "ads", "referral", "marketplace", "email", "direct", "other", "unknown"]);
  const other = question.options.find((option) => option.value === "other")!;
  const unknown = question.options.find((option) => option.value === "unknown")!;
  assert.deepEqual([other.kind, other.exclusive], [undefined, undefined], "other is a known source");
  assert.deepEqual([unknown.kind, unknown.exclusive], ["unknown", true], "unknown is the absence of knowledge");
  assert.deepEqual(EVIDENCE_DIRECTNESS.q2_ecommerce_traffic_sources, { discovery: "supporting", measurement_optimization: "supporting" });
});

test("08F.1 traffic semantics: naming a source supports Measurement but never proves it; only discovery channels count toward diversity", () => {
  const state = (values: readonly string[], dimension: DigitalDimensionId) => evidence({ q2_ecommerce_traffic_sources: values } as AnswersV2, dimension)[0]?.state;
  for (const value of ["social", "search", "ads", "referral", "marketplace", "email", "direct", "other"]) assert.equal(state([value], "measurement_optimization"), "partial", value);
  assert.equal(state(["unknown"], "measurement_optimization"), "missing");
  assert.equal(state(["social", "search", "ads", "referral", "marketplace", "email", "direct", "other"], "measurement_optimization"), "partial", "more sources never prove attribution");
  // Descubrimiento: una vía → dependencia; correo y visitas directas son demanda de quien ya conoce el negocio.
  assert.equal(state(["marketplace"], "discovery"), "dependency");
  assert.equal(state(["other"], "discovery"), "dependency");
  assert.equal(state(["email"], "discovery"), "constraint");
  assert.equal(state(["direct"], "discovery"), "constraint");
  assert.equal(state(["social", "email", "direct"], "discovery"), "dependency", "returning-demand channels do not diversify discovery");
  assert.equal(state(["marketplace", "search"], "discovery"), "partial");
  assert.equal(state(["social", "search", "ads", "marketplace"], "discovery"), "established");
  assert.equal(state(["unknown"], "discovery"), "uncertainty");
});

test("08F.1 traffic multiselect: one question is one observation; eight sources never add confidence over one", () => {
  const one = analyze(SOURCES(["social"]), "measurement_optimization");
  const eight = analyze(SOURCES(["social", "search", "ads", "referral", "marketplace", "email", "direct", "other"]), "measurement_optimization");
  assert.deepEqual([one.result.score, one.result.confidence], [eight.result.score, eight.result.confidence]);
  for (const values of [["social"], ["social", "search", "ads", "referral", "marketplace", "email", "direct", "other"]]) {
    const derived = deriveContextualEvidence({ q2_ecommerce_traffic_sources: values } as AnswersV2).filter((entry) => entry.questionId === "q2_ecommerce_traffic_sources");
    assert.deepEqual(derived.map((entry) => entry.dimension).sort(), ["discovery", "measurement_optimization"]);
  }
  const discovery = (values: readonly string[]) => analyze(SOURCES(values), "discovery").result;
  assert.deepEqual(discovery(["social"]).confidence, discovery(["social", "search", "ads", "referral", "marketplace", "email", "direct", "other"]).confidence);
  assert.equal(discovery(["social", "search", "ads", "referral"]).score, null, "sources stay supporting-only for discovery");
});

test("08F.1 traffic result language: dependency on one source is distinguishable from several sources; email/direct-led and unknown claim nothing", () => {
  const risk = (values: readonly string[]) => analyze(SOURCES(values), "discovery").facts.find((fact) => fact.id === "risk:discovery");
  for (const values of [["social"], ["marketplace"], ["social", "email", "direct"]]) {
    const fact = risk(values);
    assert.ok(fact && resultCategory(fact) === "dependency" && resultCertainty(fact) === "probable", JSON.stringify(values));
  }
  for (const values of [["social", "search", "ads", "referral"], ["email"], ["direct"], ["email", "direct"]]) assert.equal(risk(values), undefined, JSON.stringify(values));
  const unknown = analyze(SOURCES(["unknown"]), "discovery").facts;
  assert.ok(unknown.some((fact) => fact.id === "uncertainty:q2_ecommerce_traffic_sources" && resultCertainty(fact) === "unknown"));
  // Las prioridades del contexto ecommerce no cambian por la mezcla de fuentes (Descubrimiento solo recibe apoyo).
  const priorities = (values: readonly string[]) => analyze(SOURCES(values), "discovery").priorities.map((item) => `${item.rank}:${item.dimension}:${item.certainty}`);
  assert.deepEqual(priorities(["social"]), priorities(["social", "search", "ads", "referral", "marketplace", "email", "direct", "other"]));
});

test("08F.1 traffic language: the answer list is plain, asks for every habitual source and distinguishes other from unknown", () => {
  const question = byId.get("q2_ecommerce_traffic_sources")!;
  assert.match(question.hint!, /todas/);
  assert.match(question.helpIntent!.distinction, /«Otra».*«No sé»/);
  const rendered = renderQuestionV2(question, { context: resolveEligibleQuestionsV2(PROFILES.generic!, QUESTION_BANK_V2).context, answers: PROFILES.generic! });
  assert.ok(!/amazon|mercado libre|google|shopify|newsletter|tráfico/i.test(visibleCopyOf(rendered)), "no vendors or jargon");
  assert.ok(!/mejor|puntúa|puntaje/i.test(visibleCopyOf(rendered)), "help never reveals the better answer");
});

// ── Sin regresiones de ruta ni de registro ───────────────────────────────────

test("08F.1 routing and registry: golden routes unchanged and no answer-scale finding left deferred", () => {
  assert.deepEqual(GOLDEN_PERSONAS.map((persona) => Object.keys(golden(persona.id)).length), [16, 20, 18, 19, 22, 19, 21, 19, 21, 20, 21, 18]);
  assert.equal(Object.values(QUESTION_LANGUAGE).filter((entry) => entry.deferred).length, 0);
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.deepEqual(QUESTION_BANK_V2.filter((question) => question.version === 2).map((question) => question.id).sort(), ["q2_ecommerce_traffic_sources", "q2_reputation_flow"]);
});
