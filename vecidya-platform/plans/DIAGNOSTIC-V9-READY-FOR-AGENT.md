# Diagnóstico V9 — Paquete de preparación READY_FOR_AGENT
Versión: 0.6.0 | 2026-11-01 | Estado: F00-F01 DONE / F02 DONE_WITH_FALLBACK / F03-F04 DONE_WITH_EVIDENCE / NOT_READY_FOR_F05
Repositorio: hola675/Vecidya | PR maestro #162 | Rama feat/diagnostic-v9-lex-graph-p1b

## 1. Decisión de preparación
**F00–F01 DONE_WITH_EVIDENCE; F02 DONE_WITH_FALLBACK; F03–F04 DONE_WITH_EVIDENCE; NO READY FOR F05.** El core 24+5 está implementado: 24 base, consentimiento explícito, hasta 5 críticos, hard cap 29 y replay autoritativo. El graph/context gate y budget/session/replay pasan 31/31 cada uno sobre el SHA de código F03.

Los bloqueos técnicos P0 de F04 quedaron resueltos: `scoring_version` liga explícitamente una calibración registrada, replay/finalization reproducen calibración histórica, correlación se aplica antes del scorer y conflictos/unmapped fallan cerrado. El gate focal del HEAD de código F04 pasó 32/32. F05+ permanece fuera de autorización.

## 2. Índice de lectura obligatorio para el agente
1. plans/DIAGNOSTIC-V9-MASTER-FINALIZATION-PLAN.md — fuente de alcance, políticas aprobadas, gates y estado PLAN_ONLY (leer secciones recientes antes de obedecer instrucciones históricas de ejecución).
2. plans/DIAGNOSTIC-V9-PLAN-CLOSURE-REGISTER.md — reconciliación de decisiones y bloqueos DEC-A–H.
3. plans/DIAGNOSTIC-V9-F00-F10-EXECUTION-BACKLOG.md — tareas, dependencias y STOP/rollback.
4. plans/DIAGNOSTIC-V9-MAIN-SYNC-CONFLICT-MATRIX.md — riesgo de integración main→V9.
5. plans/DIAGNOSTIC-V9-PRODUCT-DEFINITION-V1.md — recorrido E0–E5 y fronteras con Aprende/GHL.
6. plans/DIAGNOSTIC-V9-EVALUATION-MODEL-V1.md — ocho dimensiones candidatas, no aprobadas como taxonomía definitiva.
7. plans/DIAGNOSTIC-V9-EDITORIAL-LOTE-01.md — banco y evidencia editorial; revisar estado de propuestas.
8. plans/DIAGNOSTIC-V9-HUMAN-DECISION-SHEET-A-H.md — disposición recomendada A–H; no equivale a aprobación.
9. plans/DIAGNOSTIC-V9-POST-APPROVAL-IMPLEMENTATION-SCOPE.md — waves W0–W10 y scope incremental condicional.
10. docs/STATUS.md y docs/TESTING.md — evidencia CI por SHA, no garantía de HEAD actual.

## 3. Matriz de aceptación del PLAN (antes de tocar código)
| Gate | Condición comprobable | Estado 2026-11-01 | Evidencia requerida |
| --- | --- | --- | --- |
| PLAN-G01 | D-V9-001–033 conciliadas sin reabrir aprobaciones | DOCUMENTED | Registro v0.2.0 y secciones de aprobación del maestro |
| PLAN-G02 | Taxonomía 8×10 aprobada, aplicabilidad y nombres definitivos | READY_FOR_HUMAN_REVIEW | DEC-A pack + hoja ejecutiva; falta aprobación |
| PLAN-G03 | Banco de 90 candidatos revisado por pregunta/opción | READY_FOR_HUMAN_REVIEW | DEC-C pack; 77 baseline, 82/90 pending; falta aprobación |
| PLAN-G04 | Scoring, calibración, confianza, abstención y correlación aprobados | READY_FOR_HUMAN_REVIEW | DEC-B + DEC-D packs; binding v2/v4 sigue P0 |
| PLAN-G05 | Informe identificado, permisos, retención y seguimiento definidos | READY_FOR_HUMAN_REVIEW | DEC-E pack; local-only/D1/store final aún requieren decisión |
| PLAN-G06 | Adaptadores Aprende/servicios y fallback especificados | READY_FOR_HUMAN_REVIEW | DEC-G pack; catálogos reales se verifican en implementación |
| PLAN-G07 | Backlog F00–F10 con tareas, prerequisitos, pruebas y rollback | DOCUMENTED, REQUIRES_REVIEW | Backlog v0.1.0; revisar contra HEAD antes de ejecutar |
| PLAN-G08 | Matriz C01–C10 y ES/EN con criterios de aceptación | DOCUMENTED / NOT_CERTIFIED | CLASS-04 + DEC-A/F; faltan pruebas autorizadas |
| PLAN-G09 | Política de integración main, V8, migraciones y rollback aprobada | READY_FOR_HUMAN_REVIEW | DEC-H pack; colisión 0030–0035 y aprobación pendientes |
| PLAN-G10 | Aprobación explícita del responsable para comenzar implementación | GRANTED_W1_F00_ONLY | W1/F00 ejecutado; W2+ requiere nueva autorización |

