# Diagnostic V9 — W2/F01 Autonomy Boundary and Contract Registry

**Versión:** 0.1.0  
**Fecha:** 2026-11-01  
**Estado:** W2/F01 AUTHORIZED · PENDING_FOCAL · F02–F10 PLAN_ONLY  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Alcance

F01 no elimina legacy. Define la frontera que F04 deberá respetar antes de poder llamar autónomo al motor V9.

Objetivos:
- F01-01: mapa import/export/consumidores.
- F01-02: clasificación `REPLACE / SHARED / ADAPTER / RETAIN / DELETE_AFTER_CUT`.
- ADR de storage de resultado identificado.
- contrato de registry de versiones.
- prueba estática que falle si aparecen dependencias legacy/transicionales nuevas fuera de allowlist.

No se modifica banco, scoring, planner, persistencia remota ni rutas productivas.

## 2. Hallazgo principal

Las rutas públicas V9 no importan QBV2 directamente, pero el núcleo autoritativo todavía llega a QBV2 a través de QA03B.

Cadena representativa:

`route V9 → worker/session/planner/scoring → QA03B adapters → QBV2`.

Por tanto, V9 todavía NO es un motor autónomo.

## 3. Dependencias runtime observadas

### Scoring V9
`qa03b/v9-candidate-scoring.ts` depende de:
- qbv2 contextual scoring;
- dimensions/coverage;
- evidence-v3;
- rules/contract;
- candidate calibration;
- QA03B context/engine/bank/applicability.

**Clase:** REPLACE para F04, salvo contratos que se recreen como tipos V9 propios.

### Planner V9
`qa03b/v9-candidate-planner.ts` depende de:
- qbv2 contradictions;
- contract/rules/signals;
- dimensions/priorities;
- planner budget;
- QA03B context/engine/bank.

**Clase:** REPLACE para F03/F04.

### Session V9
`qa03b/v9-session-prototype.ts` depende de:
- qbv2 contract/rules;
- candidate planner/session legacy;
- specialty branch candidate.

**Clase:** REPLACE. El contrato 24+5 aprobado no puede quedar atado al hard cap QBV2.

### Finalization V9
`qa03b/v9-finalization.server.ts` depende de `qbv2-candidate-recommendations`.

**Clase:** REPLACE en F05/F06.

### Bank/context/engine QA03B
- `qa03b/bank.ts`: deriva del banco reviewed QBV2.
- `qa03b/context.ts`: usa context-resolver/contracts/signals históricos.
- `qa03b/engine.ts`: usa qbv2 rules/signals/contract y taxonomy.
- specialty banks reutilizan lotes QBV2.

**Clase:** ADAPTER temporal para F02/F03. No deben sobrevivir como dependencia runtime del core final.

### Graph V9 puro
`app/features/diagnostic/v9/question-selection.ts` no importa QA03B/QBV2.
`graph-evaluation.ts` solo importa `question-selection`.

**Clase:** RETAIN como semilla del núcleo autónomo; su funcionalidad todavía no sustituye por sí sola al planner autoritativo.

## 4. Clasificación F01

| Familia | Clase | Motivo | Destino |
|---|---|---|---|
| `qbv2-*` scoring/planner/rules/contract | REPLACE | V9 no puede depender runtime del motor anterior | contratos/módulos V9 en F02–F04 |
| `qa03b/qbv2-candidate-*` | DELETE_AFTER_CUT | scaffolding candidato/histórico | retirar solo en F09 tras cero consumidores |
| `qa03b/bank/context/engine/applicability` | ADAPTER | puente útil para migración y equivalencia | sustituir gradualmente por V9-owned |
| specialty/recovery candidate banks | ADAPTER | material editorial candidato, no contrato final | migrar ítems aprobados a banco canónico F02 |
| `diagnostic/v9/question-selection`, `graph-evaluation` | RETAIN | código V9-owned sin imports legacy | extender, no tratar como ya certificado |
| bounded request body/rate limit | SHARED | infraestructura genérica sin semántica de motor | reutilizable |
| auth/session/client workspace | SHARED | autorización de plataforma | reutilizable |
| Cloudflare context | SHARED | infraestructura | reutilizable |
| V8/QBV2 público e identified-report actual | RETAIN | rollback y producción vigente | conservar hasta F09 |
| migraciones históricas 0000–0037 | RETAIN | historia aplicada/compartida | nunca borrar |
| migraciones V9 0038–0043 | ADAPTER/PROTOTYPE | schema V9 actual no es arquitectura final DEC-E | no aplicar remoto durante F01 |
| `diagnostic-contract-versions.ts` | RETAIN_V8 | identidad histórica V3 | no reutilizar como registry V9 |
| `qa03b/contract.ts` | ADAPTER | identidades candidate fragmentadas | sustituir por registry V9 |
| catálogos Aprende/servicios/GHL | SHARED_EXTERNAL_POST_RESULT | enriquecimiento posterior | nunca dependencia de core |

