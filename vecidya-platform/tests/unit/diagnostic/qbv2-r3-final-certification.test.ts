import assert from "node:assert/strict";
import test from "node:test";
import { CURRENT_QUESTION_BANK_VERSION } from "../../../app/features/diagnostic/contracts";
import { deriveContextualEvidence, scoreContextualDimensions } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import {
  REVIEWED_EVIDENCE_V3,
  REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3,
} from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import { evidenceMigrationIdentity, validateQuestionEvidenceV3 } from "../../../app/features/diagnostic/qbv2-evidence-v3";
import type { QuestionDefinitionV2 } from "../../../app/features/diagnostic/qbv2-contract";

const EVIDENCE_MIGRATED = [
  "q2_discovery_reliable_reach", "q2_local_presence_consistency", "q2_reputation_flow",
  "q2_operations_handoffs", "q2_presence_digital_base", "q2_ecommerce_product_discovery",
  "q2_presence_offer_clarity", "q2_retail_product_visibility", "q2_service_response_speed",
  "q2_appointments_booking_friction", "q2_service_quote_followup", "q2_followup_general_process",
  "q2_operations_information_base", "q2_b2b_status_visibility", "q2_professional_authority_signals",
  "q2_professional_intake_flow", "q2_process_systemization", "q2_retail_customer_capture",
  "q2_appointments_confirmation_reminders", "q2_b2b_pipeline", "q2_appointments_rebooking",
] as const;

const CONTEXT_ONLY = [
  "q2_entity", "q2_other_staff", "q2_monetization", "q2_delivery", "q2_has_customers",
  "q2_regularity", "q2_demand_trend", "q2_goal", "q2_friction", "q2_appointments_noshow",
  "q2_ecommerce_traffic_sources", "q2_sector", "q2_customer_reach", "q2_customer_buyer",
  "q2_capacity_signal",
] as const;

const LATER_REVIEW = ["q2_appointments_lead_to_booking", "q2_creator_audience_ownership"] as const;
const DISPOSITIONS = [
  ...EVIDENCE_MIGRATED.map((questionId) => ({ questionId, disposition: "EVIDENCE_MIGRATED" as const })),
  ...CONTEXT_ONLY.map((questionId) => ({ questionId, disposition: "CONTEXT_ONLY" as const })),
  ...LATER_REVIEW.map((questionId) => ({ questionId, disposition: "LATER_REVIEW" as const })),
];

const byId = (bank: readonly QuestionDefinitionV2[], id: string) => bank.find((question) => question.id === id)!;
const answersFor = (question: QuestionDefinitionV2, value: string): Record<string, string | readonly string[]> => ({
  [question.id]: question.type === "multi" ? [value] : value,
});

test("R3-FINAL closes all 38 candidate questions in exactly one review disposition", () => {
  const candidateIds = REVIEWED_CANDIDATE_QUESTIONS_V2.map((question) => question.id);
  const dispositionIds = DISPOSITIONS.map((item) => item.questionId);
  assert.equal(candidateIds.length, 38);
  assert.equal(new Set(candidateIds).size, 38);
  assert.equal(EVIDENCE_MIGRATED.length, 21);
  assert.equal(CONTEXT_ONLY.length, 15);
  assert.equal(LATER_REVIEW.length, 2);
  assert.equal(dispositionIds.length, 38);
  assert.equal(new Set(dispositionIds).size, 38, "each candidate has one disposition");
  assert.deepEqual([...dispositionIds].sort(), [...candidateIds].sort(), "no unclassified or unknown candidate IDs");
  assert.equal(REVIEWED_EVIDENCE_V3.length, 21);
});

