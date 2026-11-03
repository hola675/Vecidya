# Diagnóstico V9 — Backlog ejecutable canónico F00–F10

**Versión:** 1.0.0  
**Fecha:** 2026-11-03  
**Estado:** PLAN_ONLY · W1–W5 EVIDENCIA HISTÓRICA · W1R + RUNTIME RESTANTE PENDIENTE  
**Repositorio:** `hola675/Vecidya`  
**PR:** #162  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Autoridad y contrato

Este backlog es la lista canónica de tareas. Para estado operativo prevalece `DIAGNOSTIC-V9-CURRENT-STATUS.md`; para decisiones humanas, `DIAGNOSTIC-V9-HUMAN-DECISION-SHEET-A-H.md`; para scopes y secuencia, `DIAGNOSTIC-V9-POST-APPROVAL-IMPLEMENTATION-SCOPE.md`.

PLAN_ONLY permanece vigente para runtime. Ningún DONE histórico autoriza el siguiente lote.

## 2. Invariantes

- un PR maestro #162;
- V8 permanece activo hasta F09/F10;
- banco inicial V9 = baseline 77 mientras 59 rewrites y 13 candidatos 82/90 sigan fuera del runtime;
- 24 base + máximo 5 críticos con consentimiento; hard cap 29;
- scoring/calibration/correlation versionados y fail-closed;
- borrador anónimo local-only 7 días desde último `updatedAt` válido;
- resultado anónimo finalizado local máximo 24 horas;
- D1 anónimo solo analítica agregada no reconstructiva;
- informe identificado separado, propietario personal, claim por posesión;
- GHL opcional y separado;
- pruebas focales por lote; typecheck/build en gates integrados definidos.

## 3. Evidencia histórica cerrada

| Fase | Estado | Evidencia |
|---|---|---|
| F00/W1 | DONE_WITH_EVIDENCE histórico | 43/43 PASS; main ancestro al cierre 2026-11-01 |
| F01/W2 | DONE_WITH_EVIDENCE | 3/3 PASS run 41325376095 |
| F02/W3 | DONE_WITH_FALLBACK | baseline 77; 29/29 PASS run 41327887999 |
| F03/W4 | DONE_WITH_EVIDENCE | budget/replay 31/31 + graph/context 31/31 |
| F04/W5 | DONE_WITH_EVIDENCE | scoring/correlation/calibration 32/32 run 41334411521 |

Estos PASS pertenecen a sus SHA/run registrados; no certifican el HEAD actual ni F05+.

## 4. Backlog restante canónico

