import { CORE_DIMENSION_IDS } from "./contracts";
import { findDependencyCycles } from "./questions";
import { MODULE_IDS, type QuestionDefinitionV2 } from "./qbv2-contract";
import type { QuestionBankV2 } from "./qbv2-engine";
import { collectAnswerDependencies, collectAnswerRefValueChecks, collectContextDependencies, type RuleV2 } from "./qbv2-rules";
import { scalarSlotForProduction, SIGNAL_PRODUCTION_CONTEXT_FIELD } from "./qbv2-signals";

/**
 * Validadores estáticos de DIAG-V3-08B.2 (§37, §43-49). Deterministas, sin dependencias de red/D1;
 * pensados para correr en tests, no en runtime de producción.
 */

export type ValidationIssue = { readonly code: string; readonly questionId?: string; readonly message: string };

/** DIAG-V3-08D.1: both eligibility rules are validated (`appliesWhen` and `materialAppliesWhen`). */
function gateRules(question: QuestionBankV2[number]): readonly RuleV2[] {
  return [question.appliesWhen, question.materialAppliesWhen].filter((rule): rule is RuleV2 => rule !== undefined);
}

function validateUniqueIds(bank: QuestionBankV2): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();
  for (const question of bank) {
    if (seen.has(question.id)) issues.push({ code: "DUPLICATE_QUESTION_ID", questionId: question.id, message: `QuestionId duplicado: ${question.id}` });
    seen.add(question.id);
    const optionIds = new Set<string>();
    for (const option of question.options) {
      if (optionIds.has(option.value)) issues.push({ code: "DUPLICATE_OPTION_ID", questionId: question.id, message: `OptionId duplicado «${option.value}» en ${question.id}` });
      optionIds.add(option.value);
    }
  }
  return issues;
}

function validateModules(bank: QuestionBankV2): ValidationIssue[] {
  return bank.filter((question) => !(MODULE_IDS as readonly string[]).includes(question.module)).map((question) => ({ code: "INVALID_MODULE", questionId: question.id, message: `módulo inexistente: ${question.module}` }));
}

function validateRoutingRoles(bank: QuestionBankV2): ValidationIssue[] {
  const valid = new Set(["core", "adaptive", "deepening"]);
  return bank.flatMap((question) => question.routingRole !== undefined && !valid.has(question.routingRole)
    ? [{ code: "INVALID_ROUTING_ROLE", questionId: question.id, message: `rol de ruta inválido: ${String(question.routingRole)}` }]
    : []);
}

function validateUnsafeNotEqPrerequisites(bank: QuestionBankV2): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const visit = (owner: string, rule: RuleV2): void => {
    if (rule.op === "notEq" && rule.value === "no") issues.push({ code: "UNSAFE_NOT_EQ_PREREQUISITE", questionId: owner, message: `${owner} usa notEq(${rule.ref.question}, "no"); sin respuesta la regla puede pasar` });
    else if (rule.op === "and" || rule.op === "or") rule.rules.forEach((child) => visit(owner, child));
    else if (rule.op === "not") visit(owner, rule.rule);
  };
  for (const question of bank) for (const rule of gateRules(question)) visit(question.id, rule);
  return issues;
}

/** §19: `exclusive` solo tiene sentido en preguntas `multi` — en `single` ya es implícitamente exclusiva. */
function validateExclusiveOptions(bank: QuestionBankV2): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const question of bank) {
    if (question.type === "single") {
      for (const option of question.options) if (option.exclusive) issues.push({ code: "IMPOSSIBLE_EXCLUSIVE_CONFIG", questionId: question.id, message: `«${option.value}» declara exclusive en una pregunta single (ya es exclusiva por definición)` });
    }
  }
  return issues;
}

/** §17: como mucho una opción `unknown` por pregunta. */
function validateUnknownCardinality(bank: QuestionBankV2): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const question of bank) {
    const unknownCount = question.options.filter((option) => option.kind === "unknown").length;
    if (unknownCount > 1) issues.push({ code: "MULTIPLE_UNKNOWN_OPTIONS", questionId: question.id, message: `${unknownCount} opciones "unknown" (máximo 1)` });
  }
  return issues;
}

