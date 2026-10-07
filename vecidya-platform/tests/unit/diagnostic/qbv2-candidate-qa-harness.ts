import { buildCandidateCommercialBoundaryV3, type CandidateCommercialBoundaryV3 } from "../../../app/features/diagnostic/qbv2-candidate-commercial";
import { buildCandidateQuestionPlanV3, CANDIDATE_ROUTE_HARD_CAP_V3, type CandidateQuestionPlanV3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { narrativeBlocks } from "../../../app/features/diagnostic/qbv2-narrative";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 as BANK } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import { signalProductionContextFields } from "../../../app/features/diagnostic/qbv2-signals";
import type { CommercialClarificationAnswer } from "../../../app/features/diagnostic/commercial-recommendation";
import type { QuestionDefinitionV2 } from "../../../app/features/diagnostic/qbv2-contract";
import type { DigitalDimensionId } from "../../../app/features/diagnostic/qbv2-dimensions";
import type { AnswersV2, RuleV2 } from "../../../app/features/diagnostic/qbv2-rules";

/**
 * DIAG-V3-R7-B shared adversarial/metamorphic QA harness. Test-only: never imported by production code,
 * never changes candidate behavior. Every ordering/semantic authority used here is read from the frozen
 * candidate bank (`evidenceMigration`/`evidenceV3` states, option `kind`, gate rules) — never from option
 * labels, option position, or copy wording.
 */

export { BANK };
export const QUESTION_BY_ID: ReadonlyMap<string, QuestionDefinitionV2> = new Map(BANK.map((q) => [q.id, q]));
export const MIGRATED = BANK.filter((q) => q.evidenceMigration === "migrated");
export const DIRECT_SOURCES = MIGRATED.filter((q) => q.evidenceV3!.dimensions.some((d) => d.directness === "direct"));
export const SUPPORTING_SOURCES = MIGRATED.filter((q) => q.evidenceV3!.dimensions.every((d) => d.directness === "supporting"));
export const PENDING_IDS: ReadonlySet<string> = new Set(BANK.filter((q) => q.evidenceMigration === "pending").map((q) => q.id));
/** R3-FINAL ledger authority (frozen): the two LATER_REVIEW ids; every other pending id is CONTEXT_ONLY. */
export const LATER_REVIEW_IDS = ["q2_appointments_lead_to_booking", "q2_creator_audience_ownership"] as const;
export const CONTEXT_ONLY_IDS = [...PENDING_IDS].filter((id) => !(LATER_REVIEW_IDS as readonly string[]).includes(id));

/** Ordered capability ladder from the frozen R3 states (§9). `uncertainty`/`not_applicable`/`context_only` are unordered. */
export const EVIDENCE_LADDER: Readonly<Record<string, number>> = { missing: 0, weak: 1, partial: 2, established: 3, strong: 4 };

/** R3 V3 state of one option for a migrated question's single mapped dimension. */
export function optionState(question: QuestionDefinitionV2, value: string): string | undefined {
  return question.evidenceV3?.dimensions[0]?.answers[value];
}
export function targetDimension(question: QuestionDefinitionV2): DigitalDimensionId {
  return question.evidenceV3!.dimensions[0]!.dimension;
}
export function optionsByState(question: QuestionDefinitionV2, state: string): string[] {
  return question.options.filter((o) => optionState(question, o.value) === state).map((o) => o.value);
}
export function unknownOption(question: QuestionDefinitionV2): string | undefined {
  return question.options.find((o) => o.kind === "unknown")?.value;
}
export function notApplicableOption(question: QuestionDefinitionV2): string | undefined {
  return question.options.find((o) => o.kind === "not_applicable")?.value;
}
/** One valid raw value per option, shaped for the question type (multi-select values become one-element arrays). */
export function answerValue(question: QuestionDefinitionV2, value: string): string | readonly string[] {
  return question.type === "multi" ? [value] : value;
}

export function runChain(answers: AnswersV2, clarificationAnswer?: CommercialClarificationAnswer): CandidateCommercialBoundaryV3 {
  return buildCandidateCommercialBoundaryV3({ answers, clarificationAnswer });
}
export function activeOf(answers: AnswersV2): AnswersV2 {
  return resolveEligibleQuestionsV2(answers, BANK).activeAnswers;
}
export function eligibleOf(answers: AnswersV2): ReadonlySet<string> {
  return new Set(resolveEligibleQuestionsV2(answers, BANK).eligibleQuestionIds);
}
export function without(answers: AnswersV2, ...ids: readonly string[]): AnswersV2 {
  return Object.fromEntries(Object.entries(answers).filter(([id]) => !ids.includes(id))) as AnswersV2;
}

