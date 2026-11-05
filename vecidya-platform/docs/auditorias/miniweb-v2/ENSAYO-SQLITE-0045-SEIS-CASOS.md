# Ensayo SQLite 0045 — seis escenarios

Fecha: 2026-11-05. SQLite 3.46.1 en memoria, sin D1.

Se aplicó el ALTER de 0045 a una tabla equivalente a 0044 con 0, 1 y 3 filas, tanto con claves externas activas como desactivadas.

| Filas | FK OFF | FK ON |
|---|---|---|
| 0 | PASS | PASS |
| 1 | FAIL | FAIL |
| 3 | FAIL | FAIL |

El error en los cuatro casos poblados fue: Cannot add a NOT NULL column with default value NULL.

Pendientes: D1 local, historial remoto autorizado, migración correctiva en copia, backup, integridad, regla multi-organización y gate de release. No se modificó el producto.
