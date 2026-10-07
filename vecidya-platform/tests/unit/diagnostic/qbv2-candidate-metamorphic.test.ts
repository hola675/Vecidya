import test from "node:test";
import assert from "node:assert/strict";
import { ADVERSARIAL_CASES_V3, NEAR_MISS_PAIRS_V3 } from "./qbv2-candidate-adversarial-cases";
import { CANONICAL_CASES_V3 } from "./qbv2-candidate-canonical-cases";
import { runCanonicalRouteV3 } from "./qbv2-candidate-case-runner";
import {
  BANK, DIRECT_SOURCES, EVIDENCE_LADDER, MIGRATED, PRE_COMMERCIAL_KEYS, QUESTION_BY_ID, SUPPORTING_SOURCES, LATER_REVIEW_IDS,
  activeOf, answerValue, capabilityProvenance, producedContextFields, commercialItemIds, dimensionOf, eligibleOf, notApplicableOption, optionState, runChain,
  solutionIds, stableShuffle, structuralDependents, targetDimension, unknownOption, without,
} from "./qbv2-candidate-qa-harness";
import { buildCandidateQuestionPlanV3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import { resolveCandidateLicenseFitV3, matchCandidateCommercialOfferingsV3, type CandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { SCORING_MODEL, CAPABILITY_CONTRIBUTION } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import type { QuestionDefinitionV2 } from "../../../app/features/diagnostic/qbv2-contract";
import type { DigitalDimensionId } from "../../../app/features/diagnostic/qbv2-dimensions";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

/**
 * DIAG-V3-R7-B metamorphic QA (M1–M20). Each family relates two executions through a certified contract;
 * numeric equality is asserted only where the contract requires "no score change" (§53). Exclusions are
 * computed from the frozen gate rules (`structuralDependents`) and reported, never silently skipped.
 */

const CANONICAL_FINAL = new Map(CANONICAL_CASES_V3.map((c) => [c.id, runCanonicalRouteV3(c).finalAnswers]));
const BASES: readonly { readonly id: string; readonly answers: AnswersV2 }[] = [
  ...CANONICAL_CASES_V3.map((c) => ({ id: c.id, answers: CANONICAL_FINAL.get(c.id)! })),
  ...ADVERSARIAL_CASES_V3.map((c) => ({ id: c.id, answers: c.answers })),
  ...NEAR_MISS_PAIRS_V3.map((c) => ({ id: c.id, answers: c.answers })),
];
const MAX_BASES_PER_SOURCE = 3;
/** Deterministic: the first bases (canonical → adversarial → near-miss order) in which the source is active. */
function basesFor(question: QuestionDefinitionV2) {
  return BASES.filter((b) => activeOf(b.answers)[question.id] !== undefined).slice(0, MAX_BASES_PER_SOURCE);
}
const evidenceKey = (r: CandidateCommercialBoundaryV3, dimension: DigitalDimensionId) =>
  JSON.stringify(dimensionOf(r, dimension).evidence.map((e) => [e.questionId, e.state, e.directness]));
const READING_RANK: Readonly<Record<string, number>> = { weakness: 0, partial: 1, strength: 2 };
function readingOf(r: CandidateCommercialBoundaryV3, dimension: DigitalDimensionId) {
  return r.semanticFacts.facts.find((f) => f.dimension === dimension && f.type in READING_RANK)?.type;
}
function changedActiveIds(left: AnswersV2, right: AnswersV2): string[] {
  return [...new Set([...Object.keys(left), ...Object.keys(right)])].filter((id) => JSON.stringify(left[id]) !== JSON.stringify(right[id]));
}
const report: Record<string, unknown> = {};

test("M1: direct evidence monotonicity — stronger R3 state never lowers, weaker never raises the target score (19/19 audited)", () => {
  let comparable = 0;
  const audited = new Set<string>();
  const violations: string[] = [];
  for (const q of DIRECT_SOURCES) {
    const dimension = targetDimension(q);
    const ladder = q.options.filter((o) => optionState(q, o.value)! in EVIDENCE_LADDER);
    for (const base of basesFor(q)) {
      audited.add(q.id);
      const scored = ladder.map((o) => ({ value: o.value, rank: EVIDENCE_LADDER[optionState(q, o.value)!]!, result: runChain({ ...base.answers, [q.id]: answerValue(q, o.value) }) }));
      for (const low of scored) for (const high of scored) {
        if (low.rank >= high.rank) continue;
        const a = dimensionOf(low.result, dimension).score;
        const b = dimensionOf(high.result, dimension).score;
        if (a === null || b === null) continue;
        comparable += 1;
        if (a > b) violations.push(`${base.id}/${q.id}: ${low.value}(${a}) > ${high.value}(${b})`);
      }
    }
  }
  report.M1 = { directSourcesAudited: audited.size, comparableMutations: comparable, violations: violations.length };
  assert.equal(audited.size, 19, `direct sources without an active base: ${DIRECT_SOURCES.filter((q) => !audited.has(q.id)).map((q) => q.id)}`);
  assert.ok(comparable > 0);
  assert.deepEqual(violations, []);
});

test("M2: unrelated-dimension isolation — a migrated answer only moves its own declared dimensions (gate-unlocked dependents reported as exclusions)", () => {
  let audited = 0;
  const exclusions = new Set<string>();
  const violations: string[] = [];
  for (const q of MIGRATED) {
    for (const base of basesFor(q)) {
      const before = runChain(base.answers);
      for (const option of q.options) {
        const after = runChain({ ...base.answers, [q.id]: answerValue(q, option.value) });
        const changed = changedActiveIds(before.activeAnswers, after.activeAnswers).filter((id) => id !== q.id);
        const allowed = new Set(q.evidenceV3!.dimensions.map((d) => d.dimension));
        for (const id of changed) {
          if (!structuralDependents([q.id]).has(id)) violations.push(`${base.id}/${q.id}=${option.value}: unrelated active answer ${id} changed`);
          exclusions.add(`${q.id}→${id}`);
          for (const d of QUESTION_BY_ID.get(id)!.evidenceV3?.dimensions ?? []) allowed.add(d.dimension);
        }
        for (const d of before.scoring.dimensions) {
          if (allowed.has(d.id)) continue;
          audited += 1;
          if (dimensionOf(after, d.id).score !== d.score || evidenceKey(after, d.id) !== evidenceKey(before, d.id)) violations.push(`${base.id}/${q.id}=${option.value}: unrelated ${d.id} changed`);
        }
      }
    }
  }
  report.M2 = { auditedDimensionComparisons: audited, exclusions: [...exclusions].sort(), violations: violations.length };
  assert.deepEqual(violations, []);
});

test("M3: unknown substitution — unknown is neutral (never missing/negative); it may only remove observability", () => {
  let audited = 0;
  const violations: string[] = [];
  for (const q of DIRECT_SOURCES) {
    const unknown = unknownOption(q);
    if (!unknown) continue;
    const dimension = targetDimension(q);
    for (const base of basesFor(q)) {
      const withUnknown = runChain({ ...base.answers, [q.id]: answerValue(q, unknown) });
      const removed = runChain(without(base.answers, q.id));
      audited += 1;
      const evidence = dimensionOf(withUnknown, dimension).evidence.find((e) => e.questionId === q.id);
      if (!evidence || evidence.state !== "uncertainty" || evidence.contribution !== null) violations.push(`${base.id}/${q.id}: unknown is not neutral uncertainty`);
      if (dimensionOf(withUnknown, dimension).score !== dimensionOf(removed, dimension).score) violations.push(`${base.id}/${q.id}: unknown contributed to the score`);
      for (const f of withUnknown.semanticFacts.facts) if ((f.signals?.negative ?? []).some((s) => s.questionId === q.id)) violations.push(`${base.id}/${q.id}: unknown became a negative signal`);
      for (const rec of withUnknown.recommendations.items) if (rec.mode === "improve" && rec.sourceQuestionIds.length === 1 && rec.sourceQuestionIds[0] === q.id) violations.push(`${base.id}/${q.id}: improve built on unknown`);
    }
  }
  report.M3 = { audited, violations: violations.length };
  assert.ok(audited >= 19);
  assert.deepEqual(violations, []);
});

test("M4: N/A substitution — contribution null, no weakness, no zero, no negative evidence", () => {
  let audited = 0;
  const violations: string[] = [];
  for (const q of MIGRATED) {
    const na = notApplicableOption(q);
    if (!na) continue;
    const dimension = targetDimension(q);
    for (const base of basesFor(q)) {
      const withNa = runChain({ ...base.answers, [q.id]: answerValue(q, na) });
      const removed = runChain(without(base.answers, q.id));
      audited += 1;
      const evidence = dimensionOf(withNa, dimension).evidence.find((e) => e.questionId === q.id);
      if (!evidence || evidence.state !== "not_applicable" || evidence.contribution !== null) violations.push(`${base.id}/${q.id}: N/A not neutral`);
      if (dimensionOf(withNa, dimension).score !== dimensionOf(removed, dimension).score) violations.push(`${base.id}/${q.id}: N/A changed the score (zero-fill)`);
      for (const f of withNa.semanticFacts.facts) if ((f.signals?.negative ?? []).some((s) => s.questionId === q.id)) violations.push(`${base.id}/${q.id}: N/A became negative evidence`);
      for (const rec of withNa.recommendations.items) if (rec.mode === "improve" && rec.sourceQuestionIds.every((id) => id === q.id)) violations.push(`${base.id}/${q.id}: improve built on N/A`);
    }
  }
  report.M4 = { audited, violations: violations.length };
  assert.ok(audited > 0);
  assert.deepEqual(violations, []);
});

const SUPPORTING_BASES: Readonly<Record<string, AnswersV2>> = {
  q2_operations_handoffs: ADVERSARIAL_CASES_V3.find((c) => c.id === "A16")!.answers,
  q2_b2b_status_visibility: ADVERSARIAL_CASES_V3.find((c) => c.id === "A16b")!.answers,
};
const DIRECT_READINESS = ["q2_process_systemization", "q2_operations_information_base"];

test("M5: supporting evidence — supporting-only never scores; with a direct base it refines within the frozen cap", () => {
  let audited = 0;
  const share = SCORING_MODEL.supportingCapRatio / (1 + SCORING_MODEL.supportingCapRatio);
  for (const s of SUPPORTING_SOURCES) {
    const base = SUPPORTING_BASES[s.id]!;
    for (const supportOption of s.options.filter((o) => optionState(s, o.value)! in EVIDENCE_LADDER)) {
      const supportState = optionState(s, supportOption.value)!;
      const only = runChain({ ...without(base, ...DIRECT_READINESS), [s.id]: supportOption.value });
      assert.equal(dimensionOf(only, "digital_readiness").score, null, `${s.id}=${supportOption.value}: supporting-only scored`);
      for (const direct of ["informal", "partial", "defined"]) {
        audited += 1;
        const withDirect = without({ ...base, q2_process_systemization: direct, [s.id]: supportOption.value }, "q2_operations_information_base");
        const directOnly = dimensionOf(runChain(without(withDirect, s.id)), "digital_readiness").score!;
        const both = dimensionOf(runChain(withDirect), "digital_readiness");
        const directState = optionState(QUESTION_BY_ID.get("q2_process_systemization")!, direct)!;
        const gap = Math.abs(CAPABILITY_CONTRIBUTION[supportState as keyof typeof CAPABILITY_CONTRIBUTION]! - CAPABILITY_CONTRIBUTION[directState as keyof typeof CAPABILITY_CONTRIBUTION]!);
        assert.equal(both.explainability.basis, "direct_and_supporting");
        assert.ok(Math.abs(both.score! - directOnly) <= Math.ceil(100 * share * gap) + 1, `${s.id}=${supportOption.value} + ${direct}: past the frozen cap`);
        const supportPoint = 100 * CAPABILITY_CONTRIBUTION[supportState as keyof typeof CAPABILITY_CONTRIBUTION]!;
        assert.ok(both.score! >= Math.min(directOnly, supportPoint) - 1 && both.score! <= Math.max(directOnly, supportPoint) + 1, `${s.id}: refinement must stay between the direct base and the supporting reading`);
      }
    }
  }
  report.M5 = { audited, violations: 0 };
});

test("M6: systematic irrelevant-answer pollution across all 25 canonical routes — no survival, no downstream change", () => {
  let polluted = 0;
  const violations: string[] = [];
  for (const c of CANONICAL_CASES_V3) {
    const answers = CANONICAL_FINAL.get(c.id)!;
    const base = runChain(answers);
    const eligible = eligibleOf(answers);
    const inactive = BANK.filter((q) => !eligible.has(q.id) && answers[q.id] === undefined);
    const classes = (q: QuestionDefinitionV2) => {
      const substantive = q.options.filter((o) => o.kind === undefined || o.kind === "value");
      const ranked = [...substantive].sort((a, b) => (EVIDENCE_LADDER[optionState(q, a.value) ?? ""] ?? 0) - (EVIDENCE_LADDER[optionState(q, b.value) ?? ""] ?? 0));
      return { weak: ranked[0]?.value, strong: ranked.at(-1)?.value, unknown: unknownOption(q), na: notApplicableOption(q) };
    };
    // Exhaustive single-question pollution: every valid option of every inactive question.
    for (const q of inactive) for (const option of q.options) {
      polluted += 1;
      const active = activeOf({ ...answers, [q.id]: answerValue(q, option.value) });
      if (JSON.stringify(Object.entries(active).sort()) !== JSON.stringify(Object.entries(base.activeAnswers).sort())) violations.push(`${c.id}: ${q.id}=${option.value} changed activeAnswers`);
    }
    // Combined pollution per option class, through the complete chain.
    for (const kind of ["weak", "strong", "unknown", "na"] as const) {
      const pollution = Object.fromEntries(inactive.flatMap((q) => { const value = classes(q)[kind]; return value ? [[q.id, answerValue(q, value)]] : []; }));
      polluted += 1;
      const result = runChain({ ...answers, ...pollution });
      if (!isDeep(result, base)) violations.push(`${c.id}: combined ${kind} pollution changed the candidate result`);
    }
  }
  report.M6 = { baseCases: CANONICAL_CASES_V3.length, pollutedVariants: polluted, violations: violations.length };
  assert.deepEqual(violations, []);
});
function isDeep(a: unknown, b: unknown) { try { assert.deepStrictEqual(a, b); return true; } catch { return false; } }

const CREATOR: AnswersV2 = { q2_entity: "individual", q2_other_staff: "no", q2_monetization: "audience", q2_delivery: ["online_checkout"], q2_sector: "creative_media", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat", q2_capacity_signal: ["stable"], q2_goal: "stop_losing", q2_customer_reach: "global", q2_customer_buyer: "b2c", q2_process_systemization: "defined", q2_discovery_reliable_reach: "reliable", q2_reputation_flow: "strong", q2_ecommerce_product_discovery: "easy", q2_creator_audience_ownership: "platform_only" };
const STALE_BRANCHES: readonly { readonly branch: string; readonly answers: AnswersV2; readonly mutation: AnswersV2 }[] = [
  { branch: "appointments", answers: ADVERSARIAL_CASES_V3.find((c) => c.id === "A03")!.answers, mutation: { q2_delivery: ["other"] } },
  { branch: "retail", answers: CANONICAL_FINAL.get("C07")!, mutation: { q2_delivery: ["online_checkout"] } },
  { branch: "ecommerce", answers: ADVERSARIAL_CASES_V3.find((c) => c.id === "A13")!.answers, mutation: { q2_delivery: ["appointments"] } },
  { branch: "B2B", answers: ADVERSARIAL_CASES_V3.find((c) => c.id === "A20")!.answers, mutation: { q2_customer_buyer: "b2c" } },
  { branch: "professional", answers: NEAR_MISS_PAIRS_V3.find((c) => c.id === "N01")!.answers, mutation: { q2_sector: "retail" } },
  { branch: "creator", answers: CREATOR, mutation: { q2_monetization: "services" } },
];

test("M7: stale-branch invalidation — old specialized answers vanish from every downstream layer", () => {
  const out: Record<string, string[]> = {};
  for (const { branch, answers, mutation } of STALE_BRANCHES) {
    const before = runChain(answers);
    const mutated = { ...answers, ...mutation };
    const after = runChain(mutated);
    const stale = Object.keys(before.activeAnswers).filter((id) => after.activeAnswers[id] === undefined && !(id in mutation));
    out[branch] = stale;
    assert.ok(stale.length > 0, `${branch}: mutation must actually invalidate specialized answers`);
    const provenance = capabilityProvenance(after);
    for (const id of stale) {
      assert.equal(provenance.has(id), false, `${branch}: stale ${id} survives as provenance (${provenance.get(id)?.[0]})`);
      assert.ok(!after.semanticFacts.context.some((c) => c.field === id));
    }
    assert.deepEqual(after, runChain(without(mutated, ...stale)), `${branch}: stale raw answers changed the result`);
  }
  report.M7 = { branches: Object.keys(out), staleAnswers: out, violations: 0 };
});

const GOALS = QUESTION_BY_ID.get("q2_goal")!.options.map((o) => o.value);
const FRICTIONS = QUESTION_BY_ID.get("q2_friction")!.options.map((o) => o.value);
function contextInvariance(root: string, values: readonly string[], bases: readonly { id: string; answers: AnswersV2 }[]) {
  const dependents = structuralDependents([root]);
  const violations: string[] = [];
  let audited = 0;
  let excluded = 0;
  for (const base of bases) {
    const reference = runChain(base.answers);
    for (const value of values) {
      const variant = runChain({ ...base.answers, [root]: value });
      for (const id of changedActiveIds(reference.activeAnswers, variant.activeAnswers)) if (id !== root && !dependents.has(id)) violations.push(`${base.id}/${root}=${value}: ${id} changed without a structural gate`);
      for (const d of reference.scoring.dimensions) {
        audited += 1;
        const other = dimensionOf(variant, d.id);
        const evidenceChanged = evidenceKey(variant, d.id) !== evidenceKey(reference, d.id);
        // R4: applicability may only move when gated direct evidence that resolved it (observed_dimension_evidence) appears/disappears.
        const traceableApplicability = evidenceChanged && [other.applicabilityReason, d.applicabilityReason].includes("observed_dimension_evidence");
        if (other.applicability !== d.applicability && !traceableApplicability) violations.push(`${base.id}/${root}=${value}: ${d.id} applicability changed`);
        if (evidenceChanged) {
          excluded += 1;
          const gated = [...dimensionOf(variant, d.id).evidence, ...d.evidence].every((e) => dependents.has(e.questionId) || variant.activeAnswers[e.questionId] === reference.activeAnswers[e.questionId]);
          if (!gated) violations.push(`${base.id}/${root}=${value}: ${d.id} evidence changed outside the gate`);
          continue;
        }
        if (other.score !== d.score) violations.push(`${base.id}/${root}=${value}: ${d.id} score changed with identical evidence`);
      }
    }
  }
  return { audited, excluded, violations };
}

test("M8: goal invariance — goal never creates/changes scores, applicability or evidence; gated evidence is the only traceable difference", () => {
  const { audited, excluded, violations } = contextInvariance("q2_goal", GOALS, BASES.filter((b) => b.answers.q2_has_customers === "yes").slice(0, 24));
  report.M8 = { auditedDimensionComparisons: audited, gatedEvidenceExclusions: excluded, violations: violations.length };
  assert.deepEqual(violations, []);
});

test("M9: friction invariance — friction never creates/changes scores or applicability", () => {
  const bases = BASES.filter((b) => b.answers.q2_has_customers === "yes").slice(0, 24).map((b) => ({ id: b.id, answers: { ...b.answers, q2_goal: "other" } }));
  const { audited, excluded, violations } = contextInvariance("q2_friction", FRICTIONS, bases);
  report.M9 = { auditedDimensionComparisons: audited, gatedEvidenceExclusions: excluded, violations: violations.length };
  assert.deepEqual(violations, []);
});

test("M10: entity isolation — business vs organization produce the same need-level license fit and solutions", () => {
  const audited: string[] = [];
  for (const base of BASES) {
    const reference = runChain(base.answers);
    if (reference.commercial.licenseFit.recommendedLicense === null || !["business", "organization"].includes(String(base.answers.q2_entity))) continue;
    const flipped = runChain({ ...base.answers, q2_entity: base.answers.q2_entity === "business" ? "organization" : "business" });
    audited.push(`${base.id}:${reference.commercial.licenseFit.recommendedLicense}`);
    assert.equal(flipped.commercial.licenseFit.recommendedLicense, reference.commercial.licenseFit.recommendedLicense, `${base.id}: entity changed the license`);
    assert.deepEqual(solutionIds(flipped), solutionIds(reference), `${base.id}: entity changed solutions`);
  }
  report.M10 = { audited };
  assert.ok(audited.some((a) => a.endsWith("cuadra")) && audited.some((a) => a.endsWith("barrio")));
});

/**
 * The raw multi-select value is echoed verbatim (in caller order) wherever answers are carried —
 * `activeAnswers`, `scoring.activeAnswers`, `semanticFacts.context[].value`. That echo is a non-semantic
 * trace; every array equal as a set to the mutated value is sorted before comparing, nothing else is touched.
 */
function normalizedArrays(value: unknown, set: readonly string[]): unknown {
  if (Array.isArray(value)) {
    const sameSet = value.length === set.length && value.every((item) => typeof item === "string" && set.includes(item));
    return sameSet ? [...value].sort() : value.map((item) => normalizedArrays(item, set));
  }
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalizedArrays(v, set)]));
  return value;
}

