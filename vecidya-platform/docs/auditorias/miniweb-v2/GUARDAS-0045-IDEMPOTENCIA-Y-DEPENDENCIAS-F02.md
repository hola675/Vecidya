# F02 — Guardas previas para 0045 (SQLite)

Fecha 2026-11-05. Ejecutado Python sqlite3 en memoria, sin D1. Script local: vecidya_0045_guardas_idempotencia.py.

Resultados verificados: 6/6 comprobaciones PASS: mapeo completo READY_FOR_DESIGN; mapeo incompleto BLOCK_MAPPING_INCOMPLETE; organización inexistente BLOCK_UNKNOWN_ORG; FK entrante sintética BLOCK_INCOMING_FK; esquema ya migrado SKIP_VALID; organización existente o2 preservada SKIP_VALID. Prueba adicional de datos ya migrados inválidos: BLOCK_INVALID_EXISTING.

Las guardas usan PRAGMA table_info y foreign_key_list. No reconstruyen tablas ni modifican datos. Son prototipo experimental, no implementación de D1. No suponen que exista FK entrante en producción.

P-MIG-17: guardas de doble aplicación ensayadas solo en SQLite, pendiente integrarlas con reconstrucción real y D1 local. P-MIG-18: detección de FK entrantes sintética ensayada; inventario real pendiente. P-MIG-19 NUEVO: diseñar y verificar algoritmo transaccional completo que respete guardas y dependencias. P-MIG-20 NUEVO: comprobar TOCTOU entre preflight y ejecución, especialmente bajo concurrencia D1. P-REG-15 NUEVO: sincronizar estos resultados con matriz F02 y bitácora y registrar script reproducible.

Todos los demás pendientes P-MIG-01..18, P-REG-01..14, P-CI-01..25 y P-F07-01..18 conservan sus estados, salvo avances parciales indicados. F08 NO-GO. Sin cambios de producto, staging ni producción.