/**
 * §33: ninguna pregunta huérfana — debe producir al menos una señal, ser candidata de scoring, tener un
 * rol de contradicción, o declarar propósito "routing"/"diagnostic" explícitamente. El propósito
 * "diagnostic" se añade como salida válida tras revisión de dominio independiente: exigir una
 * `candidateDimensions` no vacía como único escape para una pregunta puramente diagnóstica presionaba a
 * inventar una dimensión de scoring antes de tiempo (§31: "no asignar pesos todavía") solo para pasar
 * este validador — una pregunta que se declara explícitamente "diagnostic" ya tiene una utilidad
 * declarada sin necesitar fabricar una candidatura de scoring prematura.
 */
function validateNoOrphanQuestions(bank: QuestionBankV2): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const question of bank) {
    const producesSomeSignal = question.options.some((option) => (option.produces?.length ?? 0) > 0);
    const scoringCandidate = (question.scoringReadiness?.candidateDimensions.length ?? 0) > 0;
    const hasContradictionRole = question.contradictionRole !== undefined;
    const isRoutingOrDiagnostic = question.purpose.includes("routing") || question.purpose.includes("diagnostic");
    if (!producesSomeSignal && !scoringCandidate && !hasContradictionRole && !isRoutingOrDiagnostic) {
      issues.push({ code: "ORPHAN_QUESTION", questionId: question.id, message: `${question.id} no produce señal, no es candidata de scoring, no confirma nada y no es de routing/diagnostic — no tiene utilidad declarada (§33)` });
    }
  }
  return issues;
}

/** §32: `candidateDimensions` debe referenciar dimensiones reales. Defensa en profundidad (ya tipado por `DimensionId`). */
function validateScoringDimensions(bank: QuestionBankV2): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const valid = new Set<string>(CORE_DIMENSION_IDS);
  for (const question of bank) {
    for (const dimension of question.scoringReadiness?.candidateDimensions ?? []) {
      if (!valid.has(dimension)) issues.push({ code: "INVALID_DIMENSION", questionId: question.id, message: `dimensión inexistente: ${dimension}` });
    }
  }
  return issues;
}

/** §37 "invalid answer ref": toda referencia de respuesta (`appliesWhen`) debe apuntar a un QuestionId real del mismo banco. */
function validateAnswerRefs(bank: QuestionBankV2): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const validIds = new Set(bank.map((question) => question.id));
  for (const question of bank) {
    for (const dependency of gateRules(question).flatMap(collectAnswerDependencies)) {
      if (!validIds.has(dependency)) issues.push({ code: "INVALID_ANSWER_REF", questionId: question.id, message: `referencia a QuestionId inexistente: ${dependency}` });
    }
  }
  return issues;
}

/** §74 mutación J: un valor citado en `eq`/`in`/`multiExcluding`/etc. debe ser un OptionId REAL de la pregunta referenciada — nunca el de otra pregunta (OptionV2.value es `string` plano en esta fase de arquitectura, sin el `OptionIdOf<Q>` de compilación de QBV1; este validador es la red de seguridad en su lugar). */
function validateAnswerRefOptionValues(bank: QuestionBankV2): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const optionsByQuestion = new Map(bank.map((question) => [question.id, new Set(question.options.map((option) => option.value))]));
  for (const question of bank) {
    for (const { question: targetId, values } of gateRules(question).flatMap(collectAnswerRefValueChecks)) {
      const validOptions = optionsByQuestion.get(targetId);
      if (!validOptions) continue; // ya reportado por validateAnswerRefs
      for (const value of values) {
        if (!validOptions.has(value)) issues.push({ code: "CROSS_QUESTION_OPTION_MISUSE", questionId: question.id, message: `${question.id} cita el valor «${value}» de ${targetId}, pero esa pregunta no tiene esa opción` });
      }
    }
  }
  return issues;
}

/**
 * Hallazgo de revisión de dominio independiente: `foldSignalProductions` (`qbv2-signals.ts`) resuelve
 * un empate de fuerza entre dos preguntas por orden alfabético de `QuestionId` — determinista, pero
 * INCIDENTAL, no una decisión editorial revisada. Con 100-150 preguntas (DIAG-V3-08B.3), dos módulos
 * distintos podrían terminar produciendo el mismo campo (p. ej. dos preguntas de `deliveryMode` con
 * distinto enfoque) sin que nadie lo decidiera a propósito, y un simple renombrado de ID podría voltear
 * en silencio cuál de dos respuestas reales del usuario determina el archetype. Este validador señala
 * (no bloquea el diseño, solo exige que sea una decisión consciente) cuándo dos o más preguntas del
 * banco pueden producir el MISMO slot escalar — nunca para `friction`, que acumula por diseño (§26 del
 * modelo de señales de 08B.1).
 */
