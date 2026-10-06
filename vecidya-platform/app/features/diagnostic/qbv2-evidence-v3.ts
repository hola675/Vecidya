import { CAPABILITY_CONTRIBUTION, CAPABILITY_STATES, type CapabilityState } from "./qbv2-capability";
import type { QuestionDefinitionV2, QuestionVersionV2 } from "./qbv2-contract";
import { DIGITAL_DIMENSION_IDS, type DigitalDimensionId } from "./qbv2-dimensions";
import type { EvidenceDirectness } from "./qbv2-coverage";

/** Semántica explícita por versión: context_only conserva la respuesta sin crear evidencia. */
export type MigratedAnswerStateV3 = CapabilityState | "context_only";
export type QuestionEvidenceV3 = {
  readonly questionId: string;
  readonly questionVersion: QuestionVersionV2;
  readonly dimensions: readonly {
    readonly dimension: DigitalDimensionId;
    readonly directness: EvidenceDirectness;
    readonly answers: Readonly<Record<string, MigratedAnswerStateV3>>;
  }[];
  /** Obligatorio para migrar multi; nunca se infiere diversidad, cantidad ni calidad de canales. */
  readonly multiSelect?: "weakest_observed";
};

export function evidenceMigrationIdentity(questionId: string, version: QuestionVersionV2): string {
  return `${questionId}@v${version}`;
}

/** Cobertura contra opciones ejecutables (sus tipos históricos usan string, no uniones literales). */
export function validateQuestionEvidenceV3(question: QuestionDefinitionV2): readonly string[] {
  const mapping = question.evidenceV3;
  const issues: string[] = [];
  if (!mapping) return [`missing V3 evidence: ${question.id}`];
  if (mapping.questionId !== question.id || mapping.questionVersion !== question.version) issues.push(`V3 identity mismatch: ${question.id}`);
  if (mapping.dimensions.length === 0) issues.push(`empty V3 dimensions: ${question.id}`);
  if (question.type === "multi" && mapping.multiSelect !== "weakest_observed") issues.push(`missing V3 multi policy: ${question.id}`);
  if (question.type === "single" && mapping.multiSelect !== undefined) issues.push(`unexpected V3 multi policy: ${question.id}`);
  const seen = new Set<string>();
  for (const reading of mapping.dimensions) {
    if (!(DIGITAL_DIMENSION_IDS as readonly string[]).includes(reading.dimension)) issues.push(`unknown V3 dimension: ${reading.dimension}`);
    if (seen.has(reading.dimension)) issues.push(`duplicate V3 dimension: ${question.id}/${reading.dimension}`);
    seen.add(reading.dimension);
    if (!["direct", "supporting", "contextual"].includes(reading.directness)) issues.push(`unknown V3 directness: ${question.id}`);
    for (const option of question.options) {
      const state = reading.answers[option.value];
      if (state === undefined) issues.push(`unclassified V3 option: ${question.id}/${option.value}`);
      else if (state !== "context_only" && !(CAPABILITY_STATES as readonly string[]).includes(state)) issues.push(`unknown V3 state: ${question.id}/${option.value}`);
      if (option.kind === "unknown" && state !== "uncertainty") issues.push(`non-neutral V3 unknown: ${question.id}/${option.value}`);
      if (option.kind === "not_applicable" && state !== "not_applicable") issues.push(`non-neutral V3 N/A: ${question.id}/${option.value}`);
    }
    for (const value of Object.keys(reading.answers)) if (!question.options.some((option) => option.value === value)) issues.push(`orphan V3 option: ${question.id}/${value}`);
  }
  return issues;
}

export function validateEvidenceMigrationsV3(bank: readonly QuestionDefinitionV2[]): readonly string[] {
  const issues: string[] = [];
  const identities = new Set<string>();
  for (const question of bank) {
    if (question.evidenceMigration !== undefined && !["pending", "migrated"].includes(question.evidenceMigration)) issues.push(`unknown V3 migration state: ${question.id}`);
    if (question.evidenceV3 && question.evidenceMigration !== "migrated") issues.push(`V3 mapping without migrated state: ${question.id}`);
    if (question.evidenceMigration !== "migrated") continue;
    const identity = evidenceMigrationIdentity(question.id, question.version);
    if (identities.has(identity)) issues.push(`duplicate V3 migration identity: ${identity}`);
    identities.add(identity);
    issues.push(...validateQuestionEvidenceV3(question));
  }
  return issues;
}

/** Lectura semántica; la contribución, confianza y agregación siguen en el scorer existente. */
export function migratedAnswerStatesV3(question: QuestionDefinitionV2, values: readonly string[]): readonly {
  readonly dimension: DigitalDimensionId;
  readonly directness: EvidenceDirectness;
  readonly state: CapabilityState;
}[] {
  if (question.evidenceMigration !== "migrated" || validateQuestionEvidenceV3(question).length > 0 || values.length === 0) return [];
  if (question.type === "single" && values.length !== 1) return [];
  if (values.some((value) => !question.options.some((option) => option.value === value))) return [];
  if (values.length > 1 && values.some((value) => question.options.find((option) => option.value === value)?.exclusive)) return [];
  return question.evidenceV3!.dimensions.flatMap((reading) => {
    const states = values.map((value) => reading.answers[value]!);
    const capability = states.filter((state): state is CapabilityState => state !== "context_only" && CAPABILITY_CONTRIBUTION[state] !== null);
    const state = capability.length > 0
      ? capability.reduce((weakest, next) => CAPABILITY_CONTRIBUTION[next]! < CAPABILITY_CONTRIBUTION[weakest]! ? next : weakest)
      : states.includes("uncertainty") ? "uncertainty"
      : states.includes("not_applicable") ? "not_applicable"
      : states.includes("constraint") ? "constraint" : undefined;
    return state === undefined ? [] : [{ dimension: reading.dimension, directness: reading.directness, state }];
  });
}

/** Default histórico requiere identidad/version y el mismo contrato de respuestas, no solo el ID. */
export function hasHistoricalAnswerContract(question: QuestionDefinitionV2, legacy: QuestionDefinitionV2 | undefined): boolean {
  return legacy !== undefined && question.id === legacy.id && question.version === legacy.version && question.type === legacy.type
    && question.options.length === legacy.options.length
    && question.options.every((option) => legacy.options.some((old) => old.value === option.value && old.kind === option.kind && old.exclusive === option.exclusive));
}
