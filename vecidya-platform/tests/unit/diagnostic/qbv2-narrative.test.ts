import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DIGITAL_DIMENSION_IDS, GOLDEN_PERSONAS, HARSH_RESULT_PHRASES, NARRATIVE_FILLER_PHRASES, QUESTION_BANK_V2, TERMINOLOGY, buildDiagnosticNarrative, canClaimStage, deriveConstraintsAndPriorities,
  deriveSemanticFacts, narrativeBlocks, resolveEligibleQuestionsV2, resolveTerm, resolveTerminologyProfile, resultCertainty, runGoldenPersonaPipeline, scoreContextualDimensions,
  type AnswersV2, type DiagnosticNarrative, type SemanticFact,
} from "../../../app/features/diagnostic/index.ts";

/** DIAG-V3-08G — narrativa determinista sobre el motor y la capa de lenguaje congelados. */

function run(answers: AnswersV2) {
  const scoring = scoreContextualDimensions({ answers, context: {}, evidence: [] });
  const priorities = deriveConstraintsAndPriorities(scoring);
  const semanticFacts = deriveSemanticFacts({ answers, scoring, priorities });
  return { answers, scoring, priorities, semanticFacts, narrative: buildDiagnosticNarrative({ answers, scoring, priorities, semanticFacts }) };
}
const GOLDEN = Object.fromEntries(GOLDEN_PERSONAS.map((persona) => [persona.id, run(runGoldenPersonaPipeline(persona).answers)]));
const sentences = (text: string) => text.split(/(?<=[.!?])\s+/).filter((part) => part.trim().length > 0).length;
const allText = (narrative: DiagnosticNarrative) => narrativeBlocks(narrative).map((block) => block.text).join(" ");
const factById = (facts: readonly SemanticFact[], id: string) => facts.find((fact) => fact.id === id);

test("08G determinism: the same diagnostic outputs always produce the same serializable narrative, without mutating inputs", () => {
  for (const [id, result] of Object.entries(GOLDEN)) {
    const before = JSON.stringify([result.scoring, result.priorities, result.semanticFacts]);
    const again = buildDiagnosticNarrative({ answers: result.answers, scoring: result.scoring, priorities: result.priorities, semanticFacts: result.semanticFacts });
    assert.deepEqual(again, result.narrative, id);
    assert.deepEqual(JSON.parse(JSON.stringify(again)), again, `${id}: plain data, no UI markup or functions`);
    assert.equal(JSON.stringify([result.scoring, result.priorities, result.semanticFacts]), before, `${id}: inputs untouched`);
    assert.ok(!/[<>]/.test(allText(result.narrative)), `${id}: no markup in domain text`);
  }
});

test("08G certainty: a 100 with low confidence is a positive signal, never confirmed excellence; certainty is never upgraded", () => {
  const conversion = GOLDEN.local_service_business!.narrative.dimensions.find((item) => item.dimension === "conversion_access")!;
  assert.deepEqual([conversion.score, conversion.confidence, conversion.status, conversion.certainty], [100, "low", "positive_signal", "probable"]);
  assert.match(conversion.interpretation.text, /poca evidencia/);
  for (const [id, result] of Object.entries(GOLDEN)) {
    const facts = result.semanticFacts.facts;
    for (const block of narrativeBlocks(result.narrative)) for (const factId of block.sourceFactIds) {
      const fact = factById(facts, factId)!;
      if (["strength", "partial", "weakness"].includes(fact.type) && block.kind !== "summary" && block.kind !== "current_state" && block.kind !== "constraint") assert.equal(block.certainty, resultCertainty(fact), `${id}: ${block.id}`);
    }
    for (const strength of result.narrative.strengths) {
      const fact = factById(facts, strength.sourceFactIds[0]!)!;
      if (fact.certainty !== "confirmed") assert.match(strength.text, /^Hay señales de que .*poca evidencia\.$/, `${id}: signal strength stays cautious`);
    }
    for (const dimension of result.narrative.dimensions) if (dimension.status === "strong") assert.equal(dimension.certainty, "confirmed", `${id}: ${dimension.dimension}`);
  }
});

