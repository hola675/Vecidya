import test from "node:test";
import assert from "node:assert/strict";
import { ADVERSARIAL_CASES_V3, NEAR_MISS_PAIRS_V3 } from "./qbv2-candidate-adversarial-cases";
import { CANONICAL_CASES_V3 } from "./qbv2-candidate-canonical-cases";
import { runCanonicalRouteV3 } from "./qbv2-candidate-case-runner";
import { BANK, PRE_COMMERCIAL_KEYS, dimensionOf, mulberry32, pick, runChain, solutionIds } from "./qbv2-candidate-qa-harness";
import { buildCandidateCommercialBoundaryV3, type CandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3 } from "../../../app/features/diagnostic/qbv2-candidate-interpretation";
import type { CommercialClarificationAnswer } from "../../../app/features/diagnostic/commercial-recommendation";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

/**
 * DIAG-V3-R6-D.3 / R7-B.1 — Ciudad clarification scope (closes DIAG-V3-R7B-CIUDAD-SCOPE-001). The
 * post-diagnostic process-scope clarification is only a Barrio ↔ Ciudad discriminator for an already
 * evidence-backed recurring commercial need; it never creates that need. Outside it, every clarification
 * state leaves the complete commercial output identical to the unclarified one — no license, confidence,
 * scope evidence, service, complement or NOW/LATER item may move.
 */

const CLARIFICATIONS: readonly (CommercialClarificationAnswer | undefined)[] = [undefined, "single_process", "multiple_coordinated_processes", "not_sure", "not_applicable"];
const BARRIO_SOLUTIONS = new Set(["crm_follow_up", "follow_up_automation", "online_booking", "operational_automation"]);
const BELOW_ESTABLISHED = new Set(["partial", "weak", "dependency", "missing"]);

let canonicalFinal: Map<string, AnswersV2> | undefined;
const fin = (id: string) => (canonicalFinal ??= new Map(CANONICAL_CASES_V3.map((c) => [c.id, runCanonicalRouteV3(c).finalAnswers]))).get(id)!;
const adv = (id: string) => [...ADVERSARIAL_CASES_V3, ...NEAR_MISS_PAIRS_V3].find((c) => c.id === id)!.answers;

/** Recomputed independently of the resolver: a Barrio-level solution whose own dimension has a below-established DIRECT source. */
function hasRecurringNeed(result: CandidateCommercialBoundaryV3): boolean {
  const states = new Map(result.scoring.dimensions.flatMap((d) => d.evidence.map((e) => [e.questionId, e.state] as const)));
  return result.recommendations.items.some((rec, index) => {
    const id = result.solutions[index]!.solution?.id;
    return id !== undefined && BARRIO_SOLUTIONS.has(id) && CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3.directQuestionIds(rec.dimension).some((q) => BELOW_ESTABLISHED.has(states.get(q) ?? ""));
  });
}
const scopeEvidence = (result: CandidateCommercialBoundaryV3) => result.commercial.licenseFit.evidence.filter((ref) => ref.questionId === "commercial_process_scope");
const itemIds = (result: CandidateCommercialBoundaryV3) => {
  const c = result.commercial;
  return { now: [...c.now.services, ...c.now.complements].map((i) => i.id), later: [...c.later.services, ...c.later.complements].map((i) => i.id) };
};

const NO_RECURRING_NEED: Record<string, () => AnswersV2> = {
  C16: () => fin("C16"), C19: () => fin("C19"), "A18 website-only": () => adv("A18"), "C01 prelaunch": () => fin("C01"),
  "C15 Measurement": () => fin("C15"), "A10 Measurement": () => adv("A10"), "C18 Discovery": () => fin("C18"), "A09 Discovery": () => adv("A09"), "A05 unknown-heavy": () => adv("A05"),
};
const CUADRA_ONLY: Record<string, () => AnswersV2> = { C12: () => fin("C12"), A08b: () => adv("A08b"), N08: () => adv("N08") };
const RECURRING: Record<string, () => AnswersV2> = { A20: () => adv("A20"), C09: () => fin("C09"), C04: () => fin("C04") };
const report: Record<string, unknown> = {};

