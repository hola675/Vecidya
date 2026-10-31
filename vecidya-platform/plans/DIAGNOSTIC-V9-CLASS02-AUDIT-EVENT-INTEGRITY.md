# V9 — CLASS-02: idempotencia, secuencia y snapshots de auditoría
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Fuentes
qa03b/v9-audit-repository.ts blob 14020e3465d4caad901ff4b6a01e83200eaf0d47; qa03b/v9-audit-replay.server.ts blob 48b3c65d04f31b758801da60ba08cebe2088ef2b; qa03b/v9-audit-recovery.ts blob c0629241d5bfb843c8bc690553f4dbd287a4b765; qa03b/v9-audit-snapshot-integrity.ts blob 493979328a940c5d081e05b2079787483deccc69.

## Hallazgos de lectura estática
1. appendDiagnosticEventV9 valida scope, eventId, expectedSeq y payload; consulta evento existente por workspace_id/event_id y compara run_id, seq, kind, payload, timestamp, actor y schema. Devuelve duplicate para coincidencia exacta y conflict para discrepancia.
2. La inserción usa expectedSeq+1; ante error, relee eventId para distinguir retry idéntico y conflicto. El comentario fuente declara dependencia explícita de triggers de migración 0030 para verificación y avance atómico de last_seq.
3. loadDiagnosticEventHistoryV9 consulta last_seq, lee páginas ordenadas por seq ASC de hasta 500 eventos y rechaza secuencias faltantes o fuera del límite declarado.
4. saveDiagnosticSnapshotV9 valida JSON, tamaño, frontera confirmada y conflicto con snapshot existente; hashDiagnosticSnapshotV9 calcula digest SHA-256; loadLatestDiagnosticSnapshotV9 verifica checkpoint. saveVerifiedDiagnosticSnapshotV9 calcula el hash desde el estado serializado en lugar de confiar en digest proporcionado.
5. recoverDiagnosticStateV9 combina historial y snapshot validado; recoverDiagnosticAuditSessionV9 reconstruye eventos y replayDiagnosticAuditEventsV9 pasa al worker replay autoritativo.

## Dependencia bloqueante
NO se ha inspeccionado el SQL de migración 0030. La atomicidad real de concurrencia y triggers queda pendiente. La lectura de TypeScript por sí sola no certifica garantías transaccionales D1.

## Pruebas focales propuestas, NO ejecutadas
- Retry idéntico conserva seq; mismo eventId con payload distinto produce conflicto.
- Dos escritores concurrentes con expectedSeq igual no pueden crear dos eventos aceptados.
- Historial con hueco o desorden falla cerrado.
- Snapshot manipulado, inválido o adelantado al last_seq es rechazado.
- Replay y scoring final mantienen paridad con historial completo.

## Estado
CLASS-02 PARCIAL, PLAN_ONLY. Sin ejecución de CI, SQL, tests, deploy o modificaciones funcionales.

## Changelog
0.1.0: censo estático de garantías y dependencia de migración 0030.