test("M11: set-like multi-select ordering (q2_delivery, q2_ecommerce_traffic_sources) never changes context, routing or output", () => {
  const fields = ["q2_delivery", "q2_ecommerce_traffic_sources"];
  const audited: string[] = [];
  for (const base of BASES) for (const field of fields) {
    const value = activeOf(base.answers)[field];
    if (!Array.isArray(value) || value.length < 2) continue;
    const reversed = { ...base.answers, [field]: [...value].reverse() };
    audited.push(`${base.id}:${field}`);
    assert.deepEqual(normalizedArrays(runChain(reversed), value), normalizedArrays(runChain(base.answers), value), `${base.id}: ${field} order changed output`);
    assert.deepEqual(buildCandidateQuestionPlanV3({ answers: reversed }).selectedQuestionIds, buildCandidateQuestionPlanV3({ answers: base.answers }).selectedQuestionIds);
  }
  report.M11 = { audited, excludedOrderSensitiveFields: [] };
  assert.ok(audited.length >= 3);
});

test("M12: answer-key ordering (normal / reverse / stable shuffle) yields a deep-equal candidate result", () => {
  for (const base of BASES) {
    const reference = runChain(base.answers);
    const entries = Object.entries(base.answers);
    assert.deepEqual(runChain(Object.fromEntries([...entries].reverse()) as AnswersV2), reference, `${base.id}: reverse`);
    assert.deepEqual(runChain(Object.fromEntries(stableShuffle(entries, 0x7b7e)) as AnswersV2), reference, `${base.id}: shuffled`);
  }
  report.M12 = { bases: BASES.length, exclusions: [] };
});

