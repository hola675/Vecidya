import { QUESTION_BANK_V2 } from "./qbv2-bank";
import { renderQuestionV2 } from "./qbv2-copy";
import type { ContextualConfidenceLevel, ContextualScoringResult } from "./qbv2-contextual-scoring";
import { DIGITAL_DIMENSION_IDS, type DigitalDimensionId } from "./qbv2-coverage";
import { resolveEligibleQuestionsV2, type QuestionBankV2 } from "./qbv2-engine";
import { DIMENSION_RESULT_CONCEPT, LIFECYCLE_ORDER, resultCertainty, resultSubject, type ResultCertainty } from "./qbv2-language";
import { DEPENDENCY_STATEMENTS, DIMENSION_NARRATIVE, DIMENSION_STATEMENTS, PRIORITY_FOCUS, QUESTION_TOPICS, RELEVANCE_REASONS, type ReadingPolarity } from "./qbv2-narrative-phrases";
import type { ConstraintPriorityResult, DiagnosticPriority, PriorityReasonCode } from "./qbv2-priorities";
import type { AnswersV2 } from "./qbv2-rules";
import type { SemanticDiagnosticFacts, SemanticFact } from "./qbv2-semantic-facts";
import { TERMINOLOGY, resolveTerminologyProfile, type TerminologyProfileId } from "./qbv2-terminology";

/**
 * DIAG-V3-08G — Natural Narrative. Traduce las salidas congeladas del motor (contexto, scores, confianza,
 * restricciones, prioridades y Semantic Facts) a un resultado estructurado y legible. No es un segundo motor:
 * no recalcula scores, confianza, restricciones, orden de prioridades, contradicciones ni certeza; si una frase
 * necesitara una conclusión ausente de los hechos, la frase sería incorrecta. Determinista, sin IA en tiempo de
 * ejecución y sin marcado de UI: cada bloque conserva su procedencia para la interfaz y el PDF.
 */

export const NARRATIVE_VERSION = 1 as const;

export const NARRATIVE_BLOCK_KINDS = ["summary", "current_state", "strength", "weakness", "partial", "dependency", "constraint", "priority", "priority_reason", "contradiction", "uncertainty", "evidence_gap", "dimension", "next_focus"] as const;
export type NarrativeBlockKind = (typeof NARRATIVE_BLOCK_KINDS)[number];

/** Unidad mínima de texto con su procedencia: de qué hechos, preguntas, prioridad o contexto sale. */
export type NarrativeBlock = {
  readonly id: string;
  readonly kind: NarrativeBlockKind;
  readonly text: string;
  readonly certainty: ResultCertainty;
  readonly sourceFactIds: readonly string[];
  readonly sourceQuestionIds: readonly string[];
  /** Campos de contexto usados (p. ej. `growthStage`), cuando la frase describe la situación y no una capacidad. */
  readonly sourceContext: readonly string[];
  readonly dimension?: DigitalDimensionId;
  readonly priorityRank?: 1 | 2 | 3;
};

/** Estados de presentación derivados de los hechos; no es un sistema nuevo de umbrales. */
export const DIMENSION_PRESENTATION_STATUSES = ["strong", "positive_signal", "partial", "weak", "uncertain", "not_assessed", "not_applicable"] as const;
export type DimensionPresentationStatus = (typeof DIMENSION_PRESENTATION_STATUSES)[number];

export const DIMENSION_STATUS_LABELS: Readonly<Record<DimensionPresentationStatus, string>> = {
  strong: "sólido", positive_signal: "señales positivas", partial: "parcial", weak: "necesita refuerzo", uncertain: "sin información suficiente", not_assessed: "no evaluado", not_applicable: "no aplica",
};
/** El score estima la capacidad; la confianza, la fuerza de la evidencia. Se presentan siempre por separado. */
export const CONFIDENCE_LABELS: Readonly<Record<ContextualConfidenceLevel, string>> = { high: "evidencia sólida", medium: "evidencia moderada", low: "evidencia limitada" };