test("08G absence of evidence: a null score is never a weakness or a percentage", () => {
  for (const [id, result] of Object.entries(GOLDEN)) for (const dimension of result.narrative.dimensions) {
    const scored = result.scoring.dimensions.find((item) => item.id === dimension.dimension)!;
    if (scored.score === null) {
      assert.ok(["uncertain", "not_assessed", "not_applicable"].includes(dimension.status), `${id}: ${dimension.dimension} → ${dimension.status}`);
      assert.equal(dimension.score, null);
      assert.ok(!result.narrative.weaknesses.some((block) => block.dimension === dimension.dimension && block.kind !== "dependency"), `${id}: ${dimension.dimension} listed as weak without a score`);
    }
    assert.ok(!/%/.test(allText(result.narrative)), `${id}: no percentages in prose`);
  }
  const idea = GOLDEN.idea_early_stage!.narrative;
  assert.deepEqual(idea.weaknesses, [], "pre-launch gaps are not weaknesses");
});

test("08G contradictions keep both sides visible and never expose internal codes", () => {
  const retail = GOLDEN.physical_retail!.narrative.contradictions[0]!;
  assert.match(retail.text, /funciona bien en cuanto a la forma en que te descubre la gente de tu zona, pero no en cuanto a la comunicación de ofertas/);
  const nonprofit = GOLDEN.nonprofit_community!.narrative.contradictions[0]!;
  assert.match(nonprofit.text, /la facilidad para donar.*pero no en cuanto a la proporción de personas interesadas que da el paso/);
  const declared = GOLDEN.appointment_business!.narrative.contradictions[0]!;
  assert.match(declared.text, /^Señalaste como principal freno «Se me pierden contactos o pendientes por falta de seguimiento», pero el seguimiento se ve sólido/);
  assert.ok(declared.sourceQuestionIds.includes("q2_friction"));
  for (const [id, result] of Object.entries(GOLDEN)) {
    assert.equal(result.narrative.contradictions.length, result.semanticFacts.facts.filter((fact) => fact.type === "contradiction").length, `${id}: no contradiction hidden`);
    assert.ok(!/\b[a-z]+_[a-z_]+\b|\bq2\b/.test(allText(result.narrative)), `${id}: internal code leaked`);
  }
});

test("08G pre-launch: preparation language, legitimate uncertainty and no operating-business claims", () => {
  const { narrative } = GOLDEN.idea_early_stage!;
  assert.deepEqual([narrative.lifecycle, narrative.profile], ["prelaunch", "prelaunch"]);
  assert.match(narrative.executiveSummary[0]!.text, /^Tu proyecto está en preparación/);
  assert.ok(narrative.uncertainties.some((block) => block.kind === "evidence_gap" && /aún no está en marcha/.test(block.text)));
  for (const dimension of narrative.dimensions.filter((item) => item.status === "not_applicable")) assert.match(dimension.interpretation.text, /cuando haya actividad real/);
  assert.ok(!/\bclientes?\b|\bventas?\b|pierde|perdiendo/i.test(allText(narrative)), "nothing presupposes an operating business");
  assert.equal(narrative.priorities[0]!.certainty, "unknown");
});