test("M13: save/resume — JSON round-trip at every turn reproduces the same question sequence, active answers and output", () => {
  for (const id of ["C01", "C04", "C09", "C13", "C12", "C16"]) {
    const caseDef = CANONICAL_CASES_V3.find((c) => c.id === id)!;
    const reference = runCanonicalRouteV3(caseDef);
    let answers: AnswersV2 = {};
    const asked: string[] = [];
    for (let turn = 0; turn < 30; turn += 1) {
      const plan = buildCandidateQuestionPlanV3({ answers: JSON.parse(JSON.stringify(answers)) as AnswersV2 });
      answers = JSON.parse(JSON.stringify(plan.activeAnswers)) as AnswersV2;
      if (!plan.nextQuestionId) break;
      answers = { ...answers, [plan.nextQuestionId]: caseDef.answerScript[plan.nextQuestionId]! };
      asked.push(plan.nextQuestionId);
    }
    assert.deepEqual(asked, reference.asked.map((a) => a.id), `${id}: resumed sequence`);
    assert.deepEqual(answers, reference.finalAnswers, `${id}: resumed active answers`);
    assert.deepEqual(runChain(answers), runChain(reference.finalAnswers), `${id}: resumed consumer output`);
  }
  report.M13 = { routes: ["prelaunch C01", "appointments C04", "B2B C09", "hybrid C13", "Cuadra operations C12", "unknown-heavy C16"] };
});

