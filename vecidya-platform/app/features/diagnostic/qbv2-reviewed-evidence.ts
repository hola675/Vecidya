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

export const REVIEWED_EVIDENCE_V3 = [...REVIEWED_PILOT_EVIDENCE_V3, ...REVIEWED_PUBLIC_FOUNDATION_EVIDENCE_V3] as const;

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
