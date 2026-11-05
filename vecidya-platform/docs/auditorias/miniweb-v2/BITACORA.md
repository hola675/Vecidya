# Bitácora — auditoría MiniWeb V2

## 2026-11-05 — Apertura

- Creada rama documental separada de `main`.
- Inicializados registro de 12 hallazgos/gates, plan de verificación y estrategia de retirada V1.
- Inspeccionados `app/routes/miniweb-v2-editor.tsx`, `app/routes/api-miniweb-v2.ts`, `db/queries/miniweb-v2.server.ts`, `app/features/miniweb-v2/sections.ts`, `app/features/miniweb-v2/visual-families.ts` y documentación/PR de referencia.
- **No se ejecutaron pruebas** ni se reprodujeron defectos durante esta revisión de lectura.
- No se modificó código de aplicación, datos, infraestructura, despliegues ni rama `main`.

## Convención para nuevas entradas

Fecha · ID · fuente/archivo/línea o PR · observación · clasificación · impacto · reproducción · decisión · evidencia de cierre.

## 2026-11-05 — F01, primera pasada

- Leídos en `main` `app/routes.ts`, `app/routes/public-miniweb-v2.tsx`, `app/routes/api-public-miniweb-v2-media.ts` y `app/features/miniweb-v2/media.ts`.
- Enumerados archivos cambiados en PR #226, #229, #238 y #239 como **candidatos de inventario**, no como árbol exhaustivo.
- Registrada conexión de publicación pública y entrega de medios; identificada revocación por `isActive` y caché `no-store`.
- Creados MW2-013 y MW2-014. Total de registros: 14.
- F01 sigue EN CURSO: faltan referencias inversas, esquema completo, migraciones, CI y consumidores.
- Sin tests ejecutados, sin correcciones de producto, sin despliegues ni cambios en `main`.

## 2026-11-05 — Frente de integración continua

- Leídos `vecidya-platform/package.json` y `tests/unit/miniweb-v2-publication-query.test.ts` de main.
- Confirmado que el test de publicación usa un stub y no certifica transacción D1 real; añadido MW2-015, vinculado a MW2-001.
- Intentada localización de workflows `ci.yml` y `ci.yaml` sin resultados; añadido MW2-016, pendiente búsqueda más amplia.
- Creado `INTEGRACION-CONTINUA.md`. Total registros: 16.
- Sin pruebas ejecutadas ni cambios de producto o producción.

## 2026-11-05 — Reconciliación de segunda revisión CI

- Verificados `tests/e2e/miniweb-v2-conversion-check.mjs` (SHA d382616454dfbccc0188693657c20cf31eb44c13), `tests/e2e/run-local-e2e.mjs` (SHA 45e12dfc1408965ead844263a497b85c6660a8d8), `tests/unit/miniweb-v2-capacity.test.ts` y `db/queries/miniweb-v2.server.ts`.
- Rectificado alcance de MW2-015: sí existe prueba E2E local con D1/R2, concurrencia y matriz visual.
- Añadidos MW2-017 (runner general omite E2E V2) y MW2-018 (DEV remoto no certificado).
- Sin pruebas ejecutadas; sin cambios de código o producción. Total registros: 18.

## 2026-11-05 — F01-03 y localización de migraciones

- Leídos `db/schema/miniweb.ts`, `wrangler.jsonc`, `app/routes/sitemap.ts`.
- Registrados MW2-019 a MW2-022; MW2-022 resuelto únicamente respecto a localización de nombres.
- Localizados mediante PR #238 y leídos `db/migrations/0044_miniweb-capacity-extensions.sql` y `0045_miniweb-capacity-extension-org-scope.sql`.
- 0044 crea extensión de capacidad con FK de cuenta y usuario e índice único de idempotencia; 0045 agrega `organization_id` obligatorio con FK.
- Pendiente comprobar despliegue de migraciones y DDL de tablas V2, así como comportamiento con datos existentes al aplicar 0045.
- Total de IDs: 22. Sin pruebas ni despliegues ejecutados.

## 2026-11-05 — F01-04

