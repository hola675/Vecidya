import type { BusinessModel, EntityType, GrowthStage, OperationalArchetype, PrimaryFriction, PrimaryGoal } from "./contracts";
import { QUESTION_BANK_V2 } from "./qbv2-bank";
import type { ModuleId } from "./qbv2-contract";
import type { AnswersV2 } from "./qbv2-rules";

export const DIGITAL_DIMENSION_IDS = [
  "clarity_positioning",
  "digital_foundation",
  "discovery",
  "trust_reputation",
  "conversion_access",
  "relationship_recurrence",
  "measurement_optimization",
  "digital_readiness",
] as const;
export type DigitalDimensionId = (typeof DIGITAL_DIMENSION_IDS)[number];

export const EVIDENCE_KINDS = ["established", "missing", "partial", "dependency", "constraint", "uncertainty", "not_applicable"] as const;
export type EvidenceKind = (typeof EVIDENCE_KINDS)[number];

export type DigitalDimensionDefinition = {
  readonly id: DigitalDimensionId;
  readonly label: string;
  readonly purpose: string;
  readonly evaluates: string;
  readonly evidenceTypes: readonly EvidenceKind[];
  readonly applicability: readonly string[];
  readonly contextDependencies: readonly string[];
};

export const DIGITAL_DIMENSIONS: readonly DigitalDimensionDefinition[] = [
  { id: "clarity_positioning", label: "Clarity & Positioning", purpose: "Entender qué se ofrece, para quién y con qué propuesta.", evaluates: "Comprensibilidad de la oferta y del siguiente paso.", evidenceTypes: ["established", "missing", "partial", "uncertainty"], applicability: ["all businesses", "projects"], contextDependencies: ["entity", "businessModel", "archetype", "primaryGoal"] },
  { id: "digital_foundation", label: "Digital Foundation", purpose: "Comprobar que existe una base digital propia, coherente y mantenible.", evaluates: "Presencia, información esencial, acceso y continuidad de los activos digitales.", evidenceTypes: ["established", "missing", "partial", "dependency", "uncertainty", "not_applicable"], applicability: ["all operating businesses"], contextDependencies: ["growthStage", "archetype", "customerModel"] },
  { id: "discovery", label: "Discovery", purpose: "Entender cómo las personas adecuadas descubren la actividad.", evaluates: "Alcance, fuentes de descubrimiento y dependencia de un único canal.", evidenceTypes: ["established", "missing", "partial", "constraint", "uncertainty"], applicability: ["all contexts with an audience or demand"], contextDependencies: ["customerModel", "archetype", "primaryGoal"] },
  { id: "trust_reputation", label: "Trust & Reputation", purpose: "Evaluar las señales que permiten confiar antes de avanzar.", evaluates: "Prueba, reputación, autoridad y claridad percibida.", evidenceTypes: ["established", "missing", "partial", "uncertainty"], applicability: ["contexts where trust affects access or conversion"], contextDependencies: ["archetype", "businessModel", "primaryGoal"] },
  { id: "conversion_access", label: "Conversion & Access", purpose: "Evaluar si una persona puede pasar de interés a contacto, reserva o acción.", evaluates: "Acceso, fricción de entrada, oferta accionable y paso de conversión.", evidenceTypes: ["established", "missing", "partial", "dependency", "constraint", "uncertainty", "not_applicable"], applicability: ["contexts with a concrete action"], contextDependencies: ["archetype", "businessModel", "primaryGoal"] },
  { id: "relationship_recurrence", label: "Relationship & Recurrence", purpose: "Evaluar continuidad, seguimiento y retorno cuando el contexto lo requiere.", evaluates: "Retoma de pendientes, recurrencia, rebooking y contacto propio.", evidenceTypes: ["established", "missing", "partial", "dependency", "constraint", "uncertainty", "not_applicable"], applicability: ["operating businesses", "recurring or multi-step contexts"], contextDependencies: ["growthStage", "archetype", "primaryFriction"] },
  { id: "measurement_optimization", label: "Measurement & Optimization", purpose: "Evaluar si existe aprendizaje verificable para decidir y mejorar.", evaluates: "Origen, resultados, revisión comparativa y capacidad de aprender.", evidenceTypes: ["established", "missing", "partial", "dependency", "uncertainty", "not_applicable"], applicability: ["operating businesses with measurable activity"], contextDependencies: ["growthStage", "primaryGoal"] },
  { id: "digital_readiness", label: "Digital Readiness", purpose: "Evaluar si el negocio puede sostener y aprovechar la presencia digital que necesita.", evaluates: "Capacidad, procesos, dependencias y restricciones contextuales; no salud general del negocio.", evidenceTypes: ["established", "missing", "partial", "dependency", "constraint", "uncertainty", "not_applicable"], applicability: ["all contexts"], contextDependencies: ["entity", "growthStage", "archetype", "businessModel", "primaryFriction"] },
] as const;

