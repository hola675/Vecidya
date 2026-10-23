import assert from "node:assert/strict";
import { test } from "node:test";

import { readRequestBodyLimited, RequestBodyTooLargeError } from "../../../app/features/diagnostic/bounded-request-body.server.ts";
import { validateDiagnosticReportRequest } from "../../../app/features/diagnostic/identified-report-contracts.ts";
import { PUBLIC_DIAGNOSTIC_ENGINE_IDENTITY_V1 } from "../../../app/features/diagnostic/public-diagnostic-replay.server.ts";
import { constantTimeEqual, createOpaqueToken, digestOpaqueToken, readCookie, reportAccessCookie } from "../../../app/features/diagnostic/report-access-crypto.server.ts";
import { COMMERCIAL_CONTACT_NOTICE_VERSION, DIAGNOSTIC_RESEARCH_NOTICE_VERSION, REPORT_SERVICE_NOTICE_VERSION } from "../../../app/features/diagnostic/identified-report-constants.ts";
import { ANSWER_SCHEMA_ID, QUESTION_BANK_ID, SESSION_KEY, SESSION_SCHEMA } from "../../../app/features/diagnostic/qa03b/contract.ts";
import { CANDIDATE_RESULT_IDENTITY_V3 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline.ts";
import type { AnonymousDiagnosticSummaryV1 } from "../../../app/features/diagnostic/qa03b/qbv2-candidate-funnel.ts";

const validRequest = () => ({
  engineIdentity: PUBLIC_DIAGNOSTIC_ENGINE_IDENTITY_V1,
  answers: [{ questionId: "q2_entity", value: "business" }],
  fullName: "  Ana   Pérez ", businessName: null, email: " ANA@example.com ", phone: null,
  serviceNoticeVersion: REPORT_SERVICE_NOTICE_VERSION, serviceNoticeAcknowledged: true,
  commercialContactOptIn: false, commercialNoticeVersion: null,
  researchParticipationOptIn: false, researchNoticeVersion: null,
});

test("identified report request validates service notice independently of optional purposes", () => {
  const validated = validateDiagnosticReportRequest(validRequest());
  assert.ok(validated);
  assert.equal(validated.fullName, "Ana Pérez");
  assert.equal(validated.email, "ana@example.com");
  assert.equal(validated.phone, null);
  assert.equal(validated.commercialContactOptIn, false);
  assert.equal(validated.researchParticipationOptIn, false);
  assert.equal(validateDiagnosticReportRequest({ ...validRequest(), serviceNoticeAcknowledged: false }), null);
  assert.equal(validateDiagnosticReportRequest({ ...validRequest(), commercialContactOptIn: true }), null);
  assert.equal(validateDiagnosticReportRequest({ ...validRequest(), commercialContactOptIn: true, commercialNoticeVersion: COMMERCIAL_CONTACT_NOTICE_VERSION })?.commercialContactOptIn, true, "commercial purpose remains an independent optional choice");
  assert.equal(validateDiagnosticReportRequest({ ...validRequest(), researchParticipationOptIn: true }), null);
  assert.equal(validateDiagnosticReportRequest({ ...validRequest(), email: "not an email" }), null);
  assert.equal(validateDiagnosticReportRequest({ ...validRequest(), unexpected: "expanded report" }), null);
});

test("identified report request stores each optional purpose only with its own versioned opt-in", () => {
  const value = {
    ...validRequest(), commercialContactOptIn: true, commercialNoticeVersion: COMMERCIAL_CONTACT_NOTICE_VERSION,
    researchParticipationOptIn: true, researchNoticeVersion: DIAGNOSTIC_RESEARCH_NOTICE_VERSION,
  };
  const validated = validateDiagnosticReportRequest(value);
  assert.ok(validated);
  assert.equal(validated.commercialContactOptIn, true);
  assert.equal(validated.researchParticipationOptIn, true);
  assert.equal(validateDiagnosticReportRequest({ ...value, researchNoticeVersion: null }), null);
});

test("identified QA-03B request accepts only its exact session, answer and summary contracts", async () => {
  const module = await import("../../../app/features/diagnostic/qa03b/identified-report-request.server.ts");
  assert.equal(typeof module.validateQa03bDiagnosticReportRequest, "function", "the identified boundary needs an explicit QA-03B contract");
  const summary: AnonymousDiagnosticSummaryV1 = {
    contractVersion: "anonymous-diagnostic-summary-v1",
    overallStatus: "Información insuficiente",
    score: null,
    confidence: "Sin score",
    coverage: "Cobertura parcial",
    executiveSummary: "Resumen QA de prueba.",
    primaryOpportunity: null,
    firstRecommendedAction: null,
    limitations: ["Lectura parcial"],
    methodologyVersion: CANDIDATE_RESULT_IDENTITY_V3.methodology,
    diagnosticIdentity: CANDIDATE_RESULT_IDENTITY_V3,
  };
  const qaRequest = () => ({
    replayVersion: "qa03b-worker-replay-v4",
    engineIdentity: CANDIDATE_RESULT_IDENTITY_V3,
    answerSchema: ANSWER_SCHEMA_ID,
    questionBank: QUESTION_BANK_ID,
    sessionSchema: SESSION_SCHEMA,
    sessionKey: SESSION_KEY,
    session: { schemaVersion: SESSION_SCHEMA, questionBankIdentity: QUESTION_BANK_ID, engineIdentity: CANDIDATE_RESULT_IDENTITY_V3 },
    anonymousSummary: summary,
    fullName: "  Ana   Pérez ", businessName: null, email: " ANA@example.com ", phone: null,
    serviceNoticeVersion: REPORT_SERVICE_NOTICE_VERSION, serviceNoticeAcknowledged: true,
    commercialContactOptIn: false, commercialNoticeVersion: null,
    researchParticipationOptIn: false, researchNoticeVersion: null,
  });
  const validated = module.validateQa03bDiagnosticReportRequest(qaRequest());
  assert.ok(validated);
  assert.deepEqual(validated.engineIdentity, CANDIDATE_RESULT_IDENTITY_V3);
  assert.equal(validated.answerSchema, ANSWER_SCHEMA_ID);
  assert.equal(validated.questionBank, QUESTION_BANK_ID);
  assert.equal(validated.fullName, "Ana Pérez");
  assert.equal(validated.email, "ana@example.com");
  assert.equal(module.validateQa03bDiagnosticReportRequest({ ...qaRequest(), answerSchema: "qbv2-answers-v2" }), null);
  assert.equal(module.validateQa03bDiagnosticReportRequest({ ...qaRequest(), questionBank: "reviewed-evidence-v3" }), null);
  assert.equal(module.validateQa03bDiagnosticReportRequest({ ...qaRequest(), sessionKey: "vecidya.diagnostic.v3.session.2" }), null);
  assert.equal(module.validateQa03bDiagnosticReportRequest({ ...qaRequest(), answers: [{ questionId: "q2_entity", value: "business" }] }), null);
  assert.equal(module.validateQa03bDiagnosticReportRequest({ ...qaRequest(), anonymousSummary: { ...summary, email: "ana@example.com" } }), null);
});

test("request body reader rejects declared and streamed oversize bodies at the byte limit", async () => {
  await assert.rejects(() => readRequestBodyLimited(new Request("https://local.test", { method: "POST", headers: { "content-length": "5" }, body: "12345" }), 4), RequestBodyTooLargeError);
  const streamed = new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(new TextEncoder().encode("123")); controller.enqueue(new TextEncoder().encode("45")); controller.close(); },
  });
  await assert.rejects(() => readRequestBodyLimited(new Request("https://local.test", { method: "POST", body: streamed, duplex: "half" }), 4), RequestBodyTooLargeError);
  assert.equal(await readRequestBodyLimited(new Request("https://local.test", { method: "POST", body: "1234" }), 4), "1234");
});

test("verification token is opaque, digest-only comparable, and cookie is scoped to report path", async () => {
  const token = createOpaqueToken();
  assert.match(token, /^[A-Za-z0-9_-]{43}$/u);
  const digest = await digestOpaqueToken(token);
  assert.equal(digest.length, 64);
  assert.ok(constantTimeEqual(digest, await digestOpaqueToken(token)));
  assert.equal(constantTimeEqual(digest, await digestOpaqueToken(token + "x")), false);
  const cookie = reportAccessCookie(token, new Request("https://local.test/diagnostico/informe/id"), 60);
  assert.match(cookie, /HttpOnly/u);
  assert.match(cookie, /SameSite=Strict/u);
  assert.match(cookie, /Path=\/diagnostico\/informe/u);
  assert.match(cookie, /Secure/u);
  assert.equal(readCookie(new Request("https://local.test", { headers: { Cookie: `other=x; diagnostic_report_access=${token}` } }), "diagnostic_report_access"), token);
});