- Leídas consultas `miniweb-v2.server.ts`, `licensing.server.ts` y migraciones reales 0044/0045.
- Registrados MW2-023 (migración NOT NULL), MW2-024 (alcance de ampliaciones) y MW2-025 (atomicidad lógica del lote), sin afirmar reproducción.
- Total IDs: 25. F01 y F06 abiertas. No se ejecutaron tests, migraciones ni deploys.
- Próximos pasos detallados en `REVISION-F01-04.md`.

## 2026-11-05 — F01-05: sincronización retrospectiva

- Inspeccionados journal D1 y migraciones 0034–0037; las tablas V2 y sus cambios históricos están documentados.
- Registrados MW2-026 (DDL base localizado), MW2-027 (política de suspensión de licencia por decidir) y MW2-028 (UX del selector inválido por verificar).
- Total 28 IDs; F01/F06 continúan abiertas. Ninguna prueba o migración ejecutada en esta revisión.
- La entrada independiente `BITACORA-F01-05.md` queda preservada como evidencia original.

## 2026-11-05 — Inicio de F02, matriz de fallos D1

- Revisadas `db/queries/miniweb-v2.server.ts` y `app/routes/api-miniweb-v2.ts`.
- Creado `MATRIZ-PRUEBAS-D1-F02.md` con 16 escenarios: publicación (7), guardado (4), creación (2), migración (3).
- Registrados MW2-029 y MW2-030; total 30 IDs. No hay ejecución ni PASS declarado.
- F01 y F06 continúan abiertas; F02 comienza como investigación/documentación, no certificación.

## 2026-11-05 — F06: revisión de cobertura E2E visual

- Inspeccionado tramo final de `tests/e2e/miniweb-v2-conversion-check.mjs`; matriz 5 familias × 3 variantes × 3 viewports = 45 capturas previstas.
- Documentada diferencia entre fixtures SQL, pruebas de API, imágenes reales y certificación de accesibilidad.
- Registrados MW2-031 a MW2-034; total 34 IDs. Pendientes P-CI-16 a P-CI-20 añadidos.
- Ver `REVISION-E2E-VISUAL-F06.md`. Ninguna captura o prueba se ejecutó aquí.

## 2026-11-05 — F06: HEAD de main y comprobación CI

