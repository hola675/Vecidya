-- Diagnostic V9 audit foundation. Schema only; no production writer enabled.
CREATE TABLE diagnostic_v9_runs (
  workspace_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  client_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','abandoned','failed')),
  started_at TEXT NOT NULL,
  finished_at TEXT,
  last_seq INTEGER NOT NULL DEFAULT 0 CHECK (last_seq >= 0),
  bank_version TEXT NOT NULL,
  engine_version TEXT NOT NULL,
  scoring_version TEXT NOT NULL,
  recommendation_version TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  PRIMARY KEY (workspace_id, run_id)
);
CREATE INDEX diagnostic_v9_runs_client_idx ON diagnostic_v9_runs(workspace_id,client_id,started_at);

CREATE TABLE diagnostic_v9_events (
  workspace_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  seq INTEGER NOT NULL CHECK (seq > 0),
  event_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  occurred_at TEXT NOT NULL,
  schema_version INTEGER NOT NULL CHECK (schema_version > 0),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('client','system','operator')),
  PRIMARY KEY (workspace_id,run_id,seq),
  UNIQUE (workspace_id,event_id),
  FOREIGN KEY (workspace_id,run_id) REFERENCES diagnostic_v9_runs(workspace_id,run_id)
);
CREATE TABLE diagnostic_v9_snapshots (
  workspace_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  last_seq INTEGER NOT NULL CHECK (last_seq >= 0),
  state_json TEXT NOT NULL CHECK (json_valid(state_json)),
  state_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (workspace_id,run_id,last_seq),
  FOREIGN KEY (workspace_id,run_id) REFERENCES diagnostic_v9_runs(workspace_id,run_id)
);
CREATE TABLE diagnostic_v9_results (
  workspace_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  result_version INTEGER NOT NULL CHECK (result_version > 0),
  score_json TEXT NOT NULL CHECK (json_valid(score_json)),
  evidence_json TEXT NOT NULL CHECK (json_valid(evidence_json)),
  recommendations_json TEXT NOT NULL CHECK (json_valid(recommendations_json)),
  report_ref TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (workspace_id,run_id,result_version),
  FOREIGN KEY (workspace_id,run_id) REFERENCES diagnostic_v9_runs(workspace_id,run_id)
);
CREATE TABLE diagnostic_v9_feedback (
  workspace_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  feedback_id TEXT NOT NULL,
  source TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes_redacted TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (workspace_id,feedback_id),
  FOREIGN KEY (workspace_id,run_id) REFERENCES diagnostic_v9_runs(workspace_id,run_id)
);
CREATE INDEX diagnostic_v9_feedback_run_idx ON diagnostic_v9_feedback(workspace_id,run_id,created_at);
