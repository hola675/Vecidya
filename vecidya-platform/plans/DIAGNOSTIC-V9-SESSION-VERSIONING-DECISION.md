# V9 — Decisión propuesta de versionado de sesión (sin activar)
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Contrato vigente verificado
- qbv2-session.ts: DIAGNOSTIC_SESSION_V3_SCHEMA=2, STORAGE_KEY=vecidya.diagnostic.v3.session.2, TTL=14 días.
- DiagnosticSessionV3 guarda schemaVersion, sessionId, timestamps, answers, answeredQuestionIds, queue, reviewIndex, routeTrace y status.
- answers es AnswersV2 por questionId, sin versión de pregunta individual en la estructura declarada.
- parseSessionV3 rechaza esquema incompatible, caducidad, respuesta inválida o questionId ausente del banco recibido; luego reconcilia elegibilidad.
- validateAnswerV3 compara opciones por value; no realiza traducción histórica ni comprobación de version por respuesta.

## Decisión propuesta, NO aprobada
1. No reutilizar la clave de almacenamiento de V8 para una sesión experimental V9.
2. Mantener el banco original de una sesión hasta su finalización, o usar migración explícita con tabla de equivalencias; decidir antes de codificar.
3. Para migración, registrar origen de banco, versión de pregunta, value original y resultado de validación; no inventar conversiones.
4. Conservar valores válidos cuando el contrato lo permita; no perder respuestas silenciosamente.
5. Si no es seguro migrar, ofrecer reanudación con banco original o reinicio informado; no sustituir silenciosamente respuestas.
6. Revisar cambios de elegibilidad y nicho después de migrar, con trazabilidad de invalidaciones.

## Pruebas focales pendientes
- Restauración con banco original, TTL válido y respuesta other.
- Valor sector unknown en V9 y restauración en banco que no lo reconoce.
- Sector concreto y nicho incompatible tras edición: reconciliación.
- Esquema incorrecto, TTL vencido y value inexistente: rechazo controlado.
- Banco distinto con mismo questionId pero semántica distinta: no declarar equivalencia automática.

## Estado
Propuesta documental. No hay aprobación de implementación, tests ejecutados, cambio de clave ni despliegue. V8 sigue vigente.

## Changelog
0.1.0: contrato de persistencia preciso y decisión propuesta de versionado.