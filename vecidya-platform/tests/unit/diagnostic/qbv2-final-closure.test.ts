import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateRuleV2 } from "../../../app/features/diagnostic/qbv2-rules.ts";

import {
  CURRENT_QUESTION_BANK_VERSION,
  GOLDEN_QUESTIONS_V2,
  MODULE_REGISTRY,
  NICHE_REGISTRY,
  QUESTION_BANK_V2,
  resolveEligibleQuestionsV2,
  validateQuestionBankV2,
} from "../../../app/features/diagnostic/index.ts";

const FOUNDATION = new Set(["core", "classification", "maturity", "goal_friction"]);
const CROSS_CUTTING = new Set(["operations", "follow_up", "measurement"]);
const SPECIALIZED = new Set(["local", "local_service", "appointments", "professional", "retail", "ecommerce", "hospitality", "b2b", "creator", "nonprofit", "reputation"]);
const productionQuestions = QUESTION_BANK_V2;

const contexts: Record<string, Record<string, string>> = {
  "idea/project": { q2_entity: "project", q2_has_customers: "no", q2_goal: "opportunities" },
  "starting service": { q2_delivery: "travels", q2_has_customers: "yes", q2_regularity: "irregular", q2_goal: "opportunities" },
  "local service": { q2_delivery: "travels", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "opportunities" },
  professional: { q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "trust" },
  appointments: { q2_delivery: "scheduled", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "opportunities" },
  "professional+appointments": { q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "opportunities" },
  retail: { q2_delivery: "fixed_with_inventory", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "opportunities" },
  ecommerce: { q2_delivery: "online_checkout", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "opportunities" },
  "retail+ecommerce": { q2_delivery: "fixed_with_inventory", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "opportunities" },
  hospitality: { q2_delivery: "onsite", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "opportunities" },
  "B2B professional": { q2_delivery: "b2b_pipeline", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "opportunities" },
  creator: { q2_delivery: "audience_content", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "opportunities" },
  "creator+ecommerce": { q2_delivery: "audience_content", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "opportunities" },
  nonprofit: { q2_monetization: "mission", q2_delivery: "fixed_no_inventory", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "opportunities" },
  "operations-heavy": { q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "opportunities", q2_friction: "operations" },
  "follow-up-heavy": { q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "opportunities", q2_friction: "follow_up" },
  "measurement-focused": { q2_delivery: "solo_practice", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "measure" },
};

function pressure(answers: Record<string, string>) {
  const result = resolveEligibleQuestionsV2(answers, productionQuestions);
  // 08E.1: pressure measures base-route candidates; questions eligible only as material evidence never compete there.
  const native = (id: string) => { const question = productionQuestions.find((item) => item.id === id)!; return question.appliesWhen ? evaluateRuleV2(question.appliesWhen, result.activeAnswers, result.context) : !question.materialAppliesWhen; };
  const buckets = { foundation: 0, specialized: 0, "cross-cutting": 0, other: 0 };
  for (const id of result.eligibleQuestionIds.filter(native)) {
    const module = productionQuestions.find((question) => question.id === id)!.module;
    if (FOUNDATION.has(module)) buckets.foundation += 1;
    else if (SPECIALIZED.has(module)) buckets.specialized += 1;
    else if (CROSS_CUTTING.has(module)) buckets["cross-cutting"] += 1;
    else buckets.other += 1;
  }
  return { ...buckets, total: result.eligibleQuestionIds.filter(native).length, iterations: result.iterations };
}

test("08B.3 C1 + 08D.1 + 08E.1: production bank has 85 questions (80 + 3 targeted evidence + 2 final completion); golden confirmations remain fixture-only", () => {
  assert.equal(productionQuestions.length, 85);
  assert.equal(GOLDEN_QUESTIONS_V2.length, 15);
  assert.equal(GOLDEN_QUESTIONS_V2.find((question) => question.id === "q2_confirm_hybrid_friction") !== undefined, true);
  assert.equal(GOLDEN_QUESTIONS_V2.find((question) => question.id === "q2_confirm_primary_friction") !== undefined, true);
  assert.equal(productionQuestions.some((question) => question.id === "q2_confirm_hybrid_friction"), false);
  assert.equal(productionQuestions.some((question) => question.id === "q2_confirm_primary_friction"), false);
  assert.deepEqual(validateQuestionBankV2(productionQuestions), []);
});

