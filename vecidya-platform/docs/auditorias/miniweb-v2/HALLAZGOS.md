# Registro vivo de hallazgos MiniWeb V2

Corte inicial: 2026-11-05. Estado de las pruebas: **no ejecutadas en esta auditoría remota**. Las evidencias de PR son históricas y no sustituyen reproducción.

| ID | Prioridad | Clasificación | Estado | Hallazgo |
| --- | --- | --- | --- | --- |
| MW2-001 | P0 | Riesgo lógico | POR REPRODUCIR | Posible reserva persistente de cupo cuando falla una publicación |
| MW2-002 | P1 | Limitación funcional observada | CONFIRMADO EN RUTA | No aparece acción para cambiar familia/variante después de crear el sitio |
| MW2-003 | P1 | Gate de release | PENDIENTE | Auditoría integral WCAG/axe, lector de pantalla y zoom |
| MW2-004 | P1 | Gate de release | PENDIENTE | Validación visual humana de cinco familias × tres variantes y viewports |
| MW2-005 | P1 | Riesgo a verificar | POR REPRODUCIR | Ciclo de vida de imágenes después de publicar y borrado posterior |
| MW2-006 | P2 | Política a decidir | ABIERTO | Enlaces externos http: admitidos por el validador |
| MW2-007 | P0 | Gate de release | PENDIENTE | D1/R2 remoto, backup, restore y rollback sin evidencia de certificación |
| MW2-008 | P0 | Migración | PENDIENTE | Inventario y paridad V1→V2 antes de eliminar V1 |
| MW2-009 | P1 | Riesgo a verificar | PENDIENTE | Autorización y aislamiento multitenant en todas las rutas, medios y snapshots |
| MW2-010 | P1 | Riesgo a verificar | PENDIENTE | Concurrencia de guardado/publicación, idempotencia y límites de licencias |
| MW2-011 | P1 | UX | PENDIENTE | Comprobar claridad de errores, revisión, cambios sin guardar y cambio entre sitios |
| MW2-012 | P1 | Integración | PENDIENTE | SEO, sitemap, enlaces y coexistencia con Vecindario |

## MW2-001 — Cupo potencialmente retenido en publicación fallida

**Evidencia:** `db/queries/miniweb-v2.server.ts`, `publishMiniWebV2Draft`. En un `database.batch` se inserta `miniweb_v2_publication_slot`, se intenta insertar snapshot y se actualiza puntero. Después se evalúan `meta.changes`. Si la reserva modifica una fila y una operación posterior afecta 0 filas, el retorno de conflicto por sí solo no revierte necesariamente la reserva.

**No afirmamos que el defecto se haya reproducido.** Confirmar semántica transaccional D1 y construir escenario controlado: sitio con licencia y sin slot; provocar fallo lógico de snapshot/activación; comparar slots y publicaciones antes/después.

**Invariante:** publicación fallida no debe consumir un cupo nuevo; puntero activo y snapshot deben concordar.

**Cierre:** prueba E2E D1 local y concurrencia; corrección mínima si se reproduce.

## MW2-002 — Diseño no editable tras creación desde el editor inspeccionado

**Evidencia:** `app/routes/miniweb-v2-editor.tsx`, selección de familia y variante cuando `!data.state`; con sitio existente se presentan como texto y el renderer recibe valores de `data.state.site`. La API inspeccionada `app/routes/api-miniweb-v2.ts` implementa crear, importar, guardar y publicar; no expone operación explícita de cambio de diseño.

**Alcance de la confirmación:** ausencia en estas rutas, no afirmación sobre toda posible API alternativa.

**Impacto:** probar estilos requiere crear otro sitio, con posible duplicación de trabajo.

**Propuesta:** permitir edición reversible de familia/variante, sin alterar contenido ni publicar automáticamente; revisar semántica de revisión y snapshot.

## MW2-003 / MW2-004 — Certificación de accesibilidad y visual

**Evidencia:** PR #226, #229 y #238 documentan capturas y pruebas locales; reconocen límites de WCAG integral y revisión humana. **No se han repetido aquí**.

**Cierre:** matriz 5 familias × 3 variantes; móvil/tableta/escritorio, teclado, foco, contraste, zoom 200 %, movimiento reducido y lector de pantalla. Registrar capturas y defectos reales.

