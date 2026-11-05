# Estado ejecutivo y backlog consolidado — 2026-11-05

Rama: docs/miniweb-v2-auditoria-perfeccionista. Alcance: MiniWeb V2. Estado de release: NO-GO.

## Estado por fase
F01 inventario PARCIAL; F02 D1 y migraciones PARCIAL/BLOQUEANTE; F03 editor UX NO CERTIFICADO; F04 R2 NO CERTIFICADO; F05 web pública SEO NO CERTIFICADO; F06 seguridad CI PARCIAL; F07 migración V1/V2 PARCIAL; F08 cutover y retirada V1 BLOQUEADO.

## Evidencia consolidada
- HALLAZGOS.md contiene MW2-001..039; 39 identificadores históricos no equivalen a 39 defectos abiertos.
- MW2-038 equivalencia de roles owner/admin/member resuelta por lectura de authorization.server.ts; pruebas HTTP siguen pendientes.
- MW2-023 migración 0045: ALTER añade organization_id NOT NULL sin backfill. Ensayos SQLite de tabla poblada fallan; NO evidencia de fallo en D1 remoto.
- REPRODUCCION-SQLITE-MIGRACION-0045.md: 2 casos.
- ENSAYO-SQLITE-0045-SEIS-CASOS.md: 6 escenarios SQLite.
- ENSAYO-RECONSTRUCCION-0045-F02.md: prototipo SQLite con rechazo de asignaciones inválidas.
- ROLLBACK-0045-SEIS-INYECCIONES-F02.md: 6 fallos inyectados en prototipo.
- REINTENTOS-Y-VOLUMEN-0045-F02.md: reintento y volumen hasta 10000 filas en SQLite en memoria. No extrapolar tiempos a D1.
- PLAN-MAESTRO.md exige pruebas de invariantes, paridad, backup/restore, staging, aceptación y cero consumidores V1 antes de retiro.

## Prioridad inmediata, secuencia y gates
1. P-MIG-01: ejecutar 0044→0045 en Cloudflare D1 LOCAL con tabla vacía/poblada y evidencias reproducibles. No tocar remoto.
2. P-MIG-12: verificar esquema real completo, índices, triggers y referencias entrantes antes de reconstrucción.
3. P-MIG-03/P-MIG-07: definir y probar asignación por organización y semántica de cupos para titulares multi-organización.
4. P-MIG-04/P-MIG-06/P-MIG-11/P-MIG-13/P-MIG-15/P-MIG-16: diseñar corrección forward-only y ensayar FK, idempotencia, rollback, reintentos y concurrencia en D1 local.
5. P-MIG-14: repetir volumen y medir límites en D1, no reutilizar métricas SQLite.
6. P-MIG-02/P-MIG-09: comprobar migraciones y cardinalidad de staging/prod solo con autorización y consultas de lectura.
7. P-MIG-05/P-MIG-08/P-MIG-10: validar backup/restore, responsable GO/NO-GO y cierre con evidencia.

## Backlog íntegro por familias (NO cerrar sin pruebas)
- P-MIG-01..16: migración 0045; ensayos SQLite parciales en 04, 11, 13, 14; el resto pendiente.
- P-F07-01..18: consumidores, paridad, conversiones, navegación, panel interno, permisos, suspensión y cambios de rol; 12 mapeo estático parcial; 16..18 siguen pendientes.
- T-AUTH-01..10: matriz de pruebas autenticadas, NO EJECUTADAS.
- P-CI-01..25: checks, workflows, D1, capturas, seguridad, migración y staging; varias revisiones estáticas parciales, no equivalen a certificación.
- P-REG-01..04: reconciliar HALLAZGOS.md, CI-PENDIENTES-Y-ESTADO.md, BITACORA.md y evidencias/scripts de SQLite. Esta consolidación NO sustituye su sincronización.
- T-PUB-01..07, T-SAVE-01..04, T-CREATE-01..02, T-MIG-01..03: matriz F02; no declarar ejecutados en D1. Los ensayos SQLite son separados.
- MW2-001..039: consultar estados individuales en HALLAZGOS.md; no asignar cierres masivos.

