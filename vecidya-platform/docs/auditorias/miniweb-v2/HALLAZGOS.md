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