test("R6-D.3: clarification relevance matrix — outside a recurring need every state keeps the independent result; inside it, the R6-D.2 truth table holds", () => {
  const rows: string[] = [];
  for (const [group, cases, expectedLicense] of [["none", NO_RECURRING_NEED, null], ["Cuadra-only", CUADRA_ONLY, "cuadra"]] as const) {
    for (const [label, answers] of Object.entries(cases)) {
      const base = runChain(answers());
      assert.equal(hasRecurringNeed(base), false, `${label}: precondition — no recurring commercial need`);
      assert.equal(base.commercial.licenseFit.recommendedLicense, expectedLicense, `${label}: independent license`);
      for (const clarification of CLARIFICATIONS) {
        const clarified = runChain(answers(), clarification);
        // The whole commercial block (license, confidence, evidence, NOW/LATER, cost) must not move.
        assert.deepStrictEqual(clarified.commercial, base.commercial, `${label} / ${clarification}: clarification changed commercial output outside a recurring need`);
      }
      rows.push(`${group} ${label}: ${expectedLicense ?? "null"}/${base.commercial.licenseFit.confidence} ×5`);
    }
  }
  const table = [
    [undefined, "barrio", "medium", true, undefined], ["single_process", "barrio", "high", false, "one principal operational process"],
    ["multiple_coordinated_processes", "ciudad", "high", false, "multiple coordinated operational processes"],
    ["not_sure", "barrio", "to_confirm", true, undefined], ["not_applicable", "barrio", "to_confirm", true, undefined],
  ] as const;
  for (const [label, answers] of Object.entries(RECURRING)) {
    assert.equal(hasRecurringNeed(runChain(answers())), true, `${label}: precondition — recurring commercial need`);
    for (const [clarification, license, confidence, unresolved, scopeFact] of table) {
      const fit = runChain(answers(), clarification).commercial.licenseFit;
      assert.deepEqual(
        [fit.recommendedLicense, fit.confidence, fit.unresolvedSignals.length > 0, fit.evidence.find((ref) => ref.questionId === "commercial_process_scope")?.derivedFact],
        [license, confidence, unresolved, scopeFact], `${label} / ${clarification}`,
      );
    }
    rows.push(`recurring ${label}: barrio/medium, barrio/high, ciudad/high, barrio/to_confirm, barrio/to_confirm`);
  }
  report.matrix = rows;
});

test("R6-D.3: C16 / C19 — the R7-B debt reproductions no longer manufacture Ciudad; deterministic and commercial-only", () => {
  for (const id of ["C16", "C19"]) {
    const unclarified = runChain(fin(id));
    assert.equal(unclarified.commercial.licenseFit.recommendedLicense, null);
    for (const clarification of CLARIFICATIONS) {
      const clarified = runChain(fin(id), clarification);
      assert.deepStrictEqual(runChain(fin(id), clarification), clarified, `${id} / ${clarification}: deterministic`);
      assert.equal(clarified.commercial.licenseFit.recommendedLicense, null, `${id} / ${clarification}: no license from clarification`);
      assert.equal(scopeEvidence(clarified).length, 0, `${id} / ${clarification}: no process-scope evidence`);
      for (const key of PRE_COMMERCIAL_KEYS) assert.deepStrictEqual(clarified[key], unclarified[key], `${id} / ${clarification}: ${key}`);
    }
  }
});

test("R6-D.3: Cuadra + multiprocess stays Cuadra — the work_organization proof is the whole authority, neither strengthened nor weakened", () => {
  for (const [label, answers] of Object.entries(CUADRA_ONLY)) {
    const fit = runChain(answers(), "multiple_coordinated_processes").commercial.licenseFit;
    assert.equal(fit.recommendedLicense, "cuadra", label);
    assert.equal(fit.confidence, "medium", `${label}: existing Cuadra confidence`);
    assert.ok(fit.evidence.some((ref) => ref.evidenceType === "DERIVED" && ref.answerOption === "work_organization"), `${label}: DERIVED work_organization proof`);
    assert.ok(fit.evidence.some((ref) => ref.questionId === "q2_process_systemization" && ref.evidenceType === "DIRECT"), `${label}: DIRECT Readiness basis`);
    assert.equal(scopeEvidence(runChain(answers(), "multiple_coordinated_processes")).length, 0, label);
  }
});

