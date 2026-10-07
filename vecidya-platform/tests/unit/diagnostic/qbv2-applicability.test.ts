import assert from "node:assert/strict";
import test from "node:test";
import { resolved } from "../../../app/features/diagnostic/contracts";
import { QUESTION_BANK_V2 } from "../../../app/features/diagnostic/qbv2-bank";
import { resolveEligibleQuestionsV2 } from "../../../app/features/diagnostic/qbv2-engine";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qbv2-reviewed-evidence";
import { REVIEWED_CONTEXT_QUESTIONS_V2 } from "../../../app/features/diagnostic/qbv2-reviewed-context";
import { REVIEWED_OPERATIONAL_CONTEXT_QUESTIONS_V2 } from "../../../app/features/diagnostic/qbv2-reviewed-operational-context";
import { deriveContextualEvidence } from "../../../app/features/diagnostic/qbv2-contextual-scoring";
import { DIGITAL_DIMENSION_IDS, type DigitalDimensionId } from "../../../app/features/diagnostic/qbv2-dimensions";
import { evaluateDimensionApplicabilityV3, type DimensionApplicabilityDecisionV3 } from "../../../app/features/diagnostic/qbv2-applicability";
import type { ResolvedDomainContext } from "../../../app/features/diagnostic/context-resolver";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const noEvidence = [] as const;
const decide = (dimension: DigitalDimensionId, context: Partial<ResolvedDomainContext>, evidence = noEvidence) =>
  evaluateDimensionApplicabilityV3({ dimension, context, evidence });
const reviewedMaturityBank = [...QUESTION_BANK_V2, ...REVIEWED_CONTEXT_QUESTIONS_V2, ...REVIEWED_OPERATIONAL_CONTEXT_QUESTIONS_V2];
const contextFrom = (answers: AnswersV2, bank: typeof QUESTION_BANK_V2 = QUESTION_BANK_V2) => resolveEligibleQuestionsV2(answers, bank).context;

test("R4-A evaluates every dimension and keeps universal scope explicit", () => {
  assert.deepEqual(DIGITAL_DIMENSION_IDS, [
    "clarity_positioning", "digital_foundation", "discovery", "trust_reputation",
    "conversion_access", "relationship_recurrence", "measurement_optimization", "digital_readiness",
  ]);
  assert.equal(decide("clarity_positioning", {}).applicability, "applicable");
  assert.equal(decide("clarity_positioning", {}).reason, "universal_dimension");
  assert.equal(decide("digital_readiness", {}).applicability, "applicable");
  assert.equal(decide("digital_readiness", {}).reason, "universal_dimension");
  for (const entity of ["business", "individual", "organization", "project"] as const) {
    assert.equal(decide("clarity_positioning", { entity: resolved(entity, "signal") }).applicability, "applicable", entity);
  }
});

test("prelaunch project matrix is dimension-specific, never a global N/A", () => {
  const context = contextFrom({ q2_entity: "project", q2_has_customers: "no" });
  const expected = {
    clarity_positioning: "applicable",
    digital_foundation: "not_applicable",
    discovery: "insufficient_context",
    trust_reputation: "not_applicable",
    conversion_access: "insufficient_context",
    relationship_recurrence: "not_applicable",
    measurement_optimization: "not_applicable",
    digital_readiness: "applicable",
  } as const;
  for (const dimension of DIGITAL_DIMENSION_IDS) assert.equal(decide(dimension, context).applicability, expected[dimension], dimension);
  assert.equal(context.activity.status, "resolved");
  assert.equal(context.activity.value, "prelaunch");
  assert.equal(context.growthStage.status, "resolved");
  assert.equal(context.growthStage.value, "idea");
});

