import type { QuestionDefinitionV2 } from "../qbv2-contract";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 } from "./specialty-branches-wave1";

/**
 * P1d experimental contract ONLY. Not included in the public bank or V9 candidate
 * registry. Historical v1 answers must be interpreted with the v1 definition.
 * Activation requires a version-aware session migration and approval.
 */
const legacy = QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2.find(
  (question) => question.id === "q2_food_menu_visibility",
);
if (!legacy || legacy.version !== 1 || !legacy.evidenceV3) {
  throw new Error("Expected immutable menu visibility v1 baseline");
}

export const QA03B_FOOD_MENU_VISIBILITY_V2_PROPOSAL: QuestionDefinitionV2 = {
  ...legacy,
  version: 2,
  hint: "Revisa qué puede ver una persona nueva en tu web, Google o redes antes de contactarte. Si no publicas el menú, indícalo.",
  options: [
    ...legacy.options.filter((option) => option.value !== "not_applicable"),
    { value: "not_published", label: "No publico ningún menú ni selección de mi oferta en internet" },
  ],
  evidenceV3: {
    ...legacy.evidenceV3,
    questionVersion: 2,
    dimensions: legacy.evidenceV3.dimensions.map((dimension) => ({
      ...dimension,
      answers: {
        ...Object.fromEntries(Object.entries(dimension.answers).filter(([value]) => value !== "not_applicable")),
        not_published: "weak" as const,
      },
    })),
  },
};
