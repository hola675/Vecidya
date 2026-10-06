import assert from "node:assert/strict";
import test from "node:test";
import { CURRENT_QUESTION_BANK_VERSION } from "../../../app/features/diagnostic/contracts";
import { resolveDiagnosticContext } from "../../../app/features/diagnostic/context-resolver";
import { QUESTION_BANK_V2 as legacy } from "../../../app/features/diagnostic/qbv2-bank";
import { SCORING_MODEL, deriveContextualEvidence, scoreContextualDimensions, type ContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { getQuestionBank, resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { validateQuestionEvidenceV3 } from "../../../app/features/diagnostic/qbv2-evidence-v3";
import { buildQuestionPlan } from "../../../app/features/diagnostic/qbv2-planner";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 as frozen } from "../../../app/features/diagnostic/qbv2-reviewed-candidate";
import { REVIEWED_LEGACY_DECISIONS as decisions } from "../../../app/features/diagnostic/qbv2-reviewed-decisions";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as candidate, REVIEWED_EVIDENCE_MIGRATION_SUMMARY_V3 as summary, REVIEWED_PROCESS_CONSISTENCY_EVIDENCE_V3 as batch, REVIEWED_EVIDENCE_V3 as registry } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { validateQuestionBankV2 } from "../../../app/features/diagnostic/qbv2-validators";

const process = "q2_process_systemization";
const information = "q2_operations_information_base";
const handoffs = "q2_operations_handoffs";
const status = "q2_b2b_status_visibility";
const capacity = "q2_capacity_signal";
const question = (id: string) => candidate.find(q => q.id === id)!;
const derive = (answers: AnswersV2) => deriveContextualEvidence(answers, candidate);
const seed: AnswersV2 = { q2_entity: "individual", q2_other_staff: "yes", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_goal: "organize", q2_customer_buyer: "b2b" };
const context = resolveEligibleQuestionsV2(seed, candidate).context;
const score = (evidence: readonly ContextualEvidence[]) => scoreContextualDimensions({ answers: {}, context, evidence, bank: candidate }).dimensions.find(d => d.id === "digital_readiness")!;

test("R3I atomically migrates only process consistency v2 with all options and ledger 38/17/21", () => {
  assert.deepEqual(summary, { total: 38, migrated: 17, pending: 21 });
  assert.deepEqual(batch.map(m => m.questionId), [process]);
  assert.equal(question(process).version, 2);
  assert.equal(question(process).evidenceMigration, "migrated");
  assert.deepEqual(validateQuestionBankV2(candidate), []);
  assert.deepEqual(validateQuestionEvidenceV3(question(process)), []);
  assert.deepEqual(Object.keys(batch[0].dimensions[0].answers).sort(), question(process).options.map(o => o.value).sort());
  assert.equal(new Set(registry.map(m => `${m.questionId}@v${m.questionVersion}`)).size, registry.length);
});

test("R3I each option observes direct Readiness only with unchanged contributions and version identity", () => {
  for (const [answer, state, contribution] of [["defined", "established", 0.75], ["partial", "partial", 0.5], ["informal", "weak", 0.25], ["unknown", "uncertainty", null]] as const) {
    const evidence = derive({ [process]: answer });
    assert.equal(evidence.length, 1);
    const e = evidence[0]!;
    assert.deepEqual([e.dimension, e.directness, e.state, e.contribution], ["digital_readiness", "direct", state, contribution]);
    assert.equal(e.questionVersion, 2);
    assert.equal(e.migrationIdentity, `${process}@v2`);
    assert.equal(e.observationId, e.migrationIdentity);
    assert.deepEqual(e.answer, [answer]);
  }
});

test("R3I unknown stays null, improvisation is not absence and no N/A is invented", () => {
  const unknown = derive({ [process]: "unknown" });
  assert.equal(unknown[0]!.contribution, null);
  assert.equal(score(unknown).score, null);
  assert.deepEqual(score(unknown).explainability.weaknesses, []);
  assert.deepEqual(score(unknown).explainability.missing, []);
  assert.equal(score(derive({ [information]: "easy_reliable", [process]: "unknown" })).score, score(derive({ [information]: "easy_reliable" })).score);
  assert.equal(derive({ [process]: "informal" })[0]!.state, "weak");
  assert.ok(!question(process).options.some(o => o.kind === "not_applicable"));
  assert.deepEqual(derive({ [process]: "not_applicable" }), []);
});

