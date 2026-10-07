import test from "node:test";
import assert from "node:assert/strict";
import { ADVERSARIAL_CASES_V3, NEAR_MISS_PAIRS_V3 } from "./qbv2-candidate-adversarial-cases";
import { CANONICAL_CASES_V3 } from "./qbv2-candidate-canonical-cases";
import { runCanonicalRouteV3 } from "./qbv2-candidate-case-runner";
import { BANK, DIRECT_SOURCES, QUESTION_BY_ID, SUPPORTING_SOURCES, dimensionOf, mulberry32, pick, runChain, solutionIds, without } from "./qbv2-candidate-qa-harness";
import { candidateCommercialEvidenceRoleV3, type CandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { CANDIDATE_PROCESS_AUTHORITY_V3, candidateSolutionContextOfV3 } from "../../../app/features/diagnostic/qbv2-candidate-solutions";
import { CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3 } from "../../../app/features/diagnostic/qbv2-candidate-interpretation";
import { solutionContextOf } from "../../../app/features/diagnostic/qbv2-solutions";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

/**
 * DIAG-V3-R6-C.1 / R6-D.2 corrective regression suite for the three frozen-contract violations found by
 * R7-B (F1 process authority, F2 supporting-selects-intervention, F3 clarification-as-confirmation). Asserts
 * semantics only — never a score, band or calibration value (R8 owns those; the supporting score
 * refinement itself is frozen and must survive).
 */

const CANONICAL_FINAL = new Map(CANONICAL_CASES_V3.map((c) => [c.id, runCanonicalRouteV3(c).finalAnswers]));
const fin = (id: string) => CANONICAL_FINAL.get(id)!;
const adv = (id: string) => [...ADVERSARIAL_CASES_V3, ...NEAR_MISS_PAIRS_V3].find((c) => c.id === id)!.answers;
const NEGATIVE = new Set(["missing", "weak", "partial", "dependency"]);
const AUTOMATION = new Set(["operational_automation", "follow_up_automation"]);
const BARRIO_SOLUTIONS = new Set(["crm_follow_up", "follow_up_automation", "online_booking", "operational_automation"]);
const SUPPORTING_IDS = new Set(SUPPORTING_SOURCES.map((q) => q.id));
const DIRECT_IDS = new Set(DIRECT_SOURCES.map((q) => q.id));

function stateOf(result: CandidateCommercialBoundaryV3, questionId: string): string | undefined {
  for (const d of result.scoring.dimensions) for (const e of d.evidence) if (e.questionId === questionId) return e.state;
  return undefined;
}
function solutionFor(result: CandidateCommercialBoundaryV3, dimension: string) {
  const index = result.recommendations.items.findIndex((r) => r.dimension === dimension);
  return index < 0 ? undefined : result.solutions[index]!.solution?.id ?? null;
}
function contextOf(result: CandidateCommercialBoundaryV3) {
  return candidateSolutionContextOfV3(result.scoring, result.priorities, result.narrative);
}

/** Corpus: 25 canonical routes, 36 adversarial/near-miss cases and 300 seeded random raw answer sets. */
let corpus: { label: string; result: CandidateCommercialBoundaryV3 }[] | undefined;
function randomAnswers(rng: () => number): AnswersV2 {
  const raw: Record<string, string | readonly string[]> = { q2_has_customers: rng() < 0.85 ? "yes" : "no" };
  for (const q of BANK) {
    if (q.id === "q2_has_customers" || rng() > 0.65) continue;
    const options = q.options.filter((o) => !o.exclusive || q.type === "single");
    const value = pick(rng, options.length > 0 ? options : q.options).value;
    raw[q.id] = q.type === "multi" ? [value] : value;
  }
  return raw as AnswersV2;
}
function CORPUS() {
  if (corpus) return corpus;
  const rng = mulberry32(0x6c1d2);
  corpus = [
    ...CANONICAL_CASES_V3.map((c) => ({ label: c.id, result: runChain(fin(c.id)) })),
    ...[...ADVERSARIAL_CASES_V3, ...NEAR_MISS_PAIRS_V3].map((c) => ({ label: c.id, result: runChain(c.answers) })),
    ...Array.from({ length: 300 }, (_, i) => ({ label: `rand#${i}`, result: runChain(randomAnswers(rng)) })),
  ];
  return corpus;
}
const report: Record<string, unknown> = {};

// --- F1: candidate process authority -----------------------------------------------------------------

test("F1: the candidate process authority is q2_process_systemization, read only from its own R3 state", () => {
  assert.equal(CANDIDATE_PROCESS_AUTHORITY_V3, "q2_process_systemization");
  assert.ok(DIRECT_IDS.has(CANDIDATE_PROCESS_AUTHORITY_V3));
  const base = adv("A08b");
  for (const [value, expected] of [["defined", "defined"], ["partial", "undefined"], ["informal", "undefined"], ["unknown", "undefined"]] as const) {
    assert.equal(contextOf(runChain({ ...base, q2_process_systemization: value })).processMaturity, expected, `systemization=${value}`);
  }
  assert.equal(contextOf(runChain(without(base, "q2_process_systemization"))).processMaturity, "undefined", "absent process authority is never defined");
});

test("F1: healthy unrelated constructs (intake, information base, reminders) never create global process maturity", () => {
  const audits: Record<string, AnswersV2> = {
    "q2_professional_intake_flow=clear": { ...adv("A08b") },
    "q2_operations_information_base=easy_reliable": { ...adv("N08") },
    "q2_appointments_confirmation_reminders=consistent": { ...adv("N04"), q2_process_systemization: "informal" },
  };
  const out: Record<string, { legacy: string; candidate: string }> = {};
  for (const [label, answers] of Object.entries(audits)) {
    const result = runChain(answers);
    assert.equal(stateOf(result, "q2_process_systemization"), "weak", `${label}: precondition`);
    const legacy = solutionContextOf(result.scoring, result.priorities, result.narrative).processMaturity;
    const candidate = contextOf(result).processMaturity;
    out[label] = { legacy, candidate };
    assert.equal(candidate, "undefined", `${label}: an informal process stays undefined`);
    assert.ok(!solutionIds(result).some((id) => AUTOMATION.has(id)), `${label}: automation selected`);
  }
  report.processSignalAudit = out;
});

test("F1: C12 — making professional intake clear keeps work_organization/Cuadra, never automation/Barrio", () => {
  const before = runChain(fin("C12"));
  const after = runChain({ ...fin("C12"), q2_professional_intake_flow: "clear" });
  for (const r of [before, after]) {
    assert.equal(solutionFor(r, "digital_readiness"), "work_organization");
    assert.equal(r.commercial.licenseFit.recommendedLicense, "cuadra");
    assert.ok(!solutionIds(r).some((id) => AUTOMATION.has(id)));
  }
  // Interactive route with the mutated script (every answer actually asked by the planner).
  const caseDef = CANONICAL_CASES_V3.find((c) => c.id === "C12")!;
  const routed = runCanonicalRouteV3({ ...caseDef, id: "C12-intake-clear", answerScript: { ...caseDef.answerScript, q2_professional_intake_flow: "clear" } });
  assert.equal(runChain(routed.finalAnswers).commercial.licenseFit.recommendedLicense, "cuadra");
});

test("F1: A08b / C05 / N08 reproductions are corrected", () => {
  const a08b = runChain(adv("A08b"));
  assert.equal(solutionFor(a08b, "digital_readiness"), "work_organization");
  assert.equal(a08b.commercial.licenseFit.recommendedLicense, "cuadra");
  const c05 = runChain(fin("C05"));
  assert.equal(stateOf(c05, "q2_appointments_confirmation_reminders"), "weak");
  assert.equal(solutionFor(c05, "relationship_recurrence"), null, "weak reminders + informal process: no follow_up_automation");
  assert.ok(!solutionIds(c05).some((id) => AUTOMATION.has(id)));
  const n08 = runChain(adv("N08"));
  assert.equal(solutionFor(n08, "digital_readiness"), "work_organization");
  assert.notEqual(n08.commercial.licenseFit.recommendedLicense, "barrio");
});

test("F1: a weak follow-up process is never automated (CRM stays); reminders automate only with an established process authority", () => {
  const a01 = runChain(adv("A01"));
  assert.equal(stateOf(a01, "q2_process_systemization"), "established");
  assert.equal(solutionFor(a01, "relationship_recurrence"), "crm_follow_up", "processWeak → structured CRM, never automation, even with a defined general process");
  for (const id of ["C09", "A20"]) assert.equal(solutionFor(runChain(id === "C09" ? fin(id) : adv(id)), "relationship_recurrence"), "crm_follow_up");
  const n03 = runChain(adv("N03"));
  assert.equal(stateOf(n03, "q2_process_systemization"), "established");
  assert.equal(solutionFor(n03, "relationship_recurrence"), "follow_up_automation", "reminders weak + established process authority may automate");
  const n03Informal = runChain({ ...adv("N03"), q2_process_systemization: "informal" });
  assert.notEqual(solutionFor(n03Informal, "relationship_recurrence"), "follow_up_automation");
});

test("F1: automation proof invariant — every automation is authorized by an established q2_process_systemization; operational_automation is unreachable", () => {
  const authorizations: Record<string, number> = { operational_automation: 0, follow_up_automation: 0 };
  const falseAutomation: string[] = [];
  for (const { label, result } of CORPUS()) {
    for (const id of solutionIds(result).filter((s) => AUTOMATION.has(s))) {
      authorizations[id] = (authorizations[id] ?? 0) + 1;
      if (stateOf(result, "q2_process_systemization") !== "established") falseAutomation.push(`${label}: ${id} with process authority ${stateOf(result, "q2_process_systemization") ?? "absent"}`);
    }
  }
  report.automation = { authorizations, falseAutomation: falseAutomation.length };
  assert.deepEqual(falseAutomation, []);
  assert.equal(authorizations.operational_automation, 0, "no candidate-38 DIRECT source evidences operational automation as the supported intervention");
  assert.ok(authorizations.follow_up_automation! > 0, "reminder automation stays reachable with an established process");
});

// --- F2: supporting refines, never selects -----------------------------------------------------------

const SUPPORTING_MATRIX: readonly { label: string; answers: AnswersV2; supporting: string; expectSolution: string | null; expectLicense: string | null }[] = [
  { label: "direct established + supporting weak (B2B, N06)", answers: adv("N06"), supporting: "q2_b2b_status_visibility", expectSolution: null, expectLicense: null },
  { label: "direct established + supporting partial (B2B, C24)", answers: fin("C24"), supporting: "q2_b2b_status_visibility", expectSolution: null, expectLicense: null },
  { label: "direct established + supporting weak (handoffs)", answers: { ...adv("A16"), q2_process_systemization: "defined", q2_operations_handoffs: "incomplete" }, supporting: "q2_operations_handoffs", expectSolution: null, expectLicense: null },
  { label: "direct established + supporting partial (handoffs)", answers: { ...adv("A16"), q2_process_systemization: "defined", q2_operations_handoffs: "partial" }, supporting: "q2_operations_handoffs", expectSolution: null, expectLicense: null },
  { label: "direct weak + supporting established (handoffs, A16)", answers: adv("A16"), supporting: "q2_operations_handoffs", expectSolution: "work_organization", expectLicense: "cuadra" },
  { label: "direct weak + supporting established (B2B, A16b)", answers: adv("A16b"), supporting: "q2_b2b_status_visibility", expectSolution: "work_organization", expectLicense: "cuadra" },
  { label: "direct weak + supporting weak (handoffs)", answers: { ...adv("A16"), q2_operations_handoffs: "incomplete" }, supporting: "q2_operations_handoffs", expectSolution: "work_organization", expectLicense: "cuadra" },
  { label: "direct weak + supporting weak (B2B)", answers: { ...adv("A16b"), q2_b2b_status_visibility: "lose_track" }, supporting: "q2_b2b_status_visibility", expectSolution: "work_organization", expectLicense: "cuadra" },
];

test("F2: supporting/direct matrix — supporting still refines the frozen score but never selects the Readiness intervention or license", () => {
  const rows: unknown[] = [];
  for (const row of SUPPORTING_MATRIX) {
    const result = runChain(row.answers);
    const withoutSupporting = runChain(without(row.answers, row.supporting));
    const readiness = dimensionOf(result, "digital_readiness");
    assert.equal(readiness.explainability.basis, "direct_and_supporting", `${row.label}: supporting must stay visible in explainability`);
    // Frozen R3 math: supporting refines the score whenever its contribution differs from the direct base.
    const supportState = stateOf(result, row.supporting);
    const directState = stateOf(result, "q2_process_systemization");
    if (supportState !== directState) assert.notEqual(readiness.score, dimensionOf(withoutSupporting, "digital_readiness").score, `${row.label}: supporting refinement of the score must survive`);
    assert.equal(solutionFor(result, "digital_readiness") ?? null, row.expectSolution, `${row.label}: readiness solution`);
    assert.equal(result.commercial.licenseFit.recommendedLicense, row.expectLicense, `${row.label}: license`);
    rows.push({ case: row.label, recommendation: result.recommendations.items.find((r) => r.dimension === "digital_readiness")?.mode ?? "none", solution: solutionFor(result, "digital_readiness") ?? null, license: result.commercial.licenseFit.recommendedLicense });
  }
  report.supportingMatrix = rows;
});

test("F2: C24 / N06 — the recommendation survives (R6-A untouched), the specific solution and Cuadra do not", () => {
  for (const [label, answers] of [["C24", fin("C24")], ["N06", adv("N06")]] as const) {
    const result = runChain(answers);
    const rec = result.recommendations.items.find((r) => r.dimension === "digital_readiness");
    assert.ok(rec && rec.mode === "improve", `${label}: frozen priority/recommendation mechanics keep the improve item`);
    assert.ok(rec!.sourceQuestionIds.every((id) => SUPPORTING_IDS.has(id)), `${label}: precondition — supporting-only negative`);
    assert.equal(solutionFor(result, "digital_readiness"), null);
    assert.notEqual(result.commercial.licenseFit.recommendedLicense, "cuadra");
    assert.ok(!result.commercial.later.services.some((s) => s.id === "business_development_organization"));
  }
  // B2B chains stay separate: a genuine pipeline weakness still justifies CRM/Barrio on its own.
  const a20 = runChain(adv("A20"));
  assert.equal(solutionFor(a20, "digital_readiness"), null);
  assert.equal(solutionFor(a20, "relationship_recurrence"), "crm_follow_up");
  assert.equal(a20.commercial.licenseFit.recommendedLicense, "barrio");
  assert.ok(!a20.commercial.licenseFit.evidence.some((ref) => SUPPORTING_IDS.has(ref.questionId)), "Barrio proof must not lean on the supporting signal");
});

test("F2: solution proof invariant — every live non-null solution has a below-established DIRECT source of its own dimension", () => {
  const proofs: { label: string; solution: string; direct: string[]; supporting: string[] }[] = [];
  const violations: string[] = [];
  for (const { label, result } of CORPUS()) {
    if (result.narrative.lifecycle !== "live") continue; // prelaunch `prepare` solutions are a separate certified category
    result.recommendations.items.forEach((rec, index) => {
      const solution = result.solutions[index]!.solution;
      if (!solution) return;
      const direct = CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3.directQuestionIds(rec.dimension).filter((id) => NEGATIVE.has(stateOf(result, id) ?? ""));
      const supporting = rec.sourceQuestionIds.filter((id) => SUPPORTING_IDS.has(id));
      proofs.push({ label, solution: solution.id, direct: direct.map((id) => `${id}=${stateOf(result, id)}`), supporting });
      if (direct.length === 0) violations.push(`${label}: ${rec.dimension} ${solution.id} without DIRECT basis`);
    });
  }
  report.solutionProofs = { liveSolutions: proofs.length, withSupportingCited: proofs.filter((p) => p.supporting.length > 0).length, violations: violations.length };
  assert.deepEqual(violations, []);
  assert.ok(proofs.length > 0);
});

// --- R6-D.2: commercial proof honesty ----------------------------------------------------------------

test("R6-D.2: commercial evidence roles follow certified V3 directness — never a blanket DIRECT", () => {
  assert.equal(candidateCommercialEvidenceRoleV3("q2_process_systemization"), "DIRECT");
  assert.equal(candidateCommercialEvidenceRoleV3("q2_b2b_status_visibility"), "SUPPORTING");
  assert.equal(candidateCommercialEvidenceRoleV3("q2_operations_handoffs"), "SUPPORTING");
  assert.equal(candidateCommercialEvidenceRoleV3("q2_entity"), "CONTEXTUAL");
  assert.equal(candidateCommercialEvidenceRoleV3("q2_appointments_lead_to_booking"), "CONTEXTUAL");
  const counts: Record<string, number> = { DIRECT: 0, SUPPORTING: 0, CONTEXTUAL: 0, DERIVED: 0 };
  const mislabeled: string[] = [];
  for (const { label, result } of CORPUS()) {
    const c = result.commercial;
    for (const ref of [...c.licenseFit.evidence, ...[...c.now.services, ...c.now.complements, ...c.later.services, ...c.later.complements].flatMap((i) => i.evidence)]) {
      counts[ref.evidenceType] = (counts[ref.evidenceType] ?? 0) + 1;
      if (!QUESTION_BY_ID.has(ref.questionId)) { if (ref.evidenceType !== "DERIVED") mislabeled.push(`${label}: non-question proof ${ref.questionId} labeled ${ref.evidenceType}`); continue; }
      if (ref.evidenceType !== candidateCommercialEvidenceRoleV3(ref.questionId)) mislabeled.push(`${label}: ${ref.questionId} labeled ${ref.evidenceType}`);
    }
  }
  report.evidenceRoles = { ...counts, mislabeled: mislabeled.length };
  assert.deepEqual(mislabeled, []);
  assert.ok(counts.SUPPORTING! > 0 && counts.DIRECT! > 0 && counts.CONTEXTUAL! > 0 && counts.DERIVED! > 0, "every role must actually be exercised");
});

test("R6-D.2: license proof invariant — every Cuadra/Barrio rests on a DERIVED solution fact backed by DIRECT evidence; none from supporting, context, entity or website alone", () => {
  const audit = { cuadra: 0, barrio: 0, supportingOnlyCuadra: 0, entityOnlyCuadra: 0, websiteOnlyCuadra: 0, licenseFromSupportingOnly: 0, licenseFromContextOnly: 0 };
  for (const { label, result } of CORPUS()) {
    const fit = result.commercial.licenseFit;
    if (fit.recommendedLicense !== "cuadra" && fit.recommendedLicense !== "barrio") continue;
    audit[fit.recommendedLicense] += 1;
    const licenseSolutions = result.recommendations.items.filter((_, i) => {
      const id = result.solutions[i]!.solution?.id;
      return fit.recommendedLicense === "cuadra" ? id === "work_organization" : id !== undefined && BARRIO_SOLUTIONS.has(id);
    });
    assert.ok(licenseSolutions.length > 0, `${label}: ${fit.recommendedLicense} without its solution`);
    assert.ok(fit.evidence.some((ref) => ref.evidenceType === "DERIVED" && ref.questionId.startsWith("recommendation:")), `${label}: missing DERIVED solution proof`);
    const directBacked = licenseSolutions.some((rec) => CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3.directQuestionIds(rec.dimension).some((id) => NEGATIVE.has(stateOf(result, id) ?? "")));
    const roles = fit.evidence.filter((ref) => QUESTION_BY_ID.has(ref.questionId)).map((ref) => ref.evidenceType);
    if (!directBacked) {
      if (licenseSolutions.every((rec) => rec.sourceQuestionIds.every((id) => SUPPORTING_IDS.has(id)))) { audit.licenseFromSupportingOnly += 1; if (fit.recommendedLicense === "cuadra") audit.supportingOnlyCuadra += 1; }
      else audit.licenseFromContextOnly += 1;
    }
    if (fit.recommendedLicense === "cuadra" && roles.length > 0 && roles.every((r) => r === "CONTEXTUAL")) audit.entityOnlyCuadra += 1;
    if (fit.recommendedLicense === "cuadra" && !solutionIds(result).includes("work_organization") && solutionIds(result).includes("website")) audit.websiteOnlyCuadra += 1;
  }
  report.licenseProof = audit;
  assert.deepEqual([audit.supportingOnlyCuadra, audit.entityOnlyCuadra, audit.websiteOnlyCuadra, audit.licenseFromSupportingOnly, audit.licenseFromContextOnly], [0, 0, 0, 0, 0]);
  assert.ok(audit.cuadra > 0 && audit.barrio > 0);
});

test("R6-D.2 (found by this suite): a prelaunch `prepare` work_organization stays a preparation service, never a Cuadra license", () => {
  // Same F2 class (license without any DIRECT observation): before R6-D.2 the seeded corpus produced 11
  // prelaunch Cuadra licenses from a Readiness `prepare` item with zero evidence behind it.
  for (const goal of ["organize", "automate"]) {
    const result = runChain({ q2_entity: "project", q2_has_customers: "no", q2_goal: goal, q2_delivery: ["other"], q2_monetization: "services", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_sector: "professional_services" });
    assert.equal(result.narrative.lifecycle, "prelaunch");
    const rec = result.recommendations.items.find((r) => r.dimension === "digital_readiness")!;
    assert.equal(rec.mode, "prepare");
    assert.equal(solutionFor(result, "digital_readiness"), "work_organization", "the certified prepare solution is preserved");
    assert.equal(result.commercial.licenseFit.recommendedLicense, null, `goal ${goal}: prelaunch never forces a license`);
  }
});

// --- F3: clarification truth table -------------------------------------------------------------------

test("F3: clarification truth table on the same Barrio-capable diagnostics (A20, C09)", () => {
  const confirmed = /confirma un único proceso/i;
  const table: unknown[] = [];
  for (const answers of [adv("A20"), fin("C09")]) {
    const rows = {
      undefined: runChain(answers).commercial.licenseFit,
      single_process: runChain(answers, "single_process").commercial.licenseFit,
      multiple_coordinated_processes: runChain(answers, "multiple_coordinated_processes").commercial.licenseFit,
      not_sure: runChain(answers, "not_sure").commercial.licenseFit,
      not_applicable: runChain(answers, "not_applicable").commercial.licenseFit,
    };
    const scope = (fit: typeof rows.undefined) => fit.evidence.find((ref) => ref.questionId === "commercial_process_scope")?.derivedFact;
    const expect = { undefined: ["barrio", "medium", true, undefined], single_process: ["barrio", "high", false, "one principal operational process"], multiple_coordinated_processes: ["ciudad", "high", false, "multiple coordinated operational processes"], not_sure: ["barrio", "to_confirm", true, undefined], not_applicable: ["barrio", "to_confirm", true, undefined] } as const;
    for (const [state, fit] of Object.entries(rows)) {
      const [license, confidence, unresolved, evidence] = expect[state as keyof typeof expect];
      assert.equal(fit.recommendedLicense, license, `${state}: license`);
      assert.equal(fit.confidence, confidence, `${state}: confidence`);
      assert.equal(fit.unresolvedSignals.includes("single_process_or_multiple_coordinated_processes"), unresolved, `${state}: unresolved process scope`);
      assert.equal(scope(fit), evidence, `${state}: process-scope evidence`);
      table.push({ state, license: fit.recommendedLicense, confidence: fit.confidence, unresolvedSignals: fit.unresolvedSignals, scopeEvidence: scope(fit) ?? null, whyNotHigher: fit.whyNotHigher });
    }
    for (const state of ["not_sure", "not_applicable", "undefined"] as const) assert.ok(!confirmed.test(rows[state].whyNotHigher) && !confirmed.test(rows[state].rationale), `${state}: must not claim a confirmed single process`);
    assert.ok(confirmed.test(rows.single_process.whyNotHigher));
    assert.match(rows.not_sure.whyNotHigher, /todavía no confirma/);
  }
  report.clarificationTable = table.slice(0, 5);
});

test("Out-of-scope Ciudad ambiguity is preserved unchanged (DIAG-V3-R7B-CIUDAD-SCOPE-001, no silent decision)", () => {
  // Characterizes current behavior only; the open question (is the clarification admissible outside a
  // Barrio-capable diagnostic?) stays documented debt for an explicit later disposition.
  for (const id of ["C16", "C19"]) assert.equal(runChain(fin(id), "multiple_coordinated_processes").commercial.licenseFit.recommendedLicense, "ciudad");
});

test("Corrective report (OBSERVATIONAL — reproducible record for the checkpoint)", () => {
  console.log(`R6CD_CORRECTIVE_REPORT ${JSON.stringify(report)}`);
  assert.ok(Object.keys(report).length > 0);
});
