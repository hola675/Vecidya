# F02 — Reproducción SQLite de migración 0045

Fecha 2026-11-05. Estado: **reproducido localmente en SQLite; no ejecutado en D1**.

## Fuentes
- `db/migrations/0044_miniweb-capacity-extensions.sql` SHA 584deed8049398479f71e5212983f3c4dcc5c6fc.
- `db/migrations/0045_miniweb-capacity-extension-org-scope.sql` SHA 450e4a68a0f2f9fe533915e6b2c732feeac0cf25.

## Método
Python sqlite3, DB en memoria, `PRAGMA foreign_keys=ON`. Se crearon tablas mínimas de referencia billing_account, user y organization, y tabla de extensiones mediante DDL equivalente al 0044, con índices. Se ejecutó literalmente el ALTER de 0045: `ALTER TABLE billing_miniweb_capacity_extension ADD organization_id text NOT NULL REFERENCES organization(id);`.

- Caso A, tabla vacía: PASS; columna añadida con NOT NULL.
- Caso B, una extensión preexistente: FAIL, error `Cannot add a NOT NULL column with default value NULL`.

**Alcance**: el resultado demuestra comportamiento de SQLite en estos fixtures, no certifica comportamiento de Cloudflare D1 remoto ni existencia de datos previos. No se aplicó ningún cambio al repositorio principal o DB remota.

## Actualización MW2-023
Subir de riesgo teórico a **incompatibilidad reproducida en SQLite con tabla poblada**. Mantener P1 bloqueante de migración hasta demostrar que despliegues existentes estaban vacíos, o preparar y ensayar una migración segura con backfill por organización antes de NOT NULL, verificando multi-organización, FKs, idempotencia y rollback.

## Pendientes
- P-CI-05 / T-MIG-02: repetir con motor D1 local y datos representativos, guardando logs y SHA.
- Comprobar migraciones aplicadas en staging/prod con acceso autorizado, sin alterar datos.
- Evaluar estrategia de reconstrucción de tabla SQLite o transición nullable→backfill→NOT NULL; no aplicar sin revisión.
- Probar casos de cuentas con varias organizaciones y la semántica de `organization_id`.
- Registrar en matriz de release y mantener F02 abierta.