export const MATURITY_MODEL = [
  { id: "initial", label: "Inicial", meaning: "La actividad o propuesta aún necesita definición y validación básica.", observableEvidence: ["no operation", "unclear offer", "no validated demand"], modifiers: ["uncertainty", "acquisition_dependency"] },
  { id: "functional", label: "Funcional", meaning: "Existe una oferta y una operación real que puede sostener el siguiente paso digital.", observableEvidence: ["real customers", "repeatable activity", "basic access"], modifiers: ["manual_follow_up", "weak_measurement"] },
  { id: "structured", label: "Estructurada", meaning: "La actividad cuenta con procesos y responsabilidades suficientemente claros para trabajar de forma consistente.", observableEvidence: ["defined_process", "visible_ownership", "consistent_follow_up"], modifiers: ["inconsistent_process", "capacity_pressure"] },
  { id: "ready_to_grow", label: "Lista para crecer", meaning: "Hay señales de demanda o capacidad que justifican mejorar adquisición, conversión y continuidad.", observableEvidence: ["increasing_demand", "capacity_expansion", "repeatable_offer"], modifiers: ["acquisition_dependency", "capacity_pressure", "weak_measurement"] },
  { id: "ready_to_scale", label: "Lista para escalar", meaning: "La presencia digital y los procesos pueden sostener más volumen sin depender de improvisación constante.", observableEvidence: ["systemized_process", "owned_relationship", "measurement_loop"], modifiers: ["capacity_pressure", "manual_follow_up", "inconsistent_process"] },
] as const;
export type MaturityId = (typeof MATURITY_MODEL)[number]["id"];

export type QuestionEvidenceMapping = {
  readonly questionId: string;
  readonly dimensions: readonly DigitalDimensionId[];
  readonly evidenceTypes: readonly EvidenceKind[];
  readonly subcriteria: readonly string[];
  readonly semanticRole: EvidenceDirectness;
  readonly context?: {
    readonly archetypes?: readonly OperationalArchetype[];
    readonly businessModels?: readonly BusinessModel[];
    readonly entityTypes?: readonly EntityType[];
    readonly growthStages?: readonly GrowthStage[];
    readonly goals?: readonly PrimaryGoal[];
    readonly frictions?: readonly PrimaryFriction[];
  };
};

/** Declarative epistemic role of a question-to-dimension mapping. */
export type EvidenceDirectness = "direct" | "supporting" | "contextual";

type MappingGroup = Omit<QuestionEvidenceMapping, "questionId" | "semanticRole"> & { readonly questionIds: readonly string[]; readonly semanticRole?: EvidenceDirectness };
const group = (questionIds: readonly string[], dimensions: readonly DigitalDimensionId[], subcriteria: readonly string[], evidenceTypes: readonly EvidenceKind[] = ["established", "missing", "partial", "uncertainty"]): MappingGroup => ({ questionIds, dimensions, evidenceTypes, subcriteria });