test("08G terminology: the frozen resolver drives every narrative; no wrong-context nouns leak", () => {
  for (const [id, result] of Object.entries(GOLDEN)) {
    const context = resolveEligibleQuestionsV2(result.answers, QUESTION_BANK_V2).context;
    const profile = resolveTerminologyProfile(context, result.answers);
    assert.equal(result.narrative.profile, profile, id);
    assert.ok(result.narrative.currentState.text.startsWith(TERMINOLOGY[profile].terms.business.replace(/^t/, "T")), `${id}: business noun from the resolver`);
    const text = allText(result.narrative).toLowerCase();
    for (const term of TERMINOLOGY[profile].avoid) assert.ok(!new RegExp(`(^|[^\\p{L}])${term}`, "u").test(text), `${id}: «${term}» in ${profile}`);
  }
  for (const id of ["appointment_business", "professional_appointments", "nonprofit_community"]) assert.ok(!/\bclientes?\b/i.test(allText(GOLDEN[id]!.narrative)), `${id}: «cliente» leaked`);
  assert.match(allText(GOLDEN.appointment_business!.narrative), /tus pacientes/);
  assert.match(allText(GOLDEN.nonprofit_community!.narrative), /apoyar o participar/);
  assert.match(allText(GOLDEN.b2b_business!.narrative), /llegue a contratar/);
});

test("08G lifecycle continuity: a result names a lifecycle stage only when its evidence observed it", () => {
  for (const [id, result] of Object.entries(GOLDEN)) {
    const customer = resolveTerm("customer", result.narrative.profile);
    for (const block of narrativeBlocks(result.narrative)) {
      assert.ok(!/clientes perdidos|pierdes clientes/i.test(block.text), `${id}: ${block.id}`);
      if (!block.text.includes(customer)) continue;
      const facts = block.sourceFactIds.map((factId) => factById(result.semanticFacts.facts, factId)!).filter((fact) => ["strength", "partial", "weakness"].includes(fact.type));
      assert.ok(facts.some((fact) => canClaimStage(fact, "customer")), `${id}: ${block.id} names «${customer}» without customer-stage evidence`);
    }
  }
  // Interés que no avanza se describe en la etapa de interés; el seguimiento negativo, en la etapa que lo observó.
  assert.ok(GOLDEN.professional_appointments!.narrative.weaknesses.some((block) => /seguimiento a las solicitudes de cita se pierde/.test(block.text)));
});

test("08G priorities: 08D order, primary constraint and dependency explanation are preserved, never reordered", () => {
  for (const [id, result] of Object.entries(GOLDEN)) {
    const { narrative, priorities } = result;
    assert.deepEqual(narrative.priorities.map((item) => [item.rank, item.dimension]), priorities.priorities.map((item) => [item.rank, item.dimension]), id);
    assert.equal(narrative.primaryConstraint?.dimension ?? null, priorities.priorities[0]?.dimension ?? null, id);
    assert.ok(narrative.priorities.length <= 3);
    for (const item of narrative.priorities) {
      const source = priorities.priorities.find((priority) => priority.rank === item.rank)!;
      if (/señalaste como principal freno/i.test(item.why.text)) assert.ok(source.reasonCodes.includes("friction_primary"), `${id}: relevance claim without its reason`);
      if (/^De esta base depende/.test(item.why.text)) assert.ok(source.reasonCodes.includes("capacity_gate") && source.dependency.blocks.length > 0, `${id}: gate claim without dependency`);
    }
  }
  const nonprofit = GOLDEN.nonprofit_community!.narrative.priorities[1]!;
  assert.match(nonprofit.why.text, /ya funciona, así que el interés llega, pero puede estar perdiéndose en este punto/, "bottleneck explained with probable language");
  assert.match(GOLDEN.professional_appointments!.narrative.primaryConstraint!.text, /De esta base depende poder sostener la forma en que te encuentran y el seguimiento/);
  assert.equal(GOLDEN.appointment_business!.narrative.primaryConstraint, null, "no constraint is invented when 08D has none");
});

test("08G provenance: every block traces to facts, a priority or context; sources are real", () => {
  for (const [id, result] of Object.entries(GOLDEN)) {
    const factIds = new Set(result.semanticFacts.facts.map((fact) => fact.id));
    for (const block of narrativeBlocks(result.narrative)) {
      for (const factId of block.sourceFactIds) assert.ok(factIds.has(factId), `${id}: ${block.id} cites unknown fact ${factId}`);
      for (const questionId of block.sourceQuestionIds) assert.ok(result.answers[questionId] !== undefined, `${id}: ${block.id} cites unanswered ${questionId}`);
      const notAssessed = block.kind === "dimension" && result.narrative.dimensions.find((item) => item.dimension === block.dimension)?.status === "not_assessed";
      assert.ok(block.sourceFactIds.length > 0 || block.sourceContext.length > 0 || notAssessed || block.kind === "dimension", `${id}: ${block.id} has no provenance`);
    }
    for (const item of result.narrative.priorities) assert.ok(item.statement.sourceFactIds.includes(`priority:${item.rank}`));
  }
});

