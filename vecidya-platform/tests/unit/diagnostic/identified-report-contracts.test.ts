import assert from "node:assert/strict";
import { test } from "node:test";

import { readRequestBodyLimited, RequestBodyTooLargeError } from "../../../app/features/diagnostic/bounded-request-body.server.ts";
import { validateDiagnosticReportRequest } from "../../../app/features/diagnostic/identified-report-contracts.ts";
import { PUBLIC_DIAGNOSTIC_ENGINE_IDENTITY_V1 } from "../../../app/features/diagnostic/public-diagnostic-replay.server.ts";
import { constantTimeEqual, createOpaqueToken, digestOpaqueToken, readCookie, reportAccessCookie } from "../../../app/features/diagnostic/report-access-crypto.server.ts";
import { COMMERCIAL_CONTACT_NOTICE_VERSION, DIAGNOSTIC_RESEARCH_NOTICE_VERSION, REPORT_SERVICE_NOTICE_VERSION } from "../../../app/features/diagnostic/identified-report-constants.ts";

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
