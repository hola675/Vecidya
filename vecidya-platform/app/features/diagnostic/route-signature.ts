import { CURRENT_QUESTION_BANK_VERSION, CURRENT_ROUTING_VERSION } from "./contracts";
import { sha256Hex } from "./hashing";
import type { QuestionId } from "./questions";

/**
 * Firma determinista de la ruta actual (DIAG-V3-08 §22): identifica "misma ruta" sin persistir todas
 * las respuestas. Depende de `QuestionBankVersion` + `RoutingVersion` (un cambio de banco/reglas
 * produce una firma distinta aunque los IDs coincidan, spec §23) y del orden EXACTO de las preguntas
 * aplicables — no se ordena alfabéticamente, porque dos rutas con las mismas preguntas en orden
 * distinto SON rutas distintas (una pregunta más temprano cambia lo que la persona ve primero). No es
 * un mecanismo de seguridad (spec §22): dos rutas iguales producen la misma firma por diseño, nunca se
 * usa para autorizar nada.
 */
export async function computeRouteSignature(applicableQuestionIds: readonly QuestionId[]): Promise<string> {
  const canonical = [`questionBankVersion=${CURRENT_QUESTION_BANK_VERSION}`, `routingVersion=${CURRENT_ROUTING_VERSION}`, `questions=${applicableQuestionIds.join(",")}`].join("|");
  return sha256Hex(canonical);
}