## MW2-005 — Medios publicados

**Evidencia:** `app/routes/api-miniweb-v2.ts` verifica que los IDs de imágenes referenciados pertenecen a la organización y son imágenes antes de publicar. Falta examinar el borrado posterior, las rutas públicas y la entrega R2.

**Invariante:** no exponer medios ajenos, no romper páginas activas al eliminar assets, sin enlaces privados en HTML anónimo.

## MW2-006 — Protocolo HTTP

**Evidencia:** `app/features/miniweb-v2/sections.ts`, `safeHref` permite `https:`, `http:`, `mailto:` y `tel:`.

**Decisión pendiente:** política HTTPS para enlaces externos web; evaluar compatibilidad con sitios existentes y evitar cambio silencioso de contratos.

## MW2-007 — Release remoto y reversibilidad

**Evidencia:** PR #238 y #239 declaran explícitamente que no hubo migración D1 remota ni despliegue; siguen abiertos VIS-01, SEC-QA, COM-01/OPS-01 y backup/restore/rollback.

**Cierre:** evidencia fechada por entorno, checklist aprobado, respaldo verificado, restauración ensayada y plan de reversión.

## MW2-008 — Retirada V1

**Evidencia:** `app/routes/miniweb-editor.tsx` y `db/queries/business-publication.server.ts` son rutas/contratos V1; `app/routes/miniweb-v2-editor.tsx`, `app/routes/api-miniweb-v2.ts` y `db/queries/miniweb-v2.server.ts` implementan V2. La importación voluntaria V1→V2 omite explícitamente horarios, configuración/estilos y CRM.

**Riesgo:** borrar V1 antes de inventariar consumidores y resolver la equivalencia funcional puede romper enlaces, publicaciones o datos históricos.

**Cierre:** inventario completo, decisión explícita sobre horarios y datos excluidos, migración ensayada, conmutación y retiro posterior.

## MW2-009 / MW2-010 — Aislamiento y concurrencia

**Evidencia favorable:** `api-miniweb-v2.ts` comprueba organización activa y permisos; `miniweb-v2.server.ts` filtra por organización y usa CAS en borradores. PR #238 declara pruebas de concurrencia. **Pendiente** inspección integral de rutas públicas, media y casos adversarios.

**Cierre:** pruebas cruzadas entre tenants, owner, admin, lector, licencia expirada, revisión obsoleta, reintento, capacidad simultánea y error parcial.

## MW2-011 / MW2-012 — UX e integración

**Evidencia:** el editor usa `useBlocker`, `beforeunload`, revisión, validación, vista previa y estados. Falta prueba humana de pérdida de cambios, navegación, anuncios de errores, rutas y SEO público.

**Cierre:** casos E2E y revisión humana con datos sintéticos.

## Referencias

- https://github.com/hola675/Vecidya/pull/226
- https://github.com/hola675/Vecidya/pull/229
- https://github.com/hola675/Vecidya/pull/238
- https://github.com/hola675/Vecidya/pull/239

## MW2-013 — Revocación de medios y consistencia visual (P1; decisión UX)

**Evidencia directa:** `app/routes/api-public-miniweb-v2-media.ts` devuelve 404 si un asset publicado deja de estar activo; `app/features/miniweb-v2/media.ts` limita medios a IDs de secciones visibles. Es revocación intencionada y segura, no bug confirmado. **Riesgo de experiencia:** snapshot puede seguir apuntando a imagen revocada. Evaluar aviso al borrar, sustitución y placeholder sin volver a servir un asset revocado. Estado: POR VERIFICAR.

## MW2-014 — Rutas V1 y V2 coexisten (P1; migración)

**Evidencia directa:** `app/routes.ts` registra `/app/miniweb` (V1) y `/app/miniweb-v2` (V2), además de API V1 `miniweb-config` y API V2 `miniweb-v2`. Coexistencia deliberada durante migración, no bug. Inventariar enlaces, consumidores, permisos y redirecciones antes de retirar V1. Estado: PENDIENTE.

## MW2-015 — Stub de D1 no certifica atomicidad (P1; cobertura)

**Evidencia:** `tests/unit/miniweb-v2-publication-query.test.ts` programa `meta.changes` con `createD1Stub`; solo comprueba éxito [1,1,1] y conflicto [0,0,0]. No ejecuta transacciones reales ni escenario [1,0,0]. No es bug de producto demostrado; falta prueba de integración D1 real para MW2-001. Estado: CONFIRMADA LIMITACIÓN DE ESTA PRUEBA.

