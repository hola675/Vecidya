# Diagnostic V9 — W3/F02 Canonical Editorial Bank

**Versión:** 0.1.0  
**Fecha:** 2026-11-01  
**Estado:** W3/F02 AUTHORIZED · PENDING_FOCAL · F03–F10 PLAN_ONLY  
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

F02 puede cerrar si:
1. manifest = 77 IDs únicos;
2. 18 KEEP + 59 rewrite_pending;
3. el conjunto ID→version coincide con bank77 actual; el orden runtime queda delegado al adapter hasta F03;
4. bank82/bank90 no contaminan canonical 77;
5. 13 ADD siguen pending y sin evidenceV3;
6. real-estate fallback se preserva;
7. manifest no añade imports legacy;
8. runtime autoritativo no activa 82/90;
9. tests focales de bank77/90 y manifest pasan.

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

- **0.1.0 / 2026-11-01:** manifest canónico 77, decisiones 18/59 y exclusión explícita de las 13 extensiones; pendiente gate focal.
