# F02 — Prueba genuina de restricción CHECK, 2026-11-05

## Ejecución
Script `vecidya_0045_test_check_real.py` ejecutado en Python sqlite3, sobre ZIP corregido V3 extraído en directorio temporal. Tras reconstrucción experimental, se añadió a `organization_id` una restricción real `CHECK (organization_id <> 'blocked')`; se restauraron los índices esperados y `PRAGMA foreign_key_check` devolvió cero incidencias.

Resultado: `strict_guard` V3 respondió `SKIP_VALID` pese a la nueva restricción. **Falso positivo de detección de deriva CHECK confirmado en prototipo SQLite.** No se ejecutó D1.

## Trazabilidad y alcance
La prueba anterior `extra_check` era en realidad un trigger; esta nueva prueba sí introduce CHECK. No se ha probado si la restricción CHECK es compatible con reglas de negocio; únicamente que V3 no detecta la diferencia. El script de esta prueba se conserva como artefacto local; pendiente revisión y versionado.

## Pendientes y estado
- P-MIG-32: **PARCIAL**. Fixture CHECK genuino ejecutado y falso positivo confirmado; falta implementar detección y regresión positiva/negativa.
- P-MIG-31: **PARCIAL**. Deriva CHECK demostrada; comparación integral de DDL pendiente.
- P-MIG-26: **PARCIAL**. CHECK y trigger examinados, pero defaults y acciones FK pendientes.
- P-REG-27: **PARCIAL**. Prueba CHECK genuina añadida; aún falta renombrar el fixture `extra_check` original en el ZIP.
- P-REG-29 NUEVO: incorporar el script de CHECK a GitHub con hash, ejecutar en CI y documentar entorno.
- P-MIG-34 NUEVO: definir política de aceptación de CHECK adicionales, equivalentes o incompatibles antes de certificar esquema.
- P-REG-26 permanece pendiente de conciliación en BITACORA.md.
- Se mantienen P-MIG-01..33, P-REG-01..28, P-CI-01..25, P-F07-01..18 y matrices T-AUTH/F02 según estados existentes.

F08 NO-GO. Sin cambios de producto, staging, producción o V1.
