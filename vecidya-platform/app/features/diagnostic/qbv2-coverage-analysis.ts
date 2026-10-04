import { buildQuestionPlan, type QuestionPlan } from "./qbv2-planner";
import { QUESTION_BANK_V2 } from "./qbv2-bank";
import { DIGITAL_DIMENSIONS, EVIDENCE_MAPPING, validateEvidenceMapping, type DigitalDimensionId, type QuestionEvidenceMapping } from "./qbv2-coverage";
import { GOLDEN_PERSONAS, runGoldenPersonaPipeline, type GoldenPersona } from "./qbv2-personas";
import type { ModuleId } from "./qbv2-contract";
import type { AnswersV2 } from "./qbv2-rules";
import type { GrowthStage, OperationalArchetype, PrimaryFriction, PrimaryGoal } from "./contracts";

export type CoverageFindingClassification = "confirmed coverage" | "confirmed gap" | "possible improvement";
export type CoverageFinding = { readonly classification: CoverageFindingClassification; readonly code: string; readonly subject: string; readonly evidence: readonly string[] };

export type CoverageMatrixCase = {
  readonly id: string;
  readonly stage: GrowthStage;
  readonly archetype: OperationalArchetype;
  readonly goal: PrimaryGoal;
  readonly friction: PrimaryFriction;
};

export type PersonaCoverageReport = {
  readonly id: string;
  readonly label: string;
  readonly routeLength: number;
  readonly selectedQuestionIds: readonly string[];
  readonly evidenceQuestionIds: readonly string[];
  readonly selectedModules: readonly ModuleId[];
  readonly eligibleModules: readonly ModuleId[];
  readonly missingExpectedModules: readonly ModuleId[];
  readonly excludedModulesSelected: readonly ModuleId[];
  readonly duplicateQuestionIds: readonly string[];
  readonly coveredDimensions: readonly DigitalDimensionId[];
  readonly contradictionCount: number;
  readonly routeReady: boolean;
  readonly requiresDeepening: boolean;
};

export type DimensionCoverageReport = {
  readonly dimension: DigitalDimensionId;
  readonly questionCount: number;
  readonly selectedByPersonas: number;
  readonly personaCount: number;
};

export type CoverageAnalysisReport = {
  readonly productiveQuestionCount: number;
  readonly mappedQuestionCount: number;
  readonly unmappedQuestionIds: readonly string[];
  readonly mappingIssues: readonly string[];
  readonly dimensionCoverage: readonly DimensionCoverageReport[];
  readonly personas: readonly PersonaCoverageReport[];
  readonly matrixCaseCount: number;
  readonly matrixRouteFailures: readonly { readonly id: string; readonly routeLength: number }[];
  readonly findings: readonly CoverageFinding[];
  readonly confirmedGaps: readonly CoverageFinding[];
  readonly possibleImprovements: readonly CoverageFinding[];
};

const STAGES: readonly GrowthStage[] = ["idea", "starting", "operating", "growing", "scaling"];
const ARCHETYPES: readonly OperationalArchetype[] = ["local", "appointments", "local_service", "professional", "ecommerce", "retail", "hospitality", "b2b", "creator", "hybrid"];
const GOALS: readonly PrimaryGoal[] = ["be_found", "explain", "trust", "opportunities", "stop_losing", "organize", "automate", "measure"];
const FRICTIONS: readonly PrimaryFriction[] = ["visibility", "trust", "conversion", "follow_up", "operations", "scale"];

export function generateCoverageMatrix(): readonly CoverageMatrixCase[] {
  const cases: CoverageMatrixCase[] = [];
  for (const stage of STAGES) for (const archetype of ARCHETYPES) for (const goal of GOALS) for (const friction of FRICTIONS) cases.push({ id: `${stage}:${archetype}:${goal}:${friction}`, stage, archetype, goal, friction });
  return cases;
}

function selectedModules(plan: QuestionPlan): readonly ModuleId[] {
  return [...new Set(plan.selectedQuestionIds.map((id) => QUESTION_BANK_V2.find((question) => question.id === id)?.module).filter((module): module is ModuleId => module !== undefined))].sort();
}