function validateProducerCollisions(bank: QuestionBankV2): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const producersBySlot = new Map<string, Set<string>>();
  for (const question of bank) {
    for (const option of question.options) {
      for (const production of option.produces ?? []) {
        const slot = scalarSlotForProduction(production);
        if (!slot || slot === "friction") continue;
        if (!producersBySlot.has(slot)) producersBySlot.set(slot, new Set());
        producersBySlot.get(slot)!.add(question.id);
      }
    }
  }
  for (const [slot, questionIds] of producersBySlot) {
    if (questionIds.size > 1) issues.push({ code: "AMBIGUOUS_FIELD_PRODUCERS", message: `${questionIds.size} preguntas pueden producir «${slot}»: ${[...questionIds].sort().join(", ")} — decisión de precedencia sin revisar` });
  }
  return issues;
}

/** §49, §37: sin ciclos en el grafo AnswerRef-only (reutiliza el mismo detector que DIAG-V3-03, `questions.ts`). */
function validateNoAnswerCycles(bank: QuestionBankV2): ValidationIssue[] {
  const graph: Record<string, readonly string[]> = Object.fromEntries(bank.map((question) => [question.id, gateRules(question).length > 0 ? gateRules(question).flatMap(collectAnswerDependencies) : []]));
  const cycles = findDependencyCycles(graph);
  return cycles.map((cycle) => ({ code: "ANSWER_DEPENDENCY_CYCLE", message: `ciclo de dependencias de respuesta: ${cycle.join(" → ")}` }));
}

/**
 * §43-49: una pregunta NUNCA debería leer, en su `appliesWhen`, el mismo campo de contexto que alguna
 * de sus propias opciones escribe. Precisión (revisión de dominio independiente): esto NO previene una
 * oscilación — la reducción monótona del motor (`qbv2-engine.ts`) ya hace eso imposible incondicional-
 * mente, con o sin auto-referencia. Lo que SÍ previene es contenido MUERTO por diseño: una pregunta
 * auto-referencial pierde la respuesta del usuario para siempre (se descarta en la primera iteración y
 * nunca vuelve), porque su propia contribución resuelve el campo del que depende antes de que se evalúe
 * su elegibilidad. Se detecta en tiempo de validación para que un autor de contenido en 08B.3 no
 * descubra la pregunta muerta solo al ver que su respuesta nunca afecta nada.
 */
function validateNoSelfReferentialContextGating(bank: QuestionBankV2): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const question of bank) {
    const readFields = new Set<string>(gateRules(question).flatMap(collectContextDependencies));
    if (readFields.size === 0) continue;
    const writtenFields = new Set<string>();
    for (const option of question.options) for (const production of option.produces ?? []) writtenFields.add(SIGNAL_PRODUCTION_CONTEXT_FIELD[production.kind]);
    for (const field of readFields) {
      if (writtenFields.has(field)) issues.push({ code: "SELF_REFERENTIAL_CONTEXT_GATE", questionId: question.id, message: `${question.id} depende de contexto.${field} pero también lo escribe — riesgo de oscilación (§43-49)` });
    }
  }
  return issues;
}

const VALIDATORS: readonly ((bank: QuestionBankV2) => ValidationIssue[])[] = [
  validateUniqueIds,
  validateModules,
  validateRoutingRoles,
  validateUnsafeNotEqPrerequisites,
  validateExclusiveOptions,
  validateUnknownCardinality,
  validateNoOrphanQuestions,
  validateScoringDimensions,
  validateAnswerRefs,
  validateAnswerRefOptionValues,
  validateNoAnswerCycles,
  validateNoSelfReferentialContextGating,
  validateProducerCollisions,
];

export function validateQuestionBankV2(bank: QuestionBankV2): readonly ValidationIssue[] {
  return VALIDATORS.flatMap((validator) => validator(bank));
}

export type { QuestionDefinitionV2 };
