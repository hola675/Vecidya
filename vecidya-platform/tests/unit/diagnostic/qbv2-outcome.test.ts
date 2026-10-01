import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DiagnosticResult, STATUS_ASSETS } from "../../../app/components/diagnostic-result/index.ts";
import {
  bandFor, buildDiagnosticNarrative, buildDiagnosticRecommendations, classifyOverallState, displayScoreFor, matchCommercialOfferings, buildDiagnosticOutcome, buildQuestionPlan, COMMERCIAL_CATALOG, computeDigitalPresenceIndex, computeOverallConfidence, deriveConstraintsAndPriorities,
  deriveSemanticFacts, DIGITAL_DIMENSION_IDS, GOLDEN_PERSONAS, matchSolution, OVERALL_INDEX_MODEL, OVERALL_STATE_ASSET_SLOTS, QUESTION_BANK_V2, ROUTE_HARD_CAP, runGoldenPersonaPipeline,
  scoreContextualDimensions, SOLUTION_CATALOG, SOLUTION_OFFERINGS, solutionContextOf, TERMINOLOGY, type ContextualScoringResult, type DiagnosticRecommendation,
} from "../../../app/features/diagnostic/index.ts";

/** DIAG-V3-10 — estado general, recomendaciones, soluciones y ofertas sobre el resultado congelado. */

function pipeline(answers: Record<string, unknown>) {
  const scoring = scoreContextualDimensions({ answers: answers as never, context: {}, evidence: [] });
  const priorities = deriveConstraintsAndPriorities(scoring);
  const semanticFacts = deriveSemanticFacts({ answers: answers as never, scoring, priorities });
  const narrative = buildDiagnosticNarrative({ answers: answers as never, scoring, priorities, semanticFacts });
  return { answers, scoring, priorities, semanticFacts, narrative, outcome: buildDiagnosticOutcome({ scoring, priorities, semanticFacts, narrative }) };
}
const GOLDEN = Object.fromEntries(GOLDEN_PERSONAS.map((persona) => [persona.id, pipeline(runGoldenPersonaPipeline(persona).answers)]));

const byId = new Map(QUESTION_BANK_V2.map((question) => [question.id, question]));
const substantive = (id: string) => byId.get(id)!.options.filter((option) => option.kind !== "unknown" && option.kind !== "not_applicable").map((option) => option.value);
function route(seed: Record<string, unknown>, policy: "first" | "middle" | "last") {
  const answers: Record<string, unknown> = { ...seed };
  for (let batch = 0; batch <= ROUTE_HARD_CAP; batch += 1) {
    const plan = buildQuestionPlan({ answers: answers as never, bank: QUESTION_BANK_V2 });
    if (plan.selectedQuestionIds.length === 0) break;
    for (const id of plan.selectedQuestionIds) {
      const question = byId.get(id)!;
      const options = question.options.filter((option) => option.kind !== "unknown" && option.kind !== "not_applicable" && !option.exclusive);
      const option = (policy === "first" ? options[0] : policy === "last" ? options.at(-1) : options[Math.floor((options.length - 1) / 2)]) ?? question.options[0]!;
      answers[id] = question.type === "multi" ? [option.value] : option.value;
    }
  }
  return pipeline(answers);
}
/** Scoring sintético mínimo: el índice solo lee aplicabilidad, score y nivel de confianza. */
const synthetic = (dimensions: readonly (readonly [number | null | "na", "high" | "medium" | "low"])[]) => ({
  dimensions: DIGITAL_DIMENSION_IDS.map((id, index) => {
    const [score, level] = dimensions[index] ?? ["na", "low"];
    return { id, applicability: score === "na" ? "not_applicable" : "applicable", score: score === "na" ? null : score, confidence: { level } };
  }),
}) as unknown as ContextualScoringResult;

