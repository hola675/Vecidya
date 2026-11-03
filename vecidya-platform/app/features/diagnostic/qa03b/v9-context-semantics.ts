/** V9-only interpretation boundary. No QBV2 imports or side effects. */
export type V9ActivityStatus = "preparing" | "operating" | "paused" | "unknown";
export type V9AnswerState = "answered" | "unknown" | "unanswered" | "not_applicable";

/** Historical customer experience does not prove that the business operates today. */
export function classifyV9Activity(status: V9ActivityStatus, hasCustomers: "yes" | "no" | "unknown") {
  return {
    status,
    hasHistoricalCustomers: hasCustomers === "yes" ? true : hasCustomers === "no" ? false : null,
    canAssertCurrentOperation: status === "operating",
    canAssertHistoricalDemand: hasCustomers === "yes",
  } as const;
}

/** The existing trend/capacity questions require a regular activity answer.
 * This function reports that existing gate, without changing the public bank. */
export function evaluateV9TrendCapacityGate(regularity: "regular" | "irregular" | "unknown" | undefined) {
  if (regularity === "regular") return { eligible: true, reason: "regular_activity" } as const;
  if (regularity === "irregular") return { eligible: false, reason: "irregular_activity_requires_review" } as const;
  return { eligible: false, reason: "insufficient_regularity_evidence" } as const;
}

/** No unknown/absent answer may be treated as negative evidence. */
export function interpretV9AnswerState(answer: string | undefined, isApplicable: boolean): V9AnswerState {
  if (!isApplicable) return "not_applicable";
  if (answer === undefined) return "unanswered";
  return answer === "unknown" ? "unknown" : "answered";
}

/** Distinguish a neutral selected option from a question that was not applicable. */
export function interpretV9SelectedOption(
  answer: string | undefined,
  isApplicable: boolean,
  optionKind: "unknown" | "not_applicable" | string | undefined,
): V9AnswerState {
  const state = interpretV9AnswerState(answer, isApplicable);
  if (state !== "answered") return state;
  if (optionKind === "not_applicable") return "not_applicable";
  if (optionKind === "unknown") return "unknown";
  return state;
}

/** Evidence boundary: missing and neutral answers never contribute negative evidence. */
export function classifyV9EvidenceContribution(state: V9AnswerState): "evaluate" | "uncertainty" | "skip" {
  if (state === "answered") return "evaluate";
  if (state === "unknown") return "uncertainty";
  return "skip";
}