test("activity is sufficient for operation-scoped dimensions without precise growth stage", () => {
  const context = contextFrom({ q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular" });
  assert.equal(context.activity.value, "active");
  assert.equal(context.growthStage.status, "unresolved");
  for (const dimension of ["digital_foundation", "trust_reputation", "measurement_optimization"] as const) {
    assert.equal(decide(dimension, context).applicability, "applicable", dimension);
    assert.equal(decide(dimension, context).reason, "active_operation", dimension);
  }
});

test("an active professional business can evaluate all eight dimensions", () => {
  const context = contextFrom({ q2_delivery: "solo_practice", q2_has_customers: "yes" });
  for (const dimension of DIGITAL_DIMENSION_IDS) assert.equal(decide(dimension, context).applicability, "applicable", dimension);
});

test("starting and operating stages do not act as ordinal applicability scores", () => {
  const starting = contextFrom({ q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "irregular" });
  assert.equal(starting.growthStage.value, "starting");
  assert.equal(decide("measurement_optimization", starting).applicability, "applicable");
  const operating = contextFrom({ q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "flat" }, reviewedMaturityBank);
  assert.equal(operating.growthStage.value, "operating");
  assert.equal(decide("measurement_optimization", operating).applicability, "applicable");
  const growing = contextFrom({ q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "increasing" }, reviewedMaturityBank);
  assert.equal(growing.growthStage.value, "growing");
  assert.equal(decide("measurement_optimization", growing).applicability, "applicable");
});

test("growing/scaling and structural contexts remain applicable without using declared intent", () => {
  const active = contextFrom({ q2_delivery: "b2b_pipeline", q2_has_customers: "yes", q2_regularity: "regular", q2_demand_trend: "increasing", q2_process_systemization: "defined" }, reviewedMaturityBank);
  assert.equal(active.growthStage.value, "scaling");
  assert.equal(decide("measurement_optimization", active).applicability, "applicable");
  const goalMeasure = { ...active, primaryGoal: resolved("measure", "signal") };
  const goalOther = { ...active, primaryGoal: resolved("explain", "signal") };
  assert.deepEqual(decide("measurement_optimization", goalMeasure), decide("measurement_optimization", goalOther));
  const frictionA = { ...active, primaryFriction: resolved("follow_up", "signal") };
  const frictionB = { ...active, primaryFriction: resolved("operations", "signal") };
  assert.deepEqual(decide("measurement_optimization", frictionA), decide("measurement_optimization", frictionB));
});

test("appointments, retail/ecommerce, B2B, professional, creator, nonprofit and membership resolve structural applicability", () => {
  const cases: readonly [string, Partial<ResolvedDomainContext>, DigitalDimensionId, string][] = [
    ["appointments", { activity: resolved("active", "signal"), archetype: resolved("appointments", "signal"), archetypeComponents: ["appointments"] }, "relationship_recurrence", "applicable"],
    ["retail", { activity: resolved("active", "signal"), archetype: resolved("retail", "signal"), archetypeComponents: ["retail"] }, "relationship_recurrence", "applicable"],
    ["ecommerce", { activity: resolved("active", "signal"), archetype: resolved("ecommerce", "signal"), archetypeComponents: ["ecommerce"] }, "conversion_access", "applicable"],
    ["B2B", { activity: resolved("active", "signal"), archetype: resolved("b2b", "signal"), archetypeComponents: ["b2b"], customerModel: { buyer: resolved("b2b", "signal"), reach: resolved("national", "signal") } }, "relationship_recurrence", "applicable"],
    ["professional", { activity: resolved("active", "signal"), archetype: resolved("professional", "signal"), archetypeComponents: ["professional"] }, "conversion_access", "applicable"],
    ["creator", { activity: resolved("active", "signal"), archetype: resolved("creator", "signal"), archetypeComponents: ["creator"], businessModel: resolved("creator_audience", "signal") }, "discovery", "applicable"],
    ["nonprofit", { businessModel: resolved("nonprofit", "signal"), entity: resolved("organization", "signal") }, "conversion_access", "applicable"],
    ["membership", { businessModel: resolved("membership", "signal") }, "relationship_recurrence", "applicable"],
  ];
  for (const [name, context, dimension, expected] of cases) assert.equal(decide(dimension, context).applicability, expected, name);
  const ecommerceOnly = { activity: resolved("active", "signal"), archetype: resolved("ecommerce", "signal"), archetypeComponents: ["ecommerce"] } satisfies Partial<ResolvedDomainContext>;
  assert.equal(decide("relationship_recurrence", ecommerceOnly).applicability, "insufficient_context", "active ecommerce alone does not prove a recurring or multistep relationship");
  const creatorWithoutAction = { archetype: resolved("creator", "signal"), archetypeComponents: ["creator"] } satisfies Partial<ResolvedDomainContext>;
  assert.equal(decide("discovery", creatorWithoutAction).applicability, "applicable");
  assert.equal(decide("conversion_access", creatorWithoutAction).applicability, "insufficient_context", "creator archetype alone does not invent a concrete next action");
  assert.equal(decide("conversion_access", { ...creatorWithoutAction, businessModel: resolved("creator_audience", "signal") }).applicability, "applicable");
  const geographyOnly = { customerModel: { reach: resolved("national", "signal"), buyer: { status: "unresolved", reason: "not_asked", candidates: [] } } } satisfies Partial<ResolvedDomainContext>;
  assert.equal(decide("discovery", geographyOnly).applicability, "insufficient_context", "geography alone does not establish meaningful audience or demand");
});

test("hybrid decisions preserve and use all real archetype components", () => {
  const context: Partial<ResolvedDomainContext> = {
    archetype: resolved("hybrid", "signal"),
    archetypeComponents: ["appointments", "professional"],
    businessModel: resolved("professional_services", "signal"),
    activity: resolved("active", "signal"),
  };
  const result = decide("relationship_recurrence", context);
  assert.equal(result.applicability, "applicable");
  assert.ok(result.supportingContext.includes("archetypeComponent=appointments"));
  assert.ok(result.supportingContext.includes("archetypeComponent=professional"));
});

test("missing and unresolved required context remain insufficient, distinct from N/A", () => {
  const missing = decide("digital_foundation", {});
  const unresolved = decide("digital_foundation", { activity: { status: "unresolved", reason: "declared_unknown", candidates: [] } as ResolvedDomainContext["activity"] });
  const prelaunch = decide("digital_foundation", { activity: resolved("prelaunch", "signal") });
  assert.equal(missing.applicability, "insufficient_context");
  assert.equal(unresolved.applicability, "insufficient_context");
  assert.equal(prelaunch.applicability, "not_applicable");
  assert.equal(unresolved.reason, "context_unresolved");
  assert.ok(unresolved.supportingContext.includes("activity=unresolved:declared_unknown"));
});

test("goal and friction cannot manufacture Conversion or Relationship applicability", () => {
  const noStructure: Partial<ResolvedDomainContext> = {
    primaryGoal: resolved("opportunities", "signal"),
    primaryFriction: resolved("conversion", "signal"),
  };
  assert.equal(decide("conversion_access", noStructure).applicability, "insufficient_context");
  assert.equal(decide("relationship_recurrence", noStructure).applicability, "insufficient_context");
  assert.deepEqual(
    decide("conversion_access", { ...noStructure, primaryGoal: resolved("explain", "signal"), primaryFriction: resolved("follow_up", "signal") }),
    decide("conversion_access", noStructure),
  );
});

test("Measurement is applicable with zero R3 evidence while the pure result has no score or basis", () => {
  const context = contextFrom({ q2_delivery: "solo_practice", q2_has_customers: "yes" });
  const evidence = deriveContextualEvidence({ q2_ecommerce_traffic_sources: ["social"] }, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3);
  assert.equal(evidence.filter((item) => item.dimension === "measurement_optimization").length, 0);
  const result: DimensionApplicabilityDecisionV3 = decide("measurement_optimization", context, evidence.filter((item): item is typeof item & { questionVersion: 1 | 2 | 3; migrationIdentity: string } => item.questionVersion !== undefined && item.migrationIdentity !== undefined));
  assert.equal(result.applicability, "applicable");
  assert.equal("score" in result, false);
  assert.equal("basis" in result, false);
});

test("applicability depends on structural context without creating evidence or points", () => {
  const prelaunchAnswers: AnswersV2 = { q2_entity: "project", q2_has_customers: "no" };
  const activeAnswers: AnswersV2 = { q2_entity: "individual", q2_delivery: "solo_practice", q2_has_customers: "yes" };
  const prelaunch = contextFrom(prelaunchAnswers);
  const active = contextFrom(activeAnswers);
  assert.equal(decide("measurement_optimization", prelaunch).applicability, "not_applicable");
  assert.equal(decide("measurement_optimization", active).applicability, "applicable");
  assert.deepEqual(deriveContextualEvidence(prelaunchAnswers, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3), []);
  assert.deepEqual(deriveContextualEvidence(activeAnswers, REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3), []);
});

test("valid V3 evidence corroborates by presence, independent of capability strength", () => {
  const bank = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3;
  const states = [
    deriveContextualEvidence({ q2_presence_offer_clarity: "clear" }, bank),
    deriveContextualEvidence({ q2_presence_offer_clarity: "partial" }, bank),
    deriveContextualEvidence({ q2_presence_offer_clarity: "unclear" }, bank),
  ];
  const decisions = states.map((evidence) => decide("clarity_positioning", {}, evidence.filter((item): item is typeof item & { questionVersion: 1 | 2 | 3; migrationIdentity: string } => item.questionVersion !== undefined && item.migrationIdentity !== undefined)));
  assert.deepEqual(decisions.map((item) => item.applicability), ["applicable", "applicable", "applicable"]);
  assert.deepEqual(decisions.map((item) => item.reason), ["observed_dimension_evidence", "observed_dimension_evidence", "observed_dimension_evidence"]);
  const prelaunch = contextFrom({ q2_entity: "project", q2_has_customers: "no" });
  const foundation = deriveContextualEvidence({ q2_presence_digital_base: "reliable_presence" }, bank)
    .filter((item): item is typeof item & { questionVersion: 1 | 2 | 3; migrationIdentity: string } => item.questionVersion !== undefined && item.migrationIdentity !== undefined);
  assert.equal(decide("digital_foundation", prelaunch).applicability, "not_applicable");
  assert.equal(decide("digital_foundation", prelaunch, foundation).applicability, "applicable", "observed V3 evidence can corroborate that the dimension is material");
});

test("one N/A observation does not suppress another structurally relevant capability", () => {
  const bank = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3;
  const na = deriveContextualEvidence({ q2_presence_offer_clarity: "not_applicable" }, bank).filter((item): item is typeof item & { questionVersion: 1 | 2 | 3; migrationIdentity: string } => item.questionVersion !== undefined && item.migrationIdentity !== undefined);
  const context = { activity: resolved("active", "signal"), businessModel: resolved("services", "signal") } satisfies Partial<ResolvedDomainContext>;
  assert.equal(decide("clarity_positioning", context, na).applicability, "applicable");
});

test("same semantic context yields deterministic decisions and supporting facts", () => {
  const context: Partial<ResolvedDomainContext> = {
    activity: resolved("active", "signal"),
    archetype: resolved("hybrid", "signal"),
    archetypeComponents: ["professional", "appointments"],
    businessModel: resolved("professional_services", "signal"),
  };
  const forward = decide("relationship_recurrence", context);
  const reverse = decide("relationship_recurrence", { ...context, archetypeComponents: [...context.archetypeComponents!].reverse() });
  assert.deepEqual(forward, reverse);
});
