import type { QuestionDefinitionV2 } from "../qbv2-contract";
import { andV2, archetypeIncludes, eqV2, inV2, orV2 } from "../qbv2-rules";
import { NICHE_REGISTRY } from "../taxonomy";
import { LOTE_C_QUESTIONS_V2 } from "../qbv2-lote-c";
import { LOTE_D_QUESTIONS_V2 } from "../qbv2-lote-d";
import { LOTE_F_QUESTIONS_V2 } from "../qbv2-lote-f";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "./bank";

/**
 * MIGRATION CANDIDATE ONLY — not imported by the public flow, the scorer or the
 * authoritative Worker. Activation requires a new bank/session/replay contract.
 *
 * Each selector captures a real niche signal from the existing taxonomy. We
 * restrict the choices to the explicitly declared q2_sector family. No niche,
 * archetype or business maturity is inferred when the answer is other/unknown.
 */
const SELECTOR_GROUPS = [
  "health_wellness",
  "beauty_personal_care",
  "financial_tax_insurance",
  "home_services",
  "automotive",
  "food_hospitality",
  "technology_software",
  "b2b_services",
] as const;

export const QA03B_SPECIALTY_SELECTORS_V1: readonly QuestionDefinitionV2[] = SELECTOR_GROUPS.map((group): QuestionDefinitionV2 => {
  const choices = NICHE_REGISTRY.filter((item) => item.group === group);
  if (choices.length < 2) throw new Error(`Specialty group ${group} needs multiple concrete niches`);
  return {
    id: `q2_niche_${group}`,
    version: 1,
    module: "classification",
    type: "single",
    routingRole: "adaptive",
    prompt: "¿Cuál de estas especialidades describe mejor lo que haces o planeas hacer?",
    hint: "Elige la más cercana. Si ninguna encaja, marca «Otra especialidad» sin cambiar la actividad principal.",
    purpose: ["classification", "routing"],
    priority: "normal",
    evidenceMigration: "pending",
    appliesWhen: eqV2("q2_sector", group),
    options: [
      ...choices.map((item) => ({
        value: item.id,
        label: item.label,
        produces: [{ kind: "niche" as const, value: item.id, provenance: "explicit_declaration" as const }],
      })),
      { value: "other", label: "Otra especialidad de este sector" },
      { value: "unknown", label: "Todavía no lo sé", kind: "unknown" as const },
    ],
  };
});

const find = (bank: readonly QuestionDefinitionV2[], id: string): QuestionDefinitionV2 => {
  const item = bank.find((question) => question.id === id);
  if (!item) throw new Error(`Historical specialty candidate not found: ${id}`);
  return item;
};

const startup = eqV2("q2_operational_status", "preparing");
const ecommerceOperating = andV2(
  eqV2("q2_operational_status", "operating"),
  eqV2("q2_has_customers", "yes"),
  archetypeIncludes("ecommerce"),
);
const nonprofitContext = orV2(eqV2("q2_entity", "organization"), eqV2("q2_monetization", "mission"));

/**
 * First evidence wave: recover semantics only where answers actually observe a
 * dimension. Stage/prelaunch validation never proves that a sale or capability
 * already exists. Routing-only questions do not acquire artificial scores.
 */