| ID | Prerrequisito | Entregable | Superficie | Evidencia / gate | STOP / rollback |
|---|---|---|---|---|---|
| W1R-01 | autorización Git acotada | revalidar `main`, HEAD, PR, ahead/behind, merge-base, nuevas migraciones y overlap | Git + migration journal | snapshot actual + matriz overlap | no mezclar runtime; detener ante conflicto transversal |
| W1R-02 | W1R-01 y overlap material | reconciliar main→V9 de forma controlada | worktree/ref/archivos compartidos | main ancestro si hubo merge + pruebas focales afectadas | no force-push; rollback a ref previa |
| F07-L1 | W1R cerrado + autorización L1 | borrador anónimo local 7d; inicio sin identity/run D1 | `local-draft*`, `diagnostic-v9.tsx`, `diagnostic-v9-run.tsx`, tests | LOCAL-11… + cero D1 + draft solo in_progress/completing | no migraciones/scoring/finalize; revert commit L1 |
| F07-L2 | L1 DONE + autorización L2 | replay autoritativo transitorio, zero-D1 | `transient-replay.server.ts` + tests; endpoint solo si autorizado | REPLAY-21…; sesión >7d expira; no raw logs | no attestation/claim; revert L2 |
| F07-L3-ADR | L2 listo | contrato criptográfico de attestation | ADR/plan | version/id, canonical serialization, digest, algoritmo, key id, rotación, 24h, skew | no código firmado antes del ADR |
| F07-L3 | ADR + autorización L3 | finalización canónica + resultado local 24h + attestation | finalization adapter/result local store | FIN/TOKEN/PRIV; draft se elimina al finalizar | no informe persistido/claim; revert L3 |
| F05-01 | L3 DONE | resumen anónimo útil desde resultado canónico | report/summary V9 | snapshots ES/EN; no login obligatorio | no persistir informe |
| F06-01 | F05-01 | prioridades/acciones explicables | recommendations V9 | impacto/urgencia/esfuerzo/objetivo, fallbacks | no pesos inventados |
| F06-02 | F06-01 | Aprende/Servicios opcionales; GHL separado | adapters read-only | publicado/despublicado, catálogo vacío, GHL offline | diagnóstico funciona sin integraciones |
| F05-02 | F05-01 + F06 | contrato definitivo informe identificado | report contract/versioning | snapshots, evidencia, límites, identidad de versiones | no D1 final antes de contrato |
| F07-L4 | F05-02 + autorización L4 | save/claim/owner idempotente | D1 identificado separado + auth | SAVE/AUTH; `attestationId` único; cross-user deny | no recalcular scoring; rollback lógico |
| F07-L5 | L4 DONE | retención, hard delete activo, cierre cuenta, backup semantics | privacy/erasure + infra policy | RET/PRIV; no resurrection; backup ≤30d certificado | no garantía pública sin prueba real |
| F07-L6 | L5 DONE | flujo completo anon→summary→login→save→view→delete | integración F07/F05/F06 | FLOW + privacidad + concurrencia | volver a PLAN_ONLY ante fallo de aislamiento |
| F08-01 | L6 DONE | UX premium ES/EN y accesible | UI V9 | teclado, lector, móvil, reduced motion, idioma/aclaración | no tocar otros productos |
| F08-02 | F08-01 | certificación integrada | V9 + consumidores autorizados | C01–C10, seguridad, carga, errores, concurrencia, typecheck, build | críticos/altos bloquean F09 |
| F09-01 | F08 PASS + autorización corte | switch controlado V8→V9 | routing/flags/adapters | smoke + rollback demostrado | revert switch si falla |
| F09-02 | F09-01 estable | retirar legacy sin consumidores | QBV2/QA03B obsoleto, no historia | búsqueda referencias + consumidores | nunca borrar migraciones históricas |
| F10-01 | F09 + autorización staging | staging + migraciones autorizadas + piloto + rollback | entorno staging | E2E real, métricas/logs, aceptación | no prod sin aceptación |
| F10-02 | F10-01 + autorización producción | deploy productivo y postdeploy | producción | smoke real, observabilidad, SHA, rollback disponible | rollback inmediato si gate falla |

## 5. Dependencia canónica

`W1R → L1 → L2 → L3-ADR → L3 → F05-01 → F06 → F05-02 → L4 → L5 → L6 → F08 → F09 → F10`

Esta dependencia sustituye la secuencia antigua que intentaba cerrar todo F07 antes de F05/F06. L4/L5/L6 dependen del contrato definitivo de informe.

## 6. Reglas de TTL y estado

- Draft L1: expiración derivada exclusivamente de `session.updatedAt + 7d`; leer no renueva.
- Draft L1: `completed` es inválido para el store de borrador.
- Replay L2: servidor rechaza `updatedAt` mayor de 7d aunque exista un TTL Worker legacy de 14d.
- Resultado L3: store separado, TTL 24h.
- Informe identificado L4: retención mientras exista cuenta + eliminación voluntaria, sujeto a L5.

## 7. Pruebas

- cada tarea: tests focales explícitos;
- cierre de una wave runtime: typecheck del conjunto integrado afectado;
- cierre L6/W6 integrado: focales acumulados + typecheck + build;
- F08: E2E/regresión delimitada + typecheck + build + seguridad/accesibilidad/concurrencia;
- no usar suites generales como sustituto de gates específicos ni afirmar PASS sin SHA/log.

## 8. Deuda aceptada y no ocultable

- F02 mantiene 59 rewrites pendientes y 13 candidatos 82/90 excluidos; baseline 77 es el único banco inicial autorizado mientras no cambie este gate.
- bandas públicas de score no se presentan como validación estadística.
- backup ≤30 días es decisión objetivo que requiere certificación operativa antes de prometerse públicamente.
- datos históricos del prototipo D1 requieren inventario/cleanup policy antes de lanzamiento.

## 9. Estado de autorización

**PLAN_ONLY.** Próximo trabajo de runtime no debe comenzar hasta cerrar W1R y recibir autorización explícita del lote correspondiente.

## Changelog

- **1.0.0 / 2026-11-03:** backlog reescrito como fuente canónica; W1R, L1–L6, dependencia F05/F06, TTL 7d/24h, attestation ADR, pruebas y release gates reconciliados.
- **0.5.0 / 2026-11-01:** último backlog histórico previo al cierre de huecos.
