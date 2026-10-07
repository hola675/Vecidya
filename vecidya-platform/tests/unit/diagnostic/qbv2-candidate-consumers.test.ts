import test from "node:test";
import assert from "node:assert/strict";
import { buildCandidateInterpretationCoreV3, CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3 } from "../../../app/features/diagnostic/qbv2-candidate-interpretation";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as BANK } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const PENDING_IDS = new Set(BANK.filter((q) => q.evidenceMigration === "pending").map((q) => q.id));
const LATER_REVIEW_IDS = ["q2_appointments_lead_to_booking", "q2_creator_audience_ownership"];

function allProvenanceIds(core: ReturnType<typeof buildCandidateInterpretationCoreV3>): readonly string[] {
  return [...new Set(core.semanticFacts.facts.flatMap((fact) => [...fact.provenance.questionIds, ...(fact.signals ? [...fact.signals.positive, ...fact.signals.negative].map((s) => s.questionId) : [])]))];
}

test("R6-A: candidate scoring result satisfies the shared DiagnosticScoringView without a cast", () => {
  const core = buildCandidateInterpretationCoreV3({ answers: { q2_entity: "business" } as AnswersV2 });
  assert.equal(core.scoring.dimensions.length, 8);
  assert.ok(core.scoring.dimensions.every((d) => "id" in d && "applicability" in d && "score" in d && "confidence" in d && "evidence" in d && "explainability" in d));
  assert.deepEqual(core.priorities.constraints, core.priorities.constraints, "deriveConstraintsAndPriorities accepted the candidate scoring result directly");
});

test("R6-A: semantic facts use active answers, not raw stale answers", () => {
  const raw = { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["online_checkout"], q2_appointments_noshow: "often" } as AnswersV2;
  const core = buildCandidateInterpretationCoreV3({ answers: raw });
  // q2_appointments_noshow is stale/inactive once delivery switches away from appointments.
  assert.equal(core.activeAnswers.q2_appointments_noshow, undefined);
  for (const id of allProvenanceIds(core)) assert.ok(core.activeAnswers[id] !== undefined, `${id}: provenance must trace to active evidence`);
});

test("R6-A: not_applicable and insufficient_context never produce a strength/partial/weakness fact", () => {
  const prelaunch = buildCandidateInterpretationCoreV3({ answers: { q2_entity: "project", q2_has_customers: "no", q2_goal: "explain" } as AnswersV2 });
  for (const dimension of ["digital_foundation", "trust_reputation", "relationship_recurrence", "measurement_optimization"] as const) {
    const scored = prelaunch.scoring.dimensions.find((d) => d.id === dimension)!;
    assert.equal(scored.applicability, "not_applicable");
    assert.ok(!prelaunch.semanticFacts.facts.some((f) => f.dimension === dimension && ["strength", "partial", "weakness"].includes(f.type)), `${dimension}: N/A must never read as a capability`);
  }
  const base: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_friction: "follow_up" };
  const before = buildCandidateInterpretationCoreV3({ answers: base });
  const relationship = before.scoring.dimensions.find((d) => d.id === "relationship_recurrence")!;
  assert.equal(relationship.applicability, "insufficient_context");
  assert.ok(!before.semanticFacts.facts.some((f) => f.dimension === "relationship_recurrence" && ["strength", "partial", "weakness"].includes(f.type)), "insufficient_context must never read as a capability");
});

