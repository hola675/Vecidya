-- Prevent multiple concurrent pending claims for the same anonymous identity.
CREATE UNIQUE INDEX diagnostic_v9_one_pending_claim_per_identity
  ON diagnostic_v9_identity_claims(identity_id)
  WHERE status = 'pending';

-- A completed claim must have a completion timestamp; incomplete states must not.
CREATE TRIGGER diagnostic_v9_claim_completion_guard_insert
BEFORE INSERT ON diagnostic_v9_identity_claims
WHEN (NEW.status = 'completed' AND NEW.completed_at IS NULL)
  OR (NEW.status <> 'completed' AND NEW.completed_at IS NOT NULL)
BEGIN
  SELECT RAISE(ABORT, 'v9_claim_completion_timestamp_invalid');
END;

CREATE TRIGGER diagnostic_v9_claim_completion_guard_update
BEFORE UPDATE OF status, completed_at ON diagnostic_v9_identity_claims
WHEN (NEW.status = 'completed' AND NEW.completed_at IS NULL)
  OR (NEW.status <> 'completed' AND NEW.completed_at IS NOT NULL)
BEGIN
  SELECT RAISE(ABORT, 'v9_claim_completion_timestamp_invalid');
END;