const MAPPING_GROUPS: readonly MappingGroup[] = [
  group(["q2_entity", "q2_other_staff", "q2_monetization", "q2_delivery", "q2_has_customers", "q2_regularity", "q2_demand_trend", "q2_sector", "q2_customer_reach", "q2_customer_buyer", "q2_process_systemization", "q2_capacity_signal"], [], ["business context and operational capacity"]),
  group(["q2_goal", "q2_friction"], [], ["declared priority and contextual constraint"]),
  group(["q2_local_discovery", "q2_creator_channel_concentration", "q2_retail_promotions", "q2_ecommerce_acquisition_dependency", "q2_startup_first_channel"], ["discovery"], ["source of discovery", "channel dependency"]),
  group(["q2_local_discovery", "q2_ecommerce_traffic_sources", "q2_b2b_lead_source"], ["discovery", "measurement_optimization"], ["known source of demand and source confidence"], ["established", "missing", "partial", "dependency", "uncertainty", "not_applicable"]),
  group(["q2_local_presence_consistency"], ["digital_foundation", "discovery"], ["presence availability", "audience access"]),
  group(["q2_creator_content_consistency"], ["discovery"], ["content channel activity"]),
  group(["q2_local_foot_traffic"], ["discovery"], ["observed local demand source"]),
  group(["q2_ecommerce_product_discovery"], ["digital_foundation"], ["catalog and storefront access"]),
  group(["q2_reputation_flow", "q2_professional_authority_signals"], ["trust_reputation"], ["proof, authority and external validation"]),
  group(["q2_retail_product_visibility", "q2_ecommerce_product_discovery", "q2_b2b_qualification", "q2_professional_intake_flow", "q2_nonprofit_donation_clarity", "q2_startup_problem_clarity", "q2_startup_offer_readiness"], ["clarity_positioning", "conversion_access"], ["offer clarity and next action"]),
  group(["q2_service_response_speed", "q2_service_quote_followup", "q2_appointments_booking_method", "q2_appointments_booking_friction", "q2_appointments_lead_to_booking", "q2_ecommerce_checkout_friction", "q2_hospitality_delivery_takeaway", "q2_startup_demand_signal", "q2_creator_conversion"], ["conversion_access"], ["access, booking and concrete action"]),
  group(["q2_hospitality_peak_capacity"], ["digital_readiness"], ["capacity constraints"]),
  group(["q2_local_repeat_customers", "q2_service_repeat_referral", "q2_appointments_confirmation_reminders", "q2_appointments_rebooking", "q2_ecommerce_repeat_purchase", "q2_ecommerce_cart_followup", "q2_retail_customer_capture", "q2_creator_audience_ownership", "q2_professional_followup_after_consult", "q2_b2b_sales_cycle"], ["relationship_recurrence"], ["continuity, follow-up and return"], ["established", "missing", "partial", "dependency", "uncertainty", "not_applicable"]),
  group(["q2_followup_general_process", "q2_followup_ownership", "q2_followup_status_visibility"], ["relationship_recurrence"], ["follow-up ownership, recovery and visibility"], ["established", "missing", "partial", "dependency", "constraint", "uncertainty", "not_applicable"]),
  group(["q2_measurement_source_confidence", "q2_measurement_outcome_tracking", "q2_measurement_decision_review"], ["measurement_optimization"], ["measurement loop and learning"], ["established", "missing", "partial", "dependency", "uncertainty", "not_applicable"]),
  group(["q2_operations_process_ownership", "q2_operations_handoffs", "q2_operations_bottleneck", "q2_operations_manual_impact", "q2_operations_dependency", "q2_followup_general_process", "q2_followup_ownership", "q2_followup_status_visibility", "q2_b2b_pipeline", "q2_b2b_status_visibility", "q2_creator_monetization_model", "q2_nonprofit_membership_lifecycle"], ["digital_readiness"], ["sustainability, dependencies and process constraints"], ["established", "missing", "partial", "dependency", "constraint", "uncertainty", "not_applicable"]),
];

