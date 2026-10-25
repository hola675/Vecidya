import assert from "node:assert/strict";
import test from "node:test";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

type Outcome = {
  id: string;
  knowledge: string;
  route: readonly string[];
  scored: readonly string[];
  direct: readonly string[];
  unresolved: readonly string[];
  terminal: string | undefined;
  overall: number | null;
};

function simulate(id: string, script: AnswersV2, knowledge: string): Outcome {
  let answers: AnswersV2 = {};
  const route: string[] = [];
  for (let turn = 0; turn < 30; turn += 1) {
    const result = runCandidateDiagnosticPipelineV3(answers);
    const next = result.plan.nextQuestionId;
    if (!next) {
      return {
        id, knowledge, route,
        scored: result.scoring.dimensions.filter((d) => d.score !== null).map((d) => d.id),
        direct: result.scoring.dimensions.filter((d) => d.confidence.direct > 0).map((d) => d.id),
        unresolved: result.plan.evidenceSufficiency.unresolvedApplicableDimensions,
        terminal: result.plan.evidenceSufficiency.terminalReason,
        overall: result.overall.index.displayScore,
      };
    }
    assert.ok(!route.includes(next), `${id}: repeated question ${next}`);
    const value = script[next];
    assert.notEqual(value, undefined, `${id}: missing answer for ${next}`);
    route.push(next);
    answers = { ...result.plan.activeAnswers, [next]: value };
  }
  assert.fail(`${id}: did not stop within 30 questions`);
}

test("DIAG-PRO-02: compare paired knowledge levels without assuming a score is always possible", () => {
  const outcomes = QA03B_PROFILE_KNOWLEDGE_VARIANTS.map((v) => simulate(v.id, v.answerScript, v.knowledgeLevel));
  assert.equal(outcomes.length, 60);
  const comparisons = [];
  for (let n = 1; n <= 20; n += 1) {
    const profile = `P${String(n).padStart(2, "0")}`;
    const group = outcomes.filter((outcome) => outcome.id.startsWith(`${profile}-`));
    assert.equal(group.length, 3, `${profile}: expected three levels`);
    const byKnowledge = Object.fromEntries(group.map((outcome) => [outcome.knowledge, outcome]));
    const informed = byKnowledge.informado;
    const partial = byKnowledge.parcial;
    const unknown = byKnowledge.desconocedor;
    assert.ok(informed && partial && unknown);
    comparisons.push({
      profile,
      informed: { questions: informed.route.length, route: informed.route, scored: informed.scored, direct: informed.direct, unresolved: informed.unresolved, terminal: informed.terminal, overall: informed.overall },
      partial: { questions: partial.route.length, route: partial.route, scored: partial.scored, direct: partial.direct, unresolved: partial.unresolved, terminal: partial.terminal, overall: partial.overall },
      unknown: { questions: unknown.route.length, route: unknown.route, scored: unknown.scored, direct: unknown.direct, unresolved: unknown.unresolved, terminal: unknown.terminal, overall: unknown.overall },
      sameRouteInformedPartial: JSON.stringify(informed.route) === JSON.stringify(partial.route),
      sameRoutePartialUnknown: JSON.stringify(partial.route) === JSON.stringify(unknown.route),
      sameRouteInformedUnknown: JSON.stringify(informed.route) === JSON.stringify(unknown.route),
      identicalRoutes: JSON.stringify(informed.route) === JSON.stringify(partial.route) && JSON.stringify(partial.route) === JSON.stringify(unknown.route),
      identicalScoredDimensions: JSON.stringify(informed.scored) === JSON.stringify(partial.scored) && JSON.stringify(partial.scored) === JSON.stringify(unknown.scored),
    });
  }
  const totals = {
    profiles: comparisons.length,
    identicalRoutes: comparisons.filter((row) => row.identicalRoutes).length,
    sameRouteInformedPartial: comparisons.filter((row) => row.sameRouteInformedPartial).length,
    sameRoutePartialUnknown: comparisons.filter((row) => row.sameRoutePartialUnknown).length,
    sameRouteInformedUnknown: comparisons.filter((row) => row.sameRouteInformedUnknown).length,
    identicalScoredDimensions: comparisons.filter((row) => row.identicalScoredDimensions).length,
    informedScoredDimensions: outcomes.filter((row) => row.knowledge === "informado").reduce((sum, row) => sum + row.scored.length, 0),
    unknownScoredDimensions: outcomes.filter((row) => row.knowledge === "desconocedor").reduce((sum, row) => sum + row.scored.length, 0),
  };
  console.log("DIAG_PRO_02_SENSITIVITY_MATRIX=" + JSON.stringify({ totals, comparisons }));
});
