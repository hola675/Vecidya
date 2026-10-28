import type { QuestionDefinitionV2 } from "../qbv2-contract";
import {
  collectAnswerDependencies,
  collectAnswerRefValueChecks,
  collectContextDependencies,
  type RuleV2,
} from "../qbv2-rules";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 } from "./specialty-branches-wave1";

/**
 * DIAG-V9-LEX-GRAPH P0/P1: inventario y pre-auditoría del candidato, no runtime.
 * Solo lee preguntas existentes: ni planifica ni cambia elegibilidad, score o replay.
 *
 * Una dependencia sintáctica no demuestra que la rama sea alcanzable.
 * Los flags editoriales son pistas para revisión humana, NO veredictos validados.
 */
export type AuditGradeV9 = "G0" | "G1" | "G2" | "G3" | "G4" | "G5" | "G6";
export type AuditIssueV9 = {
  readonly code: "duplicate_id" | "duplicate_option" | "unknown_question_ref" | "invalid_option_ref" | "dependency_cycle" | "empty_prompt" | "empty_option_label"
    | "long_prompt_review" | "multi_concept_review" | "generic_subject_review" | "long_option_review" | "missing_neutral_review";
  readonly questionId: string;
  readonly detail: string;
  readonly level: "blocker" | "review";
};
export type AuditEdgeV9 = {
  readonly from: string;
  readonly to: string;
  readonly relation: "answer_reference" | "context_reference" | "evidence_dimension";
  readonly ruleSource?: "appliesWhen" | "materialAppliesWhen";
};
export type AuditQuestionV9 = {
  readonly id: string;
  readonly version: number;
  readonly grade: AuditGradeV9;
  readonly module: string;
  readonly prompt: string;
  readonly hint: string | null;
  readonly type: "single" | "multi";
  readonly purpose: readonly string[];
  readonly routingRole: string | null;
  readonly options: readonly {
    readonly value: string;
    readonly label: string;
    readonly kind: string;
    readonly exclusive: boolean;
    readonly productionKinds: readonly string[];
  }[];
  readonly variants: readonly {
    readonly target: unknown;
    readonly prompt: string | null;
    readonly hint: string | null;
    readonly optionLabels: Readonly<Record<string, string>>;
  }[];
  readonly answerDependencies: readonly string[];
  readonly contextDependencies: readonly string[];
  readonly evidenceMigration: "pending" | "migrated" | "unmarked";
  readonly evidenceDimensions: readonly { readonly id: string; readonly directness: string }[];
  readonly flags: readonly AuditIssueV9[];
};
export type AuditBankV9 = {
  readonly questions: readonly AuditQuestionV9[];
  readonly edges: readonly AuditEdgeV9[];
  readonly issues: readonly AuditIssueV9[];
  readonly summary: {
    readonly questionCount: number;
    readonly optionCount: number;
    readonly variantCount: number;
    readonly migratedCount: number;
    readonly pendingCount: number;
    readonly reviewCount: number;
    readonly blockerCount: number;
    readonly byGrade: Readonly<Record<AuditGradeV9, number>>;
  };
};

const STAGE_IDS = new Set(["q2_entity", "q2_operational_status", "q2_has_customers", "q2_other_staff"]);
const OPERATING_IDS = new Set(["q2_sector", "q2_delivery", "q2_customer_buyer", "q2_customer_reach", "q2_buyer_recipient_relation", "q2_monetization"]);
const PRIORITY_IDS = new Set(["q2_goal", "q2_friction"]);

function gradeFor(question: QuestionDefinitionV2): AuditGradeV9 {
  if (STAGE_IDS.has(question.id)) return "G0";
  if (question.id === "q2_sector" || question.id.startsWith("q2_niche_")) return "G1";
  if (OPERATING_IDS.has(question.id)) return "G2";
  if (PRIORITY_IDS.has(question.id)) return "G3";
  if (question.contradictionRole || question.purpose.includes("confirmation")) return "G6";
  if (question.evidenceMigration === "migrated" && question.evidenceV3) return "G5";
  return "G4";
}

function ruleEdges(question: QuestionDefinitionV2, source: "appliesWhen" | "materialAppliesWhen", rule: RuleV2 | undefined): AuditEdgeV9[] {
  if (!rule) return [];
  return [
    ...collectAnswerDependencies(rule).map((from): AuditEdgeV9 => ({ from, to: question.id, relation: "answer_reference", ruleSource: source })),
    ...collectContextDependencies(rule).map((field): AuditEdgeV9 => ({ from: "context:" + field, to: question.id, relation: "context_reference", ruleSource: source })),
  ];
}

/** Detecta ciclos SOLO de referencias explícitas AnswerRef, no dependencias del contexto inferido. */
export function findAnswerReferenceCyclesV9(edges: readonly AuditEdgeV9[], ids: ReadonlySet<string>): readonly string[][] {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (edge.relation !== "answer_reference" || !ids.has(edge.from) || !ids.has(edge.to)) continue;
    const children = adjacency.get(edge.from) ?? [];
    if (!children.includes(edge.to)) children.push(edge.to);
    adjacency.set(edge.from, children);
  }
  const visited = new Set<string>();
  const active = new Set<string>();
  const stack: string[] = [];
  const found = new Map<string, string[]>();
  const visit = (id: string) => {
    if (active.has(id)) return;
    if (visited.has(id)) return;
    visited.add(id);
    active.add(id);
    stack.push(id);
    for (const next of adjacency.get(id) ?? []) {
      if (active.has(next)) {
        const cycle = [...stack.slice(stack.indexOf(next)), next];
        const canonical = [...new Set(cycle.slice(0, -1))].sort().join("|");
        found.set(canonical, cycle);
      } else visit(next);
    }
    stack.pop();
    active.delete(id);
  };
  for (const id of [...ids].sort()) visit(id);
  return [...found.values()];
}

