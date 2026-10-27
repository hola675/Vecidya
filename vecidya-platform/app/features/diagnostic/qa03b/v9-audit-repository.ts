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
