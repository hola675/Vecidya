import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";
import { QA03B_PROFILE_CASES, qa03bProfileAnswerScript } from "./qa03b-profile-case-matrix";

export const QA03B_KNOWLEDGE_LEVELS = ["informado", "parcial", "desconocedor"] as const;
export type Qa03bKnowledgeLevel = (typeof QA03B_KNOWLEDGE_LEVELS)[number];

export type Qa03bProfileKnowledgeVariant = {
  readonly id: string;
  readonly profileId: string;
  readonly knowledgeLevel: Qa03bKnowledgeLevel;
  readonly answerScript: AnswersV2;
  /** Fields invented as explicit test-only respondent extensions, never source facts. */
  readonly modeledAssumptionQuestionIds: readonly string[];
  /** Fields conservatively mapped from the supplied profile description. */
  readonly interpretedSourceQuestionIds: readonly string[];
  readonly note: string;
};

// The supplied profiles do not record an owner's stated improvement goal or
// consistency rating for recurring processes. Informed variants add explicit,
// qualitative respondent statements to exercise those routes. They are test
// assumptions, not source facts or expected diagnostic outcomes.
const informedExtensions: Record<string, Pick<AnswersV2, "q2_goal" | "q2_process_systemization">> = {
  P01: { q2_goal: "stop_losing", q2_process_systemization: "partial" },
  P02: { q2_goal: "automate", q2_process_systemization: "partial" },
  P03: { q2_goal: "stop_losing", q2_process_systemization: "partial" },
  P04: { q2_goal: "stop_losing", q2_process_systemization: "partial" },
  P05: { q2_goal: "organize", q2_process_systemization: "partial" },
  P06: { q2_goal: "organize", q2_process_systemization: "informal" },
  P07: { q2_goal: "measure", q2_process_systemization: "defined" },
  P08: { q2_goal: "organize", q2_process_systemization: "partial" },
  P09: { q2_goal: "be_found", q2_process_systemization: "partial" },
  P10: { q2_goal: "stop_losing", q2_process_systemization: "partial" },
  P11: { q2_goal: "organize", q2_process_systemization: "informal" },
  P12: { q2_goal: "stop_losing", q2_process_systemization: "partial" },
  P13: { q2_goal: "automate", q2_process_systemization: "partial" },
  P14: { q2_goal: "organize", q2_process_systemization: "partial" },
  P15: { q2_goal: "automate", q2_process_systemization: "partial" },
  P16: { q2_goal: "stop_losing", q2_process_systemization: "partial" },
  P17: { q2_goal: "organize", q2_process_systemization: "informal" },
  P18: { q2_goal: "measure", q2_process_systemization: "defined" },
  P19: { q2_goal: "automate", q2_process_systemization: "partial" },
  P20: { q2_goal: "stop_losing", q2_process_systemization: "partial" },
};

// These labels map tools explicitly named in the supplied profiles to the
// diagnostic's broad inventory choices. They do not assert effectiveness.
const toolsByProfile: Record<string, readonly string[]> = {
  P01: ["unknown"],
  P02: ["unknown"],
  P03: ["calendar_scheduling"],
  P04: ["customer_followup"],
  P05: ["unknown"],
  P06: ["documents_records", "other"],
  P07: ["other"],
  P08: ["other"],
  P09: ["other"],
  P10: ["other"],
  P11: ["other"],
  P12: ["documents_records", "other"],
  P13: ["tasks_projects", "customer_followup"],
  P14: ["customer_followup", "other"],
  P15: ["documents_records", "other"],
  P16: ["calendar_scheduling"],
  P17: ["documents_records", "other"],
  P18: ["customer_followup", "other"],
  P19: ["documents_records", "other"],
  P20: ["customer_followup", "other"],
};