/** The pre-commercial diagnostic: everything a commercial clarification/score spoof must never touch (§24). */
export const PRE_COMMERCIAL_KEYS = ["activeAnswers", "context", "scoring", "priorities", "semanticFacts", "narrative", "overall", "recommendations", "solutions"] as const;

export function dimensionOf(result: CandidateCommercialBoundaryV3, dimension: DigitalDimensionId) {
  return result.scoring.dimensions.find((d) => d.id === dimension)!;
}
export function scoresOf(result: CandidateCommercialBoundaryV3): Record<string, number | null> {
  return Object.fromEntries(result.scoring.dimensions.map((d) => [d.id, d.score]));
}
export function commercialItemIds(result: CandidateCommercialBoundaryV3): string[] {
  const c = result.commercial;
  return [...c.now.services, ...c.now.complements, ...c.later.services, ...c.later.complements].map((item) => item.id);
}
export function solutionIds(result: CandidateCommercialBoundaryV3): string[] {
  return result.solutions.flatMap((s) => (s.solution ? [s.solution.id] : []));
}

/** Every question id cited as capability provenance anywhere downstream of evidence. */
export function capabilityProvenance(result: CandidateCommercialBoundaryV3): Map<string, string[]> {
  const out = new Map<string, string[]>();
  const add = (id: string, where: string) => out.set(id, [...(out.get(id) ?? []), where]);
  for (const d of result.scoring.dimensions) for (const e of d.evidence) add(e.questionId, `evidence:${d.id}`);
  for (const f of result.semanticFacts.facts) {
    for (const id of f.provenance.questionIds) add(id, `fact:${f.id}`);
    for (const s of [...(f.signals?.positive ?? []), ...(f.signals?.negative ?? [])]) add(s.questionId, `signal:${f.id}`);
  }
  for (const block of narrativeBlocks(result.narrative)) for (const id of block.sourceQuestionIds) {
    // A block that quotes a declaration (e.g. «Señalaste como principal freno …») cites the declaring
    // context question AND tags its context field in `sourceContext`; that is declaration provenance, not
    // capability evidence (R7-B triage: TEST_ASSUMPTION_ERROR in the broader "every sourceQuestionId" rule).
    const question = QUESTION_BY_ID.get(id);
    if (question && PENDING_IDS.has(id) && [...producedContextFields(question)].some((field) => block.sourceContext.includes(field))) continue;
    add(id, `narrative:${block.id}`);
  }
  for (const dim of result.narrative.dimensions) for (const e of dim.evidence) add(e.questionId, `narrative-dimension:${dim.dimension}`);
  for (const rec of result.recommendations.items) for (const id of rec.sourceQuestionIds) add(id, `recommendation:${rec.id}`);
  for (const ref of [...result.commercial.licenseFit.evidence, ...[...result.commercial.now.services, ...result.commercial.now.complements, ...result.commercial.later.services, ...result.commercial.later.complements].flatMap((i) => i.evidence)]) {
    if (ref.evidenceType === "DIRECT") add(ref.questionId, `commercial:${ref.answerOption}`);
  }
  return out;
}

const SOLUTION_TO_COMMERCIAL_ITEM: Readonly<Record<string, string>> = {
  offer_message: "presence_brand_message", website: "web_conversion_site", credibility_proof: "presence_brand_credibility",
  reputation_reviews: "reputation_reviews", work_organization: "business_development_organization",
};
const BARRIO_SOLUTIONS = new Set(["crm_follow_up", "follow_up_automation", "online_booking", "operational_automation"]);
const CAPABILITY_STATUSES = new Set(["strong", "positive_signal", "partial", "weak"]);

export type RouteTrace = { readonly asked: readonly string[]; readonly plan: CandidateQuestionPlanV3 };

/**
 * Structural invariants (§34, §48, §49, §50). Returns human-readable violation strings; an empty list is a
 * PASS. Never asserts that any score/band is business-correct.
 */
