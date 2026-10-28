import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import { ingestOwnedDiagnosticEventV9 } from "../../../app/features/diagnostic/qa03b/v9-event-ingestion.server";
import { createAnonymousIdentityCredentialV9, createOwnedDiagnosticRunV9, type V9IdentityDb } from "../../../app/features/diagnostic/qa03b/v9-identity-repository";
import { QA03B_V9_CLASSIFICATION_INTERACTION_ID } from "../../../app/features/diagnostic/qa03b/v9-classification-bundle";
import {
  createCandidateSessionV9Prototype,
  currentCandidateQuestionIdV9,
  submitCandidateAnswerV9Prototype,
  submitClassificationV9Prototype,
} from "../../../app/features/diagnostic/qa03b/v9-session-prototype";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { finalizeOwnedDiagnosticRunV9 } from "../../../app/features/diagnostic/qa03b/v9-finalization.server";

const migrations = [
  "0030_diagnostic_v9_audit.sql",
  "0031_diagnostic_v9_identity_ownership.sql",
  "0032_diagnostic_v9_claim_guards.sql",
  "0033_diagnostic_v9_owner_assignment_guards.sql",
  "0034_diagnostic_v9_identity_claim_integrity.sql",
  "0035_diagnostic_v9_result_finalization_guards.sql",
];
const versions = {
  bank: "bank-v9-test", engine: "engine-v9-test", scoring: "scoring-v9-test",
  recommendations: "recommendations-v9-test", consent: "consent-v9-test",
};

