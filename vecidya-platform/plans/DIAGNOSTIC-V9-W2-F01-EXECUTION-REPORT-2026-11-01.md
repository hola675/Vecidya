# Diagnostic V9 — W2/F01 Execution Report — 2026-11-01

**Estado:** DONE_WITH_EVIDENCE  
**Scope autorizado:** W2/F01 únicamente  
**Sin autorización:** F02–F10, merge a main, deploy, producción

## 1. Estado inicial

- main: `e92c10e9ebcbb87768661eb383f16564340e63cf`
- HEAD inicial W2: `abab2951902c244ef020a3f098fe043ba522780b`
- PR #162: open/draft/mergeable
- branch vs main: ahead 668 / behind 0

## 2. Entregables

### F01-01
Mapa de dependencias y consumidores V9/QBV2/QA03B.

Hallazgo:
las rutas V9 no importan QBV2 directamente, pero el núcleo llega a QBV2 mediante QA03B en scoring, planner, session, context/engine/bank y finalization.

### F01-02
Clasificación:
- REPLACE;
- SHARED;
- ADAPTER;
- RETAIN;
- DELETE_AFTER_CUT.

Se documentó además:
- ADR storage identificado;
- registry objetivo de versiones;
- matriz de eliminación;
- regla de no añadir imports legacy nuevos.

## 3. Storage ADR

Bindings actuales observados:
- D1 `DB`;
- R2 `BUSINESS_MEDIA`.

Ninguno queda aprobado como store final V9 identificado.

Decisión:
- `IdentifiedDiagnosticResultStoreV9` como contrato futuro;
- backend físico DEFERRED TO F07;
- D1 V9 0038–0043 sigue prototipo;
- no aplicar remoto;
- no reutilizar BUSINESS_MEDIA.

## 4. Version registry ADR

Registry futuro debe fijar:
questionBank, answerSchema, contextSchema, applicability, planner, engine, scoring, calibration, recommendations, resultSchema, replay y consent.

Reglas:
- scoring→calibration explícita;
- run persiste registry ID;
- replay/finalization resuelven por ID;
- unknown registry falla cerrado;
- no defaults silenciosos.

Implementación: F04, no F01.

## 5. Prueba focal

Archivo:
`tests/unit/diagnostic/qa03b-v9-autonomy-boundary.test.ts`

Valida:
1. allowlist exacta de imports legacy/transicionales;
2. graph/question-selection puro sin QBV2/QA03B;
3. rutas públicas V9 sin imports QBV2 directos.

### Corridas
- commit `9b5e3c99bded12d59699eabbffaeef70499a8270`: FAIL útil; faltaba `./context` de applicability en inventario.
- commit `35b095652109d364e03996259a7c88cd2edeed5f`: FAIL útil; faltaba `./context` de engine.
- commit `7f598dcc83756e7a764200ed86cb7aa74f71525d`: PASS.

GitHub Actions:
- run `41325376095`
- job `124904090779`
- **3 tests / 3 pass / 0 fail**
- ~91.8 ms test runtime
- job general typecheck/build/unit regression: SKIPPED.

Los fallos previos correspondieron a la allowlist/inventario, no a una regresión runtime.

## 6. Cambios de código

No se modificó runtime V9.

Cambios:
- test estático nuevo;
- workflow focal W2/F01;
- documentación de arquitectura/ADR.

No se cambió:
- banco;
- opciones;
- scoring;
- planner;
- 24+5;
- rutas productivas;
- DB remoto;
- migraciones;
- V8.

## 7. Estado posterior

**F01-01 = DONE_WITH_EVIDENCE**  
**F01-02 = DONE_WITH_EVIDENCE**

V9 todavía no es autónomo: la allowlist describe deuda que F02–F04 deberán reducir.

**F02–F10 = PLAN_ONLY / NO AUTORIZADOS.**

Siguiente scope recomendado:
**W3/F02 — banco editorial canónico**, solo tras nueva autorización explícita.
