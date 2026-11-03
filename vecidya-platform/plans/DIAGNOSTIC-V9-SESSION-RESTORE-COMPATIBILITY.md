# V9 — Contrato de recuperación de sesiones y compatibilidad de bancos
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Evidencia de código
- qbv2-session.ts SHA 2aec0b21234baa93ed5822c41350918fc96826f9: bankOf(options) usa options.bank o QUESTION_BANK_V2.
- createSessionV3 y parseSessionV3 aceptan options con banco explícito.
- serializeSessionV3 serializa el objeto completo con JSON.stringify.
- parseSessionV3 valida schemaVersion, campos, TTL, límites, respuestas y preguntas contra el banco recibido.
- Si una respuesta no existe o no cumple validateAnswerV3 para ese banco, parseSessionV3 devuelve null; no hay traducción automática del value.
- Después de validar, reconcile recalcula respuestas activas y advance recompone el avance.
- qbv2-engine.ts SHA 3ee64669b626c954495d5b194da6e07a42f252d1: resolveEligibleQuestionsV2 reduce respuestas activas hasta estabilizar elegibilidad.

## Riesgo de migración
Cambiar el banco de una sesión persistida sin política de versiones puede invalidar el restore completo si una respuesta antigua deja de ser válida. Incluso con values válidos, una condición de elegibilidad distinta puede retirar respuestas activas. No declarar replay seguro solo por igualdad de questionId.

## Casos focales propuestos, NO ejecutados
1. Sesión V8 guardada con sector v2=other y restaurada con banco original.
2. Sesión V8 guardada con sector concreto, restaurada con banco candidato V9.
3. Sesión V9 sector=unknown y restauración con banco que no admite unknown.
4. Cambio de sector con nicho dependiente ya respondido; observar reconcile.
5. Esquema de sesión antiguo, JSON corrupto, expiración y respuesta inválida: verificar null sin mutaciones.
6. Restauración de sesión completed tras cambio de elegibilidad y replanning.

## Decisión pendiente
Definir antes de implementar si se conserva el banco original por sesión, si se introducen migradores explícitos por versión o si se reinicia con aviso. No inferir compatibilidad automática. Proteger V8 y no activar candidatos.

## Changelog
0.1.0: lectura focal de qbv2-session y matriz de riesgos de replay.