## Nuevos pendientes de consistencia
P-REG-05: actualizar encabezado obsoleto de CI-PENDIENTES-Y-ESTADO.md (dice MW2-001..018 y sin pruebas ejecutadas) para distinguir pruebas SQLite posteriores de tests D1 no ejecutados.
P-REG-06: añadir índice cruzado de todos los documentos de evidencia a README/PLAN-MAESTRO.
P-REG-07: verificar que cada prueba y hallazgo tenga responsable, SHA, entorno, evidencia y criterio de cierre.
P-REG-08: reconciliar las etiquetas PASS de ensayos SQLite con gates D1 y evitar conclusiones de certificación.
P-REG-09: verificar scripts locales referidos por documentación y publicar solo si se inspeccionan y aprueban; no asumir que están en GitHub.

## Límites y seguridad
No se modificó código de producto, main, staging ni producción. No se ejecutó D1 en esta revisión. V1 no se elimina ni redirige. Cualquier cambio a migraciones o datos requiere revisión, prueba y aprobación explícita.

## Actualización de sincronización 2026-11-05

- P-REG-02: COMPLETADO, MW2-038 corregido en HALLAZGOS.md y aclarado en CI-PENDIENTES-Y-ESTADO.md. T-AUTH-03 NO ejecutada.
- P-REG-05: COMPLETADO, encabezado CI normalizado a MW2-001..039 y evidencia SQLite distinguida de D1.
- P-REG-06: COMPLETADO, README y PLAN-MAESTRO indexados.
- P-REG-01: PARCIAL, quedan conciliaciones de evidencias y pendientes.
- P-REG-03/04 y P-REG-07..11: abiertos o parciales; verificar cada fuente antes de cerrar.
- Nuevo P-REG-12: revisar que el estado MW2-038 sea consistente en la tabla resumen, descripción detallada y documentos secundarios, sin convertir cierre estático en prueba dinámica.
- Gate F08 NO-GO; D1 local y pruebas de publicación todavía pendientes.

## Reensayo F02 — idempotencia y FK entrantes

Evidencia: REENSAYO-0045-IDEMPOTENCIA-FK-ENTRANTE.md. El prototipo SQLite permite segunda ejecución pero puede sobrescribir organization_id de o2 a o1; una FK entrante sintética bloquea la reconstrucción y rollback conserva datos. No afirmar existencia de FK entrante real ni fallo D1. P-MIG-15 y P-MIG-12 elevados en prioridad de revisión; nuevos P-MIG-17, P-MIG-18, P-REG-13, P-REG-14 abiertos. Los ensayos anteriores no certifican doble aplicación. F08 NO-GO.

## F02 — Reensayo de índices 0045

Ver REENSAYO-0045-GUARDAS-INDICES-F02.md: dos falsos positivos SKIP_VALID en prototipo SQLite si faltan índices; no demuestra fallo D1. P-MIG-21/22 y P-REG-16/17 nuevos. P-MIG-17/19 no cerrados. Actualizar rango de seguimiento a P-MIG-01..22 y P-REG-01..17, conservando estados individuales y sin cierre masivo. F08 NO-GO.

## F02 — Validador estricto 0045

VALIDADOR-ESTRICTO-0045-CINCO-CASOS-F02.md registra 5/5 pruebas SQLite del prototipo (índices ausentes, columnas invertidas, UNIQUE perdido y esquema válido). P-MIG-21/22 PARCIALES; nuevos P-MIG-23/24 y P-REG-18/19 abiertos. Rangos de seguimiento ahora P-MIG-01..24 y P-REG-01..19; no cerrar tareas anteriores automáticamente. No hay pruebas D1 ni release autorizado. F08 NO-GO.
