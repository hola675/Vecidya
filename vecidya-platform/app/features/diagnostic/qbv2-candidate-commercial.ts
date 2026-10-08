import { buildCandidateRecommendationsAndSolutionsV3, type CandidateRecommendationsAndSolutionsV3 } from "./qbv2-candidate-recommendations";
import {
  COMMERCIAL_V1_COMPLEMENTS, COMMERCIAL_V1_LICENSES, COMMERCIAL_V1_SERVICE_FAMILIES,
  type CommercialClarificationAnswer, type CommercialItem, type CommercialLicense, type CommercialPriority, type ExternalUsageCategory, type LicenseFitConfidence,
} from "./commercial-recommendation";
import type { EvidenceRef } from "./commercial-evidence";
import type { AnswersV2 } from "./qbv2-rules";
import type { SolutionId } from "./qbv2-solutions";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "./qbv2-reviewed-evidence";
import { CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3 } from "./qbv2-candidate-interpretation";
import type { CandidateCalibrationV3 } from "./qbv2-candidate-calibration";

/**
 * DIAG-V3-R6-D — candidate-only commercial boundary. The dependency is strictly one-way:
 * evidence → semantic fact → constraint → priority → recommendation → solution → (here) commercial fit.
 * Commercial availability never feeds back into score/applicability/priority/recommendation/solution, and
 * Digital Health (overall.displayScore/publicLabel/confidence) is display-only here — it never selects a
 * license. This module never calls the legacy `resolveCommercialRecommendation`/`adaptCommercialEvidence`/
 * `matchCommercialOfferings`/`buildDiagnosticOutcome`; those, and their behavior, are untouched.
 *
 * Reconciliation (R6-D §3-5): `qbv2-offerings.ts` is an older solution→offering projection with its own
 * catalog shape; `commercial-recommendation.ts` is the canonical Commercial Product System V1 (prices,
 * license/complement/service contracts match `docs/business/VECIDYA_PRODUCT_CATALOG.md`). This module
 * reuses only the canonical constants/types from `commercial-recommendation.ts`.
 */
export const CANDIDATE_COMMERCIAL_IDENTITY_V3 = "commercial-product-system-v1+diag-v3-candidate-v1" as const;

/** `null` is not a fourth license — it means no recurring license is justified by current evidence yet. */
export type CandidateLicenseFitV3 = {
  readonly recommendedLicense: CommercialLicense | null;
  readonly confidence: LicenseFitConfidence;
  readonly rationale: string;
  readonly whyNotLower: string;
  readonly whyNotHigher: string;
  readonly evidence: readonly EvidenceRef[];
  readonly change: "initial" | "same" | "upgrade" | "downgrade" | "exit_or_none";
  readonly unresolvedSignals: readonly string[];
};

export type CandidateCommercialBoundaryInputV3 = {
  readonly answers: AnswersV2;
  readonly currentLicense?: CommercialLicense;
  readonly clarificationAnswer?: CommercialClarificationAnswer;
  /** DIAG-V3-R8-A: candidate numeric calibration (QA seam); commercial eligibility itself never reads it. */
  readonly calibration?: CandidateCalibrationV3;
};

export type CandidateCommercialBoundaryV3 = CandidateRecommendationsAndSolutionsV3 & {
  readonly commercial: {
    readonly identity: typeof CANDIDATE_COMMERCIAL_IDENTITY_V3;
    readonly licenseFit: CandidateLicenseFitV3;
    readonly now: { readonly license: CommercialLicense | null; readonly complements: readonly CommercialItem[]; readonly services: readonly CommercialItem[] };
    readonly later: { readonly complements: readonly CommercialItem[]; readonly services: readonly CommercialItem[] };
    readonly cost: {
      readonly monthlyLicenseUsd: number | null;
      readonly activationUsd: number | null;
      readonly complements: readonly { readonly id: string; readonly monthlyUsd: number }[];
      readonly externalUsage: readonly { readonly category: ExternalUsageCategory; readonly applies: true }[];
    };
  };
};

