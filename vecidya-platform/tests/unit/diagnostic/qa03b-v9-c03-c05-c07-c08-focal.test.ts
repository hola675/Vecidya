import assert from "node:assert/strict";
import test from "node:test";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 as bank } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { collectContextDependencies, evaluateRuleV2Trace } from "../../../app/features/diagnostic/qbv2-rules";
import { resolveDiagnosticContext } from "../../../app/features/diagnostic/context-resolver";
import { selectV9Questions } from "../../../app/features/diagnostic/v9/question-selection";
import { evaluateV9Rule, planV9GraphQuestions } from "../../../app/features/diagnostic/v9/graph-evaluation";
import { classifyV9Activity, interpretV9AnswerState, interpretV9SelectedOption } from "../../../app/features/diagnostic/qa03b/v9-context-semantics";

const get = (id: string) => {
  const q = bank.find((item) => item.id === id);
  assert.ok(q, `Missing candidate question ${id}`);
  return q;
};

const eligible = (id: string, answers: Record<string, string>) => {
  const rule = get(id).appliesWhen;
  assert.ok(rule, `Missing eligibility rule for ${id}`);
  // Never silently evaluate context-dependent rules against a fabricated context.
  assert.deepEqual(collectContextDependencies(rule), [], `${id} unexpectedly depends on resolved context`);
  const evaluation = evaluateRuleV2Trace(rule, answers, {} as Parameters<typeof evaluateRuleV2Trace>[2]);
  console.log("V9_FOCAL_GATE " + JSON.stringify({ id, answers, result: evaluation.result, trace: evaluation.trace }));
  return evaluation.result;
};

test("C03: paused activity with historical customers is not current operation", () => {
  const state = classifyV9Activity("paused", "yes");
  assert.equal(state.canAssertCurrentOperation, false);
  assert.equal(state.canAssertHistoricalDemand, true);
  const donation = get("q2_nonprofit_donation_clarity");
  assert.match(JSON.stringify(donation.appliesWhen), /"ref":\{"question":"q2_operational_status"\},"value":"operating"/);
  assert.equal(eligible("q2_nonprofit_donation_clarity", { q2_operational_status: "paused", q2_entity: "organization", q2_nonprofit_support_type: "donations" }), false);
});

test("C05: nonprofit without donations or dues has distinct gated questions", () => {
  for (const id of ["q2_nonprofit_donation_clarity", "q2_nonprofit_membership_lifecycle"]) {
    const q = get(id);
    assert.ok(q.appliesWhen || q.materialAppliesWhen, `${id} must be gated`);
    assert.ok(q.evidenceV3?.dimensions.length, `${id} must map evidence`);
    const gate = JSON.stringify(q.appliesWhen);
    assert.ok(gate.includes("q2_nonprofit_support_type"), `${id} must check support type`);
    assert.ok(gate.includes(id.includes("donation") ? "donations" : "membership_dues"));
  }
  assert.notEqual(get("q2_nonprofit_donation_clarity").id, get("q2_nonprofit_membership_lifecycle").id);
  const answers = { q2_operational_status: "operating", q2_entity: "organization", q2_nonprofit_support_type: "grants" };
  assert.equal(eligible("q2_nonprofit_donation_clarity", answers), false);
  assert.equal(eligible("q2_nonprofit_membership_lifecycle", answers), false);
  assert.equal(eligible("q2_nonprofit_donation_clarity", { ...answers, q2_nonprofit_support_type: "donations" }), true);
  assert.equal(eligible("q2_nonprofit_membership_lifecycle", { ...answers, q2_nonprofit_support_type: "membership_dues" }), true);
  const mixed = { ...answers, q2_nonprofit_support_type: "mixed" };
  assert.equal(eligible("q2_nonprofit_donation_clarity", mixed), true);
  assert.equal(eligible("q2_nonprofit_membership_lifecycle", mixed), true);
  const paused = { ...mixed, q2_operational_status: "paused" };
  assert.equal(eligible("q2_nonprofit_donation_clarity", paused), false);
  assert.equal(eligible("q2_nonprofit_membership_lifecycle", paused), false);
});

