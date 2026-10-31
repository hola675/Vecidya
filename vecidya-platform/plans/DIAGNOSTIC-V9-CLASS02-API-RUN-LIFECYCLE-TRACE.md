# V9 — CLASS-02: traza de APIs de ejecución y persistencia
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Fuentes inspeccionadas
| Endpoint fuente | Blob SHA | Delegación |
|---|---|---|
| api-diagnostic-v9-runs.ts | a24fed8bb5372867abad62d1c761fa89ebcbace3 | createOwnedDiagnosticRunV9 |
| api-diagnostic-v9-run-events.ts | 46278601c16ace4f281df726dfe20acc4bb11ba6 | ingestOwnedDiagnosticEventV9 |
| api-diagnostic-v9-run-state.ts | 7d338656f46e386657673de0260dd484b1252c27 | readOwnedDiagnosticRunStateV9 |
| api-diagnostic-v9-run-finalize.ts | 8fe64cb721f4297d8bf07219477ab4e639516294 | finalizeOwnedDiagnosticRunV9 |
| api-diagnostic-v9-run-result.ts | e0b161cfb01eb9502b5c92821136d2ef9dcff531 | readOwnedDiagnosticRunV9 y finalizeOwnedDiagnosticRunV9 |

## Flujo observado
Creación: gate de disponibilidad, rate limit, identidad, versiones runtime BANK/ENGINE/SCORING/RECOMMENDATIONS/CONSENT y createOwnedDiagnosticRunV9 con env.DB y runId UUID.
Eventos: gate, validación runId, identidad, ingestOwnedDiagnosticEventV9 y control de mismatch de versión de banco, run no activo y no propiedad.
Reanudación: readOwnedDiagnosticRunStateV9 con identidad y versiones runtime; errores explícitos por no propiedad, mismatch y no reanudable.
Finalización: finalizeOwnedDiagnosticRunV9 con DB, identidad, versiones; distingue conflictos de secuencia y replay fallido.
Resultado: comprueba status completed y utiliza servicio de finalización para obtener resultado; no asumir que GET carece de trabajo interno sin inspeccionar el servicio.

## Separación de contratos
La persistencia de ejecuciones V9 usa servicios de servidor y env.DB; no equivale al localStorage de qbv2-session.ts. La compatibilidad de bancos y versiones debe evaluarse en ambos caminos por separado. Los controles identificados son evidencia estática, no certificación de ejecución ni de configuración desplegada.

## Pendientes prioritarios
1. Inspeccionar v9-identity, v9-event-ingestion, v9-run-state y v9-finalization para verificar esquema, replay, idempotencia y versiones.
2. Comprobar si las versiones del runtime están alineadas con las versiones guardadas en cada ejecución.
3. Determinar el banco efectivo del replay V9 y su relación con los 90 IDs candidatos.
4. Definir pruebas focales sin ejecutar hasta autorización.

## Changelog
0.1.0: censo de cinco endpoints y delimitación de persistencia V9 frente a sesión V3.