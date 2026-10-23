import assert from "node:assert/strict";
import test from "node:test";
import { resolveEligibleQuestionsV2 as resolve } from "../../../app/features/diagnostic/qa03b/engine";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as BANK, BUYER_RECIPIENT_RULE } from "../../../app/features/diagnostic/qa03b/bank";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as OLD } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import { shouldClarifyBuyerRecipient } from "../../../app/features/diagnostic/qa03b/contract";
import { evaluateRuleV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { scoreCandidateContextualDimensionsV3 as score } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-scoring";
import { buildCandidateRecommendationsAndSolutionsV3 as recommend } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-recommendations";
import { buildCandidateNarrativeAndOverallV3 as narrate } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-narrative";
import { AUTHORED_UNKNOWN_CAPABILITIES as base } from "./qa03b-fixtures";

test("QA-03B: 21 migradas y 17 pendientes preservan versiones y lecturas R3", () => {
  assert.equal(BANK.length, 41);
  for (const status of ["migrated", "pending"]) assert.equal(BANK.filter(q => q.evidenceMigration === status).length, status === "migrated" ? 21 : 17);
  for (const old of OLD.filter(q => q.evidenceMigration === "migrated")) {
    const q = BANK.find(q => q.id === old.id)!;
    assert.equal(q.version, old.version); assert.deepEqual(q.options, old.options); assert.deepEqual(q.evidenceV3, old.evidenceV3);
  }
  assert.equal(BANK.filter(q => !q.evidenceMigration).length, 3);
});
test("QA-03B: el predicado real D2 coincide con el contrato en sectores canónicos", () => {
  const sectors = BANK.find(q => q.id === "q2_sector")!.options.map(o => o.value);
  for (const buyer of ["b2c", "b2b", "mixed", "no_direct_purchase", "unknown"]) for (const sector of sectors) for (const nonprofit of [false, true]) {
    const answers = { ...base, q2_customer_buyer: buyer, q2_sector: sector, q2_entity: nonprofit ? "organization" : "business" };
    const result = resolve(answers, BANK);
    const expected = shouldClarifyBuyerRecipient({ buyer, sector, nonprofit });
    assert.equal(evaluateRuleV2(BUYER_RECIPIENT_RULE, answers, result.context), expected, `${buyer}/${sector}/${nonprofit}`);
    assert.equal(result.activeAnswers.q2_buyer_recipient_relation !== undefined || result.eligibleQuestionIds.includes("q2_buyer_recipient_relation"), expected);
  }
});
test("QA-03B: entidad, estado actual e historia son independientes", () => {
  const individual = resolve({ ...base, q2_entity: "individual", q2_other_staff: "yes", q2_has_customers: "yes", q2_regularity: "irregular_active" }, BANK).context;
  assert.deepEqual(individual.entity, { status: "resolved", value: "individual", source: "signal" });
  assert.equal(individual.growthStage.status === "resolved" && individual.growthStage.value, "starting");
  const open = resolve(base, BANK).context;
  assert.equal(open.activity.status === "resolved" && open.activity.value, "active"); assert.equal(open.growthStage.status, "unresolved");
  const preparing = resolve({ ...base, q2_operational_status: "preparing" }, BANK).context;
  assert.equal(preparing.growthStage.status === "resolved" && preparing.growthStage.value, "idea");
  const assetsOnly = resolve({ q2_entity: "business", q2_has_customers: "yes", q2_presence_digital_base: "reliable_presence" }, BANK);
  assert.equal(assetsOnly.context.operationalStatus.status, "unresolved"); assert.equal(assetsOnly.context.activity.status, "unresolved");
  assert.ok(assetsOnly.eligibleQuestionIds.includes("q2_operational_status"));
});
test("QA-03B: el dato de personal adicional se conserva sin reclasificar a quien trabaja por cuenta propia", () => {
  const staffQuestion = BANK.find(question => question.id === "q2_other_staff")!;
  assert.match(staffQuestion.prompt, /persona remunerada.*continua/);
  assert.match(staffQuestion.hint ?? "", /proveedor ocasional.*encargo puntual/);
  assert.match(staffQuestion.options.find(option => option.value === "yes")?.label ?? "", /remunerada.*continua/);
  assert.match(staffQuestion.options.find(option => option.value === "no")?.label ?? "", /personal remunerado.*continua/);
  assert.deepEqual(staffQuestion.options.find(option => option.value === "yes")?.produces, [{ kind: "hasOtherPaidStaff", value: true, provenance: "explicit_declaration" }]);
  assert.deepEqual(staffQuestion.options.find(option => option.value === "no")?.produces, [{ kind: "hasOtherPaidStaff", value: false, provenance: "explicit_declaration" }]);
  for (const [answer, expected] of [["yes", "yes"], ["no", "no"]] as const) {
    const result = resolve({ ...base, q2_entity: "individual", q2_other_staff: answer }, BANK);
    assert.deepEqual(result.context.entity, { status: "resolved", value: "individual", source: "signal" });
    assert.deepEqual(result.context.hasOtherPaidStaff, { status: "resolved", value: expected, source: "signal" });
    assert.deepEqual(result.trace.hasOtherPaidStaff.supportingSignals, ["q2_other_staff"]);
  }
  const unknown = resolve({ ...base, q2_entity: "individual", q2_other_staff: "unknown" }, BANK);
  assert.deepEqual(unknown.context.entity, { status: "resolved", value: "individual", source: "signal" });
  assert.deepEqual(unknown.context.hasOtherPaidStaff, { status: "unresolved", reason: "declared_unknown", candidates: [] });
  const notAsked = resolve({ ...base, q2_entity: "individual", q2_other_staff: undefined }, BANK);
  assert.deepEqual(notAsked.context.hasOtherPaidStaff, { status: "unresolved", reason: "not_asked", candidates: [] });
});
test("QA-03B A: desconocido conserva incertidumbre declarada sin volverse no o no aplica", () => {
  const unresolved = resolve({ ...base, q2_entity: "unknown", q2_has_customers: "unknown", q2_other_staff: "unknown", q2_sector: "unknown" }, BANK);
  assert.deepEqual(unresolved.context.entity, { status: "unresolved", reason: "declared_unknown", candidates: [] });
  assert.equal(unresolved.context.hasEverHadRealPeople, null);
  assert.equal(unresolved.context.growthStage.status, "unresolved");
  assert.equal(unresolved.trace.history.reason, "declared_unknown");
  assert.equal(unresolved.context.activity.status, "resolved", "la respuesta operativa explícita sigue siendo independiente de una historia desconocida");
  assert.equal(unresolved.activeAnswers.q2_operations_handoffs, undefined);
  assert.equal(unresolved.activeAnswers.q2_buyer_recipient_relation, undefined);
});
test("QA-03B: pausa conserva historia y retira evidencia de operación actual", () => {
  const paused = resolve({ ...base, q2_operational_status: "paused", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "increasing", q2_b2b_pipeline: "defined", q2_customer_buyer: "b2b", q2_process_systemization: "defined", q2_reputation_flow: "strong" }, BANK);
  assert.equal(paused.context.hasEverHadRealPeople, true); assert.equal(paused.context.growthStage.status, "unresolved");
  for (const id of ["q2_regularity", "q2_demand_trend", "q2_b2b_pipeline", "q2_process_systemization", "q2_reputation_flow"]) assert.equal(paused.activeAnswers[id], undefined, id);
});
test("QA-03B: remoto, citas y lugar no fabrican ecommerce ni dos actividades", () => {
  for (const modes of [["remote_service"], ["remote_service", "other"]]) assert.equal(resolve({ ...base, q2_delivery: modes }, BANK).context.archetype.status, "unresolved");
  const single = resolve({ ...base, q2_delivery: ["physical_location", "appointments", "remote_service", "other"] }, BANK).context;
  assert.equal(single.archetype.status === "resolved" && single.archetype.value, "appointments"); assert.deepEqual(single.archetypeComponents, ["appointments"]);
  const hybrid = resolve({ ...base, q2_delivery: ["retail", "online_checkout"] }, BANK).context;
  assert.equal(hybrid.archetype.status === "resolved" && hybrid.archetype.value, "hybrid"); assert.deepEqual(hybrid.archetypeComponents, ["ecommerce", "retail"]);
  assert.equal(resolve({ ...base, q2_delivery: ["remote_service", "unsure"] }, BANK).activeAnswers.q2_delivery, undefined);
});
test("QA-03B B: herramientas TIC se preguntan solo en operación relevante y no crean evidencia de eficacia", () => {
  const answers = { ...base, q2_operational_status: "operating", q2_goal: "organize" };
  const eligible = resolve(answers, BANK);
  assert.ok(eligible.eligibleQuestionIds.includes("q2_digital_tools_in_use"));
  const withTools = resolve({ ...answers, q2_digital_tools_in_use: ["documents_records", "customer_followup"] }, BANK);
  assert.deepEqual(withTools.context.digitalToolUse, { status: "resolved", value: "documents_records|customer_followup", source: "signal" });
  assert.equal(withTools.trace.digitalToolUse.status, "resolved");
  assert.deepEqual(withTools.trace.digitalToolUse.supportingSignals, ["q2_digital_tools_in_use"]);
  const toolsQuestion = BANK.find(question => question.id === "q2_digital_tools_in_use")!;
  assert.equal(toolsQuestion.evidenceMigration, undefined);
  assert.equal(toolsQuestion.options.find(option => option.value === "none")?.kind, "none");
  assert.equal(toolsQuestion.options.find(option => option.value === "not_needed")?.kind, "not_applicable");
  assert.equal(toolsQuestion.options.find(option => option.value === "unknown")?.kind, "unknown");
  const none = resolve({ ...answers, q2_digital_tools_in_use: ["none"] }, BANK);
  assert.deepEqual(none.context.digitalToolUse, { status: "resolved", value: "none", source: "signal" });
  const notNeeded = resolve({ ...answers, q2_digital_tools_in_use: ["not_needed"] }, BANK);
  assert.deepEqual(notNeeded.context.digitalToolUse, { status: "resolved", value: "not_needed", source: "signal" });
  const unknown = resolve({ ...answers, q2_digital_tools_in_use: ["unknown"] }, BANK);
  assert.deepEqual(unknown.context.digitalToolUse, { status: "unresolved", reason: "declared_unknown", candidates: [] });
  const notAsked = resolve(answers, BANK);
  assert.deepEqual(notAsked.context.digitalToolUse, { status: "unresolved", reason: "not_asked", candidates: [] });
  const describedNone = narrate({ answers: { ...answers, q2_digital_tools_in_use: ["none"] } }).narrative.executiveSummary.find(block => block.id === "summary:digital-tools");
  assert.match(describedNone?.text ?? "", /no usas herramientas digitales/);
  assert.deepEqual(describedNone?.sourceQuestionIds, ["q2_digital_tools_in_use"]);
  assert.equal(describedNone?.dimension, undefined, "el resumen descriptivo no se presenta como capacidad evaluada");
  const describedNotNeeded = narrate({ answers: { ...answers, q2_digital_tools_in_use: ["not_needed"] } }).narrative.executiveSummary.find(block => block.id === "summary:digital-tools");
  assert.match(describedNotNeeded?.text ?? "", /no consideras necesarias herramientas digitales/);
  const describedTools = narrate({ answers: { ...answers, q2_digital_tools_in_use: ["documents_records", "customer_followup"] } }).narrative.executiveSummary.find(block => block.id === "summary:digital-tools");
  assert.match(describedTools?.text ?? "", /Documentos o tablas.*Herramientas para registrar consultas/);
  assert.equal(describedTools?.dimension, undefined, "la lista de herramientas no se presenta como capacidad evaluada");
  for (const value of [["none"], ["not_needed"], ["unknown"]]) {
    assert.deepEqual(score({ answers }).dimensions, score({ answers: { ...answers, q2_digital_tools_in_use: value } }).dimensions);
    assert.deepEqual(recommend({ answers }).recommendations, recommend({ answers: { ...answers, q2_digital_tools_in_use: value } }).recommendations);
  }
  for (const value of [["unknown"], undefined]) {
    assert.equal(narrate({ answers: { ...answers, q2_digital_tools_in_use: value } }).narrative.executiveSummary.some(block => block.id === "summary:digital-tools"), false);
  }
  const paused = resolve({ ...answers, q2_operational_status: "paused" }, BANK);
  assert.ok(!paused.eligibleQuestionIds.includes("q2_digital_tools_in_use"));
  assert.deepEqual(score({ answers }).dimensions, score({ answers: { ...answers, q2_digital_tools_in_use: ["documents_records"] } }).dimensions);
  assert.deepEqual(recommend({ answers }).recommendations, recommend({ answers: { ...answers, q2_digital_tools_in_use: ["documents_records"] } }).recommendations);
});
test("QA-03B C: recomendaciones conservan la cadena de respuesta, hecho, dimensión e interpretación", () => {
  const answers = { ...base, q2_operational_status: "operating", q2_has_customers: "yes", q2_customer_buyer: "b2c", q2_goal: "measure" };
  const result = recommend({ answers });
  const active = resolve(answers, BANK).activeAnswers;
  const facts = new Map(result.semanticFacts.facts.map(fact => [fact.id, fact]));
  for (const item of result.recommendations.items) {
    const priority = facts.get(`priority:${item.rank}`);
    assert.ok(priority, `${item.id}: recommendation has a semantic priority fact`);
    assert.equal(priority.dimension, item.dimension);
    assert.equal(item.sourcePriority.rank, item.rank);
    assert.equal(item.sourcePriority.constraintId, item.sourceConstraint.id);
    assert.ok(facts.has(priority.priority!.targetFactId), `${item.id}: priority points to an interpreted target fact`);
    for (const factId of item.sourceFactIds) assert.ok(facts.has(factId), `${item.id}: source fact ${factId} exists`);
    for (const questionId of item.sourceQuestionIds) assert.ok(active[questionId] !== undefined, `${item.id}: source response ${questionId} is active`);
    for (const questionId of item.evidence.sourceQuestionIds) assert.ok(active[questionId] !== undefined, `${item.id}: evidence response ${questionId} is active`);
  }
  const measurement = result.recommendations.items.find(item => item.dimension === "measurement_optimization");
  const measurementScore = result.scoring.dimensions.find(item => item.id === "measurement_optimization")!;
  assert.equal(measurementScore.score, null, "measurement remains unscored without a direct R3 source");
  if (measurement) {
    assert.equal(measurement.mode, "verify");
    assert.equal(measurement.sourceConstraint.score, null);
    assert.equal(measurement.framing, "verify_first");
  }
});
test("QA-03B: alcance/comprador unknown y financiación siguen neutrales", () => {
  const result = score({ answers: base });
  assert.equal(result.context.customerModel.reach.status, "unresolved"); assert.equal(result.context.customerModel.buyer.status, "unresolved");
  assert.ok(result.dimensions.every(d => d.score === null));
  const nonprofit = resolve({ ...base, q2_entity: "organization", q2_monetization: "mission", q2_customer_buyer: "no_direct_purchase" }, BANK);
  assert.equal(nonprofit.context.funding, "donations_grants_contributions"); assert.equal(nonprofit.context.buyerDisposition, "no_direct_purchase");
  assert.equal(nonprofit.context.customerModel.buyer.status, "unresolved"); assert.ok(!nonprofit.eligibleQuestionIds.includes("q2_b2b_pipeline"));
});

test("QA-03B: rechaza IDs duplicados antes de evaluar el banco", () => {
  const duplicated = [BANK[0]!, BANK[0]!];
  assert.throws(() => resolve({}, duplicated), /identificadores de preguntas duplicados/);
});

test("QA-03B: descarta respuestas de preguntas inexistentes", () => {
  const result = resolve({ __unknown_question__: "yes" }, BANK);
  assert.equal(Object.hasOwn(result.activeAnswers, "__unknown_question__"), false);
});