test("R6-D.3: service-only, prelaunch, Measurement and Discovery diagnostics gain nothing from any clarification", () => {
  // Website-only: Web & Conversión stays, no license.
  for (const answers of [fin("C19"), adv("A18")]) for (const clarification of CLARIFICATIONS) {
    const result = runChain(answers, clarification);
    assert.deepEqual(solutionIds(result), ["website"]);
    assert.equal(result.commercial.licenseFit.recommendedLicense, null);
    assert.deepEqual(itemIds(result), { now: ["web_conversion_site"], later: [] });
  }
  // Prelaunch: no operational claim, no license; a prelaunch `prepare` Readiness item keeps only its preparation service.
  const prepare: AnswersV2 = { q2_entity: "project", q2_has_customers: "no", q2_goal: "organize", q2_delivery: ["other"], q2_monetization: "services", q2_customer_reach: "local", q2_customer_buyer: "b2c", q2_sector: "professional_services" };
  for (const answers of [fin("C01"), prepare]) {
    const base = runChain(answers);
    assert.equal(base.narrative.lifecycle, "prelaunch");
    for (const clarification of CLARIFICATIONS) {
      const result = runChain(answers, clarification);
      assert.equal(result.commercial.licenseFit.recommendedLicense, null);
      assert.deepEqual(itemIds(result), itemIds(base));
    }
  }
  assert.deepEqual(itemIds(runChain(prepare, "multiple_coordinated_processes")).later, ["business_development_organization"]);
  // Measurement: applicable, unobservable, verify, no solution — and no license or item from clarification.
  for (const answers of [fin("C15"), adv("A10")]) {
    const base = runChain(answers);
    const measurement = dimensionOf(base, "measurement_optimization");
    assert.deepEqual([measurement.applicability, measurement.score], ["applicable", null]);
    const rec = base.recommendations.items.findIndex((r) => r.dimension === "measurement_optimization");
    if (rec >= 0) assert.deepEqual([base.recommendations.items[rec]!.mode, base.solutions[rec]!.solution], ["verify", null]);
    for (const clarification of CLARIFICATIONS) {
      const result = runChain(answers, clarification);
      assert.equal(result.commercial.licenseFit.recommendedLicense, null);
      assert.deepEqual(itemIds(result), { now: [], later: [] });
    }
  }
  // Discovery: a weak reach stays solution-less — no channel offering, no Barrio/Ciudad.
  for (const answers of [fin("C18"), adv("A09")]) {
    const base = runChain(answers);
    const rec = base.recommendations.items.findIndex((r) => r.dimension === "discovery");
    assert.ok(rec >= 0, "precondition — a Discovery recommendation exists");
    assert.equal(base.solutions[rec]!.solution, null);
    for (const clarification of CLARIFICATIONS) {
      const result = runChain(answers, clarification);
      assert.equal(result.commercial.licenseFit.recommendedLicense, null);
      assert.deepEqual(itemIds(result), { now: [], later: [] });
    }
  }
});

