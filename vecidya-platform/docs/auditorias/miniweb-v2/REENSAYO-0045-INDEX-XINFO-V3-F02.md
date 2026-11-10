# F02 — Reensayo index_xinfo en validador V3 (2026-11-05)

## Ejecución real
Python sqlite3 en memoria, script `vecidya_0045_test_index_xinfo.py` y validador `vecidya_0045_guardas_esquema_estricto_v3.py`. Cinco escenarios con aserciones: base SKIP_VALID, índice DESC bloqueado, índice COLLATE NOCASE bloqueado, índice parcial bloqueado, índice de expresión bloqueado. **5/5 PASS**.

Comparación: V2 devolvió SKIP_VALID incorrectamente en los escenarios DESC y NOCASE. V3 usa PRAGMA index_xinfo para exigir claves en orden esperado, ASC y COLLATE BINARY, además de los controles previos. Esta es una regla experimental basada en el índice 0044, no un contrato aprobado para cualquier índice futuro.

## Límites
No se ejecutó D1 local/remoto ni reconstrucción; no se verificaron defaults, CHECK, triggers, FK ON DELETE/UPDATE, esquema integral, concurrencia, backups o rollback de producción. No modificar migración 0045 de producto a partir de este prototipo sin revisión.

## Registro de pendientes
- P-MIG-25: PARCIAL, cobertura experimental de DESC y NOCASE; falta comparación integral del DDL y D1.
- P-MIG-27 NUEVO: añadir pruebas de collation/orden de todos los índices del esquema real y compatibilidad con D1.
- P-MIG-28 NUEVO: validar semántica de índices en cambios futuros del esquema para evitar reglas codificadas desactualizadas.
- P-REG-22 NUEVO: incorporar scripts V3 y prueba a repositorio, con hash/versionado y comando reproducible.
- P-REG-23 NUEVO: actualizar matriz F02 y criterios de cierre de P-MIG-25 sin confundir SQLite con D1.
- P-MIG-01..26, P-REG-01..21 y todos los P-CI/P-F07/T-AUTH anteriores mantienen su estado salvo avance parcial explícito.
- Gate F08 NO-GO.
