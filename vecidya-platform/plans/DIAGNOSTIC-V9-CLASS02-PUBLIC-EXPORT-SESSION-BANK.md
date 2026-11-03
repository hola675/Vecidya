# V9 — CLASS-02: exportaciones públicas y banco por defecto de sesión
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Evidencia focal
index.ts blob 75016558ea7ad3bd64c33bf76bdb6e44d2fb3da3 exporta resolveDiagnosticContext (línea 11), foldSignalProductions (línea 20), QUESTION_BANK_V2 (línea 76) y las funciones de sesión V3 (línea 164). Una exportación pública no prueba invocación efectiva por rutas de usuario.
qbv2-session.ts, lectura focal: importa QUESTION_BANK_V2 (línea 1), y bankOf(options) devuelve options?.bank ?? QUESTION_BANK_V2 (línea 75). Varias operaciones de sesión utilizan bankOf(options). Por tanto, el banco V2 es el predeterminado, mientras que un banco alternativo exige inyección explícita.

## Matriz de compatibilidad
| Concepto | Evidencia | Límite |
|---|---|
| Exportación pública | index.ts reexporta motor y sesiones | No implica ruta pública activa |
| Banco de sesión por defecto | QUESTION_BANK_V2 | No equivale al candidato V9 |
| Banco de sesión inyectado | options.bank | Requiere caller explícito y compatibilidad de respuestas |
| getQuestionBank(2) | Registro experimental QBV2 | No equivale a activar V9 |
| Sesión V3 | API de sesión | El número V3 no identifica por sí solo el banco V9 |

## Riesgo principal
Confundir versiones puede hacer que una sesión persistida se restaure frente a un banco diferente. La auditoría de compatibilidad de sesión documentada previamente requiere decisión explícita de versionado y migración, no reemplazo silencioso.

## Pendientes
1. Censar importadores concretos de index.ts y de las funciones de sesión en rutas públicas.
2. Verificar callers que pasen options.bank y separar tests/fixtures.
3. Mantener V8 activo mientras V9 está PLAN_ONLY.
4. Completar criterios de aceptación CLASS-02 sin declarar cobertura global.

## Changelog
0.1.0: exportaciones y selección de banco de sesión verificadas focalmente.