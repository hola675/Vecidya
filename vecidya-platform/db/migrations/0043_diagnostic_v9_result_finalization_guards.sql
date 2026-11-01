-- A completed run must have a persisted result, and completed results are append-only.
CREATE TRIGGER diagnostic_v9_run_completion_guard
BEFORE UPDATE OF status, finished_at ON diagnostic_v9_runs
WHEN NEW.status = 'completed'
  AND (
    NEW.finished_at IS NULL
    OR NOT EXISTS (
      SELECT 1 FROM diagnostic_v9_results
      WHERE workspace_id = NEW.workspace_id
        AND run_id = NEW.run_id
        AND created_at = NEW.finished_at
    )
  )
BEGIN
  SELECT RAISE(ABORT, 'v9_run_completion_requires_result');
END;

CREATE TRIGGER diagnostic_v9_run_terminal_status_guard
BEFORE UPDATE OF status ON diagnostic_v9_runs
WHEN OLD.status IN ('completed','abandoned','failed')
  AND NEW.status <> OLD.status
BEGIN
  SELECT RAISE(ABORT, 'v9_run_terminal_status_immutable');
END;

CREATE TRIGGER diagnostic_v9_result_before_update
BEFORE UPDATE ON diagnostic_v9_results
BEGIN
  SELECT RAISE(ABORT, 'v9_result_immutable');
END;

CREATE TRIGGER diagnostic_v9_result_before_delete
BEFORE DELETE ON diagnostic_v9_results
BEGIN
  SELECT RAISE(ABORT, 'v9_result_immutable');
END;
