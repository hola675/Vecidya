import assert from "node:assert/strict";
import test from "node:test";
import { resolveDiagnosticContext } from "../../../app/features/diagnostic/context-resolver";
import { CURRENT_QUESTION_BANK_VERSION } from "../../../app/features/diagnostic/contracts";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { renderQuestionV2 } from "../../../app/features/diagnostic/qbv2-copy";
import { deriveContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import type { QuestionDefinitionV2 } from "../../../app/features/diagnostic/qbv2-contract";
import { futureB2BApplicability } from "../../../app/features/diagnostic/qbv2-future-routing";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as candidate } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_CLASSIFICATION_QUESTIONS_V2 as classification } from "../../../app/features/diagnostic/qbv2-reviewed-classification";
import { evaluateRuleV2, type AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";
import { NICHE_GROUP_REGISTRY } from "../../../app/features/diagnostic/taxonomy";

const ids = ["q2_entity", "q2_other_staff", "q2_monetization", "q2_delivery", "q2_has_customers", "q2_regularity", "q2_demand_trend", "q2_goal", "q2_friction", "q2_appointments_noshow", "q2_ecommerce_traffic_sources", "q2_b2b_pipeline", "q2_sector", "q2_customer_reach", "q2_customer_buyer", "q2_process_systemization", "q2_capacity_signal"];
const question = (id: string, bank: readonly QuestionDefinitionV2[] = candidate) => bank.find((item) => item.id === id)!;
const resolve = (answers: AnswersV2) => resolveEligibleQuestionsV2(answers, candidate);
const rendered = (id: string, answers: AnswersV2) => {
  const state = resolve(answers);
  return renderQuestionV2(question(id), { context: state.context, answers });
};

test("R2C classification slice and full candidate order remain isolated, with semantic versions pinned", () => {
  assert.deepEqual(classification.map(({ id }) => id), ids.slice(12, 15));
  assert.deepEqual(candidate.slice(0, ids.length).map(({ id }) => id), ids);
  assert.deepEqual(candidate.slice(ids.length).map(({ id }) => id), ["q2_discovery_reliable_reach", "q2_local_presence_consistency", "q2_reputation_flow"]);
  assert.equal(new Set(candidate.map(({ id }) => id)).size, 20);
  assert.ok(!candidate.some(({ id }) => /^q2_(?:10|11|12|13|17|18)\b/.test(id)));
  assert.deepEqual(validateQuestionBankV2(candidate), []);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.deepEqual(Object.fromEntries(classification.map(({ id, version }) => [id, version])), { q2_sector: 2, q2_customer_reach: 2, q2_customer_buyer: 2 });
});

test("community_social is additive; legacy nonprofit_community remains resolvable and unchanged in QBV2", () => {
  assert.ok(NICHE_GROUP_REGISTRY.some(({ id }) => id === "community_social"));
  assert.ok(NICHE_GROUP_REGISTRY.some(({ id }) => id === "nonprofit_community"));
  const legacySector = question("q2_sector", QUESTION_BANK_V2);
  assert.equal(legacySector.version, 1);
  assert.deepEqual(legacySector.options.map(({ value }) => value), ["health_wellness", "beauty_personal_care", "legal", "financial_tax_insurance", "professional_services", "home_services", "automotive", "real_estate", "food_hospitality", "retail", "education_coaching", "creative_media", "technology_software", "nonprofit_community", "other"]);
  assert.deepEqual(legacySector.options.find(({ value }) => value === "nonprofit_community")?.produces, [{ kind: "nicheGroup", value: "nonprofit_community", provenance: "explicit_declaration" }]);
  const legacy = resolveEligibleQuestionsV2({ q2_entity: "organization", q2_sector: "nonprofit_community" }, QUESTION_BANK_V2);
  assert.deepEqual(legacy.context.entity, { status: "resolved", value: "organization", source: "signal" });
  assert.deepEqual(legacy.context.nicheGroup, { status: "resolved", value: "nonprofit_community", source: "signal" });
  assert.equal(legacySector.appliesWhen, undefined);
});

test("sector is context only and does not infer entity, business model, archetype, or diagnostic evidence", () => {
  const examples: readonly [string, string][] = [["organization", "education_coaching"], ["organization", "health_wellness"], ["organization", "community_social"], ["business", "food_hospitality"], ["individual", "professional_services"]];
  for (const [entity, sector] of examples) {
    const state = resolve({ q2_entity: entity, q2_sector: sector });
    assert.deepEqual(state.context.entity, { status: "resolved", value: entity, source: "signal" });
    assert.deepEqual(state.context.nicheGroup, { status: "resolved", value: sector, source: "signal" });
    assert.equal(state.context.archetype.status, "unresolved", `${entity}/${sector}`);
    assert.equal(state.context.businessModel.status, "unresolved", `${entity}/${sector}`);
    assert.deepEqual(deriveContextualEvidence({ q2_entity: entity, q2_sector: sector }, candidate), []);
  }
  const organization = rendered("q2_sector", { q2_entity: "organization" });
  assert.equal(organization.prompt, "¿A qué se dedica principalmente tu organización?");
  const community = resolve({ q2_entity: "business", q2_sector: "community_social" });
  assert.equal(community.context.entity.value, "business", "community sector cannot infer an organization");
  assert.equal(question("q2_sector").options.find(({ value }) => value === "other")?.produces[0]?.kind, "nicheGroupOther");
});

test("reach is gated on resolved activity and copy variants have deliberate priority", () => {
  assert.ok(!resolve({}).eligibleQuestionIds.includes("q2_customer_reach"));
  assert.ok(!resolve({ q2_entity: "business" }).eligibleQuestionIds.includes("q2_customer_reach"));
  const active = { q2_entity: "business", q2_has_customers: "yes" } as const;
  const prelaunch = { q2_entity: "business", q2_has_customers: "no" } as const;
  const activeOrg = { q2_entity: "organization", q2_has_customers: "yes" } as const;
  const prelaunchOrg = { q2_entity: "organization", q2_has_customers: "no" } as const;
  const activeNonprofit = { q2_entity: "business", q2_has_customers: "yes", q2_monetization: "mission" } as const;
  assert.ok(resolve(active).eligibleQuestionIds.includes("q2_customer_reach"));
  assert.equal(rendered("q2_customer_reach", active).prompt, "¿Dónde están principalmente tus clientes?");
  assert.equal(rendered("q2_customer_reach", prelaunch).prompt, "¿Dónde están principalmente las personas a las que quieres llegar?");
  assert.equal(rendered("q2_customer_reach", activeOrg).prompt, "¿Dónde están principalmente las personas a las que atiende tu organización?");
  assert.equal(resolve(activeNonprofit).context.businessModel.value, "nonprofit");
  assert.equal(rendered("q2_customer_reach", activeNonprofit).prompt, "¿Dónde están principalmente las personas a las que atiende tu organización?");
  assert.equal(rendered("q2_customer_reach", prelaunchOrg).prompt, "¿Dónde están principalmente las personas a las que quieres llegar?", "prelaunch wording takes precedence for an organization");
  assert.ok((question("q2_customer_reach").hint?.length ?? 999) <= 140);
});

test("each reach answer resolves only customerReach and contributes no diagnostic evidence", () => {
  for (const value of ["local", "regional", "national", "global", "mixed"] as const) {
    const answers = { q2_has_customers: "yes", q2_customer_reach: value } as const;
    const state = resolve(answers);
    assert.deepEqual(state.context.customerModel.reach, { status: "resolved", value, source: "signal" });
    assert.deepEqual(deriveContextualEvidence(answers, candidate), []);
    const signal = question("q2_customer_reach").options.find((option) => option.value === value)?.produces;
    assert.deepEqual(signal, [{ kind: "customerReach", value, provenance: "explicit_declaration" }]);
  }
});

test("buyer answers resolve only CustomerBuyer; reviewed B2B question follows future applicability", () => {
  const base = { q2_entity: "business", q2_has_customers: "yes" } as const;
  for (const value of ["b2c", "b2b", "mixed"] as const) {
    const answers = { ...base, q2_customer_buyer: value };
    const state = resolve(answers);
    assert.deepEqual(state.context.customerModel.buyer, { status: "resolved", value, source: "signal" });
    assert.deepEqual(deriveContextualEvidence(answers, candidate), []);
    assert.equal(evaluateRuleV2(futureB2BApplicability(), answers, state.context), value !== "b2c");
    assert.equal(state.context.archetype.status, "unresolved");
    assert.equal(state.context.businessModel.status, "unresolved");
    assert.equal(state.context.growthStage.value, "starting");
    assert.ok(candidate.some(({ module }) => module === "b2b"));
    assert.equal(state.eligibleQuestionIds.some((id) => question(id).module === "b2b"), value !== "b2c");
  }
});

test("legacy reach and buyer contracts retain their versions, options, productions, gates, and context", () => {
  for (const id of ["q2_customer_reach", "q2_customer_buyer"]) {
    const legacy = question(id, QUESTION_BANK_V2);
    assert.equal(legacy.version, 1);
    assert.equal(legacy.appliesWhen, undefined);
    assert.deepEqual(legacy.options.map(({ value }) => value), id === "q2_customer_reach" ? ["local", "regional", "national", "global", "mixed"] : ["b2c", "b2b", "mixed"]);
  }
  const expectedProductions = {
    q2_customer_reach: ["local", "regional", "national", "global", "mixed"].map((value) => ({ value, produces: [{ kind: "customerReach", value, provenance: "explicit_declaration" }] })),
    q2_customer_buyer: ["b2c", "b2b", "mixed"].map((value) => ({ value, produces: [{ kind: "customerBuyer", value, provenance: "explicit_declaration" }] })),
  };
  assert.deepEqual(question("q2_customer_reach", QUESTION_BANK_V2).options.map(({ value, produces }) => ({ value, produces })), expectedProductions.q2_customer_reach);
  assert.deepEqual(question("q2_customer_buyer", QUESTION_BANK_V2).options.map(({ value, produces }) => ({ value, produces })), expectedProductions.q2_customer_buyer);
  const legacyAnswers = { q2_entity: "business", q2_has_customers: "yes", q2_customer_reach: "global", q2_customer_buyer: "b2b" } as const;
  const legacy = resolveEligibleQuestionsV2(legacyAnswers, QUESTION_BANK_V2);
  assert.deepEqual(legacy.context.customerModel.reach, { status: "resolved", value: "global", source: "signal" });
  assert.deepEqual(legacy.context.customerModel.buyer, { status: "resolved", value: "b2b", source: "signal" });
  assert.equal(QUESTION_BANK_V2.length, 85);
});
