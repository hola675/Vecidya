import { assertNever, mapLegacyStage, optionLabel } from "./index";
import type { Answers, Bottleneck, DiagnosticResultV3, DimensionKey, Issue, NicheId, OperationalArchetype, Question, QuestionId, Resolution } from "./index";

/**
 * Pruebas de compilación de los contratos (DIAG-V3-01). Este archivo no se importa en runtime ni
 * entra en el bundle: `pnpm run typecheck` lo verifica. Cada `@ts-expect-error` afirma que el uso
 * incorrecto NO compila; si alguno dejara de ser un error, `tsc` falla («Unused '@ts-expect-error'»).
 * Las pruebas de `tests/unit` no pasan por `tsc`, por eso estas garantías viven aquí.
 */
export function contractCompileChecks(archetype: OperationalArchetype) {
  // @ts-expect-error — un ID de perfil no es un ID de pregunta.
  const profileAsQuestion: QuestionId = "creator";

  // @ts-expect-error — una pregunta inexistente no puede ser clave de respuesta.
  const unknownAnswerKey: Answers = { not_a_question: "yes" };

  // @ts-expect-error — una pregunta nueva exige registrar antes su ID en QUESTION_IDS.
  const unregisteredQuestion: Pick<Question, "id"> = { id: "nueva_pregunta" };

  // @ts-expect-error — las reglas no pueden citar una pregunta retirada o mal escrita.
  const deadRule = optionLabel("folow_up", "none");

  // @ts-expect-error — un hallazgo inexistente no puede usarse en dependencias ni prioridades.
  const unknownIssue: Pick<Issue, "id"> = { id: "not_an_issue" };

  // @ts-expect-error — no existen dimensiones fuera del contrato.
  const unknownDimension: DimensionKey = "visibilidad";

  // @ts-expect-error — «scaling» es una etapa V3, no una etapa del motor actual: no hay traducción implícita.
  const v3StageAsLegacy = mapLegacyStage("scaling");

  // @ts-expect-error — una clasificación resuelta siempre lleva valor.
  const resolvedWithoutValue: Resolution<OperationalArchetype> = { status: "resolved", source: "answer" };

  // @ts-expect-error — una clasificación sin resolver no puede llevar valor.
  const unresolvedWithValue: Resolution<OperationalArchetype> = { status: "unresolved", reason: "not_asked", candidates: [], value: "local" };

  // @ts-expect-error — ningún resultado puede declararse V3 mientras no exista un motor V3.
  const legacyAsV3: DiagnosticResultV3["version"] = "2.0";

  // @ts-expect-error — un freno sin evidencia no existe.
  const bottleneckWithoutEvidence: Bottleneck = { issueId: "structure_follow_up", dimension: "seguimiento", evidence: [] };

  // @ts-expect-error — un nicho solo se obtiene validando con `toNicheId`.
  const unvalidatedNiche: NicheId = "barberia";

  switch (archetype) {
    case "local":
      break;
    default:
      // @ts-expect-error — faltan arquetipos: añadir uno nuevo señala cada switch exhaustivo que no lo maneja.
      assertNever(archetype, "contractCompileChecks");
  }

  return [profileAsQuestion, unknownAnswerKey, unregisteredQuestion, deadRule, unknownIssue, unknownDimension, v3StageAsLegacy, resolvedWithoutValue, unresolvedWithValue, legacyAsV3, bottleneckWithoutEvidence, unvalidatedNiche];
}
