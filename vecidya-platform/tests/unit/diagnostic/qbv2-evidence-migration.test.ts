import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { CURRENT_QUESTION_BANK_VERSION } from "../../../app/features/diagnostic/contracts";
import { QUESTION_BANK_V2 as legacy } from "../../../app/features/diagnostic/qbv2-bank";
import { CAPABILITY_CONTRIBUTION, CONFIDENCE_MODEL, SCORING_MODEL, deriveContextualEvidence, scoreContextualDimensions, type ContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import type { QuestionDefinitionV2 } from "../../../app/features/diagnostic/qbv2-contract";
import { DIGITAL_DIMENSION_IDS } from "../../../app/features/diagnostic/qbv2-coverage";
import { getQuestionBank, resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { evidenceMigrationIdentity, validateEvidenceMigrationsV3, validateQuestionEvidenceV3, type QuestionEvidenceV3 } from "../../../app/features/diagnostic/qbv2-evidence-v3";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as frozen } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as candidate, REVIEWED_EVIDENCE_MIGRATION_LEDGER_V3 as ledger, REVIEWED_EVIDENCE_MIGRATION_SUMMARY_V3 as summary, REVIEWED_PILOT_EVIDENCE_V3 as pilot } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";

const discovery = "q2_discovery_reliable_reach";
const foundation = "q2_local_presence_consistency";
const trust = "q2_reputation_flow";
const handoffs = "q2_operations_handoffs";
const question = (id: string) => candidate.find((q) => q.id === id)!;
const derive = (answers: AnswersV2) => deriveContextualEvidence(answers, candidate);
const stripEvidence = ({ evidenceMigration: _state, evidenceV3: _mapping, ...definition }: QuestionDefinitionV2) => definition;
const operatingContext = resolveEligibleQuestionsV2({ q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat" }, candidate).context;
const score = (evidence: readonly ContextualEvidence[], dimension: string) => scoreContextualDimensions({ answers: {}, context: operatingContext, evidence, bank: candidate }).dimensions.find((d) => d.id === dimension)!;

test("R3A ledger derives 38 definitions, four migrated pilots and 34 pending without changing R2 constructs", () => {
  assert.deepEqual(summary, { total: 38, pending: 34, migrated: 4 });
  assert.equal(ledger.length, 38);
  assert.deepEqual(candidate.map(stripEvidence), frozen.map(stripEvidence));
  assert.deepEqual(ledger.filter((entry) => entry.state === "migrated").map((entry) => entry.questionId).sort(), pilot.map((entry) => entry.questionId).sort());
  assert.deepEqual(validateEvidenceMigrationsV3(candidate), []);
  assert.deepEqual(validateQuestionBankV2(candidate), []);
  assert.equal(frozen.filter((q) => q.evidenceMigration === "migrated").length, 0);
});

test("R3A dimensions, directness and migration identities are closed, unique and version-specific", () => {
  assert.deepEqual([...DIGITAL_DIMENSION_IDS].sort(), ["clarity_positioning", "digital_foundation", "discovery", "trust_reputation", "conversion_access", "relationship_recurrence", "measurement_optimization", "digital_readiness"].sort());
  const identities = pilot.map((entry) => evidenceMigrationIdentity(entry.questionId, entry.questionVersion));
  assert.equal(new Set(identities).size, pilot.length);
  for (const entry of pilot) for (const reading of entry.dimensions) {
    assert.ok(DIGITAL_DIMENSION_IDS.some((id) => id === reading.dimension));
    assert.ok(["direct", "supporting", "contextual"].includes(reading.directness));
  }
  assert.notEqual(evidenceMigrationIdentity(foundation, 1), evidenceMigrationIdentity(foundation, 2));
  assert.notEqual(evidenceMigrationIdentity(trust, 2), evidenceMigrationIdentity(trust, 3));
  assert.ok(validateEvidenceMigrationsV3([question(foundation), question(foundation)]).some((issue) => issue.includes("duplicate V3 migration identity")));
});

test("R3A pending suppresses all evidence for same-version, revised-ID and new definitions", () => {
  for (const q of [...candidate, legacy.find((q) => q.id === foundation)!]) {
    const pending = { ...q, evidenceMigration: "pending" as const };
    for (const option of q.options) assert.deepEqual(deriveContextualEvidence({ [q.id]: q.type === "multi" ? [option.value] : option.value }, [pending]), []);
  }
  for (const q of frozen) for (const option of q.options) assert.deepEqual(deriveContextualEvidence({ [q.id]: q.type === "multi" ? [option.value] : option.value }, frozen), []);
});

test("R3A undefined accepts only a historical answer contract, never an unmarked revised version", () => {
  const old = legacy.find((q) => q.id === foundation)!;
  assert.ok(deriveContextualEvidence({ [foundation]: "consistent" }, [{ ...old }]).length > 0);
  for (const q of candidate.filter((q) => !["q2_entity", "q2_other_staff", "q2_has_customers"].includes(q.id))) {
    const unmarked = { ...q, evidenceMigration: undefined, evidenceV3: undefined };
    for (const option of q.options) assert.deepEqual(deriveContextualEvidence({ [q.id]: q.type === "multi" ? [option.value] : option.value }, [unmarked]), [], q.id);
  }
  const changed = { ...old, options: old.options.map((o, index) => index === 0 ? { ...o, value: "changed" } : o) };
  assert.deepEqual(deriveContextualEvidence({ [foundation]: "partial" }, [changed]), [], "same version alone cannot authorize an altered answer contract");
  const invalidState = { ...old, evidenceMigration: "invented" } as unknown as QuestionDefinitionV2;
  assert.deepEqual(deriveContextualEvidence({ [foundation]: "consistent" }, [invalidState]), []);
  assert.ok(validateEvidenceMigrationsV3([invalidState]).some((issue) => issue.includes("unknown V3 migration state")));
});

test("R3A migrated uses only explicit versioned semantics and source metadata for every pilot option", () => {
  for (const migration of pilot) {
    const q = question(migration.questionId);
    assert.deepEqual(validateQuestionEvidenceV3(q), []);
    for (const option of q.options) {
      const reading = q.evidenceV3!.dimensions[0]!;
      const expected = reading.answers[option.value]!;
      const entries = derive({ [q.id]: option.value });
      if (expected === "context_only") { assert.deepEqual(entries, []); continue; }
      assert.equal(entries.length, 1, `${q.id}/${option.value}`);
      const entry = entries[0]!;
      assert.equal(entry.dimension, reading.dimension);
      assert.equal(entry.directness, reading.directness);
      assert.equal(entry.state, expected);
      assert.equal(entry.contribution, CAPABILITY_CONTRIBUTION[expected]);
      assert.equal(entry.questionVersion, q.version);
      assert.equal(entry.observationId, `${q.id}@v${q.version}`);
      assert.equal(entry.migrationIdentity, entry.observationId);
      assert.deepEqual(entry.answer, [option.value]);
    }
  }
});

test("R3A revised local presence does not inherit legacy Discovery spread or legacy contribution", () => {
  const current = derive({ [foundation]: "consistent" });
  assert.deepEqual(current.map((entry) => entry.dimension), ["digital_foundation"]);
  assert.equal(current[0]!.contribution, 0.75);
  const historical = deriveContextualEvidence({ [foundation]: "consistent" }, legacy);
  assert.deepEqual(historical.map((entry) => entry.dimension), ["digital_foundation", "discovery"]);
  assert.equal(historical[0]!.contribution, 1);
  assert.equal(historical[1]!.directness, "supporting");
  assert.equal(historical[0]!.questionVersion, undefined);
});

test("R3A incomplete or mismatched migration fails closed atomically without legacy fallback", () => {
  const q = question(foundation);
  const mapping = q.evidenceV3!;
  const reading = mapping.dimensions[0]!;
  const { no: _weak, ...incomplete } = reading.answers;
  const invalid: QuestionDefinitionV2[] = [
    { ...q, evidenceV3: undefined },
    { ...q, evidenceV3: { ...mapping, questionVersion: 1 } },
    { ...q, evidenceV3: { ...mapping, questionId: trust } },
    { ...q, evidenceV3: { ...mapping, dimensions: [{ ...reading, answers: incomplete }] } },
    { ...q, evidenceV3: { ...mapping, dimensions: [] } },
  ];
  for (const definition of invalid) {
    assert.ok(validateQuestionEvidenceV3(definition).length > 0);
    assert.deepEqual(deriveContextualEvidence({ [foundation]: "consistent" }, [definition]), []);
    assert.ok(validateQuestionBankV2([definition]).some((issue) => issue.code === "INVALID_V3_EVIDENCE_MIGRATION"));
  }
  for (const state of ["pending", undefined] as const) assert.deepEqual(deriveContextualEvidence({ [foundation]: "consistent" }, [{ ...q, evidenceMigration: state }]), []);
});

test("R3A validator rejects unknown dimensions, roles, states, orphan answers and duplicate dimensions", () => {
  const q = question(foundation);
  const mapping = q.evidenceV3!;
  const reading = mapping.dimensions[0]!;
  const broken = [
    { ...mapping, dimensions: [{ ...reading, dimension: "not_a_dimension" }] },
    { ...mapping, dimensions: [{ ...reading, directness: "invented" }] },
    { ...mapping, dimensions: [{ ...reading, answers: { ...reading.answers, consistent: "invented" } }] },
    { ...mapping, dimensions: [{ ...reading, answers: { ...reading.answers, extra: "strong" } }] },
    { ...mapping, dimensions: [reading, reading] },
  ];
  for (const invalid of broken) {
    const definition = { ...q, evidenceV3: invalid as QuestionEvidenceV3 };
    assert.ok(validateQuestionEvidenceV3(definition).length > 0);
    assert.deepEqual(deriveContextualEvidence({ [q.id]: "consistent" }, [definition]), []);
  }
});

test("R3A unknown and N/A are null contributions, never a positive or negative capability", () => {
  for (const q of candidate.filter((q) => q.evidenceMigration === "migrated")) for (const option of q.options.filter((o) => o.kind === "unknown" || o.kind === "not_applicable")) {
    const evidence = derive({ [q.id]: option.value });
    assert.equal(evidence.length, 1);
    assert.equal(evidence[0]!.contribution, null);
    assert.equal(evidence[0]!.state, option.kind === "unknown" ? "uncertainty" : "not_applicable");
    const result = score(evidence, evidence[0]!.dimension);
    assert.equal(result.score, null);
    assert.deepEqual(result.explainability.strengths, []);
    assert.deepEqual(result.explainability.weaknesses, []);
    assert.deepEqual(result.explainability.missing, []);
    const mapping = q.evidenceV3!;
    const reading = mapping.dimensions[0]!;
    const nonNeutral = { ...q, evidenceV3: { ...mapping, dimensions: [{ ...reading, answers: { ...reading.answers, [option.value]: "weak" as const } }] } };
    assert.ok(validateQuestionEvidenceV3(nonNeutral).length > 0);
    assert.deepEqual(deriveContextualEvidence({ [q.id]: q.options[0]!.value }, [nonNeutral]), [], "one unsafe option blocks the whole migration");
  }
});

test("R3A not_seeking remains context-only without weakness, constraint evidence or fabricated friction", () => {
  const answers = { q2_has_customers: "yes", [discovery]: "not_seeking" };
  assert.deepEqual(derive(answers), []);
  const result = resolveEligibleQuestionsV2(answers, candidate);
  assert.equal(result.context.discoveryReachReliability.value, "not_seeking");
  assert.equal(result.context.primaryFriction.status, "unresolved");
  assert.deepEqual(result.context.growthStage, resolveEligibleQuestionsV2({ q2_has_customers: "yes" }, candidate).context.growthStage);
});

test("R3A direct pilots independently use the existing semantic contribution scale", () => {
  for (const [value, expected] of [["reliable", 75], ["irregular", 50], ["weak", 25]] as const) {
    const result = score(derive({ [discovery]: value }), "discovery");
    assert.equal(result.score, expected);
    assert.equal(result.explainability.basis, "direct");
    assert.equal(result.confidence.direct, 1);
    assert.equal(result.confidence.level, "low", "no confidence recalibration");
  }
});

test("R3A q65 supporting-only cannot establish Digital Readiness independently", () => {
  for (const value of ["complete", "partial", "incomplete"]) {
    const evidence = derive({ [handoffs]: value });
    assert.equal(evidence[0]!.directness, "supporting");
    const result = score(evidence, "digital_readiness");
    assert.equal(result.score, null);
    assert.equal(result.explainability.basis, "supporting_only");
    assert.equal(result.confidence.direct, 0);
    assert.equal(result.confidence.level, "low");
  }
});

test("R3A supporting refines a direct observation under the unchanged cap; unknown/N/A do not change its score", () => {
  const direct: ContextualEvidence = { questionId: "direct_fixture", observationId: "direct_fixture", dimension: "digital_readiness", directness: "direct", state: "partial", kind: "partial", contribution: CAPABILITY_CONTRIBUTION.partial, answer: ["partial"] };
  assert.equal(score([direct], "digital_readiness").score, 50);
  for (const value of ["unknown", "not_applicable"]) assert.equal(score([direct, ...derive({ [handoffs]: value })], "digital_readiness").score, 50);
  const supporting = derive({ [handoffs]: "complete" });
  assert.equal(score([direct, ...supporting], "digital_readiness").score, 58);
  assert.deepEqual(SCORING_MODEL, { directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 });
  assert.deepEqual(CONFIDENCE_MODEL, { supportingWeight: 0.5, mediumAt: 1.5, highAt: 3 });
});

test("R3A context, goals and frictions stay separate from capability evidence", () => {
  const answers: AnswersV2 = { q2_entity: "individual", q2_other_staff: "yes", q2_monetization: "services", q2_delivery: ["appointments"], q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_goal: "be_found", q2_friction: "follow_up", q2_appointments_noshow: "often", q2_b2b_pipeline: "informal" };
  assert.deepEqual(derive(answers), []);
});

test("R3A invalid answers cannot revive legacy fallback or fabricate additional observations", () => {
  assert.deepEqual(derive({ [foundation]: "legacy_or_invalid" }), []);
  assert.deepEqual(derive({ [foundation]: ["consistent", "partial"] }), []);
  assert.deepEqual(derive({ [discovery]: [] }), []);
  const answers: AnswersV2 = { [discovery]: "reliable", [foundation]: "partial", [trust]: "weak", [handoffs]: "complete" };
  assert.deepEqual(derive(answers), derive(Object.fromEntries(Object.entries(answers).reverse())));
  assert.equal(new Set(derive(answers).map((entry) => entry.migrationIdentity)).size, 4);
});

test("R3A every historical option retains the preflight legacy evidence digest", () => {
  const answers = legacy.flatMap((q) => q.options.map((o) => ({ [q.id]: q.type === "multi" ? [o.value] : o.value })));
  assert.equal(answers.length, 377);
  const digest = createHash("sha256").update(JSON.stringify(answers.map((a) => deriveContextualEvidence(a, legacy)))).digest("hex");
  assert.equal(digest, "32aaca45420059bcc71fa74a4cbfeefedcb512b2b6d613dfe8e2887f3589c4aa", "verified against scorer at 1bbe80c");
});

test("R3A never activates either candidate view or changes productive runtime version", () => {
  assert.equal(legacy.length, 85);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(getQuestionBank(2), legacy);
  assert.notEqual(getQuestionBank(2), candidate);
  assert.notEqual(getQuestionBank(2), frozen);
});