test("R3-FINAL migrated evidence identities, versions and option contracts are explicit", () => {
  assert.deepEqual(REVIEWED_EVIDENCE_V3.map((entry) => entry.questionId).sort(), [...EVIDENCE_MIGRATED].sort());
  for (const id of EVIDENCE_MIGRATED) {
    const question = byId(REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3, id);
    const mapping = REVIEWED_EVIDENCE_V3.find((entry) => entry.questionId === id)!;
    assert.equal(question.evidenceMigration, "migrated", id);
    assert.equal(mapping.questionVersion, question.version, `${id} semantic version`);
    assert.equal(mapping.questionId, question.id, `${id} mapping identity`);
    assert.equal(evidenceMigrationIdentity(mapping.questionId, mapping.questionVersion), `${id}@v${question.version}`);
    assert.deepEqual(validateQuestionEvidenceV3(question), [], id);
    assert.equal(mapping.dimensions.length, 1, `${id} emits only its certified dimension`);
    assert.ok(["direct", "supporting"].includes(mapping.dimensions[0]!.directness));
    for (const option of question.options) {
      const evidence = deriveContextualEvidence(answersFor(question, option.value), REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3);
      const expectedObservations = mapping.dimensions[0]!.answers[option.value] === "context_only" ? 0 : 1;
      assert.equal(evidence.filter((item) => item.questionId === id).length, expectedObservations, `${id}/${option.value}: one question/dimension observation or explicit context-only`);
      const observation = evidence.find((item) => item.questionId === id);
      if (observation) assert.equal(observation.migrationIdentity, `${id}@v${question.version}`);
    }
    const wrongVersion = { ...question, version: question.version === 1 ? 2 : 1 } as QuestionDefinitionV2;
    const firstOption = question.options[0]!;
    assert.deepEqual(deriveContextualEvidence(answersFor(wrongVersion, firstOption.value), [wrongVersion]), [], `${id}: no ID-only or wrong-version fallback`);
  }
});

test("R3-FINAL context-only and later-review answers produce no V3 evidence", () => {
  for (const id of [...CONTEXT_ONLY, ...LATER_REVIEW]) {
    const question = byId(REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3, id);
    assert.equal(question.evidenceMigration, "pending", `${id} technical migration state remains pending`);
    assert.equal(question.evidenceV3, undefined, `${id} has no V3 mapping`);
    for (const option of question.options) {
      assert.deepEqual(deriveContextualEvidence(answersFor(question, option.value), REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3), [], `${id}/${option.value}`);
    }
  }
});

test("R3-FINAL representative context alone cannot synthesize dimension evidence", () => {
  const answers = {
    q2_goal: "follow_up", q2_friction: "follow_up", q2_capacity_signal: "busy",
    q2_demand_trend: "increasing", q2_sector: "professional", q2_customer_buyer: "b2b",
    q2_appointments_noshow: "often", q2_ecommerce_traffic_sources: ["social", "search"],
  };
  assert.deepEqual(deriveContextualEvidence(answers, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3), []);
  const result = scoreContextualDimensions({
    answers,
    context: {
      primaryGoal: { status: "resolved", value: "follow_up", sources: ["q2_goal"] },
      primaryFriction: { status: "resolved", value: "follow_up", sources: ["q2_friction"] },
    } as never,
    evidence: [],
    bank: REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3,
  });
  assert.deepEqual(result.dimensions.flatMap((dimension) => dimension.evidence), []);
});

test("R3-FINAL unknown, N/A and missing states retain neutral and explicit semantics", () => {
  for (const question of REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.filter((item) => item.evidenceMigration === "migrated")) {
    const mapping = question.evidenceV3!;
    for (const reading of mapping.dimensions) {
      for (const option of question.options) {
        const state = reading.answers[option.value];
        if (option.kind === "unknown") {
          assert.equal(state, "uncertainty", `${question.id}/${option.value}`);
          const evidence = deriveContextualEvidence(answersFor(question, option.value), REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3);
          assert.ok(evidence.every((item) => item.state === "uncertainty" && item.contribution === null), `${question.id}/${option.value}`);
        }
        if (option.kind === "not_applicable") {
          assert.equal(state, "not_applicable", `${question.id}/${option.value}`);
          const evidence = deriveContextualEvidence(answersFor(question, option.value), REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3);
          assert.ok(evidence.every((item) => item.state === "not_applicable" && item.contribution === null), `${question.id}/${option.value}`);
        }
        if (state === "missing") assert.ok(option.kind !== "unknown" && option.kind !== "not_applicable", `${question.id}/${option.value}`);
      }
    }
  }
  const explicitAbsence = new Set(["q2_presence_digital_base", "q2_retail_customer_capture"]);
  for (const question of REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.filter((item) => item.evidenceMigration === "migrated")) {
    const hasMissing = question.evidenceV3!.dimensions.some((reading) => Object.values(reading.answers).includes("missing"));
    assert.equal(hasMissing, explicitAbsence.has(question.id), `${question.id}: missing only for explicit absence mappings`);
  }
});

