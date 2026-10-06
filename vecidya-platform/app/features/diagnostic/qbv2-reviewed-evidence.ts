import type { QuestionDefinitionV2 } from "./qbv2-contract";
import type { MigratedAnswerStateV3, QuestionEvidenceV3 } from "./qbv2-evidence-v3";
import { evidenceMigrationIdentity } from "./qbv2-evidence-v3";
import { REVIEWED_CANDIDATE_QUESTIONS_V2 } from "./qbv2-reviewed-candidate";

/** Piloto R3A: observaciones, nunca herramientas, metas, fricciones ni resultados comerciales. */
export const REVIEWED_PILOT_EVIDENCE_V3 = [
  {
    questionId: "q2_discovery_reliable_reach", questionVersion: 1,
    dimensions: [{ dimension: "discovery", directness: "direct", answers: {
      reliable: "established", irregular: "partial", weak: "weak", not_seeking: "context_only", unknown: "uncertainty",
    } satisfies Record<"reliable" | "irregular" | "weak" | "not_seeking" | "unknown", MigratedAnswerStateV3> }],
  },
  {
    questionId: "q2_local_presence_consistency", questionVersion: 2,
    dimensions: [{ dimension: "digital_foundation", directness: "direct", answers: {
      consistent: "established", partial: "partial", no: "weak", unknown: "uncertainty",
    } satisfies Record<"consistent" | "partial" | "no" | "unknown", MigratedAnswerStateV3> }],
  },
  {
    questionId: "q2_reputation_flow", questionVersion: 3,
    dimensions: [{ dimension: "trust_reputation", directness: "direct", answers: {
      strong: "established", partial: "partial", weak: "weak", unknown: "uncertainty",
    } satisfies Record<"strong" | "partial" | "weak" | "unknown", MigratedAnswerStateV3> }],
  },
  {
    questionId: "q2_operations_handoffs", questionVersion: 2,
    dimensions: [{ dimension: "digital_readiness", directness: "supporting", answers: {
      complete: "established", partial: "partial", incomplete: "weak", not_applicable: "not_applicable", unknown: "uncertainty",
    } satisfies Record<"complete" | "partial" | "incomplete" | "not_applicable" | "unknown", MigratedAnswerStateV3> }],
  },
] as const satisfies readonly QuestionEvidenceV3[];

/** R3B: base pública mantenida y navegación del catálogo; sin evidencia secundaria inferida. */
export const REVIEWED_PUBLIC_FOUNDATION_EVIDENCE_V3 = [
  {
    questionId: "q2_presence_digital_base", questionVersion: 2,
    dimensions: [{ dimension: "digital_foundation", directness: "direct", answers: {
      reliable_presence: "established", partial_presence: "partial", no_reliable_presence: "missing",
      not_applicable: "not_applicable", unknown: "uncertainty",
    } satisfies Record<"reliable_presence" | "partial_presence" | "no_reliable_presence" | "not_applicable" | "unknown", MigratedAnswerStateV3> }],
  },
  {
    questionId: "q2_ecommerce_product_discovery", questionVersion: 2,
    dimensions: [{ dimension: "digital_foundation", directness: "direct", answers: {
      easy: "established", confusing: "partial", difficult: "weak", not_applicable: "not_applicable", unknown: "uncertainty",
    } satisfies Record<"easy" | "confusing" | "difficult" | "not_applicable" | "unknown", MigratedAnswerStateV3> }],
  },
] as const satisfies readonly QuestionEvidenceV3[];

/** R3C: comprensión visible de oferta; no infiere compra, inventario, confianza ni adquisición. */
export const REVIEWED_VISIBLE_OFFER_EVIDENCE_V3 = [
  {
    questionId: "q2_presence_offer_clarity", questionVersion: 2,
    dimensions: [{ dimension: "clarity_positioning", directness: "direct", answers: {
      clear: "established", partial: "partial", unclear: "weak", not_applicable: "not_applicable", unknown: "uncertainty",
    } satisfies Record<"clear" | "partial" | "unclear" | "not_applicable" | "unknown", MigratedAnswerStateV3> }],
  },
  {
    questionId: "q2_retail_product_visibility", questionVersion: 2,
    dimensions: [{ dimension: "clarity_positioning", directness: "direct", answers: {
      clear: "established", partial: "partial", unclear: "weak", unknown: "uncertainty",
    } satisfies Record<"clear" | "partial" | "unclear" | "unknown", MigratedAnswerStateV3> }],
  },
] as const satisfies readonly QuestionEvidenceV3[];