test("M14: commercial score spoof — display score, band and overall confidence never move license fit or offerings", () => {
  let audited = 0;
  for (const base of BASES) {
    const result = runChain(base.answers);
    for (const [score, label, level] of [[0, "MAL", "low"], [50, "REGULAR", "medium"], [100, "BIEN", "high"]] as const) {
      const spoofed = { ...result, overall: { ...result.overall, publicLabel: label, confidence: { ...result.overall.confidence, level }, index: { ...result.overall.index, displayScore: score, rawScore: score } } } as CandidateCommercialBoundaryV3;
      const fit = resolveCandidateLicenseFitV3(spoofed, undefined, undefined);
      audited += 1;
      assert.deepEqual(fit, result.commercial.licenseFit, `${base.id}: spoof changed license fit`);
      assert.deepEqual(matchCandidateCommercialOfferingsV3(spoofed, fit), matchCandidateCommercialOfferingsV3(result, result.commercial.licenseFit), `${base.id}: spoof changed offerings`);
    }
  }
  report.M14 = { audited, violations: 0 };
});

test("M15: commercial clarification isolation — every pre-commercial layer is byte-identical across all clarification answers", () => {
  const barrioCapable: string[] = [];
  for (const base of BASES) {
    const reference = runChain(base.answers);
    if (reference.commercial.licenseFit.recommendedLicense !== "barrio") continue;
    barrioCapable.push(base.id);
    for (const clarification of ["single_process", "multiple_coordinated_processes", "not_sure"] as const) {
      const clarified = runChain(base.answers, clarification);
      for (const key of PRE_COMMERCIAL_KEYS) assert.deepEqual(clarified[key], reference[key], `${base.id}/${clarification}: ${key} changed`);
    }
  }
  report.M15 = { barrioCapable };
  assert.ok(barrioCapable.length >= 3);
});

