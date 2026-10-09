import { offeringDependencies, type CommercialRecommendationV1, type CommercialRole, type DiagnosticNarrative, type DiagnosticOutcome, type DimensionPresentationStatus, type OverallStatusKind } from "../../features/diagnostic";
// Import directo, fuera del barrel: la metodología no entra en el chunk compartido que cargan las rutas públicas.
import { METHODOLOGY_SECTIONS, METHODOLOGY_SOURCES, METHODOLOGY_VERSION, RESULT_METHOD_NOTES } from "../../features/diagnostic/qbv2-methodology";
import {
  actionSteps, areaItems, CERTAINTY_DISPLAY, COMMERCIAL_ROLE_DISPLAY, CONSTRAINT_COPY, dimensionDisplay, dimensionLabelOf, dimensionOverview, EMPTY_ACTION_PATH_NOTE, helpItems, LIFECYCLE_DISPLAY,
  presenceDisplay, PRIORITY_SLOT_DISPLAY, PROFILE_DISPLAY, RESULT_DISCLAIMER, riskItems, strengthItems, uncertaintyGroups, VECIDYA_HELP_NOTE,
} from "../diagnostic-result/presentation";

/**
 * DIAG-V3-12 — view model del informe PDF. Organiza el resultado ya calculado (`DiagnosticNarrative` +
 * `DiagnosticOutcome`) y la metodología 1.0 para una salida paginada; reutiliza las mismas traducciones de
 * presentación que el resultado web (`presentation.ts`), así que el significado es idéntico. No calcula scores,
 * confianza, estado, prioridades, recomendaciones ni ofertas, no repite umbrales y no expone IDs internos.
 */

/** Versión de la estructura del informe; independiente de la metodología y de la aplicación. */
export const REPORT_VERSION = "1.0" as const;
/** Objetivo editorial: todo el contenido en tres hojas. Un caso excepcional puede usar una cuarta antes que sacrificar legibilidad (ver `REPORT_MAX_PAGE_COUNT` y el piso tipográfico en `diagnostic-report.tsx`). */
export const REPORT_PAGE_COUNT = 3 as const;
/** Techo real: una cuarta hoja solo cuando el contenido no cabe en tres ni en el piso tipográfico mínimo. Nunca una quinta. */
export const REPORT_MAX_PAGE_COUNT = 4 as const;

export const REPORT_PAPERS = {
  a4: { label: "A4", widthMm: 210, heightMm: 297, cssSize: "A4" },
  letter: { label: "Carta (US Letter)", widthMm: 215.9, heightMm: 279.4, cssSize: "letter" },
} as const;
export type ReportPaper = keyof typeof REPORT_PAPERS;
/** Tamaño canónico de producción, tras la QA de A4 y Carta. */
export const CANONICAL_REPORT_PAPER: ReportPaper = "a4";

export const REPORT_TITLE = "Diagnóstico de Presencia Digital";

export type ReportText = { readonly text: string };
export type ReportLabelled = { readonly label: string; readonly text: string };

export type ReportDimension = {
  readonly key: string;
  readonly icon: string;
  readonly label: string;
  readonly status: DimensionPresentationStatus;
  readonly statusLabel: string;
  /** `null` sin lectura: nunca se muestra como 0 %. */
  readonly score: number | null;
  readonly percent: string | null;
  readonly confidence: { readonly label: string; readonly steps: 1 | 2 | 3 } | null;
  readonly preliminary: boolean;
  readonly interpretation: string;
  readonly evidenceLead: string;
  readonly evidenceTopics: readonly string[];
  readonly context?: {
    readonly applicability: string;
    readonly observability: string;
    readonly directEvidence: string;
  };
};

export type ReportOffering = {
  readonly name: string;
  readonly role: CommercialRole;
  readonly roleLabel: string;
  readonly summary: string | null;
  readonly notes: readonly string[];
  /** Ya apareció en un paso anterior: se menciona de forma compacta. */
  readonly sharedWithStep: number | null;
};