test("R3-FINAL tools, automation, channels and outcomes do not add evidence", () => {
  const base = deriveContextualEvidence({ q2_presence_offer_clarity: "clear", q2_discovery_reliable_reach: "reliable" }, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3);
  const enriched = deriveContextualEvidence({
    q2_presence_offer_clarity: "clear", q2_discovery_reliable_reach: "reliable",
    q2_delivery: ["online_checkout", "physical_location"], q2_ecommerce_traffic_sources: ["social", "search"],
    q2_appointments_noshow: "often", q2_demand_trend: "increasing", q2_goal: "measure",
    crm_tool: "crm", automation: "automated", channel: "whatsapp", revenue: "high", sales: "many",
    followers: "many", business_volume: "high", close_rate: "high", repeat_rate: "high", attendance: "high",
  }, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3);
  assert.deepEqual(enriched, base);
  assert.deepEqual(deriveContextualEvidence({ q2_ecommerce_traffic_sources: ["social", "search", "referrals"] }, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3), []);
  assert.deepEqual(deriveContextualEvidence({ q2_appointments_lead_to_booking: "few" }, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3), []);
  assert.deepEqual(deriveContextualEvidence({ q2_appointments_noshow: "often" }, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3), []);
});

test("R3-FINAL dimension coverage and runtime freeze match the certified candidate", () => {
  const actual = Object.fromEntries(["digital_foundation", "clarity_positioning", "discovery", "trust_reputation", "conversion_access", "relationship_recurrence", "measurement_optimization", "digital_readiness"].map((dimension) => {
    const sources = REVIEWED_EVIDENCE_V3.flatMap((entry) => entry.dimensions.filter((reading) => reading.dimension === dimension).map((reading) => ({ id: entry.questionId, directness: reading.directness })));
    return [dimension, { direct: sources.filter((source) => source.directness === "direct").map((source) => source.id), supporting: sources.filter((source) => source.directness === "supporting").map((source) => source.id) }];
  }));
  assert.deepEqual(actual, {
    digital_foundation: { direct: ["q2_local_presence_consistency", "q2_presence_digital_base", "q2_ecommerce_product_discovery"], supporting: [] },
    clarity_positioning: { direct: ["q2_presence_offer_clarity", "q2_retail_product_visibility", "q2_professional_intake_flow"], supporting: [] },
    discovery: { direct: ["q2_discovery_reliable_reach"], supporting: [] },
    trust_reputation: { direct: ["q2_reputation_flow", "q2_professional_authority_signals"], supporting: [] },
    conversion_access: { direct: ["q2_service_response_speed", "q2_appointments_booking_friction"], supporting: [] },
    relationship_recurrence: { direct: ["q2_service_quote_followup", "q2_followup_general_process", "q2_retail_customer_capture", "q2_appointments_confirmation_reminders", "q2_b2b_pipeline", "q2_appointments_rebooking"], supporting: [] },
    measurement_optimization: { direct: [], supporting: [] },
    digital_readiness: { direct: ["q2_operations_information_base", "q2_process_systemization"], supporting: ["q2_operations_handoffs", "q2_b2b_status_visibility"] },
  });
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.notEqual(REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3, QUESTION_BANK_V2);
});
