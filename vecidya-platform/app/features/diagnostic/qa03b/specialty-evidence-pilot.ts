import type { QuestionDefinitionV2, QuestionVersionV2 } from "../qbv2-contract";
import { andV2, eqV2 } from "../qbv2-rules";
import type { MigratedAnswerStateV3, QuestionEvidenceV3 } from "../qbv2-evidence-v3";

/**
 * Candidate-only niche evidence pilot.
 *
 * These questions exist only where the niche materially changes what can be
 * observed. They are not imported by the public 45-question bank, session V8
 * or Worker replay.
 */
const operatingWithHistory = andV2(
  eqV2("q2_operational_status", "operating"),
  eqV2("q2_has_customers", "yes"),
);

const evidence = (
  questionId: string,
  dimension: "measurement_optimization" | "relationship_recurrence",
  answers: Readonly<Record<string, MigratedAnswerStateV3>>,
) : QuestionEvidenceV3 => ({
  questionId,
  questionVersion: 1 as QuestionVersionV2,
  dimensions: [{ dimension, directness: "direct" as const, answers }],
});

export const QA03B_SPECIALTY_EVIDENCE_EXPERIMENTS_V1: readonly QuestionDefinitionV2[] = [
  {
    id: "q2_specialty_software_activation",
    version: 1,
    module: "measurement",
    type: "single",
    routingRole: "adaptive",
    prompt: "Cuando una persona empieza a usar o probar tu software, ¿puedes saber si completa la acción principal que demuestra que obtuvo valor?",
    hint: "Piensa en una acción observable dentro del producto. Si tu proceso no incluye uso o prueba antes de contratar, marca que no aplica.",
    purpose: ["diagnostic"],
    priority: "normal",
    evidenceMigration: "migrated",
    appliesWhen: andV2(operatingWithHistory, eqV2("q2_niche_technology_software", "software_startup")),
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: true },
    evidenceV3: evidence("q2_specialty_software_activation", "measurement_optimization", {
      clearly_tracked: "established",
      partially_tracked: "partial",
      not_tracked: "weak",
      not_applicable: "not_applicable",
      unknown: "uncertainty",
    }),
    options: [
      { value: "clearly_tracked", label: "Sí, puedo verlo claramente" },
      { value: "partially_tracked", label: "Solo en algunos casos o con datos incompletos" },
      { value: "not_tracked", label: "No, hoy no puedo saberlo con confianza" },
      { value: "not_applicable", label: "No aplica: no existe ese uso o prueba antes de contratar", kind: "not_applicable" },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
  },
  {
    id: "q2_specialty_marketplace_balance",
    version: 1,
    module: "measurement",
    type: "single",
    routingRole: "adaptive",
    prompt: "Cuando una operación no se concreta en tu mercado de dos lados, ¿puedes saber si faltó oferta, demanda o una buena coincidencia entre ambas?",
    hint: "Busca una causa observable en cada lado del mercado; no basta con saber que la operación no ocurrió.",
    purpose: ["diagnostic"],
    priority: "normal",
    evidenceMigration: "migrated",
    appliesWhen: andV2(operatingWithHistory, eqV2("q2_niche_technology_software", "two_sided_marketplace")),
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: false },
    evidenceV3: evidence("q2_specialty_marketplace_balance", "measurement_optimization", {
      usually_clear: "established",
      sometimes_clear: "partial",
      usually_unclear: "weak",
      unknown: "uncertainty",
    }),
    options: [
      { value: "usually_clear", label: "Sí, normalmente puedo distinguir la causa" },
      { value: "sometimes_clear", label: "A veces, pero no con suficiente consistencia" },
      { value: "usually_unclear", label: "No, normalmente solo sé que no se concretó" },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
  },
  {
    id: "q2_specialty_tax_return_cycle",
    version: 1,
    module: "follow_up",
    type: "single",
    routingRole: "adaptive",
    prompt: "Antes de la próxima temporada o vencimiento fiscal, ¿tienes una forma de volver a contactar a clientes anteriores con tiempo?",
    hint: "Piensa en un proceso previsto antes de la fecha importante, no en esperar a que el cliente vuelva por su cuenta.",
    purpose: ["diagnostic"],
    priority: "normal",
    evidenceMigration: "migrated",
    appliesWhen: andV2(operatingWithHistory, eqV2("q2_niche_financial_tax_insurance", "tax_preparation")),
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: true },
    evidenceV3: evidence("q2_specialty_tax_return_cycle", "relationship_recurrence", {
      systematic: "established",
      partial: "partial",
      reactive: "weak",
      not_applicable: "not_applicable",
      unknown: "uncertainty",
    }),
    options: [
      { value: "systematic", label: "Sí, existe un proceso previsto y normalmente se hace a tiempo" },
      { value: "partial", label: "Solo con parte de los clientes o no siempre a tiempo" },
      { value: "reactive", label: "No, normalmente espero a que el cliente vuelva a contactar" },
      { value: "not_applicable", label: "No aplica: normalmente no corresponde volver a contactar", kind: "not_applicable" },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
  },
  {
    id: "q2_specialty_insurance_renewal",
    version: 1,
    module: "follow_up",
    type: "single",
    routingRole: "adaptive",
    prompt: "Antes de que una póliza venza o deba revisarse, ¿puedes identificar a quién contactar y hacerlo a tiempo?",
    hint: "Evalúa si detectas próximas renovaciones y actúas antes del vencimiento, no solo cuando el cliente te escribe.",
    purpose: ["diagnostic"],
    priority: "normal",
    evidenceMigration: "migrated",
    appliesWhen: andV2(operatingWithHistory, eqV2("q2_niche_financial_tax_insurance", "insurance_agency")),
    scoringReadiness: { candidateDimensions: [], signalDirection: "neutral", allowsUnknown: true, allowsNotApplicable: true },
    evidenceV3: evidence("q2_specialty_insurance_renewal", "relationship_recurrence", {
      systematic: "established",
      partial: "partial",
      reactive: "weak",
      not_applicable: "not_applicable",
      unknown: "uncertainty",
    }),
    options: [
      { value: "systematic", label: "Sí, puedo detectarlas y normalmente contacto a tiempo" },
      { value: "partial", label: "Solo en algunos casos o con poca anticipación" },
      { value: "reactive", label: "No, normalmente reacciono cuando el cliente me contacta" },
      { value: "not_applicable", label: "No aplica a los productos o servicios que gestiono", kind: "not_applicable" },
      { value: "unknown", label: "No estoy seguro", kind: "unknown" },
    ],
  },
];

export const QA03B_REJECTED_SPECIALTY_EVIDENCE_IDS_V1 = [
  "q2_specialty_software_activation",
  "q2_specialty_marketplace_balance",
] as const;

const rejected = new Set<string>(QA03B_REJECTED_SPECIALTY_EVIDENCE_IDS_V1);

/**
 * Only experiments that demonstrated a useful evidence delta remain in the
 * candidate bank. Rejected definitions stay above for auditability and future
 * redesign, but cannot consume a route.
 */
export const QA03B_SPECIALTY_EVIDENCE_PILOT_V1: readonly QuestionDefinitionV2[] =
  QA03B_SPECIALTY_EVIDENCE_EXPERIMENTS_V1.filter((q) => !rejected.has(q.id));

if (new Set(QA03B_SPECIALTY_EVIDENCE_EXPERIMENTS_V1.map((q) => q.id)).size !== QA03B_SPECIALTY_EVIDENCE_EXPERIMENTS_V1.length) {
  throw new Error("QA-03B specialty evidence experiments have duplicate IDs");
}
