# Inventario de consolidación del diagnóstico — 2026-10-18

**Alcance:** auditoría de código de la rama `feat/diagnostic-funnel-01d1`. No es certificación de equivalencia ni autorización para eliminar archivos.

| Superficie | Fuente encontrada | Tratamiento |
| --- | --- | --- |
| Ruta pública | `app/routes/diagnostic.tsx` → `AnonymousDiagnosticFlow` | Mantener durante D0-D4 |
| Sesión y respuestas | `createSessionV3`, `DiagnosticSessionStoreV3`, `submitAnswerV3` | Versionar y probar reanudación antes del cutover |
| Banco productivo | `qbv2-bank.ts` compone golden + lotes A-G y registra `QUESTION_BANK_V2` | Línea base para comparar |
| Banco revisado candidato | `qa03b/bank.ts` modifica preguntas y reglas sobre banco histórico | Evaluar opción por opción, no reemplazar sin paridad |
| Resumen anónimo | `anonymous-summary.ts` y endpoint `api-diagnostic-anonymous-summary.ts` | Mantener proyección limitada |
| Identificación | `identified-diagnostic-request-form.tsx` y endpoints de reportes/verificación | Probar identidad, acceso y retención |
| Contratos legacy | `questions.ts`, `answers.ts`, `flow.ts`, `scoring.ts`, `mappings.ts`, `legacy-signal-adapter.ts` | Buscar consumidores y usos históricos antes de retirar |
| Rutas de desarrollo | `dev-diagnostic-*.tsx` | Conservar fixtures hasta que existan pruebas equivalentes |
| D1 | Migraciones y snapshots históricos | No eliminar ni reescribir migraciones aplicadas |

## Criterios de revisión del banco de preguntas

1. Cada pregunta tiene identificador y versión estables; las opciones usan valores semánticos inequívocos.
2. `unknown`, `unsure` y respuestas excluyentes no coexisten con selecciones contradictorias.
3. La aplicabilidad de cada pregunta es determinista; ninguna ruta queda sin salida ni obliga a responder datos no pertinentes.
4. Se diferencian estado operativo, historial de clientes, comprador directo, beneficiario, modalidad de prestación y compra en línea.
5. Las contradicciones materiales solicitan confirmación cuando procede; no se infieren respuestas omitidas.
6. Cada resultado y recomendación conserva trazabilidad a preguntas, evidencia, versión del banco y motor.
7. Resumen anónimo y reporte detallado se derivan del mismo resultado versionado; el resumen no expone contenido restringido.
8. Se validan golden personas, rutas límite, regreso, reinicio, reanudación, descarga, verificación de email y caducidad.

## Próxima ejecución

**D0-A:** construir matriz automatizada de consumidores e identidades del motor. **D1-A:** comparación determinista entre `QUESTION_BANK_V2` y el candidato `qa03b` (ids, versiones, opciones, elegibilidad y copy). **D2-A:** corregir solo divergencias confirmadas con pruebas de regresión. No hacer reemplazo masivo, no borrar módulos legacy ni tocar D1 remota.

**Bloqueos existentes:** `GATE_B_PARTIAL`, certificación `FUNNEL-01D.1`, política de privacidad/retención, correo real y CI funcional. Mantener rollback y contratos históricos.