test("M16: stronger direct evidence never creates a semantically worse claim (no strength→weakness, no new weakness from that source)", () => {
  const violations: string[] = [];
  for (const q of DIRECT_SOURCES) {
    const dimension = targetDimension(q);
    const ladder = q.options.filter((o) => optionState(q, o.value)! in EVIDENCE_LADDER).sort((a, b) => EVIDENCE_LADDER[optionState(q, a.value)!]! - EVIDENCE_LADDER[optionState(q, b.value)!]!);
    for (const base of basesFor(q)) {
      let previous: number | undefined;
      for (const option of ladder) {
        const r = runChain({ ...base.answers, [q.id]: answerValue(q, option.value) });
        const reading = readingOf(r, dimension);
        const rank = reading === undefined ? undefined : READING_RANK[reading];
        if (rank !== undefined && previous !== undefined && rank < previous) violations.push(`${base.id}/${q.id}=${option.value}: reading worsened to ${reading}`);
        if (rank !== undefined) previous = rank;
        if (optionState(q, option.value) === "established" && r.semanticFacts.facts.some((f) => f.type === "weakness" && (f.signals?.negative ?? []).some((s) => s.questionId === q.id))) violations.push(`${base.id}/${q.id}: established answer produced a weakness fact`);
      }
    }
  }
  report.M16 = { violations: violations.length };
  assert.deepEqual(violations, []);
});

