# F06 — Integración continua y cobertura inicial

Fecha: 2026-11-05 | Estado: EN CURSO | Inspección de main, sin ejecución de pruebas.

## Contratos de comandos confirmados

`vecidya-platform/package.json` versión 0.9.2 define:
- `pnpm typecheck` → `react-router typegen && tsc -b`
- `pnpm build` → `react-router build`
- `pnpm test:unit` → Node test con registro TypeScript
- `pnpm test:e2e:miniweb-v2-conversion` → conversión V1→V2
- `pnpm test:e2e` → runner local general
- `pnpm test:e2e:app-dashboard-redesign` y `pnpm test:e2e:react-418`

**No está demostrado** que esos scripts se ejecuten automáticamente en CI. Las rutas `.github/workflows/ci.yml` y `.github/workflows/ci.yaml` no existen; falta localizar otros workflows, acciones o checks.

## Hallazgo MW2-015 — Prueba de publicación basada en stub (P1, COBERTURA)

Archivo `tests/unit/miniweb-v2-publication-query.test.ts`:
- `createD1Stub(changeBatches)` devuelve resultados `meta.changes` preprogramados, no ejecuta SQL ni transacciones D1.
- El test cubre secuencia `[1,1,1]` seguida de `[0,0,0]`, valida SQL de snapshot y conflicto en revisión repetida.
- No prueba escenario `[1,0,0]` contra D1 real, persistencia de slot, concurrencia o rollback.

**No es un defecto confirmado de implementación.** Es una limitación demostrada de esta prueba particular. Vinculado a MW2-001.

Cierre: test de integración con D1 local real, antes/después de slots/snapshots/punteros; escenarios error parcial, reintento y carreras. Verificar otras pruebas antes de concluir cobertura global ausente.

## Hallazgo MW2-016 — Configuración CI no identificada (P1, INVENTARIO)

No se encontraron los nombres convencionales `.github/workflows/ci.yml` ni `ci.yaml`. Esto **no demuestra ausencia de CI**: buscar workflows con otros nombres, branch protection y checks del commit.

Cierre: inventario de pipelines, triggers, matrices Node/pnpm, permisos, secrets, checks obligatorios, cache, artefactos y despliegue protegido.

## Siguiente secuencia

1. Localizar workflows y checks del último commit main.
2. Leer `tests/e2e/miniweb-v2-conversion-check.mjs` y `tests/unit/miniweb-v2-capacity.test.ts`.
3. Mapear test→invariante→entorno→gate.
4. Diseñar matriz de fallos reales D1, media R2, permisos y URLs.
5. Mantener CI sin despliegue automático a producción hasta aprobación.
