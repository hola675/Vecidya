import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { CAPABILITY_CONTRIBUTION, STATE_KIND, type CapabilityState } from "../../../app/features/diagnostic/qbv2-capability";
import { CANDIDATE_CALIBRATION_BASELINE_V1, CANDIDATE_CALIBRATION_R8B_V2, CANDIDATE_CALIBRATION_V3, type CandidateCalibrationV3 } from "../../../app/features/diagnostic/qbv2-candidate-calibration";
import { CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3 } from "../../../app/features/diagnostic/qbv2-candidate-interpretation";
import { buildCandidateCommercialBoundaryV3, matchCandidateCommercialOfferingsV3, resolveCandidateLicenseFitV3, type CandidateCommercialBoundaryV3, type CandidateRecommendationsAndSolutionsV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { computeCandidateDigitalPresenceIndexV3 } from "../../../app/features/diagnostic/qbv2-candidate-overall";
import { buildCandidateQuestionPlanV3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import { candidateSolutionContextOfV3, matchCandidateSolutionV3 } from "../../../app/features/diagnostic/qbv2-candidate-solutions";
import { scoreCandidateContextualDimensionsV3 } from "../../../app/features/diagnostic/qbv2-candidate-scoring";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import { scoreDimensionWithApplicability, type ContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { deriveConstraintsAndPriorities } from "../../../app/features/diagnostic/qbv2-priorities";
import { buildDiagnosticRecommendations } from "../../../app/features/diagnostic/qbv2-recommendations";
import { buildDiagnosticNarrative } from "../../../app/features/diagnostic/qbv2-narrative";
import { buildDigitalPresenceStatus, computeOverallConfidence } from "../../../app/features/diagnostic/qbv2-overall";
import { deriveSemanticFacts } from "../../../app/features/diagnostic/qbv2-semantic-facts";
import { r7CorpusV3 } from "./qbv2-r8-calibration-qa";
import { holdoutCorpusV3 as r8bHoldoutV3 } from "./qbv2-r8b-calibration-experiments";
import { R8C_OPEN_DECISIONS_V3, r8cHoldoutV3 } from "./qbv2-r8c-overall-calibration-experiments";
import { CANONICAL_CASES_V3 } from "./qbv2-candidate-canonical-cases";

type Hypothesis = "H0_MEAN" | "H1_WORST_DIRECT" | "H2_BEST_DIRECT" | "H3_STRUCTURED";
type Source = { readonly id: string; readonly dimension: string; readonly version: number; readonly module: string; readonly prompt: string };
type Outcome = ReturnType<typeof summarize>;

const CALIBRATION = CANDIDATE_CALIBRATION_R8B_V2;
const BANK = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3;
const QUESTION_TOPICS = {
  q2_discovery_reliable_reach: "la constancia para llegar a personas nuevas interesadas",
  q2_process_systemization: "la forma de manejar las tareas que se repiten",
} as const;
const DIRECT_SEMANTIC_ROLES: Readonly<Record<string, string>> = {
  q2_professional_intake_flow: "claridad del paso de entrada para solicitar un servicio profesional",
  q2_retail_product_visibility: "visibilidad digital del catálogo o los productos del comercio",
  q2_presence_offer_clarity: "claridad de la oferta presentada en la presencia digital",
  q2_service_response_speed: "rapidez de respuesta ante consultas de servicio",
  q2_appointments_booking_friction: "fricción declarada al convertir interés en una cita reservada",
  q2_local_presence_consistency: "consistencia de información entre perfiles y presencia local",
  q2_ecommerce_product_discovery: "facilidad para descubrir productos dentro del canal ecommerce",
  q2_presence_digital_base: "existencia y solidez de una base digital propia",
  q2_process_systemization: "definición de cómo se ejecutan las tareas repetibles",
  q2_operations_information_base: "disponibilidad de información fiable para operar",
  q2_discovery_reliable_reach: "constancia para alcanzar personas nuevas interesadas",
  q2_b2b_pipeline: "continuidad de oportunidades B2B hasta conocer su desenlace",
  q2_service_quote_followup: "seguimiento de cotizaciones de servicio",
  q2_appointments_confirmation_reminders: "confirmación y recordatorio antes de una cita",
  q2_appointments_rebooking: "acuerdo de una próxima cita cuando se necesita otro ciclo",
  q2_retail_customer_capture: "captura de una vía de contacto tras la compra minorista",
  q2_followup_general_process: "existencia de un proceso general de seguimiento",
  q2_reputation_flow: "flujo para solicitar y atender reseñas o reputación",
  q2_professional_authority_signals: "señales visibles de autoridad profesional",
};
const CAPABILITY_STATES = ["weak", "partial", "established", "missing", "uncertainty", "not_applicable", "absent"] as const;
type SyntheticState = (typeof CAPABILITY_STATES)[number];

const sources = (): Source[] => BANK.flatMap((question) => question.evidenceV3?.dimensions
  .filter((reading) => reading.directness === "direct")
  .map((reading) => ({ id: question.id, dimension: reading.dimension, version: question.version, module: question.module, prompt: question.prompt })) ?? []);

function combinations<T>(items: readonly T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];
  const [first, ...rest] = items;
  return [...combinations(rest, size - 1).map((tail) => [first!, ...tail]), ...combinations(rest, size)];
}

function inventory() {
  const byDimension = new Map<string, Source[]>();
  for (const source of sources()) byDimension.set(source.dimension, [...(byDimension.get(source.dimension) ?? []), source]);
  return [...byDimension.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([dimension, dimensionSources]) => ({
    dimension,
    directSources: dimensionSources.map(({ id, version, module, prompt }) => ({ id, version, module, semanticRole: DIRECT_SEMANTIC_ROLES[id]!, prompt })),
    possibleSiblingPairs: combinations(dimensionSources, 2).map((pair) => pair.map((source) => source.id).sort()),
    possibleTriples: combinations(dimensionSources, 3).map((triple) => triple.map((source) => source.id).sort()),
  }));
}

function rawContribution(state: SyntheticState): number | null {
  return state === "absent" ? null : CAPABILITY_CONTRIBUTION[state as CapabilityState];
}

function syntheticEvidence(dimension: string, states: readonly SyntheticState[]): ContextualEvidence[] {
  return states.flatMap((state, index) => state === "absent" ? [] : [{
    questionId: `synthetic_direct_${index}`,
    dimension: dimension as ContextualEvidence["dimension"],
    observationId: `synthetic_direct_${index}`,
    directness: "direct" as const,
    state: state as CapabilityState,
    kind: STATE_KIND[state as CapabilityState],
    contribution: rawContribution(state),
    answer: [state],
  }]);
}

function scoreFor(dimension: string, states: readonly SyntheticState[], hypothesis: Hypothesis): { score: number | null; confidence: string } {
  const evidence = syntheticEvidence(dimension, states);
  if (hypothesis === "H0_MEAN" || hypothesis === "H3_STRUCTURED") {
    const result = scoreDimensionWithApplicability(dimension as ContextualEvidence["dimension"], evidence, "applicable", {
      scoring: CALIBRATION.scoring,
      confidence: CALIBRATION.dimensionConfidence,
    });
    return { score: result.score, confidence: result.confidence.level };
  }
  const observed = evidence.filter((item) => item.directness === "direct" && item.contribution !== null).map((item) => item.contribution!);
  const aggregate = observed.length === 0 ? null : hypothesis === "H1_WORST_DIRECT" ? Math.min(...observed) : Math.max(...observed);
  const result = scoreDimensionWithApplicability(dimension as ContextualEvidence["dimension"], evidence, "applicable", {
    scoring: CALIBRATION.scoring,
    confidence: CALIBRATION.dimensionConfidence,
  });
  return { score: aggregate === null ? null : Math.round(aggregate * 100), confidence: result.confidence.level };
}

function overwriteSiblingScores<T extends { readonly id: string; readonly score: number | null; readonly evidence: readonly ContextualEvidence[] }>(dimensions: readonly T[], hypothesis: Hypothesis): T[] {
  if (hypothesis === "H0_MEAN" || hypothesis === "H3_STRUCTURED") return [...dimensions];
  return dimensions.map((dimension) => {
    const direct = dimension.evidence.filter((item) => item.directness === "direct" && item.contribution !== null);
    if (direct.length < 2) return dimension;
    return {
      ...dimension,
      score: Math.round(100 * (hypothesis === "H1_WORST_DIRECT"
        ? Math.min(...direct.map((item) => item.contribution!))
        : Math.max(...direct.map((item) => item.contribution!)))),
    };
  });
}

function recomputeDownstream(base: CandidateCommercialBoundaryV3, dimensions = base.scoring.dimensions) {
  const scoring = { ...base.scoring, dimensions };
  const priorities = deriveConstraintsAndPriorities(scoring, CALIBRATION.severity);
  const semanticFacts = deriveSemanticFacts({
    answers: base.activeAnswers,
    scoring,
    priorities,
    bank: BANK,
    evidenceCatalog: CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3,
    severity: CALIBRATION.severity,
  });
  const narrative = buildDiagnosticNarrative({
    answers: base.activeAnswers,
    scoring,
    priorities,
    semanticFacts,
    bank: BANK,
    questionTopics: QUESTION_TOPICS,
  });
  const overall = buildDigitalPresenceStatus({
    scoring,
    priorities,
    semanticFacts,
    narrative,
    computeIndex: (value, options) => computeCandidateDigitalPresenceIndexV3(value, options, CALIBRATION.overall),
    computeConfidence: (value, index) => computeOverallConfidence(value, index, CALIBRATION.overall),
    bands: CALIBRATION.overall.bands,
  });
  const recommendations = buildDiagnosticRecommendations({ scoring, priorities, semanticFacts, narrative, severity: CALIBRATION.severity });
  const solutionContext = candidateSolutionContextOfV3(scoring, priorities, narrative);
  const solutions = recommendations.items.map((recommendation) => matchCandidateSolutionV3(recommendation, solutionContext));
  const intermediate = { ...base, scoring, priorities, semanticFacts, narrative, overall, recommendations, solutions } as CandidateRecommendationsAndSolutionsV3;
  const licenseFit = resolveCandidateLicenseFitV3(intermediate, undefined, undefined);
  const offerings = matchCandidateCommercialOfferingsV3(intermediate, licenseFit);
  return { ...intermediate, licenseFit, offerings };
}

function summarize(result: CandidateCommercialBoundaryV3 | ReturnType<typeof recomputeDownstream>) {
  const recomputed = "licenseFit" in result;
  const license = recomputed ? result.licenseFit.recommendedLicense : result.commercial.licenseFit.recommendedLicense;
  const offerings = recomputed
    ? { now: result.offerings.now.map((item) => item.id), later: result.offerings.later.map((item) => item.id) }
    : {
      now: [...result.commercial.now.complements, ...result.commercial.now.services].map((item) => item.id),
      later: [...result.commercial.later.complements, ...result.commercial.later.services].map((item) => item.id),
    };
  return {
    dimensions: result.scoring.dimensions.map((item) => ({ id: item.id, score: item.score, confidence: item.confidence.level, direct: item.confidence.direct, supporting: item.confidence.supporting })),
    facts: result.semanticFacts.facts.map((item) => ({ id: item.id, type: item.type, code: item.semanticCode, dimension: item.dimension, severity: item.severity, score: item.score, confidence: item.confidence, sourceQuestions: item.provenance.questionIds })),
    constraints: result.priorities.constraints.map((item) => ({ dimension: item.dimension, kind: item.kind, severity: item.severity, score: item.score, confidence: item.confidence, certainty: item.certainty, reasons: item.reasonCodes })),
    priorities: result.priorities.priorities.map((item) => ({ rank: item.rank, dimension: item.dimension, severity: item.severity, score: item.score, certainty: item.certainty })),
    overall: { rawScore: result.overall.index.rawScore, displayScore: result.overall.index.displayScore, band: result.overall.bandState, confidence: result.overall.confidence.level, provisional: result.overall.provisional },
    recommendations: result.recommendations.items.map((item) => ({ dimension: item.dimension, mode: item.mode, severity: item.sourceConstraint.severity, score: item.sourceConstraint.score, certainty: item.certainty, sourceQuestionIds: item.sourceQuestionIds })),
    solutions: result.solutions.map((item) => ({ recommendationId: item.recommendationId, solution: item.solution?.id ?? null })),
    license,
    offerings,
  };
}

function differs<T>(a: T, b: T): boolean { return JSON.stringify(a) !== JSON.stringify(b); }

function aggregateDelta(before: Outcome, after: Outcome) {
  const beforeDimensions = new Map(before.dimensions.map((item) => [item.id, item]));
  const afterDimensions = new Map(after.dimensions.map((item) => [item.id, item]));
  return {
    dimensionScores: [...beforeDimensions].filter(([id, item]) => item.score !== afterDimensions.get(id)?.score).map(([id]) => id),
    dimensionConfidenceChanged: [...beforeDimensions].filter(([id, item]) => item.confidence !== afterDimensions.get(id)?.confidence).map(([id]) => id),
    semanticFactsChanged: differs(before.facts, after.facts),
    prioritiesChanged: differs(before.priorities, after.priorities),
    severityChanged: differs(before.constraints.map(({ dimension, severity }) => [dimension, severity]), after.constraints.map(({ dimension, severity }) => [dimension, severity])),
    rawScoreChanged: before.overall.rawScore !== after.overall.rawScore,
    bandChanged: before.overall.band !== after.overall.band,
    overallConfidenceChanged: before.overall.confidence !== after.overall.confidence,
    provisionalChanged: before.overall.provisional !== after.overall.provisional,
    recommendationsChanged: differs(before.recommendations, after.recommendations),
    solutionsChanged: differs(before.solutions, after.solutions),
    licenseChanged: before.license !== after.license,
    offeringsChanged: differs(before.offerings, after.offerings),
  };
}

function corpusSiblingPairs(corpus: readonly { readonly id: string; readonly answers: Record<string, string | readonly string[] | undefined> }[]) {
  const pairs = new Map<string, number>();
  const triples: string[] = [];
  let instances = 0;
  let withSupporting = 0;
  for (const entry of corpus) {
    const result = buildCandidateCommercialBoundaryV3({ answers: entry.answers as never });
    for (const dimension of result.scoring.dimensions.filter((item) => item.confidence.direct > 1)) {
      instances += 1;
      const direct = dimension.evidence.filter((item) => item.directness === "direct");
      if (dimension.confidence.supporting > 0) withSupporting += 1;
      const ids = direct.map((item) => item.questionId).sort();
      const key = `${dimension.id}:${ids.join("+")}`;
      pairs.set(key, (pairs.get(key) ?? 0) + 1);
      if (ids.length > 2) triples.push(`${entry.id}:${key}`);
    }
  }
  return { instances, withSupporting, pairs: [...pairs.entries()].sort(([a], [b]) => a.localeCompare(b)), triples };
}

function downstreamReport(corpus: readonly { readonly id: string; readonly answers: Record<string, string | readonly string[] | undefined> }[]) {
  const reports = new Map<Hypothesis, { cases: number; changed: Record<string, number>; examples: Record<string, string[]> }>();
  for (const hypothesis of ["H1_WORST_DIRECT", "H2_BEST_DIRECT"] as const) reports.set(hypothesis, { cases: corpus.length, changed: {}, examples: {} });
  const criticalCases: Record<string, Record<string, Outcome>> = {};
  for (const entry of corpus) {
    const base = buildCandidateCommercialBoundaryV3({ answers: entry.answers as never });
    const baseline = summarize(base);
    for (const hypothesis of ["H1_WORST_DIRECT", "H2_BEST_DIRECT"] as const) {
      const changed = summarize(recomputeDownstream(base, overwriteSiblingScores(base.scoring.dimensions, hypothesis)) as CandidateCommercialBoundaryV3);
      const report = reports.get(hypothesis)!;
      const delta = aggregateDelta(baseline, changed);
      for (const [key, value] of Object.entries(delta)) if (value === true || (Array.isArray(value) && value.length > 0)) {
        report.changed[key] = (report.changed[key] ?? 0) + 1;
        const examples = report.examples[key] ?? [];
        if (examples.length < 12) report.examples[key] = [...examples, entry.id];
      }
      if (["A14", "N01", "N02"].includes(entry.id)) {
        criticalCases[entry.id] ??= { H0_MEAN: baseline };
        criticalCases[entry.id]![hypothesis] = changed;
      }
    }
  }
  return { hypotheses: Object.fromEntries(reports), criticalCases };
}

test("R8-O4: executable sibling inventory matches the reviewed candidate bank and distinguishes roles", () => {
  const migrated = BANK.filter((question) => question.evidenceMigration === "migrated");
  const direct = sources();
  const supporting = migrated.flatMap((question) => question.evidenceV3?.dimensions.filter((reading) => reading.directness === "supporting").map((reading) => ({ id: question.id, dimension: reading.dimension })) ?? []);
  const map = inventory();
  const sourceIds = direct.map((item) => item.id).sort();
  assert.equal(migrated.length, 21, "the executable candidate bank has 21 migrated questions");
  assert.equal(direct.length, 19, "the premise of 21 DIRECT sources differs from code: 19 are DIRECT and 2 are SUPPORTING");
  assert.equal(supporting.length, 2);
  assert.deepEqual(supporting.map((item) => item.id).sort(), ["q2_b2b_status_visibility", "q2_operations_handoffs"]);
  assert.deepEqual(sourceIds, [
    "q2_appointments_booking_friction", "q2_appointments_confirmation_reminders", "q2_appointments_rebooking", "q2_b2b_pipeline",
    "q2_discovery_reliable_reach", "q2_ecommerce_product_discovery", "q2_followup_general_process", "q2_local_presence_consistency",
    "q2_operations_information_base", "q2_presence_digital_base", "q2_presence_offer_clarity", "q2_process_systemization",
    "q2_professional_authority_signals", "q2_professional_intake_flow", "q2_reputation_flow", "q2_retail_customer_capture",
    "q2_retail_product_visibility", "q2_service_quote_followup", "q2_service_response_speed",
  ]);
  assert.deepEqual(map.map(({ dimension, directSources: values, possibleSiblingPairs, possibleTriples }) => [dimension, values.length, possibleSiblingPairs.length, possibleTriples.length]), [
    ["clarity_positioning", 3, 3, 1], ["conversion_access", 2, 1, 0], ["digital_foundation", 3, 3, 1],
    ["digital_readiness", 2, 1, 0], ["discovery", 1, 0, 0], ["relationship_recurrence", 6, 15, 20], ["trust_reputation", 2, 1, 0],
  ]);
  assert.deepEqual(Object.keys(DIRECT_SEMANTIC_ROLES).sort(), sourceIds);
  assert.ok(map.flatMap((dimension) => dimension.directSources).every((source) => source.semanticRole.length > 20 && source.prompt.length > 0 && source.module.length > 0));
  assert.equal(map.reduce((sum, dimension) => sum + dimension.possibleSiblingPairs.length, 0), 24);
  assert.equal(map.reduce((sum, dimension) => sum + dimension.possibleTriples.length, 0), 22);
});

test("R8-O4: selection order is fixed; current aggregation is a property of the shared scoring algorithm, not a v2 field", () => {
  const order = [
    "discard invariant violations", "discard R3 semantic violations", "discard unknown/N/A violations", "discard supporting authority changes",
    "discard unsupported commercial changes", "discard arbitrary weights", "compare robustness and explainability",
    "prefer the simplest surviving model", "keep baseline if no alternative is better grounded",
  ];
  assert.deepEqual(order.at(-1), "keep baseline if no alternative is better grounded");
  assert.deepEqual([CANDIDATE_CALIBRATION_BASELINE_V1.identity, CANDIDATE_CALIBRATION_BASELINE_V1.version], ["diag-v3-candidate-calibration-v1", 1]);
  assert.deepEqual([CANDIDATE_CALIBRATION_R8B_V2.identity, CANDIDATE_CALIBRATION_R8B_V2.version], ["diag-v3-candidate-calibration-v2", 2]);
  assert.equal(CANDIDATE_CALIBRATION_V3, CANDIDATE_CALIBRATION_R8B_V2);
  assert.deepEqual(CANDIDATE_CALIBRATION_R8B_V2.scoring, { directWeight: 1, supportingWeight: 0.5, supportingCapRatio: 0.5 });
  assert.deepEqual(CANDIDATE_CALIBRATION_R8B_V2.capabilityContribution, { strong: 1, established: 0.75, partial: 0.5, weak: 0.25, dependency: 0.25, missing: 0, constraint: null, uncertainty: null, not_applicable: null });
  assert.equal(R8C_OPEN_DECISIONS_V3.find((item) => item.code === "R8-O4")?.status, "CALIBRATION_MODEL_DECISION_REQUIRED", "the R8-C snapshot remains historical evidence of why this checkpoint existed");
  assert.equal(R8C_OPEN_DECISIONS_V3.find((item) => item.code === "R8-O6")?.status, "CALIBRATION_MODEL_DECISION_REQUIRED");

  const source = readFileSync(new URL("../../../app/features/diagnostic/qbv2-contextual-scoring.ts", import.meta.url), "utf8");
  assert.match(source, /function weightedScore\([\s\S]*?direct\.reduce\([\s\S]*?directWeight/);
  assert.doesNotMatch(source, /CandidateAggregation|siblingAggregation|facetWeights/);
  assert.equal(scoreFor("trust_reputation", ["weak", "established"], "H0_MEAN").score, 50);
  assert.deepEqual(scoreFor("trust_reputation", ["weak", "established"], "H3_STRUCTURED"), scoreFor("trust_reputation", ["weak", "established"], "H0_MEAN"));
});

test("R8-O4: exhaustive paired and three-facet synthetic states preserve monotonicity and neutral evidence", () => {
  const roster = inventory();
  const hypotheses: Hypothesis[] = ["H0_MEAN", "H1_WORST_DIRECT", "H2_BEST_DIRECT", "H3_STRUCTURED"];
  let pairScenarios = 0;
  let tripleScenarios = 0;
  for (const group of roster) {
    const groupSources = group.directSources;
    for (const pair of combinations(groupSources, 2)) for (const states of cartesian(CAPABILITY_STATES, 2)) {
      pairScenarios += 1;
      const before = new Map(hypotheses.map((hypothesis) => [hypothesis, scoreFor(group.dimension, states, hypothesis)]));
      for (let facet = 0; facet < 2; facet += 1) {
        const current = states[facet]!;
        const next = nextObservedState(current);
        if (next) {
          const improved = states.map((state, index) => index === facet ? next : state);
          for (const hypothesis of hypotheses) {
            const originalScore = before.get(hypothesis)!.score;
            const improvedScore = scoreFor(group.dimension, improved, hypothesis).score;
            if (originalScore !== null && improvedScore !== null) assert.ok(improvedScore >= originalScore, `${hypothesis}/${group.dimension}/${pair.map((source) => source.id)}/${states}`);
          }
        }
      }
      const anyKnown = states.some((state) => ["weak", "partial", "established", "missing"].includes(state));
      if (anyKnown) for (const hypothesis of hypotheses) {
        const uncertaintyAdded = [...states];
        const replacement = uncertaintyAdded.findIndex((state) => ["weak", "partial", "established", "missing"].includes(state));
        uncertaintyAdded[replacement] = "uncertainty";
        const neutralized = scoreFor(group.dimension, uncertaintyAdded, hypothesis);
        const originalEvidence = syntheticEvidence(group.dimension, states);
        const neutralEvidence = syntheticEvidence(group.dimension, uncertaintyAdded);
        const originalConfidence = scoreDimensionWithApplicability(group.dimension as ContextualEvidence["dimension"], originalEvidence, "applicable", { scoring: CALIBRATION.scoring, confidence: CALIBRATION.dimensionConfidence }).confidence.level;
        const neutralConfidence = scoreDimensionWithApplicability(group.dimension as ContextualEvidence["dimension"], neutralEvidence, "applicable", { scoring: CALIBRATION.scoring, confidence: CALIBRATION.dimensionConfidence }).confidence.level;
        const confidenceRank = { low: 0, medium: 1, high: 2 } as const;
        assert.ok(confidenceRank[neutralConfidence as keyof typeof confidenceRank] <= confidenceRank[originalConfidence as keyof typeof confidenceRank], `${hypothesis}: uncertainty cannot increase confidence`);
      }
    }
    for (const triple of combinations(groupSources, 3)) for (const states of cartesian(CAPABILITY_STATES, 3)) {
      tripleScenarios += 1;
      const values = hypotheses.map((hypothesis) => scoreFor(group.dimension, states, hypothesis).score);
      const withoutNAs = states.map((state) => state === "not_applicable" ? "absent" as const : state);
      const naValues = hypotheses.map((hypothesis) => scoreFor(group.dimension, withoutNAs, hypothesis).score);
      assert.deepEqual(values, naValues, `${group.dimension}/${triple.map((source) => source.id)}: N/A contributes no capability points`);
    }
  }
  assert.equal(pairScenarios, 1176);
  assert.equal(tripleScenarios, 7546);
  for (const hypothesis of hypotheses) {
    assert.equal(scoreFor("trust_reputation", ["uncertainty", "established"], hypothesis).score, 75);
    assert.equal(scoreFor("trust_reputation", ["not_applicable", "established"], hypothesis).score, 75);
    assert.equal(scoreFor("trust_reputation", ["absent", "established"], hypothesis).score, 75);
    assert.equal(scoreFor("trust_reputation", ["uncertainty", "not_applicable"], hypothesis).score, null);
  }
  for (const applicability of ["not_applicable", "insufficient_context"] as const) {
    const result = scoreDimensionWithApplicability("trust_reputation", syntheticEvidence("trust_reputation", ["weak", "established"]), applicability, { scoring: CALIBRATION.scoring, confidence: CALIBRATION.dimensionConfidence });
    assert.equal(result.score, null, `${applicability} cannot gain a score from sibling facets`);
  }
});

function cartesian<T>(values: readonly T[], size: number): T[][] {
  if (size === 0) return [[]];
  return cartesian(values, size - 1).flatMap((prefix) => values.map((value) => [...prefix, value]));
}

function nextObservedState(state: SyntheticState): SyntheticState | undefined {
  if (state === "weak") return "partial";
  if (state === "partial") return "established";
  if (state === "missing") return "weak";
  return undefined;
}

test("R8-O4: the deterministic R7 selection corpus and separate R8 holdouts expose only paired live siblings", () => {
  const selection = r7CorpusV3();
  const holdout = [...r8bHoldoutV3(), ...r8cHoldoutV3().answerBags, ...r8cHoldoutV3().routes];
  const selected = corpusSiblingPairs(selection);
  const heldOut = corpusSiblingPairs(holdout);
  console.log("R8O4_SIBLING_CORPORA", JSON.stringify({ selected, heldOut }));
  assert.equal(selection.length, 61);
  assert.equal(holdout.length, 750);
  assert.equal(selected.instances, 9);
  assert.equal(selected.withSupporting, 0);
  assert.deepEqual(selected.triples, []);
  assert.deepEqual(selected.pairs, [
    ["digital_foundation:q2_ecommerce_product_discovery+q2_local_presence_consistency", 1],
    ["digital_readiness:q2_operations_information_base+q2_process_systemization", 3],
    ["relationship_recurrence:q2_appointments_confirmation_reminders+q2_appointments_rebooking", 2],
    ["trust_reputation:q2_professional_authority_signals+q2_reputation_flow", 3],
  ]);
  assert.deepEqual(heldOut.triples, []);
  assert.equal(heldOut.instances, 11);
  assert.ok(heldOut.withSupporting > 0, "the holdout includes direct siblings with separate supporting refinement");
  assert.deepEqual(heldOut.pairs, [
    ["digital_readiness:q2_operations_information_base+q2_process_systemization", 7],
    ["relationship_recurrence:q2_appointments_confirmation_reminders+q2_b2b_pipeline", 2],
    ["relationship_recurrence:q2_b2b_pipeline+q2_service_quote_followup", 1],
    ["trust_reputation:q2_professional_authority_signals+q2_reputation_flow", 1],
  ]);
});

test("R8-O4: downstream counterfactual matrix compares H0/H1/H2/H3 and keeps holdout out of selection", () => {
  const selection = r7CorpusV3();
  const holdout = [...r8bHoldoutV3(), ...r8cHoldoutV3().answerBags, ...r8cHoldoutV3().routes];
  const selectedReport = downstreamReport(selection);
  const holdoutReport = downstreamReport(holdout);
  console.log("R8O4_COUNTERFACTUAL_REPORT", JSON.stringify({
    selection: Object.fromEntries(Object.entries(selectedReport.hypotheses).map(([key, value]) => [key, { cases: value.cases, changed: value.changed, commercialExamples: { license: value.examples.licenseChanged ?? [], offerings: value.examples.offeringsChanged ?? [] } }])),
    holdout: Object.fromEntries(Object.entries(holdoutReport.hypotheses).map(([key, value]) => [key, { cases: value.cases, changed: value.changed, commercialExamples: { license: value.examples.licenseChanged ?? [], offerings: value.examples.offeringsChanged ?? [] } }])),
    critical: Object.fromEntries(Object.entries(selectedReport.criticalCases).map(([id, scenarios]) => [id, Object.fromEntries(Object.entries(scenarios).map(([hypothesis, value]) => [hypothesis, { foundation: value.dimensions.find((item) => item.id === "digital_foundation")?.score, readiness: value.dimensions.find((item) => item.id === "digital_readiness")?.score, overall: value.overall, priorities: value.priorities.map((item) => item.dimension), license: value.license, offerings: value.offerings }]))])),
  }));
  for (const report of [selectedReport, holdoutReport]) {
    for (const hypothesis of ["H1_WORST_DIRECT", "H2_BEST_DIRECT"] as const) {
      const changed = report.hypotheses[hypothesis]!.changed;
      assert.equal(changed.dimensionConfidenceChanged ?? 0, 0, `${hypothesis}: score aggregator alone must not rewrite evidence confidence`);
      if (hypothesis === "H1_WORST_DIRECT") {
        assert.equal(changed.licenseChanged ?? 0, 0, "weakest-facet counterfactual must not create a license");
      }
    }
  }
  assert.deepEqual(summarize(recomputeDownstream(buildCandidateCommercialBoundaryV3({ answers: selection[0]!.answers as never }))) , summarize(buildCandidateCommercialBoundaryV3({ answers: selection[0]!.answers as never })), "H0 reconstruction must match the real production chain");
  assert.deepEqual(selectedReport.criticalCases.A14?.H0_MEAN?.dimensions.find((item) => item.id === "digital_foundation")?.score, 50);
  assert.deepEqual(selectedReport.criticalCases.N01?.H0_MEAN?.dimensions.find((item) => item.id === "trust_reputation")?.score, 50);
  assert.deepEqual(selectedReport.criticalCases.N02?.H0_MEAN?.dimensions.find((item) => item.id === "trust_reputation")?.score, 50);
});

test("R8-O4: A14 separates estimated capability from confidence when a weak sibling becomes unknown", () => {
  const a14 = r7CorpusV3().find((item) => item.id === "A14")!;
  const weak = buildCandidateCommercialBoundaryV3({ answers: a14.answers as never });
  const unknown = buildCandidateCommercialBoundaryV3({ answers: { ...a14.answers, q2_local_presence_consistency: "unknown" } as never });
  const unansweredAnswers = { ...a14.answers } as Record<string, string | readonly string[] | undefined>;
  delete unansweredAnswers.q2_local_presence_consistency;
  const unanswered = buildCandidateCommercialBoundaryV3({ answers: unansweredAnswers as never });
  const weakFacet = (result: CandidateCommercialBoundaryV3) => result.scoring.dimensions.find((item) => item.id === "digital_foundation")!;
  assert.deepEqual([weakFacet(weak).score, weakFacet(weak).confidence.level, weakFacet(weak).confidence.direct, weakFacet(weak).confidence.contradictory], [50, "medium", 2, true]);
  assert.deepEqual([weakFacet(unknown).score, weakFacet(unknown).confidence.level, weakFacet(unknown).confidence.direct, weakFacet(unknown).confidence.uncertain, weakFacet(unknown).confidence.contradictory], [75, "low", 1, 1, false]);
  assert.deepEqual([weakFacet(unanswered).score, weakFacet(unanswered).confidence.level, weakFacet(unanswered).confidence.direct, weakFacet(unanswered).confidence.uncertain], [75, "medium", 1, 0]);

  const notApplicable = buildCandidateCommercialBoundaryV3({ answers: { ...a14.answers, q2_ecommerce_product_discovery: "not_applicable" } as never });
  assert.deepEqual([weakFacet(notApplicable).score, weakFacet(notApplicable).confidence.direct, weakFacet(notApplicable).explainability.weaknesses], [25, 1, ["q2_local_presence_consistency"]]);

  const planner = buildCandidateQuestionPlanV3({ answers: unansweredAnswers as never });
  assert.equal(planner.activeAnswers.q2_local_presence_consistency, undefined);
  assert.deepEqual(weakFacet(unanswered).evidence.map((item) => item.questionId).includes("q2_local_presence_consistency"), false);
});

test("R8-O4: a routed-out answer is ignored; v1/v2 and the legacy shared scorer remain reproducible", () => {
  const directSources = sources();
  const candidateCase = CANONICAL_CASES_V3.find((item) => {
    const active = new Set(Object.keys(scoreCandidateContextualDimensionsV3({ answers: item.answerScript }).activeAnswers));
    return directSources.some((source) => !active.has(source.id));
  })!;
  const current = buildCandidateCommercialBoundaryV3({ answers: candidateCase.answerScript });
  const activeIds = new Set(Object.keys(current.activeAnswers));
  const inactive = directSources.find((source) => !activeIds.has(source.id))!;
  const question = BANK.find((item) => item.id === inactive.id)!;
  const weakAnswer = Object.entries(question.evidenceV3!.dimensions.find((item) => item.dimension === inactive.dimension)!.answers).find(([, state]) => state === "weak")![0];
  const polluted = buildCandidateCommercialBoundaryV3({ answers: { ...candidateCase.answerScript, [inactive.id]: weakAnswer } as never });
  assert.deepEqual(summarize(polluted), summarize(current), `${candidateCase.id}/${inactive.id}: an inactive branch must not add a weak sibling`);
  assert.equal(polluted.activeAnswers[inactive.id as keyof typeof polluted.activeAnswers], undefined);

  const a14 = r7CorpusV3().find((item) => item.id === "A14")!;
  const evidence = scoreCandidateContextualDimensionsV3({ answers: a14.answers as never }).dimensions.find((item) => item.id === "digital_foundation")!.evidence;
  const legacyDefault = scoreDimensionWithApplicability("digital_foundation", evidence, "applicable");
  const v1 = scoreDimensionWithApplicability("digital_foundation", evidence, "applicable", { scoring: CANDIDATE_CALIBRATION_BASELINE_V1.scoring, confidence: CANDIDATE_CALIBRATION_BASELINE_V1.dimensionConfidence });
  const v2 = scoreDimensionWithApplicability("digital_foundation", evidence, "applicable", { scoring: CANDIDATE_CALIBRATION_R8B_V2.scoring, confidence: CANDIDATE_CALIBRATION_R8B_V2.dimensionConfidence });
  assert.deepEqual([legacyDefault.score, v1.score, v2.score], [50, 50, 50]);
  assert.deepEqual([legacyDefault.confidence.level, v1.confidence.level, v2.confidence.level], ["low", "low", "medium"]);
  assert.deepEqual([CANDIDATE_CALIBRATION_BASELINE_V1.identity, CANDIDATE_CALIBRATION_R8B_V2.identity], ["diag-v3-candidate-calibration-v1", "diag-v3-candidate-calibration-v2"]);
  assert.equal(CANDIDATE_CALIBRATION_BASELINE_V1.capabilityContribution.established, 0.75);
  assert.equal(CANDIDATE_CALIBRATION_R8B_V2.capabilityContribution.established, 0.75);
});

test("R8-O4: KEEP_CURRENT_MEAN is selected; O6 stays open and the candidate stays inactive", () => {
  const selectionOrder = ["invariants", "R3", "unknown/N/A", "supporting", "commercial safety", "no arbitrary weights", "robustness/explanation", "simplicity", "retain baseline if no alternative wins"];
  const hypotheses: Record<Hypothesis, { disposition: string; why: string }> = {
    H0_MEAN: { disposition: "selected", why: "equal, normalized direct observations compose the dimension without assigning one facet authority over the others" },
    H1_WORST_DIRECT: { disposition: "rejected", why: "one weak complementary facet would cap every sibling at 25 and turn mixed capacity into a material dimension-wide deficit" },
    H2_BEST_DIRECT: { disposition: "rejected", why: "a strong facet would conceal an independently observed weakness; contradiction/facet evidence remains but score erases it" },
    H3_STRUCTURED: { disposition: "same_as_H0", why: "current evidence already keeps facets/provenance and direct-specific intervention gates; no formal critical/equivalent-weight metadata can justify a different formula" },
  };
  assert.deepEqual(selectionOrder.at(-1), "retain baseline if no alternative wins");
  assert.deepEqual(hypotheses.H0_MEAN.disposition, "selected");
  assert.deepEqual(hypotheses.H3_STRUCTURED.disposition, "same_as_H0");
  assert.deepEqual(scoreFor("trust_reputation", ["weak", "established"], "H3_STRUCTURED"), scoreFor("trust_reputation", ["weak", "established"], "H0_MEAN"));
  assert.deepEqual(hypotheses.H1_WORST_DIRECT.disposition, "rejected");
  assert.deepEqual(hypotheses.H2_BEST_DIRECT.disposition, "rejected");

  const status = readFileSync(new URL("../../../docs/STATUS.md", import.meta.url), "utf8");
  const architecture = readFileSync(new URL("../../../docs/ARCHITECTURE.md", import.meta.url), "utf8");
  assert.match(status, /DIAG-V3-R8-O4-SIBLING-AGGREGATION-001[\s\S]*?CERRADA[\s\S]*?KEEP_CURRENT_MEAN/i);
  assert.match(status.match(/\| `DIAG-V3-R8-O4-SIBLING-AGGREGATION-001`[^\n]*/)?.[0] ?? "", /RESUELTA.*KEEP_CURRENT_MEAN/i);
  assert.match(status, /DIAG-V3-R8-O6-CONTEXT-OBSERVABILITY-001[^\n]*CALIBRATION_MODEL_DECISION_REQUIRED/);
  assert.match(architecture, /R8-O4[\s\S]*KEEP_CURRENT_MEAN/);
  assert.equal(R8C_OPEN_DECISIONS_V3.find((item) => item.code === "R8-O6")?.blocksR8Final, false);
});