test("10 index: equal-weight mean of applicable scored dimensions, rounded; N/A and null never count as zero", () => {
  const scoring = synthetic([[80, "high"], [60, "medium"], [null, "low"], ["na", "low"], [40, "low"], [null, "low"], ["na", "low"], [20, "low"]]);
  const index = computeDigitalPresenceIndex(scoring);
  assert.equal(index.rawScore, 50);
  assert.equal(index.displayScore, 50, "(80+60+40+20)/4, not divided by 6 or 8");
  assert.equal(index.applicable, 6);
  assert.equal(index.assessed, 4);
  assert.equal(index.coverage, 0.67);
  assert.deepEqual(index.excluded.map((item) => `${item.dimension}:${item.reason}`), ["discovery:no_reading", "trust_reputation:not_applicable", "relationship_recurrence:no_reading", "measurement_optimization:not_applicable"]);
  const asZero = (80 + 60 + 40 + 20) / 6;
  assert.notEqual(index.rawScore, asZero, "null would have lowered the index");
  // Golden: la media exacta 39,5 clasifica («por fortalecer») y se muestra 39, nunca un 40 de la banda siguiente.
  assert.deepEqual([GOLDEN.professional_appointments!.outcome.overall.index.rawScore, GOLDEN.professional_appointments!.outcome.overall.index.displayScore, GOLDEN.professional_appointments!.outcome.overall.state], [39.5, 39, "low"]);
});

test("10 minimum evidence contract: fewer than 3 readings, under a third of coverage or pre-launch → no index", () => {
  assert.equal(OVERALL_INDEX_MODEL.minScoredDimensions, 3);
  assert.equal(computeDigitalPresenceIndex(synthetic([[100, "high"], [94, "high"], [null, "low"], [null, "low"], [null, "low"], [null, "low"], [null, "low"], ["na", "low"]])).rawScore, null, "2 readings");
  assert.equal(computeDigitalPresenceIndex(synthetic([[50, "low"], [50, "low"], [50, "low"], [null, "low"], [null, "low"], [null, "low"], [null, "low"], [null, "low"]])).rawScore, 50, "3 of 8 is enough (0.375)");
  assert.equal(computeDigitalPresenceIndex(synthetic([[50, "low"], [50, "low"], [50, "low"], ["na", "low"], ["na", "low"], ["na", "low"], ["na", "low"], ["na", "low"]]), { prelaunch: true }).rawScore, null, "pre-launch reads preparation, not presence");
  const appointment = GOLDEN.appointment_business!.outcome.overall;
  assert.deepEqual([appointment.state, appointment.index.rawScore, appointment.index.displayScore, appointment.index.assessed, appointment.index.applicable], ["insufficient", null, null, 2, 7], "97% from two areas would be false precision");
  assert.equal(appointment.explanation.text, "Hay señales útiles en las áreas evaluadas, pero todavía no hay suficiente cobertura para resumir toda tu presencia digital en un solo porcentaje. Las áreas con lectura se explican más abajo.");
  assert.equal(GOLDEN.idea_early_stage!.outcome.overall.state, "insufficient");
});

test("10 overall confidence is separate from the index and never multiplies it", () => {
  const strong = synthetic([[50, "high"], [50, "high"], [50, "high"], [50, "medium"], [50, "low"], [50, "low"], [50, "high"], [50, "medium"]]);
  const weak = synthetic([[50, "low"], [50, "low"], [50, "low"], [50, "low"], [50, "low"], [50, "low"], [50, "low"], [50, "low"]]);
  assert.equal(computeDigitalPresenceIndex(strong).rawScore, computeDigitalPresenceIndex(weak).rawScore, "same capability, different evidence");
  assert.equal(computeOverallConfidence(strong, computeDigitalPresenceIndex(strong)).level, "high");
  assert.equal(computeOverallConfidence(weak, computeDigitalPresenceIndex(weak)).level, "low");
  const halfCoverage = synthetic([[50, "medium"], [50, "medium"], [50, "medium"], [50, "medium"], [null, "low"], [null, "low"], [null, "low"], [null, "low"]]);
  assert.equal(computeOverallConfidence(halfCoverage, computeDigitalPresenceIndex(halfCoverage)).level, "medium", "half coverage caps at medium");
  assert.deepEqual(Object.fromEntries(Object.entries(GOLDEN).map(([id, result]) => [id, result.outcome.overall.confidence.level])), {
    idea_early_stage: "low", local_service_business: "low", appointment_business: "low", independent_professional: "low", professional_appointments: "low", physical_retail: "low",
    ecommerce: "medium", retail_ecommerce_hybrid: "low", b2b_business: "medium", creator_personal_brand: "medium", nonprofit_community: "low", operations_heavy: "low",
  });
  for (const result of Object.values(GOLDEN)) assert.equal(result.outcome.overall.provisional, result.outcome.overall.state !== "insufficient" && result.outcome.overall.confidence.level === "low");
});