test("C07: unauthorized ecommerce follow-up remains not applicable", () => {
  const q = get("q2_ecommerce_cart_followup");
  assert.equal(q.options.find((option) => option.value === "no_authorized_contact")?.kind, "not_applicable");
  assert.equal(q.evidenceV3?.dimensions.find((d) => d.dimension === "relationship_recurrence")?.answers.no_authorized_contact, "not_applicable");
  for (const dimension of q.evidenceV3?.dimensions ?? []) {
    assert.equal(dimension.answers.no_authorized_contact, "not_applicable", `Unauthorized contact must remain neutral in ${dimension.dimension}`);
  }
  assert.equal(interpretV9SelectedOption("no_authorized_contact", true, q.options.find((option) => option.value === "no_authorized_contact")?.kind), "not_applicable");
});

test("C08: restaurant menu question is guarded; no presence cannot be assumed clear", () => {
  const q = get("q2_food_menu_visibility");
  assert.ok(q.appliesWhen || q.materialAppliesWhen);
  const gate = JSON.stringify(q.appliesWhen);
  assert.ok(gate.includes("q2_presence_digital_base"));
  assert.ok(gate.includes("reliable_presence") && gate.includes("partial_presence"));
  assert.equal(q.evidenceV3?.dimensions.find((d) => d.dimension === "clarity_positioning")?.answers.unknown, "uncertainty");
  const absentPresence = { q2_operational_status: "operating", q2_has_customers: "yes", q2_sector: "food_hospitality", q2_niche_food_hospitality: "restaurant", q2_goal: "explain", q2_presence_digital_base: "no_reliable_presence" };
  assert.equal(eligible("q2_food_menu_visibility", absentPresence), false);
  assert.equal(eligible("q2_food_menu_visibility", { ...absentPresence, q2_presence_digital_base: "unknown" }), false);
  assert.equal(eligible("q2_food_menu_visibility", { q2_operational_status: "operating", q2_has_customers: "yes", q2_sector: "food_hospitality", q2_niche_food_hospitality: "restaurant", q2_goal: "explain", q2_presence_digital_base: "partial_presence" }), true);
  assert.equal(interpretV9AnswerState(undefined, true), "unanswered");
  assert.equal(interpretV9AnswerState("unknown", true), "unknown");
  assert.equal(interpretV9AnswerState(undefined, false), "not_applicable");
  const generic = get("q2_presence_offer_clarity");
  assert.ok(generic.appliesWhen || generic.materialAppliesWhen);
  // This generic is a material-eligibility question; do not mistake appliesWhen for the full gate.
  const materialGate = generic.materialAppliesWhen;
  assert.ok(materialGate, "Generic offer clarity must have a material eligibility gate");
  assert.match(JSON.stringify(materialGate), /q2_presence_digital_base/);
  assert.match(JSON.stringify(materialGate), /reliable_presence/);
  assert.match(JSON.stringify(materialGate), /partial_presence/);
  for (const dimension of q.evidenceV3?.dimensions ?? []) {
    assert.notEqual(dimension.answers.unknown, "weak", `Unknown menu evidence cannot be weak in ${dimension.dimension}`);
    assert.notEqual(dimension.answers.not_applicable, "weak", `Inapplicable menu evidence cannot be weak in ${dimension.dimension}`);
  }
});

