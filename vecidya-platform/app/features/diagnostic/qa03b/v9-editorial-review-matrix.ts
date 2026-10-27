import type { QuestionDefinitionV2 } from "../qbv2-contract";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 } from "./specialty-branches-wave1";
import { auditQuestionBankV9, type AuditIssueV9, type AuditGradeV9 } from "./v9-editorial-graph-audit";

/**
 * DIAG-V9 P1b: matriz reproducible, no un evaluador psicométrico.
 * Cada fila y cada opción quedan registradas, pero la ausencia de flags NO
 * significa que la pregunta haya superado una revisión cognitiva humana.
 */
export type EditorialDecisionV9 = "copy_revised" | "needs_semantic_review" | "pending_human_review";
export type EditorialDecisionNoteV9 = {
  readonly status: Exclude<EditorialDecisionV9, "pending_human_review">;
  readonly reason: string;
  readonly nextAction: string;
};

export const V9_P1_EDITORIAL_DECISIONS: Readonly<Record<string, EditorialDecisionNoteV9>> = {
  q2_monetization: {
    status: "copy_revised",
    reason: "Se sustituyó la enumeración negocio/trabajo/organización/proyecto y se mantuvo la distinción entre ingresos y aportes.",
    nextAction: "Entrevistar negocios activos, emprendimientos y organizaciones para comprobar que las opciones resultan interpretables.",
  },
  q2_regularity: {
    status: "copy_revised",
    reason: "Se redujo la enumeración extensa a hechos observables: pedidos, atención de personas y ventas; la frecuencia sigue siendo lo medido.",
    nextAction: "Validar la comprensión con sectores sin pedidos o ventas y posibles variantes por contexto.",
  },
  q2_buyer_recipient_relation: {
    status: "copy_revised",
    reason: "Se aclaró quién paga frente a quién recibe sin asumir que siempre son la misma persona.",
    nextAction: "Comprobar destinatarios distintos en B2B y organizaciones con beneficiarios.",
  },
  q2_reputation_flow: {
    status: "copy_revised",
    reason: "Se reordenó el enunciado para que el sujeto sea quien busca referencias públicas.",
    nextAction: "Verificar que los distintos negocios entienden la diferencia entre opiniones públicas y mensajes privados.",
  },
  q2_demand_trend: {
    status: "needs_semantic_review",
    reason: "Enumera clientes, ventas, citas y pedidos. Un cambio a demanda genérica puede alterar lo que mide el usuario.",
    nextAction: "Inspeccionar opciones y evidencia antes de proponer variantes por modalidad y etapa.",
  },
  q2_capacity_signal: {
    status: "needs_semantic_review",
    reason: "La capacidad de trabajo, atención y pedidos debe contrastarse con opciones multiselección; podría mezclar causas y resultados.",
    nextAction: "Analizar cada respuesta y señales antes de acortar el enunciado.",
  },
  q2_food_menu_visibility: {
    status: "needs_semantic_review",
    reason: "El valor not_applicable dice «Todavía no muestro la oferta», que puede confundirse con falta de claridad digital.",
    nextAction: "Revisar si la exclusión es realmente neutral antes de cualquier cambio de value/kind/evidence o versión.",
  },
  q2_ecommerce_cart_followup: {
    status: "needs_semantic_review",
    reason: "«No puedo contactar con permiso» es exclusión distinta de no hacer seguimiento cuando es posible.",
    nextAction: "Preservar el permiso y probar interpretaciones de respuesta; no cambiar kind ni puntuación sin migración.",
  },
} as const;

export type EditorialAnswerMatrixV9 = {
  readonly value: string;
  readonly label: string;
  readonly kind: string;
  readonly exclusive: boolean;
  readonly produces: readonly string[];
  readonly readsAs: readonly { readonly dimension: string; readonly directness: "direct" | "supporting" | "contextual"; readonly state: string }[];
  readonly reviewFlags: readonly ("long_label" | "ambiguous_choice" | "needs_neutral_check" | "missing_evidence_mapping" | "neutral_with_evidence")[];
};

export type EditorialMatrixRowV9 = {
  readonly id: string;
  readonly version: number;
  readonly grade: AuditGradeV9;
  readonly module: string;
  readonly prompt: string;
  readonly hint: string | null;
  readonly options: readonly EditorialAnswerMatrixV9[];
  readonly variants: readonly {
    readonly target: unknown; readonly prompt: string | null; readonly hint: string | null;
    readonly optionLabels: Readonly<Record<string, string>>;
  }[];
  readonly answerDependencies: readonly string[];
  readonly contextDependencies: readonly string[];
  readonly evidenceMigration: "pending" | "migrated" | "unmarked";
  readonly structuralIssues: readonly AuditIssueV9[];
  readonly decision: EditorialDecisionV9;
  readonly decisionReason: string | null;
  readonly nextAction: string;
};

export type EditorialMatrixResultV9 = {
  readonly rows: readonly EditorialMatrixRowV9[];
  readonly summary: {
    readonly questions: number;
    readonly options: number;
    readonly variants: number;
    readonly revised: number;
    readonly semanticReview: number;
    readonly pendingHumanReview: number;
    readonly answersWithEvidence: number;
    readonly answersWithoutEvidence: number;
    readonly reviewFlags: number;
  };
};

