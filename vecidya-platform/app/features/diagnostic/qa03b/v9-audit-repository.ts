/**
 * Diagnostic V9 audit persistence (prototype). The caller must resolve workspaceId
 * from authenticated server context; never accept it directly from a browser.
 */
export type V9AuditDb = {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
};

export type V9RunVersions = {
  bank: string;
  engine: string;
  scoring: string;
  recommendations: string;
  consent: string;
};

export async function createDiagnosticRunV9(
  db: V9AuditDb,
  args: {
    workspaceId: string;
    runId: string;
    clientId?: string;
    versions: V9RunVersions;
    now: string;
  },
): Promise<void> {
  if (!args.workspaceId || !args.runId || Object.values(args.versions).some((v) => !v)) {
    throw new Error("v9_run_invalid_identity_or_versions");
  }
  await db.prepare(
    "INSERT INTO diagnostic_v9_runs (workspace_id,run_id,client_id,status,started_at,last_seq,bank_version,engine_version,scoring_version,recommendation_version,consent_version) VALUES (?,?,?,'active',?,0,?,?,?,?,?)",
  ).bind(
    args.workspaceId, args.runId, args.clientId ?? null, args.now,
    args.versions.bank, args.versions.engine, args.versions.scoring,
    args.versions.recommendations, args.versions.consent,
  ).run();
}

export async function listDiagnosticRunsV9(
  db: V9AuditDb,
  workspaceId: string,
  clientId: string,
  limit = 20,
): Promise<readonly { run_id: string; status: string; started_at: string; last_seq: number }[]> {
  if (!workspaceId || !clientId) throw new Error("v9_run_missing_scope");
  const boundedLimit = Number.isFinite(limit) ? Math.max(1, Math.min(100, Math.trunc(limit))) : 20;
  const result = await db.prepare(
    "SELECT run_id,status,started_at,last_seq FROM diagnostic_v9_runs WHERE workspace_id = ? AND client_id = ? ORDER BY started_at DESC,run_id DESC LIMIT ?",
  ).bind(workspaceId, clientId, boundedLimit).all<{
    run_id: string; status: string; started_at: string; last_seq: number;
  }>();
  return result.results;
}

export async function readDiagnosticEventsV9(
  db: V9AuditDb,
  workspaceId: string,
  runId: string,
  afterSeq = 0,
): Promise<readonly { seq: number; event_id: string; kind: string; payload_json: string; schema_version: number }[]> {
  if (!workspaceId || !runId || !Number.isSafeInteger(afterSeq) || afterSeq < 0) {
    throw new Error("v9_event_invalid_scope_or_cursor");
  }
  const result = await db.prepare(
    "SELECT seq,event_id,kind,payload_json,schema_version FROM diagnostic_v9_events WHERE workspace_id = ? AND run_id = ? AND seq > ? ORDER BY seq ASC LIMIT 500",
  ).bind(workspaceId, runId, afterSeq).all<{
    seq: number; event_id: string; kind: string; payload_json: string; schema_version: number;
  }>();
  return result.results;
}

/** Requires migration 0030: triggers atomically check and advance last_seq. */
export async function appendDiagnosticEventV9(
  db: V9AuditDb,
  input: {
    workspaceId: string;
    runId: string;
    eventId: string;
    expectedSeq: number;
    kind: string;
    payload: unknown;
    occurredAt: string;
    actorType: "client" | "system" | "operator";
  },
): Promise<{ status: "created" | "duplicate" | "conflict"; seq?: number }> {
  if (!input.workspaceId || !input.runId || !input.eventId || !input.kind ||
      !Number.isSafeInteger(input.expectedSeq) || input.expectedSeq < 0 ||
      input.expectedSeq >= Number.MAX_SAFE_INTEGER) {
    throw new Error("v9_invalid_event");
  }
  const payload = JSON.stringify(input.payload);
  if (payload === undefined || payload.length > 16384) throw new Error("v9_invalid_payload");
  const existing = await db.prepare(
    "SELECT run_id,seq,kind,payload_json FROM diagnostic_v9_events WHERE workspace_id=? AND event_id=?",
  ).bind(input.workspaceId, input.eventId).first<{
    run_id: string; seq: number; kind: string; payload_json: string;
  }>();
  const match = (row: typeof existing) =>
    row?.run_id === input.runId && row.seq === input.expectedSeq + 1 &&
    row.kind === input.kind && row.payload_json === payload;
  if (existing) return match(existing) ? { status: "duplicate", seq: existing.seq } : { status: "conflict" };
  try {
    const result = await db.prepare(
      "INSERT INTO diagnostic_v9_events (workspace_id,run_id,seq,event_id,kind,payload_json,occurred_at,schema_version,actor_type) VALUES (?,?,?,?,?,?,?,1,?)",
    ).bind(input.workspaceId, input.runId, input.expectedSeq + 1, input.eventId,
      input.kind, payload, input.occurredAt, input.actorType).run();
    if (!result.success) throw new Error("v9_write_failed");
    return { status: "created", seq: input.expectedSeq + 1 };
  } catch (error) {
    const retry = await db.prepare(
      "SELECT run_id,seq,kind,payload_json FROM diagnostic_v9_events WHERE workspace_id=? AND event_id=?",
    ).bind(input.workspaceId, input.eventId).first<{
      run_id: string; seq: number; kind: string; payload_json: string;
    }>();
    if (match(retry)) return { status: "duplicate", seq: retry!.seq };
    if (retry || (error instanceof Error &&
      /v9_sequence_conflict|UNIQUE constraint failed/.test(error.message))) {
      return { status: "conflict" };
    }
    throw error;
  }
}