export function auditQuestionBankV9(bank: readonly QuestionDefinitionV2[]): AuditBankV9 {
  const ids = new Set(bank.map((q) => q.id));
  const byId = new Map(bank.map((q) => [q.id, q] as const));
  const edges: AuditEdgeV9[] = [];
  const issues: AuditIssueV9[] = [];
  const addIssue = (code: AuditIssueV9["code"], questionId: string, detail: string, level: AuditIssueV9["level"]) => {
    issues.push({ code, questionId, detail, level });
  };
  for (const question of bank) {
    if (bank.filter((candidate) => candidate.id === question.id).length > 1 && !issues.some((i) => i.code === "duplicate_id" && i.questionId === question.id)) {
      addIssue("duplicate_id", question.id, "El ID aparece más de una vez", "blocker");
    }
    const seenOptions = new Set<string>();
    for (const option of question.options) {
      if (seenOptions.has(option.value)) addIssue("duplicate_option", question.id, option.value, "blocker");
      seenOptions.add(option.value);
      if (!option.label.trim()) addIssue("empty_option_label", question.id, option.value, "blocker");
      if (option.label.length > 135) addIssue("long_option_review", question.id, option.value + ": " + option.label.length + " caracteres", "review");
    }
    if (!question.prompt.trim()) addIssue("empty_prompt", question.id, "Enunciado vacío", "blocker");
    if (question.prompt.length > 165) addIssue("long_prompt_review", question.id, question.prompt.length + " caracteres", "review");
    if (/negocio, trabajo(?: profesional)?, organización o proyecto|tu actividad, negocio u organización/i.test(question.prompt)) {
      addIssue("generic_subject_review", question.id, "Sujeto genérico: comprobar perfil contextual", "review");
    }
    if ((question.prompt.match(/,|;|\so\s/g) ?? []).length >= 5) {
      addIssue("multi_concept_review", question.id, "La pregunta enumera varios conceptos; verificar si mide una sola cosa", "review");
    }
    if (!question.options.some((option) => option.kind === "unknown")) {
      addIssue("missing_neutral_review", question.id, "Revisar si necesita salida «No lo sé»", "review");
    }
    for (const source of ["appliesWhen", "materialAppliesWhen"] as const) {
      const rule = question[source];
      edges.push(...ruleEdges(question, source, rule));
      if (!rule) continue;
      for (const reference of collectAnswerDependencies(rule)) {
        if (!ids.has(reference)) addIssue("unknown_question_ref", question.id, source + " → " + reference, "blocker");
      }
      for (const reference of collectAnswerRefValueChecks(rule)) {
        const target = byId.get(reference.question);
        if (!target) continue;
        const values = new Set(target.options.map((option) => option.value));
        for (const value of reference.values) {
          if (!values.has(value)) addIssue("invalid_option_ref", question.id, source + " → " + reference.question + "=" + value, "blocker");
        }
      }
    }
    for (const dimension of question.evidenceV3?.dimensions ?? []) {
      edges.push({ from: question.id, to: "dimension:" + dimension.dimension, relation: "evidence_dimension" });
    }
  }
  for (const cycle of findAnswerReferenceCyclesV9(edges, ids)) {
    addIssue("dependency_cycle", cycle[0]!, cycle.join(" → "), "blocker");
  }
  const questions: AuditQuestionV9[] = bank.map((q) => ({
    id: q.id, version: q.version, grade: gradeFor(q), module: q.module,
    prompt: q.prompt, hint: q.hint ?? null, type: q.type,
    purpose: [...q.purpose], routingRole: q.routingRole ?? null,
    options: q.options.map((o) => ({
      value: o.value, label: o.label, kind: o.kind ?? "value",
      exclusive: o.exclusive ?? false, productionKinds: (o.produces ?? []).map((p) => p.kind),
    })),
    variants: (q.variants ?? []).map((v) => ({
      target: v.target, prompt: v.prompt ?? null, hint: v.hint ?? null,
      optionLabels: v.optionLabels ?? {},
    })),
    answerDependencies: [...new Set(edges.filter((edge) => edge.to === q.id && edge.relation === "answer_reference").map((edge) => edge.from))].sort(),
    contextDependencies: [...new Set(edges.filter((edge) => edge.to === q.id && edge.relation === "context_reference").map((edge) => edge.from.replace("context:", "")))].sort(),
    evidenceMigration: q.evidenceMigration ?? "unmarked",
    evidenceDimensions: (q.evidenceV3?.dimensions ?? []).map((d) => ({ id: d.dimension, directness: d.directness })),
    flags: issues.filter((issue) => issue.questionId === q.id),
  }));
  const byGrade: Record<AuditGradeV9, number> = { G0: 0, G1: 0, G2: 0, G3: 0, G4: 0, G5: 0, G6: 0 };
  for (const question of questions) byGrade[question.grade]++;
  return {
    questions, edges, issues,
    summary: {
      questionCount: questions.length,
      optionCount: questions.reduce((sum, question) => sum + question.options.length, 0),
      variantCount: questions.reduce((sum, question) => sum + question.variants.length, 0),
      migratedCount: questions.filter((question) => question.evidenceMigration === "migrated").length,
      pendingCount: questions.filter((question) => question.evidenceMigration === "pending").length,
      reviewCount: issues.filter((issue) => issue.level === "review").length,
      blockerCount: issues.filter((issue) => issue.level === "blocker").length,
      byGrade,
    },
  };
}

/** Export explícito, nunca desde el barrel público. */
export function auditV9CandidateBank(): AuditBankV9 {
  return auditQuestionBankV9(QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2);
}