test("R3I information recovery and process execution diverge both ways as independent direct sources", () => {
  const eligible = resolveEligibleQuestionsV2(seed, candidate).eligibleQuestionIds;
  assert.ok(eligible.includes(process));
  assert.ok(eligible.includes(information));
  for (const [routine, recovery] of [["informal", "easy_reliable"], ["defined", "difficult_unreliable"]] as const) {
    const evidence = derive({ [process]: routine, [information]: recovery });
    assert.equal(evidence.length, 2);
    assert.equal(new Set(evidence.map(e => e.observationId)).size, 2);
    assert.ok(evidence.every(e => e.dimension === "digital_readiness" && e.directness === "direct"));
    assert.notEqual(evidence[0]!.state, evidence[1]!.state);
    assert.deepEqual(evidence.filter(e => e.questionId === process), derive({ [process]: routine }));
    assert.deepEqual(evidence.filter(e => e.questionId === information), derive({ [information]: recovery }));
  }
});

test("R3I one-person process does not require handoffs and team handoffs can diverge from process", () => {
  const solo = { ...seed, q2_other_staff: "no" };
  const eligible = resolveEligibleQuestionsV2(solo, candidate).eligibleQuestionIds;
  assert.ok(eligible.includes(process));
  assert.ok(!eligible.includes(handoffs));
  const soloEvidence = derive({ [process]: "defined" });
  assert.equal(soloEvidence.length, 1);
  assert.ok(resolveEligibleQuestionsV2(seed, candidate).eligibleQuestionIds.includes(handoffs));
  for (const [routine, transfer] of [["informal", "complete"], ["defined", "incomplete"]] as const) {
    const evidence = derive({ [process]: routine, [handoffs]: transfer });
    assert.equal(evidence.length, 2);
    assert.deepEqual(evidence.filter(e => e.questionId === process), derive({ [process]: routine }));
    assert.deepEqual(evidence.filter(e => e.questionId === handoffs), derive({ [handoffs]: transfer }));
    assert.equal(evidence.find(e => e.questionId === handoffs)!.directness, "supporting");
    assert.notEqual(evidence[0]!.state, evidence[1]!.state);
  }
});

test("R3I B2B status visibility retains specialist supporting evidence without becoming process consistency", () => {
  assert.ok(resolveEligibleQuestionsV2(seed, candidate).eligibleQuestionIds.includes(status));
  const evidence = derive({ [process]: "informal", [status]: "clear" });
  assert.equal(evidence.length, 2);
  assert.deepEqual(evidence.filter(e => e.questionId === status), derive({ [status]: "clear" }));
  assert.deepEqual(evidence.filter(e => e.questionId === process), derive({ [process]: "informal" }));
  assert.equal(evidence.find(e => e.questionId === status)!.directness, "supporting");
  assert.equal(new Set(evidence.map(e => e.observationId)).size, 2);
});

test("R3I supporting alone stays unscored and its shared cap remains unchanged beside process", () => {
  for (const evidence of [derive({ [handoffs]: "complete" }), derive({ [status]: "clear" }), derive({ [handoffs]: "complete", [status]: "clear" })]) {
    assert.equal(score(evidence).score, null);
    assert.equal(score(evidence).explainability.basis, "supporting_only");
    assert.deepEqual(score(evidence).explainability.direct, []);
  }
  const direct = derive({ [process]: "partial" });
  const first = derive({ [handoffs]: "complete" });
  const second = derive({ [status]: "clear" });
  assert.equal(score([...direct, ...first, ...second]).score, score([...direct, ...first]).score);
  assert.deepEqual(score([...direct, ...first, ...second]).explainability.direct, [process]);
  const all = derive({ [process]: "partial", [information]: "easy_reliable", [handoffs]: "complete", [status]: "clear" });
  assert.equal(all.length, 4);
  assert.equal(new Set(all.map(e => e.observationId)).size, 4);
  assert.deepEqual([...score(all).explainability.direct].sort(), [information, process].sort());
  assert.deepEqual([...score(all).explainability.supporting].sort(), [handoffs, status].sort());
  assert.deepEqual(SCORING_MODEL, { directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 });
});

