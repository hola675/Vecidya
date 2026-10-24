// Orquestador aislado QA-03B; el original certificado permanece reproducible.
import { CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3 } from "./qbv2-candidate-interpretation";
import type { DiagnosticNarrative } from "./qbv2-candidate-narrative-builder";
import type { ConstraintPriorityResult } from "../qbv2-priorities";
import type { DiagnosticRecommendation } from "../qbv2-recommendations";
import type { DiagnosticScoringView } from "../qbv2-diagnostic-view";
import {
  SOLUTION_CATALOG, SOLUTION_IDS, solutionContextOf, type ExclusionRule, type SolutionContext, type SolutionId, type SolutionMatch,
} from "../qbv2-solutions";

/**
 * DIAG-V3-R6-C.1 — candidate process authority. The shared `solutionContextOf` derives `processMaturity`
 * from legacy `PROCESS_SIGNALS`/`PROCESS_GAPS`, which accept healthy readings of OTHER constructs
 * (professional intake clarity, information retrieval, appointment reminders) as proof of a defined general
 * process and never read `q2_process_systemization` — the candidate's migrated DIRECT Digital Readiness
 * source that measures systemization itself. That legacy context stays frozen for legacy callers; the
 * candidate keeps its structural fields (lifecycle/profile/goal/friction/stage/score/stateOf) and replaces
 * only process authority: defined ⇔ `q2_process_systemization` is established. Partial, weak, missing,
 * unknown or unanswered all mean "not defined" (one defined sub-process ≠ globally defined process).
 */
export const CANDIDATE_PROCESS_AUTHORITY_V3 = "q2_process_systemization" as const;
const DEFINED_PROCESS = new Set(["established", "strong"]);

export function candidateSolutionContextOfV3(scoring: DiagnosticScoringView, priorities: ConstraintPriorityResult, narrative: DiagnosticNarrative): SolutionContext {
  const shared = solutionContextOf(scoring, priorities, narrative);
  return { ...shared, processMaturity: DEFINED_PROCESS.has(shared.stateOf(CANDIDATE_PROCESS_AUTHORITY_V3) ?? "") ? "defined" : "undefined" };
}

/**
 * DIAG-V3-R6-C — candidate-only solution matcher. A solution may never be more specific than the evidence
 * that supports its recommendation: a dimension identifies WHERE capability is weak, never automatically WHY.
 * Reuses the shared `SolutionContext`/`SolutionCatalogItem`/`solutionContextOf` from `qbv2-solutions.ts`
 * (legacy `matchSolution` itself is never called or modified — this is a sibling, not a patch).
 *
 * Candidate rule, stricter than legacy: `verify` means "confirm the capability/problem first", never "we
 * already know which intervention is needed". A `verify` recommendation therefore never produces a
 * concrete solution here, unlike legacy's `matchSolution`, which recurses into a preliminary `improve`
 * match for `verify` recommendations.
 */

const BELOW_ESTABLISHED = new Set(["partial", "weak", "dependency", "missing"]);
const below = (state: ReturnType<SolutionContext["stateOf"]>) => state !== undefined && BELOW_ESTABLISHED.has(state);