export type DimensionInterpretation = {
  readonly dimension: DigitalDimensionId;
  readonly label: string;
  readonly status: DimensionPresentationStatus;
  readonly statusLabel: string;
  /** `null` cuando no hay lectura: nunca se presenta como porcentaje. */
  readonly score: number | null;
  readonly confidence: ContextualConfidenceLevel;
  readonly confidenceLabel: string;
  readonly certainty: ResultCertainty;
  readonly headline: string;
  readonly interpretation: NarrativeBlock;
  /** Preguntas que sostienen la lectura, con su tema legible. */
  readonly evidence: readonly { readonly questionId: string; readonly topic: string }[];
};

export type NarrativePriority = {
  readonly rank: 1 | 2 | 3;
  readonly slot: DiagnosticPriority["slot"];
  readonly dimension: DigitalDimensionId;
  readonly focus: string;
  readonly certainty: ResultCertainty;
  readonly statement: NarrativeBlock;
  readonly why: NarrativeBlock;
};

export type DiagnosticNarrative = {
  readonly version: typeof NARRATIVE_VERSION;
  readonly profile: TerminologyProfileId;
  readonly lifecycle: "prelaunch" | "live";
  readonly executiveSummary: readonly NarrativeBlock[];
  readonly currentState: NarrativeBlock;
  readonly strengths: readonly NarrativeBlock[];
  readonly weaknesses: readonly NarrativeBlock[];
  readonly primaryConstraint: NarrativeBlock | null;
  /** En el orden de 08D; como mucho principal, secundaria y de apoyo. */
  readonly priorities: readonly NarrativePriority[];
  readonly contradictions: readonly NarrativeBlock[];
  readonly uncertainties: readonly NarrativeBlock[];
  readonly dimensions: readonly DimensionInterpretation[];
  readonly nextFocus: NarrativeBlock;
};

export type NarrativeInput = {
  readonly answers: AnswersV2;
  readonly scoring: ContextualScoringResult;
  readonly priorities: ConstraintPriorityResult;
  readonly semanticFacts: SemanticDiagnosticFacts;
  readonly bank?: QuestionBankV2;
};

