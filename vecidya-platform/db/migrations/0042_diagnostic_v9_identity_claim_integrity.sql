-- Enforce a consistent, immutable claim marker for anonymous identities.
CREATE TRIGGER diagnostic_v9_identity_claim_state_insert
BEFORE INSERT ON diagnostic_v9_identities
WHEN NEW.identity_type = 'anonymous'
  AND (
    (NEW.claimed_by_user_id IS NULL AND NEW.claimed_at IS NOT NULL)
    OR (NEW.claimed_by_user_id IS NOT NULL AND NEW.claimed_at IS NULL)
    OR (NEW.claimed_by_user_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM diagnostic_v9_identities
      WHERE identity_type = 'user' AND user_id = NEW.claimed_by_user_id
    ))
  )
BEGIN
  SELECT RAISE(ABORT, 'v9_identity_claim_state_invalid');
END;

CREATE TRIGGER diagnostic_v9_identity_claim_state_update
BEFORE UPDATE OF claimed_by_user_id, claimed_at ON diagnostic_v9_identities
WHEN NEW.identity_type = 'anonymous'
  AND (
    (NEW.claimed_by_user_id IS NULL AND NEW.claimed_at IS NOT NULL)
    OR (NEW.claimed_by_user_id IS NOT NULL AND NEW.claimed_at IS NULL)
    OR (NEW.claimed_by_user_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM diagnostic_v9_identities
      WHERE identity_type = 'user' AND user_id = NEW.claimed_by_user_id
    ))
  )
BEGIN
  SELECT RAISE(ABORT, 'v9_identity_claim_state_invalid');
END;

CREATE TRIGGER diagnostic_v9_identity_claim_immutable
BEFORE UPDATE OF claimed_by_user_id, claimed_at ON diagnostic_v9_identities
WHEN OLD.identity_type = 'anonymous'
  AND OLD.claimed_by_user_id IS NOT NULL
  AND (
    NEW.claimed_by_user_id IS NOT OLD.claimed_by_user_id
    OR NEW.claimed_at IS NOT OLD.claimed_at
  )
BEGIN
  SELECT RAISE(ABORT, 'v9_identity_claim_immutable');
END;