const LICENSE_RANK: Readonly<Record<CommercialLicense, number>> = { cuadra: 1, barrio: 2, ciudad: 3 };

/**
 * DIAG-V3-R6-D.2 — honest commercial evidence roles. A question-backed proof takes its role from the
 * certified candidate evidence semantics (R3 `evidenceV3` directness), never a blanket "DIRECT": migrated
 * direct → DIRECT, migrated supporting → SUPPORTING, anything else (context-only/pending) → CONTEXTUAL.
 * Solution-level inferences ("this R6-C solution demonstrates a recurring need") are DERIVED.
 */
export function candidateCommercialEvidenceRoleV3(questionId: string): EvidenceRef["evidenceType"] {
  const question = REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.find((item) => item.id === questionId);
  if (!question || question.evidenceMigration !== "migrated" || !question.evidenceV3) return "CONTEXTUAL";
  const directness = question.evidenceV3.dimensions.map((d) => d.directness);
  return directness.includes("direct") ? "DIRECT" : directness.includes("supporting") ? "SUPPORTING" : "CONTEXTUAL";
}
function questionEvidence(result: CandidateRecommendationsAndSolutionsV3, questionId: string, derivedFact: string): EvidenceRef {
  const role = candidateCommercialEvidenceRoleV3(questionId);
  return { questionId, answerOption: String(result.activeAnswers[questionId] ?? ""), derivedFact, evidenceType: role, relevance: role === "DIRECT" ? "high" : role === "SUPPORTING" ? "medium" : "low" };
}

/**
 * R6-D.2 license proof: a recurring need exists only when the license-bearing solution's recommendation
 * rests on a migrated DIRECT source of its own dimension whose own state is below established — never on
 * supporting refinement, context, or a prelaunch preparation item with no observation behind it.
 */
const BELOW_ESTABLISHED = new Set(["partial", "weak", "dependency", "missing"]);
function hasDirectNeedBasis(result: CandidateRecommendationsAndSolutionsV3, recommendationId: string): boolean {
  const recommendation = result.recommendations.items.find((item) => item.id === recommendationId);
  if (!recommendation) return false;
  const states = new Map(result.scoring.dimensions.flatMap((d) => d.evidence.map((e) => [e.questionId, e.state] as const)));
  return CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3.directQuestionIds(recommendation.dimension).some((id) => BELOW_ESTABLISHED.has(states.get(id) ?? ""));
}

/** Process-scope uncertainty that only an explicit `single_process`/`multiple_coordinated_processes` resolves. */
const PROCESS_SCOPE_UNRESOLVED = "single_process_or_multiple_coordinated_processes";

/** Recurring commercial processes R6-C already certified as evidence-specific — never inferred from profile/goal. */
const BARRIO_SOLUTION_IDS: ReadonlySet<SolutionId> = new Set(["crm_follow_up", "follow_up_automation", "online_booking", "operational_automation"]);

function licenseChange(current: CommercialLicense | undefined, next: CommercialLicense | null): CandidateLicenseFitV3["change"] {
  if (next === null) return "exit_or_none";
  if (current === undefined) return "initial";
  if (current === next) return "same";
  return LICENSE_RANK[next] > LICENSE_RANK[current] ? "upgrade" : "downgrade";
}

/**
 * Candidate license fit: evidence-grounded only. The candidate bank cannot by itself distinguish one
 * principal process from multiple coordinated ones (R6-D §24), so Ciudad is only ever reached through the
 * explicit post-diagnostic clarification, never guessed from automation/stage/score/complement count — and
 * only on top of an evidence-backed recurring commercial need (R6-D.3).
 */
