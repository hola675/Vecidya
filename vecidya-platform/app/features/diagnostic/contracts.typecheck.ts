import { assertNever, mapLegacyStage, multiAnswer, optionLabel, singleAnswer } from "./index";
import type { Answers, Bottleneck, DiagnosticResultV3, DimensionKey, Issue, NicheId, OperationalArchetype, OptionIdOf, OptionRef, Question, QuestionDefinition, QuestionId, Resolution } from "./index";

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

  // ── Opciones ligadas a su pregunta (DIAG-V3-02) ──

  // @ts-expect-error — una regla no puede comparar con una opción que no existe en esa pregunta.
  const optionTypo = singleAnswer({}, "capture") === "alwyas";

  // @ts-expect-error — una opción de otra pregunta no es una opción de `capture`.
  const foreignOption: OptionIdOf<"capture"> = "domain";

  // @ts-expect-error — una referencia pregunta.opción exige una opción de esa pregunta.
  const foreignRef: OptionRef = { question: "follow_up", option: "always" };

  // @ts-expect-error — el valor guardado de una pregunta debe ser una opción de esa pregunta.
  const invalidAnswerValue: Answers = { capture: "alwyas" };

  // @ts-expect-error — una pregunta multi se responde con una lista.
  const multiAsSingle: Answers = { assets: "domain" };

  // @ts-expect-error — una pregunta single no se responde con una lista.
  const singleAsMulti: Answers = { capture: ["always"] };

  // @ts-expect-error — `singleAnswer` solo acepta preguntas single.
  const multiThroughSingle = singleAnswer({}, "assets");

  // @ts-expect-error — `multiAnswer` solo acepta preguntas multi.
  const singleThroughMulti = multiAnswer({}, "capture");

  // @ts-expect-error — `includes` sobre una multi solo acepta sus propias opciones.
  const multiOptionTypo = multiAnswer({}, "sources").includes("nonee");

  // @ts-expect-error — solo las preguntas multi admiten opciones exclusivas.
  const exclusiveOnSingle: QuestionDefinition = { id: "x", version: 1, section: "proceso", type: "single", eyebrow: "", prompt: "", purpose: "", dimensions: [], options: [{ value: "a", label: "A", exclusive: true }] };

  // @ts-expect-error — «nada de esto» (`none`) solo existe en preguntas multi.
  const noneOnSingle: QuestionDefinition = { id: "x", version: 1, section: "proceso", type: "single", eyebrow: "", prompt: "", purpose: "", dimensions: [], options: [{ value: "a", label: "A", kind: "none" }] };

  // @ts-expect-error — solo existe la versión semántica 1 de cada pregunta.
  const unknownVersion: QuestionDefinition = { id: "x", version: 2, section: "proceso", type: "single", eyebrow: "", prompt: "", purpose: "", dimensions: [], options: [] };

  // @ts-expect-error — no existen secciones fuera del contrato.
  const unknownSection: QuestionDefinition = { id: "x", version: 1, section: "ventas", type: "single", eyebrow: "", prompt: "", purpose: "", dimensions: [], options: [] };

  const validRef: OptionRef = { question: "capture", option: "always" };

  switch (archetype) {
    case "local":
      break;
    default:
      // @ts-expect-error — faltan arquetipos: añadir uno nuevo señala cada switch exhaustivo que no lo maneja.
      assertNever(archetype, "contractCompileChecks");
  }

  return [profileAsQuestion, unknownAnswerKey, unregisteredQuestion, deadRule, unknownIssue, unknownDimension, v3StageAsLegacy, resolvedWithoutValue, unresolvedWithValue, legacyAsV3, bottleneckWithoutEvidence, unvalidatedNiche, optionTypo, foreignOption, foreignRef, invalidAnswerValue, multiAsSingle, singleAsMulti, multiThroughSingle, singleThroughMulti, multiOptionTypo, exclusiveOnSingle, noneOnSingle, unknownVersion, unknownSection, validRef];
}
