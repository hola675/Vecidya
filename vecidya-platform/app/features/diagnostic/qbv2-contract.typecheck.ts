import { contextEquals } from "./qbv2-rules";
import type { ModuleId, QuestionDefinitionV2 } from "./qbv2-contract";
import type { ContextFieldRef } from "./qbv2-rules";
import type { SignalProduction } from "./qbv2-signals";

/**
 * Pruebas de compilación de DIAG-V3-08B.2, mismo patrón que `contracts.typecheck.ts` (DIAG-V3-01): no
 * se importa en runtime; `pnpm run typecheck` las verifica. Cada `@ts-expect-error` afirma que el uso
 * incorrecto NO compila.
 */
export function qbv2ContractCompileChecks() {
  // @ts-expect-error — un mecanismo de monetización inventado no es un `MonetizationMechanism` real.
  const invalidMonetization: SignalProduction = { kind: "monetizationMechanism", slot: "primary", value: "printing_money", provenance: "observed_fact" };

  // @ts-expect-error — un mecanismo de entrega inventado no es un `DeliveryMode` real.
  const invalidDelivery: SignalProduction = { kind: "deliveryMode", slot: "primary", value: "teleportation", provenance: "observed_fact" };

  // @ts-expect-error — una fricción fuera de `PRIMARY_FRICTIONS` no compila.
  const invalidFriction: SignalProduction = { kind: "friction", value: "boredom", provenance: "explicit_declaration" };

  // @ts-expect-error — una procedencia inventada no es un `SignalProvenance` real.
  const invalidProvenance: SignalProduction = { kind: "hasRealCustomers", value: true, provenance: "gut_feeling" };

  // @ts-expect-error — un módulo inexistente no es un `ModuleId` real.
  const invalidModule: ModuleId = "spaceship_repair";

  // @ts-expect-error — un campo de contexto inexistente no es un `ContextFieldRef` real (§22: AnswerRef y ContextRef nunca se confunden con `field: string` genérico).
  const invalidContextField: ContextFieldRef = "overallScore";

  // @ts-expect-error — `contextEquals` exige un `ContextFieldRef` real, no cualquier string.
  const invalidContextRule = contextEquals("notAField", "x");

  // @ts-expect-error — `purpose` exige al menos un elemento (§5, §33): un array vacío no compila.
  const questionWithoutPurpose: Pick<QuestionDefinitionV2, "purpose"> = { purpose: [] };

  return [invalidMonetization, invalidDelivery, invalidFriction, invalidProvenance, invalidModule, invalidContextField, invalidContextRule, questionWithoutPurpose];
}
