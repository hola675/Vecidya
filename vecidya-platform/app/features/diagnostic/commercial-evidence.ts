import type { AnswersV2 } from "./qbv2-rules";

export const COMMERCIAL_EVIDENCE_TYPES = ["DIRECT", "SUPPORTING", "CONTEXTUAL", "DERIVED"] as const;
export type CommercialEvidenceType = (typeof COMMERCIAL_EVIDENCE_TYPES)[number];

export type EvidenceRef = {
  readonly questionId: string;
  readonly answerOption: string;
  readonly derivedFact: string;
  readonly evidenceType: CommercialEvidenceType;
  readonly relevance: "high" | "medium" | "low";
};

export type CommercialNeedLevel = "none" | "possible" | "required" | "unresolved";
export type CommercialProcessModel = "none" | "single_process" | "multiple_coordinated_processes" | "unresolved";
export type CommercialOwnershipModel = "solo" | "assigned" | "shared" | "unknown";
export type CommercialHandoffModel = "none" | "reliable" | "lossy" | "unknown";
export type CommercialAutomationModel = "none" | "standard" | "multi_process" | "unknown";

export type CommercialOperationalEvidence = {
  readonly crmNeed: CommercialNeedLevel;
  readonly recurringLeadFlow: "none" | "possible" | "established" | "unresolved";
  readonly pipelineNeed: CommercialNeedLevel;
  readonly followupNeed: CommercialNeedLevel;
  readonly appointmentNeed: CommercialNeedLevel;
  readonly ownershipModel: CommercialOwnershipModel;
  readonly handoffModel: CommercialHandoffModel;
  readonly processModel: CommercialProcessModel;
  readonly routingNeed: CommercialNeedLevel;
  readonly onboardingNeed: CommercialNeedLevel;
  readonly renewalNeed: CommercialNeedLevel;
  readonly reactivationNeed: CommercialNeedLevel;
  readonly automationModel: CommercialAutomationModel;
  readonly externalSystemAlreadySolvesNeed: boolean | "unknown";
  readonly independentServiceOnlyNeed: boolean | "unknown";
  readonly cuadraOrganizationNeed: boolean | "unknown";
  readonly evidenceRefs: readonly EvidenceRef[];
  readonly unresolvedSignals: readonly string[];
};

export type CommercialEvidenceInput = {
  readonly answers: AnswersV2;
  readonly clarificationAnswer?: "single_process" | "multiple_coordinated_processes" | "not_applicable" | "not_sure";
};

type Answer = string | readonly string[] | undefined;

const valueOf = (answers: AnswersV2, id: string): Answer => answers[id];
const answered = (answers: AnswersV2, id: string) => valueOf(answers, id) !== undefined;

