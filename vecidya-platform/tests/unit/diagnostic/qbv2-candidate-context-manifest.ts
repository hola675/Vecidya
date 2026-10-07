import { CANONICAL_CASES_V3 } from "./qbv2-candidate-canonical-cases";
import { runCanonicalRouteV3 } from "./qbv2-candidate-case-runner";

/**
 * DIAG-V3-R7-A.1 context-only / later-review coverage manifest. Closes the R7-A QA-bookkeeping gap: every
 * CONTEXT_ONLY and LATER_REVIEW question (R3-FINAL ledger authority, frozen — never reclassified here) gets
 * an explicit, executable disposition, and every authored-but-never-active answer gets an explicit audit
 * entry. This file asserts nothing about calibration and changes no production diagnostic behavior.
 */

export const CONTEXT_ONLY_QUESTION_IDS_V3 = [
  "q2_entity",
  "q2_other_staff",
  "q2_monetization",
  "q2_delivery",
  "q2_has_customers",
  "q2_regularity",
  "q2_demand_trend",
  "q2_goal",
  "q2_friction",
  "q2_appointments_noshow",
  "q2_ecommerce_traffic_sources",
  "q2_sector",
  "q2_customer_reach",
  "q2_customer_buyer",
  "q2_capacity_signal",
] as const;

export const LATER_REVIEW_QUESTION_IDS_V3 = ["q2_appointments_lead_to_booking", "q2_creator_audience_ownership"] as const;

export type ContextDisposition = "EXERCISED_AS_CONTEXT" | "ROUTING_ONLY" | "NOT_REACHED_BY_CANONICAL_SET";

/**
 * Semantic intent that cannot be derived from asked/unused counts alone: a field asked in every case can
 * still be either pure narrative context (EXERCISED_AS_CONTEXT) or a routing gate that unlocks another
 * question's eligibility (ROUTING_ONLY). The NOT_REACHED_BY_CANONICAL_SET branch below is derived, not
 * declared here: any id never asked by any canonical case falls into it automatically.
 */
const ROUTING_ROLE: Partial<Record<string, string>> = {
  q2_other_staff: "Unlocks q2_operations_handoffs eligibility when a second staff member is reported.",
  q2_delivery: "Resolves the archetype (retail/ecommerce/appointments/...) that gates most specialized questions.",
  q2_has_customers: "Resolves prelaunch vs. active, which gates most of the specialized question set.",
  q2_regularity: "Contributes to activity resolution, which gates most of the specialized question set.",
  q2_customer_buyer: "Gates the b2b-specific module (q2_b2b_pipeline, q2_b2b_status_visibility).",
  q2_appointments_noshow: "Gates q2_appointments_confirmation_reminders eligibility.",
  q2_appointments_lead_to_booking: "Gates q2_appointments_booking_friction eligibility.",
};

const CONTEXT_ROLE: Partial<Record<string, string>> = {
  q2_entity: "Structural classification context (individual/business/organization/project).",
  q2_monetization: "Structural classification context (how the business earns).",
  q2_goal: "Priority relevance/ordering only — never capability evidence, never a direct solution or license premise.",
  q2_friction: "Priority ordering only — never capability evidence.",
  q2_sector: "Niche/vertical classification context.",
  q2_customer_reach: "Structural classification context (geographic reach).",
  q2_demand_trend: "Declared trend context; never selected by the certified planner given this canonical set's routing needs.",
  q2_capacity_signal: "Declared capacity context; never selected by the certified planner given this canonical set's routing needs.",
  q2_ecommerce_traffic_sources: "Declared acquisition-channel context; must never become Discovery/Foundation evidence or channel-failure proof.",
  q2_creator_audience_ownership: "Creator-specific relationship context; zero V3 capability evidence by design (R3-FINAL ledger).",
};

export interface ContextManifestRow {
  questionId: string;
  disposition: ContextDisposition;
  askedCases: string[];
  unusedAuthoredCases: string[];
  role: string;
}

export function buildContextManifestV3(ids: readonly string[]): ContextManifestRow[] {
  const askedCases = new Map(ids.map((id) => [id, [] as string[]]));
  const unusedCases = new Map(ids.map((id) => [id, [] as string[]]));
  for (const caseDef of CANONICAL_CASES_V3) {
    const route = runCanonicalRouteV3(caseDef);
    for (const id of ids) {
      if (route.finalAnswers[id] !== undefined) askedCases.get(id)!.push(caseDef.id);
      else if (Object.prototype.hasOwnProperty.call(caseDef.answerScript, id)) unusedCases.get(id)!.push(caseDef.id);
    }
  }
  return ids.map((id) => {
    const asked = askedCases.get(id)!;
    const disposition: ContextDisposition = asked.length === 0 ? "NOT_REACHED_BY_CANONICAL_SET" : ROUTING_ROLE[id] ? "ROUTING_ONLY" : "EXERCISED_AS_CONTEXT";
    const role = ROUTING_ROLE[id] ?? CONTEXT_ROLE[id] ?? "Context only.";
    return { questionId: id, disposition, askedCases: asked, unusedAuthoredCases: unusedCases.get(id)!, role };
  });
}

export const CONTEXT_ONLY_MANIFEST_V3 = buildContextManifestV3(CONTEXT_ONLY_QUESTION_IDS_V3);
export const LATER_REVIEW_MANIFEST_V3 = buildContextManifestV3(LATER_REVIEW_QUESTION_IDS_V3);