/**
 * Loads the complete audit stream in bounded pages and checks for missing or
 * reordered events. A gap is an integrity error, not a recoverable partial run.
 */
export async function loadDiagnosticEventHistoryV9(
  db: V9AuditDb,
  workspaceId: string,
  runId: string,
): Promise<readonly { seq: number; event_id: string; kind: string; payload_json: string; schema_version: number }[]> {
  if (!workspaceId || !runId) throw new Error("v9_history_invalid_scope");
  const run = await db.prepare(
    "SELECT last_seq FROM diagnostic_v9_runs WHERE workspace_id = ? AND run_id = ?",
  ).bind(workspaceId, runId).first<{ last_seq: number }>();
  if (!run) throw new Error("v9_run_not_found");
  if (!Number.isSafeInteger(run.last_seq) || run.last_seq < 0) throw new Error("v9_history_invalid_sequence");
  const history: { seq: number; event_id: string; kind: string; payload_json: string; schema_version: number }[] = [];
  let cursor = 0;
  while (cursor < run.last_seq) {
    const page = await readDiagnosticEventsV9(db, workspaceId, runId, cursor);
    if (!page.length) throw new Error("v9_history_incomplete");
    for (const event of page) {
      if (event.seq !== cursor + 1 || event.seq > run.last_seq) throw new Error("v9_history_sequence_gap");
      history.push(event);
      cursor = event.seq;
    }
  }
  return history;
}

/** Save an immutable checkpoint at the exact audited event boundary. */
export async function saveDiagnosticSnapshotV9(
  db: V9AuditDb,
  input: {
    workspaceId: string;
    runId: string;
    lastSeq: number;
    stateJson: string;
    stateHash: string;
    createdAt: string;
  },
): Promise<"created" | "duplicate"> {
  if (!input.workspaceId || !input.runId || !input.stateHash ||
      !Number.isSafeInteger(input.lastSeq) || input.lastSeq < 0 ||
      input.stateJson.length > 262144) throw new Error("v9_snapshot_invalid_input");
  try {
    JSON.parse(input.stateJson);
  } catch {
    throw new Error("v9_snapshot_invalid_json");
  }
  const run = await db.prepare(
    "SELECT last_seq FROM diagnostic_v9_runs WHERE workspace_id=? AND run_id=?",
  ).bind(input.workspaceId, input.runId).first<{ last_seq: number }>();
  if (!run || input.lastSeq > run.last_seq) throw new Error("v9_snapshot_uncommitted_boundary");
  const existing = await db.prepare(
    "SELECT state_json,state_hash FROM diagnostic_v9_snapshots WHERE workspace_id=? AND run_id=? AND last_seq=?",
  ).bind(input.workspaceId, input.runId, input.lastSeq).first<{
    state_json: string; state_hash: string;
  }>();
  if (existing) {
    if (existing.state_json !== input.stateJson || existing.state_hash !== input.stateHash) {
      throw new Error("v9_snapshot_conflict");
    }
    return "duplicate";
  }
  await db.prepare(
    "INSERT INTO diagnostic_v9_snapshots (workspace_id,run_id,last_seq,state_json,state_hash,created_at) VALUES (?,?,?,?,?,?)",
  ).bind(input.workspaceId, input.runId, input.lastSeq,
    input.stateJson, input.stateHash, input.createdAt).run();
  return "created";
}

/** Canonical SHA-256 digest for a stored JSON snapshot. */
export async function hashDiagnosticSnapshotV9(stateJson: string): Promise<string> {
  const bytes = new TextEncoder().encode(stateJson);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Fail closed on a missing or tampered checkpoint; caller replays later events. */
export async function loadLatestDiagnosticSnapshotV9(
  db: V9AuditDb,
  workspaceId: string,
  runId: string,
): Promise<{ lastSeq: number; state: unknown } | null> {
  if (!workspaceId || !runId) throw new Error("v9_snapshot_invalid_scope");
  const snapshot = await db.prepare(
    "SELECT last_seq,state_json,state_hash FROM diagnostic_v9_snapshots WHERE workspace_id=? AND run_id=? ORDER BY last_seq DESC LIMIT 1",
  ).bind(workspaceId, runId).first<{
    last_seq: number; state_json: string; state_hash: string;
  }>();
  if (!snapshot) return null;
  if (!Number.isSafeInteger(snapshot.last_seq) || snapshot.last_seq < 0 ||
      snapshot.state_hash !== await hashDiagnosticSnapshotV9(snapshot.state_json)) {
    throw new Error("v9_snapshot_integrity_failure");
  }
  try {
    return { lastSeq: snapshot.last_seq, state: JSON.parse(snapshot.state_json) as unknown };
  } catch {
    throw new Error("v9_snapshot_integrity_failure");
  }
}
