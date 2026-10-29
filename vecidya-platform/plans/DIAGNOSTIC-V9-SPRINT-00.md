# DIAGNOSTIC V9 — SPRINT 00: RECONCILIACIÓN Y MAPA DE MIGRACIÓN
Versión: 1.0.0 | Fecha: 2026-10-29 | Estado: READY FOR AGENT
Rama exclusiva: feat/diagnostic-v9-lex-graph-p1b | PR #162 | Plan rector: `plans/DIAGNOSTIC-V9-MASTER-FINALIZATION-PLAN.md`

## Misión y resultado
Entregar una base comprobada para desarrollar V9 sin trabajo disperso ni dependencias ocultas. Este sprint NO reescribe motor, NO borra legacy, NO hace merge, NO despliega. Al terminar, cualquier agente debe saber qué existe, qué falta, qué rama aporta valor y en qué orden implementar la autonomía.

## Reglas no negociables
1. Leer `AGENTS.md`, normas de repositorio, plan rector, docs/diagnostic-master-plan-context.md, docs/diagnostic-v9-consolidation-status.md, docs/diagnostic-v9-question-answer-migration-protocol.md y los planes de Aprende/Mi Vecindario/MiniWeb que existan realmente en repo. Localizar y citar rutas; si no existen, registrar ausencia sin inventar.
2. `git status --short` y SHA de main, origin/main, rama maestra y PR antes de cualquier cambio. No pisar trabajo ajeno ni force-push.
3. Trabajar exclusivamente en PR #162, commits pequeños, solo documentación/instrumentación focal en este sprint.
4. No usar tests generales ni alterar CI general; pruebas focalizadas solo si se toca código. No reportar PASS sin salida real.
5. No cerrar PR ni borrar ramas antes de completar matriz y confirmar procedencia. #157 es contrato transversal de sectores; requiere evaluación de Vecindario.
6. Todo dato se etiqueta VERIFIED / DOCUMENTED / INFERRED / UNVERIFIED y se vincula a SHA/ruta/PR.

## S00-01 — Descubrimiento de planes y estado [P0]
- Localizar `plans/` existentes, planes Aprende, Mi Vecindario y MiniWeb; describir estructura común (objetivo, alcance, tareas, gates, evidencia, log). No sustituir contenido real por supuestos.
- Releer docs V9 y el código del HEAD. Actualizar conteo real preguntas/opciones/variantes y migraciones.
- Registrar SHA, fecha, PR #162, flags de activación y CI actual; NO confundir runs de SHA anterior.
Entregable: sección BASELINE de `plans/DIAGNOSTIC-V9-EXECUTION-LOG.md`.
Gate: fuentes y discrepancias documentadas.

## S00-02 — Matriz de ramas y PR [P0]
Consultar GitHub, comparar cada rama contra PR maestro y main con `git merge-base`, `git log --left-right --cherry-pick`, `git diff --stat` y `git diff --name-status` (o API compare). Al menos:
- feat/diagnostic-v9-lex-graph-ci-only
- feat/diagnostic-v9-lex-graph-p0p1
- feat/diagnostic-v9-lex-graph-p1b-ci-only
- feat/diagnostic-v9-p1c-ci-only
- feat/diagnostic-v9-p1d-ci-only
- feat/diagnostic-v9-p1e-candidate-context-ci
- feat/diagnostic-v9-p1e-context-ci
- feat/diagnostic-v9-p1e-eligible-ci
- feat/diagnostic-v9-p1e-fixture-validation-ci
- feat/diagnostic-v9-p1e-focused-ci
- feat/diagnostic-v9-p1e-restore-fix-ci
- feat/diagnostic-v9-p1e-session-ci
- feat/diagnostic-v9-recovery-01
- feat/diagnostic-sector-taxonomy-02
- buscar además ramas/PR diagnósticos fuera de este listado y PR #157, #161, #162, #163; revisar cerrados #156, #159, #160, #164–#172.
Datos de referencia 2026-10-29: 13 ramas V9 auxiliares sin commits propios pendientes; sector-taxonomy diverge 8 ahead/373 behind, 13 archivos comparados. Revalidar porque cambian.
Columnas obligatorias: rama/PR, SHA, base, ahead, behind, archivos exclusivos, funcionalidad, dependencias, decisión, motivo, destino, riesgo, prueba/evidencia.
Decisiones: ALREADY_IN_MASTER / CHERRY_PICK_SELECTED / MANUAL_PORT / SHARED_CONTRACT_SEPARATE / SUPERSEDED / DEFER. Nunca fusionar a ciegas toda una rama divergida.
Entregable: `plans/DIAGNOSTIC-V9-BRANCH-PR-RECONCILIATION.md`.
Gate: 100% de ramas y PR encontrados clasificados; si hay código exclusivo útil, integrar en rama maestra con commits acotados y pruebas focalizadas o dejar tarea BLOCKED justificada. Cierre de PR auxiliares requiere confirmación explícita del responsable.