test("R6-A: Measurement 0-source is a certified unobservable gap, never a weakness", () => {
  const seed: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"], q2_goal: "measure" };
  const core = buildCandidateInterpretationCoreV3({ answers: seed });
  const measurement = core.scoring.dimensions.find((d) => d.id === "measurement_optimization")!;
  assert.equal(measurement.applicability, "applicable");
  assert.equal(measurement.score, null);
  const directSources = BANK.filter((q) => q.evidenceMigration === "migrated" && q.evidenceV3?.dimensions.some((d) => d.dimension === "measurement_optimization"));
  assert.equal(directSources.length, 0);
  const priority = core.priorities.priorities.find((p) => p.dimension === "measurement_optimization");
  assert.equal(priority?.kind, "evidence_gap");
  assert.equal(priority?.severity, "unknown");
  assert.equal(priority?.certainty, "verify_first");
  const gapFact = core.semanticFacts.facts.find((f) => f.dimension === "measurement_optimization" && f.type === "evidence_gap");
  assert.equal(gapFact?.gap?.kind, "unobservable_in_context");
  assert.ok(!core.semanticFacts.facts.some((f) => f.dimension === "measurement_optimization" && (f.type === "weakness" || f.type === "strength")));
});

test("R6-A: Relationship prospective evidence boundary — before/after consumer facts", () => {
  const seed: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_friction: "follow_up" };
  const before = buildCandidateInterpretationCoreV3({ answers: seed });
  assert.ok(!before.semanticFacts.facts.some((f) => f.dimension === "relationship_recurrence" && ["strength", "partial", "weakness"].includes(f.type)));
  const after = buildCandidateInterpretationCoreV3({ answers: { ...before.activeAnswers, q2_followup_general_process: "consistent" } });
  const relationship = after.scoring.dimensions.find((d) => d.id === "relationship_recurrence")!;
  assert.equal(relationship.applicability, "applicable");
  assert.ok(relationship.score !== null);
  const strength = after.semanticFacts.facts.find((f) => f.dimension === "relationship_recurrence" && f.type === "strength");
  assert.ok(strength, "a real post-answer score must derive an actual semantic reading");
  assert.ok(strength!.signals!.positive.some((s) => s.questionId === "q2_followup_general_process"));
  assert.ok(strength!.provenance.questionIds.includes("q2_followup_general_process") || strength!.signals!.positive.some((s) => s.questionId === "q2_followup_general_process"));
});

test("R6-A: unknown stays uncertainty-only, not_applicable stays neutral", () => {
  const base: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["online_checkout"], q2_customer_buyer: "b2c", q2_customer_reach: "local", q2_goal: "other", q2_friction: "follow_up" };
  const unknown = buildCandidateInterpretationCoreV3({ answers: { ...base, q2_followup_general_process: "unknown" } });
  assert.ok(unknown.semanticFacts.facts.some((f) => f.type === "uncertainty" && f.provenance.questionIds.includes("q2_followup_general_process")));
  assert.ok(!unknown.semanticFacts.facts.some((f) => f.dimension === "relationship_recurrence" && ["strength", "partial", "weakness"].includes(f.type)));
  const na = buildCandidateInterpretationCoreV3({ answers: { ...base, q2_followup_general_process: "not_applicable" } });
  assert.deepEqual(na.semanticFacts.facts.filter((f) => f.dimension === "relationship_recurrence"), []);
});

test("R6-A: supporting-only evidence never establishes a standalone reading", () => {
  const withoutDirect: AnswersV2 = { q2_entity: "individual", q2_other_staff: "yes", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["other"], q2_goal: "organize", q2_customer_buyer: "b2b", q2_operations_handoffs: "transfers_cleanly" };
  const core = buildCandidateInterpretationCoreV3({ answers: withoutDirect });
  const digitalReadiness = core.scoring.dimensions.find((d) => d.id === "digital_readiness")!;
  assert.equal(digitalReadiness.score, null);
  assert.deepEqual(core.semanticFacts.facts.filter((f) => f.dimension === "digital_readiness" && ["strength", "partial", "weakness"].includes(f.type)), []);
  const withDirect = buildCandidateInterpretationCoreV3({ answers: { ...withoutDirect, q2_process_systemization: "defined" } });
  assert.ok(withDirect.scoring.dimensions.find((d) => d.id === "digital_readiness")!.score !== null, "direct evidence establishes the reading on its own");
});