test("R3I processConsistency context and traces remain frozen without synthetic or circular evidence", () => {
  for (const answer of ["defined", "partial", "informal", "unknown"] as const) {
    const answers = { ...seed, [process]: answer };
    const result = resolveEligibleQuestionsV2(answers, candidate);
    assert.deepEqual(result.context, resolveEligibleQuestionsV2(answers, frozen).context);
    const pendingView = candidate.map(q => q.id === process ? { ...q, evidenceMigration: "pending" as const } : q);
    const before = buildQuestionPlan({ answers, bank: pendingView });
    const after = buildQuestionPlan({ answers, bank: candidate });
    assert.deepEqual(before.selectedQuestionIds, buildQuestionPlan({ answers, bank: frozen }).selectedQuestionIds);
    assert.equal(before.materialEvidence.find(n => n.dimension === "digital_readiness")!.observed, 0);
    assert.equal(after.materialEvidence.find(n => n.dimension === "digital_readiness")!.observed, 1);
    assert.deepEqual(result.eligibleQuestionIds, resolveEligibleQuestionsV2(answers, pendingView).eligibleQuestionIds);
    const resolution = result.context.processConsistency;
    if (answer === "unknown") { assert.equal(resolution.status, "unresolved"); if (resolution.status === "unresolved") assert.equal(resolution.reason, "declared_unknown"); }
    else { assert.equal(resolution.status, "resolved"); if (resolution.status === "resolved") assert.equal(resolution.value, answer); }
    assert.equal(derive(answers).length, 1);
    assert.deepEqual(deriveContextualEvidence(answers, pendingView), []);
    assert.deepEqual(deriveContextualEvidence(answers, candidate.filter(q => q.id !== process)), []);
  }
  const raw = resolveDiagnosticContext({ hasRealCustomers: { value: true, provenance: "explicit_declaration" }, processConsistency: { value: "defined", provenance: "explicit_declaration" } });
  assert.equal(raw.context.processConsistency.status, "resolved");
  assert.ok(raw.trace.processConsistency.supportingSignals.includes("processConsistency"));
  assert.deepEqual(raw.context.growthStage, resolveDiagnosticContext({ hasRealCustomers: { value: true, provenance: "explicit_declaration" } }).context.growthStage);
  assert.deepEqual(derive(seed), []);
  const result = scoreContextualDimensions({ answers: {}, context: raw.context, evidence: [], bank: candidate }).dimensions.find(d => d.id === "digital_readiness")!;
  assert.equal(result.score, null);
});

test("R3I tools, documentation, automation, complexity and commercial outcomes do not determine evidence", () => {
  for (const option of question(process).options) {
    const evidence = derive({ [process]: option.value });
    for (const method of ["CRM", "automation", "software", "documented", "undocumented", "spreadsheet", "manual", "SOP", "many_steps", "many_employees", "profitable", "high_sales", "high_demand", "customer_satisfaction"]) {
      assert.deepEqual(derive({ [process]: option.value, unrelated_process_fixture: method }), evidence);
      assert.deepEqual(derive({ [process]: method }), []);
    }
    assert.ok(evidence.every(e => e.dimension === "digital_readiness"));
  }
});

test("R3I capacity remains pending context only and cannot imply process readiness", () => {
  assert.equal(question(capacity).evidenceMigration, "pending");
  for (const option of question(capacity).options) {
    assert.deepEqual(derive({ [capacity]: [option.value] }), []);
    assert.deepEqual(derive({ [process]: "defined", [capacity]: [option.value] }), derive({ [process]: "defined" }));
    assert.deepEqual(derive({ [process]: "informal", [capacity]: [option.value] }), derive({ [process]: "informal" }));
  }
});

test("R3I wrong version or incomplete map fails closed and legacy v1 remains historical", () => {
  const q = question(process);
  const wrong = { ...q, version: 1 as const };
  assert.ok(validateQuestionEvidenceV3(wrong).length > 0);
  assert.deepEqual(deriveContextualEvidence({ [process]: "defined" }, [wrong]), []);
  const reading = q.evidenceV3!.dimensions[0]!;
  const { unknown: _unknown, ...incomplete } = reading.answers;
  const invalid = { ...q, evidenceV3: { ...q.evidenceV3!, dimensions: [{ ...reading, answers: incomplete }] } };
  assert.ok(validateQuestionEvidenceV3(invalid).length > 0);
  assert.deepEqual(deriveContextualEvidence({ [process]: "defined" }, [invalid]), []);
  const old = legacy.find(q => q.id === process)!;
  assert.equal(old.version, 1);
  assert.equal(old.evidenceMigration, undefined);
  for (const option of old.options) {
    const answers = { [process]: option.value };
    const evidence = deriveContextualEvidence(answers, legacy);
    assert.deepEqual(evidence, deriveContextualEvidence(answers, [old]));
    assert.ok(evidence.every(e => e.questionVersion === undefined));
  }
});

test("R3I preserves every R2 field, adaptive role and inactive legacy runtime 85/v1", () => {
  const strip = ({ evidenceV3: _mapping, evidenceMigration: _state, ...q }: typeof candidate[number]) => q;
  assert.deepEqual(candidate.map(strip), frozen.map(strip));
  assert.equal(candidate.length, 38);
  assert.equal(question(process).routingRole, "adaptive");
  assert.deepEqual(question(process).appliesWhen, { op: "eq", ref: { question: "q2_has_customers" }, value: "yes" });
  for (const id of [...decisions.REMOVE, ...decisions.DEFER]) assert.ok(!candidate.some(q => q.id === id));
  assert.equal(legacy.length, 85);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
  assert.equal(getQuestionBank(2), legacy);
});