const EVIDENCE_MAPPING_ENTRIES = MAPPING_GROUPS.flatMap((mapping) => mapping.questionIds.map((questionId) => [questionId, mapping] as const)).reduce<Record<string, QuestionEvidenceMapping>>((accumulator, [questionId, mapping]) => {
    const previous = accumulator[questionId];
    accumulator[questionId] = previous ? {
      questionId,
      dimensions: [...new Set([...previous.dimensions, ...mapping.dimensions])],
      evidenceTypes: [...new Set([...previous.evidenceTypes, ...mapping.evidenceTypes])],
      subcriteria: [...new Set([...previous.subcriteria, ...mapping.subcriteria])],
      semanticRole: previous.semanticRole === "contextual" || mapping.dimensions.length === 0 ? "contextual" : previous.semanticRole,
      context: previous.context ?? mapping.context,
    } : { questionId, dimensions: mapping.dimensions, evidenceTypes: mapping.evidenceTypes, subcriteria: mapping.subcriteria, semanticRole: mapping.dimensions.length === 0 ? "contextual" : "direct", context: mapping.context };
    return accumulator;
  }, {});

export const EVIDENCE_MAPPING: Readonly<Record<string, QuestionEvidenceMapping>> = {
  ...EVIDENCE_MAPPING_ENTRIES,
  // Routing/context question: it changes which diagnostic questions apply, but proves no capability.
  q2_nonprofit_support_type: { questionId: "q2_nonprofit_support_type", dimensions: [], evidenceTypes: ["uncertainty", "not_applicable"], subcriteria: ["support model applicability"], semanticRole: "contextual" },
  q2_service_area_clarity: { questionId: "q2_service_area_clarity", dimensions: [], evidenceTypes: ["uncertainty", "not_applicable"], subcriteria: ["service-area context"], semanticRole: "contextual" },
  q2_service_quote_practice: { questionId: "q2_service_quote_practice", dimensions: [], evidenceTypes: ["uncertainty", "not_applicable"], subcriteria: ["quote-follow-up routing context"], semanticRole: "contextual" },
  q2_startup_validation_evidence: { questionId: "q2_startup_validation_evidence", dimensions: ["clarity_positioning"], evidenceTypes: ["established", "missing", "partial", "uncertainty"], subcriteria: ["problem validation"], semanticRole: "supporting" },
  q2_startup_next_milestone: { questionId: "q2_startup_next_milestone", dimensions: [], evidenceTypes: ["uncertainty", "not_applicable"], subcriteria: ["declared next milestone"], semanticRole: "contextual" },
  q2_ecommerce_cart_visibility: { questionId: "q2_ecommerce_cart_visibility", dimensions: ["measurement_optimization"], evidenceTypes: ["established", "missing", "uncertainty"], subcriteria: ["abandoned-cart observability"], semanticRole: "direct" },
  q2_appointments_noshow: { questionId: "q2_appointments_noshow", dimensions: [], evidenceTypes: ["established", "missing", "partial", "uncertainty"], subcriteria: ["appointment attendance context"], semanticRole: "contextual" },
  q2_hospitality_flow_type: { questionId: "q2_hospitality_flow_type", dimensions: [], evidenceTypes: ["uncertainty", "not_applicable"], subcriteria: ["reservation versus walk-in routing context"], semanticRole: "contextual" },
  q2_hospitality_reservation_noshow: { questionId: "q2_hospitality_reservation_noshow", dimensions: [], evidenceTypes: ["established", "partial", "missing", "uncertainty"], subcriteria: ["reservation attendance context"], semanticRole: "contextual" },
  q2_b2b_decision_makers: { questionId: "q2_b2b_decision_makers", dimensions: ["conversion_access"], evidenceTypes: ["established", "partial", "uncertainty"], subcriteria: ["buying committee context"], semanticRole: "supporting" },
  q2_creator_content_consistency: { questionId: "q2_creator_content_consistency", dimensions: ["discovery"], evidenceTypes: ["established", "partial", "missing", "uncertainty"], subcriteria: ["content channel consistency"], semanticRole: "supporting" },
  q2_creator_conversion: { questionId: "q2_creator_conversion", dimensions: ["conversion_access"], evidenceTypes: ["established", "partial", "missing", "uncertainty"], subcriteria: ["audience-to-action conversion"], semanticRole: "direct" },
  q2_professional_referral_dependency: { questionId: "q2_professional_referral_dependency", dimensions: ["discovery"], evidenceTypes: ["established", "partial", "dependency", "uncertainty"], subcriteria: ["discovery-source concentration"], semanticRole: "direct" },
  q2_nonprofit_participation: { questionId: "q2_nonprofit_participation", dimensions: [], evidenceTypes: ["established", "partial", "missing", "uncertainty"], subcriteria: ["participation-mode context"], semanticRole: "contextual" },
};