export function structuralViolations(result: CandidateCommercialBoundaryV3, options: { readonly route?: RouteTrace; readonly clarificationAnswer?: CommercialClarificationAnswer } = {}): string[] {
  const v: string[] = [];
  const active = result.activeAnswers;
  // Valid active answers.
  for (const [id, value] of Object.entries(active)) {
    const q = QUESTION_BY_ID.get(id);
    if (!q) { v.push(`active answer for unknown question ${id}`); continue; }
    const values = Array.isArray(value) ? value : [value as string];
    if (q.type === "single" && Array.isArray(value)) v.push(`single question ${id} has array answer`);
    if (values.length === 0) v.push(`empty answer ${id}`);
    for (const item of values) if (!q.options.some((o) => o.value === item)) v.push(`invalid option ${id}=${item}`);
    if (values.length > 1 && values.some((item) => q.options.find((o) => o.value === item)?.exclusive)) v.push(`exclusive option combined ${id}`);
  }
  // Scores / evidence.
  for (const d of result.scoring.dimensions) {
    if (d.score !== null && (d.score < 0 || d.score > 100 || !Number.isFinite(d.score))) v.push(`score out of range ${d.id}=${d.score}`);
    if (d.applicability !== "applicable" && d.score !== null) v.push(`non-applicable dimension scored ${d.id}`);
    const hasDirect = d.evidence.some((e) => e.directness === "direct" && e.contribution !== null);
    if (!hasDirect && d.score !== null) v.push(`supporting-only/no-direct dimension scored ${d.id}`);
    for (const e of d.evidence) {
      if (active[e.questionId] === undefined) v.push(`evidence from inactive question ${e.questionId}`);
      if (PENDING_IDS.has(e.questionId)) v.push(`evidence from pending question ${e.questionId}`);
      if (["uncertainty", "not_applicable"].includes(e.state) && e.contribution !== null) v.push(`neutral state contributes ${e.questionId}`);
    }
  }
  // Provenance (§48, §49).
  for (const [id, where] of capabilityProvenance(result)) {
    if (active[id] === undefined) v.push(`provenance from inactive question ${id} (${where[0]})`);
    if (PENDING_IDS.has(id)) v.push(`capability provenance from pending question ${id} (${where[0]})`);
  }
  // Facts / narrative: no capability claim without a semantic fact.
  const factIds = new Set(result.semanticFacts.facts.map((f) => f.id));
  for (const block of narrativeBlocks(result.narrative)) {
    if (["strength", "weakness", "partial"].includes(block.kind) && block.sourceFactIds.length === 0) v.push(`capability narrative block without fact ${block.id}`);
    for (const id of block.sourceFactIds) if (!factIds.has(id)) v.push(`narrative cites unknown fact ${id}`);
  }
  for (const dim of result.narrative.dimensions) {
    if (!CAPABILITY_STATUSES.has(dim.status)) continue;
    if (!result.semanticFacts.facts.some((f) => f.dimension === dim.dimension && ["strength", "partial", "weakness"].includes(f.type))) v.push(`capability status ${dim.dimension}=${dim.status} without capability fact`);
    if (dim.score === null) v.push(`capability status ${dim.dimension} with null score`);
  }
  // Recommendations follow priorities exactly.
  const priorityRanks = result.narrative.priorities.map((p) => p.rank);
  const recRanks = result.recommendations.items.map((r) => r.rank);
  if (JSON.stringify(priorityRanks) !== JSON.stringify(recRanks)) v.push(`recommendation ranks ${recRanks} != priorities ${priorityRanks}`);
  for (const rec of result.recommendations.items) {
    const priority = result.narrative.priorities.find((p) => p.rank === rec.rank);
    if (!priority || priority.dimension !== rec.dimension) v.push(`recommendation without matching priority ${rec.id}`);
    for (const id of rec.sourceFactIds) if (!factIds.has(id)) v.push(`recommendation cites unknown fact ${id}`);
  }
  // One SolutionMatch per recommendation, aligned; verify → null.
  if (result.solutions.length !== result.recommendations.items.length) v.push(`solutions ${result.solutions.length} != recommendations ${result.recommendations.items.length}`);
  result.recommendations.items.forEach((rec, index) => {
    const match = result.solutions[index];
    if (!match || match.recommendationId !== rec.id) v.push(`solution misaligned for ${rec.id}`);
    if (rec.mode === "verify" && match?.solution) v.push(`verify recommendation ${rec.id} has solution ${match.solution.id}`);
  });
  // Commercial items only from supported non-null solutions.
  const derivable = new Set(solutionIds(result).flatMap((id) => (SOLUTION_TO_COMMERCIAL_ITEM[id] ? [SOLUTION_TO_COMMERCIAL_ITEM[id]!] : [])));
  for (const id of commercialItemIds(result)) if (!derivable.has(id)) v.push(`commercial item ${id} without supporting solution`);
  // License domain and need-level justification.
  const license = result.commercial.licenseFit.recommendedLicense;
  if (!(license === null || ["cuadra", "barrio", "ciudad"].includes(license))) v.push(`invalid license ${license}`);
  if (license === "ciudad" && options.clarificationAnswer !== "multiple_coordinated_processes") v.push("Ciudad without explicit multiprocess clarification");
  if (license === "barrio" && !solutionIds(result).some((id) => BARRIO_SOLUTIONS.has(id))) v.push("Barrio without recurring operational solution");
  if (license === "cuadra" && !solutionIds(result).includes("work_organization")) v.push("Cuadra without work_organization need");
  // Route integrity.
  if (options.route) {
    const { asked, plan } = options.route;
    if (new Set(asked).size !== asked.length) v.push(`duplicate asked question in ${asked.join(",")}`);
    if (asked.length > CANDIDATE_ROUTE_HARD_CAP_V3) v.push(`hard cap exceeded: ${asked.length}`);
    if (plan.nextQuestionId !== undefined) v.push("route did not terminate");
    if (plan.evidenceSufficiency.contradictions.length > 0) v.push("legacy contradiction rule reached");
  }
  return v;
}