## 5. Consumidores V9 actuales

### Rutas públicas
- `/diagnostico/v9`
- `/diagnostico/v9/:runId`
- APIs run/events/state/result/finalize
- anonymous identity/claim

Estas rutas consumen módulos V9/QA03B, no QBV2 de forma directa.

### App autenticada
- `/app/diagnosticos`
- `/app/diagnosticos/:workspaceId/:runId`

Consume ownership/availability y queries de resultado.

### Tests
Los tests SQLite/replay son consumidores válidos de los adapters mientras F01–F08 continúen.

## 6. Regla arquitectónica desde F01

A partir de este gate:

**NINGÚN archivo nuevo V9 autoritativo puede añadir imports QBV2/legacy fuera de la allowlist F01.**

La allowlist no legitima la deuda; la congela.

Para eliminar una entrada:
1. crear sustituto V9-owned;
2. migrar consumer;
3. prueba focal;
4. retirar entrada de allowlist.

Para añadir una entrada nueva:
- requiere reabrir F01 con justificación humana; no se acepta por conveniencia.

## 7. ADR-F01-S1 — storage de resultados identificados

DEC-E aprobada exige:
- borrador anónimo local;
- D1 reservado a analítica agregada en la arquitectura objetivo;
- resultado/historial identificado separado;
- no usar `BUSINESS_MEDIA` por conveniencia.

Bindings actuales observados:
- D1 `DB`;
- R2 `BUSINESS_MEDIA`.

**Decisión F01:** ningún binding actual queda aprobado como store final de resultados identificados V9.

Contrato futuro:
`IdentifiedDiagnosticResultStoreV9` deberá abstraer:
- put immutable result;
- read by owner;
- list by owner;
- delete/retention;
- version metadata;
- audit-safe errors.

Backend físico: **DEFERRED TO F07** tras privacidad/retención/costo.

Consecuencias:
- D1 `diagnostic_v9_*` 0038–0043 = prototipo técnico, no destino final;
- no aplicar 0038–0043 a remoto durante F01;
- no reutilizar `BUSINESS_MEDIA` sin una decisión nueva.

## 8. ADR-F01-V1 — registry de versiones

Actualmente las identidades están fragmentadas entre:
- `v9-session-prototype.ts`;
- `qa03b/contract.ts`;
- `qbv2-candidate-calibration.ts`;
- variables `DIAGNOSTIC_V9_*_VERSION`;
- metadata de run D1.

Registry objetivo V9 debe resolver, como una unidad inmutable:
- registryVersion;
- questionBank;
- answerSchema;
- contextSchema;
- applicability;
- planner;
- engine;
- scoring;
- calibration;
- recommendations;
- resultSchema;
- replay;
- consent.

Reglas:
1. una combinación tiene ID único;
2. `scoring` referencia una calibration concreta;
3. run persiste registry ID;
4. replay/finalization resuelven por registry ID, no defaults;
5. registry desconocido = fail-closed;
6. versiones históricas soportadas no se recalibran silenciosamente.

**Implementación del registry:** F04.  
F01 solo fija el contrato.

## 9. Matriz de eliminación

| Módulo/familia | Retiro permitido |
|---|---|
| V8/QBV2 productivo | F09 después de F08 + cutover aprobado |
| candidate QBV2 QA03B | F09 después de cero consumidores |
| QA03B adapters | después de migrar todos los consumidores V9 |
| migraciones aplicadas | nunca borrar |
| tests históricos útiles | conservar mientras protejan compatibilidad |
| prototype D1 0038–0043 | no aplicar remoto; destino se decide antes de F07 |

## 10. Gates F01

F01 puede cerrar cuando:
- inventario está documentado;
- prueba allowlist pasa;
- no existen imports legacy desconocidos en archivos censados;
- storage final queda explícitamente deferred, no supuesto;
- registry objetivo queda definido;
- F02/F04 conocen qué deben reemplazar.

## 11. Fuera de alcance

No hacer en F01:
- mover preguntas;
- cambiar opciones;
- modificar score;
- activar 24+5;
- eliminar QBV2;
- aplicar migraciones V9;
- crear store remoto;
- deploy.

## Changelog

- **0.1.0 / 2026-11-01:** frontera autónoma, clasificación, ADR storage, registry y allowlist de imports; pendiente prueba focal.
