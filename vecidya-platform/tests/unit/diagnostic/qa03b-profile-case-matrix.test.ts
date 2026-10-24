import assert from "node:assert/strict";
import test from "node:test";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qa03b/bank";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { DIGITAL_DIMENSION_IDS } from "../../../app/features/diagnostic/qbv2-dimensions";
import { QA03B_PROFILE_CASES, qa03bProfileAnswerScript } from "./qa03b-profile-case-matrix";
import type { AnswersV2 } from "../../../app/features/diagnostic/qbv2-rules";

const bank = new Map(REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.map((question) => [question.id, question]));

function runProfile(profile: (typeof QA03B_PROFILE_CASES)[number]) {
  const script = qa03bProfileAnswerScript(profile);
  let answers: AnswersV2 = {};
  const asked: { questionId: string; answer: string | readonly string[] }[] = [];
  for (let turn = 0; turn < 30; turn += 1) {
    const result = runCandidateDiagnosticPipelineV3(answers);
    const questionId = result.plan.nextQuestionId;
    if (!questionId) return { result, answers: result.plan.activeAnswers, asked };
    const answer = script[questionId];
    assert.notEqual(answer, undefined, `${profile.id}: no authored answer for selected ${questionId}`);
    const definition = bank.get(questionId);
    assert.ok(definition, `${profile.id}: planner selected a question outside the reviewed QA-03B bank`);
    const selected = typeof answer === "string" ? [answer] : answer;
    assert.ok(selected.length > 0 && selected.every((value) => definition.options.some((option) => option.value === value)), `${profile.id}: invalid authored response for ${questionId}`);
    answers = { ...result.plan.activeAnswers, [questionId]: answer };
    asked.push({ questionId, answer });
  }
  assert.fail(`${profile.id}: route did not reach a terminal state within 30 questions`);
}

test("20 perfiles sintéticos recorren QA-03B con respuestas explícitas y una pregunta por turno", () => {
  assert.equal(QA03B_PROFILE_CASES.length, 20);
  assert.equal(new Set(QA03B_PROFILE_CASES.map((profile) => profile.id)).size, 20);
  for (const profile of QA03B_PROFILE_CASES) {
    for (const [questionId, answer] of Object.entries(qa03bProfileAnswerScript(profile))) {
      const definition = bank.get(questionId);
      assert.ok(definition, `${profile.id}: answer script references unknown question ${questionId}`);
      const selected = typeof answer === "string" ? [answer] : answer;
      assert.ok(selected.length > 0 && selected.every((value) => definition.options.some((option) => option.value === value)), `${profile.id}: invalid authored response for ${questionId}`);
    }
  }
  const completed = QA03B_PROFILE_CASES.map((profile) => ({ profile, ...runProfile(profile) }));
  assert.ok(completed.every(({ asked }) => asked.length > 0 && new Set(asked.map((item) => item.questionId)).size === asked.length));
  assert.ok(completed.every(({ result }) => result.plan.completion.ready && !result.plan.completion.hardCapReached));
  assert.ok(completed.every(({ answers }) => answers.q2_operational_status === "operating" && answers.q2_has_customers === "yes"));
  assert.ok(completed.every(({ result }) => result.overall.index.displayScore === null));
  assert.equal(completed.reduce((count, { result }) => count + result.scoring.dimensions.filter((dimension) => dimension.score !== null).length, 0), 3);
  assert.ok(completed.every(({ result }) => result.scoring.dimensions.every((dimension) => dimension.score === null || dimension.state == null)));
  assert.equal(completed.filter(({ result }) => result.plan.evidenceSufficiency.unresolvedApplicableDimensions.length > 0).length, 19);
  assert.ok(completed.every(({ result }) => result.plan.evidenceSufficiency.terminalReason === "no_useful_questions"));
  assert.ok(completed.every(({ result }) => result.scoring.dimensions.every((dimension) => dimension.score === null || dimension.confidence.level === "medium")));
});

test("las autoevaluaciones de IA/digital no se confunden con dimensiones calibradas de QA-03B", () => {
  assert.ok(QA03B_PROFILE_CASES.every(({ digitalSelfRating, aiSelfRating }) => digitalSelfRating >= 0 && digitalSelfRating <= 5 && aiSelfRating >= 0 && aiSelfRating <= 5));
  assert.equal(DIGITAL_DIMENSION_IDS.includes("ai_maturity" as never), false);
  assert.equal(DIGITAL_DIMENSION_IDS.includes("cybersecurity" as never), false);
  assert.equal(REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.some((question) => /^q2_ai(?:_|$)/i.test(question.id) || question.prompt.toLowerCase().includes("inteligencia artificial")), false);
  assert.equal(REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.some((question) => question.evidenceV3?.dimensions.some((dimension) => dimension.dimension === "measurement_optimization" && dimension.directness === "direct")), false);
});