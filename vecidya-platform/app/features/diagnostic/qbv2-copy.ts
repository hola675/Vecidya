import type { ResolvedDomainContext } from "./context-resolver";
import type { CopyVariantTarget, CopyVariantV2, OptionKindV2, QuestionDefinitionV2, QuestionHelpIntent } from "./qbv2-contract";
import type { QuestionBankV2 } from "./qbv2-engine";
import type { AnswersV2 } from "./qbv2-rules";
import { resolveTerminologyProfile, type TerminologyProfileId } from "./qbv2-terminology";

/**
 * DIAG-V3-08F — render determinista del copy de una pregunta para un contexto. Solo elige wording: la
 * identidad (`id`/`version`), los valores canónicos, el tipo de cada opción y sus señales nunca cambian, así
 * que la respuesta guardada y su semántica (`ANSWER_SEMANTICS`) son las mismas en todos los contextos.
 */

export type RenderedOptionV2 = { readonly value: string; readonly label: string; readonly kind?: OptionKindV2; readonly exclusive?: boolean };
export type RenderedQuestionV2 = {
  readonly id: string;
  readonly version: number;
  readonly type: QuestionDefinitionV2["type"];
  readonly profile: TerminologyProfileId;
  /** Índice de la variante aplicada en `question.variants`, o `null` si se usa el copy base. */
  readonly variant: number | null;
  readonly prompt: string;
  readonly hint?: string;
  readonly options: readonly RenderedOptionV2[];
  readonly help?: QuestionHelpIntent;
};

export type CopyContext = { readonly context: Partial<ResolvedDomainContext>; readonly answers?: AnswersV2 };

function resolvedValue(context: Partial<ResolvedDomainContext>, field: "entity" | "businessModel" | "nicheGroup" | "activity"): string | undefined {
  const value = context[field] as { status?: string; value?: unknown } | undefined;
  return value?.status === "resolved" && typeof value.value === "string" ? value.value : undefined;
}

function matches(target: CopyVariantTarget, context: Partial<ResolvedDomainContext>, profile: TerminologyProfileId): boolean {
  if ("terminology" in target && target.terminology) return target.terminology.includes(profile);
  if ("archetype" in target && target.archetype) return (context.archetypeComponents ?? []).includes(target.archetype);
  if ("nicheGroup" in target && target.nicheGroup) return resolvedValue(context, "nicheGroup") === target.nicheGroup;
  if ("entityType" in target && target.entityType) return resolvedValue(context, "entity") === target.entityType;
  if ("businessModel" in target && target.businessModel) return resolvedValue(context, "businessModel") === target.businessModel;
  if ("activity" in target && target.activity) return resolvedValue(context, "activity") === target.activity;
  return false;
}

export function renderQuestionV2(question: QuestionDefinitionV2, { context, answers }: CopyContext): RenderedQuestionV2 {
  const profile = resolveTerminologyProfile(context, answers);
  const index = (question.variants ?? []).findIndex((variant) => matches(variant.target, context, profile));
  const variant: CopyVariantV2 | undefined = index >= 0 ? question.variants![index] : undefined;
  const hint = variant?.hint ?? question.hint;
  return {
    id: question.id, version: question.version, type: question.type, profile, variant: index >= 0 ? index : null,
    prompt: variant?.prompt ?? question.prompt,
    ...(hint ? { hint } : {}),
    options: question.options.map((option) => ({ value: option.value, label: variant?.optionLabels?.[option.value] ?? option.label, ...(option.kind ? { kind: option.kind } : {}), ...(option.exclusive ? { exclusive: true } : {}) })),
    ...(question.helpIntent ? { help: question.helpIntent } : {}),
  };
}

/** Todo el texto visible de una pregunta renderizada (pregunta, pista, opciones y ayuda). */
export function visibleCopyOf(rendered: RenderedQuestionV2, { includeHelp = true } = {}): string {
  const help = includeHelp && rendered.help ? [rendered.help.understand, rendered.help.distinction, rendered.help.why ?? "", ...Object.values(rendered.help.options ?? {})] : [];
  return [rendered.prompt, rendered.hint ?? "", ...rendered.options.map((option) => option.label), ...help].filter(Boolean).join(" ");
}

export const HINT_MAX_LENGTH = 140;
/** Marcas internas que nunca deben llegar al copy visible: códigos de fase/deuda, secciones, IDs o plantillas. */
const INTERNAL_MARKERS = /DIAG-|§|\b[a-z0-9]+_[a-z0-9_]+\b|[{}]|\bq2\b/;

/** Validación estática del contrato de copy: variantes coherentes con las opciones, pistas breves y sin marcas internas. */
export function validateQuestionCopyV2(bank: QuestionBankV2): readonly string[] {
  const issues: string[] = [];
  for (const question of bank) {
    const values = new Set(question.options.map((option) => option.value));
    const texts: [string, string | undefined][] = [["prompt", question.prompt], ["hint", question.hint], ...question.options.map((option): [string, string] => [`label:${option.value}`, option.label])];
    if (question.helpIntent) {
      const { understand, distinction, why, options } = question.helpIntent;
      if (!understand.trim() || !distinction.trim()) issues.push(`${question.id}: helpIntent incompleto`);
      texts.push(["help.understand", understand], ["help.distinction", distinction], ["help.why", why]);
      for (const [value, text] of Object.entries(options ?? {})) { if (!values.has(value)) issues.push(`${question.id}: help de opción inexistente ${value}`); texts.push([`help.option:${value}`, text]); }
    }
    for (const [index, variant] of (question.variants ?? []).entries()) {
      if (!variant.prompt && !variant.hint && !variant.optionLabels) issues.push(`${question.id}: variante ${index} vacía`);
      for (const value of Object.keys(variant.optionLabels ?? {})) if (!values.has(value)) issues.push(`${question.id}: variante ${index} etiqueta una opción inexistente ${value}`);
      texts.push([`variant${index}.prompt`, variant.prompt], [`variant${index}.hint`, variant.hint], ...Object.entries(variant.optionLabels ?? {}).map(([value, label]): [string, string] => [`variant${index}.label:${value}`, label]));
    }
    for (const [field, text] of texts) {
      if (text === undefined) continue;
      if (!text.trim()) issues.push(`${question.id}: ${field} vacío`);
      if (INTERNAL_MARKERS.test(text)) issues.push(`${question.id}: ${field} contiene una marca interna`);
      if (field.endsWith("hint") && text.length > HINT_MAX_LENGTH) issues.push(`${question.id}: ${field} supera ${HINT_MAX_LENGTH} caracteres`);
    }
  }
  return issues;
}