## S00-03 — Inventario de dependencias [P0]
Recorrer imports/exportaciones y referencias en TS/TSX/SQL/workflows/config/docs. Buscar `qbv2`, `qa03b`, `diagnostic-v9`, `diagnostic`, `QUESTION_BANK_V2`, flags y rutas. NO asumir que todo `qa03b` es legacy: clasificar por comportamiento.
Inspeccionar prioritariamente:
- app/features/diagnostic/qa03b/specialty-candidate-bank.ts
- app/features/diagnostic/qa03b/specialty-branches-wave1.ts
- app/features/diagnostic/qa03b/v9-candidate-planner.ts
- app/features/diagnostic/qa03b/v9-candidate-scoring.ts
- app/features/diagnostic/qa03b/v9-finalization.server.ts
- app/features/diagnostic/qa03b/v9-run-state.server.ts
- app/features/diagnostic/qa03b/v9-identity-repository.ts
- app/features/diagnostic/qa03b/qbv2-candidate-*.ts
- app/routes/api-diagnostic-v9-*.ts y app/routes/diagnostic*.tsx
- db/migrations/0030–0035; `.github/workflows/main-integration-quality.yml`.
Además buscar `qbv2-session.ts` por su ruta REAL.
Para cada módulo: productor, consumidor, contrato, dato persistido, test, dependencia V8, decisión KEEP/REPLACE/ADAPTER/DELETE_AFTER_CUT y bloqueo. Identificar importaciones transitivas, no solo directas.
Entregable: `plans/DIAGNOSTIC-V9-LEGACY-DEPENDENCY-MAP.md` con grafo textual Mermaid y tabla de sustitución.
Gate: todo consumidor de V8/QBV2 identificado y con destino propuesto; no borrar nada.

## S00-04 — Matriz funcional y huecos [P1]
Verificar por código y pruebas: banco/editorial, clasificación, grafo, selección, scoring, evidencia, interpretación, resumen, recomendaciones, sesiones, eventos, snapshots, recuperación, claim, vinculación, historial, reporte, Aprende, servicios/licencias y CRM externo. Clasificar IMPLEMENTED / PARTIAL / MISSING / OBSOLETE y TESTED / UNTESTED. Priorizar por dependencia y riesgo.
Revisar semántica `none`/`unknown`/`not_applicable`/`not_published`, casos sin ventas, preparación/pausa, cambio de nicho, 24 interacciones cuando aplique. NO aprobar 77/387 automáticamente.
Entregable: `plans/DIAGNOSTIC-V9-FUNCTIONAL-GAP-MATRIX.md`, con backlog ordenado para Sprint 01 y siguientes.
Gate: cada hueco vinculado a archivo/contrato, impacto, riesgo y test objetivo.

## S00-05 — Validación y handoff [P0]
- Revisar diff final, no incluir cambios no relacionados.
- Si solo documentación: validar rutas, enlaces internos, Markdown, consistencia de SHAs y matrices; no ejecutar tests de código innecesarios.
- Si se integró código exclusivo: `pnpm typecheck` y `node --test` SOLO archivos V9 afectados, con comando exacto y resultado; build solo si cambió el empaquetado/SSR. En CI focal, comprobar logs de SHA actual.
- Publicar en log: commits, evidencia, pendientes, riesgos, decisiones bloqueadas y próxima tarea concreta.
- Actualizar descripción del PR #162 con enlaces a los planes sin sobrescribir contexto histórico; mantener draft.
Gate final: matrices completas, un PR rector, ningún cambio destructivo, siguiente sprint listo para ejecutar.

## Formato de reporte por tarea
`ID | SHA antes/después | Archivos | Evidencia | Comandos y resultados | Decisión | Riesgos | Estado | Próximo paso`.
Estados: TODO / IN_PROGRESS / BLOCKED / VERIFIED / DONE. DONE exige gate y evidencia; VERIFIED no significa desplegado.

## Condiciones de parada
Detener y consultar si: la rama cambia de HEAD durante una escritura; la comparación de #157 implica modificar Vecindario; hay riesgo de pérdida de datos o de regresión V8; faltan permisos; un PR auxiliar tiene trabajo útil pero conflictos no triviales; se propone activar flag, fusionar o desplegar.

## Primer comando lógico
Leer los planes y docs; comprobar git status y HEAD; comparar PR #162 y las ramas; escribir primero la matriz de reconciliación. NO empezar refactor del motor hasta cerrar este sprint.