test("10 status bands use the unrounded index: low [0, 40), developing [40, 70), solid [70, 100]", () => {
  const boundaries = [39.49, 39.5, 39.99, 40, 69.49, 69.5, 69.99, 70];
  assert.deepEqual(boundaries.map(bandFor), ["low", "low", "low", "developing", "developing", "developing", "developing", "solid"]);
  assert.deepEqual(boundaries.map(displayScoreFor), [39, 39, 39, 40, 69, 69, 69, 70], "the displayed integer stays inside the raw band");
  for (const raw of [...boundaries, 0, 0.5, 12.5, 40.49, 54.17, 68.4, 69.4, 70.5, 86.43, 99.5, 100]) {
    const display = displayScoreFor(raw);
    assert.equal(bandFor(display), bandFor(raw), `${raw} → ${display}: display and state never contradict`);
    assert.ok(Math.abs(display - raw) < 1, `${raw} → ${display}`);
  }
  assert.deepEqual([54.17, 68.4, 40.49, 70.5, 99.5].map(displayScoreFor), [54, 68, 40, 71, 100], "ordinary values keep normal rounding");
  assert.deepEqual([0, 100].map(bandFor), ["low", "solid"]);
  for (const raw of boundaries) assert.equal(classifyOverallState({ rawScore: raw, confidence: "high", material: null }).bandState, bandFor(raw));
});

test("10 controlled low-coverage cases: solid needs evidence, narrow strong readings never read as broad solidity", () => {
  const status = (scoring: ContextualScoringResult) => {
    const index = computeDigitalPresenceIndex(scoring);
    const confidence = computeOverallConfidence(scoring, index).level;
    return { raw: index.rawScore, display: index.displayScore, coverage: index.coverage, confidence, ...classifyOverallState({ rawScore: index.rawScore, confidence, material: null }) };
  };
  const pending = [null, "low"] as const;
  // A: 3 de 8 áreas, todas muy fuertes.
  const a = status(synthetic([[100, "high"], [100, "high"], [100, "high"], pending, pending, pending, pending, pending]));
  assert.deepEqual([a.raw, a.display, a.coverage, a.confidence, a.bandState, a.state, a.cap?.reason], [100, 100, 0.38, "low", "solid", "developing", "limited_confidence"]);
  // B: 4 de 8, todas muy fuertes con evidencia por área limitada; y con evidencia alta por área (cobertura 0,5 → confianza media).
  const b = status(synthetic([[100, "low"], [100, "low"], [100, "low"], [100, "low"], pending, pending, pending, pending]));
  assert.deepEqual([b.raw, b.coverage, b.confidence, b.state], [100, 0.5, "low", "developing"]);
  const bHigh = status(synthetic([[100, "high"], [100, "high"], [100, "high"], [100, "high"], pending, pending, pending, pending]));
  assert.deepEqual([bHigh.coverage, bHigh.confidence, bHigh.state], [0.5, "medium", "solid"]);
  // C: 3 áreas débiles: por fortalecer, sin tope (los topes solo afectan a «sólida»).
  const c = status(synthetic([[25, "low"], [25, "low"], [25, "low"], pending, pending, pending, pending, pending]));
  assert.deepEqual([c.raw, c.confidence, c.bandState, c.state, c.cap], [25, "low", "low", "low", null]);
  // D: índice alto, cobertura baja, confianza limitada.
  const d = status(synthetic([[90, "medium"], [85, "low"], [95, "low"], pending, pending, pending, ["na", "low"], pending]));
  assert.deepEqual([d.raw, d.coverage, d.confidence, d.bandState, d.state], [90, 0.43, "low", "solid", "developing"]);
  // E: índice alto, cobertura suficiente, confianza media o alta.
  const e = status(synthetic([[90, "high"], [85, "high"], [95, "medium"], [80, "high"], [88, "high"], [92, "medium"], ["na", "low"], [75, "high"]]));
  assert.deepEqual([Math.round(e.raw! * 100) / 100, e.display, e.coverage, e.confidence, e.bandState, e.state, e.cap], [86.43, 86, 1, "high", "solid", "solid", null]);
  // El tope nunca baja el número.
  for (const item of [a, b, d]) assert.ok(item.raw! >= 70 && item.display! >= 70);
});

