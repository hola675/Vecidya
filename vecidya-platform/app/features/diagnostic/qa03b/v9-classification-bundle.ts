import type { AnswersV2 } from "../qbv2-rules";
import { NICHE_REGISTRY } from "../taxonomy";
import { resolveEligibleQuestionsV2 } from "./engine";
import { buildCandidateQuestionPlanFromBankV3, type CandidateQuestionPlanV3 } from "./v9-candidate-planner";
import { QA03B_CANDIDATE_SECTOR_V4, QA03B_SPECIALTY_SELECTORS_V1 } from "./specialty-candidate-bank";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 } from "./specialty-branches-wave1";

/**
 * V9 PROTOTYPE ONLY.
 *
 * A user can choose sector + specialty in one visible classification interaction.
 * The engine still receives explicit answer IDs; no niche is inferred from sector.
 * This module is deliberately not imported by the public V8 session or Worker.
 */
export const QA03B_V9_CLASSIFICATION_INTERACTION_ID = "qa03b-v9-sector-specialty-v1" as const;

export type ClassificationSelectionV9 = {
  readonly sector: string;
  readonly niche?: string;
};

export type ClassificationInteractionEventV9 = {
  readonly kind: typeof QA03B_V9_CLASSIFICATION_INTERACTION_ID;
  readonly sector: string;
  readonly niche?: string;
  readonly sectorQuestionId: "q2_sector";
  readonly nicheQuestionId?: string;
};

export type ClassificationApplyResultV9 =
  | { readonly ok: true; readonly answers: AnswersV2; readonly event: ClassificationInteractionEventV9 }
  | { readonly ok: false; readonly reason: "invalid_sector" | "invalid_niche" | "niche_required_for_sector" | "niche_not_available_for_sector" };

const sectorValues = new Set(QA03B_CANDIDATE_SECTOR_V4.options.map((option) => option.value));
const selectorBySector = new Map(
  QA03B_SPECIALTY_SELECTORS_V1.map((question) => [question.id.replace("q2_niche_", ""), question] as const),
);

export function applyClassificationInteractionV9(
  currentAnswers: AnswersV2,
  selection: ClassificationSelectionV9,
): ClassificationApplyResultV9 {
  if (!sectorValues.has(selection.sector)) return { ok: false, reason: "invalid_sector" };

  const selector = selectorBySector.get(selection.sector);
  if (selector && selection.niche === undefined) return { ok: false, reason: "niche_required_for_sector" };
  if (selection.niche !== undefined) {
    if (!selector) return { ok: false, reason: "niche_not_available_for_sector" };
    const allowed = selector.options.some((option) => option.value === selection.niche);
    if (!allowed) return { ok: false, reason: "invalid_niche" };
    const concrete = NICHE_REGISTRY.find((item) => item.id === selection.niche);
    if (concrete && concrete.group !== selection.sector) return { ok: false, reason: "invalid_niche" };
  }

  // Changing sector is authoritative: remove every previous specialty answer.
  const next: Record<string, string | readonly string[]> = Object.fromEntries(
    Object.entries(currentAnswers).filter(([id]) => !id.startsWith("q2_niche_")),
  );
  next.q2_sector = selection.sector;

  const nicheQuestionId = selection.niche !== undefined && selector ? selector.id : undefined;
  if (nicheQuestionId && selection.niche !== undefined) next[nicheQuestionId] = selection.niche;

  // R5 eligibility removes stale answers from a previous sector/specialty branch.
  const answers = resolveEligibleQuestionsV2(next, QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2).activeAnswers;
  return {
    ok: true,
    answers,
    event: {
      kind: QA03B_V9_CLASSIFICATION_INTERACTION_ID,
      sector: selection.sector,
      ...(selection.niche === undefined ? {} : { niche: selection.niche }),
      sectorQuestionId: "q2_sector",
      ...(nicheQuestionId === undefined ? {} : { nicheQuestionId }),
    },
  };
}

export function replayClassificationInteractionsV9(
  initialAnswers: AnswersV2,
  events: readonly ClassificationInteractionEventV9[],
): AnswersV2 | null {
  let answers = initialAnswers;
  for (const event of events) {
    if (event.kind !== QA03B_V9_CLASSIFICATION_INTERACTION_ID) return null;
    if (event.sectorQuestionId !== "q2_sector") return null;
    const result = applyClassificationInteractionV9(answers, {
      sector: event.sector,
      ...(event.niche === undefined ? {} : { niche: event.niche }),
    });
    if (!result.ok) return null;
    if (result.event.nicheQuestionId !== event.nicheQuestionId) return null;
    answers = result.answers;
  }
  return answers;
}

/**
 * Counts visible interactions rather than raw answer keys.
 * A current sector+niche pair recorded atomically saves exactly one interaction.
 */
export function countVisibleInteractionsV9(
  activeAnswers: AnswersV2,
  events: readonly ClassificationInteractionEventV9[],
): number {
  let count = Object.keys(activeAnswers).length;
  const currentSector = activeAnswers.q2_sector;
  // Only the final classification event can justify bundling the current answers.
  // An older matching sector must not grant a discount after a later sector change.
  const latest = events[events.length - 1];
  if (!latest || latest.kind !== QA03B_V9_CLASSIFICATION_INTERACTION_ID || latest.sectorQuestionId !== "q2_sector" || latest.sector !== currentSector) return count;
  if (!latest.niche || !latest.nicheQuestionId) return count;
  const selector = selectorBySector.get(latest.sector);
  if (!selector || selector.id !== latest.nicheQuestionId) return count;
  if (!selector.options.some((option) => option.value === latest.niche)) return count;
  if (activeAnswers[latest.nicheQuestionId] !== latest.niche) return count;
  // Only a genuine pair of explicit answers can be counted as one interaction.
  if (!Object.prototype.hasOwnProperty.call(activeAnswers, "q2_sector")) return count;
  if (!Object.prototype.hasOwnProperty.call(activeAnswers, latest.nicheQuestionId)) return count;
  return Math.max(0, count - 1);
}

export function buildCandidateQuestionPlanV9Prototype(
  answers: AnswersV2,
  classificationEvents: readonly ClassificationInteractionEventV9[],
  historicalInteractionCount?: number,
): { readonly plan: CandidateQuestionPlanV3; readonly visibleInteractionCount: number; readonly activeAnswers: AnswersV2 } {
  const activeAnswers = resolveEligibleQuestionsV2(answers, QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2).activeAnswers;
  const visibleInteractionCount = Math.max(
    countVisibleInteractionsV9(activeAnswers, classificationEvents),
    Math.max(0, historicalInteractionCount ?? 0),
  );
  const plan = buildCandidateQuestionPlanFromBankV3(
    { answers: activeAnswers, answeredInteractionCount: visibleInteractionCount },
    QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2,
    "utility_first",
  );
  return { plan, visibleInteractionCount, activeAnswers };
}
