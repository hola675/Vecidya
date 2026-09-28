import {
  assertNever,
  CURRENT_DIAGNOSTIC_VERSION,
  resolved,
  unresolved,
  type DiagnosticContextV3,
  type EntityType,
  type GrowthStage,
  type LegacyStageId,
  type OperationalArchetype,
  type PrimaryGoal,
  type Resolution,
} from "./contracts";
import type { Context, GoalId, ProfileId } from "./types";

/**
 * Traducción explícita de conceptos del motor actual a V3 (DIAG-V3-01).
 *
 * Solo se resuelve lo que tiene equivalencia semántica segura. Lo demás queda `unresolved` con
 * `ambiguous_legacy` y los candidatos posibles: preferimos no clasificar a clasificar mal. Nada
 * aquí participa todavía en el cálculo del resultado.
 */

/**
 * Etapa autodeclarada → etapa V3 observable. Solo «idea» coincide («todavía no atiendo a nadie» =
 * sin clientes ni transacciones). Las demás describen actividad o intención, no las señales V3
 * (clientes, procesos repetibles, volumen, equipo), así que V3 tendrá que confirmarlas.
 */
export const LEGACY_STAGE_MAPPING: Readonly<Record<LegacyStageId, Resolution<GrowthStage>>> = {
  idea: resolved("idea", "legacy_mapping"),
  launching: unresolved("ambiguous_legacy", ["idea", "starting"]),
  occasional: unresolved("ambiguous_legacy", ["starting", "operating"]),
  regular: unresolved("ambiguous_legacy", ["operating", "growing"]),
  // «Estable y quiero crecer» es una intención; no implica el volumen creciente del `growing` V3.
  growing: unresolved("ambiguous_legacy", ["operating", "growing", "scaling"]),
};

export function mapLegacyStage(stage: LegacyStageId | undefined): Resolution<GrowthStage> {
  return stage === undefined ? unresolved("not_asked") : LEGACY_STAGE_MAPPING[stage];
}

/**
 * Perfil actual → entidad y arquetipo. El perfil mezcla ambos conceptos; se separan aquí.
 * «business» y «project» no bastan para un arquetipo; «creator» puede ser una persona o un grupo.
 */
export const LEGACY_PROFILE_MAPPING: Readonly<Record<ProfileId, { entity: Resolution<EntityType>; archetype: Resolution<OperationalArchetype> }>> = {
  business: {
    entity: resolved("business", "legacy_mapping"),
    archetype: unresolved("ambiguous_legacy", ["local", "appointments", "local_service", "ecommerce", "retail", "hospitality", "b2b", "hybrid"]),
  },
  professional: { entity: resolved("individual", "legacy_mapping"), archetype: resolved("professional", "legacy_mapping") },
  creator: { entity: unresolved("ambiguous_legacy", ["individual", "organization"]), archetype: resolved("creator", "legacy_mapping") },
  project: { entity: resolved("project", "legacy_mapping"), archetype: unresolved("ambiguous_legacy", ["startup", "organization", "hybrid"]) },
  organization: { entity: resolved("organization", "legacy_mapping"), archetype: resolved("organization", "legacy_mapping") },
};

/** Objetivo actual → objetivo principal V3. Mismos IDs y significado, salvo «unsure», que es su ausencia declarada. */
export function mapLegacyGoal(goal: GoalId | undefined): Resolution<PrimaryGoal> {
  if (goal === undefined) return unresolved("not_asked");
  switch (goal) {
    case "be_found":
    case "explain":
    case "trust":
    case "opportunities":
    case "stop_losing":
    case "organize":
    case "automate":
    case "measure":
      return resolved(goal, "legacy_mapping");
    case "unsure":
      return unresolved("declared_unknown");
    default:
      return assertNever(goal, "mapLegacyGoal");
  }
}

/** Contexto actual → contexto V3. Lo que el motor actual no pregunta queda `not_asked`. */
export function deriveContextV3(context: Context): DiagnosticContextV3 {
  const profile = context.profile ? LEGACY_PROFILE_MAPPING[context.profile] : undefined;
  return {
    version: CURRENT_DIAGNOSTIC_VERSION,
    profile: context.profile ? resolved(context.profile, "answer") : unresolved("not_asked"),
    entity: profile?.entity ?? unresolved("not_asked"),
    businessModel: unresolved("not_asked"),
    archetype: profile?.archetype ?? unresolved("not_asked"),
    niche: unresolved("not_asked"),
    growthStage: mapLegacyStage(context.stage),
    customerModel: { reach: unresolved("not_asked"), buyer: unresolved("not_asked") },
    primaryGoal: mapLegacyGoal(context.goal),
    primaryFriction: unresolved("not_asked"),
    answers: context.answers,
  };
}