const PROBLEM_CHAINS: readonly { readonly name: string; readonly answers: AnswersV2; readonly question: string; readonly healthy: string; readonly solution: string; readonly item?: string; readonly license?: string }[] = [
  { name: "booking friction → online_booking", answers: ADVERSARIAL_CASES_V3.find((c) => c.id === "A03")!.answers, question: "q2_appointments_booking_friction", healthy: "rarely", solution: "online_booking", license: "barrio" },
  { name: "reputation weakness → reputation_reviews", answers: ADVERSARIAL_CASES_V3.find((c) => c.id === "A04")!.answers, question: "q2_reputation_flow", healthy: "strong", solution: "reputation_reviews", item: "reputation_reviews" },
  { name: "authority weakness → credibility_proof", answers: NEAR_MISS_PAIRS_V3.find((c) => c.id === "N02")!.answers, question: "q2_professional_authority_signals", healthy: "clearly_visible", solution: "credibility_proof", item: "presence_brand_credibility" },
  { name: "work organization → Cuadra", answers: ADVERSARIAL_CASES_V3.find((c) => c.id === "A08")!.answers, question: "q2_process_systemization", healthy: "defined", solution: "work_organization", license: "cuadra" },
  { name: "follow-up process weakness → CRM", answers: ADVERSARIAL_CASES_V3.find((c) => c.id === "A01")!.answers, question: "q2_followup_general_process", healthy: "consistent", solution: "crm_follow_up", license: "barrio" },
  { name: "website-base weakness → website", answers: ADVERSARIAL_CASES_V3.find((c) => c.id === "A18")!.answers, question: "q2_presence_digital_base", healthy: "reliable_presence", solution: "website", item: "web_conversion_site" },
];

