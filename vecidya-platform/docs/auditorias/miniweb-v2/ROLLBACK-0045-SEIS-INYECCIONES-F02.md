# F02 — Inyección de fallos de reconstrucción 0045

2026-11-05. SQLite 3.46.1 en memoria; no D1.

Se ejecutaron seis fallos controlados después de renombrar tabla, eliminar índices, crear tabla, copiar datos, eliminar tabla anterior y recrear índices. Los seis escenarios pasaron: rollback recuperó tres filas, esquema e índices originales, sin tabla residual ni errores FK.

P-MIG-11: completado únicamente para excepciones SQLite; D1 y cortes de proceso pendientes. Nuevos pendientes P-MIG-13 (reintentos) y P-MIG-14 (volumen y tiempos). P-MIG-01..10 y P-MIG-12 continúan abiertos. Sin modificación de producto. Ver script local vecidya_0045_inyeccion_fallos.py y reporte Vecidya-REPORTE-ROLLBACK-0045-F02.md. Gate F08 NO-GO.
