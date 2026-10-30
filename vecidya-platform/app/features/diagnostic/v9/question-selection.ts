/**
 * V9 standalone selection boundary.
 *
 * The caller supplies eligibility resolved by the graph; this module never
 * imports QBV2, invents context, scores answers, or silently expands an interview.
 * Candidates must arrive in the graph's reviewed priority/dependency order.
 */
export const V9_STANDARD_QUESTION_LIMIT = 24;
export const V9_EXTENDED_QUESTION_LIMIT = 29;

export type V9EligibilityCandidate = {
  readonly id: string;
  /** True only after the graph has evaluated applicable rules and context. */
  readonly eligible: boolean;
  /** Graph is waiting for facts: never turn uncertainty into definitive ineligibility. */
  readonly pending?: boolean;
};

export type V9SelectionSkipReason =
  | "not_eligible"
  | "pending_dependencies"
  | "already_presented"
  | "budget_exhausted";

export type V9SelectionResult = {
  readonly limit: number;
  readonly presentedCount: number;
  readonly remainingBeforeSelection: number;
  readonly selectedIds: readonly string[];
  readonly skipped: readonly { readonly id: string; readonly reason: V9SelectionSkipReason }[];
};

/**
 * Deterministic bounded selection, without changing graph ordering or eligibility.
 * "Presented" includes skipped/unanswered questions so neither consumes twice.
 * The 29-question exception requires an explicit affirmative consent.
 */
export function selectV9Questions(
  candidates: readonly V9EligibilityCandidate[],
  presentedQuestionIds: readonly string[],
  extendedInterviewConsented = false,
): V9SelectionResult {
  const limit = extendedInterviewConsented ? V9_EXTENDED_QUESTION_LIMIT : V9_STANDARD_QUESTION_LIMIT;
  const presented = new Set(presentedQuestionIds);
  const remainingBeforeSelection = Math.max(0, limit - presented.size);
  const encountered = new Set<string>();
  const selectedIds: string[] = [];
  const skipped: { id: string; reason: V9SelectionSkipReason }[] = [];

  for (const question of candidates) {
    if (!question.id.trim()) throw new Error("V9 selection candidate must have a nonempty id");
    if (encountered.has(question.id)) throw new Error(`V9 selection received duplicate question id: ${question.id}`);
    encountered.add(question.id);

    if (question.pending && question.eligible) throw new Error(`V9 question cannot be eligible and pending: ${question.id}`);

    if (presented.has(question.id)) {
      skipped.push({ id: question.id, reason: "already_presented" });
    } else if (question.pending) {
      skipped.push({ id: question.id, reason: "pending_dependencies" });
    } else if (!question.eligible) {
      skipped.push({ id: question.id, reason: "not_eligible" });
    } else if (selectedIds.length >= remainingBeforeSelection) {
      skipped.push({ id: question.id, reason: "budget_exhausted" });
    } else {
      selectedIds.push(question.id);
    }
  }
  return { limit, presentedCount: presented.size, remainingBeforeSelection, selectedIds, skipped };
}
