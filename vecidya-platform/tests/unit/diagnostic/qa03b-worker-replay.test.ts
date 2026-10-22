import assert from "node:assert/strict";
import { test } from "node:test";

import { buildCandidateDiagnosticReportV1 } from "../../../app/components/diagnostic-flow/qa03b-presentation.ts";
import { buildAnonymousDiagnosticSummaryV1 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-funnel.ts";
import { CANDIDATE_RESULT_IDENTITY_V3 as ACT_IDENTITY_V3 } from "../../../app/features/diagnostic/qbv2-candidate-pipeline.ts";
import { PUBLIC_DIAGNOSTIC_ENGINE_IDENTITY_V1 } from "../../../app/features/diagnostic/public-diagnostic-replay.server.ts";
import {
  ANSWER_SCHEMA_ID,
  QUESTION_BANK_ID,
  SESSION_KEY,
  SESSION_SCHEMA,
} from "../../../app/features/diagnostic/qa03b/contract.ts";
import {
  completeCandidateSessionV3,
  createCandidateSessionV3,
  currentCandidateQuestionIdV3,
  goBackCandidateV3,
  parseCandidateSessionV3,
  submitCandidateAnswerV3,
  type CandidateSessionV3,
} from "../../../app/features/diagnostic/qa03b/qbv2-candidate-session.ts";
import { CANDIDATE_RESULT_IDENTITY_V3, runCandidateDiagnosticPipelineV3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline.ts";
import { AUTHORED_JOURNEYS } from "./qa03b-fixtures.ts";

const NOW = 1_900_000_000_000;
const fixture = AUTHORED_JOURNEYS.find((item) => item.id === "operating-project");
assert.ok(fixture);

function completeSession(answers: typeof fixture.answers = fixture.answers, now = NOW): CandidateSessionV3 {
  let session = createCandidateSessionV3({ sessionId: "qa03b-worker-test", writerId: "test-tab", now });
  for (let attempt = 0; attempt < 24 && session.status === "in_progress"; attempt += 1) {
    const questionId = currentCandidateQuestionIdV3(session);
    assert.ok(questionId, "el planner debe seleccionar una pregunta antes del terminal");
    const value = answers[questionId];
    assert.notEqual(value, undefined, `fixture explícito para ${questionId}`);
    const submitted = submitCandidateAnswerV3(session, questionId, value, session.writerId, now + attempt + 1);
    assert.equal(submitted.ok, true, `la sesión acepta la respuesta ${questionId}`);
    if (!submitted.ok) throw new Error(`fixture inválido: ${questionId}`);
    session = submitted.session;
  }
  assert.equal(session.status, "completing");
  const completed = completeCandidateSessionV3(session, session.writerId, now + 100);
  assert.ok(completed);
  return completed.session;
}

function completingSession(answers: typeof fixture.answers = fixture.answers, now = NOW): CandidateSessionV3 {
  let session = createCandidateSessionV3({ sessionId: "qa03b-worker-completion", writerId: "test-tab", now });
  for (let attempt = 0; attempt < 24 && session.status === "in_progress"; attempt += 1) {
    const questionId = currentCandidateQuestionIdV3(session);
    assert.ok(questionId);
    const value = answers[questionId];
    assert.notEqual(value, undefined, `fixture explícito para ${questionId}`);
    const submitted = submitCandidateAnswerV3(session, questionId, value, session.writerId, now + attempt + 1);
    assert.equal(submitted.ok, true);
    if (!submitted.ok) throw new Error(`fixture inválido: ${questionId}`);
    session = submitted.session;
  }
  assert.equal(session.status, "completing");
  return session;
}

function completeEditedSession(): CandidateSessionV3 {
  const paused = AUTHORED_JOURNEYS.find((item) => item.id === "paused-history");
  assert.ok(paused);
  let session = completeSession(fixture.answers, NOW);
  const editedQuestionId = "q2_operational_status";
  const reviewIndex = session.answeredQuestionIds.indexOf(editedQuestionId);
  assert.ok(reviewIndex >= 0);
  let now = NOW + 1_000;
  while (session.reviewIndex !== reviewIndex) session = goBackCandidateV3(session, session.writerId, now++);
  const edited = submitCandidateAnswerV3(session, editedQuestionId, "paused", session.writerId, now++);
  assert.equal(edited.ok, true);
  if (!edited.ok) throw new Error("fixture cannot replan the paused state");
  session = edited.session;
  for (let attempt = 0; attempt < 24 && session.status === "in_progress"; attempt += 1) {
    const questionId = currentCandidateQuestionIdV3(session);
    assert.ok(questionId);
    const value = session.answers[questionId] ?? paused.answers[questionId] ?? fixture.answers[questionId];
    assert.notEqual(value, undefined, `authored paused/operating response for ${questionId}`);
    const submitted = submitCandidateAnswerV3(session, questionId, value, session.writerId, now++);
    assert.equal(submitted.ok, true);
    if (!submitted.ok) throw new Error(`fixture cannot continue ${questionId}`);
    session = submitted.session;
  }
  assert.equal(session.status, "completing");
  const completed = completeCandidateSessionV3(session, session.writerId, now + 100);
  assert.ok(completed);
  return completed.session;
}

function envelope(session: CandidateSessionV3) {
  return {
    replayVersion: "qa03b-worker-replay-v2",
    engineIdentity: CANDIDATE_RESULT_IDENTITY_V3,
    answerSchema: ANSWER_SCHEMA_ID,
    questionBank: QUESTION_BANK_ID,
    sessionSchema: SESSION_SCHEMA,
    sessionKey: SESSION_KEY,
    session,
  };
}

test("QA-03B v4 keeps the v3 storage key intact and records an ordered replay history", () => {
  const session = completeSession();
  const replayHistory = (session as CandidateSessionV3 & { readonly replayTranscript?: readonly { readonly questionId: string; readonly mode: string }[] }).replayTranscript;

  assert.equal(session.schemaVersion, SESSION_SCHEMA);
  assert.equal(SESSION_KEY, "vecidya.diagnostic.v3.candidate.session.4");
  assert.ok(Array.isArray(replayHistory), "la sesión debe conservar los eventos necesarios para revalidar su recorrido");
  assert.deepEqual(replayHistory?.map((event) => event.questionId), session.answeredQuestionIds);
  assert.ok(replayHistory?.every((event) => event.mode === "answer"));
  assert.deepEqual(parseCandidateSessionV3(JSON.stringify(session), NOW + 200), session);
});

test("QA-03B can persist completion without computing a browser-side result", async () => {
  const module = await import("../../../app/features/diagnostic/qa03b/qbv2-candidate-session.ts");
  assert.equal(typeof module.markCandidateSessionCompletedV3, "function", "the browser needs a completion-only transition");
  const pending = completingSession();
  const completed = module.markCandidateSessionCompletedV3(pending, "test-tab", NOW + 200);
  assert.ok(completed);
  assert.equal(completed.status, "completed");
  assert.equal(completed.completedAt, NOW + 200);
  assert.deepEqual(completed.answers, pending.answers);
  assert.deepEqual(completed.replayTranscript, pending.replayTranscript);
  assert.equal(Object.hasOwn(completed, "result"), false);
});

test("QA-03B Worker replays an edited answer and its replanned route from schema-3 history", async () => {
  const { replayQa03bSessionV1 } = await replayApi();
  const session = completeEditedSession();
  const history = (session as CandidateSessionV3 & { readonly replayTranscript?: readonly { readonly mode: string }[] }).replayTranscript;
  assert.ok(history?.some((event) => event.mode === "edit"));
  const replay = replayQa03bSessionV1(envelope(session), NOW + 2_000);
  assert.equal(replay.ok, true);
  if (!replay.ok) return;
  assert.deepEqual(replay.session.answeredQuestionIds, session.answeredQuestionIds);
  assert.deepEqual(replay.session.answers, session.answers);
  assert.equal(replay.result.context.operationalStatus.value, "paused");
});

test("QA-03B accepts an unedited historical schema/key-3 session without reinterpreting other versions", async () => {
  const { replayQa03bSessionV1 } = await replayApi();
  const { replayTranscript: _localOnlyHistory, ...historicalSession } = completeSession();
  const replay = replayQa03bSessionV1(envelope(historicalSession), NOW + 200);
  assert.equal(replay.ok, true);
  if (!replay.ok) return;
  assert.deepEqual(replay.result.engineIdentity, CANDIDATE_RESULT_IDENTITY_V3);
  assert.deepEqual(replay.session.answers, historicalSession.answers);
});

async function replayApi() {
  const module = await import("../../../app/features/diagnostic/qa03b/worker-replay.server.ts").catch(() => null);
  assert.ok(module, "debe existir el replay QA-03B server-only");
  return module;
}

test("QA-03B Worker replay reconstruye la ruta y comparte resultado versionado entre resumen e informe", async () => {
  const { replayQa03bSessionV1, buildQa03bReplayProjectionsV1 } = await replayApi();
  const session = completeSession();
  const replay = replayQa03bSessionV1(envelope(session), NOW + 200);
  assert.equal(replay.ok, true);
  if (!replay.ok) return;

  const expected = runCandidateDiagnosticPipelineV3(replay.session.answers);
  assert.deepEqual(replay.result, expected);
  assert.deepEqual(replay.result.engineIdentity, CANDIDATE_RESULT_IDENTITY_V3);
  assert.deepEqual(replay.session.answeredQuestionIds, session.answeredQuestionIds);

  const projections = buildQa03bReplayProjectionsV1(replay, "Proyecto verificado", new Date(NOW + 300));
  const anonymousReport = buildCandidateDiagnosticReportV1(replay.result, new Date(NOW + 200), new Date(NOW + 300));
  assert.deepEqual(projections.summary, buildAnonymousDiagnosticSummaryV1(replay.result));
  const summaryContract = await import("../../../app/features/diagnostic/qa03b/qbv2-candidate-funnel.ts");
  assert.equal(summaryContract.isAnonymousDiagnosticSummaryV1(projections.summary), true);
  assert.equal(summaryContract.isAnonymousDiagnosticSummaryV1({ ...projections.summary, answers: replay.session.answers }), false);
  assert.deepEqual(projections.report, buildCandidateDiagnosticReportV1(replay.result, new Date(NOW + 200), new Date(NOW + 300), "Proyecto verificado"));
  assert.deepEqual({ ...projections.report, identity: { ...projections.report.identity, businessName: null } }, anonymousReport, "identificar el informe solo personaliza el nombre; no altera el resultado ni sus recomendaciones");
  assert.deepEqual(projections.summary.diagnosticIdentity, projections.report.candidateEngineIdentity);
  assert.equal(projections.report.identity.businessName, "Proyecto verificado");
  assert.equal(projections.report.overallPresence.percent, replay.result.overall.index.displayScore === null ? null : `${replay.result.overall.index.displayScore}%`);
  assert.equal(Object.hasOwn(projections.report, "answers"), false);
  assert.equal(Object.hasOwn(projections.report, "email"), false);
  assert.equal(Object.hasOwn(projections.report, "session"), false);
  assert.deepEqual(Object.keys(projections.summary), [
    "contractVersion", "overallStatus", "score", "confidence", "coverage", "executiveSummary",
    "primaryOpportunity", "firstRecommendedAction", "limitations", "methodologyVersion", "diagnosticIdentity",
  ]);
  assert.equal(Object.hasOwn(projections.summary, "answers"), false);
  assert.equal(JSON.stringify(projections.summary).includes("q2_sector"), false);
  assert.equal(JSON.stringify(projections.summary).includes("Proyecto verificado"), false);
});

test("QA-03B Worker replay rechaza identidades, versiones y payloads híbridos", async () => {
  const { replayQa03bSessionV1 } = await replayApi();
  const valid = envelope(completeSession());
  const invalid = [
    { ...valid, engineIdentity: PUBLIC_DIAGNOSTIC_ENGINE_IDENTITY_V1 },
    { ...valid, engineIdentity: ACT_IDENTITY_V3 },
    { ...valid, engineIdentity: { ...valid.engineIdentity, engine: PUBLIC_DIAGNOSTIC_ENGINE_IDENTITY_V1.engine } },
    { ...valid, answerSchema: "qbv2-answers-v2" },
    { ...valid, questionBank: "reviewed-evidence-v3" },
    { ...valid, sessionSchema: 2 },
    { ...valid, sessionKey: "vecidya.diagnostic.v3.session.2" },
    { ...valid, score: 84 },
    { ...valid, result: runCandidateDiagnosticPipelineV3(valid.session.answers) },
    { ...valid, report: buildCandidateDiagnosticReportV1(runCandidateDiagnosticPipelineV3(valid.session.answers), new Date(NOW)) },
  ];
  for (const item of invalid) assert.equal(replayQa03bSessionV1(item, NOW + 200).ok, false);
});

test("QA-03B Worker replay rechaza sesiones vencidas, incompletas, alteradas, duplicadas y fuera de orden", async () => {
  const { replayQa03bSessionV1 } = await replayApi();
  const session = completeSession();
  const firstId = session.answeredQuestionIds[0]!;
  const secondId = session.answeredQuestionIds[1]!;
  const expiredSession = completeSession(fixture.answers, NOW - 14 * 24 * 60 * 60 * 1000 - 500);
  const duplicate = { ...session, answeredQuestionIds: [...session.answeredQuestionIds, firstId] };
  const outOfOrder = { ...session, answeredQuestionIds: [secondId, firstId, ...session.answeredQuestionIds.slice(2)] };
  const altered = { ...session, answers: { ...session.answers, [firstId]: "not-a-bank-option" } };
  const unfinished = { ...session, status: "in_progress" as const, completedAt: null, terminalReason: null };

  for (const invalid of [expiredSession, duplicate, outOfOrder, altered, unfinished]) {
    assert.equal(replayQa03bSessionV1(envelope(invalid), NOW + 200).ok, false);
  }
});
