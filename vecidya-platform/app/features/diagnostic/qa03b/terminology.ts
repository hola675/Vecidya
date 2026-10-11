import type { ResolvedDomainContext } from "./context";
import { TERMINOLOGY as historicalTerminology, type TerminologyProfileId } from "../qbv2-terminology";
import type { AnswersV2 } from "../qbv2-rules";
export const TERMINOLOGY = {
  ...historicalTerminology,
  generic: { ...historicalTerminology.generic, terms: { ...historicalTerminology.generic.terms, business: "tu actividad", transaction: "los acuerdos", customer: "las personas atendidas", repeat_customer: "las personas que vuelven" } },
};
export type { TerminologyProfileId } from "../qbv2-terminology";

/** El tipo project nunca determina por sí solo la etapa ni el lenguaje de preparación. */
export function resolveTerminologyProfile(context: Partial<ResolvedDomainContext>, _answers?: AnswersV2): TerminologyProfileId {
  if ((context.operationalStatus?.status === "resolved" && context.operationalStatus.value === "preparing") || (context.growthStage?.status === "resolved" && context.growthStage.value === "idea")) return "prelaunch";
  if ((context.entity?.status === "resolved" && context.entity.value === "organization") || (context.businessModel?.status === "resolved" && context.businessModel.value === "nonprofit")) return "nonprofit";
  const archetype = context.archetype?.status === "resolved" ? context.archetype.value : undefined;
  return archetype && Object.hasOwn(TERMINOLOGY, archetype) ? archetype as TerminologyProfileId : "generic";
}
