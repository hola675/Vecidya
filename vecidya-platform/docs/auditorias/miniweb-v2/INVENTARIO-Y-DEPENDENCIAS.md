# F01 — Inventario inicial y mapa de conexiones

Fecha: 2026-11-05 | Estado: EN CURSO | Evidencia: lectura directa de main, archivos y PR #226/#229/#238/#239.
**Cobertura parcial:** los archivos listados son los identificados, no el árbol completo ni un inventario exhaustivo. No se han ejecutado tests.

## Entradas confirmadas en app/routes.ts

| Área | URL | Módulo |
| --- | --- | --- |
| Editor V1 | /app/miniweb | app/routes/miniweb-editor.tsx |
| Editor V2 | /app/miniweb-v2 | app/routes/miniweb-v2-editor.tsx |
| API V1 configuración | /api/organizations/:organizationId/miniweb-config | app/routes/api-miniweb-config.ts |
| API V2 | /api/organizations/:organizationId/miniweb-v2 | app/routes/api-miniweb-v2.ts |
| Perfil negocio | /app/business-profile | app/routes/business-profile.tsx |
| API perfil | /api/organizations/:organizationId/business-profile | app/routes/api-business-profile.ts |
| Media organización | /api/organizations/:organizationId/business-media | app/routes/api-organization-business-media.ts |
| Media asset | /api/organizations/:organizationId/business-media/:assetId | app/routes/api-organization-business-media-asset.ts |
| Media pública negocio | /media/business/:slug/:assetId | app/routes/api-public-business-media.ts |
| Media pública V2 | /media/miniweb/:siteId/:assetId | app/routes/api-public-miniweb-v2-media.ts |
| MiniWeb V2 pública | /miniweb/:siteId | app/routes/public-miniweb-v2.tsx |
| Perfil público Vecindario | /vecindario/:slug | app/routes/public-business-profile.tsx |
| Directorio | /vecindario | app/routes/directory.tsx |
| Sitemap | /sitemap.xml | app/routes/sitemap.ts |
| Panel interno MiniWeb | /app/internal/organizations/:organizationId/miniweb y /app/platform/organizations/:organizationId/miniweb | app/routes/internal-organization-miniweb.tsx |

**Conclusión comprobada:** V1 y V2 están registradas simultáneamente en el router. La retirada V1 requiere revisar sus consumidores y enlaces antes de cambiar rutas.

## Conexión pública V2 verificada

`/miniweb/:siteId` → `getPublicMiniWebV2BySiteId` → JSON snapshot → `validateMiniWebV2Document` → `MiniWebV2Renderer` → `miniWebV2ImageUrl`.

`/media/miniweb/:siteId/:assetId` → misma consulta de publicación → validación JSON → `publishedMiniWebV2ImageIds` → `getBusinessMediaForPublicDelivery(organizationId,assetId)` → `isActive` y MIME permitido → R2 `BUSINESS_MEDIA.get(objectKey)`.

**Controles confirmados:** no sirve imagen si no aparece en documento visible publicado; exige asset activo y tipos image/jpeg/png/webp/avif; `Cache-Control: no-store`, `nosniff` y CORP same-origin. No se ha demostrado que todos los consumidores respeten estas reglas.

## Dependencias identificadas por PR (revisar contenido y referencias inversas)

- Dominio: app/features/miniweb-v2/{sections.ts,media.ts,capacity.ts,visual-families.ts}.
- UI: app/components/{miniweb-v2-renderer.tsx,miniweb-v2-section-form.tsx}.
- Persistencia: db/queries/{miniweb-v2.server.ts,licensing.server.ts,business-media.server.ts,business-publication.server.ts}.
- Esquema: db/schema/licensing.ts; migraciones 0044 y 0045; otras migraciones V1/V2 aún por identificar.
- Pruebas: tests/unit/{miniweb-v2-capacity.test.ts,miniweb-v2-publication-query.test.ts,miniweb-v2-public-media.test.ts,miniweb-v2-publish-safety.test.ts,miniweb-v2-sections.test.ts}; tests/e2e/miniweb-v2-conversion-check.mjs.
- Consumidores potenciales: app/routes/{business-profile.tsx,directory.tsx,sitemap.ts,internal-organization-miniweb.tsx}; componentes de navegación y licencias.
- Infraestructura: Cloudflare D1, R2 BUSINESS_MEDIA; pendiente confirmar bindings, entornos, CI y migraciones.

## Nuevas observaciones para verificar

**MW2-013 — Revocación de imagen y consistencia visual (P1, DECISIÓN/UX).** La ruta pública de medios devuelve 404 cuando `asset.isActive` es falso, incluso si el snapshot activo sigue referenciando el asset. Es una revocación de seguridad/consentimiento explícita, NO un bug de autorización. Hay que decidir y probar UX al retirar un medio: aviso de impacto, reemplazo, placeholder y actualización del snapshot; no debilitar la revocación.

**MW2-014 — Convivencia V1/V2 en router (P1, MIGRACIÓN).** Ambas rutas de edición siguen registradas. Confirmar enlaces y permisos para impedir crear contenido V1 después de conmutar a V2; redirección y conservación de URLs requieren inventario.

## Próxima pasada F01

1. Inspeccionar navegación, paneles internos, perfil negocio, Vecindario y sitemap para localizar referencias V1/V2.
2. Inspeccionar consultas de publicación V1 y V2, esquema, migraciones y media para cerrar grafo de datos.
3. Inspeccionar tests existentes y CI; asociar cobertura real a cada invariante.
4. Revisar integraciones externas, SEO y URLs públicas; inventariar consumidores antes de proponer borrado.
5. Actualizar HALLAZGOS.md y BITACORA.md, con SHA por archivo y decisiones pendientes.