test("08G tone: no harsh phrases, generic filler or marketing hype", () => {
  for (const [id, result] of Object.entries(GOLDEN)) {
    const text = allText(result.narrative).toLowerCase();
    for (const phrase of [...HARSH_RESULT_PHRASES, ...NARRATIVE_FILLER_PHRASES, "excelente", "increíble", "fracaso", "urgente que"]) assert.ok(!text.includes(phrase), `${id}: «${phrase}»`);
    assert.ok(!/esto es (la razón|el motivo) por la que|por eso tus ventas/.test(text), `${id}: unsupported causal claim`);
  }
});

test("08G length bounds and no repeated sentences inside one narrative", () => {
  for (const [id, result] of Object.entries(GOLDEN)) {
    const { narrative } = result;
    const summarySentences = narrative.executiveSummary.reduce((total, block) => total + sentences(block.text), 0);
    assert.ok(summarySentences >= 2 && summarySentences <= 4, `${id}: summary ${summarySentences}`);
    for (const dimension of narrative.dimensions) assert.ok(sentences(dimension.interpretation.text) >= 1 && sentences(dimension.interpretation.text) <= 3, `${id}: ${dimension.dimension}`);
    if (narrative.primaryConstraint) assert.ok(sentences(narrative.primaryConstraint.text) <= 2, `${id}: constraint`);
    for (const item of narrative.priorities) assert.ok(sentences(item.why.text) <= 2 && sentences(item.statement.text) === 1, `${id}: priority ${item.rank}`);
    assert.ok(narrative.strengths.length <= 3 && narrative.weaknesses.length <= 4);
    const texts = narrativeBlocks(narrative).map((block) => block.text).filter((text) => !/^(El recorrido no incluyó|Este punto queda sin lectura|Esto se podrá evaluar|No aplica)/.test(text));
    assert.equal(new Set(texts).size, texts.length, `${id}: repeated sentence`);
    assert.ok(allText(narrative).length < 4000, `${id}: narrative too long`);
  }
});

test("08G all 12 golden narratives are complete and their statuses follow the Semantic Facts", () => {
  assert.equal(Object.keys(GOLDEN).length, 12);
  for (const [id, result] of Object.entries(GOLDEN)) {
    const { narrative, semanticFacts } = result;
    assert.deepEqual(narrative.dimensions.map((item) => item.dimension), [...DIGITAL_DIMENSION_IDS], id);
    for (const dimension of narrative.dimensions) {
      const reading = semanticFacts.facts.find((fact) => fact.dimension === dimension.dimension && ["strength", "partial", "weakness"].includes(fact.type));
      const expected = !reading ? undefined : reading.type === "strength" ? (reading.certainty === "confirmed" ? "strong" : "positive_signal") : reading.type === "partial" ? "partial" : "weak";
      if (expected) assert.equal(dimension.status, expected, `${id}: ${dimension.dimension}`);
      assert.ok(dimension.headline.startsWith(dimension.label));
    }
    assert.ok(narrative.executiveSummary.length >= 2 && narrative.currentState.text.length > 0 && narrative.nextFocus.text.length > 0, id);
  }
});