export type DiagnosticReportV1 = {
  readonly reportVersion: typeof REPORT_VERSION;
  readonly methodologyVersion: string;
  /** Fecha de generación del informe (no la del diagnóstico). */
  readonly generatedAt: string;
  readonly generatedLabel: string;
  readonly identity: { readonly title: string; readonly businessName: string | null; readonly profileLabel: string; readonly lifecycleLabel: string };
  readonly overallPresence: {
    readonly state: OverallStatusKind;
    readonly publicLabel: "MAL" | "REGULAR" | "BIEN" | null;
    readonly label: string;
    readonly percent: string | null;
    readonly explanation: string;
    readonly confidence: { readonly label: string; readonly steps: 1 | 2 | 3 };
    readonly coverage: string;
  };
  readonly executiveSummary: { readonly headline: string | null; readonly lead: readonly string[]; readonly currentState: string };
  readonly primaryConstraint: { readonly kicker: string; readonly title: string; readonly text: string; readonly certaintyLabel: string | null; readonly confidenceLabel: string | null };
  readonly priorities: readonly { readonly rank: number; readonly slotLabel: string; readonly area: string | null; readonly statement: string; readonly why: string; readonly certaintyLabel: string }[];
  readonly nextFocus: string | null;
  readonly actionPath: { readonly steps: readonly { readonly step: number; readonly title: string; readonly tag: string; readonly area: string | null; readonly after: readonly number[] }[]; readonly emptyNote: string | null };
  readonly strengths: readonly ReportLabelled[];
  readonly areasToStrengthen: readonly ReportLabelled[];
  /** Dependencias observadas: como en la web, van con lo que falta confirmar. */
  readonly risks: readonly ReportLabelled[];
  readonly mixedSignals: readonly string[];
  readonly uncertainties: readonly { readonly title: string; readonly items: readonly string[] }[];
  readonly dimensionNotes: readonly string[];
  readonly dimensions: readonly ReportDimension[];
  readonly recommendations: readonly {
    readonly step: number; readonly title: string; readonly area: string | null; readonly tag: string;
    readonly whatToImprove: string; readonly whyItMatters: string; readonly expectedOutcome: string;
    readonly conditions?: readonly string[];
    readonly solution: { readonly label: string; readonly description: string } | null;
  }[];
  readonly vecidyaHelp: { readonly note: string; readonly items: readonly { readonly step: number; readonly title: string; readonly offerings: readonly ReportOffering[]; readonly noOffering: string | null }[]; readonly hasOfferings: boolean };
  /** Canonical Commercial Product System V1 object; the legacy vecidyaHelp projection remains for compatibility only. */
  readonly commercialRecommendation: CommercialRecommendationV1;
  readonly methodologySummary: { readonly version: string; readonly notes: readonly string[]; readonly sourcesNote: string; readonly formulaDistinction: string };
  readonly sources: readonly { readonly number: number; readonly title: string; readonly organization: string; readonly year: string | null; readonly url: string }[];
  readonly limitations: readonly string[];
  readonly disclaimer: string;
};

/** Contenido que comparten el informe legacy y la adaptación candidate-only. */
export type DiagnosticReportContentV1 = Omit<DiagnosticReportV1, "commercialRecommendation" | "vecidyaHelp">;

export type CandidateDiagnosticReportV1 = Omit<DiagnosticReportContentV1, "dimensions" | "identity"> & {
  readonly identity: DiagnosticReportContentV1["identity"] & { readonly dateLabel: "Fecha del diagnóstico" };
  readonly dimensions: readonly (ReportDimension & { readonly context: NonNullable<ReportDimension["context"]> })[];
  readonly candidateEngineIdentity: Readonly<Record<string, string | number>>;
  readonly candidateCommercial: {
    readonly licenseName: string | null;
    readonly certainty: string;
    readonly rationale: string;
    readonly whyNotLower: string;
    readonly whyNotHigher: string;
    readonly unresolvedSignals: readonly string[];
    readonly now: readonly { readonly name: string; readonly kind: string; readonly rationale: string; readonly priceLabel: string | null }[];
    readonly later: readonly { readonly name: string; readonly kind: string; readonly rationale: string; readonly priceLabel: string | null }[];
    readonly monthlyLicenseUsd: number | null;
    readonly activationUsd: number | null;
    readonly externalUsageCategories: readonly string[];
  };
};