// --- Gate dependency graph (structural traceability, §43-44) ----------------------------------------

function ruleRefs(rule: RuleV2 | undefined, out: { questions: Set<string>; fields: Set<string> }) {
  if (!rule) return out;
  const r = rule as unknown as Record<string, unknown>;
  const ref = r.ref as { question?: string } | undefined;
  if (ref?.question) out.questions.add(ref.question);
  if (typeof r.field === "string") out.fields.add(r.field);
  if (r.op === "archetypeIncludes") out.fields.add("archetype");
  if (Array.isArray(r.rules)) for (const item of r.rules as RuleV2[]) ruleRefs(item, out);
  if (r.rule) ruleRefs(r.rule as RuleV2, out);
  return out;
}
/** Context fields a question can produce, read from its option `produces` metadata (the resolver's own contract). */
export function producedContextFields(question: QuestionDefinitionV2): Set<string> {
  const out = new Set<string>();
  for (const option of question.options) for (const production of option.produces ?? []) {
    for (const field of signalProductionContextFields(production)) out.add(field);
    if (production.kind === "hasRealCustomers") out.add("activity");
  }
  return out;
}
export function gateRefs(question: QuestionDefinitionV2): { questions: Set<string>; fields: Set<string> } {
  const out = { questions: new Set<string>(), fields: new Set<string>() };
  const q = question as QuestionDefinitionV2 & { appliesWhen?: RuleV2; materialAppliesWhen?: RuleV2 };
  ruleRefs(q.appliesWhen, out);
  ruleRefs(q.materialAppliesWhen, out);
  return out;
}
/**
 * Transitive closure of questions whose eligibility can structurally depend on `rootIds` — through a direct
 * question reference or through any context field one of them produces. Over-approximates on purpose: it
 * only bounds which answers MAY appear/disappear; anything outside it changing is a real violation.
 */
export function structuralDependents(rootIds: readonly string[]): Set<string> {
  const dependents = new Set<string>(rootIds);
  let changed = true;
  while (changed) {
    changed = false;
    const fields = new Set<string>();
    for (const id of dependents) for (const field of producedContextFields(QUESTION_BY_ID.get(id)!)) fields.add(field);
    for (const q of BANK) {
      if (dependents.has(q.id)) continue;
      const refs = gateRefs(q);
      if ([...refs.questions].some((id) => dependents.has(id)) || [...refs.fields].some((field) => fields.has(field))) { dependents.add(q.id); changed = true; }
    }
  }
  return dependents;
}

// --- Deterministic PRNG (§33): seeded, reproducible, no global random/time/network state ------------

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}
/** Stable Fisher–Yates shuffle driven only by the seeded generator. */
export function stableShuffle<T>(items: readonly T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

// --- Policy-driven interactive routing (fuzz, §32-33) -----------------------------------------------

export type AnswerPolicy = (question: QuestionDefinitionV2, answers: AnswersV2) => string | readonly string[];

/** One question per turn, exactly like the R7-A runner, but answers come from a deterministic policy. */
export function runPolicyRoute(policy: AnswerPolicy, initial: AnswersV2 = {}): { asked: string[]; finalAnswers: AnswersV2; plan: CandidateQuestionPlanV3; turns: number } {
  let answers: AnswersV2 = initial;
  const asked: string[] = [];
  for (let turn = 0; turn < CANDIDATE_ROUTE_HARD_CAP_V3 + 6; turn += 1) {
    const plan = buildCandidateQuestionPlanV3({ answers });
    answers = plan.activeAnswers;
    if (!plan.nextQuestionId) return { asked, finalAnswers: answers, plan, turns: turn };
    const question = QUESTION_BY_ID.get(plan.nextQuestionId)!;
    answers = { ...answers, [question.id]: policy(question, answers) };
    asked.push(question.id);
  }
  throw new Error(`policy route did not terminate; asked ${asked.join(",")}`);
}
