import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import {
  readOwnedDiagnosticRunStateV9,
} from "../../../app/features/diagnostic/qa03b/v9-run-state.server";
import {
  createCandidateSessionV9Prototype,
  currentCandidateQuestionIdV9,
  submitCandidateAnswerV9Prototype,
  submitClassificationV9Prototype,
} from "../../../app/features/diagnostic/qa03b/v9-session-prototype";
import { QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 } from "../../../app/features/diagnostic/qa03b/specialty-branches-wave1";
import { appendDiagnosticEventV9, type V9RunVersions } from "../../../app/features/diagnostic/qa03b/v9-audit-repository";
import type { V9IdentityDb } from "../../../app/features/diagnostic/qa03b/v9-identity-repository";

const NOW = 1_900_000_000_000;
const versions: V9RunVersions = {
  bank: "test-bank-v9",
  engine: "test-engine-v9",
  scoring: "test-scoring-v9",
  recommendations: "test-recommendations-v9",
  consent: "test-consent-v9",
};
const migrations = [
  "0030_diagnostic_v9_audit.sql",
  "0031_diagnostic_v9_identity_ownership.sql",
  "0032_diagnostic_v9_claim_guards.sql",
  "0033_diagnostic_v9_owner_assignment_guards.sql",
  "0034_diagnostic_v9_identity_claim_integrity.sql",
  "0035_diagnostic_v9_result_finalization_guards.sql",
];

function fixture() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys=ON");
  for (const migration of migrations) {
    sqlite.exec(readFileSync(new URL(`../../../db/migrations/${migration}`, import.meta.url), "utf8"));
  }
  const db: V9IdentityDb = {
    async batch() { throw new Error("batch not required"); },
    prepare(sql) {
      return { bind(...values: unknown[]) {
        return {
          async run() {
            const result = sqlite.prepare(sql).run(...values as []) as { changes?: number };
            return { success: true, meta: { changes: result.changes ?? 0 } };
          },
          async first<T>() {
            return (sqlite.prepare(sql).get(...values as []) ?? null) as T | null;
          },
          async all<T>() {
            return { results: sqlite.prepare(sql).all(...values as []) as T[] };
          },
        };
      } };
    },
  };
  sqlite.prepare(
    "INSERT INTO diagnostic_v9_runs (workspace_id,run_id,started_at,bank_version,engine_version,scoring_version,recommendation_version,consent_version) VALUES (?,?,?,?,?,?,?,?)",
  ).run("public", "run-a", new Date(NOW).toISOString(), versions.bank, versions.engine, versions.scoring, versions.recommendations, versions.consent);
  sqlite.prepare(
    "INSERT INTO diagnostic_v9_identities (identity_id,identity_type,user_id,created_at) VALUES (?,'user',?,?)",
  ).run("identity-a", "user-a", new Date(NOW).toISOString());
  sqlite.prepare(
    "INSERT INTO diagnostic_v9_run_ownership (workspace_id,run_id,identity_id,assigned_at,assignment_source) VALUES (?,?,?,?,'authenticated_session')",
  ).run("public", "run-a", "identity-a", new Date(NOW).toISOString());
  return { sqlite, db };
}

test("V9 resumes only the authenticated owner's partial SQLite run", async () => {
  const { sqlite, db } = fixture();
  try {
    const empty = await readOwnedDiagnosticRunStateV9(db, {
      workspaceId: "public", runId: "run-a", userId: "user-a",
      expectedVersions: versions, now: NOW + 100,
    });
    assert.equal(empty.status, "active");
    assert.equal(empty.lastSeq, 0);
    assert.equal(empty.interactionCount, 0);
    assert.equal(empty.readyToFinalize, false);
    assert.ok(empty.nextQuestionId);

    const initial = createCandidateSessionV9Prototype({
      sessionId: "run-a", writerId: "test", now: NOW,
    });
    const next = currentCandidateQuestionIdV9(initial);
    assert.ok(next);
    const submitted = next === "q2_sector"
      ? submitClassificationV9Prototype(initial, { sector: "other" }, "test", NOW + 1)
      : submitCandidateAnswerV9Prototype(initial, next, next === "q2_entity"
        ? "business"
        : QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2.find((item) => item.id === next)!.options[0]!.value,
        "test", NOW + 1);
    assert.equal(submitted.ok, true);
    if (!submitted.ok) return;

    const event = submitted.session.replayTranscript.at(-1);
    assert.ok(event);
    await appendDiagnosticEventV9(db, {
      workspaceId: "public",
      runId: "run-a",
      eventId: "event-a",
      expectedSeq: 0,
      kind: event.kind === "classification" ? event.classification.kind : "answer",
      payload: event.kind === "classification"
        ? { ...event.classification, mode: event.mode }
        : { questionId: event.questionId, value: event.value, mode: event.mode },
      occurredAt: new Date(NOW + 1).toISOString(),
      actorType: "client",
    });

    const restored = await readOwnedDiagnosticRunStateV9(db, {
      workspaceId: "public", runId: "run-a", userId: "user-a",
      expectedVersions: versions, now: NOW + 100,
    });
    assert.equal(restored.lastSeq, 1);
    assert.equal(restored.interactionCount, 1);
    assert.deepEqual(restored.answers, submitted.session.answers);
    assert.equal(restored.nextQuestionId, currentCandidateQuestionIdV9(submitted.session));

    await assert.rejects(() => readOwnedDiagnosticRunStateV9(db, {
      workspaceId: "public", runId: "run-a", userId: "user-b",
      expectedVersions: versions, now: NOW + 100,
    }), /v9_run_not_owned/);
    await assert.rejects(() => readOwnedDiagnosticRunStateV9(db, {
      workspaceId: "public", runId: "run-a", userId: "user-a",
      expectedVersions: { ...versions, bank: "different-bank" }, now: NOW + 100,
    }), /v9_run_version_mismatch/);
  } finally {
    sqlite.close();
  }
});

test("V9 refuses to restore a committed but route-ineligible answer", async () => {
  const { sqlite, db } = fixture();
  try {
    await appendDiagnosticEventV9(db, {
      workspaceId: "public", runId: "run-a", eventId: "forged",
      expectedSeq: 0, kind: "answer",
      payload: { questionId: "not-current", value: "forged", mode: "answer" },
      occurredAt: new Date(NOW + 1).toISOString(),
      actorType: "client",
    });
    await assert.rejects(() => readOwnedDiagnosticRunStateV9(db, {
      workspaceId: "public", runId: "run-a", userId: "user-a",
      expectedVersions: versions, now: NOW + 100,
    }), /v9_recovery_failed:route/);
  } finally {
    sqlite.close();
  }
});
