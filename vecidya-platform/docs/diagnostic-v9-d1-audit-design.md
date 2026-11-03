# Diagnostic V9 — diseño de auditoría y persistencia D1 (propuesta)

Estado: **diseño, no desplegado**. Alcance: prototipo V9 en PR #162. No modificar el diagnóstico público V8.

## Objetivos e invariantes

1. Cada ejecución tiene `run_id` único y pertenece a un `workspace_id` autorizado. El `client_id` es opcional; los diagnósticos anónimos usan identidad seudónima de sesión, no un cliente ficticio.
2. Cada ejecución captura versiones inmutables de banco, reglas, motor, scoring y recomendaciones. Los cambios de versión nunca reescriben resultados anteriores.
3. Eventos append-only, secuencia estrictamente creciente por run y `event_id` único para idempotencia. La operación que incrementa secuencia y guarda evento debe ser atómica en D1.
4. Los snapshots son puntos de recuperación derivados; **no sustituyen el log**. Su hash y el último evento aplicado deben verificarse antes de reanudar.
5. Los datos de clientes se aíslan por workspace en **cada consulta y escritura**. No confiar en `workspace_id` enviado por el navegador: resolverlo en el servidor desde la autorización.
6. No registrar secretos, tokens, contenido arbitrario ni datos personales innecesarios en eventos o logs. Definir consentimiento, retención, exportación y borrado antes de producción.
7. La mejora del diagnóstico se mide por cohortes y versiones; el historial **no modifica automáticamente** el banco ni las puntuaciones.

## Esquema lógico propuesto

- `diagnostic_v9_runs`: `workspace_id`, `run_id`, `client_id` nullable, `status`, `started_at`, `finished_at`, `last_seq`, `bank_version`, `engine_version`, `scoring_version`, `recommendation_version`, `consent_version`.
- `diagnostic_v9_events`: `workspace_id`, `run_id`, `seq`, `event_id`, `kind`, `payload_json`, `occurred_at`, `schema_version`, `actor_type`; claves únicas `(workspace_id,run_id,seq)` y `(workspace_id,event_id)`.
- `diagnostic_v9_snapshots`: `workspace_id`, `run_id`, `last_seq`, `state_json`, `state_hash`, `created_at`; único `(workspace_id,run_id,last_seq)`.
- `diagnostic_v9_results`: `workspace_id`, `run_id`, `result_version`, `score_json`, `evidence_json`, `recommendations_json`, `report_ref`, `created_at`; conservar versiones históricas.
- `diagnostic_v9_feedback`: `workspace_id`, `run_id`, `feedback_id`, `source`, `rating`, `notes_redacted`, `created_at`.

Índices principales: `runs(workspace_id,client_id,started_at)`, `events(workspace_id,run_id,seq)`, `results(workspace_id,run_id,result_version)`. Referencias compuestas por workspace/run para impedir enlaces cruzados entre organizaciones. Las migraciones SQL deben adaptarse a los convenios D1 existentes tras inspección del repositorio.

## Flujo de escritura y recuperación

1. Autenticar y autorizar workspace/cliente; crear run con versiones fijadas.
2. Validar la interacción en el servidor contra el estado reproducido y el banco versionado.
3. En una transacción atómica: comprobar `expected_seq`, insertar evento idempotente y actualizar `last_seq`. Una colisión devuelve conflicto recuperable, no sobrescribe eventos.
4. Reproducir eventos y guardar snapshot periódico, verificando integridad.
5. Al terminar, persistir resultado versionado y estado final; generar informe referenciado.
6. Para reanudar, cargar snapshot verificado y aplicar eventos posteriores; ante discrepancia, detener y auditar.

## Métricas y análisis

- Inicio/finalización/abandono por versión, sector, especialidad y cohorte.
- Interacciones visibles, duración por paso, cambios de clasificación, invalidaciones y reanudaciones.
- Cobertura de evidencias, contradicciones, insuficiencia, razones de selección/omisión de preguntas.
- Estabilidad de puntuaciones y recomendaciones entre versiones (comparación controlada; no reescribir runs).
- Feedback explícito y resultados posteriores, cuando exista consentimiento y datos suficientes.

Instrumentación sin PII en métricas agregadas; aplicar umbrales mínimos por cohorte y evitar exposición de negocios individuales.

## Implementación incremental y criterios de aceptación

**P1:** inventario de D1/autorización y política de retención; SQL revisado, migración reversible, pruebas de aislamiento.
**P2:** repositorio D1 y API autenticada de run/eventos con idempotencia y concurrencia.
**P3:** snapshots, replay determinista, recuperación tras fallo y versionado de resultados.
**P4:** dashboard de métricas, comparación longitudinal por cliente, feedback y exportación/borrado.

No desplegar ni recopilar datos reales hasta pasar pruebas de autorización entre tenants, concurrencia, replay, retención y consentimiento.