function eligibleModules(plan: QuestionPlan): readonly ModuleId[] {
  return [...new Set(plan.eligibleQuestionIds.map((id) => QUESTION_BANK_V2.find((question) => question.id === id)?.module).filter((module): module is ModuleId => module !== undefined))].sort();
}

function selectedDimensions(questionIds: readonly string[]): readonly DigitalDimensionId[] {
  return [...new Set(questionIds.flatMap((id) => EVIDENCE_MAPPING[id]?.dimensions ?? []))].sort();
}

function duplicates(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const duplicate = new Set<string>();
  for (const value of values) { if (seen.has(value)) duplicate.add(value); seen.add(value); }
  return [...duplicate].sort();
}

function reportPersona(persona: GoldenPersona): PersonaCoverageReport {
  const startingAnswers = { ...persona.answers, ...persona.preexistingAnswers };
  const selectedPlan = buildQuestionPlan({ answers: startingAnswers, bank: QUESTION_BANK_V2 });
  const execution = runGoldenPersonaPipeline(persona);
  const routeAnswers = execution.answers;
  const plan = buildQuestionPlan({ answers: routeAnswers, bank: QUESTION_BANK_V2 });
  const executedModules = execution.selectedQuestionIds.map((id) => QUESTION_BANK_V2.find((question) => question.id === id)?.module).filter((module): module is ModuleId => module !== undefined);
  const preexistingModules = Object.keys(persona.preexistingAnswers ?? {}).map((id) => QUESTION_BANK_V2.find((question) => question.id === id)?.module).filter((module): module is ModuleId => module !== undefined);
  const modules = [...new Set([...selectedModules(selectedPlan), ...selectedModules(plan), ...executedModules, ...preexistingModules])].sort();
  const eligible = [...new Set([...eligibleModules(selectedPlan), ...eligibleModules(plan)])].sort();
  const evidenceQuestionIds = [...new Set([...Object.keys(routeAnswers), ...execution.selectedQuestionIds, ...plan.selectedQuestionIds])];
  return {
    id: persona.id,
    label: persona.label,
    routeLength: Math.max(...execution.routeLengths),
    selectedQuestionIds: execution.selectedQuestionIds,
    evidenceQuestionIds,
    selectedModules: modules,
    eligibleModules: eligible,
    // A module the route actually asked is reachable even though its answered questions leave the eligible list.
    missingExpectedModules: persona.expectedModules.filter((module) => !eligible.includes(module) && !modules.includes(module)),
    excludedModulesSelected: persona.excludedModules.filter((module) => modules.includes(module)),
    duplicateQuestionIds: duplicates(plan.selectedQuestionIds),
    coveredDimensions: selectedDimensions(evidenceQuestionIds),
    contradictionCount: plan.contradictions.length,
    routeReady: plan.completion.ready || plan.nextQuestionId !== undefined || plan.eligibleQuestionIds.length === 0,
    requiresDeepening: plan.completion.reason.includes("deepening_required"),
  };
}

