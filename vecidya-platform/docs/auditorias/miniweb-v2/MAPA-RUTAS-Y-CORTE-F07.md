# F07 — Mapa de rutas V1/V2 y puntos de corte (revisión 01)

Fecha: 2026-11-05. Fuente: app/routes.ts (SHA af7432ca80581c20c90cd1e98c96832f9cdd0f2a), app/routes/miniweb-editor.tsx (SHA f5b907b297ebd26ff063b97aa31feabf7224dbe0), app/routes/miniweb-v2-editor.tsx (SHA 549525aae4e9252a0dd4bb51999c2ce59870e884), app/routes/api-miniweb-v2.ts (SHA bb1a3702b3ae27b492e99703ecd095cb029fd43b), app/routes/public-miniweb-v2.tsx (SHA 8ebf9293065034569303735351f7709ee04ecd45), app/routes/api-public-miniweb-v2-media.ts (SHA 7da4863b6d6b627e5bff7fafa0e21581a930132f), app/routes/sitemap.ts (SHA b8ccb79a5d9f4b659a5e186d90abf39c6bc6f968). Lectura de main; no pruebas.

## Rutas confirmadas
- Editor V1: GET /app/miniweb → routes/miniweb-editor.tsx
- Editor V2: GET /app/miniweb-v2 → routes/miniweb-v2-editor.tsx
- API V1: /api/organizations/:organizationId/miniweb-config
- API V2: /api/organizations/:organizationId/miniweb-v2
- Publicación V1/Vecindario: /vecindario/:slug → routes/public-business-profile.tsx
- Publicación V2: /miniweb/:siteId → routes/public-miniweb-v2.tsx
- Media V1: /media/business/:slug/:assetId
- Media V2: /media/miniweb/:siteId/:assetId
- Configuración interna V1: /app/internal/organizations/:organizationId/miniweb y /app/platform/organizations/:organizationId/miniweb
- Sitemap: incluye /vecindario/:slug y /miniweb/:siteId; ambos deben coexistir durante transición.

## Invariantes y observaciones
- V2 editor enlaza explícitamente a /app/miniweb con texto 'Volver a Mi sitio web'. No es reemplazo automático de V1.
- V2 conversión voluntaria usa snapshot publicado V1, exige confirm=true y crea sitio V2 independiente. Excluye horarios, estilos, CRM y referencias no publicadas; no modifica V1.
- V2 pública lee solo snapshot activo, no borrador.
- Media V2 exige asset referenciado en snapshot, organización coincidente, activo y tipo imagen admitido; R2 devuelve no-store para revocación.
- V1 sigue siendo fuente de contenidos para /vecindario y API de configuración; no eliminar sus tablas ni endpoints hasta mapa completo de consumidores y plan de cutover.
- La búsqueda de código GitHub devolvió cero resultados incluso para cadenas conocidas; NO usar ese índice como prueba de ausencia de consumidores. Revisar árbol completo y fuentes.

## Hallazgos
MW2-035 (P1, migración): la separación de rutas V1/V2 está confirmada; falta inventario exhaustivo de consumidores y redirecciones antes del corte. Relacionado MW2-008/014. Riesgo de regresión, no fallo demostrado.
MW2-036 (P2, UX): el editor V2 usa enlace 'Volver a Mi sitio web' hacia V1. Confirmar si el etiquetado diferencia adecuadamente V1 y V2 durante coexistencia y si hay navegación inversa. No afirmar confusión de usuarios sin pruebas.

## Pendientes explícitos
P-F07-01: inventario completo de referencias a rutas y tablas V1/V2 (código, plantillas, emails, sitemap, menú, SEO, integraciones).
P-F07-02: matriz de paridad de datos y funciones, con diferencias intencionales (horarios V1 excluidos).
P-F07-03: pruebas de no regresión de /vecindario, publicación y medios V1.
P-F07-04: probar conversión con consentimiento, idempotencia, importación y reversibilidad.
P-F07-05: definir navegación/redirect/canonical/301, enlaces externos y fecha de corte, sin ejecutarlo.
P-F07-06: comprobar permisos de rutas internas V1 y de lectura/escritura V2.
P-F07-07: revisar naming V1/V2 en menú, enlaces y ayudas.
P-F07-08: elaborar matriz de reversión antes de retirar V1.
P-F07-09: confirmar media V2 en R2 y revocación sin caché.
P-F07-10: verificar si hay consumidores fuera del repositorio o automatizaciones.
No ejecutar corte ni borrar V1.
