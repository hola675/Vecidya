# V9 — CLASS-02: banco fijado, replay y versiones persistidas
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Fuentes verificadas
- qa03b/worker-replay-v9.server.ts, blob f77b1d3c5946b75d465e0a24a89411a3d62cfe31: importa QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 y constantes de identidad de replay.
- qa03b/v9-finalization.server.ts, blob 8367a67bd5edb15d4d6bd486726bddd23bd06b0f: importa el mismo banco, reconstruye replay y compara scoring.dimensions con replay.core.dimensions (líneas 105–120).
- qa03b/v9-event-ingestion.server.ts, blob 3f2417225247422bc6838c70fb89bdd629f70b78: compara cinco versiones antes de aceptar eventos y usa ledger de eventos D1.
- qa03b/v9-run-state.server.ts, blob 8d00037e1983ec09474f426b3681d0fb920805f3: compara cinco versiones y reconstruye una proyección desde auditoría.
- qa03b/v9-identity-repository.ts, blob b628750de77bf9b38830a5eb8cd7a7abe0a5bcb6: crea diagnostic_v9_runs con columnas bank_version, engine_version, scoring_version, recommendation_version y consent_version.

## Resultado
El banco del replay V9 es explícitamente QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2; no es el banco por defecto de qbv2-session.ts. Los servicios persistentes de V9 guardan versiones y las contrastan contra el runtime. La finalización rechaza discrepancia entre scoring calculado y scoring del replay.

## Límites de la evidencia
No se ejecutaron pruebas ni se verificó despliegue, valores efectivos de variables de entorno o que el banco de 90 IDs esté completo en el runtime. La existencia de validaciones y ledger no certifica por sí sola integridad transaccional ni ausencia de carreras; se requiere lectura focal del repositorio de auditoría y de las migraciones SQL.

## Próximos gates
1. Auditar v9-audit-repository.ts y v9-audit-replay.server.ts para idempotencia, secuencia y snapshot.
2. Comprobar las constantes concretas de versiones y la composición de banco de 90 IDs.
3. Preparar matriz de aceptación CLASS-02 para versiones, replay y scoring-parity, sin ejecutarla hasta autorización.

## Changelog
0.1.0: identificación del banco fijado del replay y de las cinco versiones persistidas.