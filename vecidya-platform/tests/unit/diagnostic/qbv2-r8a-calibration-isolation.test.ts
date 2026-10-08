import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { BANK, mulberry32, pick } from "./qbv2-candidate-qa-harness";
import {
  CALIBRATION_EXPECTATIONS_V3, CALIBRATION_OWNERSHIP_V3, candidateCalibrationInvariantViolationsV3, evaluateCandidateCalibrationV3, r7CorpusV3, sharedReferenceCalibrationV3,
} from "./qbv2-r8-calibration-qa";
import { R8_HANDOFF_LABEL_V3, buildR8HandoffV3 } from "./qbv2-r8-handoff";
import {
  CANDIDATE_CALIBRATION_IDENTITY_V3, CANDIDATE_CALIBRATION_V3, CANDIDATE_CALIBRATION_VERSION_V3, type CandidateCalibrationV3,
} from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import { buildCandidateCommercialBoundaryV3, type CandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qbv2-candidate-scoring";
import { CAPABILITY_CONTRIBUTION, CAPABILITY_STATES, NEGATIVE_CAPABILITY_STATES, POSITIVE_CAPABILITY_STATES } from "../../../app/features/diagnostic/qbv2-capability";
import { CONFIDENCE_MODEL, LEGACY_DIMENSION_CALIBRATION, SCORING_MODEL, scoreContextualDimensions } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { OVERALL_INDEX_MODEL, bandFor, computeDigitalPresenceIndex, computeOverallConfidence, displayScoreFor, resolveGlobalDigitalStatus } from "../../../app/features/diagnostic/qbv2-overall";
import { SEVERITY_BANDS, deriveConstraintsAndPriorities } from "../../../app/features/diagnostic/qbv2-priorities";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { ADAPTIVE_PLANNER_VERSION } from "../../../app/features/diagnostic/qbv2-planner";
import {
  CURRENT_DIAGNOSTIC_VERSION, CURRENT_QUESTION_BANK_VERSION, CURRENT_RESULT_SCHEMA_VERSION, CURRENT_ROUTING_VERSION, CURRENT_SCORING_VERSION,
} from "../../../app/features/diagnostic/contracts";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

/**
 * DIAG-V3-R8-A — candidate calibration isolation & baseline. Architecture only: the candidate chain now reads
 * one isolated, immutable calibration (`CANDIDATE_CALIBRATION_V3`) through defaulted seams, legacy keeps the
 * shared constants, and no numeric value changed. Every reported number is OBSERVATIONAL — FOR R8, NOT FROZEN.
 */

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const run = (answers: AnswersV2, calibration?: CandidateCalibrationV3) => buildCandidateCommercialBoundaryV3({ answers, calibration });
const corpus = () => r7CorpusV3();
let baseline: Map<string, string> | undefined;
const baselineOf = (id: string, answers: AnswersV2) => (baseline ??= new Map()).get(id) ?? (baseline.set(id, JSON.stringify(run(answers))), baseline.get(id)!);
const report: Record<string, unknown> = {};

test("R8-A: candidate calibration identity, version and an explicit, immutable, internally consistent model", () => {
  assert.equal(CANDIDATE_CALIBRATION_IDENTITY_V3, "diag-v3-candidate-calibration-v1");
  assert.equal(CANDIDATE_CALIBRATION_VERSION_V3, 1);
  assert.deepEqual([CANDIDATE_CALIBRATION_V3.identity, CANDIDATE_CALIBRATION_V3.version], [CANDIDATE_CALIBRATION_IDENTITY_V3, 1]);
  assert.deepEqual(Object.keys(CANDIDATE_CALIBRATION_V3), ["identity", "version", "capabilityContribution", "scoring", "dimensionConfidence", "severity", "overall"]);
  const frozen = (value: unknown): boolean => value === null || typeof value !== "object" || (Object.isFrozen(value) && Object.values(value).every(frozen));
  assert.ok(frozen(CANDIDATE_CALIBRATION_V3), "deeply immutable");
  assert.throws(() => { (CANDIDATE_CALIBRATION_V3.scoring as { directWeight: number }).directWeight = 2; }, TypeError);
  assert.deepEqual(candidateCalibrationInvariantViolationsV3(CANDIDATE_CALIBRATION_V3), []);
  // Not a runtime diagnostic version: the public runtime stays exactly where it was.
  assert.equal(QUESTION_BANK_V2.length, 85);
  assert.deepEqual([CURRENT_DIAGNOSTIC_VERSION, CURRENT_QUESTION_BANK_VERSION, CURRENT_ROUTING_VERSION, CURRENT_SCORING_VERSION, CURRENT_RESULT_SCHEMA_VERSION, ADAPTIVE_PLANNER_VERSION], ["2.0", 1, 1, 1, 1, 2]);
});

test("R8-A: the candidate baseline equals the shared model value-for-value; the shared (legacy) values are untouched", () => {
  const strip = ({ identity: _i, version: _v, ...rest }: CandidateCalibrationV3) => JSON.parse(JSON.stringify(rest));
  assert.deepEqual(strip(CANDIDATE_CALIBRATION_V3), strip(sharedReferenceCalibrationV3()));
  assert.deepEqual(CAPABILITY_CONTRIBUTION, { strong: 1, established: 0.75, partial: 0.5, weak: 0.25, dependency: 0.25, missing: 0, constraint: null, uncertainty: null, not_applicable: null });
  assert.deepEqual([SCORING_MODEL, CONFIDENCE_MODEL, SEVERITY_BANDS], [{ directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 }, { supportingWeight: 0.5, mediumAt: 1.5, highAt: 3 }, { materialBelow: 50, moderateBelow: 75 }]);
  assert.deepEqual(OVERALL_INDEX_MODEL, { minScoredDimensions: 3, minCoverage: 1 / 3, bands: { developingFrom: 41, solidFrom: 71 }, confidence: { mediumCoverage: 0.5, highCoverage: 0.75, share: 0.5 } });
  assert.match(read("../../../app/features/diagnostic/qbv2-solutions.ts"), /^const SOUND = 75;$/m);
  // Legacy defaults are the shared objects themselves, not copies.
  assert.ok(LEGACY_DIMENSION_CALIBRATION.scoring === SCORING_MODEL && LEGACY_DIMENSION_CALIBRATION.confidence === CONFIDENCE_MODEL);
  for (const row of CALIBRATION_OWNERSHIP_V3.filter((r) => r.candidateEffect !== "NO")) assert.equal(row.candidateValue(CANDIDATE_CALIBRATION_V3), row.legacyValue, row.parameter);
});

function seededCorpus(size: number, seed: number): { id: string; answers: AnswersV2 }[] {
  const rng = mulberry32(seed);
  return Array.from({ length: size }, (_, i) => {
    const raw: Record<string, string | readonly string[]> = { q2_has_customers: rng() < 0.85 ? "yes" : "no" };
    for (const q of BANK) {
      if (q.id === "q2_has_customers" || rng() > 0.65) continue;
      const options = q.options.filter((o) => !o.exclusive || q.type === "single");
      const value = pick(rng, options.length > 0 ? options : q.options).value;
      raw[q.id] = q.type === "multi" ? [value] : value;
    }
    return { id: `rand#${i}`, answers: raw as AnswersV2 };
  });
}

test("R8-A: baseline parity — the isolated candidate path equals the shared-reference (pre-isolation) path over 25 canonical + 36 adversarial + 200 seeded inputs", () => {
  const shared = sharedReferenceCalibrationV3();
  const differences: string[] = [];
  const sets = { canonical: corpus().slice(0, 25), adversarial: corpus().slice(25), fuzz: seededCorpus(200, 0x8a1) };
  for (const [name, cases] of Object.entries(sets)) for (const { id, answers } of cases) {
    if (JSON.stringify(run(answers)) !== JSON.stringify(run(answers, shared))) differences.push(`${name}/${id}`);
  }
  report.parity = { canonical: sets.canonical.length, adversarial: sets.adversarial.length, fuzz: sets.fuzz.length, differences: differences.length };
  assert.deepEqual([sets.canonical.length, sets.adversarial.length], [25, 36]);
  assert.deepEqual(differences, []);
});

test("R8-A: ownership manifest is complete and each candidate-effective parameter has an executable dependency path", () => {
  const required = [
    "CAPABILITY_CONTRIBUTION.strong", "CAPABILITY_CONTRIBUTION.established", "CAPABILITY_CONTRIBUTION.partial", "CAPABILITY_CONTRIBUTION.weak", "CAPABILITY_CONTRIBUTION.dependency", "CAPABILITY_CONTRIBUTION.missing",
    "SCORING_MODEL.directWeight", "SCORING_MODEL.supportingWeight", "SCORING_MODEL.supportingCapRatio", "CONFIDENCE_MODEL.supportingWeight", "CONFIDENCE_MODEL.mediumAt", "CONFIDENCE_MODEL.highAt",
    "SEVERITY_BANDS.materialBelow", "SEVERITY_BANDS.moderateBelow", "OVERALL_INDEX_MODEL.minScoredDimensions", "OVERALL_INDEX_MODEL.minCoverage",
    "OVERALL_INDEX_MODEL.bands.developingFrom", "OVERALL_INDEX_MODEL.bands.solidFrom", "OVERALL_INDEX_MODEL.confidence.mediumCoverage", "OVERALL_INDEX_MODEL.confidence.highCoverage", "OVERALL_INDEX_MODEL.confidence.share",
    "SOUND (qbv2-solutions.ts)",
  ];
  assert.deepEqual(CALIBRATION_OWNERSHIP_V3.map((r) => r.parameter), required);
  const paths: Record<string, { effect: string; casesChanged: number }> = {};
  for (const row of CALIBRATION_OWNERSHIP_V3) {
    if (row.candidateEffect === "NO") { assert.equal(row.perturb, undefined, row.parameter); paths[row.parameter] = { effect: row.candidateEffect, casesChanged: 0 }; continue; }
    const base = row.base ? row.base(CANDIDATE_CALIBRATION_V3) : CANDIDATE_CALIBRATION_V3;
    const perturbed = row.perturb!(base);
    assert.deepEqual(candidateCalibrationInvariantViolationsV3(perturbed), [], `${row.parameter}: the probe itself must stay a valid calibration`);
    let changed = 0;
    for (const { id, answers } of corpus()) {
      const before = row.base ? JSON.stringify(run(answers, base)) : baselineOf(id, answers);
      if (JSON.stringify(run(answers, perturbed)) !== before) changed += 1;
    }
    paths[row.parameter] = { effect: row.candidateEffect, casesChanged: changed };
    if (row.candidateEffect === "YES") assert.ok(changed > 0, `${row.parameter}: claimed candidate-effective but no corpus output depends on it`);
    else assert.equal(changed, 0, `${row.parameter}: claimed unreachable but a corpus output depends on it`);
  }
  report.ownership = CALIBRATION_OWNERSHIP_V3.map((r) => ({ parameter: r.parameter, legacyValue: r.legacyValue, candidateBaseline: r.candidateValue(CANDIDATE_CALIBRATION_V3), candidateEffect: r.candidateEffect, legacyEffect: r.legacyEffect, owner: r.owner, casesChanged: paths[r.parameter]!.casesChanged, note: r.note }));
});

const HEAVY: CandidateCalibrationV3 = {
  ...CANDIDATE_CALIBRATION_V3,
  capabilityContribution: { ...CANDIDATE_CALIBRATION_V3.capabilityContribution, established: 0.9, partial: 0.6, weak: 0.3, dependency: 0.2, missing: 0.1 },
  scoring: { directWeight: 2, supportingWeight: 0.3, supportingCapRatio: 0.3 },
  dimensionConfidence: { supportingWeight: 0.25, mediumAt: 1, highAt: 2 },
  severity: { materialBelow: 40, moderateBelow: 85 },
  overall: { minScoredDimensions: 2, minCoverage: 0.5, bands: { developingFrom: 50, solidFrom: 80 }, confidence: { mediumCoverage: 0.4, highCoverage: 0.9, share: 0.3 } },
};

test("R8-A: numeric calibration never moves semantics — states, contradictions, signal polarity, applicability and the planner's inputs are identical under a heavily perturbed calibration", () => {
  assert.deepEqual(candidateCalibrationInvariantViolationsV3(HEAVY), []);
  const semanticProjection = (result: CandidateCommercialBoundaryV3) => ({
    activeAnswers: result.activeAnswers,
    dimensions: result.scoring.dimensions.map((d) => ({
      id: d.id, applicability: d.applicability, reason: d.applicabilityReason, scoreIsNull: d.score === null,
      evidence: d.evidence.map((e) => [e.questionId, e.directness, e.state]),
      counts: [d.confidence.direct, d.confidence.supporting, d.confidence.uncertain, d.confidence.contradictory], contradictions: d.explainability.contradictions,
    })),
    // Fact *types* legitimately follow severity; signal polarity per (dimension, question) is semantic.
    signals: [...new Set(result.semanticFacts.facts.filter((f) => ["strength", "partial", "weakness"].includes(f.type)).flatMap((f) => [
      ...(f.signals?.positive ?? []).map((s) => `${f.dimension}|${s.questionId}|+`), ...(f.signals?.negative ?? []).map((s) => `${f.dimension}|${s.questionId}|-`),
    ]))].sort(),
  });
  // Exactly what the candidate planner reads (R5): applicability, score null-ness and direct-evidence counts.
  const plannerInputs = (answers: AnswersV2, calibration?: CandidateCalibrationV3) =>
    scoreCandidateContextualDimensionsV3({ answers, calibration }).dimensions.map((d) => [d.id, d.applicability, d.score === null, d.confidence.direct]);
  let numericallyChanged = 0;
  for (const { id, answers } of corpus()) {
    const before = run(answers);
    const after = run(answers, HEAVY);
    if (JSON.stringify(before.scoring) !== JSON.stringify(after.scoring)) numericallyChanged += 1;
    assert.deepEqual(semanticProjection(after), semanticProjection(before), `${id}: semantics moved with numbers`);
    assert.deepEqual(plannerInputs(answers, HEAVY), plannerInputs(answers), `${id}: planner inputs moved with numbers`);
  }
  report.semanticInvariance = { cases: corpus().length, numericallyChanged, semanticChanges: 0 };
  assert.ok(numericallyChanged > 0, "the probe must actually move numbers");
});

test("R8-A: contradiction and fact-signal classes are exactly the former numeric thresholds under the shared table (legacy behavior preserved)", () => {
  for (const state of CAPABILITY_STATES) {
    const contribution = CAPABILITY_CONTRIBUTION[state];
    if (contribution === null) { assert.ok(!POSITIVE_CAPABILITY_STATES.has(state) && !NEGATIVE_CAPABILITY_STATES.has(state), state); continue; }
    assert.equal(POSITIVE_CAPABILITY_STATES.has(state), contribution >= CAPABILITY_CONTRIBUTION.established!, `${state}: former POSITIVE_AT / POSITIVE_FLOOR`);
    assert.equal(NEGATIVE_CAPABILITY_STATES.has(state), contribution <= CAPABILITY_CONTRIBUTION.weak!, `${state}: former NEGATIVE_AT`);
    assert.equal(NEGATIVE_CAPABILITY_STATES.has(state), contribution < CAPABILITY_CONTRIBUTION.partial!, `${state}: former NEGATIVE_CEILING`);
  }
});

test("R8-A: candidate severity drives priorities, fact readings and prerequisites together; legacy defaults are the shared bands", () => {
  const severities: readonly CandidateCalibrationV3["severity"][] = [CANDIDATE_CALIBRATION_V3.severity, { materialBelow: 40, moderateBelow: 60 }, { materialBelow: 70, moderateBelow: 80 }];
  for (const severity of severities) {
    const calibration = { ...CANDIDATE_CALIBRATION_V3, severity };
    for (const { id, answers } of corpus()) {
      const result = run(answers, calibration);
      for (const d of result.scoring.dimensions.filter((x) => x.applicability === "applicable" && x.score !== null)) {
        const constraint = result.priorities.constraints.find((c) => c.dimension === d.id && (c.severity === "material" || c.severity === "moderate"));
        const expected = d.score! < severity.materialBelow ? "material" : d.score! < severity.moderateBelow ? "moderate" : undefined;
        assert.equal(constraint?.severity, expected, `${id}/${d.id} @${JSON.stringify(severity)}: priority severity`);
        const fact = result.semanticFacts.facts.find((f) => f.dimension === d.id && ["strength", "partial", "weakness"].includes(f.type));
        if (fact) assert.equal(fact.type, d.score! >= severity.moderateBelow ? "strength" : d.score! < severity.materialBelow ? "weakness" : "partial", `${id}/${d.id}: fact reading`);
      }
      for (const rec of result.recommendations.items) for (const p of rec.prerequisites) {
        const score = result.scoring.dimensions.find((x) => x.id === p.dimension)!.score;
        assert.equal(p.satisfied, score !== null && score >= severity.moderateBelow, `${id}/${rec.id}: prerequisite`);
      }
    }
  }
  // Legacy: no argument ⇔ the shared bands, on a legacy scoring.
  const legacy = scoreContextualDimensions({ answers: { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: ["appointments"], q2_goal: "opportunities", q2_appointments_booking_friction: "often" }, context: {}, evidence: [] });
  assert.deepEqual(deriveConstraintsAndPriorities(legacy), deriveConstraintsAndPriorities(legacy, SEVERITY_BANDS));
});

test("R8-A: candidate overall uses its own model; the R6-B observability exclusion holds; sufficiency and score never diverge; legacy overall defaults unchanged", () => {
  const models: readonly CandidateCalibrationV3["overall"][] = [CANDIDATE_CALIBRATION_V3.overall, { ...CANDIDATE_CALIBRATION_V3.overall, minCoverage: 0.5 }, { ...CANDIDATE_CALIBRATION_V3.overall, minCoverage: 0.6, minScoredDimensions: 2 }, { ...CANDIDATE_CALIBRATION_V3.overall, minScoredDimensions: 4 }];
  let measurementExcluded = 0;
  for (const overall of models) for (const { id, answers } of corpus()) {
    const index = run(answers, { ...CANDIDATE_CALIBRATION_V3, overall }).overall.index as ReturnType<typeof computeDigitalPresenceIndex> & { unobservableApplicableDimensions: readonly string[] };
    assert.equal(index.sufficient, index.rawScore !== null, `${id}: sufficient ⇔ score`);
    assert.equal(index.displayScore === null, index.rawScore === null, `${id}: display ⇔ score`);
    if (index.applicableDimensions.includes("measurement_optimization")) {
      assert.ok(index.unobservableApplicableDimensions.includes("measurement_optimization"), `${id}: Measurement stays out of the denominator`);
      if (overall === CANDIDATE_CALIBRATION_V3.overall) measurementExcluded += 1;
    }
  }
  report.overall = { measurementExcludedFromDenominator: measurementExcluded };
  // Legacy: implicit defaults ⇔ the shared model.
  const legacy = scoreContextualDimensions({ answers: { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: ["appointments"], q2_goal: "opportunities" }, context: {}, evidence: [] });
  const index = computeDigitalPresenceIndex(legacy);
  assert.deepEqual(index, computeDigitalPresenceIndex(legacy, { model: OVERALL_INDEX_MODEL }));
  assert.deepEqual(computeOverallConfidence(legacy, index), computeOverallConfidence(legacy, index, OVERALL_INDEX_MODEL));
  assert.deepEqual([bandFor(40), bandFor(41), bandFor(70), bandFor(71), displayScoreFor(40.5), displayScoreFor(70.5), displayScoreFor(41.4)], ["low", "developing", "developing", "solid", 40, 70, 41]);
  // The public band helpers keep their single-argument contract: callers pass them straight to `map`.
  assert.deepEqual([bandFor.length, displayScoreFor.length, resolveGlobalDigitalStatus.length], [1, 1, 1]);
  assert.deepEqual([40, 41, 71].map(bandFor), ["low", "developing", "solid"]);
});

test("R8-A: SOUND is LEGACY_ONLY — read only inside legacy matchSolution, never reachable from the candidate path", () => {
  const solutions = read("../../../app/features/diagnostic/qbv2-solutions.ts");
  const blocks = solutions.split(/^(?=export function )/m);
  const readers = blocks.filter((block) => /\bSOUND\b/.test(block) && !/^const SOUND = /m.test(block)).map((block) => block.match(/^export function (\w+)/)?.[1]);
  assert.deepEqual(readers, ["matchSolution"]);
  const candidateFiles = readdirSync(new URL("../../../app/features/diagnostic/", import.meta.url)).filter((f) => /^qbv2-candidate-.*\.ts$/.test(f));
  const code = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  for (const file of candidateFiles) {
    const source = code(read(`../../../app/features/diagnostic/${file}`));
    assert.ok(!/\bmatchSolution\b/.test(source), `${file} must never import or call legacy matchSolution`);
    assert.ok(!/\bSOUND\b/.test(source), `${file} must never read SOUND`);
  }
  assert.ok(!/context\.score\(/.test(read("../../../app/features/diagnostic/qbv2-candidate-solutions.ts")), "candidate solutions never read a numeric score");
  report.sound = "LEGACY_ONLY";
});

test("R8-A: candidate calibration stays private — not barrel-exported and referenced only by candidate modules", async () => {
  const barrel = (await import("../../../app/features/diagnostic/index")) as Record<string, unknown>;
  for (const symbol of ["CANDIDATE_CALIBRATION_V3", "CANDIDATE_CALIBRATION_IDENTITY_V3", "CANDIDATE_CALIBRATION_VERSION_V3", "candidateDimensionCalibrationV3", "buildCandidateCommercialBoundaryV3"]) assert.equal(barrel[symbol], undefined, symbol);
  const appRoot = new URL("../../../app/", import.meta.url);
  const files = (readdirSync(appRoot, { recursive: true }) as string[]).map((f) => f.replaceAll("\\", "/")).filter((f) => /\.tsx?$/.test(f));
  const importers = files.filter((file) => readFileSync(new URL(file, appRoot), "utf8").includes("qbv2-candidate-calibration"));
  assert.ok(importers.length > 0 && importers.every((file) => /(^|\/)qbv2-candidate-[a-z-]+\.ts$/.test(file)), importers.join(", "));
});

test("R8-A: the R7 handoff stays observational and deterministic, now labelled with the calibration identity and the R8 questions", () => {
  const handoff = buildR8HandoffV3();
  assert.deepStrictEqual(buildR8HandoffV3(), handoff);
  assert.equal(handoff.label, R8_HANDOFF_LABEL_V3);
  assert.deepEqual(handoff.calibration, { identity: CANDIDATE_CALIBRATION_IDENTITY_V3, version: CANDIDATE_CALIBRATION_VERSION_V3 });
  assert.deepEqual(handoff.observations.map((o) => o.code), ["R8-O1", "R8-O2", "R8-O3", "R8-O4", "R8-O5"]);
  assert.ok(handoff.observations.every((o) => o.question.endsWith("?")));
  assert.equal(handoff.cases.length * 8, handoff.cases.reduce((n, c) => n + c.dimensions.length, 0));
});

test("R8-A baseline and ownership report (OBSERVATIONAL — FOR R8, NOT FROZEN)", () => {
  const evaluation = evaluateCandidateCalibrationV3();
  assert.deepStrictEqual(evaluateCandidateCalibrationV3(), evaluation, "deterministic evaluator");
  assert.equal(evaluation.corpus, 61);
  assert.equal(CALIBRATION_EXPECTATIONS_V3.length, 0, "no numeric target is claimed in R8-A");
  console.log(`R8A_CALIBRATION_BASELINE ${JSON.stringify(evaluation)}`);
  console.log(`R8A_CALIBRATION_OWNERSHIP ${JSON.stringify(report)}`);
});
