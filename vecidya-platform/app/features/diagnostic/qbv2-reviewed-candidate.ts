import type { QuestionDefinitionV2 } from "./qbv2-contract";
import { REVIEWED_CONTEXT_QUESTIONS_V2 } from "./qbv2-reviewed-context";
import { REVIEWED_CLASSIFICATION_QUESTIONS_V2 } from "./qbv2-reviewed-classification";
import { REVIEWED_FOUNDATION_QUESTIONS_V2 } from "./qbv2-reviewed-foundation";
import { REVIEWED_OPERATIONAL_CONTEXT_QUESTIONS_V2 } from "./qbv2-reviewed-operational-context";
import { REVIEWED_SPECIALIZED_ENTRY_QUESTIONS_V2 } from "./qbv2-reviewed-specialized-entry";
import { REVIEWED_DISCOVERY_QUESTIONS_V2 } from "./qbv2-reviewed-discovery";
import { REVIEWED_LOCAL_TRUST_QUESTIONS_V2 } from "./qbv2-reviewed-local-trust";
import { REVIEWED_LOCAL_APPOINTMENTS_PROFESSIONAL_QUESTIONS_V2 } from "./qbv2-reviewed-local-appointments-professional";
import { REVIEWED_COMMERCE_QUESTIONS_V2 } from "./qbv2-reviewed-commerce";

/** Unregistered R2A–R2E migration candidate; production still uses QUESTION_BANK_V2. */
export const REVIEWED_CANDIDATE_QUESTIONS_V2: readonly QuestionDefinitionV2[] = [
  ...REVIEWED_FOUNDATION_QUESTIONS_V2,
  ...REVIEWED_CONTEXT_QUESTIONS_V2,
  ...REVIEWED_SPECIALIZED_ENTRY_QUESTIONS_V2,
  ...REVIEWED_CLASSIFICATION_QUESTIONS_V2,
  ...REVIEWED_OPERATIONAL_CONTEXT_QUESTIONS_V2,
  ...REVIEWED_DISCOVERY_QUESTIONS_V2,
  ...REVIEWED_LOCAL_TRUST_QUESTIONS_V2,
  ...REVIEWED_LOCAL_APPOINTMENTS_PROFESSIONAL_QUESTIONS_V2,
  ...REVIEWED_COMMERCE_QUESTIONS_V2,
];
