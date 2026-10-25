import assert from "node:assert/strict";
import test from "node:test";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";

/** Cross-layer report-content audit. This does not render or certify the final HTML/PDF. */
test("DIAG-PRO-17: audit consistency across diagnostic recommendation and commercial layers", () => {
  const cases: Array<Record<string, unknown>> = [];
  for (const variant of QA03B_PROFILE_KNOWLEDGE_VARIANTS) {
    let result = runCandidateDiagnosticPipelineV3({});
    const seen = new Set<string>();
    for (let i = 0; result.plan.nextQuestionId && i < 30; i++) {
      const id = result.plan.nextQuestionId;
      assert.ok(!seen.has(id), `${variant.id}: repeated question ${id}`);
      seen.add(id);
      assert.notEqual(variant.answerScript[id], undefined, `${variant.id}: missing answer ${id}`);
      result = runCandidateDiagnosticPipelineV3({ ...result.plan.activeAnswers, [id]: variant.answerScript[id] });
    }
    assert.equal(result.plan.nextQuestionId, undefined, `${variant.id}: incomplete`);
    const recommendations = result.recommendations.items;
    const ids = new Set(recommendations.map((item) => item.id));
    const flags = {
      repeatedTitles: recommendations.map((item) => item.title).filter((title, i, all) => all.indexOf(title) !== i),
      missingEvidenceSources: recommendations.filter((item) => item.sourceQuestionIds.some((id) => result.plan.activeAnswers[id] === undefined)).map((item) => item.id),
      verifyPresentedAsImprovement: recommendations.filter((item) => item.mode === "verify" && item.framing === "recommended").map((item) => item.id),
      missingPrerequisiteReference: recommendations.flatMap((item) => item.prerequisites.filter((pre) => pre.recommendationId !== null && !ids.has(pre.recommendationId)).map((pre) => ({ recommendation: item.id, prerequisite: pre.recommendationId }))),
      commercialLicenseWithoutRationale: result.commercial.licenseFit.recommendedLicense && !result.commercial.licenseFit.rationale.trim(),
      commercialNowWithoutEvidence: result.commercial.now.services.concat(result.commercial.now.complements).filter((item) => !item.evidence.length).map((item) => item.id),
    };
    cases.push({
      profile: variant.id,
      reportIdentity: result.engineIdentity.report,
      score: result.overall.index.displayScore,
      recommendationCount: recommendations.length,
      recommendationModes: recommendations.map((item) => item.mode),
      recommendationTitles: recommendations.map((item) => item.title),
      license: result.commercial.licenseFit.recommendedLicense,
      licenseConfidence: result.commercial.licenseFit.confidence,
      unresolvedSignals: result.commercial.licenseFit.unresolvedSignals,
      flags,
    });
  }
  const flagged = cases.filter((entry) => Object.values(entry.flags as Record<string, unknown>).some((value) => Array.isArray(value) ? value.length > 0 : Boolean(value)));
  console.log("DIAG_PRO_17_REPORT_COHERENCE=" + JSON.stringify({
    scope: "pipeline content layers only; actual rendered report and presentation require separate audit",
    totalProfiles: cases.length, flaggedCount: flagged.length, flagged, cases,
  }));
});