export type DiagnosticReportDocumentV1 = DiagnosticReportV1 | CandidateDiagnosticReportV1;

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const isoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const longDate = (date: Date) => `${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
const stepOf = (recommendationId: string) => Number(recommendationId.split(":")[1]);
const methodologyClaim = (section: string, id: string) => METHODOLOGY_SECTIONS.find((item) => item.id === section)!.detail.find((item) => item.id === id)!.text;

export type ReportInput = {
  readonly narrative: DiagnosticNarrative;
  readonly outcome: DiagnosticOutcome;
  readonly generatedAt: Date;
  /** Solo si el diagnóstico lo trae confirmado; nunca se inventa. Hoy el diagnóstico es anónimo. */
  readonly businessName?: string | null;
};

export function buildDiagnosticReport({ narrative, outcome, generatedAt, businessName = null }: ReportInput): DiagnosticReportV1 {
  const presence = presenceDisplay(outcome.overall);
  const constraint = narrative.primaryConstraint;
  const constraintDimension = constraint?.dimension ? narrative.dimensions.find((item) => item.dimension === constraint.dimension) : undefined;
  const constraintConfidence = constraintDimension ? dimensionDisplay(constraintDimension).confidence : null;
  const overview = dimensionOverview(narrative);
  const steps = actionSteps(narrative, outcome);
  const help = helpItems(narrative, outcome);
  const [headline, ...lead] = narrative.executiveSummary;
  return {
    reportVersion: REPORT_VERSION,
    methodologyVersion: METHODOLOGY_VERSION,
    generatedAt: isoDate(generatedAt),
    generatedLabel: longDate(generatedAt),
    identity: { title: REPORT_TITLE, businessName: businessName?.trim() || null, profileLabel: PROFILE_DISPLAY[narrative.profile], lifecycleLabel: LIFECYCLE_DISPLAY[narrative.lifecycle] },
    overallPresence: {
      state: outcome.overall.state, label: outcome.overall.label, percent: presence.percent, explanation: outcome.overall.explanation.text,
      publicLabel: presence.publicLabel,
      confidence: presence.confidence, coverage: presence.coverage,
    },
    executiveSummary: { headline: headline?.text ?? null, lead: lead.map((block) => block.text), currentState: narrative.currentState.text },
    primaryConstraint: constraint
      ? {
        kicker: constraint.certainty === "unknown" ? CONSTRAINT_COPY.verifyKicker : CONSTRAINT_COPY.kicker,
        title: constraintDimension?.label ?? "", text: constraint.text, certaintyLabel: CERTAINTY_DISPLAY[constraint.certainty],
        confidenceLabel: constraintConfidence ? `Confianza ${constraintConfidence.label.toLowerCase()}` : null,
      }
      : { kicker: CONSTRAINT_COPY.kicker, title: CONSTRAINT_COPY.clearTitle, text: narrative.nextFocus.text, certaintyLabel: null, confidenceLabel: null },
    priorities: narrative.priorities.map((priority) => ({
      rank: priority.rank, slotLabel: PRIORITY_SLOT_DISPLAY[priority.slot], area: dimensionLabelOf(narrative, priority.dimension) ?? null,
      statement: priority.statement.text, why: priority.why.text, certaintyLabel: CERTAINTY_DISPLAY[priority.certainty],
    })),
    // Como en la web: el siguiente foco solo se muestra cuando no repite la lista de prioridades.
    nextFocus: narrative.priorities.length <= 1 && constraint ? narrative.nextFocus.text : null,
    actionPath: {
      steps: steps.map((step) => ({ step: step.recommendation.rank, title: step.recommendation.title, tag: step.tag, area: step.area ?? null, after: step.after })),
      emptyNote: steps.length === 0 ? EMPTY_ACTION_PATH_NOTE : null,
    },
    strengths: strengthItems(narrative).map((item) => ({ label: item.label, text: item.block.text })),
    areasToStrengthen: areaItems(narrative).map((item) => ({ label: item.label, text: item.block.text })),
    risks: riskItems(narrative).map((item) => ({ label: item.label, text: item.block.text })),
    mixedSignals: narrative.contradictions.map((block) => block.text),
    uncertainties: uncertaintyGroups(narrative).map((group) => ({ title: group.title, items: group.items.map((block) => block.text) })),
    // Las mismas notas que la web (`dimensionOverview`): una sola explicación de etapa o de lectura preliminar.
    dimensionNotes: [overview.lifecycleNote, overview.preliminaryNote].filter((note): note is string => note !== null),
    dimensions: overview.items.map((item) => ({
      key: item.dimension.dimension, icon: item.icon, label: item.dimension.label, status: item.dimension.status, statusLabel: item.statusLabel, score: item.dimension.score, percent: item.percent,
      confidence: item.confidence, preliminary: item.preliminary, interpretation: item.dimension.interpretation.text, evidenceLead: item.evidenceLead,
      evidenceTopics: item.dimension.evidence.map((entry) => entry.topic),
    })),
    recommendations: outcome.recommendations.items.map((recommendation) => {
      const match = help.find((entry) => entry.recommendation.id === recommendation.id)?.item.solution.solution;
      return {
        step: recommendation.rank, title: recommendation.title, area: dimensionLabelOf(narrative, recommendation.dimension) ?? null,
        tag: steps.find((step) => step.recommendation.id === recommendation.id)!.tag,
        whatToImprove: recommendation.whatToImprove, whyItMatters: recommendation.whyItMatters, expectedOutcome: recommendation.expectedOutcome,
        solution: match ? { label: match.label, description: match.description } : null,
      };
    }),
    vecidyaHelp: {
      note: help.length === 0 ? VECIDYA_HELP_NOTE.base : VECIDYA_HELP_NOTE.some,
      hasOfferings: help.some((entry) => entry.offerings.length > 0),
      items: help.map((entry) => ({
        step: entry.step, title: entry.recommendation.title, noOffering: entry.noOffering,
        offerings: entry.offerings.map((match): ReportOffering => ({
          name: match.offering.name, role: match.role, roleLabel: COMMERCIAL_ROLE_DISPLAY[match.role],
          sharedWithStep: match.sharedWith ? stepOf(match.sharedWith) : null,
          summary: match.sharedWith ? null : match.offering.summary,
          notes: match.sharedWith ? [] : [
            ...(match.condition ? [match.condition] : []),
            ...offeringDependencies(match).map((dependency) => dependency.text),
            ...(match.offering.externalCost ? [match.offering.externalCost] : []),
            match.offering.contracting,
            ...(match.timing === "after_prerequisite" ? [`Conviene después del paso ${match.after.map(stepOf).join(" y ")}.`] : []),
          ],
        })),
      })),
    },
    commercialRecommendation: outcome.commercialRecommendation,
    methodologySummary: {
      version: METHODOLOGY_VERSION,
      notes: RESULT_METHOD_NOTES,
      sourcesNote: METHODOLOGY_SECTIONS.find((section) => section.id === "sources")!.simple,
      formulaDistinction: methodologyClaim("overall_index", "overall.not_eurostat"),
    },
    sources: METHODOLOGY_SOURCES.map((source, index) => ({ number: index + 1, title: source.title, organization: source.organization, year: source.publishedAt?.slice(0, 4) ?? null, url: source.url })),
    limitations: METHODOLOGY_SECTIONS.find((section) => section.id === "limitations")!.detail.map((item) => item.text),
    disclaimer: RESULT_DISCLAIMER,
  };
}

/** Confianza visible del informe: misma etiqueta que la web. */
export const reportConfidenceLabel = (confidence: { readonly label: string }) => `Confianza ${confidence.label.toLowerCase()}`;

/**
 * Nombre de archivo: `diagnostico-vecidya-[negocio-]AAAA-MM-DD.pdf`. Sin acentos, barras ni caracteres inseguros, y
 * con el nombre recortado a `REPORT_FILE_NAME_MAX` caracteres. Sin nombre confirmado, solo la fecha.
 */
export const REPORT_FILE_NAME_MAX = 40;
export function reportFileName(businessName: string | null | undefined, generatedAt: string): string {
  const slug = (businessName ?? "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, REPORT_FILE_NAME_MAX).replace(/-+$/g, "");
  return `diagnostico-vecidya-${slug ? `${slug}-` : ""}${generatedAt}.pdf`;
}