// Evaluate both sides of the replacement with a resolved context, not a fabricated cast.
test("F03: restaurant specialty replaces generic only when eligible; unknown niche keeps generic", () => {
  const context = resolveDiagnosticContext({
    hasRealCustomers: { value: true, provenance: "explicit_declaration" },
  }).context;
  const generic = get("q2_presence_offer_clarity");
  const genericRule = generic.materialAppliesWhen;
  assert.ok(genericRule, "Expected a material eligibility rule for generic offer clarity");
  assert.deepEqual(collectContextDependencies(genericRule), ["activity"]);
  const genericEligible = (answers: Record<string, string>) =>
    evaluateRuleV2Trace(genericRule, answers, context).result;

  const base = {
    q2_operational_status: "operating",
    q2_has_customers: "yes",
    q2_sector: "food_hospitality", q2_niche_food_hospitality: "restaurant",
    q2_goal: "explain",
    q2_presence_digital_base: "partial_presence",
  };
  assert.equal(eligible("q2_food_menu_visibility", base), true, "Restaurant specialty should be eligible");
  assert.equal(genericEligible(base), false, "Specialist must suppress generic to avoid double observation");

  const absentPresence = { ...base, q2_presence_digital_base: "no_reliable_presence" };
  assert.equal(eligible("q2_food_menu_visibility", absentPresence), false);
  assert.equal(genericEligible(absentPresence), false, "No presence must not imply digital offer clarity");

  const unknownNiche = { ...base, q2_niche_food_hospitality: "unknown" };
  assert.equal(eligible("q2_food_menu_visibility", unknownNiche), false);
  assert.equal(genericEligible(unknownNiche), true, "Generic must remain when specialization is unconfirmed");

  const agency = {
    ...base,
    q2_niche_food_hospitality: "unknown",
    q2_sector: "b2b_services",
    q2_niche_b2b_services: "marketing_agency",
    q2_customer_buyer: "b2b",
  };
  assert.equal(eligible("q2_marketing_agency_scope_clarity", agency), true);
  assert.equal(genericEligible(agency), false, "Agency specialist must also suppress generic");

  // V9-only bounded selector consumes the real evaluated eligibility; QBV2 stays in the test adapter.
  const pick = (answers: Record<string, string>) => selectV9Questions([
    { id: "q2_food_menu_visibility", eligible: eligible("q2_food_menu_visibility", answers) },
    { id: "q2_marketing_agency_scope_clarity", eligible: eligible("q2_marketing_agency_scope_clarity", answers) },
    { id: "q2_presence_offer_clarity", eligible: genericEligible(answers) },
  ], []).selectedIds;
  assert.deepEqual(pick(base), ["q2_food_menu_visibility"]);
  assert.deepEqual(pick(absentPresence), []);
  assert.deepEqual(pick(unknownNiche), ["q2_presence_offer_clarity"]);
  assert.deepEqual(pick(agency), ["q2_marketing_agency_scope_clarity"]);
});

test("F03 native V9 graph respects real C03/C05/C08 candidate gates without V8 engine import", () => {
  const paused = { q2_operational_status: "paused", q2_entity: "organization", q2_nonprofit_support_type: "donations" };
  assert.equal(evaluateV9Rule(get("q2_nonprofit_donation_clarity").appliesWhen!, { answers: paused }).status, "ineligible");
  const grants = { q2_operational_status: "operating", q2_entity: "organization", q2_nonprofit_support_type: "grants" };
  assert.equal(evaluateV9Rule(get("q2_nonprofit_donation_clarity").appliesWhen!, { answers: grants }).status, "ineligible");
  assert.equal(evaluateV9Rule(get("q2_nonprofit_membership_lifecycle").appliesWhen!, { answers: grants }).status, "ineligible");
  assert.equal(evaluateV9Rule(get("q2_nonprofit_donation_clarity").appliesWhen!, { answers: { ...grants, q2_nonprofit_support_type: "donations" } }).status, "eligible");

  const menu = get("q2_food_menu_visibility");
  const generic = get("q2_presence_offer_clarity");
  const partialPresence = {
    q2_operational_status: "operating",
    q2_has_customers: "yes",
    q2_sector: "food_hospitality", q2_niche_food_hospitality: "restaurant",
    q2_goal: "explain",
    q2_presence_digital_base: "partial_presence",
  };
  const context = resolveDiagnosticContext({
    hasRealCustomers: { value: true, provenance: "explicit_declaration" },
  }).context;
  const plan = (answers: Record<string, string>) => planV9GraphQuestions([
    { id: menu.id, appliesWhen: menu.appliesWhen },
    { id: generic.id, materialAppliesWhen: generic.materialAppliesWhen },
  ], { answers, context: { fields: { activity: context.activity } } }, [], { materialEvidenceRequested: true });

  const eligibleMenu = plan(partialPresence);
  assert.deepEqual(eligibleMenu.selection.selectedIds, ["q2_food_menu_visibility"]);
  assert.equal(eligibleMenu.evaluations.find((item) => item.id === generic.id)?.status, "ineligible");

  const absent = plan({ ...partialPresence, q2_presence_digital_base: "no_reliable_presence" });
  assert.deepEqual(absent.selection.selectedIds, []);
  const missingNiche = { ...partialPresence } as Record<string, string>;
  delete missingNiche.q2_niche_food_hospitality;
  const pending = plan(missingNiche);
  assert.equal(pending.evaluations.find((item) => item.id === menu.id)?.status, "pending");
  assert.equal(pending.evaluations.find((item) => item.id === generic.id)?.status, "pending");
  assert.deepEqual(pending.selection.selectedIds, []);
  assert.equal(pending.selection.skipped.every((item) => item.reason === "pending_dependencies"), true);
});