test("08G cross-persona: narratives differ in substance, not only in nouns", () => {
  const compared = ["local_service_business", "appointment_business", "professional_appointments", "ecommerce", "b2b_business", "creator_personal_brand", "nonprofit_community", "operations_heavy", "idea_early_stage"];
  const skeleton = (id: string) => {
    const { narrative } = GOLDEN[id]!;
    const terms = TERMINOLOGY[narrative.profile].terms;
    let text = [...narrative.executiveSummary, narrative.currentState, ...narrative.priorities.map((item) => item.statement)].map((block) => block.text).join(" ");
    for (const value of Object.values(terms)) text = text.split(value).join("·").split(value.replace(/^t/, "T")).join("·");
    return text;
  };
  const skeletons = compared.map(skeleton);
  assert.equal(new Set(skeletons).size, compared.length, "two archetypes share the same narrative skeleton");
  const primaryFocus = new Set(compared.map((id) => GOLDEN[id]!.narrative.priorities[0]?.dimension ?? "none"));
  assert.ok(primaryFocus.size >= 5, `only ${primaryFocus.size} distinct first focuses`);
});

test("08G generated routes: 972 real routes (both answer policies, so nonprofit routes included) produce valid narratives (no gaps in templates, terminology, order or repetition)", async () => {
  const { buildQuestionPlan, ROUTE_HARD_CAP } = await import("../../../app/features/diagnostic/index.ts");
  const byId = new Map(QUESTION_BANK_V2.map((question) => [question.id, question]));
  const substantive = (id: string) => byId.get(id)!.options.filter((option) => option.kind !== "unknown" && option.kind !== "not_applicable").map((option) => option.value);
  const pick = (id: string, policy: "first" | "last") => {
    const question = byId.get(id)!;
    const options = question.options.filter((option) => option.kind !== "unknown" && option.kind !== "not_applicable" && !option.exclusive);
    const option = (policy === "first" ? options[0] : options[options.length - 1]) ?? question.options[0]!;
    return question.type === "multi" ? [option.value] : option.value;
  };
  const stages = { idea: { q2_entity: "project", q2_has_customers: "no" }, starting: { q2_has_customers: "yes", q2_regularity: "irregular" }, operating: { q2_has_customers: "yes", q2_regularity: "regular" } };
  let count = 0;
  for (const policy of ["first", "last"] as const) for (const stageSeed of Object.values(stages)) for (const delivery of substantive("q2_delivery")) for (const goal of ["opportunities", "measure", "organize"]) for (const friction of substantive("q2_friction")) {
    const answers: Record<string, string | readonly string[]> = { ...stageSeed, q2_delivery: delivery, q2_goal: goal, q2_friction: friction };
    for (let batch = 0; batch <= ROUTE_HARD_CAP; batch += 1) {
      const plan = buildQuestionPlan({ answers, bank: QUESTION_BANK_V2 });
      if (plan.selectedQuestionIds.length === 0) break;
      for (const id of plan.selectedQuestionIds) answers[id] = pick(id, policy);
    }
    const result = run(answers);
    const label = JSON.stringify({ policy, ...stageSeed, delivery, goal, friction });
    const texts = narrativeBlocks(result.narrative).map((block) => block.text);
    const text = texts.join(" ");
    assert.ok(!/undefined|null|NaN|\$\{|\bde el\b|\ba el\b|\b[a-z]+_[a-z_]+\b/.test(text), `${label}: template gap`);
    const summary = result.narrative.executiveSummary.reduce((total, block) => total + sentences(block.text), 0);
    assert.ok(summary >= 2 && summary <= 4, `${label}: summary length`);
    for (const term of TERMINOLOGY[result.narrative.profile].avoid) assert.ok(!new RegExp(`(^|[^\p{L}])${term}`, "u").test(text.toLowerCase()), `${label}: «${term}»`);
    assert.deepEqual(result.narrative.priorities.map((item) => item.dimension), result.priorities.priorities.map((item) => item.dimension), `${label}: order`);
    const meaningful = texts.filter((item) => !/^(El recorrido no incluyó|Este punto queda sin lectura|Esto se podrá evaluar|No aplica)/.test(item));
    assert.equal(new Set(meaningful).size, meaningful.length, `${label}: repeated sentence`);
    count += 1;
  }
  assert.equal(count, 972);
});
