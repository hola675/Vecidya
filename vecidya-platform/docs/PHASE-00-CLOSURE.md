# Fase 00 — Matriz de cierre y certificación

Fecha: 2026-10-18. **Estado: NO CERTIFICADA**. Los PASS históricos no sustituyen las pruebas sobre la rama integrada.

| Gate | Criterio | Evidencia requerida | Estado |
| --- | --- | --- | --- |
| G00-01 | Reconciliar `main` y ramas activas sin conflictos ni pérdida de cambios | Diff y SHA final | COMPLETADO — `393415d51acc3dda37cd43940bec741325ae866b`; comparación `behind=0`, PR #11 mergeable |
| G00-02 | Instalación `pnpm install --frozen-lockfile` | Log CI | SIN EVIDENCIA |
| G00-03 | Unitarias completas PASS | Log CI | SIN EVIDENCIA |
| G00-04 | Typecheck y build PASS | Logs CI | SIN EVIDENCIA |
| G00-05 | Migraciones 0000–0019 en D1 local aislada | Ledger y logs | SIN EVIDENCIA |
| G00-06 | E2E 01C.3 y 01B, concurrencia, recovery y cleanup | Logs Worker/E2E | SIN EVIDENCIA |
| G00-07 | Agregados históricos conservados sin identidad | Sentinel SQL y unitarias | SIN EVIDENCIA |
| G00-08 | Rutas dev-only inaccesibles en producción | Preview Worker y bundle scan | SIN EVIDENCIA |
| G00-09 | Regresión cuentas, permisos, MiniWeb 02A, Vecindario y licencias | E2E y capturas | PENDIENTE |
| G00-10 | Documentación, rollback y PR revisados | Diff y revisión | PENDIENTE |

## Orden de trabajo

1. Consultar resultados reales del workflow `.github/workflows/diagnostic-funnel-01d1.yml` y corregir fallos comprobados. Este workflow **no** certifica MiniWeb ni toda la plataforma.
2. Reconciliación Git completada en `393415d`; repetir pruebas y recopilar logs sobre el SHA integrado final.
3. Completar E2E transversales, aislamiento tenant y validación visual desktop/mobile.
4. Registrar evidencia con SHA, fecha, logs y excepciones aprobadas; actualizar `STATUS.md`, `PROJECT_STATE.md`, `ROADMAP.md` y `TESTING.md`.
5. Revisar PR, rollback y aprobar cierre solo cuando los diez gates estén acreditados.

## Exclusiones y seguridad

No iniciar APP-MINI-02B, activar el motor candidato, correo real, GHL o limpiar legacy por el mero cierre de esta fase. No ejecutar `wrangler deploy`, D1 `--remote`, borrados globales ni merge a `main` sin autorización explícita. La aprobación legal de retención y derechos sigue siendo necesaria antes de operar con datos reales.

**Criterio final:** Fase 00 CERTIFICADA solo con evidencia reproducible de todos los gates en una misma revisión integrada.

## Evidencia de reconciliación (2026-10-18)

- PR: https://github.com/hola675/Vecidya/pull/11
- Commit merge de dos padres: `393415d51acc3dda37cd43940bec741325ae866b`, con padres `72787285e2b8953d3c0fe0fb3df298bdd5cf8a6c` y `18de1be2ba52c02c434ba51d0fa8576ffeca185c`.
- Comparación posterior `main...integration/phase-00-main-reconcile`: `ahead=143`, `behind=0` y GitHub `mergeable=true`.
- CI iniciada para este SHA: Vecidya CI (`39134952449`), DIAG-V3 FUNNEL-01D.1 (`39134952345`) y Vecidya Licensing and Vecindario CI (`39134952412`). En el momento del registro siguen en progreso: **no hay PASS certificados**.
- G00-01 acredita reconciliación de historial y revisión previa de 17 archivos afectados; no implica certificación de G00-02 a G00-10.