test("R6-A: context-only and later-review questions never become capability provenance", () => {
  const seed: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"], q2_goal: "opportunities", q2_appointments_lead_to_booking: "few", q2_appointments_noshow: "often", q2_process_systemization: "defined", q2_discovery_reliable_reach: "reliable" };
  const core = buildCandidateInterpretationCoreV3({ answers: seed });
  const provenance = allProvenanceIds(core);
  for (const id of provenance) {
    assert.ok(!PENDING_IDS.has(id) || !LATER_REVIEW_IDS.includes(id), `${id}: a later-review question must never be capability provenance`);
  }
  // No pending (context-only/later-review) question ID appears as capability evidence anywhere.
  const pendingLeaks = provenance.filter((id) => PENDING_IDS.has(id));
  assert.deepEqual(pendingLeaks, [], `pending questions leaked into capability provenance: ${pendingLeaks.join(", ")}`);
});

test("R6-A: goal/friction reprioritize but never alter scoring", () => {
  const base: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["travels"], q2_sector: "professional_services", q2_customer_buyer: "b2c", q2_customer_reach: "local" };
  const opportunity = buildCandidateInterpretationCoreV3({ answers: { ...base, q2_goal: "opportunities" } });
  const trust = buildCandidateInterpretationCoreV3({ answers: { ...base, q2_goal: "trust" } });
  assert.deepEqual(opportunity.scoring.dimensions.map((d) => [d.id, d.score]), trust.scoring.dimensions.map((d) => [d.id, d.score]), "goal must never alter scoring, only priority/order");
  assert.notDeepEqual(opportunity.priorities.priorities.map((p) => p.dimension), trust.priorities.priorities.map((p) => p.dimension));
});

test("R6-A: determinism and answer-change invalidation", () => {
  const seed: AnswersV2 = { q2_entity: "business", q2_monetization: "services", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_delivery: ["appointments"], q2_goal: "opportunities", q2_process_systemization: "defined" };
  const left = buildCandidateInterpretationCoreV3({ answers: seed });
  const reversed = buildCandidateInterpretationCoreV3({ answers: Object.fromEntries(Object.entries(seed).reverse()) as AnswersV2 });
  assert.deepEqual(reversed.priorities.priorities.map((p) => p.id), left.priorities.priorities.map((p) => p.id));
  assert.deepEqual(reversed.semanticFacts.facts.map((f) => f.id), left.semanticFacts.facts.map((f) => f.id));
  const restored = buildCandidateInterpretationCoreV3({ answers: JSON.parse(JSON.stringify(seed)) as AnswersV2 });
  assert.deepEqual(restored, left);
  const changed = buildCandidateInterpretationCoreV3({ answers: { ...seed, q2_process_systemization: "informal" } });
  assert.ok(!changed.scoring.dimensions.find((d) => d.id === "digital_readiness")!.evidence.some((e) => e.state === "established" && e.questionId === "q2_process_systemization"), "stale strong evidence must not survive an answer change");
});

test("R6-A: candidate evidence catalog derives only from evidenceV3, never from legacy mappings", () => {
  const measurementSources = BANK.filter((q) => q.evidenceMigration === "migrated").map((q) => q.id).filter((id) => CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3.directQuestionIds("measurement_optimization").includes(id));
  assert.deepEqual(measurementSources, []);
  const relationshipDirect = CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3.directQuestionIds("relationship_recurrence");
  assert.ok(relationshipDirect.includes("q2_followup_general_process"));
  assert.equal(CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3.facet("q2_followup_general_process", "relationship_recurrence"), "q2_followup_general_process");
  for (const id of LATER_REVIEW_IDS) assert.equal(CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3.directness(id, "relationship_recurrence"), undefined);
});

test("R6-A: candidate interpretation core is not re-exported by the shared barrel", async () => {
  const barrel = await import("../../../app/features/diagnostic/index");
  assert.equal((barrel as Record<string, unknown>).buildCandidateInterpretationCoreV3, undefined);
});