// --- Unused authored answer disposition -------------------------------------------------------------

export type UnusedAnswerDisposition = "EXPECTED_EXTERNAL_INPUT" | "INTENTIONALLY_UNREACHED" | "STALE_INVALID" | "FIXTURE_ERROR";

export interface UnusedAnswerEntry {
  caseId: string;
  questionId: string;
  disposition: UnusedAnswerDisposition;
  rationale: string;
}

const UNUSED_RATIONALE: Record<string, string> = {
  q2_sector: "Eligible context field (skipReason: pending_evidence); this prelaunch case's route terminates without any rule keyed on sector.",
  q2_presence_digital_base:
    "Eligible direct digital_foundation source (skipReason: not_useful); no other question in this case's route depends on resolving it.",
  q2_other_staff: "Eligible context field (entity=individual); only unlocks q2_operations_handoffs, which this case's goal/friction never makes useful.",
  q2_demand_trend:
    "Eligible context field (skipReason: pending_evidence, reason: required_context) in every case; the certified planner never selects it given this canonical set's routing needs — not forced, per the no-coverage-inflation rule.",
  q2_capacity_signal: "Eligible context field; same planner behavior as q2_demand_trend — never selected given this canonical set's routing needs.",
  q2_reputation_flow:
    "Eligible direct trust_reputation source (skipReason: not_useful); trust_reputation is already closed by q2_professional_authority_signals, which is asked first in this case's route.",
  q2_appointments_rebooking:
    "Eligible direct relationship_recurrence source (skipReason: not_useful); relationship_recurrence is already closed by q2_appointments_confirmation_reminders. Isolated coverage for rebooking alone lives in C21.",
  q2_ecommerce_traffic_sources:
    "Eligible context field (skipReason: pending_evidence); never selected given this canonical set's routing needs — must never become Discovery/Foundation evidence.",
  q2_operations_information_base:
    "Eligible direct digital_readiness source (skipReason: not_useful); digital_readiness is already closed by q2_process_systemization, asked first in this case's route. Isolated coverage lives in C25.",
  q2_local_presence_consistency:
    "Eligible direct digital_foundation source (skipReason: not_useful); in this hybrid case digital_foundation is already closed by q2_ecommerce_product_discovery, asked first.",
};

const UNUSED_BY_CASE: Record<string, readonly string[]> = {
  C01: ["q2_sector", "q2_presence_digital_base"],
  C02: ["q2_other_staff", "q2_demand_trend", "q2_capacity_signal", "q2_reputation_flow"],
  C03: ["q2_other_staff", "q2_demand_trend", "q2_capacity_signal", "q2_reputation_flow"],
  C04: ["q2_demand_trend", "q2_capacity_signal"],
  C05: ["q2_demand_trend", "q2_capacity_signal", "q2_appointments_rebooking"],
  C06: ["q2_other_staff", "q2_demand_trend", "q2_capacity_signal"],
  C07: ["q2_demand_trend", "q2_capacity_signal"],
  C08: ["q2_demand_trend", "q2_capacity_signal", "q2_ecommerce_traffic_sources"],
  C09: ["q2_demand_trend", "q2_capacity_signal"],
  C10: ["q2_other_staff", "q2_demand_trend", "q2_capacity_signal"],
  C11: ["q2_demand_trend", "q2_capacity_signal"],
  C12: ["q2_demand_trend", "q2_capacity_signal", "q2_operations_information_base"],
  C13: ["q2_demand_trend", "q2_capacity_signal", "q2_local_presence_consistency", "q2_ecommerce_traffic_sources"],
  C14: ["q2_other_staff", "q2_demand_trend", "q2_capacity_signal", "q2_reputation_flow"],
  C15: ["q2_demand_trend", "q2_capacity_signal"],
  C16: [],
  C17: ["q2_other_staff", "q2_demand_trend", "q2_capacity_signal"],
  C18: ["q2_demand_trend", "q2_capacity_signal"],
  C19: ["q2_demand_trend", "q2_capacity_signal"],
  C20: ["q2_demand_trend", "q2_capacity_signal"],
  C21: ["q2_demand_trend", "q2_capacity_signal"],
  C22: ["q2_demand_trend", "q2_capacity_signal"],
  C23: ["q2_demand_trend", "q2_capacity_signal", "q2_operations_information_base"],
  C24: ["q2_demand_trend", "q2_capacity_signal"],
  C25: ["q2_demand_trend", "q2_capacity_signal"],
};

/**
 * Static judgment table: every (case, question) pair currently unused-authored in
 * `qbv2-candidate-canonical-cases.ts`, with its disposition and rationale. Every entry here is
 * INTENTIONALLY_UNREACHED — a confirmed, legitimate planner decision (verified via `plan.trace`
 * skipReason), never an authoring mistake. Any instance that was a genuine `FIXTURE_ERROR` (an authored
 * answer with no legitimate role given its case's own context) was removed from the fixture directly
 * rather than listed here — see CHANGELOG.md R7-A.1 entry for the corrections.
 */
export const UNUSED_ANSWER_DISPOSITIONS_V3: readonly UnusedAnswerEntry[] = Object.entries(UNUSED_BY_CASE).flatMap(([caseId, questionIds]) =>
  questionIds.map((questionId) => ({
    caseId,
    questionId,
    disposition: "INTENTIONALLY_UNREACHED" as const,
    rationale: UNUSED_RATIONALE[questionId] ?? "Eligible but never selected by the certified planner given this canonical set's routing needs.",
  })),
);