/** R3D: acceso a respuesta inicial y coordinación observada; sin SLA, resultado o causa inferidos. */
export const REVIEWED_INITIAL_ACCESS_EVIDENCE_V3 = [
  {
    questionId: "q2_service_response_speed", questionVersion: 2,
    dimensions: [{ dimension: "conversion_access", directness: "direct", answers: {
      strong: "established", partial: "partial", weak: "weak", unknown: "uncertainty",
    } satisfies Record<"strong" | "partial" | "weak" | "unknown", MigratedAnswerStateV3> }],
  },
  {
    questionId: "q2_appointments_booking_friction", questionVersion: 2,
    dimensions: [{ dimension: "conversion_access", directness: "direct", answers: {
      rarely: "established", sometimes: "partial", often: "weak", unknown: "uncertainty",
    } satisfies Record<"rarely" | "sometimes" | "often" | "unknown", MigratedAnswerStateV3> }],
  },
] as const satisfies readonly QuestionEvidenceV3[];

/** R3E: continuidad de una interacción pendiente; no infiere recurrencia, venta, herramienta ni causa. */
export const REVIEWED_FOLLOWUP_CONTINUITY_EVIDENCE_V3 = [
  {
    questionId: "q2_service_quote_followup", questionVersion: 2,
    dimensions: [{ dimension: "relationship_recurrence", directness: "direct", answers: {
      consistent: "established", sometimes: "partial", rarely: "weak", not_applicable: "not_applicable", unknown: "uncertainty",
    } satisfies Record<"consistent" | "sometimes" | "rarely" | "not_applicable" | "unknown", MigratedAnswerStateV3> }],
  },
  {
    questionId: "q2_followup_general_process", questionVersion: 2,
    dimensions: [{ dimension: "relationship_recurrence", directness: "direct", answers: {
      consistent: "established", partial: "partial", sometimes_lost: "weak", not_applicable: "not_applicable", unknown: "uncertainty",
    } satisfies Record<"consistent" | "partial" | "sometimes_lost" | "not_applicable" | "unknown", MigratedAnswerStateV3> }],
  },
] as const satisfies readonly QuestionEvidenceV3[];

/** R3F: recuperación operativa directa; estado B2B apoya el constructo general sin duplicar su base directa. */
export const REVIEWED_OPERATIONAL_READINESS_EVIDENCE_V3 = [
  {
    questionId: "q2_operations_information_base", questionVersion: 2,
    dimensions: [{ dimension: "digital_readiness", directness: "direct", answers: {
      easy_reliable: "established", somewhat_scattered: "partial", difficult_unreliable: "weak", not_applicable: "not_applicable", unknown: "uncertainty",
    } satisfies Record<"easy_reliable" | "somewhat_scattered" | "difficult_unreliable" | "not_applicable" | "unknown", MigratedAnswerStateV3> }],
  },
  {
    questionId: "q2_b2b_status_visibility", questionVersion: 2,
    dimensions: [{ dimension: "digital_readiness", directness: "supporting", answers: {
      clear: "established", partial: "partial", lose_track: "weak", not_applicable: "not_applicable", unknown: "uncertainty",
    } satisfies Record<"clear" | "partial" | "lose_track" | "not_applicable" | "unknown", MigratedAnswerStateV3> }],
  },
] as const satisfies readonly QuestionEvidenceV3[];

/** R3G: experiencia/trabajo visible, distinta de opiniones externas; sin jerarquía de credenciales. */
export const REVIEWED_PROFESSIONAL_AUTHORITY_EVIDENCE_V3 = [
  {
    questionId: "q2_professional_authority_signals", questionVersion: 2,
    dimensions: [{ dimension: "trust_reputation", directness: "direct", answers: {
      clearly_visible: "established", partial: "partial", not_really: "weak", unknown: "uncertainty",
    } satisfies Record<"clearly_visible" | "partial" | "not_really" | "unknown", MigratedAnswerStateV3> }],
  },
] as const satisfies readonly QuestionEvidenceV3[];

/** R3H: comprensión del siguiente paso profesional; no demuestra facilidad para ejecutarlo. */
export const REVIEWED_PROFESSIONAL_INTAKE_EVIDENCE_V3 = [
  {
    questionId: "q2_professional_intake_flow", questionVersion: 2,
    dimensions: [{ dimension: "clarity_positioning", directness: "direct", answers: {
      clear: "established", partial: "partial", unclear: "weak", unknown: "uncertainty",
    } satisfies Record<"clear" | "partial" | "unclear" | "unknown", MigratedAnswerStateV3> }],
  },
] as const satisfies readonly QuestionEvidenceV3[];

/** R3I: repetibilidad declarada de tareas; no presupone herramientas ni documentación. */
export const REVIEWED_PROCESS_CONSISTENCY_EVIDENCE_V3 = [
  {
    questionId: "q2_process_systemization", questionVersion: 2,
    dimensions: [{ dimension: "digital_readiness", directness: "direct", answers: {
      defined: "established", partial: "partial", informal: "weak", unknown: "uncertainty",
    } satisfies Record<"defined" | "partial" | "informal" | "unknown", MigratedAnswerStateV3> }],
  },
] as const satisfies readonly QuestionEvidenceV3[];

