export function createDiagnostics({ runId, totalChecks, log = console.log, now = Date.now }) {
  const runStartedAt = now();
  let stageName = "bootstrap";
  let stageStartedAt = runStartedAt;
  let operationCount = 0;
  let checks = 0;
  let passed = 0;
  let failed = 0;

  const emit = (message) => log(`[authz run=${runId}] ${message}`);
  emit(`RUN START checksExpected=${totalChecks}`);

  function startStage(nextStage) {
    const startedAt = now();
    emit(`STAGE END ${stageName} durationMs=${startedAt - stageStartedAt}`);
    stageName = nextStage;
    stageStartedAt = startedAt;
    emit(`STAGE START ${stageName}`);
  }

  function startOperation(kind, label, timeoutMs) {
    operationCount += 1;
    const id = `${runId}-${kind}-${operationCount}`;
    const startedAt = now();
    emit(`${kind} START ${id} stage=${stageName} label=${redactDiagnosticText(label)} timeoutMs=${timeoutMs}`);
    let ended = false;
    return (result = {}) => {
      if (ended) throw new Error(`La operación ${id} ya fue cerrada.`);
      ended = true;
      const fields = ["outcome", "status", "exitCode", "signal", "error", "external", "timedOut"]
        .filter((key) => result[key] !== undefined)
        .map((key) => `${key}=${redactDiagnosticText(String(result[key]))}`)
        .join(" ");
      emit(`${kind} END ${id} durationMs=${now() - startedAt}${fields ? ` ${fields}` : ""}`);
    };
  }

  function recordCheck(ok, label) {
    checks += 1;
    if (ok) passed += 1;
    else failed += 1;
    const pending = Math.max(0, totalChecks - checks);
    emit(`CHECK ${checks}/${totalChecks} state=${ok ? "PASS" : "FAIL"} passed=${passed} failed=${failed} pending=${pending} label=${redactDiagnosticText(label)}`);
  }

  function finish(classification) {
    const finishedAt = now();
    emit(`STAGE END ${stageName} durationMs=${finishedAt - stageStartedAt}`);
    emit(`RUN END ${classification} durationMs=${finishedAt - runStartedAt} checks=${checks}/${totalChecks} passed=${passed} failed=${failed} pending=${Math.max(0, totalChecks - checks)} operations=${operationCount}`);
  }

  return { startStage, startOperation, recordCheck, finish };
}

export function diagnosticProcessSummary({ pid, status, signal, error, stderr, externalState, timedOut }) {
  const safeStderr = redactDiagnosticText(String(stderr ?? "").slice(-400).replace(/\s+/g, " ")) || "empty";
  return [
    `pid=${pid ?? "unknown"}`,
    `exit=${status ?? "null"}`,
    `signal=${signal ?? "none"}`,
    `error=${error?.code ?? "none"}`,
    `external=${externalState ?? "unknown"}`,
    `timedOut=${Boolean(timedOut)}`,
    `stderrTail=${safeStderr}`,
  ].join(" ");
}

export function redactDiagnosticText(value) {
  return String(value)
    .replace(/\b(authorization|proxy-authorization)\s*:\s*[^\r\n]*/gi, "$1: [REDACTED]")
    .replace(/\b(cookie|set-cookie)\s*:\s*[^\r\n]*/gi, "$1: [REDACTED]")
    .replace(/\b(password|passwd|token|secret|api[_-]?key)\b(\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;&]+)/gi, "$1$2[REDACTED]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [REDACTED]")
    .replace(/([?&](?:token|password|secret|api[_-]?key)=)[^&\s]+/gi, "$1[REDACTED]")
    .replace(/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g, "[REDACTED_JWT]");
}

export function sqlInList(values) {
  if (!values.length) return "SELECT NULL WHERE 0";
  return values.map((value) => `'${String(value).replaceAll("'", "''")}'`).join(", ");
}

export function describeSqlOperation(sql) {
  const statements = String(sql).split(";").map((statement) => statement.trim()).filter(Boolean);
  return statements.map((statement) => {
    const match = statement.match(/^(SELECT|INSERT(?:\s+OR\s+\w+)?\s+INTO|UPDATE|DELETE\s+FROM)\s+([A-Za-z_][A-Za-z0-9_]*)/i);
    return match ? `${match[1].replace(/\s+/g, " ").toUpperCase()} ${match[2]}` : "SQL statement";
  }).join(" + ");
}
