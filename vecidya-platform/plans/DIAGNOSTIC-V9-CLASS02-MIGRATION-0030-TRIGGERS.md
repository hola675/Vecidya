# V9 — CLASS-02: verificación documental de migración SQL 0030
Versión 0.1.0 · 2026-10-31 · PLAN_ONLY

## Fuente y alcance
vecidya-platform/db/migrations/0030_diagnostic_v9_audit.sql, blob 08fef3f330766a5b411d7dbfcadbb3371fc59cc9. Lectura estática, sin ejecutar SQL ni consultar D1 desplegada.

## Contrato confirmado
- diagnostic_v9_runs tiene PRIMARY KEY(workspace_id,run_id) y last_seq >= 0.
- diagnostic_v9_events exige seq > 0, payload JSON válido, schema_version positivo y actor_type permitido; PRIMARY KEY(workspace_id,run_id,seq), UNIQUE(workspace_id,event_id) y FOREIGN KEY hacia runs.
- diagnostic_v9_event_before_insert (líneas 69–78) comprueba existencia de run con last_seq = NEW.seq - 1; si no, RAISE(ABORT,'v9_sequence_conflict').
- diagnostic_v9_event_after_insert (líneas 81–87) actualiza last_seq del run.
- diagnostic_v9_event_before_update y diagnostic_v9_event_before_delete (líneas 89–98) abortan con v9_audit_immutable.
- Tablas separadas de snapshots, results y feedback con restricciones de clave y JSON donde aplica.

## Interpretación y límites
La migración contiene los triggers requeridos por appendDiagnosticEventV9. La inserción y el trigger de actualización forman parte de la operación SQL, de modo que el diseño pretende serializar secuencias concurrentes. Sin inspección de aplicación real de migraciones ni pruebas focales de concurrencia no se certifica atomicidad operativa o despliegue.

## Gates pendientes
1. Verificar estado de migración 0030 en entorno autorizado (no ejecutado).
2. Pruebas focales de dos escritores con mismo expectedSeq, retry idéntico y conflicto por payload (no ejecutadas).
3. Verificar integridad de snapshots y replay con stream completo (no ejecutadas).
4. Revisar migración 0031 para compatibilidad de identidad y propiedad.

## Changelog
0.1.0: dependencia de triggers 0030 resuelta documentalmente. CLASS-02 sigue PARCIAL/NO CERTIFICADA.