- Identificado HEAD de main `4cf1872efaf9a8c81c297a37f41d86796bab5d58` (merge #239).
- Estados combinados de ese SHA: `statuses=[]`; no se infiere ausencia de check runs ni workflows.
- Comprobadas seis rutas convencionales de workflows sin coincidencia. Inventario de directorio y branch protection aún pendiente.
- Creado `REVISION-CI-HEAD-F06.md`. Sin pruebas ni cambios de código.

## 2026-11-05 — F02: primer ensayo ejecutado (SQLite local)

- Ejecutados dos casos en SQLite en memoria, esquema equivalente a 0044 y ALTER literal de 0045, `foreign_keys=ON`.
- Tabla vacía: PASS; tabla con fila preexistente: FAIL, `Cannot add a NOT NULL column with default value NULL`.
- MW2-023 pasa a incompatibilidad reproducida localmente bajo condición de datos previos; no extrapolar a estado remoto.
- Ver `REPRODUCCION-SQLITE-MIGRACION-0045.md`. Sin cambios en DB remotas ni producto.

## 2026-11-05 — F07: mapa de rutas y cutover

- Leídos `app/routes.ts`, editores V1/V2, API V2, publicación y media V2, sitemap.
- Confirmadas rutas V1/V2 separadas; conversión V1→V2 voluntaria y V1 preservada.
- Creado `MAPA-RUTAS-Y-CORTE-F07.md` con 10 pendientes P-F07-01..10.
- Registrados MW2-035 y MW2-036; total 36 IDs. F07 iniciada como auditoría, sin migración ni retirada.

## 2026-11-05 — F07/F06: permisos y paneles administrativos

- Inspeccionadas API V1/V2, editores V1/V2, panel interno de organización, ruta pública y media V2.
- Creado `MATRIZ-PERMISOS-V1-V2-F07.md` con 10 pruebas T-AUTH-01..10 y 5 controles P-F07-11..15.
- Registrados MW2-037..039; total 39 IDs.
- No se han ejecutado peticiones autenticadas, pruebas ni despliegues; autorización real y roles aún pendientes.

## 2026-11-05 — F07: cierre estático de MW2-038

- Leídos authorization.server.ts, session.server.ts y platform-authorization.server.ts.
- Matriz owner/admin/member coincide con botones V2 y permisos API; MW2-038 resuelto en revisión estática, sin ejecución de T-AUTH-03.
- Diferenciadas suspensión de organización (lifecycle 403) y licencia comercial (MW2-027 abierto).
- Creado `REVISION-ROLES-AUTORIZACION-F07.md`; P-F07-16..18 registrados. Total 39 IDs históricos, no 39 defectos abiertos.

## 2026-11-05 — Sincronización de índice y plan maestro

- README.md actualizado con enlaces a diez documentos de auditoría y evidencias.
- PLAN-MAESTRO.md actualizado con referencias cruzadas y separación explícita SQLite/D1.
- P-REG-06: completado en README y PLAN-MAESTRO.
- P-REG-01..05 y P-REG-07..09 permanecen abiertos; HALLAZGOS.md y CI-PENDIENTES-Y-ESTADO.md aún necesitan sincronización.
- Ningún test D1 ni despliegue ejecutado en esta revisión. F08 NO-GO.

## 2026-11-05 — Corrección de estados canónicos

- HALLAZGOS.md: MW2-038 ahora RESUELTO EN INSPECCIÓN ESTÁTICA; T-AUTH-03 pendiente.
- CI-PENDIENTES-Y-ESTADO.md: encabezado corregido a MW2-001..039; ensayos SQLite documentados, sin D1 ejecutado.
- P-REG-02 y P-REG-05: COMPLETADOS en documentos canónicos. P-REG-01: conciliación parcial, falta comprobar restantes evidencias. P-REG-11: parcial, pendiente verificar otras adendas y tablas.
- Sin cambios en código de aplicación, bases remotas o despliegues. F08 NO-GO.

## 2026-11-05 — Guardas previas de 0045 (F02)

- Ejecutadas seis verificaciones PASS en SQLite 3.46.1 en memoria; adicionalmente se rechazó un organization_id existente inválido.
- Detectan mapeo incompleto, organización inexistente, FK entrante sintética, esquema ya migrado y preservan asignación previa. No ejecutan reconstrucción ni D1.
- Evidencia GUARDAS-0045-IDEMPOTENCIA-Y-DEPENDENCIAS-F02.md; script local vecidya_0045_guardas_idempotencia.py.
- P-MIG-17/18: avances parciales; P-MIG-19/20 y P-REG-15 nuevos pendientes. F08 NO-GO.

## 2026-11-05 — Reensayo de guardas: índices ausentes

- Reejecutado script original de guardas SQLite: resultados esperados confirmados.
- Dos escenarios adicionales: eliminar índice UNIQUE de idempotencia o índice de consulta; guard devolvió SKIP_VALID en ambos, pese a faltar índices. Falsos positivos confirmados en prototipo, no en D1.
- Evidencia REENSAYO-0045-GUARDAS-INDICES-F02.md y script local vecidya_0045_auditoria_guardas_indices.py.
- Nuevos pendientes P-MIG-21/22 y P-REG-16/17; P-MIG-17/19 permanecen parciales/abiertos. F08 NO-GO.

## 2026-11-05 — Reensayo de índice parcial

- Validador estricto original: índice parcial con nombre/columnas correctos devolvió SKIP_VALID (falso positivo); índice de expresión fue bloqueado.
- Variante v2 local: detecta índice parcial con PRAGMA index_list; ambos escenarios bloqueados (2/2). No D1.
- Evidencia REENSAYO-0045-INDICES-PARCIALES-Y-EXPRESIONES-F02.md; scripts locales v2 y test de deriva.
- P-MIG-23 parcial; nuevos P-MIG-25/26 y P-REG-20/21. F08 NO-GO.