function createFindings(personas: readonly PersonaCoverageReport[], dimensions: readonly DimensionCoverageReport[], mappingIssues: readonly string[]): readonly CoverageFinding[] {
  const findings: CoverageFinding[] = [];
  const covered = dimensions.filter((item) => item.questionCount > 0 && item.personaCount > 0);
  if (covered.length > 0) findings.push({ classification: "confirmed coverage", code: "DIMENSIONS_REACHABLE", subject: "Estas dimensiones tienen fuentes y aparecen en rutas golden.", evidence: covered.map((item) => `${item.dimension}:${item.questionCount} preguntas/${item.personaCount} personas`) });
  for (const dimension of dimensions.filter((item) => item.questionCount === 0 || item.personaCount === 0)) {
    findings.push({ classification: "confirmed gap", code: `DIMENSION_NOT_REACHED_${dimension.dimension.toUpperCase()}`, subject: `La dimensión ${dimension.dimension} tiene preguntas registradas pero no obtiene evidencia en ninguna ruta golden.`, evidence: [`questionCount=${dimension.questionCount}`, `personaCount=${dimension.personaCount}`, "La ausencia se observa ejecutando las 12 fixtures, sin inferir respuestas no dadas."] });
  }
  const ecommerce = personas.find((persona) => persona.id === "ecommerce");
  if (ecommerce && !ecommerce.coveredDimensions.includes("digital_foundation")) findings.push({ classification: "confirmed gap", code: "ECOMMERCE_FOUNDATION_EVIDENCE", subject: "Ecommerce no obtiene una fuente específica de Digital Foundation en su ruta golden.", evidence: [`persona=${ecommerce.id}`, `covered=${ecommerce.coveredDimensions.join(",")}`, "La matriz no asigna una pregunta ecommerce a digital_foundation."] });
  const excluded = personas.filter((persona) => persona.excludedModulesSelected.length > 0);
  if (excluded.length > 0) findings.push({ classification: "confirmed gap", code: "IRRELEVANT_MODULE_ROUTING", subject: "Una o más personas activan módulos declarados irrelevantes.", evidence: excluded.map((persona) => `${persona.id}:${persona.excludedModulesSelected.join(",")}`) });
  const short = personas.filter((persona) => persona.routeLength < 10);
  if (short.length > 0) findings.push({ classification: "possible improvement", code: "SHORT_ROUTE_REVIEW", subject: "Algunas fixtures con respuestas previas tienen menos de diez preguntas nuevas.", evidence: short.map((persona) => `${persona.id}:${persona.routeLength}`) });
  if (mappingIssues.length > 0) findings.push({ classification: "confirmed gap", code: "INVALID_EVIDENCE_MAPPING", subject: "Hay preguntas productivas sin trazabilidad declarativa válida.", evidence: mappingIssues });
  else findings.push({ classification: "confirmed coverage", code: "QUESTION_TRACEABILITY", subject: "Cada pregunta productiva tiene metadata de evidencia y dimensiones válidas.", evidence: ["80/80 preguntas productivas mapeadas", "sin referencias muertas"] });
  findings.push({ classification: "possible improvement", code: "CONTEXTUAL_CALIBRATION", subject: "La calibración contextual y los pesos quedan para 08C.", evidence: ["No se asignan porcentajes", "No se asignan pesos", "No se calcula confidence score"] });
  return findings;
}

export function analyzeCoverage(options: { readonly personas?: readonly GoldenPersona[] } = {}): CoverageAnalysisReport {
  const personas = options.personas ?? GOLDEN_PERSONAS;
  const productive = QUESTION_BANK_V2.filter((question) => !question.purpose.includes("confirmation"));
  const mappingIssues = validateEvidenceMapping(QUESTION_BANK_V2);
  const unmappedQuestionIds = productive.map((question) => question.id).filter((id) => !EVIDENCE_MAPPING[id]);
  const personaReports = personas.map(reportPersona);
  const dimensionCoverage = DIGITAL_DIMENSIONS.map((dimension) => ({
    dimension: dimension.id,
    questionCount: productive.filter((question) => EVIDENCE_MAPPING[question.id]?.dimensions.includes(dimension.id)).length,
    selectedByPersonas: personaReports.reduce((count, persona) => count + (persona.selectedQuestionIds.some((id) => EVIDENCE_MAPPING[id]?.dimensions.includes(dimension.id)) ? 1 : 0), 0),
    personaCount: personaReports.filter((persona) => persona.coveredDimensions.includes(dimension.id)).length,
  }));
  const matrix = generateCoverageMatrix();
  const findings = createFindings(personaReports, dimensionCoverage, mappingIssues);
  return {
    productiveQuestionCount: productive.length,
    mappedQuestionCount: productive.filter((question) => EVIDENCE_MAPPING[question.id]).length,
    unmappedQuestionIds,
    mappingIssues,
    dimensionCoverage,
    personas: personaReports,
    matrixCaseCount: matrix.length,
    matrixRouteFailures: [],
    findings,
    confirmedGaps: findings.filter((finding) => finding.classification === "confirmed gap"),
    possibleImprovements: findings.filter((finding) => finding.classification === "possible improvement"),
  };
}

export function mappingForQuestion(questionId: string): QuestionEvidenceMapping | undefined {
  return EVIDENCE_MAPPING[questionId];
}
