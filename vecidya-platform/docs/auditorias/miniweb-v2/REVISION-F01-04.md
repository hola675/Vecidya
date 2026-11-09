# F01-04 — Invariantes de publicación y licencias

Fecha 2026-11-05. Estado F01/F06: EN CURSO. Solo lectura de main; sin pruebas ni cambios de producto.

Fuentes: db/queries/miniweb-v2.server.ts (SHA 130a4a7f6054b177543426655f723f43c047dff1), db/queries/licensing.server.ts (SHA dad9124950ff06b04aedb9ded33096c73351346d), migraciones 0044 y 0045.

## MW2-023 — Validar upgrade 0045 con datos existentes (P1, gate de migración)
0044 crea billing_miniweb_capacity_extension sin organization_id; 0045 añade organization_id text NOT NULL REFERENCES organization(id), sin DEFAULT ni backfill visible en esas dos migraciones. En SQLite, agregar NOT NULL sin default a una tabla no vacía puede fallar. No afirmar que producción tenga filas ni que la migración fallara: comprobar historia real y simular migración desde estado previo poblado y vacío en copia local. No tocar remoto.

## MW2-024 — Alcance de ampliaciones por titular y organización (P1, decisión de negocio)
grantMiniWebCapacityExtension exige organizationId y licencia activa de esa organización; getMiniWebV2PublicationCapacity y publishMiniWebV2Draft cuentan extensiones activas unidas por billingAccount.ownerUserId, sin filtrar organizationId. Puede ser política deliberada de cupos agregados por titular; documentar regla y probar escenarios de varias organizaciones bajo un mismo titular, transferencias y cancelaciones. No etiquetar bug sin política confirmada.

## MW2-025 — Resultado de lote no implica rollback de cero filas (P0, investigación ligada a MW2-001)
publishMiniWebV2Draft hace batch de reserva de slot, inserción snapshot y actualización puntero; si snapshot o puntero afectan 0 filas, el método detecta fallo DESPUÉS del batch y devuelve conflicto/capacidad. Verificar en D1 real si un slot nuevo queda reservado en caso [1,0,0] o [1,1,0]. Batch transaccional ante error SQL no implica automáticamente rollback cuando una sentencia simplemente afecta 0 filas. La prueba debe comprobar antes/después de todas las tablas, idempotencia y reintento. No se ha reproducido.

## Próximos pasos obligatorios
1. Preparar matriz de estados D1 y prueba local de fallo parcial sin alterar main.
2. Comprobar migración 0045 con tabla de extensiones vacía y poblada.
3. Aclarar política de cupos globales por titular frente a extensiones ligadas a organización.
4. Localizar workflows/checks y exigir test E2E V2 en gate.
5. Sincronizar hallazgos y bitácora; mantener MW2-001 y MW2-007 abiertos.
6. Auditar cambios de titular y links V1/V2, SEO, media, accesibilidad.
