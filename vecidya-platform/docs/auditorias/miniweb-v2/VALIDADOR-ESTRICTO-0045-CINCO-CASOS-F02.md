# F02 — Validador estricto de índices y columna 0045

Fecha: 2026-11-05. Ejecutado SQLite en memoria con scripts locales `vecidya_0045_guardas_esquema_estricto.py` y `vecidya_0045_test_guardas_esquema_estricto.py`. No D1.

## Casos ejecutados
1. Esquema experimental válido: SKIP_VALID, PASS.
2. Índice UNIQUE de idempotencia ausente: BLOCK_INDEX_MISSING, PASS.
3. Índice de cuenta/estado ausente: BLOCK_INDEX_MISSING, PASS.
4. Índice de cuenta/estado con columnas invertidas: BLOCK_INDEX_COLUMNS, PASS.
5. Índice de idempotencia sin UNIQUE: BLOCK_INDEX_UNIQUENESS, PASS.

Total 5/5 PASS para respuestas esperadas. La validación usa PRAGMA table_info, foreign_key_list, index_list, index_info y foreign_key_check. No cambia datos ni ejecuta reconstrucción.

## Alcance y límites
El validador verifica dos índices concretos, tipo y NOT NULL de organization_id y existencia de su FK. NO compara el DDL completo 0044/0045 ni todos los constraints, triggers, FKs, dependencias, collations, partial indexes o schema drift; no elimina TOCTOU ni prueba D1. Un esquema diferente podría superar estos controles.

## Pendientes
- P-MIG-21: PARCIAL, dos falsos positivos de índices ahora detectados; ampliar a todas las restricciones reales y D1.
- P-MIG-22: PARCIAL, FK y definición de columna comprobadas en prototipo; esquema real completo pendiente.
- P-MIG-23 NUEVO: verificar índices parciales, expresiones, collations y semántica de constraints contra el DDL real.
- P-MIG-24 NUEVO: integrar guardas y reconstrucción en una transacción y probar fallos intermedios y doble aplicación en D1 local.
- P-REG-18 NUEVO: publicar scripts verificados y añadir referencias cruzadas con matriz F02.
- P-REG-19 NUEVO: mantener tabla de cobertura de cada guarda, fixture y limitación, sin declarar cierre D1.

P-MIG-01..22, P-REG-01..17 y los rangos P-CI, P-F07 y T-AUTH siguen según estados previos. F08 NO-GO. Sin cambios en producto ni bases remotas.
