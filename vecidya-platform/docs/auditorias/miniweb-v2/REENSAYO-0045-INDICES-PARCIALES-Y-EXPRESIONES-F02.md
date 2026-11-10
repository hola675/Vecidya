# F02 — Deriva de índices parciales y expresiones en validador 0045

Fecha: 2026-11-05. SQLite en memoria; sin Cloudflare D1 ni modificación de producto.

## Ejecución verificada
Se volvió a ejecutar el validador estricto original (5/5 casos esperados). Después se construyeron dos variantes del índice billing_miniweb_capacity_extension_account_idx, manteniendo el nombre:
- Índice parcial WHERE status='active': validador original respondió SKIP_VALID, **falso positivo reproducido**.
- Índice de expresión sobre lower(status): validador original respondió BLOCK_INDEX_COLUMNS, **bloqueo correcto**.

Se creó una variante local `vecidya_0045_guardas_esquema_estricto_v2.py` que revisa el indicador partial de PRAGMA index_list. Reensayo de ambos escenarios: índice parcial BLOCK_PARTIAL_INDEX; índice de expresión BLOCK_INDEX_COLUMNS. **2/2 bloqueos esperados**. Script de prueba local `vecidya_0045_test_deriva_esquema.py`. No se ha ejecutado comparación exhaustiva del DDL.

## Alcance y riesgos
La variante v2 solo corrige este falso positivo conocido. No comprueba collations, índices de expresión semánticamente equivalentes, condiciones CHECK, defaults, triggers, acciones FK, afinidad completa, concurrencia ni D1. La variante no debe utilizarse como migración productiva.

## Pendientes
- P-MIG-23 PARCIAL: caso índice parcial detectado en v2; collations, constraints y DDL completo pendientes.
- P-MIG-25 NUEVO: comprobar collations y orden ASC/DESC, expresiones, condiciones WHERE y metadatos de índices usando index_xinfo y sqlite_master.
- P-MIG-26 NUEVO: construir fixtures negativos para defaults, CHECK, acciones FK y triggers, y contrastar contra migraciones reales.
- P-REG-20 NUEVO: conservar scripts v2 y pruebas con hash, incorporarlos al repositorio si se aprueba.
- P-REG-21 NUEVO: revisar informes anteriores que usen SKIP_VALID como sinónimo de esquema íntegro y corregir sus conclusiones.
- P-MIG-01..24, P-REG-01..19 y restantes matrices mantienen su estado salvo avances expresos. F08 NO-GO.

No se realizaron pruebas D1, cambios remotos ni despliegues.