export const QA03B_RECOVERY_PILOT_V1: readonly QuestionDefinitionV2[] = [
  {
    ...find(LOTE_F_QUESTIONS_V2, "q2_startup_problem_clarity"),
    appliesWhen: startup,
    evidenceMigration: "migrated",
    evidenceV3: {
      questionId: "q2_startup_problem_clarity", questionVersion: 1,
      dimensions: [{ dimension: "clarity_positioning", directness: "direct", answers: {
        clear_audience_problem: "established",
        problem_clear_audience_unclear: "partial",
        audience_clear_problem_unclear: "partial",
        both_unclear: "weak",
        unknown: "uncertainty",
      } }],
    },
  },
  {
    ...find(LOTE_F_QUESTIONS_V2, "q2_startup_validation_evidence"),
    appliesWhen: startup,
    evidenceMigration: "migrated",
    evidenceV3: {
      questionId: "q2_startup_validation_evidence", questionVersion: 1,
      dimensions: [{ dimension: "clarity_positioning", directness: "supporting", answers: {
        none: "weak", conversations: "partial", problem_test: "partial",
        repeated_problem: "established", unknown: "uncertainty",
      } }],
    },
  },
  {
    ...find(LOTE_F_QUESTIONS_V2, "q2_startup_offer_readiness"),
    appliesWhen: startup,
    evidenceMigration: "migrated",
    evidenceV3: {
      questionId: "q2_startup_offer_readiness", questionVersion: 1,
      dimensions: [{ dimension: "clarity_positioning", directness: "direct", answers: {
        ready_to_test: "established", mostly_ready: "partial",
        shaping: "weak", not_defined: "weak", unknown: "uncertainty",
      } }],
    },
  },
  {
    ...find(LOTE_C_QUESTIONS_V2, "q2_ecommerce_checkout_friction"),
    appliesWhen: ecommerceOperating,
    evidenceMigration: "migrated",
    evidenceV3: {
      questionId: "q2_ecommerce_checkout_friction", questionVersion: 1,
      dimensions: [{ dimension: "conversion_access", directness: "direct", answers: {
        rarely: "established", sometimes: "partial", often: "weak", unknown: "uncertainty",
      } }],
    },
  },
  {
    ...find(LOTE_D_QUESTIONS_V2, "q2_nonprofit_support_type"),
    appliesWhen: andV2(eqV2("q2_operational_status", "operating"), nonprofitContext),
    evidenceMigration: "pending",
    evidenceV3: undefined,
  },
  {
    ...find(LOTE_D_QUESTIONS_V2, "q2_nonprofit_donation_clarity"),
    appliesWhen: andV2(
      eqV2("q2_operational_status", "operating"),
      nonprofitContext,
      inV2("q2_nonprofit_support_type", ["donations", "mixed"]),
    ),
    evidenceMigration: "migrated",
    evidenceV3: {
      questionId: "q2_nonprofit_donation_clarity", questionVersion: 1,
      dimensions: [{ dimension: "conversion_access", directness: "direct", answers: {
        yes_easy: "established", somewhat_confusing: "partial",
        no: "weak", unknown: "uncertainty",
      } }],
    },
  },
];

/** The sector expansion is v4 ONLY in the isolated candidate bank. Public v3 is untouched. */
export const QA03B_CANDIDATE_SECTOR_V4: QuestionDefinitionV2 = (() => {
  const original = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.find((q) => q.id === "q2_sector");
  if (!original) throw new Error("QA-03B sector classification missing");
  return {
    ...original,
    version: 4,
    options: [
      ...original.options.filter((option) => option.value !== "other" && option.value !== "unknown"),
      ...([
        ["ecommerce", "Comercio electrónico y tiendas online"],
        ["creator", "Creadores de contenido y proyectos basados en audiencia"],
        ["b2b_services", "Servicios especializados para empresas y organizaciones"],
        ["nonprofit_community", "Organizaciones sin fines de lucro y proyectos comunitarios"],
      ] as const).map(([value, label]) => ({
        value, label,
        produces: [{ kind: "nicheGroup" as const, value, provenance: "explicit_declaration" as const }],
      })),
      ...original.options.filter((option) => option.value === "other" || option.value === "unknown"),
    ],
  };
})();

export const QA03B_SPECIALTY_CANDIDATE_BANK_V1: readonly QuestionDefinitionV2[] = [
  ...REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.map((question) =>
    question.id === "q2_sector" ? QA03B_CANDIDATE_SECTOR_V4 : question),
  ...QA03B_SPECIALTY_SELECTORS_V1,
  ...QA03B_RECOVERY_PILOT_V1,
];

if (new Set(QA03B_SPECIALTY_CANDIDATE_BANK_V1.map((question) => question.id)).size
  !== QA03B_SPECIALTY_CANDIDATE_BANK_V1.length) {
  throw new Error("QA-03B specialty candidate has duplicate question IDs");
}
