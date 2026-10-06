import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { REVIEWED_CONTEXT_QUESTIONS_V2 } from "./qbv2-reviewed-context";
import { REVIEWED_CLASSIFICATION_QUESTIONS_V2 } from "./qbv2-reviewed-classification";
import { REVIEWED_FOUNDATION_QUESTIONS_V2 } from "./qbv2-reviewed-foundation";

/** Unregistered R2A+R2B migration candidate; production still uses QUESTION_BANK_V2. */
export const REVIEWED_CANDIDATE_QUESTIONS_V2: readonly QuestionDefinitionV2[] = [
  ...REVIEWED_FOUNDATION_QUESTIONS_V2,
  ...REVIEWED_CONTEXT_QUESTIONS_V2,
  ...REVIEWED_CLASSIFICATION_QUESTIONS_V2,
];