test("M17: removing the causative weakness removes its provenance, its evidence-specific solution and the derived commercial item", () => {
  for (const chain of PROBLEM_CHAINS) {
    const before = runChain(chain.answers);
    assert.ok(solutionIds(before).includes(chain.solution), `${chain.name}: precondition`);
    if (chain.item) assert.ok(commercialItemIds(before).includes(chain.item), `${chain.name}: item precondition`);
    if (chain.license) assert.equal(before.commercial.licenseFit.recommendedLicense, chain.license, `${chain.name}: license precondition`);
    const after = runChain({ ...chain.answers, [chain.question]: chain.healthy });
    assert.ok(!solutionIds(after).includes(chain.solution), `${chain.name}: solution survived`);
    if (chain.item) assert.ok(!commercialItemIds(after).includes(chain.item), `${chain.name}: commercial item survived`);
    if (chain.license) assert.notEqual(after.commercial.licenseFit.recommendedLicense, chain.license, `${chain.name}: license survived`);
    assert.ok(!after.semanticFacts.facts.some((f) => f.type === "weakness" && (f.signals?.negative ?? []).some((s) => s.questionId === chain.question)), `${chain.name}: weakness provenance survived`);
    assert.ok(!after.recommendations.items.some((r) => r.mode === "improve" && r.sourceQuestionIds.includes(chain.question)), `${chain.name}: improve recommendation survived`);
  }
  report.M17 = { chains: PROBLEM_CHAINS.map((c) => c.name) };
});

test("M18: direct/supporting disagreement — the direct source stays the establishing authority (score and reading)", () => {
  for (const s of SUPPORTING_SOURCES) {
    const base = without(SUPPORTING_BASES[s.id]!, "q2_operations_information_base");
    const strongSupport = s.options.find((o) => optionState(s, o.value) === "established")!.value;
    const weakSupport = s.options.find((o) => optionState(s, o.value) === "weak")!.value;
    const weakDirect = runChain({ ...base, q2_process_systemization: "informal", [s.id]: strongSupport });
    const strongDirect = runChain({ ...base, q2_process_systemization: "defined", [s.id]: weakSupport });
    const wd = dimensionOf(weakDirect, "digital_readiness").score!;
    const sd = dimensionOf(strongDirect, "digital_readiness").score!;
    assert.ok(Math.abs(wd - 25) < Math.abs(wd - 75), `${s.id}: weak direct + strong supporting must stay closer to the direct reading`);
    assert.ok(Math.abs(sd - 75) < Math.abs(sd - 25), `${s.id}: strong direct + weak supporting must stay closer to the direct reading`);
    assert.notEqual(readingOf(weakDirect, "digital_readiness"), "strength");
    assert.notEqual(readingOf(strongDirect, "digital_readiness"), "weakness");
  }
  report.M18 = { pairs: SUPPORTING_SOURCES.map((s) => s.id), note: "solution/license authority of supporting-only negatives is audited in qbv2-candidate-adversarial.test.ts (F2)" };
});

test("M19: context-only mutations (q2_demand_trend, q2_capacity_signal) produce zero evidence and leave every score untouched", () => {
  let audited = 0;
  for (const base of BASES.filter((b) => eligibleOf(b.answers).has("q2_demand_trend")).slice(0, 12)) {
    const reference = runChain(without(base.answers, "q2_demand_trend", "q2_capacity_signal"));
    for (const [id, values] of [["q2_demand_trend", QUESTION_BY_ID.get("q2_demand_trend")!.options.map((o) => o.value)], ["q2_capacity_signal", QUESTION_BY_ID.get("q2_capacity_signal")!.options.map((o) => o.value)]] as const) {
      for (const value of values) {
        audited += 1;
        const r = runChain({ ...without(base.answers, "q2_demand_trend", "q2_capacity_signal"), [id]: answerValue(QUESTION_BY_ID.get(id)!, value) });
        assert.equal(r.activeAnswers[id] !== undefined, true, `${base.id}: ${id} must be directly injectable as active context`);
        assert.equal(capabilityProvenance(r).has(id), false, `${base.id}: ${id} became capability provenance`);
        for (const d of r.scoring.dimensions) {
          assert.equal(d.score, dimensionOf(reference, d.id).score, `${base.id}/${id}=${value}: ${d.id} score moved`);
          assert.equal(d.applicability, dimensionOf(reference, d.id).applicability);
          assert.equal(evidenceKey(r, d.id), evidenceKey(reference, d.id));
        }
      }
    }
  }
  report.M19 = { audited, violations: 0 };
  assert.ok(audited > 0);
});