export function matchCandidateSolutionV3(recommendation: DiagnosticRecommendation, context: SolutionContext): SolutionMatch {
  const pick = (id: SolutionId) => SOLUTION_CATALOG[id];
  const result = (solution: SolutionId | null, alternatives: readonly SolutionId[] = [], exclusions: readonly { readonly solutionId: SolutionId; readonly rule: ExclusionRule }[] = []): SolutionMatch =>
    ({ recommendationId: recommendation.id, solution: solution ? pick(solution) : null, alternatives: alternatives.map(pick), exclusions });
  const exclusionsForType = (rule: ExclusionRule) => SOLUTION_IDS.filter((id) => SOLUTION_CATALOG[id].types.includes(recommendation.type)).map((id) => ({ solutionId: id, rule }));

  // Candidate verify boundary: evidence is insufficient. No preliminary concrete intervention — only an
  // audit trail of what remains excluded
  // until the underlying capability/problem is actually confirmed.
  if (recommendation.mode === "verify") return result(null, [], exclusionsForType("verify_before_intervention"));

  const live = context.lifecycle === "live";
  // DIAG-V3-R6-C.1 direct-basis rule: supporting evidence may refine a score, never select an intervention.
  // A live concrete solution needs at least one migrated DIRECT source of the recommendation's own dimension
  // whose own state is below established; an established direct source pulled down only by supporting
  // refinement is not evidence of the need. Prelaunch `prepare` solutions are a separate category.
  const directBasis = CANDIDATE_SEMANTIC_EVIDENCE_CATALOG_V3.directQuestionIds(recommendation.dimension).filter((id) => below(context.stateOf(id)));
  if (live && directBasis.length === 0) return result(null, [], exclusionsForType("verify_before_intervention"));
  switch (recommendation.type) {
    // All three candidate direct Clarity sources (intake flow, retail product visibility, offer clarity)
    // are themselves about offer/message/next-step clarity, so one evidence-grounded solution fits all.
    case "clarity": return result("offer_message");

    case "foundation": {
      if (!live) return result("launch_channel_plan");
      // A new site is evidence-grounded only when the base-ownership question itself shows the gap — never
      // merely because Foundation scored low from a different facet (local consistency, product discovery).
      const base = context.stateOf("q2_presence_digital_base");
      return below(base) ? result("website") : result(null, [], [{ solutionId: "website", rule: "website_requires_base_gap" }]);
    }

    case "discovery": {
      if (!live) return result("launch_channel_plan");
      // The candidate bank's only direct Discovery source (q2_discovery_reliable_reach) proves unreliable
      // reach, never which channel is at fault. No catalog entry is channel-neutral for Discovery, so no
      // live solution is evidence-backed; legacy's profile-based channel choice is deliberately not reused.
      return result(null, [], exclusionsForType("advertising_requires_active_acquisition"));
    }

    case "trust": {
      if (!live) return result(null, [], [{ solutionId: "reputation_reviews", rule: "reputation_requires_customers" }]);
      // Each of the two direct Trust sources maps to its own distinct solution; neither is a default taken
      // merely because the other source is absent.
      if (below(context.stateOf("q2_reputation_flow"))) return result("reputation_reviews");
      if (below(context.stateOf("q2_professional_authority_signals"))) return result("credibility_proof");
      return result(null);
    }

    case "conversion": {
      if (!live) return result("launch_channel_plan");
      // Booking friction is evidence-grounded for online booking. Slow service response is a distinct
      // construct that a generic contact-path solution does not address, so it stays null rather than
      // being forced into a profile-chosen intervention.
      return below(context.stateOf("q2_appointments_booking_friction")) ? result("online_booking") : result(null);
    }

    case "follow_up": {
      if (!live) return result(null);
      // A weak general process, quote follow-up, or B2B pipeline each describe the same underlying gap —
      // the follow-up process itself is weak — so it can never be automated (R6-C.1): structured CRM
      // follow-up is the evidence-grounded fit. Reminders being weak only justifies automation (never CRM)
      // when the candidate process authority (`q2_process_systemization` established) shows a defined
      // process to automate; healthy intake/information/reminder readings are never a substitute.
      // Rebooking and retail customer-capture weaknesses describe narrower constructs with no evidence-backed
      // catalog match and stay null rather than being collapsed into CRM/automation by default.
      const processWeak = [context.stateOf("q2_followup_general_process"), context.stateOf("q2_service_quote_followup"), context.stateOf("q2_b2b_pipeline")].some(below);
      if (processWeak) return result("crm_follow_up", [], [{ solutionId: "follow_up_automation", rule: "automation_requires_defined_process" }]);
      if (below(context.stateOf("q2_appointments_confirmation_reminders"))) {
        return context.processMaturity === "defined" ? result("follow_up_automation") : result(null, [], [{ solutionId: "follow_up_automation", rule: "automation_requires_defined_process" }]);
      }
      return result(null);
    }

    case "measurement":
      // Live recommendations can now be evidence-backed by the QA-03B direct self-report. They remain
      // verification-only when evidence is insufficient; prelaunch may prepare a measurement plan without
      // claiming a current operating capability.
      return live ? result(null, [], [{ solutionId: "measurement_tracking", rule: "analytics_requires_activity" }]) : result("measurement_plan");

    case "readiness":
      // R6-C.1: the only live Readiness needs the candidate bank can evidence are an undefined/partial
      // process (`q2_process_systemization`) or scattered information (`q2_operations_information_base`) —
      // both are organization needs, never proof that automation is the supported intervention (a catalog
      // entry is not evidence). `operational_automation` is therefore unreachable for the candidate-38 bank.
      // The direct-basis gate above already guarantees at least one of those two sources is below established.
      return result("work_organization", [], [{ solutionId: "operational_automation", rule: "automation_requires_defined_process" }]);
  }
}