test("08B.3 C1: module registry coverage is explicit and owned counts are recorded", () => {
  const owned = Object.fromEntries(MODULE_REGISTRY.map((module) => [module.id, productionQuestions.filter((question) => question.module === module.id).length]));
  assert.deepEqual(owned, { core: 2, classification: 5, maturity: 5, goal_friction: 2, local: 4, appointments: 6, local_service: 5, professional: 4, retail: 3, ecommerce: 7, hospitality: 4, b2b: 6, creator: 5, nonprofit: 4, startup: 6, operations: 7, follow_up: 3, measurement: 3, confirmation: 0, reputation: 1, conversion: 1, presence: 2 });
  assert.ok(owned.startup! >= 4 && owned.startup! <= 6);
});

test("08B.3 C1 + 08D.1 + 08E.1: all 17 route-pressure fixtures are measurable; worst native eligible case is 25 (material-only scopes excluded)", () => {
  const report = Object.fromEntries(Object.entries(contexts).map(([name, answers]) => [name, pressure(answers)]));
  assert.equal(Object.keys(report).length, 17);
  assert.ok(Object.values(report).every((entry) => entry.total > 0));
  const worst = pressure({ q2_delivery: "scheduled", q2_has_customers: "yes", q2_regularity: "regular", q2_goal: "measure", q2_friction: "operations" });
  assert.equal(worst.total, 25);
  // 08D.1: the operations fixture gains the two readiness questions (eligible pressure, not route length).
  // 08E.1: counted natively the maximum is 20; the earlier 21 included a material-only question.
  assert.equal(Math.max(...Object.values(report).map((entry) => entry.total)), 20);
  assert.ok(Object.values(report).every((entry) => entry.iterations <= 2));
});

test("08B.3 C1: readiness, unknown/N-A, multi-choice and dimension coverage are auditable", () => {
  const readiness = { contextRouting: 0, diagnosticEvidence: 0, scoringReady: 0, futureConfirmation: 0 };
  const dimensions = new Map<string, number>();
  let unknown = 0;
  let notApplicable = 0;
  let multi = 0;
  for (const question of productionQuestions) {
    if (question.type === "multi") multi += 1;
    if (question.options.some((option) => option.kind === "unknown")) unknown += 1;
    if (question.options.some((option) => option.kind === "not_applicable")) notApplicable += 1;
    if (question.purpose.includes("confirmation")) readiness.futureConfirmation += 1;
    else if ((question.scoringReadiness?.candidateDimensions.length ?? 0) > 0) {
      readiness.scoringReady += 1;
      for (const dimension of question.scoringReadiness!.candidateDimensions) dimensions.set(dimension, (dimensions.get(dimension) ?? 0) + 1);
    } else if (question.purpose.some((purpose) => ["anchor", "classification", "maturity", "goal"].includes(purpose))) readiness.contextRouting += 1;
    else readiness.diagnosticEvidence += 1;
  }
  assert.deepEqual(readiness, { contextRouting: 15, diagnosticEvidence: 9, scoringReady: 61, futureConfirmation: 0 });
  assert.equal(unknown, 64);
  assert.equal(notApplicable, 6);
  assert.equal(multi, 2);
  assert.deepEqual(Object.fromEntries(dimensions), { claridad: 15, presencia: 6, alcance: 15, confianza: 4, contacto: 12, seguimiento: 24 });
});