test("M20: later-review questions carry zero capability evidence for every answer state (routing unlock only)", () => {
  const appointments = ADVERSARIAL_CASES_V3.find((c) => c.id === "A03")!.answers;
  const bases: Readonly<Record<string, AnswersV2>> = { q2_appointments_lead_to_booking: appointments, q2_creator_audience_ownership: CREATOR };
  let audited = 0;
  for (const id of LATER_REVIEW_IDS) {
    const question = QUESTION_BY_ID.get(id)!;
    const reference = runChain(bases[id]!);
    for (const option of question.options) {
      audited += 1;
      const r = runChain({ ...bases[id]!, [id]: option.value });
      assert.ok(r.activeAnswers[id] !== undefined, `${id}=${option.value} must be active`);
      assert.equal(capabilityProvenance(r).has(id), false, `${id}=${option.value}: capability provenance`);
      const changed = changedActiveIds(reference.activeAnswers, r.activeAnswers).filter((x) => x !== id);
      const allowed = new Set(changed.flatMap((x) => QUESTION_BY_ID.get(x)!.evidenceV3?.dimensions.map((d) => d.dimension) ?? []));
      for (const x of changed) assert.ok(structuralDependents([id]).has(x), `${id}: ${x} changed without a gate`);
      for (const d of r.scoring.dimensions) if (!allowed.has(d.id)) assert.equal(d.score, dimensionOf(reference, d.id).score, `${id}=${option.value}: ${d.id} score caused by a later-review answer`);
    }
  }
  report.M20 = { audited, violations: 0 };
});

const R4_FIELDS = new Set(["activity", "businessModel", "archetype", "customerBuyer"]);
const CONTEXT_MATRIX: readonly { readonly name: string; readonly root: string; readonly values: readonly (string | readonly string[])[] }[] = [
  { name: "business ↔ organization", root: "q2_entity", values: ["business", "organization", "individual"] },
  { name: "local ↔ national reach", root: "q2_customer_reach", values: ["local", "regional", "national", "global", "mixed"] },
  { name: "B2C ↔ B2B", root: "q2_customer_buyer", values: ["b2c", "b2b", "mixed"] },
  { name: "delivery branch changes", root: "q2_delivery", values: [["appointments"], ["retail"], ["online_checkout"], ["travels"], ["other"], ["retail", "online_checkout"]] },
  { name: "prelaunch ↔ active", root: "q2_has_customers", values: ["no", "yes"] },
];

const producedFieldsOf = (id: string) => [...producedContextFields(QUESTION_BY_ID.get(id)!)];

test("§43-44: context mutation matrix — every difference is explained by a certified structural rule", () => {
  const summary: Record<string, { mutations: number; applicabilityChanges: number; gatedChanges: number }> = {};
  const violations: string[] = [];
  for (const { name, root, values } of CONTEXT_MATRIX) {
    const dependents = structuralDependents([root]);
    // The root gates R4 applicability when it (or a structural dependent) produces an R4 context field.
    const gatesApplicability = [root, ...dependents].some((id) => producedFieldsOf(id).some((f) => R4_FIELDS.has(f)));
    const row = { mutations: 0, applicabilityChanges: 0, gatedChanges: 0 };
    for (const base of BASES.slice(0, 30)) {
      const reference = runChain(base.answers);
      for (const value of values) {
        row.mutations += 1;
        const variant = runChain({ ...base.answers, [root]: value });
        for (const id of changedActiveIds(reference.activeAnswers, variant.activeAnswers)) {
          if (id === root) continue;
          row.gatedChanges += 1;
          if (!dependents.has(id)) violations.push(`${name}/${base.id}: ${id} changed without a structural gate`);
        }
        for (const d of reference.scoring.dimensions) {
          const other = dimensionOf(variant, d.id);
          const sameEvidence = evidenceKey(variant, d.id) === evidenceKey(reference, d.id);
          if (other.applicability !== d.applicability) {
            row.applicabilityChanges += 1;
            const explained = gatesApplicability || (!sameEvidence && [other.applicabilityReason, d.applicabilityReason].includes("observed_dimension_evidence"));
            if (!explained) violations.push(`${name}/${base.id}: ${d.id} applicability changed without an R4 context field or observed evidence`);
          } else if (sameEvidence && other.score !== d.score) violations.push(`${name}/${base.id}: ${d.id} score changed with identical evidence and applicability`);
        }
      }
    }
    summary[name] = row;
  }
  report.contextMatrix = summary;
  assert.deepEqual(violations, [], violations.slice(0, 20).join("\n"));
});

test("Metamorphic report (OBSERVATIONAL — for the R7-B record)", () => {
  // Printed so the counts in TESTING.md are reproducible from this exact command; asserts nothing new.
  console.log(`R7B_METAMORPHIC_REPORT ${JSON.stringify(report)}`);
  assert.ok(Object.keys(report).length > 0);
});
