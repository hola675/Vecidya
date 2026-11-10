# F02 — Reensayo SQLite: idempotencia y claves externas entrantes

Fecha: 2026-11-05. SQLite 3.46.1 en memoria, script local `vecidya_0045_doble_aplicacion_y_dependencias.py`. NO Cloudflare D1, NO staging/prod.

## Evidencia ejecutada
1. Primera reconstrucción, una fila: PASS.
2. Segunda reconstrucción, una fila: finaliza sin error, pero NO demuestra idempotencia semántica.
3. Con tabla extension_event que tiene FK entrante a billing_miniweb_capacity_extension: falla `FOREIGN KEY constraint failed` al reconstruir; rollback restaura tabla y `PRAGMA foreign_key_check` no muestra errores.
4. Tras primera reconstrucción, cambiar organization_id de o1 a o2 y volver a ejecutar: la operación finaliza pero cambia o2 por o1. **FALLO DE IDEMPOTENCIA EN EL PROTOTIPO**, no en migración productiva. La asignación 'o1' está fijada artificialmente en el script.

## Impacto y decisiones
El prototipo anterior no se debe reutilizar como migración de producto sin corrección. Las pruebas de rollback y volumen previas siguen describiendo sus escenarios concretos, pero no prueban doble aplicación ni FK entrante. Antes de un diseño forward-only real: detectar esquema ya migrado, preservar asignaciones existentes, definir mapeo de organizaciones por fila, inspeccionar todas las FK entrantes, ejecutar prueba D1 local completa.

## Pendientes
- P-MIG-15: **FALLO CONFIRMADO EN PROTOTIPO** de doble aplicación; implementar protección y ensayar reintento seguro. No cerrar.
- P-MIG-12: **RIESGO CONFIRMADO EN PROTOTIPO** con FK entrante; inventariar dependencias reales antes de migrar. No afirmar que exista esa FK en el esquema real.
- P-MIG-17 (nuevo): diseñar detección de esquema y prueba de doble aplicación sin sobrescribir organization_id.
- P-MIG-18 (nuevo): inventariar FK entrantes reales y probar estrategia de reconstrucción compatible en D1.
- P-REG-13 (nuevo): enlazar esta evidencia y advertencia en documentación de prototipo y gates.
- P-REG-14 (nuevo): conservar script reproducible, verificar hashes/versión antes de publicar código.
- P-MIG-01..16 restantes y P-REG-01..12 permanecen según estados registrados; F08 NO-GO.

No se modificó código de producto ni bases remotas.