test("mutations A-L: idea safety, variants, hints, reachability, friction, hybrid guard and QBV2 inactivity", () => {
  // A/B/C: project/prelaunch copy and mature evidence are not leaked; health wording is variant-gated.
  const idea = resolveEligibleQuestionsV2({ q2_entity: "project", q2_has_customers: "no", q2_goal: "measure" }, productionQuestions);
  assert.deepEqual(idea.eligibleQuestionIds.filter((id) => /reputation|repeat|noshow|cart|measurement|handoff|pipeline/i.test(id)), []);
  const projectCopy = productionQuestions.filter((q) => q.module === "startup").flatMap((q) => [q.prompt, q.helper, ...q.options.map((o) => o.label)]).join(" ").toLowerCase();
  assert.ok(!projectCopy.includes("requiere una empresa") && !projectCopy.includes("exige una empresa"));
  assert.ok(GOLDEN_QUESTIONS_V2.find((q) => q.id === "q2_appointments_noshow")!.variants?.some((variant) => "nicheGroup" in variant.target));
  // D/E/F/G: hints are not rules; all production questions are reachable in representative routes; unknown/N-A are bounded.
  assert.equal(NICHE_REGISTRY.some((entry) => entry.archetypeHints.includes("startup" as never)), false);
  assert.equal(productionQuestions.filter((q) => q.options.some((o) => o.kind === "unknown")).length, 64);
  assert.equal(productionQuestions.filter((q) => q.options.some((o) => o.kind === "not_applicable")).length, 6);
  let seed = 0x12345678;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  const reachable = new Set<string>();
  for (let iteration = 0; iteration < 20_000; iteration += 1) {
    const answers: Record<string, string | readonly string[]> = {};
    for (const question of productionQuestions) {
      if (random() >= 0.25) continue;
      if (question.type === "multi") {
        const values = question.options.filter(() => random() < 0.25).map((option) => option.value);
        if (values.length > 0) answers[question.id] = values;
      } else answers[question.id] = question.options[Math.floor(random() * question.options.length)]!.value;
    }
    for (const id of resolveEligibleQuestionsV2(answers, productionQuestions).eligibleQuestionIds) reachable.add(id);
  }
  assert.equal(reachable.size, productionQuestions.length, `preguntas productivas inalcanzables: ${productionQuestions.filter((q) => !reachable.has(q.id)).map((q) => q.id).join(", ")}`);
  // H/I/J/K/L: no secondary monetization, hybrid composition remains synthetic/future, no orphan, friction is allowlisted, version 1.
  assert.equal(JSON.stringify(productionQuestions).includes('"slot":"secondary"'), false);
  const frictionMappings = productionQuestions.flatMap((question) => question.options.flatMap((option) => (option.produces ?? []).filter((production) => production.kind === "friction").map((production) => `${question.id}.${option.value}->${production.value}`))).sort();
  assert.deepEqual(frictionMappings, [
    "q2_appointments_booking_friction.often->conversion",
    "q2_appointments_booking_method.informal->operations",
    "q2_appointments_confirmation_reminders.none->follow_up",
    "q2_appointments_lead_to_booking.few->conversion",
    "q2_appointments_noshow.often->operations",
    "q2_b2b_pipeline.no->follow_up",
    "q2_b2b_qualification.no->conversion",
    "q2_b2b_status_visibility.lose_track->operations",
    "q2_ecommerce_cart_followup.rarely->follow_up",
    "q2_ecommerce_checkout_friction.often->conversion",
    "q2_friction.conversion->conversion",
    "q2_friction.follow_up->follow_up",
    "q2_friction.operations->operations",
    "q2_friction.scale->scale",
    "q2_friction.trust->trust",
    "q2_friction.visibility->visibility",
    "q2_hospitality_reservation_noshow.often->operations",
    "q2_nonprofit_donation_clarity.no->conversion",
    "q2_professional_followup_after_consult.rarely_never->follow_up",
    "q2_service_quote_followup.rarely->follow_up",
    "q2_service_response_speed.some_lost->follow_up",
  ]);
  assert.equal(validateQuestionBankV2(productionQuestions).some((issue) => issue.code === "ORPHAN_QUESTION"), false);
  assert.equal(CURRENT_QUESTION_BANK_VERSION, 1);
});
