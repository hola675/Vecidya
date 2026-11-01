# Diagnostic V9 — W3/F02 Canonical Editorial Bank

**Versión:** 0.2.0  
**Fecha:** 2026-11-01  
**Estado:** W3/F02 DONE_WITH_FALLBACK · F03–F10 PLAN_ONLY  
**Rama:** `feat/diagnostic-v9-lex-graph-p1b`

## 1. Decisión aplicada

DEC-C aprobada con fallback se materializa así:

- baseline canónico: **77 preguntas**;
- KEEP: **18**;
- REWRITE: **59**, pero permanecen `rewrite_pending`;
- REMOVE: **0**;
- ADD 82: cinco candidatos, no activos;
- probes 90: ocho candidatos, no activos;
- total experimental: 90;
- total canónico activo para identidad editorial F02: **77**.

F02 NO reescribe aún las 59 preguntas. Un REWRITE aprobado como intención no autoriza cambiar copy/opciones/versiones sin el contrato individual correspondiente.

## 2. Contrato V9-owned

Nuevo archivo:
`app/features/diagnostic/v9/canonical-bank-manifest.ts`.

Propósito:
- fijar IDs y versiones fuente del baseline 77 como identidad editorial; el orden de ensamblaje runtime no se redefine en F02;
- registrar KEEP vs `rewrite_pending`;
- mantener fuera los 13 ADD;
- no importar QA03B/QBV2;
- servir de identidad editorial estable para F03/F04.

ID:
`diagnostic-v9-canonical-77-baseline-v1`.

Version:
`1`.

El manifest no es todavía un `QuestionDefinition[]` ejecutable autónomo. La definición completa sigue detrás del adapter QA03B hasta que F03/F04 creen los contratos V9-owned necesarios.

## 3. Qué significa KEEP

Los 18 KEEP conservan identidad y versión fuente como baseline.

No significa que:
- todo copy sea definitivo;
- no pueda haber pulido ES/EN;
- el runtime esté certificado.

## 4. Qué significa REWRITE

Los 59 REWRITE:
- permanecen en el baseline con su versión fuente actual;
- quedan marcados `rewrite_pending`;
- no se reinterpretan históricamente;
- no cambian opciones ni evidence durante F02;
- requieren nueva versión cuando cambie significado.

Así se evita activar 59 cambios editoriales de golpe.

## 5. 13 extensiones fuera del canonical 77

### Cinco ADD
- `q2_nonprofit_participation_entry`
- `q2_education_enrollment_entry`
- `q2_real_estate_inquiry_entry`
- `q2_creative_brief_intake`
- `q2_retail_purchase_next_step`

### Ocho probes generales
- `q2_general_offer_comprehension`
- `q2_general_contact_information_consistency`
- `q2_general_discoverability_path`
- `q2_general_verifiable_trust_signals`
- `q2_general_first_action_path`
- `q2_general_pending_step_continuity`
- `q2_general_outcome_measure_definition`
- `q2_general_digital_execution_reliability`

Todos permanecen:
- fuera del manifest 77;
- `evidenceMigration=pending`;
- sin `evidenceV3`;
- no autorizados para scoring.

## 6. Real estate

`q2_professional_intake_flow` sigue dentro del baseline.

`q2_real_estate_inquiry_entry` permanece ADD pending y no sustituye al fallback genérico.

## 7. Neutralidad y copy

F02 valida sobre el banco fuente:
- prompt no vacío;
- options no vacías;
- values únicos por pregunta;
- labels no vacíos;
- paridad ID/version con el manifest.

La semántica fina de las 59 REWRITE sigue en backlog individual. No se declara certificación lingüística completa por este gate.

## 8. Compatibilidad F01

El manifest nuevo:
- vive bajo `diagnostic/v9/`;
- no importa QA03B;
- no importa QBV2;
- no amplía la allowlist F01.

La comparación con el banco QA03B ocurre únicamente en tests de migración/paridad.

## 9. Gates F02

F02 queda cerrado con fallback porque:
1. manifest = 77 IDs únicos;
2. 18 KEEP + 59 rewrite_pending;
3. conjunto ID→version = bank77 actual;
4. orden runtime no se redefine en F02;
5. bank82/bank90 no contaminan canonical 77;
6. 13 ADD siguen pending y sin evidenceV3;
7. real-estate fallback preservado;
8. manifest V9-owned sin imports legacy;
9. runtime autoritativo sigue fijado a bank77;
10. gate focal = **29/29 PASS**.

### Estado de tareas
- **F02-01 = DONE_WITH_EVIDENCE** — inventario 77/82/90 y paridad fijados.
- **F02-02 = DEFERRED_WITH_FALLBACK** — la aprobación humana cubre KEEP/REWRITE a nivel de decisión; las 59 reescrituras y cualquier cambio de opción/copy permanecen pendientes. Fallback: conservar bytes/semántica/versiones fuente del 77.
- **F02-03 = DONE_WITH_FALLBACK** — manifest canónico V9-owned versionado; las definiciones ejecutables siguen detrás del adapter QA03B hasta F03/F04.

### Evidencia focal
Primer intento:
- SHA `565217525c6c3c3bb6f6b0dc30b72829d880d58c`;
- run `41327802881`, job `124911330421`;
- fallo útil: el test asumía que el orden editorial era el orden del array runtime.

Corrección:
- F02 define identidad por `ID→version`, no por orden de ensamblaje;
- el orden runtime permanece en el adapter hasta F03.

PASS:
- SHA `92271d398400647dfa9c62097964f5a20f5d0a77`;
- run `41327887999`, job `124911583189`;
- **29 tests / 29 pass / 0 fail**;
- regresión general = **SKIPPED**.

## 10. Fuera de alcance

No hacer:
- implementar los 59 rewrites;
- activar ADDs;
- mover scoring;
- cambiar planner;
- tocar 24+5;
- aplicar migraciones;
- deploy.

## Changelog

- **0.2.0 / 2026-11-01:** F02 cerrado con fallback; manifest 77 V9-owned, 18 KEEP/59 rewrite_pending, 13 ADD fuera, 29/29 PASS.
- **0.1.0 / 2026-11-01:** manifest canónico 77, decisiones 18/59 y exclusión explícita de las 13 extensiones; pendiente gate focal.