test("10 every state reachable, with icon slot, name and explanation", () => {
  const seed = { q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: "fixed_no_inventory", q2_goal: "opportunities", q2_friction: "conversion" };
  const states = {
    low: route(seed, "last").outcome.overall, developing: route(seed, "middle").outcome.overall, solid: GOLDEN.b2b_business!.outcome.overall, insufficient: GOLDEN.appointment_business!.outcome.overall,
  };
  for (const [state, overall] of Object.entries(states)) {
    assert.equal(overall.state, state);
    assert.ok(overall.label.length > 0 && overall.explanation.text.length > 40, state);
    assert.equal(overall.assetSlot, state === "insufficient" ? null : OVERALL_STATE_ASSET_SLOTS[state as "low"]);
  }
  assert.deepEqual([states.low.label, states.developing.label, states.solid.label], ["Presencia por fortalecer", "Presencia en desarrollo", "Presencia sólida"]);
  assert.deepEqual(Object.values(STATUS_ASSETS).map((asset) => asset.slot), ["diagnostic-status-low", "diagnostic-status-developing", "diagnostic-status-solid"]);
  for (const asset of Object.values(STATUS_ASSETS)) assert.ok(asset.avoid.some((item) => /caras/.test(item)) && asset.avoid.some((item) => /personas/.test(item)), asset.slot);
});

test("10 a high average never hides a material bottleneck: solid is capped to developing", () => {
  for (const id of ["independent_professional", "creator_personal_brand"]) {
    const { outcome, priorities } = GOLDEN[id]!;
    assert.equal(outcome.overall.bandState, "solid");
    assert.equal(outcome.overall.state, "developing");
    const cap = outcome.overall.cap;
    assert.ok(cap?.reason === "material_constraint" && priorities.constraints.some((item) => item.severity === "material" && item.dimension === cap.dimension));
    assert.match(outcome.overall.explanation.text, /muestra un freno importante; por eso la presencia se considera en desarrollo y no sólida/);
  }
});

test("10 status explanation uses the index state, the strongest relevant fact, the main constraint and the primary priority", () => {
  const b2b = GOLDEN.b2b_business!;
  assert.match(b2b.outcome.overall.explanation.text, /sólida en lo evaluado: lo más sólido es el seguimiento\. Aun así, conviene lograr que más interés llegue a contratar\./);
  assert.ok(b2b.outcome.overall.explanation.sourceFactIds.includes("priority:1"));
  assert.match(GOLDEN.ecommerce!.outcome.overall.explanation.text, /funciona en parte, pero la claridad de lo que ofreces todavía limita el avance\. Lo más sólido es la medición/);
  assert.match(GOLDEN.local_service_business!.outcome.overall.explanation.text, /Tómalo como una lectura preliminar/);
  for (const [id, result] of Object.entries(GOLDEN)) {
    const text = result.outcome.overall.explanation.text.toLowerCase();
    for (const term of TERMINOLOGY[result.narrative.profile].avoid) assert.ok(!text.includes(term.toLowerCase()), `${id}: «${term}»`);
    assert.ok(!/undefined|null|NaN/.test(text), id);
  }
});

test("10 recommendations: one per 08D priority, same order, never more than primary/secondary/supporting", () => {
  for (const [id, { outcome, narrative, priorities }] of Object.entries(GOLDEN)) {
    const items = outcome.recommendations.items;
    assert.ok(items.length <= 3, id);
    assert.deepEqual(items.map((item) => item.dimension), priorities.priorities.map((item) => item.dimension), `${id}: order`);
    assert.deepEqual(items.map((item) => item.slot), narrative.priorities.map((item) => item.slot), `${id}: slots`);
    assert.deepEqual(items.map((item) => item.rank), items.map((_, index) => index + 1), id);
  }
  assert.equal(GOLDEN.appointment_business!.outcome.recommendations.items.length, 0, "no constraint → nothing invented");
  const sets = new Set(Object.values(GOLDEN).map((result) => result.outcome.recommendations.items.map((item) => item.type).join(",")));
  assert.ok(sets.size >= 8, `only ${sets.size} distinct recommendation sets`);
});