// Only P20 states a recurring, quantified inflow of new leads (thousands per
// month). Other channel inventories alone do not prove reliable acquisition.
const informedDiscoveryAnswer: Record<string, AnswersV2["q2_discovery_reliable_reach"]> = {
  P20: "reliable",
};

// The original sparse profiles explicitly describe these current frictions.
// This is a conservative interpretation of their wording, not an engine score.
const partialFriction: Record<string, AnswersV2["q2_friction"]> = {
  P04: "follow_up",
  P13: "operations",
  P14: "operations",
};

const knowledgeUnknowns: AnswersV2 = {
  q2_goal: "unsure",
  q2_friction: "unsure",
  q2_discovery_reliable_reach: "unknown",
  q2_process_systemization: "unknown",
  q2_digital_tools_in_use: ["unknown"],
  q2_demand_trend: "unknown",
  q2_capacity_signal: ["unknown"],
  q2_operations_information_base: "unknown",
  q2_followup_general_process: "unknown",
  q2_appointments_lead_to_booking: "unknown",
  q2_appointments_noshow: "unknown",
  q2_appointments_rebooking: "unknown",
  q2_ecommerce_product_discovery: "unknown",
  q2_ecommerce_traffic_sources: ["unknown"],
  q2_local_presence_consistency: "unknown",
  q2_professional_intake_flow: "unknown",
  q2_b2b_pipeline: "unknown",
  q2_b2b_status_visibility: "unknown",
};

function makeVariant(
  profileId: string,
  knowledgeLevel: Qa03bKnowledgeLevel,
  answerScript: AnswersV2,
  modeledAssumptionQuestionIds: readonly string[],
  interpretedSourceQuestionIds: readonly string[],
): Qa03bProfileKnowledgeVariant {
  return {
    id: `${profileId}-${knowledgeLevel}`,
    profileId,
    knowledgeLevel,
    answerScript,
    modeledAssumptionQuestionIds,
    interpretedSourceQuestionIds,
    note: knowledgeLevel === "informado"
      ? "Incluye aclaraciones cualitativas sintéticas sobre prioridad y proceso; no inventa métricas ni las trata como datos originales."
      : knowledgeLevel === "parcial"
        ? "Parte de la matriz original; añade fricción solo donde la descripción la expresa con claridad y mantiene desconocidas las métricas no descritas."
        : "Conserva anclas del perfil, pero simula desconocimiento de desempeño, medición y consistencia; no convierte la falta de conocimiento en una respuesta negativa.",
  };
}

export const QA03B_PROFILE_KNOWLEDGE_VARIANTS: readonly Qa03bProfileKnowledgeVariant[] = QA03B_PROFILE_CASES.flatMap((profile) => {
  const sourceAnswers = qa03bProfileAnswerScript(profile);
  const extension = informedExtensions[profile.id];
  const discoveryAnswer = informedDiscoveryAnswer[profile.id];
  const informedAnswers: AnswersV2 = {
    ...sourceAnswers,
    ...extension,
    q2_digital_tools_in_use: toolsByProfile[profile.id] as AnswersV2["q2_digital_tools_in_use"],
    ...(discoveryAnswer ? { q2_discovery_reliable_reach: discoveryAnswer } : {}),
  };
  const partialAnswers: AnswersV2 = {
    ...sourceAnswers,
    ...(partialFriction[profile.id] ? { q2_friction: partialFriction[profile.id] } : {}),
  };
  const unknownAnswers: AnswersV2 = { ...sourceAnswers, ...knowledgeUnknowns };

  return [
    makeVariant(profile.id, "informado", informedAnswers, ["q2_goal", "q2_process_systemization"], ["q2_digital_tools_in_use", ...(discoveryAnswer ? ["q2_discovery_reliable_reach"] : [])]),
    makeVariant(profile.id, "parcial", partialAnswers, [], partialFriction[profile.id] ? ["q2_friction"] : []),
    makeVariant(profile.id, "desconocedor", unknownAnswers, [], []),
  ];
});
