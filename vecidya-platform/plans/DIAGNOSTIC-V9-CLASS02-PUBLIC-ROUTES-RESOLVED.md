# V9 — CLASS-02: corrección de censo de rutas públicas
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Corrección explícita de hallazgo previo
El documento DIAGNOSTIC-V9-CLASS02-SESSION-PUBLIC-ROUTE-GAP.md registró que la ruta pública no había podido localizarse. La ruta sí existe: el intento anterior buscó erróneamente app/routes/diagnostico.tsx, pero el archivo real es app/routes/diagnostic.tsx. La conclusión anterior de 'ruta no localizada' queda SUPERADA por este inventario; no debe citarse como estado actual.

## Inventario verificado
app/routes.ts blob 0a0b68fad515373878040cdcd65fb4a13817f896:
| URL | Archivo | Rol |
|---|---|---|
| /diagnostico | routes/diagnostic.tsx | Entrada pública con CandidateDiagnosticFlow |
| /diagnostico/v9 | routes/diagnostic-v9.tsx | Inicio V9 con gate |
| /diagnostico/v9/:runId | routes/diagnostic-v9-run.tsx | Ejecución V9 con gate |
| /api/diagnostic/v9/runs | routes/api-diagnostic-v9-runs.ts | API de ejecuciones |
| /api/diagnostic/v9/runs/:runId/events | routes/api-diagnostic-v9-run-events.ts | Eventos |
| /api/diagnostic/v9/runs/:runId | routes/api-diagnostic-v9-run-state.ts | Estado |
| /api/diagnostic/v9/runs/:runId/result | routes/api-diagnostic-v9-run-result.ts | Resultado |
| /api/diagnostic/v9/runs/:runId/finalize | routes/api-diagnostic-v9-run-finalize.ts | Finalización |
| /__dev/diagnostico/qa03b/v9 | routes/dev-diagnostic-qa03b-v9.tsx | Prueba de desarrollo |

## Fuentes adicionales
routes/diagnostic.tsx blob 73816a1b080abf107ac2f332ed9e75fd8a342629 importa CandidateDiagnosticFlow desde qa03b-diagnostic-flow. routes/diagnostic-v9.tsx blob 8f03d699e4ff7677384df46597eb9fede66d75e7 inicia flujo V9. routes/diagnostic-v9-run.tsx blob 8ce648da6ee70a6ed446e6183ce9ffa00bafee35 importa QA03B_SPECIALTY_BRANCH_CANDIDATE_BANK_V2 y maneja llamadas de API de ejecución.
qa03b/v9-public-availability.server.ts blob be37672e68bccec9d8657f3523f878fc794bb1b define DIAGNOSTIC_V9_PUBLIC_ENABLED y versiones BANK/ENGINE/SCORING/RECOMMENDATION/CONSENT. El gate exige flag true y versiones explícitas; no se verificaron valores de entorno ni disponibilidad desplegada.

## Consecuencias
- La existencia de rutas no certifica que V9 esté habilitado ni que use el banco de 90 candidatos.
- El flujo público /diagnostico y el flujo /diagnostico/v9 son rutas distintas.
- La compatibilidad de sesión QBV2 no describe automáticamente la persistencia de ejecuciones V9: auditar por separado APIs y worker replay.
- Mantener CLASS-02 PARCIAL, PLAN_ONLY y la necesidad de pruebas focales autorizadas.

## Changelog
0.1.0: inventario real de rutas y corrección de la búsqueda anterior.