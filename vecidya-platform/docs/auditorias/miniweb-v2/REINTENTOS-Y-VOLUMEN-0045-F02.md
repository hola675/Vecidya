# F02 — Reintentos y volumen SQLite 0045

Fecha: 2026-11-05. Ejecución local Python sqlite3 en memoria; no D1.

Se inyectó un fallo tras renombrar la tabla y eliminar índices, se ejecutó rollback y se reintentó la reconstrucción transaccional. Cuatro escenarios: 0 filas PASS (0.0016 s); 100 PASS (0.0014 s); 1000 PASS (0.0035 s); 10000 PASS (0.0264 s). Se verificaron recuento final, columna organization_id y PRAGMA foreign_key_check sin errores.

La asignación de organización se fijó artificialmente a o1 en todos los casos: NO valida mapeos reales multi-organización. Los tiempos de SQLite en memoria no son tiempos de D1, y el ensayo no incluye cortes de proceso, concurrencia ni cargas reales.

P-MIG-13: reintento SQLite parcial completado, D1 y fallo real de proceso pendientes. P-MIG-14: volumen SQLite hasta 10000 filas parcial completado; D1, memoria, locks y límites pendientes. P-MIG-01..12, P-REG-01..04 permanecen sin certificación. Nuevo P-MIG-15: verificar reintentos tras fallo de proceso y doble aplicación. Nuevo P-MIG-16: verificar locks y consultas concurrentes en D1 local. Gate F08 NO-GO.

Script reproducible local: vecidya_0045_reintentos_volumen.py. No se modificó código del producto ni bases remotas.
