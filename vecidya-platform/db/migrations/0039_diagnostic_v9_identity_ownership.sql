-- V9 identity/ownership layer. Additive: does not alter V8 or the existing audit stream.
-- Storage scope (workspace_id) is not the same thing as diagnostic ownership.
CREATE TABLE diagnostic_v9_identities (
  identity_id TEXT PRIMARY KEY,
  identity_type TEXT NOT NULL CHECK (identity_type IN ('user','anonymous')),
  user_id TEXT,
  credential_hash TEXT,
  created_at TEXT NOT NULL,
  claimed_by_user_id TEXT,
  claimed_at TEXT,
  CHECK (
    (identity_type = 'user' AND user_id IS NOT NULL AND credential_hash IS NULL AND claimed_by_user_id IS NULL AND claimed_at IS NULL)
    OR
    (identity_type = 'anonymous' AND user_id IS NULL AND credential_hash IS NOT NULL)
  )
);
CREATE UNIQUE INDEX diagnostic_v9_identity_user_unique
  ON diagnostic_v9_identities(user_id) WHERE identity_type = 'user';
CREATE INDEX diagnostic_v9_identity_claim_idx
  ON diagnostic_v9_identities(claimed_by_user_id, claimed_at);

CREATE TABLE diagnostic_v9_run_ownership (
  workspace_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  identity_id TEXT NOT NULL,
  assigned_at TEXT NOT NULL,
  assignment_source TEXT NOT NULL CHECK (assignment_source IN ('authenticated_session','anonymous_session','verified_claim','operator_migration')),
  PRIMARY KEY (workspace_id, run_id),
  FOREIGN KEY (workspace_id, run_id)
    REFERENCES diagnostic_v9_runs(workspace_id, run_id),
  FOREIGN KEY (identity_id) REFERENCES diagnostic_v9_identities(identity_id)
);
CREATE INDEX diagnostic_v9_run_ownership_identity_idx
  ON diagnostic_v9_run_ownership(identity_id, assigned_at);

CREATE TABLE diagnostic_v9_run_organizations (
  workspace_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  linked_by_user_id TEXT NOT NULL,
  linked_at TEXT NOT NULL,
  link_reason TEXT NOT NULL CHECK (link_reason IN ('owner_requested','authorized_operator')),
  PRIMARY KEY (workspace_id, run_id, organization_id),
  FOREIGN KEY (workspace_id, run_id)
    REFERENCES diagnostic_v9_run_ownership(workspace_id, run_id)
);
CREATE INDEX diagnostic_v9_run_organizations_org_idx
  ON diagnostic_v9_run_organizations(organization_id, linked_at);

CREATE TABLE diagnostic_v9_identity_claims (
  claim_id TEXT PRIMARY KEY,
  identity_id TEXT NOT NULL,
  target_user_id TEXT NOT NULL,
  proof_type TEXT NOT NULL CHECK (proof_type IN ('anonymous_credential','authenticated_origin_session')),
  status TEXT NOT NULL CHECK (status IN ('pending','completed','rejected','expired')),
  created_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (identity_id) REFERENCES diagnostic_v9_identities(identity_id)
);
CREATE INDEX diagnostic_v9_claims_target_idx
  ON diagnostic_v9_identity_claims(target_user_id, status, created_at);