/** Per-question/per-dimension audit overrides. Unlisted dimensional mappings are direct. */
export const EVIDENCE_DIRECTNESS: Readonly<Record<string, Readonly<Partial<Record<DigitalDimensionId, EvidenceDirectness>>>>> = {
  q2_local_discovery: { measurement_optimization: "supporting" },
  q2_b2b_lead_source: { measurement_optimization: "supporting" },
  q2_ecommerce_traffic_sources: { discovery: "supporting", measurement_optimization: "supporting" },
  q2_ecommerce_product_discovery: { clarity_positioning: "supporting", conversion_access: "supporting" },
  q2_retail_product_visibility: { conversion_access: "supporting" },
  q2_local_presence_consistency: { discovery: "supporting" },
  q2_professional_authority_signals: { clarity_positioning: "supporting" },
  q2_b2b_qualification: { conversion_access: "supporting" },
  q2_b2b_decision_makers: { conversion_access: "supporting" },
  q2_professional_intake_flow: { clarity_positioning: "supporting" },
  q2_nonprofit_donation_clarity: { clarity_positioning: "supporting" },
  q2_startup_problem_clarity: { conversion_access: "supporting" },
  q2_startup_offer_readiness: { conversion_access: "supporting" },
  q2_startup_demand_signal: { conversion_access: "supporting" },
  q2_startup_first_channel: { discovery: "supporting" },
  q2_startup_validation_evidence: { clarity_positioning: "supporting" },
  q2_creator_content_consistency: { discovery: "supporting" },
  q2_operations_process_ownership: { digital_readiness: "supporting" },
  q2_operations_handoffs: { digital_readiness: "supporting" },
  q2_operations_bottleneck: { digital_readiness: "supporting" },
  q2_operations_manual_impact: { digital_readiness: "supporting" },
  q2_operations_dependency: { digital_readiness: "supporting" },
  q2_followup_general_process: { digital_readiness: "supporting" },
  q2_followup_ownership: { digital_readiness: "supporting" },
  q2_followup_status_visibility: { digital_readiness: "supporting" },
  q2_local_repeat_customers: { discovery: "supporting" },
  q2_service_repeat_referral: { discovery: "supporting" },
};

export type CoverageContext = { readonly answers: AnswersV2; readonly routeLength?: number; readonly selectedQuestionIds?: readonly string[] };

export function validateEvidenceMapping(bank = QUESTION_BANK_V2): readonly string[] {
  const productiveIds = bank.filter((question) => !question.purpose.includes("confirmation")).map((question) => question.id);
  const issues: string[] = [];
  for (const id of productiveIds) {
    const mapping = EVIDENCE_MAPPING[id];
    if (!mapping) issues.push(`missing mapping: ${id}`);
    else if ((mapping.dimensions.length === 0 && mapping.semanticRole !== "contextual") || mapping.subcriteria.length === 0) issues.push(`empty evidence mapping: ${id}`);
  }
  for (const id of Object.keys(EVIDENCE_MAPPING)) if (!productiveIds.includes(id)) issues.push(`mapping references non-productive question: ${id}`);
  return issues;
}
