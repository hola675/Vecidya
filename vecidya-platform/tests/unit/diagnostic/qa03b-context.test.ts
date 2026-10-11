import assert from "node:assert/strict";
import test from "node:test";
import { resolveEligibleQuestionsV2 as resolve } from "../../../app/features/diagnostic/qa03b/engine";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as BANK, BUYER_RECIPIENT_RULE } from "../../../app/features/diagnostic/qa03b/bank";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as OLD } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import { shouldClarifyBuyerRecipient } from "../../../app/features/diagnostic/qa03b/contract";
import { evaluateRuleV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { scoreCandidateContextualDimensionsV3 as score } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-scoring";
import { AUTHORED_UNKNOWN_CAPABILITIES as base } from "./qa03b-fixtures";

test("QA-03B: 21 migradas y 17 pendientes preservan versiones y lecturas R3", () => {
  assert.equal(BANK.length, 40);
  for (const status of ["migrated", "pending"]) assert.equal(BANK.filter(q => q.evidenceMigration === status).length, status === "migrated" ? 21 : 17);
  for (const old of OLD.filter(q => q.evidenceMigration === "migrated")) {
    const q = BANK.find(q => q.id === old.id)!;
    assert.equal(q.version, old.version); assert.deepEqual(q.options, old.options); assert.deepEqual(q.evidenceV3, old.evidenceV3);
  }
  assert.equal(BANK.filter(q => !q.evidenceMigration).length, 2);
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
test("QA-03B: alcance/comprador unknown y financiación siguen neutrales", () => {
  const result = score({ answers: base });
  assert.equal(result.context.customerModel.reach.status, "unresolved"); assert.equal(result.context.customerModel.buyer.status, "unresolved");
  assert.ok(result.dimensions.every(d => d.score === null));
  const nonprofit = resolve({ ...base, q2_entity: "organization", q2_monetization: "mission", q2_customer_buyer: "no_direct_purchase" }, BANK);
  assert.equal(nonprofit.context.funding, "donations_grants_contributions"); assert.equal(nonprofit.context.buyerDisposition, "no_direct_purchase");
  assert.equal(nonprofit.context.customerModel.buyer.status, "unresolved"); assert.ok(!nonprofit.eligibleQuestionIds.includes("q2_b2b_pipeline"));
});
