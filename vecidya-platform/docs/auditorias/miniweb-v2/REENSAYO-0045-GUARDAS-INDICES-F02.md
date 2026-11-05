# F02 — Falsos positivos de guardas por índices ausentes

Fecha: 2026-11-05. Python sqlite3 en memoria; scripts locales vecidya_0045_guardas_idempotencia.py y vecidya_0045_auditoria_guardas_indices.py. No D1.

## Resultados ejecutados
- Se volvió a ejecutar el script original de guardas: seis casos PASS y rechazo adicional de organización existente inválida.
- Caso índice UNIQUE de idempotencia eliminado después de migrar el prototipo: guard devuelve SKIP_VALID, aunque el índice billing_miniweb_capacity_extension_idempotency_unique ya no existe.
- Caso índice de consulta eliminado después de migrar el prototipo: guard devuelve SKIP_VALID, aunque el índice billing_miniweb_capacity_extension_account_idx ya no existe.
- Resultado: 2/2 falsos positivos de esquema válido reproducidos. No implica que estos índices falten en el esquema real.

## Diagnóstico
La guarda actual comprueba existencia de organization_id y validez de organizaciones, pero no compara el esquema completo: índices, unicidad, claves externas, tipos y constraints. SKIP_VALID no equivale a integridad del esquema ni a migración idempotente certificada.

## Pendientes
- P-MIG-21 NUEVO: inspeccionar PRAGMA index_list/index_info y sqlite_master; rechazar esquemas con índices requeridos ausentes o incompatibles.
- P-MIG-22 NUEVO: verificar todas las constraints, FKs, tipos y unicidad del esquema 0044/0045 real, no solo organization_id.
- P-MIG-17 permanece PARCIAL: la detección de esquema ya migrado no es suficientemente robusta.
- P-MIG-19 permanece ABIERTO: integrar guardas en algoritmo transaccional completo.
- P-REG-16 NUEVO: vincular estos falsos positivos con el índice, bitácora y matriz de pruebas F02.
- P-REG-17 NUEVO: registrar los scripts reproducibles con versión/hash y evaluar su incorporación al repo.
- P-MIG-01..20 y P-REG-01..15 mantienen estados anteriores, salvo los cambios expresos anteriores. P-CI-01..25, P-F07-01..18 y pruebas T-AUTH siguen pendientes según sus registros.

Gate F08 NO-GO. Sin cambios de producto, datos remotos ni despliegues.