## MW2-016 — Pipeline CI pendiente de localizar (P1; inventario)

**Evidencia:** `package.json` tiene scripts unit, typecheck, build y E2E conversión. No se encontraron `.github/workflows/ci.yml` ni `ci.yaml`; esto no implica ausencia de otros workflows. Localizar checks y protecciones antes de concluir. Estado: EN ANÁLISIS.

## Rectificación MW2-015 — 2026-11-05

La limitación del stub aplica solo a `tests/unit/miniweb-v2-publication-query.test.ts`. **Existe** `tests/e2e/miniweb-v2-conversion-check.mjs` con Worker Wrangler y D1/R2 locales, concurrencia de cupos, permisos, medios, SEO y capturas Playwright 5×3×3. No se ejecutó en esta auditoría. Sigue pendiente verificar el fallo parcial de MW2-001.

## MW2-017 — Runner E2E general omite la prueba V2 (P1; cobertura CI)

**Confirmado en código:** `tests/e2e/run-local-e2e.mjs` lista 37 scripts sin `miniweb-v2-conversion-check.mjs`; `package.json` sí define `test:e2e:miniweb-v2-conversion`. Comprobar si otros workflows lo ejecutan y exigir gate explícito. Estado: CONFIRMADO EN RUNNER, PENDIENTE EN CI.

## MW2-018 — E2E local no certifica DEV remoto (P1; gate)

El E2E V2 usa Wrangler, D1 y R2 locales. No equivale a smoke contra Worker DEV desplegado. Planificar certificación DEV por URL con evidencia de SHA y entorno, sin despliegues no autorizados. Estado: GATE PENDIENTE.

## MW2-019 — Caché de sitemap parcialmente degradado (P2, SEO)

`app/routes/sitemap.ts` captura el fallo de consulta de MiniWeb V2 sin activar `profilesUnavailable`; puede devolver sitemap sin V2 con `max-age=3600`. Confirmado en lectura, no reproducido en producción. Revisar TTL y observabilidad.

## MW2-020 — Invariante de titularidad de cupos (P1, investigación)

`db/schema/miniweb.ts`: `miniweb_v2_publication_slot.owner_user_id` no declara FK en el esquema leído. Verificar transferencia, bajas y contabilidad de cupos. No es bug demostrado.

## MW2-021 — Migraciones y recursos remotos (P1, gate)

`wrangler.jsonc` distingue D1/R2 staging y producción; estado remoto, backups y rollback siguen sin certificar. Vinculado a MW2-007.

## MW2-022 — Nombres de migraciones 0044/0045 (P2, RESUELTO como localización)

Los nombres inicialmente supuestos no existían. Los archivos reales son `db/migrations/0044_miniweb-capacity-extensions.sql` y `0045_miniweb-capacity-extension-org-scope.sql`, localizados por archivos del PR #238 y leídos en main. **Queda pendiente** verificar historial de aplicación remota y migraciones anteriores que crean las tablas V2.

## MW2-023 — Upgrade 0045 con datos previos (P1; migración)

0044 crea extensiones sin `organization_id`; 0045 agrega columna `NOT NULL` sin backfill visible. Verificar migración desde tabla poblada/vacía en copia local; no se afirma fallo remoto. Estado: PRUEBA PENDIENTE.

## MW2-024 — Política de ampliaciones por titular u organización (P1; decisión)

`grantMiniWebCapacityExtension` vincula ampliación a organización, mientras capacidad/publicación suman ampliaciones por titular de facturación. Confirmar si los cupos son compartidos deliberadamente entre organizaciones y probar transferencias. Estado: DECISIÓN PENDIENTE.

## MW2-025 — Publicación parcial sin rollback automático por cero filas (P0; investigación)

`publishMiniWebV2Draft` comprueba `meta.changes` después de `database.batch`. Probar en D1 real escenarios [1,0,0] y [1,1,0], estado de slots/snapshots/punteros y reintento. Una sentencia que modifica cero filas no equivale a error SQL. Vinculado a MW2-001. Estado: SIN REPRODUCIR.

## MW2-026 — DDL base V2 localizado (P2, inventario; resuelto)

