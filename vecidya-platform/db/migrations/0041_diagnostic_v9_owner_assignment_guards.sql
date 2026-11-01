-- Keep identity ownership consistent even when run creation races a claim.
CREATE TRIGGER diagnostic_v9_owner_assignment_guard
BEFORE INSERT ON diagnostic_v9_run_ownership
WHEN
  (NEW.assignment_source = 'authenticated_session' AND NOT EXISTS (
    SELECT 1 FROM diagnostic_v9_identities
    WHERE identity_id = NEW.identity_id AND identity_type = 'user'
  ))
  OR
  (NEW.assignment_source = 'anonymous_session' AND NOT EXISTS (
    SELECT 1 FROM diagnostic_v9_identities
    WHERE identity_id = NEW.identity_id AND identity_type = 'anonymous' AND claimed_by_user_id IS NULL
  ))
  OR
  (NEW.assignment_source = 'verified_claim' AND NOT EXISTS (
    SELECT 1 FROM diagnostic_v9_identities
    WHERE identity_id = NEW.identity_id AND identity_type = 'user'
  ))
BEGIN
  SELECT RAISE(ABORT, 'v9_owner_identity_state_invalid');
END;
