# V9 — QA03B: cadena de 77 a 90 candidatos y límites de activación
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Composición verificada por lectura
- specialty-candidate-bank.ts importa banco evolucionado desde ./bank y construye QA03B_SPECIALTY_CANDIDATE_BANK_V1.
- specialty-branches-wave1.ts: QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 = specialty V1 transformado + preguntas de rama; guardias de 77 preguntas e IDs únicos.
- QA03B_EXTENDED_CANDIDATE_BANK_V3 = 77 + 5 complementarias = 82; guardias de longitud y unicidad.
- QA03B_GENERAL_BALANCED_CANDIDATE_BANK_V4 = 82 + 8 general probes = 90; guardia de longitud; borrador de evidencia asociado a ocho probes, sin activación de scoring.
- q2_sector especializado V4 hereda unknown desde qa03b/bank.ts; expectativa estática de 20 opciones, no ejecutada.

## Riesgos de compatibilidad
- Los sufijos V2/V3/V4 de exports de bancos NO equivalen a versiones de todas las preguntas individuales.
- No inferir que 90 candidatos son 90 turnos de entrevista.
- Las cinco complementarias y ocho generales no implican scoring ni flujo público.
- Las guardias en código no constituyen test PASS hasta ejecutarse.
- Censo de importadores finales fuera de estos módulos todavía pendiente; no afirmar activación pública.

## Pruebas focales propuestas
1. Inspección de IDs y options del sector V2/V3/V4; conteos 15/16/20.
2. Construcción de bancos 77/82/90 y unicidad de IDs.
3. unknown/other no deben activar nichos específicos.
4. Compatibilidad de replay con versionado de q2_sector.
5. Validar que los ocho probes no aporten evidencia puntuable sin migración explícita.

## Changelog
0.1.0: cadena de ensamblaje 77→82→90 documentada sin ejecutar pruebas.