function adapter(sqlite: DatabaseSync): V9IdentityDb {
  return {
    async batch(statements: unknown[]) {
      sqlite.exec("BEGIN");
      try {
        const results = statements.map((raw) => {
          const statement = raw as { sql: string; values: unknown[] };
          const result = sqlite.prepare(statement.sql).run(...statement.values as []) as { changes: number };
          return { success: true, meta: { changes: result.changes } };
        });
        sqlite.exec("COMMIT");
        return results;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
    prepare(sql: string) {
      return { bind(...values: unknown[]) {
        return {
          sql, values,
          async first<T>() { return (sqlite.prepare(sql).get(...values as []) ?? null) as T | null; },
          async all<T>() { return { results: sqlite.prepare(sql).all(...values as []) as T[] }; },
          async run() {
            const result = sqlite.prepare(sql).run(...values as []) as { changes: number };
            return { success: true, meta: { changes: result.changes } };
          },
        };
      } };
    },
  };
}

function fixture() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys=ON");
  for (const file of migrations) {
    sqlite.exec(readFileSync(new URL(`../../../db/migrations/${file}`, import.meta.url), "utf8"));
  }
  return { sqlite, db: adapter(sqlite) };
}

function firstCanonicalEvent(runId: string, now: number) {
  const session = createCandidateSessionV9Prototype({ sessionId: runId, writerId: "test", now });
  const questionId = currentCandidateQuestionIdV9(session);
  assert.ok(questionId, "the V9 plan must have an initial question");
  if (questionId === "q2_sector") {
    return {
      kind: QA03B_V9_CLASSIFICATION_INTERACTION_ID,
      payload: { kind: QA03B_V9_CLASSIFICATION_INTERACTION_ID, sector: "other", sectorQuestionId: "q2_sector", mode: "answer" },
    };
  }
  const question = QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2.find((q) => q.id === questionId);
  assert.ok(question, "question belongs to the pinned V9 bank");
  const option = question.options.find((item) => item.kind !== "unknown") ?? question.options[0];
  assert.ok(option);
  return {
    kind: "answer",
    payload: { questionId, value: question.type === "multi" ? [option.value] : option.value, mode: "answer" },
  };
}

test("V9 ingestion validates canonical route before immutable insert and keeps exact retries idempotent", async () => {
  const { sqlite, db } = fixture();
  try {
    const now = Date.now();
    const runId = "ingest-user-run";
    await createOwnedDiagnosticRunV9(db, {
      workspaceId: "public", runId, identityId: "ingest-user-identity",
      userId: "user-a", startedAt: new Date(now).toISOString(), versions,
    });
    const canonical = firstCanonicalEvent(runId, now);
    const input = {
      workspaceId: "public", runId, userId: "user-a", eventId: "event-1",
      expectedSeq: 0, occurredAt: new Date(now + 10).toISOString(), expectedVersions: versions,
      ...canonical,
    };
    await assert.rejects(() => ingestOwnedDiagnosticEventV9(db, {
      ...input, eventId: "invalid-route", kind: "answer",
      payload: { questionId: "q2_not_a_question", value: "yes", mode: "answer" },
    }), /v9_event_not_eligible/);
    assert.equal((sqlite.prepare("SELECT COUNT(*) AS n FROM diagnostic_v9_events").get() as { n: number }).n, 0);

    assert.deepEqual(await ingestOwnedDiagnosticEventV9(db, input), { status: "created", seq: 1 });
    assert.deepEqual(await ingestOwnedDiagnosticEventV9(db, input), { status: "duplicate", seq: 1 });
    assert.deepEqual(await ingestOwnedDiagnosticEventV9(db, {
      ...input, payload: { invalid: true },
    }), { status: "conflict" });
    assert.equal((sqlite.prepare("SELECT COUNT(*) AS n FROM diagnostic_v9_events").get() as { n: number }).n, 1);
    assert.equal((sqlite.prepare("SELECT last_seq FROM diagnostic_v9_runs WHERE run_id=?").get(runId) as { last_seq: number }).last_seq, 1);

    const stale = await ingestOwnedDiagnosticEventV9(db, { ...input, eventId: "another-id" });
    assert.deepEqual(stale, { status: "conflict" });
  } finally {
    sqlite.close();
  }
});

test("V9 ingestion rejects another user and a run with incompatible versions", async () => {
  const { sqlite, db } = fixture();
  try {
    const now = Date.now();
    const runId = "ingest-isolated-run";
    await createOwnedDiagnosticRunV9(db, {
      workspaceId: "public", runId, identityId: "ingest-isolated-identity",
      userId: "user-a", startedAt: new Date(now).toISOString(), versions,
    });
    const input = {
      workspaceId: "public", runId, userId: "user-b", eventId: "unauthorized",
      expectedSeq: 0, occurredAt: new Date(now + 10).toISOString(), expectedVersions: versions,
      ...firstCanonicalEvent(runId, now),
    };
    await assert.rejects(() => ingestOwnedDiagnosticEventV9(db, input), /v9_run_not_owned/);
    await assert.rejects(() => ingestOwnedDiagnosticEventV9(db, {
      ...input, userId: "user-a",
      expectedVersions: { ...versions, engine: "different-engine" },
    }), /v9_run_version_mismatch/);
    assert.equal((sqlite.prepare("SELECT COUNT(*) AS n FROM diagnostic_v9_events").get() as { n: number }).n, 0);
  } finally {
    sqlite.close();
  }
});

test("V9 ingestion requires anonymous credential proof before validating or storing events", async () => {
  const { sqlite, db } = fixture();
  try {
    const now = Date.now();
    const runId = "ingest-anonymous-run";
    const anonymous = await createAnonymousIdentityCredentialV9(db, {
      identityId: "ingest-anonymous-identity",
      createdAt: new Date(now).toISOString(),
    });
    await createOwnedDiagnosticRunV9(db, {
      workspaceId: "public", runId,
      identityId: anonymous.identityId,
      recoveryCredential: anonymous.recoveryCredential,
      startedAt: new Date(now).toISOString(), versions,
    });
    const input = {
      workspaceId: "public", runId,
      identityId: anonymous.identityId,
      recoveryCredential: anonymous.recoveryCredential,
      eventId: "anon-event-1", expectedSeq: 0,
      occurredAt: new Date(now + 10).toISOString(),
      expectedVersions: versions,
      ...firstCanonicalEvent(runId, now),
    };
    await assert.rejects(() => ingestOwnedDiagnosticEventV9(db, {
      ...input, recoveryCredential: "0".repeat(64),
    }), /v9_identity_proof_invalid/);
    assert.equal((sqlite.prepare("SELECT COUNT(*) AS n FROM diagnostic_v9_events").get() as { n: number }).n, 0);
    assert.deepEqual(await ingestOwnedDiagnosticEventV9(db, input), { status: "created", seq: 1 });
    assert.deepEqual(await ingestOwnedDiagnosticEventV9(db, input), { status: "duplicate", seq: 1 });
  } finally {
    sqlite.close();
  }
});

test("V9 replays every ingested interaction before completing and persisting the scored result", async () => {
  const { sqlite, db } = fixture();
  try {
    const now = Date.now();
    const runId = "full-ingestion-finalization-run";
    await createOwnedDiagnosticRunV9(db, {
      workspaceId: "public", runId, identityId: "full-ingestion-identity",
      userId: "user-a", startedAt: new Date(now).toISOString(), versions,
    });

    const explicit: Record<string, string | readonly string[]> = {
      q2_entity: "business", q2_other_staff: "yes", q2_has_customers: "yes",
      q2_operational_status: "operating", q2_monetization: "goods",
      q2_delivery: ["onsite"], q2_customer_buyer: "b2c", q2_customer_reach: "local",
      q2_goal: "explain", q2_friction: "conversion",
      q2_presence_digital_base: "reliable_presence", q2_hospitality_flow_type: "reservation",
    };
    let session = createCandidateSessionV9Prototype({ sessionId: runId, writerId: "test", now });
    const byId = new Map(QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2.map((question) => [question.id, question]));
    for (let turn = 0; turn < 24 && session.status === "in_progress"; turn++) {
      const questionId = currentCandidateQuestionIdV9(session);
      assert.ok(questionId);
      const timestamp = now + turn + 1;
      if (questionId === "q2_sector") {
        const chosen = submitClassificationV9Prototype(
          session, { sector: "food_hospitality", niche: "restaurant" }, "test", timestamp,
        );
        assert.equal(chosen.ok, true);
        if (!chosen.ok) return;
        session = chosen.session;
      } else {
        const question = byId.get(questionId);
        assert.ok(question);
        let value = explicit[questionId];
        if (value === undefined) {
          const neutral = question.options.find((option) => option.kind === "unknown")
            ?? question.options.find((option) => option.kind === "not_applicable");
          assert.ok(neutral);
          value = question.type === "multi" ? [neutral.value] : neutral.value;
        }
        const chosen = submitCandidateAnswerV9Prototype(session, questionId, value, "test", timestamp);
        assert.equal(chosen.ok, true);
        if (!chosen.ok) return;
        session = chosen.session;
      }
      const event = session.replayTranscript.at(-1);
      assert.ok(event);
      const kind = event.kind === "classification" ? event.classification.kind : "answer";
      const payload = event.kind === "classification"
        ? { ...event.classification, mode: event.mode }
        : { questionId: event.questionId, value: event.value, mode: event.mode };
      assert.deepEqual(await ingestOwnedDiagnosticEventV9(db, {
        workspaceId: "public", runId, userId: "user-a", expectedVersions: versions,
        eventId: `full-event-${turn + 1}`, expectedSeq: turn,
        occurredAt: new Date(timestamp).toISOString(), kind, payload,
      }), { status: "created", seq: turn + 1 });
    }

    assert.equal(session.status, "completing");
    assert.equal((sqlite.prepare("SELECT last_seq FROM diagnostic_v9_runs WHERE run_id=?").get(runId) as { last_seq: number }).last_seq, session.replayTranscript.length);
    const finalized = await finalizeOwnedDiagnosticRunV9(db, {
      workspaceId: "public", runId, userId: "user-a", expectedVersions: versions, now: now + 100,
    });
    assert.equal(finalized.status, "completed");
    assert.equal(finalized.resultVersion, 1);
    assert.ok(Array.isArray(finalized.evidence));
    assert.equal((sqlite.prepare("SELECT status FROM diagnostic_v9_runs WHERE run_id=?").get(runId) as { status: string }).status, "completed");
  } finally {
    sqlite.close();
  }
});
