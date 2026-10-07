import { buildCandidateQuestionPlanV3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import type { CandidateQuestionPlanV3 } from "../../../app/features/diagnostic/qbv2-candidate-planner";

/**
 * DIAG-V3-R7-A canonical case identity — a test-only label, never a runtime/version contract.
 * Does not change CURRENT_DIAGNOSTIC_VERSION/CURRENT_QUESTION_BANK_VERSION/CURRENT_ROUTING_VERSION/
 * CURRENT_SCORING_VERSION/CURRENT_RESULT_SCHEMA_VERSION/ADAPTIVE_PLANNER_VERSION.
 */
export const CANONICAL_CASE_IDENTITY_V3 = "diag-v3-canonical-cases-v1" as const;

export type CanonicalCaseV3 = {
  readonly id: string;
  readonly description: string;
  /** Every answer is an intentional, explicitly authored choice — never a generated/default/fallback value. */
  readonly answerScript: Readonly<Record<string, string | readonly string[]>>;
};

export type CanonicalRouteResultV3 = {
  readonly asked: readonly { readonly id: string; readonly answer: string | readonly string[] }[];
  readonly finalAnswers: AnswersV2;
  readonly plan: CandidateQuestionPlanV3;
  readonly unusedAuthoredAnswers: readonly string[];
};

const HARD_STOP = 30;

/**
 * Interactive one-question-per-turn route runner (R7-A §10-11). Never batches `selectedQuestionIds`, never
 * falls back to a default/first/random option: if the planner asks a question the case did not explicitly
 * author, the run fails loudly rather than silently inventing a trajectory.
 */
export function runCanonicalRouteV3(caseDef: CanonicalCaseV3): CanonicalRouteResultV3 {
  let answers: AnswersV2 = {};
  const asked: { id: string; answer: string | readonly string[] }[] = [];
  for (let turn = 0; turn < HARD_STOP; turn += 1) {
    const plan = buildCandidateQuestionPlanV3({ answers });
    answers = plan.activeAnswers;
    if (!plan.nextQuestionId) {
      const unusedAuthoredAnswers = Object.keys(caseDef.answerScript).filter((id) => answers[id] === undefined);
      return { asked, finalAnswers: answers, plan, unusedAuthoredAnswers };
    }
    const id = plan.nextQuestionId;
    const answer = caseDef.answerScript[id];
    if (answer === undefined) {
      throw new Error(`Canonical case ${caseDef.id}: planner asked ${id}, which has no authored answer. Asked so far: ${asked.map((item) => item.id).join(", ")}`);
    }
    answers = { ...answers, [id]: answer };
    asked.push({ id, answer });
  }
  throw new Error(`Canonical case ${caseDef.id}: route did not terminate within ${HARD_STOP} turns.`);
}