El journal de migraciones confirma 0034–0037; leídos los cuatro SQL: 0034 crea sitio/borrador/publicación; 0035 cambia índice único organización+familia a índice no único; 0036 crea cupos; 0037 añade procedencia y consentimiento de conversión. No confundir existencia en Git con aplicación remota.

## MW2-027 — Publicación visible tras suspensión de licencia (P1, decisión)

`getPublicMiniWebV2BySiteId` sigue el puntero de publicación sin comprobar licencia; `publishMiniWebV2Draft` sí exige licencia activa. Confirmar política: suspensión bloquea nuevas publicaciones o también acceso público a sitios existentes. Si debe despublicar, crear caso de prueba; no es bug demostrado.

## MW2-028 — Selector de sitio inválido (P2, UX)

`getMiniWebV2EditorState` devuelve null cuando `siteId` no pertenece a la organización o no existe; el editor muestra pantalla de crear sitio. Confirmar UX deseada (404/aviso/selección) y probar enlaces obsoletos. No se ha reproducido en navegador.

## MW2-029 — CAS de guardado con resultado parcial (P0, investigación)

`saveMiniWebV2Draft` hace dos UPDATE en `database.batch` y valida `meta.changes` después. Probar D1 real [1,0] y comprobar si draft y site divergen; cero filas no genera necesariamente excepción SQL. Estado: SIN REPRODUCIR. Matriz T-SAVE-01..04.

## MW2-030 — Inicialización de sitio en dos operaciones (P1, investigación)

`action(create)` crea sitio+borrador revisión cero en un batch y después llama `saveMiniWebV2Draft` en otra operación. Si falla inicialización, devuelve 409 sin limpieza explícita del sitio. Verificar si puede persistir sitio sin inicializar y diseñar recuperación. Estado: SIN REPRODUCIR. Matriz T-CREATE-01..02.

## MW2-031 — Matriz visual con fixtures SQL, no publicación API por combinación (P1)

La matriz 5×3×3 crea 15 sitios visuales por SQL directo y los captura en 3 viewports; no valida publicación API de cada combinación. Completar flujo representativo y QA humana. Estado: COBERTURA PARCIAL.

## MW2-032 — Accesibilidad automatizada parcial (P1)

E2E comprueba alt presente, contraste aproximado, reduced motion y Tab a algún enlace, pero no constituye auditoría axe/WCAG, lector, zoom o navegación completa. Vinculado a MW2-003. Estado: GATE ABIERTO.

## MW2-033 — Retención de capturas visuales (P2)

Las 45 capturas y manifest se escriben en carpeta local `.playwright-mcp`; falta verificar almacenamiento como artefactos de CI con SHA y revisión. Estado: PENDIENTE.

## MW2-034 — Matriz visual no prueba imágenes R2 reales por combinación (P2)

Los fixtures usan identificadores sintéticos de imágenes; la comprobación de alt no asegura imágenes cargadas. Probar imágenes R2 autorizadas y estados rotos por familia/variante. Estado: PENDIENTE.

### Actualización MW2-023 — Reproducción local SQLite (2026-11-05)

Ejecutado fixture en SQLite en memoria con DDL equivalente a 0044 y ALTER literal de 0045, FK activas. Tabla vacía: PASS. Tabla con una extensión: FAIL `Cannot add a NOT NULL column with default value NULL`. **Incompatibilidad reproducida en SQLite con datos previos**; no probada en Cloudflare D1 remoto. Evidencia y límites en `REPRODUCCION-SQLITE-MIGRACION-0045.md`. Mantener gate abierto hasta backfill/migración segura y certificación.

## MW2-035 — Inventario inverso V1/V2 antes de corte (P1, migración)

`app/routes.ts` confirma editores, APIs, rutas públicas y media V1/V2 separadas; faltan consumidores, enlaces y redirecciones externos/internos para retirada segura. Vinculado MW2-008 y MW2-014. Estado: F07 ABIERTA.

## MW2-036 — Etiqueta de retorno de V2 hacia V1 (P2, UX)

`miniweb-v2-editor.tsx` enlaza a `/app/miniweb` bajo 'Volver a Mi sitio web'. Validar claridad de etiquetas y navegación inversa durante convivencia. No se afirma confusión observada. Estado: PENDIENTE UX.