test("10 recommendation provenance: priority, constraint, facts, questions and the narrative's own why", () => {
  for (const [id, { outcome, narrative, semanticFacts, priorities }] of Object.entries(GOLDEN)) {
    const factIds = new Set(semanticFacts.facts.map((fact) => fact.id));
    for (const item of outcome.recommendations.items) {
      const priority = narrative.priorities.find((entry) => entry.rank === item.rank)!;
      assert.equal(item.whyItMatters, priority.why.text, `${id}: why is the priority's own reason`);
      assert.equal(item.sourcePriority.constraintId, priorities.priorities[item.rank - 1]!.id);
      assert.equal(item.sourceConstraint.kind, priorities.priorities[item.rank - 1]!.kind);
      assert.ok(item.sourceFactIds.includes(`priority:${item.rank}`) && item.sourceFactIds.every((fact) => factIds.has(fact)), `${id}: facts`);
      assert.ok(item.evidence.text.length > 0 && item.evidence.sourceFactIds.length > 0, `${id}: evidence finding`);
      assert.ok(!/\d/.test(item.expectedOutcome), `${id}: no numeric ROI`);
      assert.equal(item.framing, { actionable: "recommended", likely: "probable", verify_first: "verify_first" }[priorities.priorities[item.rank - 1]!.certainty]);
    }
  }
});

test("10 solution matching per golden and explicit exclusion rules", () => {
  const solutions = Object.fromEntries(Object.entries(GOLDEN).map(([id, result]) => [id, result.outcome.help.items.map((item) => item.solution.solution?.id ?? "none")]));
  assert.deepEqual(solutions, {
    idea_early_stage: ["launch_channel_plan"], local_service_business: ["work_organization", "website", "offer_message"], appointment_business: [],
    independent_professional: ["organic_discovery"], professional_appointments: ["work_organization", "crm_follow_up", "offer_message"], physical_retail: ["work_organization", "local_listing"],
    ecommerce: ["offer_message", "checkout_experience", "credibility_proof"], retail_ecommerce_hybrid: ["work_organization", "measurement_tracking", "offer_message"],
    b2b_business: ["contact_path", "website", "credibility_proof"], creator_personal_brand: ["reputation_reviews"], nonprofit_community: ["credibility_proof", "contact_path"],
    operations_heavy: ["work_organization", "crm_follow_up", "credibility_proof"],
  });
  // Automatizar sin proceso definido queda excluido; con proceso definido sí se propone.
  const professional = GOLDEN.professional_appointments!;
  assert.ok(professional.outcome.help.items[1]!.solution.exclusions.some((item) => item.rule === "automation_requires_defined_process"));
  const context = solutionContextOf(professional.scoring, professional.priorities, professional.narrative);
  const followUp = professional.outcome.recommendations.items[1]!;
  assert.equal(matchSolution(followUp, { ...context, processMaturity: "defined" }).solution?.id, "follow_up_automation");
  assert.equal(matchSolution(followUp, { ...context, lifecycle: "prelaunch", score: () => null }).solution, null, "no CRM without a contact flow");
  // Un sitio nuevo solo con el hueco en la propia respuesta sobre la base digital.
  const foundation = GOLDEN.local_service_business!.outcome.recommendations.items[1]!;
  const local = solutionContextOf(GOLDEN.local_service_business!.scoring, GOLDEN.local_service_business!.priorities, GOLDEN.local_service_business!.narrative);
  assert.equal(matchSolution(foundation, { ...local, stateOf: () => undefined }).exclusions[0]?.rule, "website_requires_base_gap");
  // Publicidad: nunca si la conversión no es sólida o la adquisición no es la prioridad activa.
  const discovery = GOLDEN.independent_professional!.outcome.recommendations.items[0]!;
  const independent = solutionContextOf(GOLDEN.independent_professional!.scoring, GOLDEN.independent_professional!.priorities, GOLDEN.independent_professional!.narrative);
  assert.ok(matchSolution(discovery, independent).exclusions.some((item) => item.rule === "advertising_requires_active_acquisition"));
  const ready: DiagnosticRecommendation = { ...discovery, prerequisites: discovery.prerequisites.map((item) => ({ ...item, satisfied: true })) };
  assert.deepEqual(matchSolution(ready, { ...independent, goal: "be_found", score: () => 90 }).alternatives.map((item) => item.id), ["advertising"]);
  // Verificar primero: ninguna intervención.
  const verify: DiagnosticRecommendation = { ...discovery, mode: "verify", framing: "verify_first" };
  assert.equal(matchSolution(verify, independent).solution, null);
  for (const solution of Object.values(SOLUTION_CATALOG)) assert.ok(!/\bcliente|\bnegocio|\bventa/i.test(`${solution.label} ${solution.description}`), `${solution.id}: neutral copy`);
});