export function resolveCandidateLicenseFitV3(
  result: CandidateRecommendationsAndSolutionsV3,
  currentLicense: CommercialLicense | undefined,
  clarificationAnswer: CommercialClarificationAnswer | undefined,
): CandidateLicenseFitV3 {
  const evidence: EvidenceRef[] = [];
  const addEvidence = (solutionId: SolutionId, recommendationId: string) => evidence.push({ questionId: recommendationId, answerOption: solutionId, derivedFact: "evidence-grounded recurring operational solution", evidenceType: "DERIVED", relevance: "high" });
  const recurring = result.solutions.filter((match) => match.solution && BARRIO_SOLUTION_IDS.has(match.solution.id) && hasDirectNeedBasis(result, match.recommendationId));
  for (const match of recurring) addEvidence(match.solution!.id, match.recommendationId);

  // R6-D.3 (closes DIAG-V3-R7B-CIUDAD-SCOPE-001): the process-scope clarification only discriminates Barrio
  // from Ciudad for an already evidence-backed recurring commercial need — it never creates that need.
  // Without one, every clarification state is out of scope: the license follows the independent
  // Cuadra/no-license evidence below, with no process-scope evidence and no confidence change.
  if (recurring.length > 0) {
    if (clarificationAnswer === "multiple_coordinated_processes") {
      return {
        recommendedLicense: "ciudad", confidence: "high",
        rationale: "La aclaración post-diagnóstico confirma varios procesos operativos coordinados.",
        whyNotLower: "Un solo proceso comercial estándar no cubre la coordinación confirmada.",
        whyNotHigher: "Ciudad es el nivel superior de esta familia.",
        evidence: [...evidence, { questionId: "commercial_process_scope", answerOption: clarificationAnswer, derivedFact: "multiple coordinated operational processes", evidenceType: "DERIVED", relevance: "high" }],
        change: licenseChange(currentLicense, "ciudad"), unresolvedSignals: [],
      };
    }
    // R6-D.2 clarification truth table: only an explicit affirmative `single_process` confirms one
    // principal process. `undefined` keeps the unclarified medium fit; `not_sure` (explicit uncertainty) and
    // `not_applicable` (not offered by the candidate clarification; fail closed) stay unresolved at
    // `to_confirm` and never produce one-process evidence or "confirmed" wording.
    const confirmedSingle = clarificationAnswer === "single_process";
    return {
      recommendedLicense: "barrio", confidence: confirmedSingle ? "high" : clarificationAnswer === undefined ? "medium" : "to_confirm",
      rationale: "La evidencia certificada demuestra un proceso comercial recurrente (captación, agenda o seguimiento) que necesita registro y seguimiento repetible.",
      whyNotLower: "Cuadra no incluye un CRM comercial operativo, pipeline ni seguimiento recurrente.",
      whyNotHigher: confirmedSingle
        ? "La aclaración post-diagnóstico confirma un único proceso principal."
        : clarificationAnswer === undefined
          ? "No se ha confirmado todavía coordinación multiproceso; se cubre con Barrio hasta que la aclaración indique lo contrario."
          : "La aclaración todavía no confirma si se trata de un único proceso o de varios coordinados; se cubre con Barrio hasta confirmarlo.",
      evidence: confirmedSingle
        ? [...evidence, { questionId: "commercial_process_scope", answerOption: clarificationAnswer, derivedFact: "one principal operational process", evidenceType: "DERIVED", relevance: "high" }]
        : evidence,
      change: licenseChange(currentLicense, "barrio"), unresolvedSignals: confirmedSingle ? [] : [PROCESS_SCOPE_UNRESOLVED],
    };
  }

  // Organizational-only need: context (q2_entity, lifecycle) can never be the trigger by itself — R6-D.1
  // corrects an earlier design that used "entity === organization" + live, which was really "entity label"
  // wearing a license, with no actual recurring-need evidence behind it (caught before R6-FINAL). The valid
  // trigger is R6-C's own `work_organization` solution, which (since R6-C.1's direct-basis rule) is only
  // ever selected when a DIRECT Digital Readiness source (q2_process_systemization or
  // q2_operations_information_base) is itself below established — never from supporting refinement or
  // entity/context alone (verified: answering neither leaves `work_organization` unselected for any
  // entity type). Entity may still appear as context, never as the sole or deciding evidence.
  // R6-D.2: a prelaunch `prepare` work_organization (no observed Readiness evidence) is a valid preparation
  // service, never a recurring platform need — the license requires the same DIRECT basis as R6-C.1.
  const workOrganization = result.solutions.find((match) => match.solution?.id === "work_organization" && hasDirectNeedBasis(result, match.recommendationId));
  if (workOrganization) {
    const recommendation = result.recommendations.items.find((item) => item.id === workOrganization.recommendationId)!;
    // R6-D.2: each source keeps its honest R3/V3 role; the license itself rests on the DERIVED solution fact.
    const sourceEvidence: EvidenceRef[] = recommendation.sourceQuestionIds.map((questionId) => questionEvidence(result, questionId, "recurring information/task organization need"));
    return {
      recommendedLicense: "cuadra", confidence: "medium",
      rationale: "La evidencia certificada (R6-C) demuestra una necesidad recurrente de organizar información y tareas, sin requerir todavía un CRM comercial.",
      whyNotLower: "Cuadra es la licencia mínima de entrada al ecosistema Vecidya.",
      whyNotHigher: "No se demuestra un proceso comercial repetible que requiera Barrio ni coordinación multiproceso para Ciudad.",
      evidence: [...evidence, { questionId: workOrganization.recommendationId, answerOption: "work_organization", derivedFact: "evidence-grounded recurring organization need", evidenceType: "DERIVED", relevance: "high" }, ...sourceEvidence, { questionId: "q2_entity", answerOption: String(result.activeAnswers.q2_entity ?? ""), derivedFact: "entity context", evidenceType: "CONTEXTUAL", relevance: "low" }],
      change: licenseChange(currentLicense, "cuadra"), unresolvedSignals: [],
    };
  }

  // No recurring platform need is demonstrated yet. This is the explicit "no license necessary for now"
  // state from the canonical catalog — never a default sale, and never triggered merely by missing evidence.
  return {
    recommendedLicense: null, confidence: evidence.length > 0 ? "medium" : "to_confirm",
    rationale: "La evidencia actual no demuestra una necesidad recurrente de plataforma Vecidya; por ahora no se justifica una licencia.",
    whyNotLower: "No aplica: no se recomienda ninguna licencia todavía.",
    whyNotHigher: "No se demuestra un proceso comercial repetible ni coordinación multiproceso.",
    evidence, change: licenseChange(currentLicense, null), unresolvedSignals: evidence.length === 0 ? ["operational_commercial_evidence"] : [],
  };
}