/** Inventario de cada respuesta, con su posible lectura en cada dimensión, SIN atribuir puntuaciones nuevas. */
export function buildEditorialMatrixV9(bank: readonly QuestionDefinitionV2[]): EditorialMatrixResultV9 {
  const graph = auditQuestionBankV9(bank);
  const ids = new Set(bank.map((q) => q.id));
  for (const id of Object.keys(V9_P1_EDITORIAL_DECISIONS)) {
    // Una decisión sobre una pregunta retirada debe detectarse al ejecutar P1.
    if (!ids.has(id) && bank === QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2) throw new Error("Decisión editorial sin pregunta: " + id);
  }
  const rows: EditorialMatrixRowV9[] = bank.map((q) => {
    const item = graph.questions.find((candidate) => candidate.id === q.id)!;
    const decision = V9_P1_EDITORIAL_DECISIONS[q.id];
    return {
      id: q.id, version: q.version, grade: item.grade, module: q.module,
      prompt: q.prompt, hint: q.hint ?? null,
      options: q.options.map((option) => {
        const readsAs = (q.evidenceV3?.dimensions ?? []).flatMap((dimension) => {
          const state = dimension.answers[option.value];
          return state === undefined ? [] : [{ dimension: dimension.dimension, directness: dimension.directness, state }];
        });
        const flags: EditorialAnswerMatrixV9["reviewFlags"][number][] = [];
        if (option.label.length > 110) flags.push("long_label");
        if (q.evidenceMigration === "migrated" && (q.evidenceV3?.dimensions ?? []).some((dimension) => dimension.answers[option.value] === undefined)) flags.push("missing_evidence_mapping");
        if ((option.kind === "none" || option.kind === "not_applicable" || option.kind === "unknown") && readsAs.length > 0) flags.push("neutral_with_evidence");
        if (/\b(?:siempre|nunca|normalmente|frecuentemente)\b/i.test(option.label)) flags.push("ambiguous_choice");
        if ((option.kind === "none" || option.kind === "not_applicable") && q.evidenceMigration !== "migrated") flags.push("needs_neutral_check");
        return {
          value: option.value, label: option.label, kind: option.kind ?? "value", exclusive: option.exclusive ?? false,
          produces: (option.produces ?? []).map((signal) => signal.kind), readsAs,
          reviewFlags: flags,
        };
      }),
      variants: item.variants,
      answerDependencies: item.answerDependencies,
      contextDependencies: item.contextDependencies,
      evidenceMigration: item.evidenceMigration,
      structuralIssues: item.flags,
      decision: decision?.status ?? "pending_human_review",
      decisionReason: decision?.reason ?? null,
      nextAction: decision?.nextAction ?? "Revisar enunciado, opciones, ayuda, variantes, dependencia y aplicación en prueba cognitiva.",
    };
  });
  const options = rows.flatMap((row) => row.options);
  const revised = rows.filter((r) => r.decision === "copy_revised").length;
  const semanticReview = rows.filter((r) => r.decision === "needs_semantic_review").length;
  return {
    rows,
    summary: {
      questions: rows.length,
      options: options.length,
      variants: rows.reduce((total, row) => total + row.variants.length, 0),
      revised,
      semanticReview,
      pendingHumanReview: rows.length - revised - semanticReview,
      answersWithEvidence: options.filter((option) => option.readsAs.length > 0).length,
      answersWithoutEvidence: options.filter((option) => option.readsAs.length === 0).length,
      reviewFlags: options.reduce((total, option) => total + option.reviewFlags.length, 0),
    },
  };
}

export type EditorialReviewPriorityV9 = "high" | "medium" | "low";

export type EditorialReviewItemV9 = {
  readonly priority: EditorialReviewPriorityV9;
  readonly questionId: string;
  readonly optionValue: string;
  readonly flags: EditorialAnswerMatrixV9["reviewFlags"];
  readonly decision: EditorialDecisionV9;
  readonly nextAction: string;
};

/** Prioridad de revisión, no severidad ni puntuación del diagnóstico. */
export function classifyEditorialReviewPriorityV9(flags: EditorialAnswerMatrixV9["reviewFlags"]): EditorialReviewPriorityV9 {
  if (flags.includes("missing_evidence_mapping")) return "high";
  if (flags.includes("neutral_with_evidence") || flags.includes("needs_neutral_check")) return "medium";
  return "low";
}

/** Cola editorial reproducible: solo opciones con alertas, sin alterar el banco. */
export function buildEditorialReviewQueueV9(matrix: EditorialMatrixResultV9): readonly EditorialReviewItemV9[] {
  return matrix.rows.flatMap((row) =>
    row.options
      .filter((option) => option.reviewFlags.length > 0)
      .map((option) => ({
        questionId: row.id,
        priority: classifyEditorialReviewPriorityV9(option.reviewFlags),
        optionValue: option.value,
        flags: option.reviewFlags,
        decision: row.decision,
        nextAction: row.nextAction,
      })),
  );
}

export type EditorialReviewBatchV9 = {
  readonly questionId: string;
  readonly priority: EditorialReviewPriorityV9;
  readonly items: readonly EditorialReviewItemV9[];
  readonly nextAction: string;
};

/** Agrupa por pregunta y ordena por prioridad, manteniendo el orden del banco en empates. */
export function buildEditorialReviewBatchesV9(matrix: EditorialMatrixResultV9): readonly EditorialReviewBatchV9[] {
  const rank: Record<EditorialReviewPriorityV9, number> = { high: 0, medium: 1, low: 2 };
  const queue = buildEditorialReviewQueueV9(matrix);
  const batches = matrix.rows.flatMap((row) => {
    const items = queue.filter((item) => item.questionId === row.id);
    if (items.length === 0) return [];
    const priority = items.reduce<EditorialReviewPriorityV9>(
      (current, item) => rank[item.priority] < rank[current] ? item.priority : current, "low",
    );
    return [{ questionId: row.id, priority, items, nextAction: row.nextAction }];
  });
  return batches.sort((a, b) => rank[a.priority] - rank[b.priority]);
}

export function buildCandidateEditorialMatrixV9(): EditorialMatrixResultV9 {
  return buildEditorialMatrixV9(QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2);
}