## 4. Gates de implementación (después de autorización)
| Gate | Tareas | Condición de salida |
| --- | --- | --- |
| IMPL-G00 | F00–F01 | **PASS focal**: main ancestro + frontera legacy congelada; storage final deferred y registry objetivo definido |
| IMPL-G01 | F02 | Banco aprobado, ES/EN y evidencia versionada |
| IMPL-G02 | F03 | **PASS CORE** — graph/context 31/31 + budget/session/replay 31/31; idioma/aclaración UI quedan F08 |
| IMPL-G03 | F04 | **PASS CORE** — scorer V9-owned, 40 mappings, correlation fail-closed, v1-v4 registry, histórico v2 y v4 actual; 32/32 PASS |
| IMPL-G04 | F05–F06 | Resumen/informe/recomendaciones justificadas, recursos publicados o fallback |
| IMPL-G05 | F07 | Sesión, claim, organización, historial y privacidad sin acceso cruzado |
| IMPL-G06 | F08 | UX accesible, seguridad, E2E y regresiones pertinentes |
| IMPL-G07 | F09 | Conmutación y retirada legacy con rollback, datos históricos intactos |
| IMPL-G08 | F10 | Staging, piloto, aceptación, despliegue autorizado y verificación |

## 5. Orden de arranque futuro y condiciones de parada
- Comprobar rama, HEAD remoto, worktree limpio, PR y main; si cambió el HEAD desde el último checkpoint, reconciliar antes de escribir.
- Ejecutar F00-01 primero y confirmar aprobación de DEC-H antes de F00-02. Nunca force-push.
- Para cada tarea: documentar alcance → editar mínimo → ejecutar únicamente pruebas focalizadas del código modificado → registrar comando, exit code, log, SHA y riesgo → commit acotado.
- No usar typecheck/build global como rutina; solo si gate de integración lo exige y el responsable lo aprueba. No confundir tests escritos con PASS.
- Si una tarea requiere decisión editorial no aprobada, dejarla HOLD y continuar solo con tareas documentales independientes.
- Detener ante: conflicto con cambios concurrentes; modificación fuera de ámbito; acceso cruzado; pérdida de datos; evidencia duplicada; score sin suficiente evidencia; fallo de rollback; CI sin trazabilidad.
- No borrar migraciones D1 ya aplicadas ni pruebas V8. GHL no condiciona el diagnóstico.

## 6. Evidencia histórica que no debe exagerarse
La documentación registra 13/13 PASS del archivo focal del banco90/correlador para commit 231fba058803, GitHub Actions run 41200765557. No es un PASS del HEAD posterior ni de E2E, identidad, staging o producción.
El correlador V9 ya está conectado al scorer autónomo antes de agregación; el P0 de doble conteo queda cerrado para los mappings/overlap groups registrados en F04. Nuevos mappings solapados deberán declarar metadata antes de scoring.
PR #162 permanece draft; tras W1 GitHub lo reportó mergeable. Revalidar antes de cada nuevo scope.

## 7. Formato obligatorio del reporte de cada tarea futura
- ID / gate / fecha / HEAD inicial / HEAD final.
- Fuentes verificadas, decisión aprobada y archivos afectados.
- Cambios precisos, alcance excluido, razón.
- Comando de prueba focal, resultado, exit code y log asociado a SHA.
- Riesgos, rollback y pendientes.
- Estado: DONE_WITH_EVIDENCE / BLOCKED / HOLD / NEEDS_REVIEW. Nunca DONE por inspección documental solamente.

## 8. Próximo paso de planificación
El siguiente gate requiere nueva autorización: **F05**. No modificar resumen/informe/recomendaciones ni superficies posteriores hasta mensaje explícito. Los 59 rewrites y 13 ADD siguen fuera del runtime canónico.

## Changelog
- 0.6.0 / 2026-11-01: W5/F04 cerrado; scorer autónomo y calibration/correlation reproducibles 32/32; F05+ no autorizado.
- 0.5.0 / 2026-11-01: W4/F03 cerrado; 24+5/replay y graph 31/31 cada uno; W5/F04 no autorizado.
- 0.4.0 / 2026-11-01: W3/F02 cerrado con fallback; canonical manifest 77, 29/29 PASS; W4/F03 no autorizado.
- 0.3.0 / 2026-11-01: W2/F01 cerrado; frontera legacy allowlisted 3/3 PASS; storage final deferred y registry objetivo fijado; F02+ PLAN_ONLY.
- 0.2.0 / 2026-11-01: A–H aprobadas; W1/F00 ejecutado con main ancestro, migraciones V9 0038–0043 y 43/43 pruebas focales PASS; W2+ sigue PLAN_ONLY.
- 0.1.1 / 2026-11-01: A–H ya están READY_FOR_HUMAN_REVIEW; se añaden hoja ejecutiva, scope post-aprobación y estados actualizados de gates sin levantar PLAN_ONLY.
- 0.1.0 / 2026-10-31: índice, matrices de aceptación, protocolo de arranque, stop conditions y reporte por tarea. Sin cambios de runtime.