function complementItem(id: "reputation_reviews" | "connections_integrations", priority: CommercialPriority, rationale: string, evidence: readonly EvidenceRef[]): CommercialItem {
  const catalog = COMMERCIAL_V1_COMPLEMENTS[id];
  const billing = catalog.billing;
  return { id, kind: "complement", name: catalog.name, priority, rationale, evidence, priceMonthlyUsd: catalog.monthlyUsd, priceLabel: billing === "monthly_per_connection" ? `$${catalog.monthlyUsd}/mes/conexión` : `$${catalog.monthlyUsd}/mes`, usageCategories: [...catalog.usageCategories] };
}
function serviceItem(id: string, family: (typeof COMMERCIAL_V1_SERVICE_FAMILIES)[number], priority: CommercialPriority, rationale: string, evidence: readonly EvidenceRef[]): CommercialItem {
  return { id, kind: "service", name: family, priority, rationale, evidence, priceMonthlyUsd: null, priceLabel: null, usageCategories: [] };
}

/**
 * Candidate-only solution→offering mapping. A solution that the license itself already delivers
 * (online_booking, crm_follow_up, follow_up_automation, operational_automation — all standard Barrio/Ciudad
 * capability) produces no separate commercial item: the license IS the offering. Only solutions representing
 * an independent professional service or a recurring add-on produce one. `solution = null` (verify or no
 * evidence-specific match) produces nothing — never a fallback sale.
 */