test("10 commercial matching: canonical offerings only, separate roles, one license, nothing before launch and nothing unsupported", () => {
  const offers = Object.fromEntries(Object.entries(GOLDEN).map(([id, result]) => [id, result.outcome.help.items.map((item) => item.offerings.map((match) => `${match.offering.name}/${match.role}`).join("+") || `none:${item.noOffering}`)]));
  assert.deepEqual(offers, {
    idea_early_stage: ["Estrategia/recommended_service"],
    local_service_business: ["Organización del negocio/recommended_service+Cuadra/optional_license", "Páginas web/recommended_service", "Contenido/recommended_service"],
    appointment_business: [],
    independent_professional: ["SEO/recommended_service"],
    professional_appointments: ["Organización del negocio/recommended_service+Cuadra/optional_license", "CRM/recommended_service", "Contenido/recommended_service"],
    physical_retail: ["Organización del negocio/recommended_service+Cuadra/optional_license", "SEO/recommended_service"],
    ecommerce: ["Contenido/recommended_service", "Ecommerce/recommended_service", "none:not_in_catalog"],
    retail_ecommerce_hybrid: ["Organización del negocio/recommended_service+Cuadra/optional_license", "none:not_in_catalog", "Contenido/recommended_service"],
    b2b_business: ["Landing pages/recommended_service+Barrio/optional_license", "Páginas web/recommended_service", "none:not_in_catalog"],
    creator_personal_brand: ["none:not_in_catalog"],
    nonprofit_community: ["none:not_in_catalog", "Landing pages/recommended_service+Barrio/optional_license"],
    operations_heavy: ["Organización del negocio/recommended_service+Cuadra/optional_license", "CRM/recommended_service", "none:not_in_catalog"],
  });
  for (const [id, { outcome }] of Object.entries(GOLDEN)) {
    const licenses = new Set(outcome.help.items.flatMap((item) => item.offerings).filter((match) => match.offering.kind === "license").map((match) => match.offering.id));
    assert.ok(licenses.size <= 1, `${id}: one license at most`);
    for (const item of outcome.help.items) for (const match of item.offerings) {
      assert.equal(match.proof.recommendation.id, item.recommendationId, `${id}: proof chain points to its recommendation`);
      assert.ok(match.proof.finding.length > 0 && match.proof.priority.statement.length > 0 && match.proof.solution.label.length > 0, `${id}: complete chain`);
    }
  }
  assert.ok(GOLDEN.professional_appointments!.outcome.help.suppressed.some((item) => item.offeringId === "barrio" && item.rule === "single_license"));
  assert.ok(GOLDEN.idea_early_stage!.outcome.help.items.flatMap((item) => item.offerings).every((match) => match.offering.kind === "service"), "no license or addon before launch");
  assert.ok(GOLDEN.professional_appointments!.outcome.help.items[1]!.offerings.every((match) => match.timing === "after_prerequisite" && match.after[0] === "recommendation:1"));
});

test("10 catalog: every offering name exists in the canonical catalog (or the public services page) — no invented names, tiers or prices", () => {
  const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
  const catalog = read("../../../docs/business/VECIDYA_PRODUCT_CATALOG.md");
  const publicPages = { license: read("../../../app/routes/licenses.tsx"), addon: read("../../../app/routes/addons.tsx"), services: read("../../../app/routes/services.tsx") };
  for (const offering of Object.values(COMMERCIAL_CATALOG)) {
    if (offering.source === "public_services") assert.ok(publicPages.services.includes(`title: "${offering.name}"`), offering.name);
    else assert.ok(new RegExp(`^\\| (\\*\\*)?${offering.name}(\\*\\*)? \\|`, "m").test(catalog), `${offering.name} missing from the product catalog`);
    if (offering.kind === "license") assert.ok(publicPages.license.includes(`name: "${offering.name}"`), offering.name);
    if (offering.kind === "addon") assert.ok(publicPages.addon.includes(`name: "${offering.name}"`) && offering.requiresLicense, offering.name);
    assert.ok(!/\$|USD|\d+\s*(%|mes)/i.test(`${offering.summary} ${offering.contracting} ${offering.externalCost ?? ""}`), `${offering.name}: no prices`);
    if (offering.publicPath?.startsWith("/servicios#")) assert.ok(publicPages.services.includes(`id: "${offering.publicPath.split("#")[1]}"`), `${offering.name}: public anchor`);
  }
  for (const rules of Object.values(SOLUTION_OFFERINGS)) for (const rule of rules ?? []) assert.ok(rule.offering in COMMERCIAL_CATALOG);
});