// ── Utilidades de composición ───────────────────────────────────────────────

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
const withoutPeriod = (text: string) => text.replace(/\.$/, "");
/** Contracciones obligatorias al componer fragmentos («de el» → «del», «a el» → «al»). */
const contract = (text: string) => text.replace(/\bde el\b/g, "del").replace(/\ba el\b/g, "al");
const joinList = (items: readonly string[]) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} y ${items.at(-1)}`);
const unique = <T>(items: readonly T[]) => [...new Set(items)];
const topicsOf = (questionIds: readonly string[]) => unique(questionIds).filter((id) => QUESTION_TOPICS[id]).map((id) => ({ questionId: id, topic: QUESTION_TOPICS[id]! }));
function topicList(questionIds: readonly string[]): string {
  const topics = topicsOf(questionIds).map((item) => item.topic);
  if (topics.length <= 3) return joinList(topics);
  const rest = topics.length - 3;
  return `${topics.slice(0, 3).join(", ")} y ${rest === 1 ? "otra respuesta" : `otras ${rest} respuestas`}`;
}
const READINGS: ReadonlySet<SemanticFact["type"]> = new Set(["strength", "partial", "weakness"]);

type BlockDraft = Omit<NarrativeBlock, "sourceQuestionIds" | "sourceContext" | "sourceFactIds"> & { readonly sourceFactIds?: readonly string[]; readonly sourceQuestionIds?: readonly string[]; readonly sourceContext?: readonly string[] };
const block = (draft: BlockDraft): NarrativeBlock => ({ ...draft, text: contract(draft.text), sourceFactIds: draft.sourceFactIds ?? [], sourceQuestionIds: unique(draft.sourceQuestionIds ?? []), sourceContext: draft.sourceContext ?? [] });

// ── Constructor ─────────────────────────────────────────────────────────────

export function buildDiagnosticNarrative(input: NarrativeInput): DiagnosticNarrative {
  const bank = input.bank ?? QUESTION_BANK_V2;
  const context = resolveEligibleQuestionsV2(input.answers, bank).context;
  const profile = resolveTerminologyProfile(context, input.answers);
  const terms = TERMINOLOGY[profile].terms;
  const facts = input.semanticFacts.facts;
  const stage = (context.growthStage as { status?: string; value?: string } | undefined);
  const lifecycle: DiagnosticNarrative["lifecycle"] = profile === "prelaunch" || (stage?.status === "resolved" && stage.value === "idea") ? "prelaunch" : "live";
  const business = capitalize(terms.business);
  const offer = profile === "nonprofit" || profile === "prelaunch" ? terms.offer : "lo que ofreces";
  const label = (dimension: DigitalDimensionId) => DIMENSION_NARRATIVE[dimension].label;
  const topic = (dimension: DigitalDimensionId) => (dimension === "clarity_positioning" ? `la claridad de ${offer}` : DIMENSION_NARRATIVE[dimension].topic);
  const dependencyStatement = (dimension: DigitalDimensionId) => DEPENDENCY_STATEMENTS[dimension] ?? `${capitalize(topic(dimension))} depende demasiado de un solo canal o persona.`;
  const concept = (dimension: DigitalDimensionId) => DIMENSION_RESULT_CONCEPT[dimension];
  const readingOf = (dimension: DigitalDimensionId) => facts.find((fact) => fact.dimension === dimension && READINGS.has(fact.type));
  const gapOf = (dimension: DigitalDimensionId) => facts.find((fact) => fact.type === "evidence_gap" && fact.dimension === dimension);
  const scoreOf = (dimension: DigitalDimensionId) => input.scoring.dimensions.find((item) => item.id === dimension)!;

  /** Sujeto de una lectura según la etapa que observaron sus preguntas (continuidad congelada de 08F). */
  function subjectFor(fact: SemanticFact, polarity: ReadingPolarity): string {
    const signals = polarity === "weakness" ? fact.signals?.negative : fact.signals?.positive;
    const questionIds = signals && signals.length > 0 ? signals.map((signal) => signal.questionId) : fact.provenance.questionIds;
    const subject = resultSubject({ ...fact, provenance: { ...fact.provenance, questionIds } }, profile);
    return subject && LIFECYCLE_ORDER[subject.stage] !== undefined ? subject.term : "los pendientes";
  }
  function statement(fact: SemanticFact): string {
    const polarity = fact.type as ReadingPolarity;
    return DIMENSION_STATEMENTS[fact.dimension!][polarity]({ conversion: terms.conversion, subject: subjectFor(fact, polarity), offer });
  }
  /** Marco de certeza 08F: confirmado se afirma; probable empieza por «Hay señales de que…». */
  function framed(fact: SemanticFact): string {
    const text = statement(fact);
    if (resultCertainty(fact) === "confirmed") return text;
    return fact.type === "strength" ? `Hay señales de que ${lowerFirst(withoutPeriod(text))}, aunque se basa en poca evidencia.` : `Hay señales de que ${lowerFirst(text)}`;
  }
  const readingBlock = (fact: SemanticFact, kind: NarrativeBlockKind): NarrativeBlock => block({
    id: `${kind}:${fact.dimension}`, kind, text: framed(fact), certainty: resultCertainty(fact), sourceFactIds: [fact.id], sourceQuestionIds: fact.provenance.questionIds, dimension: fact.dimension,
  });

  // Prioridades (orden 08D intacto) y restricción principal.
  const priorityFacts = facts.filter((fact) => fact.type === "priority").sort((a, b) => a.priority!.rank - b.priority!.rank);
  const constraintFor = (fact: SemanticFact) => input.priorities.priorities.find((item) => item.rank === fact.priority!.rank)!;
  const primary = priorityFacts[0];
  const primaryConstraintData = primary ? constraintFor(primary) : undefined;
  const dependencyFactIds = (dimension: DigitalDimensionId) => facts.filter((fact) => fact.type === "dependency" && fact.dimension === dimension).map((fact) => fact.id);

  function structuralClause(item: DiagnosticPriority, certainty: ResultCertainty): string | undefined {
    const blocks = item.dependency.blocks.map(topic);
    const has = (code: PriorityReasonCode) => item.reasonCodes.includes(code);
    if (has("active_bottleneck") && item.dependency.upstream.length > 0) return `${capitalize(joinList(item.dependency.upstream.map(topic)))} ya funciona, así que el interés llega, pero ${certainty === "confirmed" ? "se pierde" : "puede estar perdiéndose"} en este punto.`;
    if (has("capacity_gate") && blocks.length > 0) return `De esta base depende poder sostener ${joinList(blocks)}.`;
    if (has("prerequisite_of_relevant") && blocks.length > 0) return `${capitalize(topic(item.dimension))} es un requisito para ${joinList(blocks)}.`;
    if (has("single_point_dependency")) return dependencyStatement(item.dimension);
    if (has("optimization_unverifiable") && item.dependency.informs.length > 0) return `Sin medir, no se puede saber si los cambios en ${joinList(item.dependency.informs.map(topic))} funcionan.`;
    if (has("declared_friction_unconfirmed")) return "Señalaste este freno, pero la evidencia todavía no alcanza para confirmarlo.";
    if (has("no_direct_evidence")) return "Todavía no hay evidencia directa para evaluarlo.";
    return undefined;
  }
  function relevanceClause(item: DiagnosticPriority): string | undefined {
    const reason = RELEVANCE_REASONS.find((code) => item.reasonCodes.includes(code));
    if (reason === "friction_primary") return "Coincide con lo que señalaste como principal freno.";
    if (reason === "goal_primary") return "Es lo que más se relaciona con lo que quieres lograr primero.";
    if (reason === "friction_related" || reason === "goal_related") return "Está relacionado con lo que quieres mejorar.";
    return undefined;
  }
  const severityClause = (item: DiagnosticPriority) => `La evidencia muestra ${item.severity === "material" ? "una capacidad débil" : "una capacidad solo parcial"} en ${topic(item.dimension)}.`;

  const priorities: NarrativePriority[] = priorityFacts.map((fact) => {
    const item = constraintFor(fact);
    const certainty = resultCertainty(fact);
    const focus = PRIORITY_FOCUS[fact.semanticCode]!({ conversion: terms.conversion, concept: concept(item.dimension), offer });
    const lead = fact.priority!.rank === 1
      ? certainty === "unknown" ? `Antes de actuar, conviene ${focus}.` : certainty === "probable" ? `Probablemente convenga empezar por ${focus}.` : `Conviene empezar por ${focus}.`
      : `${fact.priority!.rank === 2 ? "Después" : "Como apoyo"}, ${certainty === "probable" ? "probablemente convenga" : certainty === "unknown" ? "conviene verificar antes" : "conviene"} ${focus}.`;
    const reasons = unique([structuralClause(item, certainty), relevanceClause(item)].filter((text): text is string => Boolean(text)));
    const sources = { sourceFactIds: [fact.id, ...dependencyFactIds(item.dimension)], sourceQuestionIds: fact.provenance.questionIds, dimension: item.dimension, priorityRank: fact.priority!.rank };
    return {
      rank: fact.priority!.rank, slot: item.slot, dimension: item.dimension, focus, certainty,
      statement: block({ id: `priority:${fact.priority!.rank}`, kind: "priority", text: capitalize(lead), certainty, ...sources }),
      why: block({ id: `priority_reason:${fact.priority!.rank}`, kind: "priority_reason", text: (reasons.length > 0 ? reasons : [severityClause(item)]).slice(0, 2).join(" "), certainty, ...sources }),
    };
  });

  let primaryConstraint: NarrativeBlock | null = null;
  if (primary && primaryConstraintData) {
    const certainty = resultCertainty(primary);
    const reading = readingOf(primaryConstraintData.dimension);
    const dimension = primaryConstraintData.dimension;
    const text = certainty === "unknown" || !reading
      ? `Falta información para evaluar ${concept(dimension)}; conviene confirmarlo antes de actuar.`
      : [framed(reading), structuralClause(primaryConstraintData, certainty)].filter(Boolean).join(" ");
    primaryConstraint = block({ id: "constraint:primary", kind: "constraint", text, certainty, sourceFactIds: [primary.id, ...(reading ? [reading.id] : []), ...dependencyFactIds(dimension)], sourceQuestionIds: primary.provenance.questionIds, dimension, priorityRank: 1 });
  }

  // Fortalezas: confirmadas primero; las señales solo si se relacionan con la meta o la fricción. Máximo 3.
  const strengthFacts = facts.filter((fact) => fact.type === "strength");
  const relevant = (fact: SemanticFact) => fact.relevance.goal !== "none" || fact.relevance.friction !== "none";
  const strengths = [...strengthFacts.filter((fact) => fact.certainty === "confirmed"), ...strengthFacts.filter((fact) => fact.certainty !== "confirmed" && relevant(fact))].slice(0, 3).map((fact) => readingBlock(fact, "strength"));
  const strengthSelection = strengths.length > 0 ? strengths : strengthFacts.slice(0, 1).map((fact) => readingBlock(fact, "strength"));

  // Debilidades, capacidades parciales y dependencias, sin repetir la restricción principal. Máximo 4.
  // Una dependencia ya explicada como razón de una prioridad no se repite aquí.
  const primaryDimension = primaryConstraint?.dimension;
  const priorityDimensions = new Set(priorities.map((item) => item.dimension));
  const weaknesses = facts
    .filter((fact) => (fact.type === "weakness" || fact.type === "partial" || (fact.type === "risk" && !priorityDimensions.has(fact.dimension!))) && fact.dimension !== primaryDimension)
    .slice(0, 4)
    .map((fact) => fact.type === "risk"
      ? block({ id: `dependency:${fact.dimension}`, kind: "dependency", text: resultCertainty(fact) === "confirmed" ? dependencyStatement(fact.dimension!) : `Hay señales de que ${lowerFirst(dependencyStatement(fact.dimension!))}`, certainty: resultCertainty(fact), sourceFactIds: [fact.id], sourceQuestionIds: fact.provenance.questionIds, dimension: fact.dimension })
      : readingBlock(fact, fact.type === "weakness" ? "weakness" : "partial"));

  // Contradicciones con los dos lados visibles.
  const frictionQuestion = bank.find((question) => question.id === "q2_friction");
  const frictionLabel = (() => {
    const value = input.answers.q2_friction;
    if (!frictionQuestion || typeof value !== "string") return undefined;
    return renderQuestionV2(frictionQuestion, { context, answers: input.answers }).options.find((option) => option.value === value)?.label;
  })();
  const contradictions = facts.filter((fact) => fact.type === "contradiction").map((fact) => {
    if (fact.semanticCode === "declared_friction_not_observed") {
      const text = frictionLabel
        ? `Señalaste como principal freno «${frictionLabel}», pero ${topic(fact.dimension!)} se ve sólido en tus respuestas; el freno podría estar en otra parte.`
        : `Lo que señalaste como principal freno no se ve en tus respuestas sobre ${topic(fact.dimension!)}; el freno podría estar en otra parte.`;
      return block({ id: fact.id, kind: "contradiction", text, certainty: resultCertainty(fact), sourceFactIds: [fact.id], sourceQuestionIds: ["q2_friction", ...fact.provenance.questionIds], sourceContext: ["primaryFriction"], dimension: fact.dimension });
    }
    const pairs = fact.contradiction?.pairs ?? [];
    const positives = topicList(unique(pairs.map((pair) => pair.positive)));
    const negatives = topicList(unique(pairs.map((pair) => pair.negative)));
    return block({ id: fact.id, kind: "contradiction", text: `Hay señales mixtas en ${topic(fact.dimension!)}: funciona bien en cuanto a ${positives}, pero no en cuanto a ${negatives}.`, certainty: resultCertainty(fact), sourceFactIds: [fact.id], sourceQuestionIds: fact.provenance.questionIds, dimension: fact.dimension });
  });

  // Incertidumbre e información insuficiente: nunca se convierten en debilidad.
  const gapText = (fact: SemanticFact): string | undefined => {
    const dimension = fact.dimension!;
    switch (fact.gap?.kind) {
      case "insufficient_evidence": return `No hay suficiente información para evaluar ${concept(dimension)} con confianza.`;
      case "legitimate_uncertainty": return `Todavía no se puede observar ${concept(dimension)}: ${terms.business} aún no está en marcha.`;
      case "unobservable_in_context": return `Con lo que se preguntó, no hay una forma directa de observar ${concept(dimension)}.`;
      case "declared_friction_unconfirmed": return `Señalaste un freno relacionado con ${concept(dimension)}, pero la evidencia no alcanza para confirmarlo.`;
      default: return undefined;
    }
  };
  const uncertainties = [
    ...facts.filter((fact) => fact.type === "evidence_gap").flatMap((fact) => {
      const text = gapText(fact);
      return text ? [block({ id: fact.id, kind: "evidence_gap", text, certainty: "unknown", sourceFactIds: [fact.id], sourceQuestionIds: fact.provenance.questionIds, sourceContext: fact.gap?.kind === "legitimate_uncertainty" ? ["growthStage"] : [], dimension: fact.dimension })] : [];
    }),
    ...facts.filter((fact) => fact.type === "uncertainty").map((fact) => block({
      id: fact.id, kind: "uncertainty", text: `No estabas seguro sobre ${QUESTION_TOPICS[fact.provenance.questionIds[0]!] ?? topic(fact.dimension!)}, así que esa respuesta no cuenta ni a favor ni en contra.`,
      certainty: "unknown", sourceFactIds: [fact.id], sourceQuestionIds: fact.provenance.questionIds, dimension: fact.dimension,
    })),
  ];

  // Interpretación por dimensión: el «por qué» (evidencia), distinto de la afirmación de las secciones.
  const dimensions: DimensionInterpretation[] = DIGITAL_DIMENSION_IDS.map((dimension) => {
    const scored = scoreOf(dimension);
    const reading = readingOf(dimension);
    const gap = gapOf(dimension);
    const uncertaintyFacts = facts.filter((fact) => fact.type === "uncertainty" && fact.dimension === dimension);
    const mixed = facts.find((fact) => fact.type === "contradiction" && fact.semanticCode === "mixed_signals" && fact.dimension === dimension);
    const status: DimensionPresentationStatus = scored.applicability === "not_applicable" || gap?.gap?.kind === "not_applicable" ? "not_applicable"
      : reading ? reading.type === "strength" ? reading.certainty === "confirmed" ? "strong" : "positive_signal" : reading.type === "partial" ? "partial" : "weak"
      : gap || uncertaintyFacts.length > 0 ? "uncertain" : "not_assessed";
    const questionIds = reading?.provenance.questionIds ?? gap?.provenance.questionIds ?? uncertaintyFacts.flatMap((fact) => fact.provenance.questionIds);
    const topics = topicList(questionIds);
    const sentences: string[] = [];
    switch (status) {
      case "strong": sentences.push(`Las respuestas sobre ${topics} muestran una base sólida.`); break;
      case "positive_signal": sentences.push(`Hay señales positivas en ${topics}, pero con poca evidencia.`); break;
      case "partial": sentences.push(resultCertainty(reading!) === "confirmed" ? `Las respuestas sobre ${topics} muestran una base que funciona solo en parte.` : `Hay señales de que funciona solo en parte, según ${topics}.`); break;
      case "weak": sentences.push(resultCertainty(reading!) === "confirmed" ? `Las respuestas sobre ${topics} muestran que este punto necesita refuerzo.` : `Hay señales de que este punto necesita refuerzo, según ${topics}.`); break;
      case "uncertain": sentences.push("Este punto queda sin lectura por ahora."); break;
      case "not_assessed": sentences.push("El recorrido no incluyó preguntas sobre este punto, así que no se evalúa."); break;
      case "not_applicable": sentences.push(lifecycle === "prelaunch" ? "Esto se podrá evaluar cuando haya actividad real." : "No aplica a tu situación."); break;
    }
    if (mixed) sentences.push("Las respuestas en este punto no van todas en la misma dirección.");
    const certainty: ResultCertainty = reading ? resultCertainty(reading) : "unknown";
    return {
      dimension, label: label(dimension), status, statusLabel: DIMENSION_STATUS_LABELS[status], score: reading ? scored.score : null, confidence: scored.confidence.level, confidenceLabel: CONFIDENCE_LABELS[scored.confidence.level], certainty,
      headline: `${label(dimension)}: ${DIMENSION_STATUS_LABELS[status]}`,
      interpretation: block({ id: `dimension:${dimension}`, kind: "dimension", text: sentences.join(" "), certainty, sourceFactIds: [reading?.id, gap?.id, mixed?.id, ...uncertaintyFacts.map((fact) => fact.id)].filter((id): id is string => Boolean(id)), sourceQuestionIds: questionIds, sourceContext: status === "not_applicable" && lifecycle === "prelaunch" ? ["growthStage"] : [], dimension }),
      evidence: topicsOf(questionIds),
    };
  });

  // Estado actual: la mejor base observada frente a lo que más necesita trabajo.
  const topStrength = strengthFacts.find((fact) => fact.certainty === "confirmed") ?? strengthFacts[0];
  const needsWork = primaryConstraint?.dimension ?? facts.find((fact) => fact.type === "weakness" || fact.type === "partial")?.dimension;
  const currentState = (() => {
    const sources = [topStrength?.id, primary?.id].filter((id): id is string => Boolean(id));
    if (lifecycle === "prelaunch") {
      const text = topStrength
        ? `${business} muestra señales positivas en ${topic(topStrength.dimension!)}; lo que depende de tener actividad real todavía no se puede observar.`
        : `${business} todavía está definiendo lo básico; lo que depende de tener actividad real todavía no se puede observar.`;
      return block({ id: "current_state", kind: "current_state", text, certainty: topStrength ? resultCertainty(topStrength) : "unknown", sourceFactIds: sources, sourceQuestionIds: topStrength?.provenance.questionIds ?? [], sourceContext: ["growthStage"] });
    }
    const base = topStrength ? (topStrength.certainty === "confirmed" ? `${business} ya tiene una base sólida en ${topic(topStrength.dimension!)}` : `${business} muestra señales positivas en ${topic(topStrength.dimension!)}`) : `${business} todavía no muestra un área claramente sólida`;
    const text = needsWork ? `${base}, mientras que ${topic(needsWork)} es lo que más necesita trabajo.` : `${base}, sin un punto débil claro en lo evaluado.`;
    return block({ id: "current_state", kind: "current_state", text, certainty: topStrength ? resultCertainty(topStrength) : primary ? resultCertainty(primary) : "unknown", sourceFactIds: [...sources, ...(needsWork && !primary ? facts.filter((fact) => fact.dimension === needsWork && READINGS.has(fact.type)).map((fact) => fact.id) : [])], sourceQuestionIds: [...(topStrength?.provenance.questionIds ?? []), ...(primary?.provenance.questionIds ?? [])] });
  })();

  // Resumen ejecutivo: estado general, freno principal y primer foco (2–4 frases).
  const readingFacts = facts.filter((fact) => READINGS.has(fact.type));
  const lowConfidence = readingFacts.filter((fact) => fact.confidence === "low");
  const declaredNotObserved = contradictions.find((item) => item.id.startsWith("contradiction:declared_friction"));
  const summary: NarrativeBlock[] = [];
  const primaryCertainty = primary ? resultCertainty(primary) : undefined;
  if (lifecycle === "prelaunch") {
    summary.push(block({ id: "summary:state", kind: "summary", text: `${business} está en preparación: este resultado revisa claridad, validación y preparación, no resultados de operación.`, certainty: "confirmed", sourceContext: ["growthStage"], sourceFactIds: readingFacts.map((fact) => fact.id) }));
  } else if (!primary) {
    summary.push(block({ id: "summary:state", kind: "summary", text: "En lo que se evaluó no aparece un freno que limite claramente el avance.", certainty: strengthFacts.some((fact) => fact.certainty === "confirmed") ? "confirmed" : "probable", sourceFactIds: strengthFacts.map((fact) => fact.id) }));
  } else {
    const text = primaryCertainty === "unknown" ? "Antes de sacar conclusiones hace falta confirmar un punto clave."
      : primaryConstraintData!.severity === "material" ? (primaryCertainty === "confirmed" ? "El diagnóstico encuentra un punto que limita claramente el avance." : "Hay señales de un punto que limita el avance.")
      : "La base funciona en parte y hay aspectos que conviene reforzar.";
    summary.push(block({ id: "summary:state", kind: "summary", text, certainty: primaryCertainty!, sourceFactIds: [primary.id], sourceQuestionIds: primary.provenance.questionIds, priorityRank: 1, dimension: primaryConstraintData!.dimension }));
  }
  if (primary && primaryConstraintData) {
    const dimension = primaryConstraintData.dimension;
    const text = primaryCertainty === "unknown" ? `Lo más importante ahora es comprobar ${concept(dimension)}.` : primaryCertainty === "confirmed" ? `Lo que más limita hoy es ${topic(dimension)}.` : `Lo que más parece limitar hoy es ${topic(dimension)}.`;
    summary.push(block({ id: "summary:constraint", kind: "summary", text, certainty: primaryCertainty!, sourceFactIds: [primary.id], sourceQuestionIds: primary.provenance.questionIds, priorityRank: 1, dimension }));
    if (primaryCertainty !== "unknown") summary.push(block({ id: "summary:focus", kind: "summary", text: `El primer foco es ${priorities[0]!.focus}.`, certainty: primaryCertainty!, sourceFactIds: [primary.id], priorityRank: 1, dimension }));
  } else if (declaredNotObserved) {
    summary.push(block({ ...declaredNotObserved, id: "summary:declared_friction", kind: "summary", text: "Lo que señalaste como principal freno no se confirma en tus respuestas, que muestran ese punto funcionando bien." }));
  }
  if (lifecycle === "live" && lowConfidence.length >= 2 && lowConfidence.length * 2 >= readingFacts.length && summary.length < 4) {
    summary.push(block({ id: "summary:confidence", kind: "summary", text: "Varias lecturas se basan en pocas respuestas: conviene tomarlas como señales, no como conclusiones firmes.", certainty: "probable", sourceFactIds: lowConfidence.map((fact) => fact.id) }));
  }
  if (summary.length < 2) {
    const fallback = topStrength ? `Lo más sólido es ${topic(topStrength.dimension!)}.` : "Todavía no hay lecturas suficientes para destacar un área.";
    summary.push(block({ id: "summary:strength", kind: "summary", text: fallback, certainty: topStrength ? resultCertainty(topStrength) : "unknown", sourceFactIds: topStrength ? [topStrength.id] : readingFacts.map((fact) => fact.id), sourceContext: topStrength ? [] : ["growthStage"] }));
  }

  // Siguiente foco: el orden sugerido, sin repetir las razones.
  const nextFocus = (() => {
    if (priorities.length > 1) {
      const rest = priorities.slice(1).map((item) => (item.rank === 2 ? item.focus : `como apoyo, ${item.focus}`));
      return block({ id: "next_focus", kind: "next_focus", text: `Una vez encaminado lo primero, el orden sigue con ${rest.join("; y ")}.`, certainty: priorities[1]!.certainty, sourceFactIds: priorityFacts.map((fact) => fact.id), priorityRank: 2 });
    }
    if (priorities.length === 1) return block({ id: "next_focus", kind: "next_focus", text: "Por ahora no aparece un segundo foco con evidencia suficiente.", certainty: priorities[0]!.certainty, sourceFactIds: priorityFacts.map((fact) => fact.id), priorityRank: 1 });
    const gaps = uncertainties.filter((item) => item.kind === "evidence_gap");
    if (gaps.length > 0) return block({ id: "next_focus", kind: "next_focus", text: `Siguiente paso: completar la información sobre ${joinList(unique(gaps.map((item) => concept(item.dimension!))))}.`, certainty: "unknown", sourceFactIds: gaps.flatMap((item) => item.sourceFactIds) });
    return block({ id: "next_focus", kind: "next_focus", text: topStrength ? `No hay un foco urgente: lo más útil es mantener ${topic(topStrength.dimension!)}.` : "No hay un foco urgente con la información disponible.", certainty: topStrength ? resultCertainty(topStrength) : "unknown", sourceFactIds: topStrength ? [topStrength.id] : [], sourceContext: topStrength ? [] : ["growthStage"] });
  })();

  return { version: NARRATIVE_VERSION, profile, lifecycle, executiveSummary: summary, currentState, strengths: strengthSelection, weaknesses, primaryConstraint, priorities, contradictions, uncertainties, dimensions, nextFocus };
}

/** Todos los bloques de texto de una narrativa, en orden de lectura (para revisión, pruebas y PDF). */
export function narrativeBlocks(narrative: DiagnosticNarrative): readonly NarrativeBlock[] {
  return [
    ...narrative.executiveSummary, narrative.currentState, ...narrative.strengths, ...narrative.weaknesses, ...(narrative.primaryConstraint ? [narrative.primaryConstraint] : []),
    ...narrative.priorities.flatMap((item) => [item.statement, item.why]), ...narrative.contradictions, ...narrative.uncertainties, ...narrative.dimensions.map((item) => item.interpretation), narrative.nextFocus,
  ];
}