export function matchCandidateCommercialOfferingsV3(result: CandidateRecommendationsAndSolutionsV3, licenseFit: CandidateLicenseFitV3): { readonly now: readonly CommercialItem[]; readonly later: readonly CommercialItem[] } {
  const crmReady = licenseFit.recommendedLicense === "barrio" || licenseFit.recommendedLicense === "ciudad";
  const now: CommercialItem[] = [];
  const later: CommercialItem[] = [];

  for (const match of result.solutions) {
    if (!match.solution) continue;
    const recommendation = result.recommendations.items.find((item) => item.id === match.recommendationId)!;
    const evidence: EvidenceRef[] = recommendation.sourceQuestionIds.map((questionId) => questionEvidence(result, questionId, recommendation.whatToImprove));
    switch (match.solution.id as SolutionId) {
      case "offer_message": now.push(serviceItem("presence_brand_message", "Presencia & Marca", "NOW", "La evidencia muestra una necesidad de claridad en el mensaje y la propuesta.", evidence)); break;
      case "website": now.push(serviceItem("web_conversion_site", "Web & Conversión", "NOW", "La evidencia muestra una brecha real en la base digital propia.", evidence)); break;
      case "credibility_proof": later.push(serviceItem("presence_brand_credibility", "Presencia & Marca", "LATER", "La evidencia muestra una falta de pruebas visibles de autoridad o trayectoria.", evidence)); break;
      case "reputation_reviews": (crmReady ? now : later).push(complementItem("reputation_reviews", crmReady ? "NOW" : "LATER", "La evidencia muestra una capacidad de reseñas que puede sistematizarse.", evidence)); break;
      case "work_organization": if (licenseFit.recommendedLicense !== "cuadra") later.push(serviceItem("business_development_organization", "Desarrollo Empresarial", "LATER", "La evidencia muestra información y tareas dispersas que conviene ordenar.", evidence)); break;
      // online_booking / crm_follow_up / follow_up_automation / operational_automation are standard license
      // capability (Barrio/Ciudad), not a separate priced item — the license IS the offering here.
      default: break;
    }
  }
  return { now: now.slice(0, 2), later };
}

/**
 * Candidate-only R6-D orchestration: `buildCandidateRecommendationsAndSolutionsV3` (R6-A + R6-B + R6-C) →
 * `resolveCandidateLicenseFitV3` → `matchCandidateCommercialOfferingsV3`. Never calls the legacy
 * `buildDiagnosticOutcome`/`resolveCommercialRecommendation`/`adaptCommercialEvidence`/
 * `matchCommercialOfferings` — those remain frozen for legacy callers. Not exported from the shared barrel;
 * not activated by the public runtime.
 */
export function buildCandidateCommercialBoundaryV3(input: CandidateCommercialBoundaryInputV3): CandidateCommercialBoundaryV3 {
  const result = buildCandidateRecommendationsAndSolutionsV3({ answers: input.answers, calibration: input.calibration });
  const licenseFit = resolveCandidateLicenseFitV3(result, input.currentLicense, input.clarificationAnswer);
  const { now, later } = matchCandidateCommercialOfferingsV3(result, licenseFit);
  const nowComplements = now.filter((item) => item.kind === "complement");
  const nowServices = now.filter((item) => item.kind === "service");
  const licenseMeta = licenseFit.recommendedLicense ? COMMERCIAL_V1_LICENSES[licenseFit.recommendedLicense] : null;
  return {
    ...result,
    commercial: {
      identity: CANDIDATE_COMMERCIAL_IDENTITY_V3,
      licenseFit,
      now: { license: licenseFit.recommendedLicense, complements: nowComplements, services: nowServices },
      later: { complements: later.filter((item) => item.kind === "complement"), services: later.filter((item) => item.kind === "service") },
      cost: {
        monthlyLicenseUsd: licenseMeta?.monthlyUsd ?? null,
        activationUsd: licenseMeta?.activationUsd ?? null,
        complements: [...now, ...later].filter((item) => item.kind === "complement").map((item) => ({ id: item.id, monthlyUsd: item.priceMonthlyUsd! })),
        externalUsage: [...new Set([...now, ...later].flatMap((item) => item.usageCategories))].map((category) => ({ category, applies: true as const })),
      },
    },
  };
}