/** R3J: vía directa tras una compra, distinta de seguimiento ejecutado o recurrencia.
 * Creator sigue pending: sus personas pueden ser los mismos compradores en rutas retail/creator.
 */
export const REVIEWED_SPECIALIZED_CONTACTABILITY_EVIDENCE_V3 = [
  {
    questionId: "q2_retail_customer_capture", questionVersion: 2,
    dimensions: [{ dimension: "relationship_recurrence", directness: "direct", answers: {
      consistent: "established", partial: "partial", no: "missing", not_applicable: "not_applicable", unknown: "uncertainty",
    } satisfies Record<"consistent" | "partial" | "no" | "not_applicable" | "unknown", MigratedAnswerStateV3> }],
  },
] as const satisfies readonly QuestionEvidenceV3[];

/** R3K: recordatorio previo a la cita ya agendada; no infiere asistencia ni éxito. */
export const REVIEWED_APPOINTMENT_REMINDER_EVIDENCE_V3 = [
  {
    questionId: "q2_appointments_confirmation_reminders", questionVersion: 2,
    dimensions: [{ dimension: "relationship_recurrence", directness: "direct", answers: {
      consistent: "established", sometimes: "partial", rarely: "weak", not_applicable: "not_applicable", unknown: "uncertainty",
    } satisfies Record<"consistent" | "sometimes" | "rarely" | "not_applicable" | "unknown", MigratedAnswerStateV3> }],
  },
] as const satisfies readonly QuestionEvidenceV3[];

/** R3L: continuidad de oportunidades B2B hasta conocer su desenlace; separada de recuperar su estado actual. */
export const REVIEWED_B2B_OPPORTUNITY_CONTINUITY_EVIDENCE_V3 = [
  {
    questionId: "q2_b2b_pipeline", questionVersion: 2,
    dimensions: [{ dimension: "relationship_recurrence", directness: "direct", answers: {
      defined: "established", partial: "partial", informal: "weak", unknown: "uncertainty",
    } satisfies Record<"defined" | "partial" | "informal" | "unknown", MigratedAnswerStateV3> }],
  },
] as const satisfies readonly QuestionEvidenceV3[];

export const REVIEWED_EVIDENCE_V3 = [...REVIEWED_PILOT_EVIDENCE_V3, ...REVIEWED_PUBLIC_FOUNDATION_EVIDENCE_V3, ...REVIEWED_VISIBLE_OFFER_EVIDENCE_V3, ...REVIEWED_INITIAL_ACCESS_EVIDENCE_V3, ...REVIEWED_FOLLOWUP_CONTINUITY_EVIDENCE_V3, ...REVIEWED_OPERATIONAL_READINESS_EVIDENCE_V3, ...REVIEWED_PROFESSIONAL_AUTHORITY_EVIDENCE_V3, ...REVIEWED_PROFESSIONAL_INTAKE_EVIDENCE_V3, ...REVIEWED_PROCESS_CONSISTENCY_EVIDENCE_V3, ...REVIEWED_SPECIALIZED_CONTACTABILITY_EVIDENCE_V3, ...REVIEWED_APPOINTMENT_REMINDER_EVIDENCE_V3, ...REVIEWED_B2B_OPPORTUNITY_CONTINUITY_EVIDENCE_V3] as const;

/** Misma candidata R2, vista de evidencia aislada: solo cambia metadata de migración, nunca registro. */
export const REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3: readonly QuestionDefinitionV2[] = REVIEWED_CANDIDATE_QUESTIONS_V2.map((question) => {
  const mapping = REVIEWED_EVIDENCE_V3.find((entry) => entry.questionId === question.id && entry.questionVersion === question.version);
  return mapping
    ? { ...question, evidenceMigration: "migrated", evidenceV3: mapping }
    : { ...question, evidenceMigration: "pending" };
});

/** Ledger derivado de las definiciones concretas; pending no obliga a convertir contexto en score. */
export const REVIEWED_EVIDENCE_MIGRATION_LEDGER_V3 = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.map((question) => ({
  questionId: question.id,
  questionVersion: question.version,
  identity: evidenceMigrationIdentity(question.id, question.version),
  state: question.evidenceMigration!,
}));

export const REVIEWED_EVIDENCE_MIGRATION_SUMMARY_V3 = {
  total: REVIEWED_EVIDENCE_MIGRATION_LEDGER_V3.length,
  pending: REVIEWED_EVIDENCE_MIGRATION_LEDGER_V3.filter((entry) => entry.state === "pending").length,
  migrated: REVIEWED_EVIDENCE_MIGRATION_LEDGER_V3.filter((entry) => entry.state === "migrated").length,
};