export function adaptCommercialEvidence({ answers, clarificationAnswer }: CommercialEvidenceInput): CommercialOperationalEvidence {
  const refs: EvidenceRef[] = [];
  const unresolved = new Set<string>();
  const add = (questionId: string, derivedFact: string, relevance: EvidenceRef["relevance"] = "high", evidenceType: CommercialEvidenceType = "DIRECT") => {
    const answer = valueOf(answers, questionId);
    if (answer === undefined) return;
    refs.push({ questionId, answerOption: typeof answer === "string" ? answer : answer.join(","), derivedFact, evidenceType, relevance });
  };

  const b2bPipeline = valueOf(answers, "q2_b2b_pipeline");
  const b2bStatus = valueOf(answers, "q2_b2b_status_visibility");
  const generalFollowup = valueOf(answers, "q2_followup_general_process");
  const professionalFollowup = valueOf(answers, "q2_professional_followup_after_consult");
  const quoteFollowup = valueOf(answers, "q2_service_quote_followup");
  const cartFollowup = valueOf(answers, "q2_ecommerce_cart_followup");
  const appointmentBooking = valueOf(answers, "q2_appointments_booking_method");
  const appointmentReminders = valueOf(answers, "q2_appointments_confirmation_reminders");
  const processOwnership = valueOf(answers, "q2_operations_process_ownership");
  const followupOwnership = valueOf(answers, "q2_followup_ownership");
  const handoffs = valueOf(answers, "q2_operations_handoffs");
  const informationBase = valueOf(answers, "q2_operations_information_base");
  const automation = valueOf(answers, "q2_operations_automation_adoption");
  const entity = valueOf(answers, "q2_entity");
  const hasCustomers = valueOf(answers, "q2_has_customers");
  const presenceBase = valueOf(answers, "q2_presence_digital_base");

  const directProcessSignals = [
    [b2bPipeline === "yes", "q2_b2b_pipeline", "one principal B2B opportunity process"],
    [b2bStatus === "yes_clear" || b2bStatus === "somewhat" || b2bStatus === "lose_track", "q2_b2b_status_visibility", "opportunity state tracking"],
    [generalFollowup === "defined_process" || generalFollowup === "manual_consistent" || generalFollowup === "memory_dependent" || generalFollowup === "sometimes_lost", "q2_followup_general_process", "recurring follow-up process"],
    [professionalFollowup === "always" || professionalFollowup === "sometimes" || professionalFollowup === "rarely_never", "q2_professional_followup_after_consult", "professional lead follow-up"],
    [quoteFollowup === "always" || quoteFollowup === "sometimes" || quoteFollowup === "rarely", "q2_service_quote_followup", "quote follow-up"],
    [cartFollowup === "always" || cartFollowup === "sometimes" || cartFollowup === "rarely", "q2_ecommerce_cart_followup", "abandoned-cart reactivation"],
    [appointmentBooking !== undefined && appointmentBooking !== "unknown", "q2_appointments_booking_method", "appointment process"],
  ] as const;
  for (const [condition, questionId, fact] of directProcessSignals) if (condition) add(questionId, fact);

  const hasProcessSignal = directProcessSignals.some(([condition]) => condition);
  const hasFollowupGap = generalFollowup === "memory_dependent" || generalFollowup === "sometimes_lost" || professionalFollowup === "rarely_never" || professionalFollowup === "sometimes" || quoteFollowup === "rarely" || quoteFollowup === "sometimes" || cartFollowup === "rarely" || cartFollowup === "sometimes";
  const hasFollowupProcess = generalFollowup === "defined_process" || generalFollowup === "manual_consistent" || professionalFollowup === "always" || quoteFollowup === "always" || cartFollowup === "always";

  let crmNeed: CommercialNeedLevel = "none";
  if (b2bPipeline === "yes" || b2bStatus === "lose_track" || hasFollowupProcess || hasFollowupGap || (appointmentBooking !== undefined && appointmentBooking !== "unknown")) crmNeed = "required";
  else if (hasProcessSignal || b2bPipeline === "no" || b2bPipeline === "unknown") crmNeed = "possible";
  else if (hasCustomers === "yes") crmNeed = "unresolved";

  const pipelineNeed: CommercialNeedLevel = b2bPipeline === "yes" || b2bStatus !== undefined && b2bStatus !== "unknown" ? "required" : b2bPipeline === "no" ? "none" : "unresolved";
  const followupNeed: CommercialNeedLevel = hasFollowupGap ? "required" : hasFollowupProcess ? "possible" : answered(answers, "q2_followup_general_process") ? "none" : "unresolved";
  const appointmentNeed: CommercialNeedLevel = appointmentBooking !== undefined && appointmentBooking !== "unknown" ? "required" : answered(answers, "q2_appointments_booking_method") ? "none" : "unresolved";
  const recurringLeadFlow = hasCustomers === "no" ? "none" : hasProcessSignal ? "established" : hasCustomers === "yes" ? "unresolved" : "possible";

  let ownershipModel: CommercialOwnershipModel = "unknown";
  if (processOwnership === "yes_clear" || followupOwnership === "yes_clear") ownershipModel = "assigned";
  else if (processOwnership === "somewhat" || processOwnership === "improvised" || followupOwnership === "unclear") ownershipModel = "shared";
  else if (processOwnership === "unknown" || followupOwnership === "unknown") ownershipModel = "unknown";
  else if (entity === "individual" || followupOwnership === "not_applicable") ownershipModel = "solo";
  if (processOwnership !== undefined) add("q2_operations_process_ownership", "recurring task ownership", "high");
  if (followupOwnership !== undefined) add("q2_followup_ownership", "follow-up ownership", "high");

  let handoffModel: CommercialHandoffModel = "unknown";
  if (handoffs === "transfers_cleanly") handoffModel = "reliable";
  else if (handoffs === "sometimes_lost") handoffModel = "lossy";
  else if (handoffs === "not_applicable") handoffModel = "none";
  if (handoffs !== undefined) add("q2_operations_handoffs", "handoff quality", "high");

  const clarificationMultiple = clarificationAnswer === "multiple_coordinated_processes";
  const clarificationSingle = clarificationAnswer === "single_process" || clarificationAnswer === "not_applicable";
  const processModel: CommercialProcessModel = clarificationMultiple
    ? "multiple_coordinated_processes"
    : clarificationSingle
      ? "single_process"
      : hasProcessSignal
        ? "single_process"
        : hasCustomers === "no" ? "none" : "unresolved";
  if (!clarificationAnswer && hasProcessSignal) unresolved.add("single_process_or_multiple_coordinated_processes");
  if (!answered(answers, "q2_operations_handoffs")) unresolved.add("routing_between_roles");

  const routingNeed: CommercialNeedLevel = handoffModel === "lossy" ? "required" : handoffModel === "reliable" ? "possible" : handoffModel === "unknown" ? "unresolved" : "none";
  const onboardingNeed: CommercialNeedLevel = valueOf(answers, "q2_nonprofit_membership_lifecycle") === "yes_clear" ? "required" : answered(answers, "q2_nonprofit_membership_lifecycle") ? "possible" : "none";
  const renewalNeed = onboardingNeed;
  const reactivationNeed: CommercialNeedLevel = cartFollowup === "always" || cartFollowup === "sometimes" ? "required" : cartFollowup === "rarely" ? "possible" : answered(answers, "q2_ecommerce_cart_followup") ? "none" : "unresolved";
  if (onboardingNeed !== "none") add("q2_nonprofit_membership_lifecycle", "onboarding and renewal lifecycle", "high");
  if (reactivationNeed !== "unresolved") add("q2_ecommerce_cart_followup", "reactivation process", "high");

  const automationModel: CommercialAutomationModel = clarificationMultiple ? "multi_process" : automation === "most_automated" || automation === "some_automated" ? "standard" : automation === "none_automated" ? "none" : "unknown";
  if (automation !== undefined) add("q2_operations_automation_adoption", "repetitive task automation", "medium");

  const externalSystemAlreadySolvesNeed = informationBase === "shared_system" && automation === "most_automated" ? true : informationBase !== undefined || automation !== undefined ? "unknown" : "unknown";
  if (informationBase !== undefined) add("q2_operations_information_base", "operational information system", "high");

  const independentServiceOnlyNeed = entity === "individual" && !hasProcessSignal ? true : entity === "project" ? true : hasProcessSignal ? false : "unknown";
  const cuadraOrganizationNeed = presenceBase === "nothing" || presenceBase === "third_party_only" || presenceBase === "outdated" ? entity === "business" || entity === "organization" : "unknown";
  if (presenceBase !== undefined) add("q2_presence_digital_base", "presence organization gap", "medium");

  if (!answered(answers, "q2_operations_information_base")) unresolved.add("whether_an_existing_system_solves_the_need");
  if (!answered(answers, "q2_entity")) unresolved.add("independent_service_only_need");
  if (processModel === "unresolved") unresolved.add("operational_process_scope");

  return {
    crmNeed, recurringLeadFlow, pipelineNeed, followupNeed, appointmentNeed, ownershipModel, handoffModel, processModel,
    routingNeed, onboardingNeed, renewalNeed, reactivationNeed, automationModel, externalSystemAlreadySolvesNeed,
    independentServiceOnlyNeed, cuadraOrganizationNeed, evidenceRefs: refs, unresolvedSignals: [...unresolved],
  };
}
