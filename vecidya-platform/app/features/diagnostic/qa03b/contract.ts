/** Identidad del banco QA-03B activo; mantiene separado y legible el banco histórico V3. */
export const QUESTION_BANK_ID = "reviewed-evidence-v8" as const;
export const ANSWER_SCHEMA_ID = "qbv2-answers-v6" as const;
export const CONTEXT_ID = "diag-v3-context-operation-history-v4" as const;
export const APPLICABILITY_ID = "r4-applicability-operation-history-v3" as const;
export const SCORING_ID = "r3-evidence-v4+r4-applicability-operation-history-v3" as const;
export const PLANNER_ID = "reviewed-evidence-v8+r3+r4-operation-history+candidate-planner-v4" as const;
export const PIPELINE_ID = "diag-v3-candidate-global-quartiles-v5" as const;
export const SESSION_SCHEMA = 8 as const;
export const SESSION_KEY = "vecidya.diagnostic.v3.candidate.session.8" as const;
export const WORKER_REPLAY_VERSION = "qa03b-worker-replay-v6" as const;

export const OPERATIONAL_STATUSES = ["preparing", "operating", "paused", "unknown"] as const;
export type OperationalStatus = typeof OPERATIONAL_STATUSES[number];
export const DIRECT_BUYERS = ["b2c", "b2b", "mixed"] as const;
export type BuyerDisposition = typeof DIRECT_BUYERS[number] | "no_direct_purchase" | "unknown";

/** D2_ELIGIBILITY_APPROVED: el contexto no puede acreditar la existencia de una compra. */
export function shouldClarifyBuyerRecipient(input: {
  readonly buyer: string | undefined;
  readonly nonprofit: boolean;
  readonly sector: string | undefined;
}): boolean {
  if (!(DIRECT_BUYERS as readonly (string | undefined)[]).includes(input.buyer)) return false;
  return input.buyer === "b2b" || input.buyer === "mixed" || input.nonprofit
    || input.sector === "health_wellness" || input.sector === "education_coaching";
}

/** starting conserva experiencia real + operación no regular; no significa simplemente estar abierto. */
export const CANDIDATE_GROWTH_STAGE_DEFINITIONS = Object.freeze({
  idea: "Actividad en preparación confirmada, sin operación actual demostrada.",
  starting: "Experiencia real con clientes, usuarios o beneficiarios y operación todavía no regular.",
  operating: "Actividad regular y repetible, sin evidencia suficiente de crecimiento.",
  growing: "Actividad regular con crecimiento observado de demanda o capacidad.",
  scaling: "Crecimiento observado sostenido por procesos o equipo repetibles.",
});
