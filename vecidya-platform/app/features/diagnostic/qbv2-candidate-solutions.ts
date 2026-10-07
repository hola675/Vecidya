import type { DiagnosticRecommendation } from "./qbv2-recommendations";
import {
  SOLUTION_CATALOG, SOLUTION_IDS, type ExclusionRule, type SolutionContext, type SolutionId, type SolutionMatch,
} from "./qbv2-solutions";

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

  // Candidate verify boundary: evidence is insufficient (or, for Measurement, structurally absent from the
  // candidate bank). No preliminary concrete intervention — only an audit trail of what remains excluded
  // until the underlying capability/problem is actually confirmed.
  if (recommendation.mode === "verify") return result(null, [], exclusionsForType("verify_before_intervention"));

  const live = context.lifecycle === "live";
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
      // the process itself — so the usual automation-readiness gate applies. Reminders being weak only
      // ever justifies automation (never CRM) when a process already exists elsewhere to automate.
      // Rebooking and retail customer-capture weaknesses describe narrower constructs with no evidence-backed
      // catalog match and stay null rather than being collapsed into CRM/automation by default.
      const processWeak = [context.stateOf("q2_followup_general_process"), context.stateOf("q2_service_quote_followup"), context.stateOf("q2_b2b_pipeline")].some(below);
      if (processWeak) return context.processMaturity === "defined" ? result("follow_up_automation") : result("crm_follow_up");
      if (below(context.stateOf("q2_appointments_confirmation_reminders")) && context.processMaturity === "defined") return result("follow_up_automation");
      return result(null);
    }

    case "measurement":
      // Live Measurement recommendations are always `verify` (the candidate bank has zero direct sources,
      // so the dimension can never be scored) and are already intercepted above. This branch only serves
      // prelaunch `prepare`, where defining a measurement plan does not claim any current capability.
      return live ? result(null, [], [{ solutionId: "measurement_tracking", rule: "analytics_requires_activity" }]) : result("measurement_plan");

    case "readiness":
      if (context.processMaturity === "defined" && live) return result("operational_automation", context.stateOf("q2_operations_information_base") === "partial" ? ["integrations"] : []);
      return result("work_organization");
  }
}