test("10 commercial matching never changes the diagnosis: inputs untouched and priority modules independent of the catalog", () => {
  const persona = GOLDEN_PERSONAS.find((item) => item.id === "b2b_business")!;
  const answers = runGoldenPersonaPipeline(persona).answers;
  const scoring = scoreContextualDimensions({ answers, context: {}, evidence: [] });
  const priorities = deriveConstraintsAndPriorities(scoring);
  const semanticFacts = deriveSemanticFacts({ answers, scoring, priorities });
  const narrative = buildDiagnosticNarrative({ answers, scoring, priorities, semanticFacts });
  const before = JSON.stringify({ scoring, priorities, semanticFacts, narrative });
  buildDiagnosticOutcome({ scoring, priorities, semanticFacts, narrative });
  assert.equal(JSON.stringify({ scoring, priorities, semanticFacts, narrative }), before);
  for (const module of ["qbv2-priorities", "qbv2-semantic-facts", "qbv2-narrative", "qbv2-contextual-scoring", "qbv2-overall", "qbv2-recommendations"]) {
    const source = readFileSync(new URL(`../../../app/features/diagnostic/${module}.ts`, import.meta.url), "utf8");
    assert.ok(!/qbv2-offerings|qbv2-solutions|COMMERCIAL_CATALOG/.test(source), `${module} must not read the commercial layer`);
  }
});

test("10 the overall status is descriptive: recommendations and commercial matches are computed without it", () => {
  for (const [id, { scoring, priorities, semanticFacts, narrative, outcome }] of Object.entries(GOLDEN)) {
    const recommendations = buildDiagnosticRecommendations({ scoring, priorities, semanticFacts, narrative });
    const context = solutionContextOf(scoring, priorities, narrative);
    const help = matchCommercialOfferings(recommendations, recommendations.items.map((item) => matchSolution(item, context)), context, narrative);
    assert.deepEqual(outcome.recommendations, recommendations, `${id}: recommendations independent of the overall status`);
    assert.deepEqual(outcome.help, help, `${id}: solutions, services, licenses and add-ons independent of the overall status`);
  }
  for (const module of ["qbv2-recommendations", "qbv2-solutions"]) {
    const source = readFileSync(new URL(`../../../app/features/diagnostic/${module}.ts`, import.meta.url), "utf8");
    assert.ok(!/qbv2-overall|DigitalPresenceStatus|rawScore/.test(source), `${module} must not read the overall status`);
  }
  const offerings = readFileSync(new URL("../../../app/features/diagnostic/qbv2-offerings.ts", import.meta.url), "utf8");
  const matcher = offerings.slice(offerings.indexOf("export function matchCommercialOfferings"), offerings.indexOf("export function offeringDependencies"));
  assert.ok(!/overall|rawScore|bandState/.test(matcher), "commercial matching never reads the overall status");
});

