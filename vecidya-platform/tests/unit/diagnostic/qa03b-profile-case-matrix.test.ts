import assert from "node:assert/strict";
import test from "node:test";
import { REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3 } from "../../../app/features/diagnostic/qa03b/bank";
import { runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline";
import { DIGITAL_DIMENSION_IDS } from "../../../app/features/diagnostic/qbv2-dimensions";
import { QA03B_PROFILE_CASES, qa03bProfileAnswerScript } from "./qa03b-profile-case-matrix";
import { QA03B_KNOWLEDGE_LEVELS, QA03B_PROFILE_KNOWLEDGE_VARIANTS } from "./qa03b-profile-knowledge-variants";
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

function runScript(id: string, script: AnswersV2) {
  let answers: AnswersV2 = {};
  const asked: { questionId: string; answer: string | readonly string[] }[] = [];
  for (let turn = 0; turn < 30; turn += 1) {
    const result = runCandidateDiagnosticPipelineV3(answers);
    const questionId = result.plan.nextQuestionId;
    if (!questionId) return { result, answers: result.plan.activeAnswers, asked };
    const answer = script[questionId];
    assert.notEqual(answer, undefined, `${id}: no authored answer for selected ${questionId}`);
    const definition = bank.get(questionId);
    assert.ok(definition, `${id}: planner selected a question outside the reviewed QA-03B bank`);
    const selected = typeof answer === "string" ? [answer] : answer;
    assert.ok(selected.length > 0 && selected.every((value) => definition.options.some((option) => option.value === value)), `${id}: invalid authored response for ${questionId}`);
    answers = { ...result.plan.activeAnswers, [questionId]: answer };
    asked.push({ questionId, answer });
  }
  assert.fail(`${id}: route did not reach a terminal state within 30 questions`);
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
  assert.ok(completed.every(({ result }) => result.plan.completion.ready && !result.plan.completion.hardCapReached),
    JSON.stringify(completed.filter(({ result }) => !result.plan.completion.ready || result.plan.completion.hardCapReached).map(({ profile, result }) => ({ id: profile.id, ready: result.plan.completion.ready, hardCapReached: result.plan.completion.hardCapReached, terminalReason: result.plan.completion.terminalReason, routeLength: result.plan.routeLength, useful: result.plan.evidenceSufficiency.usefulQuestionIds, trace: result.plan.trace.filter((entry) => entry.skipReason).map(({ questionId, skipReason }) => [questionId, skipReason]) }))));
  assert.ok(completed.every(({ answers }) => answers.q2_operational_status === "operating" && answers.q2_has_customers === "yes"));
  assert.ok(completed.every(({ result }) => result.overall.index.displayScore === null));
  assert.equal(completed.reduce((count, { result }) => count + result.scoring.dimensions.filter((dimension) => dimension.score !== null).length, 0), 7,
    JSON.stringify(completed.flatMap(({ profile, result }) => result.scoring.dimensions.filter((dimension) => dimension.score !== null).map(({ id, score, confidence }) => ({ profile: profile.id, dimension: id, score, confidence: confidence.level })))));
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
  assert.equal(REVIEWED_EVIDENCE_CANDIDATE_QUESTIONS_V3.some((question) => question.evidenceV3?.dimensions.some((dimension) => dimension.dimension === "measurement_optimization" && dimension.directness === "direct")), true);
});

test("60 variantes por nivel de conocimiento recorren el motor sin reutilizar autoevaluaciones como respuestas", () => {
  assert.equal(QA03B_KNOWLEDGE_LEVELS.length, 3);
  assert.equal(QA03B_PROFILE_KNOWLEDGE_VARIANTS.length, 60);
  assert.equal(new Set(QA03B_PROFILE_KNOWLEDGE_VARIANTS.map(({ id }) => id)).size, 60);
  for (const profile of QA03B_PROFILE_CASES) {
    const variants = QA03B_PROFILE_KNOWLEDGE_VARIANTS.filter(({ profileId }) => profileId === profile.id);
    assert.deepEqual(variants.map(({ knowledgeLevel }) => knowledgeLevel).sort(), [...QA03B_KNOWLEDGE_LEVELS].sort());
    for (const variant of variants) {
      for (const [questionId, answer] of Object.entries(variant.answerScript)) {
        const definition = bank.get(questionId);
        assert.ok(definition, `${variant.id}: answer script references unknown question ${questionId}`);
        const selected = typeof answer === "string" ? [answer] : answer;
        assert.ok(selected.length > 0 && selected.every((value) => definition.options.some((option) => option.value === value)), `${variant.id}: invalid authored response for ${questionId}`);
      }
      assert.deepEqual(variant.modeledAssumptionQuestionIds.includes("q2_goal"), variant.knowledgeLevel === "informado");
      assert.equal(variant.modeledAssumptionQuestionIds.includes("q2_process_systemization"), variant.knowledgeLevel === "informado");
      assert.equal("digitalSelfRating" in variant.answerScript || "aiSelfRating" in variant.answerScript, false);
    }
  }
  const completed = QA03B_PROFILE_KNOWLEDGE_VARIANTS.map((variant) => ({ variant, ...runScript(variant.id, variant.answerScript) }));
  assert.ok(completed.every(({ asked }) => asked.length > 0 && new Set(asked.map(({ questionId }) => questionId)).size === asked.length));
  assert.deepEqual(completed.filter(({ result }) => result.plan.completion.hardCapReached).map(({ variant }) => variant.id), []);
  assert.ok(completed.every(({ answers }) => answers.q2_operational_status === "operating" && answers.q2_has_customers === "yes"));
  assert.ok(completed.every(({ result }) => result.overall.index.displayScore === null));
  assert.ok(completed.every(({ result }) => ["no_useful_questions", "budget_blocked"].includes(result.plan.evidenceSufficiency.terminalReason ?? "")));
});
