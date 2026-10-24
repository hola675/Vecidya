import { buildCandidateQuestionPlanV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-planner";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { AUTHORED_JOURNEYS, AUTHORED_UNKNOWN_CAPABILITIES } from "./qa03b-fixtures";

const measurementAnswers = ["consistent", "partial", "none", "not_enough_activity", "unknown"] as const;
const authoredIfUnknown = (value: unknown, replacement: string | readonly string[]) =>
  value === undefined || value === "unknown" || (Array.isArray(value) && value.length === 1 && value[0] === "unknown") ? replacement : value;

/** 20 simulated journeys: 16 authored QA-03B journeys + 4 explicit boundary scenarios. */
export const QA03B_AUTHORED_CASES = [
  ...AUTHORED_JOURNEYS.map((journey, index) => ({
    id: journey.id,
    answers: {
      ...journey.answers,
      q2_customer_reach: authoredIfUnknown(journey.answers.q2_customer_reach, index % 2 ? "regional" : "local"),
      q2_discovery_reliable_reach: authoredIfUnknown(journey.answers.q2_discovery_reliable_reach, index % 3 ? "reliable" : "irregular"),
      q2_presence_digital_base: authoredIfUnknown(journey.answers.q2_presence_digital_base, index % 3 ? "reliable_presence" : "partial_presence"),
      q2_presence_offer_clarity: authoredIfUnknown(journey.answers.q2_presence_offer_clarity, index % 3 ? "clear" : "partial"),
      q2_measurement_practice: measurementAnswers[index % measurementAnswers.length],
    },
  })),
  { id: "operating-professional-no-history", answers: { ...AUTHORED_UNKNOWN_CAPABILITIES, q2_entity: "individual", q2_has_customers: "no", q2_operational_status: "operating", q2_regularity: "unknown", q2_measurement_practice: "not_enough_activity" } },
  { id: "preparing-hybrid-commerce", answers: { ...AUTHORED_UNKNOWN_CAPABILITIES, q2_entity: "business", q2_operational_status: "preparing", q2_delivery: ["retail", "online_checkout"], q2_monetization: "goods", q2_measurement_practice: "unknown" } },
  { id: "paused-nonprofit-beneficiaries", answers: { ...AUTHORED_UNKNOWN_CAPABILITIES, q2_entity: "organization", q2_monetization: "mission", q2_operational_status: "paused", q2_has_customers: "yes", q2_customer_buyer: "no_direct_purchase", q2_measurement_practice: "unknown" } },
  { id: "operating-hybrid-clinic", answers: { ...AUTHORED_UNKNOWN_CAPABILITIES, q2_entity: "business", q2_monetization: "services", q2_operational_status: "operating", q2_has_customers: "yes", q2_customer_buyer: "mixed", q2_sector: "health_wellness", q2_delivery: ["physical_location", "appointments", "remote_service"], q2_buyer_recipient_relation: "third_party", q2_measurement_practice: "partial" } },
] satisfies readonly { readonly id: string; readonly answers: AnswersV2 }[];

export function runQA03BAuthoredRoute(id: string, authored: AnswersV2) {
  let answers: AnswersV2 = {};
  const asked: { id: string; answer: string | readonly string[] }[] = [];
  for (let turn = 0; turn < 30; turn += 1) {
    const plan = buildCandidateQuestionPlanV3({ answers });
    answers = plan.activeAnswers;
    const questionId = plan.nextQuestionId;
    if (!questionId) return { answers, asked, plan };
    const response = authored[questionId];
    if (response === undefined) throw new Error(`${id}: missing authored response for ${questionId}; no defaults are allowed`);
    if (asked.some((item) => item.id === questionId)) throw new Error(`${id}: repeated question ${questionId}`);
    answers = { ...answers, [questionId]: response };
    asked.push({ id: questionId, answer: response });
  }
  throw new Error(`${id}: route exceeded 30 questions`);
}