test("R6-D.3: current-license transitions follow evidence — a multiprocess clarification never preserves Ciudad without a recurring need", () => {
  const transition = (answers: AnswersV2) => {
    const fit = buildCandidateCommercialBoundaryV3({ answers, currentLicense: "ciudad", clarificationAnswer: "multiple_coordinated_processes" }).commercial.licenseFit;
    return [fit.recommendedLicense, fit.change];
  };
  assert.deepEqual(transition(fin("C09")), ["ciudad", "same"], "recurring need present: Ciudad is justified and kept");
  assert.deepEqual(transition({ ...fin("C09"), q2_b2b_pipeline: "defined" }), [null, "exit_or_none"], "C09 with its pipeline weakness removed");
  assert.deepEqual(transition({ ...fin("C04"), q2_appointments_booking_friction: "rarely" }), [null, "exit_or_none"], "C04 with its booking friction removed");
  assert.deepEqual(transition(fin("C19")), [null, "exit_or_none"], "website-only");
  assert.deepEqual(transition(fin("C12")), ["cuadra", "downgrade"], "Cuadra-only");
  report.transitions = { "C09 recurring": "ciudad/same", "C09 pipeline healed": "null/exit_or_none", "C04 booking healed": "null/exit_or_none", C19: "null/exit_or_none", C12: "cuadra/downgrade" };
});

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

test("R6-D.3: corpus invariants — no Ciudad/Barrio, scope evidence or commercial change from clarification without a recurring need; pre-commercial layers never move", () => {
  const rng = mulberry32(0x6d3c1);
  const corpus: { label: string; answers: AnswersV2 }[] = [
    ...CANONICAL_CASES_V3.map((c) => ({ label: c.id, answers: fin(c.id) })),
    ...[...ADVERSARIAL_CASES_V3, ...NEAR_MISS_PAIRS_V3].map((c) => ({ label: c.id, answers: c.answers })),
    ...Array.from({ length: 200 }, (_, i) => ({ label: `rand#${i}`, answers: randomAnswers(rng) })),
  ];
  const counts = { runs: 0, recurringBases: 0, nonRecurringBases: 0, ciudadWithoutRecurringNeed: 0, barrioWithoutRecurringNeed: 0, scopeEvidenceOutsideRecurringNeed: 0, commercialChangedOutsideRecurringNeed: 0, preCommercialMutation: 0, recurringTruthTableViolations: 0 };
  const violations: string[] = [];
  for (const { label, answers } of corpus) {
    const base = runChain(answers);
    const recurring = hasRecurringNeed(base);
    counts[recurring ? "recurringBases" : "nonRecurringBases"] += 1;
    for (const clarification of CLARIFICATIONS) {
      const result = runChain(answers, clarification);
      counts.runs += 1;
      const license = result.commercial.licenseFit.recommendedLicense;
      const where = `${label} / ${clarification}`;
      if (PRE_COMMERCIAL_KEYS.some((key) => { try { assert.deepStrictEqual(result[key], base[key]); return false; } catch { return true; } })) { counts.preCommercialMutation += 1; violations.push(`${where}: pre-commercial mutation`); }
      if (recurring) {
        const expected = clarification === "multiple_coordinated_processes" ? "ciudad" : "barrio";
        if (license !== expected) { counts.recurringTruthTableViolations += 1; violations.push(`${where}: ${license} instead of ${expected}`); }
        continue;
      }
      if (license === "ciudad") { counts.ciudadWithoutRecurringNeed += 1; violations.push(`${where}: Ciudad without recurring need`); }
      if (license === "barrio") { counts.barrioWithoutRecurringNeed += 1; violations.push(`${where}: Barrio without recurring need`); }
      if (scopeEvidence(result).length > 0) { counts.scopeEvidenceOutsideRecurringNeed += 1; violations.push(`${where}: commercial_process_scope evidence`); }
      try { assert.deepStrictEqual(result.commercial, base.commercial); } catch { counts.commercialChangedOutsideRecurringNeed += 1; violations.push(`${where}: commercial output changed`); }
    }
  }
  report.corpus = counts;
  assert.deepEqual(violations, [], violations.slice(0, 20).join("\n"));
  assert.ok(counts.recurringBases > 0 && counts.nonRecurringBases > 0, "both sides of the boundary must be exercised");
});

test("R6-D.3 report (OBSERVATIONAL — reproducible record for the checkpoint)", () => {
  console.log(`R6D3_CIUDAD_SCOPE_REPORT ${JSON.stringify(report)}`);
  assert.ok(Object.keys(report).length > 0);
});
