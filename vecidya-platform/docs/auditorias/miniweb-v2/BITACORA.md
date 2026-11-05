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