test("10 UI: hierarchy, presence card, no emoji, no sales copy, commercial after the diagnosis, every offering explains why", () => {
  for (const [id, { narrative, outcome }] of Object.entries(GOLDEN)) {
    const html = renderToStaticMarkup(createElement(DiagnosticResult, { narrative, outcome }));
    const order = ["dr-presence-title", "dr-summary-title", "dr-focus-title", "dr-plan-title", "dr-dimensions-title", "dr-vecidya-title", "dr-method-title"].map((marker) => html.indexOf(`id="${marker}"`));
    assert.ok(order.every((index, position) => index >= 0 && (position === 0 || index > order[position - 1]!)), `${id}: hierarchy ${order}`);
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    assert.ok(!/\p{Extended_Pictographic}/u.test(text), `${id}: no emoji`);
    assert.ok(!/compra ahora|cómpralo|oferta limitada|no te lo pierdas|garantiza|\bUSD\b|\$\s?\d/i.test(text), `${id}: no sales copy or prices`);
    assert.ok(text.includes(outcome.overall.label) && text.includes(outcome.overall.explanation.text), `${id}: state name and explanation`);
    if (outcome.overall.index.displayScore !== null) assert.match(text, new RegExp(`${outcome.overall.index.displayScore}% ${outcome.overall.label}`));
    else assert.ok(!/Confianza del resultado/.test(text), `${id}: no confidence for a percentage that does not exist`);
    const offerings = outcome.help.items.filter((item) => item.offerings.length > 0).length;
    assert.equal((html.match(/<details class="dr-proof">/g) ?? []).length, offerings, `${id}: one «¿Por qué te recomendamos esto?» per item with offerings`);
    const vecidya = html.indexOf('id="dr-vecidya-title"');
    for (const item of outcome.help.items) for (const match of item.offerings) assert.ok(html.indexOf(`<strong class="dr-offer__name">${match.offering.name}</strong>`) > vecidya, `${id}: ${match.offering.name} only inside «Cómo puede ayudarte Vecidya»`);
    const plan = text.slice(text.indexOf("Plan de acción recomendado"), text.indexOf("Cómo llegamos a este resultado") > 0 ? text.indexOf("Cómo llegamos a este resultado") : undefined);
    for (const priority of narrative.priorities) assert.ok(!plan.includes(priority.why.text), `${id}: the plan does not repeat the priority's why`);
    for (const term of TERMINOLOGY[narrative.profile].avoid) {
      const visible = Object.values(COMMERCIAL_CATALOG).reduce((current, offering) => current.replaceAll(offering.name, ""), text.toLowerCase());
      assert.ok(!visible.includes(term.toLowerCase()), `${id}: «${term}» outside canonical product names`);
    }
  }
});

test("10 generated routes: no pathological overall states, recommendations or commercial matches", () => {
  const stages = { idea: { q2_entity: "project", q2_has_customers: "no" }, operating: { q2_has_customers: "yes", q2_regularity: "regular" } };
  let count = 0;
  const states = new Set<string>();
  for (const policy of ["first", "middle", "last"] as const) for (const stageSeed of Object.values(stages)) for (const delivery of substantive("q2_delivery")) for (const goal of ["be_found", "opportunities", "organize"]) {
    const result = route({ ...stageSeed, q2_delivery: delivery, q2_goal: goal, q2_friction: "visibility" }, policy);
    const { outcome, priorities, narrative } = result;
    const label = `${policy}/${JSON.stringify(stageSeed)}/${delivery}/${goal}`;
    states.add(outcome.overall.state);
    if (outcome.overall.state === "solid") assert.ok(!priorities.constraints.some((item) => item.severity === "material"), `${label}: solid with a material constraint`);
    if (narrative.lifecycle === "prelaunch") assert.equal(outcome.overall.index.rawScore, null, `${label}: no pre-launch index`);
    assert.ok(!(outcome.overall.state === "solid" && outcome.overall.confidence.level === "low"), `${label}: solid with limited confidence`);
    if (outcome.overall.bandState !== null) assert.equal(outcome.overall.bandState, bandFor(outcome.overall.index.rawScore!), `${label}: band from the raw index`);
    if (outcome.overall.index.rawScore !== null) assert.equal(bandFor(outcome.overall.index.displayScore!), bandFor(outcome.overall.index.rawScore), `${label}: displayed percentage in another band`);
    const licenses = new Set<string>();
    for (const item of outcome.help.items) {
      const recommendation = outcome.recommendations.items.find((entry) => entry.id === item.recommendationId)!;
      if (recommendation.mode === "verify") assert.equal(item.offerings.length, 0, `${label}: offer on a verify-first recommendation`);
      if (item.solution.solution?.id === "operational_automation" || item.solution.solution?.id === "follow_up_automation") assert.equal(solutionContextOf(result.scoring, priorities, narrative).processMaturity, "defined", `${label}: automation without a defined process`);
      if (item.solution.alternatives.some((alternative) => alternative.id === "advertising")) assert.ok((result.scoring.dimensions.find((dimension) => dimension.id === "conversion_access")!.score ?? 0) >= 75, `${label}: ads with weak conversion`);
      for (const match of item.offerings) {
        if (match.offering.kind === "license") licenses.add(match.offering.id);
        if (narrative.lifecycle === "prelaunch") assert.equal(match.offering.kind, "service", `${label}: license before launch`);
      }
    }
    assert.ok(licenses.size <= 1, `${label}: several licenses`);
    count += 1;
  }
  assert.equal(count, 3 * 2 * substantive("q2_delivery").length * 3);
  assert.deepEqual([...states].sort(), ["developing", "insufficient", "low", "solid"]);
});
