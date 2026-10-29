# VECIDYA APRENDE — PLAN MAESTRO FUNCIONAL Y TÉCNICO V1

**Identificador:** APRENDE-PLAN-V1 · **Fecha:** 2026-10-28 · **Estado:** PLANIFICACIÓN / NO IMPLEMENTADO · **Propietario de ejecución futura:** agente de código designado por el usuario.  
**Repositorio:** `hola675/Vecidya` · **Producto:** `vecidya-platform/` · **Terminología obligatoria:** **licencia**, nunca membresía.  
**Alcance de este checkpoint:** únicamente documentación en `plans/`; no modificar código, D1, contratos comerciales, licencias ni producción.

> **Fuente y niveles de certeza.** `APROBADO`: decisiones del usuario en la conversación de diseño. `CODE`: archivos inspeccionados en la rama predeterminada el 2026-10-28. `DOC`: estado descrito en documentos del repositorio, no revalidado por ejecución. `PROPUESTA`: diseño técnico por validar antes de implementarse. No confundir propuesta con función disponible.

## 0. Cómo usar este documento

1. Leer `AGENTS.md`, `vecidya-platform/docs/GOVERNANCE.md`, `STATUS.md`, `PROJECT_STATE.md`, `ROADMAP.md`, `ARCHITECTURE.md`, `DATABASE.md`, `TESTING.md` y `docs/business/VECIDYA_PRODUCT_CATALOG.md`.
2. Volver a inspeccionar código y esquema en el HEAD vigente: este plan es un punto de partida, **no** una fuente ejecutable ni una autorización de cambios.
3. Ejecutar fases **en orden**, cada una en rama/worktree aislada `feat/aprende-<checkpoint>`, sin mezclar tareas ajenas. Revisar `git status`, `git branch -vv`, `git fetch origin` antes de crear worktree.
4. Registrar decisiones bloqueantes antes de cambiar contratos públicos o datos. Si el agente detecta contradicción entre plan y código, priorizar código y escalar la decisión.
5. Por fase: implementación mínima, pruebas focalizadas, typecheck, build, `git diff --check`, reconciliación de documentos canónicos, commit y PR. No merge ni deploy sin autorización adicional.
6. Mantener un registro de avance **en este mismo documento** (sección 17), sin multiplicar documentos por fase. El directorio `plans/` existe por autorización explícita del usuario; respetar el techo documental y reconciliarlo con GOVERNANCE cuando corresponda.

## 1. Objetivo y fronteras

Transformar la biblioteca pública Aprende en una experiencia educativa de Vecidya con catálogo abierto, **6 guías siempre gratuitas**, **42 guías completas con licencia activa**, progreso personal, favoritos, nueve itinerarios y continuidad entre dispositivos. La biblioteca no es un LMS certificado, no vende licencias propias, no crea un CRM, no ejecuta flujos de GoHighLevel, no requiere IA para recomendaciones y no altera la operación de otros negocios.

**No objetivos V1:** exámenes obligatorios, certificados, puntuaciones públicas, rankings, pagos automáticos, descargas completas offline, seguimiento de lectura de empleados por el propietario, desbloqueos por créditos, IA de recomendación, contenidos nuevos obligatorios, rediseño general del SaaS.

**Principios:** acceso mínimo, separación de organizaciones, privacidad por diseño, progresión editorial comprensible, accesibilidad WCAG 2.2 AA como objetivo, comportamiento degradado honesto, SSR seguro, idempotencia, mínimo acoplamiento a licencias y a GHL.

## 2. Evidencia actual del repositorio (CODE / DOC)

- `vecidya-platform/app/routes.ts`: rutas `/aprende`, `/aprende/:slug`, `/licencias`, `/licencias/:slug`, autenticación y APIs de organizaciones. Las rutas Aprende actuales son públicas.
- `app/routes/knowledge.tsx`: búsqueda y filtro por categoría server-side, itinerarios y listado; la búsqueda actual inspecciona también el **texto íntegro de las secciones**, aunque el loader devuelve tarjetas resumidas. **Riesgo futuro:** la búsqueda pública no debe revelar extractos protegidos ni permitir inferir respuestas de contenido privado mediante consultas arbitrarias.
- `app/routes/learn-article.tsx`: loader devuelve `article` completo con `sections` a visitantes sin autorización. TOC, tiempo estimado, resúmenes, FAQ, fuentes, repaso y relacionados ya existen; repaso actual son preguntas abiertas con pistas, no un motor de examen. **Bloqueante de seguridad antes de activar licencias.**
- `app/content/learn.ts` y seis módulos importados: tipo `LearnArticle` con `slug`, `category`, `title`, `intro`, `excerpt`, `image`, `imageAlt`, `enPocasPalabras`, `sections`, `relatedSlugs`, `cta`, `editorialDraft`; las secciones actualmente carecen de ID estable y usan encabezado/índice para claves/anchors.
- `app/content/learn-publication.ts`: controla publicación editorial, **no** autorización por licencia. Mantener separados `published` y `free`/ `licensed`.
- `docs/STATUS.md` y contenido inspeccionado: 48 guías aprobadas, 6 categorías y 9 itinerarios; confirmar en el HEAD de implementación y en cada release.
- `app/routes/licenses.tsx`: catálogo comercial Cuadra/Barrio/Ciudad; texto explícito: **“La activación se coordina por contacto; no hay compra automática”**. No inventar checkout, webhook de pago ni activación instantánea.
- `app/routes.ts`: existen rutas administrativas de licencias, organizaciones, miembros e invitaciones. **No se ha certificado en esta planificación** el esquema exacto de permisos/entitlements ni su semántica: inspección obligatoria antes de diseñar migraciones.
- `package.json`: React Router SSR, TypeScript, Cloudflare Workers, D1/Drizzle, Better Auth; scripts `typecheck`, `build`, `test:e2e:aprende-public`.
- `AGENTS.md`/`GOVERNANCE.md`: límites multiagente, máximo de documentos, documentación canónica, PR, pruebas focalizadas, no despliegue sin autorización.

**No realizado:** pruebas ejecutadas, auditoría autenticada de licencias, inspección exhaustiva de D1, revisión HTTP de producción, medición de rendimiento, auditoría WCAG completa. Ninguna afirmación de este plan equivale a certificación.

## 3. Decisiones de producto aprobadas (APROBADO)

### 3.1 Acceso y licencias

1. Catálogo público unificado de 48 guías: títulos, categoría, introducción, objetivos, duración estimada e índice público **sanitizado**; filtros por categoría, acceso, progreso y duración según corresponda.
2. Exactamente 6 guías introductorias, una por categoría, completas y permanentemente gratuitas, sin registro. Sección destacada `Empieza aquí`, etiqueta `Siempre gratuita`.
3. Las otras 42 guías requieren licencia **activa** Cuadra, Barrio o Ciudad. El registro gratuito **no** concede créditos ni desbloqueos. Suprimir el modelo anterior 10 anónimas + 5 por registro y todos sus contadores/prompts; verificar antes si hay datos heredados que requieran política de migración.
4. Licencia comercial centralizada; Aprende no crea cobros ni suscripciones. Enlace hacia `/licencias` o detalle oficial validado y regreso seguro a la guía solicitada **solo cuando la licencia esté realmente activa**; puede requerir espera y activación manual.
5. Acceso por **cuenta personal**: basta una organización donde el usuario sea propietario o colaborador activo con permiso explícito de Aprende, siempre que la organización tenga licencia activa. El progreso es personal, no propiedad de la organización.
6. El permiso de colaborador para Aprende estará **desactivado por defecto** en invitaciones. Solo el propietario o actor con permiso de gestión autorizado podrá concederlo; no implica rol admin ni acceso a datos comerciales. Admin sin permiso Aprende no lo hereda automáticamente, salvo que sea propietario.
7. Al perder licencia, permiso o relación organizacional, se revoca acceso a las 42 guías; se conservan progreso y favoritos. Si otra organización habilita al usuario, el acceso continúa.
8. Ni el cambio de organización activa ni el cierre de sesión transfieren datos de aprendizaje entre cuentas.

### 3.2 Lectura, estado y recomendaciones

9. Progreso por secciones con checkbox **manual**; leer/desplazarse no equivale a completar. Estados `sin comenzar`, `en progreso`, `completada`; porcentaje = secciones marcadas / secciones vigentes. Acción explícita `Marcar guía completa` con confirmación; desmarcar recalcula.
10. Recordar última sección para `Continuar leyendo`; historial reciente con `Ocultar de recientes` que **no** borra progreso; `Reiniciar progreso` es acción distinta y explícita.
11. Favoritos de cualquier guía, incluso protegida, sin habilitar lectura ni modificar permisos.
12. Nueve itinerarios existentes: orden recomendado y navegación libre, respetando permisos. Progreso de una guía compartido entre itinerarios; sin progreso duplicado.
13. `Comprueba lo aprendido` opcional y repetible, sin condicionar finalización, certificados ni rankings; reutilizar preguntas/pistas existentes y no inventar motor de quizzes.
14. Recomendaciones editoriales deterministas: continuar, siguiente itinerario, relacionados, otras categorías; explicar motivo; `No me interesa` reversible, sin ocultar la guía del catálogo.
15. En móvil, control compacto de índice/progreso que abre panel sin tapar contenido; teclado, lector de pantalla, foco y reducción de movimiento.
16. Sin conexión temporal: encolado de cambios **de progreso y favoritos**, persistidos localmente y sincronizados al reconectar; no prometer biblioteca descargable offline ni desbloqueos offline.
17. Conflictos: fusionar operaciones independientes; para el mismo campo respetar acción explícita causalmente más reciente, incluyendo **desmarcar** y **reiniciar**. No usar unión ciega de checks ni sobrescribir todo el documento con la última copia.
18. Al editar guías, preservar progreso de secciones equivalentes; nuevas o sustancialmente distintas quedan pendientes; eliminadas no cuentan en el denominador. Desbloqueos y favoritos no cambian por editar títulos.
19. Historial anónimo de seis guías: persistencia local de lectura/favoritos cuando el navegador lo permita; al crear cuenta fusionar automáticamente, y al iniciar sesión en cuenta existente solicitar consentimiento antes de fusionar. Evitar fingerprinting. Al rechazar no transferir datos; limpiar adecuadamente estados privados al salir.
20. Datos personales de aprendizaje no visibles para propietarios, otros colaboradores, GHL ni administradores ordinarios; cualquier acceso técnico extraordinario requiere base legal, autorización y auditoría separadas.

### 3.3 Criterios aprobados de contenido

Seis candidatas **seleccionadas para validación editorial final** (no afirmar aprobación final del texto sin revisión):

| Categoría | Slug existente (CODE) | Título |
| --- | --- | --- |
| Negocios digitales | `como-empezar-a-digitalizar-un-negocio-desde-cero` | Quiero llevar mi negocio a internet: ¿por dónde empiezo? |
| Automatización | `automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio` | Automatizaciones: ahorrar tiempo sin complicar tu negocio |
| Inteligencia Artificial | `que-puede-hacer-una-inteligencia-artificial-por-un-negocio` | ¿Qué puede hacer una inteligencia artificial por un negocio? |
| CRM y clientes | `que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo` | ¿Qué es un CRM y por qué un negocio pequeño puede necesitarlo? |
| Tecnología explicada | `dominio-hosting-sitio-web-como-funcionan` | Dominio, hosting y sitio web: qué es cada cosa y cómo funcionan juntos |
| Gestión y equipos | `como-organizar-tareas-y-responsables-en-tu-equipo` | ¿Quién se encarga de qué? Organiza las tareas sin perseguir a tu equipo |

**Gate editorial:** comprobar por cada slug existencia/publicación, introducción sin jerga, objetivos, ejemplos, pasos, FAQ, fuentes vigentes, ilustración/alt, enlaces, nivel, originalidad, legibilidad, coherencia de CTAs y representación de las seis categorías. No modificar contenidos en la fase de autorización. Congelar lista por IDs/slug en una política de acceso versionada. **Nunca** quitar retroactivamente gratuidad prometida sin decisión explícita y análisis de impacto.

## 4. Modelo lógico de autorización (PROPUESTA)

Definir una función server-only `canReadLearnGuide(actor, guide, now)` que devuelva `allow|deny` y razón interna; evitar enviar detalles de otras organizaciones al cliente.

Pseudocódigo:

```text
si guia inexistente, retirada o editorialDraft => NOT_FOUND
si guia marcada always_free => ALLOW_PUBLIC
si actor sin sesion => PREVIEW_ONLY
obtener relaciones organizacionales ACTIVAS del actor (no confiar en orgId del cliente)
para cada relacion:
    si licencia de esa organizacion está ACTIVA según fuente comercial canónica
       y (actor es propietario legítimo
            o actor tiene permiso explicito learn.full_access en esa organizacion):
          => ALLOW_LICENSED
=> PREVIEW_ONLY
```

**Seguridad:** lectura de relaciones solo del actor autenticado, no usar `active_organization_id` como único criterio, no confiar en claims obsoletos de cookie, no inferir licencia de un precio/plan mostrado, no permitir que `platform_admin` suplante usuario. Cache de autorización, si existe, debe invalidarse en revocación/cancelación; evitar autorización stale. `404` para no publicado; `200` con preview pública para publicado sin derecho (no `403` que rompa descubrimiento). APIs de contenido completo deben comprobar autorización **en cada petición**. Protecciones contra CSRF, IDOR, enumeración, sesiones expiradas y solicitudes repetidas.

**Casos de matriz:**

| Actor | Licencia | Permiso | Resultado |
| --- | --- | --- | --- |
| Anónimo | cualquiera | — | 6 completas; 42 preview |
| Cuenta gratuita | ninguna | — | 6 completas; 42 preview |
| Propietario activo | activa | propietario | 48 completas |
| Colaborador activo | activa | learn.full_access | 48 completas |
| Colaborador activo | activa | sin permiso | 6 completas; 42 preview |
| Administrador no propietario | activa | sin permiso | 6 completas; 42 preview |
| Cuenta en 2 negocios | 1 activa | permiso en ese negocio | 48 completas |
| Cuenta en 2 negocios | 1 activa | permiso solo en el negocio sin licencia | 6 completas; 42 preview |
| Usuario desvinculado | antes activa | permiso anterior | revocar salvo otro vínculo válido |
| Licencia cancelada/pendiente | no activa | cualquier permiso | revocar salvo otro vínculo válido |

La condición `activa` debe usar los estados y fechas **reales** del subsistema de licencias. No inventar vencimiento automático: los documentos actuales describen cancelación/reactivación manual, sin renovación automática. Adaptar el algoritmo a los contratos efectivos.

## 5. Contratos de datos y persistencia (PROPUESTA; NO migrar aún)

### 5.1 Separación de objetos

- `GuidePublicSummary`: slug, título, categoría, excerpt, intro pública revisada, objetivos públicos, duración, portada/alt, headings **públicos**, estado de acceso `always_free|licensed`, estado editorial. Nunca incluir `sections.paragraphs`, `blocks`, respuestas, fuentes internas protegidas o texto completo de guías licenciadas.
- `GuideFullContent`: cuerpo completo y metadatos; generado **solo** después de autorización server-side.
- `LearnEntitlement`: cálculo derivado de licencia+relación+permiso, **no** duplicar un booleano global persistente que pueda quedar obsoleto.
- `PersonalGuideProgress`: `user_id`, `guide_slug` o ID inmutable, `last_section_id`, `last_activity_at`, `reset_epoch`, `updated_at`; índices por usuario/reciente.
- `PersonalSectionProgress`: `user_id`, `guide_id`, `section_id`, `checked`, `content_revision`, `logical_version`, `operation_id`, `updated_at`; clave única usuario+guía+sección; no tratar ausencia como falso cuando existe operación explícita `unchecked`.
- `PersonalFavorite`: usuario+guía, `is_favorite`, versión/op-id para soportar eliminar y reañadir sin reaparición.
- `PersonalRecommendationDismissal`: usuario+guía, ocultación reversible.
- `PersonalRecentVisibility`: usuario+guía, ocultación de recientes reversible; separada de lectura.
- `GuideRevisionManifest`: guía, versión, lista de `section_id`, `content_revision` y `equivalent_to`/política de equivalencia revisada editorialmente.
- `ClientOperation`: idempotency key aleatoria, actor, operación, target, versión base, marca lógica/orden servidor, estado de aceptación. Definir retención y límites de almacenamiento, evitando historial ilimitado.

**Preferencia de almacenamiento:** D1 para progreso autenticado, índices/constraints, operaciones idempotentes y revisiones; almacenamiento local del navegador para cola temporal anónima o sin conexión. Confirmar capacidades de D1 y el esquema de identidad antes de fijar tablas y claves; no crear tablas de CRM/GHL.

### 5.2 IDs y versiones editoriales

- ID de guía estable separado de título y slug; mantener slug público con resolución de redirecciones si cambia.
- IDs de sección inmutables; no usar `section-1` o heading como identidad persistente.
- Cambios cosméticos conservan `content_revision`; cambios semánticos incrementan revisión. El editor humano decide equivalencia; cambios automáticos por hash pueden apoyar revisión, no decidir solos.
- Recalcular progreso respecto a **secciones actuales**; si una completada añade dos secciones, mostrar nuevo porcentaje y aviso.
- Retirada editorial: conservar metadatos de historial personal sin mostrar contenido retirado; definir política de privacidad y retención.

### 5.3 Protocolo de sincronización y conflictos

- Operaciones discretas `CHECK_SECTION`, `UNCHECK_SECTION`, `RESET_GUIDE`, `SET_LAST_SECTION`, `FAVORITE`, `UNFAVORITE`, `HIDE_RECENT`, `RESTORE_RECENT`, `DISMISS_RECOMMENDATION`, `RESTORE_RECOMMENDATION`.
- `operation_id` único para reintentos idempotentes; `device_id` aleatorio de instalación **no fingerprint**, y `client_sequence` monotónico por instalación. Servidor asigna secuencia/versión autoritativa por usuario+guía.
- **No usar únicamente timestamps de reloj del dispositivo** para decidir quién gana: relojes divergentes y reintentos offline pueden invertir acciones. Diseñar protocolo con `base_version`, orden causal, secuencia de recepción y política explícita para operaciones concurrentes. Si dos acciones concurrentes sobre el mismo campo son indistinguibles, aplicar desempate determinista documentado y mostrar el resultado al usuario; no prometer inferir intención imposible.
- Operaciones sobre secciones diferentes conmutan; `UNCHECK` explícito no se pierde por una unión de `CHECK`. `RESET` genera nuevo `reset_epoch`; operaciones anteriores al reset no pueden resucitar el progreso; operaciones causales posteriores sí.
- Aceptar cola offline solo al autenticar el actor correcto y comprobar `operation_id`; nunca aplicar cola de una cuenta a otra tras logout/login.
- Reintentos con backoff acotado; mostrar `Pendiente de sincronizar`, `Sincronizado`, `Necesita atención`. No anunciar sincronización antes de confirmación del servidor.
- Definir límites de lote, tamaño, antigüedad, rate limiting y purga de operaciones; asegurar atomicidad D1 para cambio+versión+idempotencia.

### 5.4 Anónimo → cuenta

- Sin registro se pueden leer seis guías y guardar progreso/favoritos localmente; no hace falta cookie de desbloqueo ni créditos.
- Al crear cuenta nueva: proponer fusión automática del estado anónimo local legítimo, deduplicada por IDs; al entrar a una cuenta existente: solicitar consentimiento **antes** de importar. Si se rechaza, no transferir.
- La fusión no crea entitlements ni altera licencia; si una guía está protegida, puede conservarse como favorita aunque no sea legible.
- Cerrar sesión: eliminar datos de cuenta de memoria/caches compartidas y evitar fuga en dispositivo multiusuario; conservar únicamente la cola anónima si el usuario lo permite y es seguro.
- Verificar implicaciones de cookies/consentimiento y política de privacidad existente antes de persistir identificadores locales.

## 6. Diseño de rutas y superficies (PROPUESTA)

| Superficie | Estado esperado | Reutilización |
| --- | --- | --- |
| `GET /aprende` | catálogo unificado, 6 destacadas, 9 itinerarios, filtros, búsquedas sin filtración | extender `knowledge.tsx` |
| `GET /aprende/:slug` | contenido completo si permitido, preview si no; 404 si no publicado | refactor `learn-article.tsx` |
| `GET /licencias` | planes comerciales oficiales; CTA de contacto; retorno conservado | reutilizar `licenses.tsx`, sin checkout inventado |
| `GET /app/aprende` o `/aprende/mi-biblioteca` | biblioteca personal, recientes, favoritos, progreso | **elegir ruta tras revisar navegación actual** |
| `/api/learn/progress` | lectura y escritura autenticada, validación y sincronización | ruta nueva propuesta |
| `/api/learn/favorites` | lectura/escritura de favoritos | ruta nueva propuesta |
| `/api/learn/preferences` | recomendaciones y recientes | ruta nueva propuesta |
| `/api/learn/sync` | operaciones idempotentes y merge de cliente | ruta nueva propuesta |

**No fijar nombres definitivos de endpoints** hasta comprobar patrón de loaders/actions y rutas existentes. Reutilizar autenticación y guards, no crear sesiones paralelas.

### 6.1 Catálogo

Orden: hero editorial, `Empieza aquí`, `Continuar leyendo` si aplica, buscador/filtros, catálogo completo, itinerarios, biblioteca personal. No ocultar bloqueadas. Badges `Siempre gratuita`, `Incluida con licencia`, `En progreso`, `Completada`; distinguir acceso de progreso. Filtros personales ausentes si no hay datos; estados vacíos y limpieza de filtros. Search pública limitada a **metadatos públicos**: no indexar cuerpo protegido ni devolver fragmentos internos; evaluar cambios SEO (sitemap, canonical, JSON-LD, cache y robots).

### 6.2 Preview y conversión

Mostrar título, intro, beneficios/objetivos públicos, categoría, duración, índice público revisado, favoritos y guías relacionadas; **nunca** secciones completas protegidas en HTML SSR, hydration payload, JSON, scripts inline, prefetch, headers o cache pública. CTA `Ver licencias Vecidya` con `returnTo=/aprende/<slug>` allowlist de rutas locales, sin redirección abierta ni URLs externas arbitrarias. Si licencia aún no activa: `Solicitud/activación pendiente` solo si el sistema realmente conoce ese estado; de lo contrario `Cuando tu licencia esté activa, vuelve a esta guía`. Ofrecer `Comprobar acceso` con lectura segura. El regreso puede ser manual/diferido.

### 6.3 Lector

Desktop: TOC accesible, indicador basado en checks, `Continuar` a última sección, checkboxes y confirmación de `Marcar completada`/`Reiniciar`. Móvil: botón compacto `Índice · NN%` con panel accesible y foco gestionado. Evitar layout shift y superposición de controles. `Comprueba lo aprendido` opcional, repetible; conservar componentes existentes. Las referencias editoriales y CTA no deben inducir a confundir educación con asesoría profesional.

### 6.4 Cuenta, privacidad y UX de errores

Estados: anónimo, registrado sin licencia, propietario habilitado, colaborador habilitado, permiso revocado, licencia cancelada, sesión expirada, activación pendiente, fallo de red, sincronización pendiente, conflicto resuelto, artículo retirado, contenido actualizado, vacío, búsqueda sin resultados. Mensajes honestos sin exponer organización o razón sensible. No usar dark patterns; accesibilidad de foco, contraste, semántica y lector de pantalla.

## 7. Seguridad y amenazas (PROPUESTA)

1. **Filtración SSR:** prohibir `article.sections` en respuesta pública para 42; probar HTML, JSON de loaders, hydration y `view-source`/fetch.
2. **Búsqueda como oráculo:** buscar solo campos públicos; no responder sí/no sobre texto protegido.
3. **Cache y CDN:** `private, no-store` para respuestas personales/protegidas o política equivalente probada; separar recursos públicos de contenido autenticado; revisar prefetch.
4. **IDOR entre usuarios:** toda consulta personal filtra por actor server-side; ignorar `userId` enviado por cliente.
5. **Cross-tenant:** permiso y licencia de **la misma organización**; no combinar licencia de A con permiso de B.
6. **Revocación:** cancelar licencia o quitar permiso debe invalidar autorización incluso con sesión abierta.
7. **CSRF y mutaciones:** exigir autenticación, método correcto, protección CSRF/origen según Better Auth y patrón actual; validación de payload y rate limits.
8. **XSS/editorial:** no introducir HTML sin sanitización; links externos seguros; no filtrar secretos en logs.
9. **Open redirect:** `returnTo` restringido a rutas internas de Aprende, tamaño acotado y canonicalización.
10. **Offline:** cola sin secretos; datos personales en almacenamiento local sujetos a política de privacidad y a riesgo de dispositivo compartido; limpiar al cambiar de cuenta.
11. **Abuso:** limitar escrituras y batches, no confiar en client timestamp, detectar operaciones duplicadas, no usar fingerprint.
12. **Auditoría:** cambios de permisos y licencias reutilizan auditoría de plataforma; progreso personal no debe producir telemetría de vigilancia empresarial.

## 8. Plan secuencial para el agente implementador

### Fase 0 — Baseline y decisiones bloqueantes (sin implementación)

**Entrada:** HEAD vigente, `AGENTS.md`, documentación canónica, este plan.  
**Tareas:** inventariar rutas, fuentes de licencias, tablas D1, relaciones propietario/miembro, permisos de invitación, autorización, expiración/cancelación, pruebas; confirmar 48/9/6 y slugs; revisar si existen créditos/desbloqueos heredados reales; confirmar uso actual de cookies/local storage. Documentar mapa de dependencias y riesgo de despliegue.  
**Salida:** propuesta de diff por fases, tabla `CODE vs PROPUESTA`, contratos reales de licencia/permiso, riesgos y decisiones abiertas resueltas.  
**Gate:** sin suposiciones sobre activación automática, permiso o migraciones.

### Fase 1 — Editorial y contrato público/privado

**Tareas:** revisión de seis candidatas; IDs estables; manifiesto de revisiones; clasificación always_free centralizada; DTO de preview con allowlist explícita; tests de 6/42, publicación, slugs y ausencia de `sections` en preview; revisar sitemap/SEO.  
**Dependencia:** F0. **Gate:** no activar bloqueo hasta verificar que las seis permanecen completas y que las 42 no se filtran por loader/SSR/JSON/búsqueda.  
**PR independiente:** contenido/DTO/seguridad editorial, sin cambios de D1 salvo justificación.

### Fase 2 — Entitlement y permiso organizacional

**Tareas:** implementar guard server-only apoyado en fuente real de licencias, relación activa, owner y permiso explícito; agregar permiso desactivado por defecto en invitaciones y gestión autorizada; invalidación en revocación; tests cruzados de organizaciones y roles.  
**Dependencia:** F0-F1. **Gate:** matriz de autorización completa, cero bypass; no confundir `platform_admin` con propietario.  
**PR independiente:** backend y controles de permiso; reconciliar `ARCHITECTURE`, `DATABASE` si procede y `TESTING`.

### Fase 3 — Experiencia pública, preview y retorno

**Tareas:** `Empieza aquí`, catálogo unificado, etiquetas, filtros, preview, CTA a `/licencias`, retorno allowlisted, estados de activación manual; SEO y accesibilidad.  
**Dependencia:** F1-F2. **Gate:** usuario sin licencia no recibe cuerpo protegido por ningún canal; usuario con licencia ve el artículo completo.  
**PR independiente:** rutas públicas y UI; no inventar pago.

### Fase 4 — Persistencia de progreso y favoritos

**Tareas:** migraciones Drizzle/D1 con constraints e índices; API personal autenticada; IDs de sección, checks, último punto, porcentaje, favoritos, recientes, reinicio explícito y versiones; preservación ante actualización editorial.  
**Dependencia:** F1-F2. **Gate:** datos aislados por usuario, reinicio/desmarcado correctos, retención de favoritos al perder licencia; migraciones probadas en D1 local limpia.  
**PR independiente:** D1 y UI personal mínima.

### Fase 5 — Sincronización, anónimo y offline temporal

**Tareas:** cola local, idempotencia, fusión de operaciones, conflictos, reset_epoch, control de versiones, merge anónimo→cuenta con consentimiento cuando ya existe cuenta, logout seguro, reintentos.  
**Dependencia:** F4. **Gate:** matrices con dos dispositivos, offline, replay, relojes desalineados, cambios concurrentes y cambio de usuario.  
**PR independiente:** sincronización, sin lectura offline completa.

### Fase 6 — Itinerarios, recomendaciones y UX avanzada

**Tareas:** compartir progreso entre nueve itinerarios, recientes, recomendaciones editoriales deterministas, ocultar/restaurar, lector móvil, repaso opcional; no crear motor de IA.  
**Dependencia:** F4-F5. **Gate:** sin créditos ni bloqueos indebidos; WCAG focalizada y no regresión de navegación.

### Fase 7 — Certificación y preparación de lanzamiento

**Tareas:** pruebas de acceso/SSR, SEO, 320/390/768/1366 px, lector de pantalla, teclado, expiración/revocación, activación manual, integridad D1, compatibilidad de migraciones, regresiones focalizadas de licencias e invitaciones, documentación canónica, feature flag/rollback si corresponde.  
**Dependencia:** F1-F6. **Gate:** evidencia `CODE+TEST+RAN`, revisiones de seguridad, de contenido y de accesibilidad; no marcar `PASS` por solo compilar.  
**Producción:** requiere autorización independiente, backup/rollback validado, migración remota autorizada y HTTP fechado posterior al deploy.

## 9. Matriz de pruebas focalizadas (especificación de casos)

**AUTH-01:** anónimo: 6 guías full, 42 preview.  
**AUTH-02:** registrado sin licencia: igual.  
**AUTH-03:** propietario con licencia activa: 48 full.  
**AUTH-04:** colaborador con permiso + licencia activa: 48 full.  
**AUTH-05:** colaborador sin permiso: 42 preview.  
**AUTH-06:** admin sin permiso y no propietario: 42 preview.  
**AUTH-07:** permiso en A + licencia solo en B: denegar; ambos en A: permitir.  
**AUTH-08:** revocación con sesión viva: denegar sin relogin; otra organización habilitante conserva acceso.  
**AUTH-09:** licencia cancelada/pendiente: denegar; reactivada: restaurar sin perder progreso.  
**AUTH-10:** usuario ajeno no consulta progreso de otro, ni con ID manipulado.  
**LEAK-01:** loader/HTML SSR/hydration/prefetch/cache no contiene fragmento centinela de cuerpo protegido.  
**LEAK-02:** búsqueda pública no revela ni permite inferir fragmentos internos protegidos.  
**LEAK-03:** borradores/retiradas: 404 y no sitemap; preview no indexa cuerpo protegido.  
**SYNC-01:** check y uncheck en mismo dispositivo; porcentaje correcto.  
**SYNC-02:** checks independientes de dos dispositivos convergen.  
**SYNC-03:** uncheck explícito posterior prevalece sobre check anterior.  
**SYNC-04:** reset_epoch impide resurrección de operaciones previas; acciones posteriores sobreviven.  
**SYNC-05:** reintento mismo operation_id no duplica efectos.  
**SYNC-06:** pérdida de red: cola persiste, no afirma sincronizado, se vacía tras confirmación.  
**SYNC-07:** relojes divergentes no alteran orden causal; concurrencia tiene desempate determinista.  
**SYNC-08:** login a cuenta existente exige consentimiento; rechazo no fusiona; logout a otra cuenta no filtra.  
**CONTENT-01:** nueva sección reduce porcentaje de completado; equivalentes conservan estado.  
**CONTENT-02:** renombrar/reordenar no destruye progreso; retirada no muestra contenido.  
**UI-01:** seis etiquetas siempre gratuitas, filtros y nueve itinerarios; rutas y enlaces relacionados.  
**UI-02:** favorito bloqueado no habilita lectura; historial oculto no borra progreso.  
**UI-03:** cuestionario opcional no afecta porcentaje.  
**UI-04:** retorno seguro desde licencias; URL externa rechazada; activación pendiente no concede acceso.  
**A11Y-01:** navegación teclado, foco del panel móvil, nombres accesibles, contraste, anuncios de estado.  
**REG-01:** pruebas focalizadas de licencias, invitaciones, SEO y Aprende existentes; typecheck, build y diff-check.

**Ejecución futura:** utilizar `pnpm run test:e2e:aprende-public` como base de regresión cuando aplique; crear scripts focalizados para nuevas rutas. Pruebas de Worker con D1 temporal local; no correr CI global ni E2E generales por defecto, salvo riesgo cruzado justificado. Nunca ejecutar `wrangler deploy` o `--remote` sin permiso.

## 10. Migraciones y compatibilidad

- Antes de asignar números, listar migraciones reales y `db/schema` en HEAD. No reservar números a ciegas.
- Crear migraciones aditivas con constraints e índices; backfill explícito y reversible donde sea viable; separar despliegue de esquema de activación de guardas.
- Si no existen desbloqueos históricos, no crear tabla de créditos; si existen, elevar decisión de preservación y migración al usuario **antes** de borrar datos.
- Desplegar en pasos compatibles con versiones previas; feature flag para proteger las 42 solo después de probar entitlement y preview.
- Rollback de código no debe exigir borrar tablas con progreso; migraciones remotas solo con aprobación.
- No persistir estado de licencia derivado en Aprende como fuente de verdad; resolver contra el servicio canónico.

## 11. Telemetría mínima y privacidad

Registrar métricas **agregadas** útiles para calidad del producto (guías visitadas, errores de autorización, fallos de sincronización) solo si la política de privacidad/consentimiento lo permite. No exponer lecturas individuales a organizaciones ni exportar comportamiento a GHL. No guardar respuestas a repasos ni construir perfiles psicológicos. Definir retención, borrado/exportación de datos personales y tratamiento de dispositivo compartido antes de lanzar.

## 12. SEO, contenido y UX

- Catálogo y previews indexables cuando su valor editorial sea genuino; no usar paywall como técnica para exponer texto protegido a crawlers.
- Revisar JSON-LD/OG/canonical/sitemap: metadatos públicos consistentes, sin textos completos licenciados.
- No inventar duraciones; calcular a partir del contenido en servidor y exponer solo número estimado, nunca el cuerpo en el DTO.
- Validar fuentes externas y fechas; diferenciar educación de asesoría legal, contable o técnica.
- Respetar voz editorial actual: `Comprende → Prioriza → Decide`; ejemplos de negocios cotidianos y lenguaje claro.
- Reutilizar estilos/assets existentes; no incorporar imágenes genéricas ni crear dependencia de librerías visuales innecesarias.

## 13. Criterios de aceptación globales

**No se declara V1 lista** hasta que: (a) 6/42 se cumple en todas las rutas y medios de respuesta; (b) permisos cruzados y revocación son correctos; (c) licencia real activa es fuente única; (d) progreso/favoritos sobreviven a cambios de licencia; (e) sincronización soporta uncheck/reset y offline temporal; (f) preview y búsqueda no filtran contenido; (g) las seis guías pasan revisión editorial; (h) UX móvil y accesibilidad focalizadas verificadas; (i) pruebas de Worker/D1 locales y CI del PR pasan; (j) documentación canónica reconciliada; (k) no se prometen pagos/activaciones automáticas; (l) cualquier deploy tiene aprobación y verificación HTTP fechada.

## 14. Decisiones y verificaciones todavía abiertas

1. **CODE pendiente:** identificar esquema/servicio real de licencias y semántica de `active`, permisos, roles, invitaciones, revocación, organización múltiple y auditoría. No implementar por inferencia.
2. **CODE pendiente:** confirmar patrón de sesión Better Auth, CSRF, consultas D1, nombres de tablas y capacidad de migración.
3. **EDITORIAL pendiente:** revisión integral de seis candidatas y aceptación final del texto; actualmente se aprueba el **método y selección provisional**, no una auditoría exhaustiva de cada fuente.
4. **PRODUCTO pendiente:** tratamiento de posibles créditos/desbloqueos antiguos **si existen**; no asumir existencia ni borrarlos.
5. **PRODUCTO pendiente:** definición de retención/exportación/borrado de historial de aprendizaje y texto legal/consentimiento.
6. **TÉCNICA pendiente:** contrato definitivo de sincronización concurrente (orden causal, desempate, límites de cola, versión de sección).
7. **COMERCIAL pendiente:** copy exacto del proceso manual de activación y forma real de volver a la guía; no añadir checkout ficticio.
8. **LANZAMIENTO pendiente:** política de feature flag, staging, rollback, monitoreo y autorizaciones de deploy.

Estos puntos no bloquean **documentar** el plan; sí pueden bloquear fases de código.

## 15. Instrucciones para el agente de código

```text
Misión: implementar Vecidya Aprende V1 únicamente en la fase que el usuario autorice.
Antes de editar: inspeccionar HEAD, AGENTS.md, GOVERNANCE, STATUS, PROJECT_STATE,
ROADMAP, ARCHITECTURE, DATABASE, TESTING y plans/aprende/PLAN-V1.md.
No asumir que el plan está implementado ni que los contratos de licencia ya existen.
No crear CRM, no duplicar GHL, no inventar pagos automáticos ni precios.
No trabajar en main ni tocar archivos ajenos.
En cada fase: explicar alcance, riesgos, rutas/tablas afectadas, pruebas focalizadas,
rollback, diff y evidencia. Usar Worker+D1 locales; no desplegar.
Si falta decisión bloqueante: detener solo esa parte y pedir decisión concreta.
No pasar a la siguiente fase sin cierre verificable y autorización.
```

## 16. Orden recomendado de PR futuros

| Orden | PR propuesto | Alcance máximo | Dependencia |
| --- | --- | --- | --- |
| 0 | `docs/aprende-baseline` | reconciliar contratos reales y decisiones bloqueantes | este plan |
| 1 | `feat/aprende-content-access` | clasificación 6/42, IDs, DTO y pruebas de no filtración | 0 |
| 2 | `feat/aprende-entitlement` | guardas y permiso explícito | 1 |
| 3 | `feat/aprende-public-ux` | catálogo, preview, licencias, retorno | 2 |
| 4 | `feat/aprende-personal-library` | D1, progreso, favoritos | 2 |
| 5 | `feat/aprende-sync` | offline temporal, merge, conflictos | 4 |
| 6 | `feat/aprende-pathways` | itinerarios, recomendaciones, lector móvil | 3,5 |
| 7 | `feat/aprende-certification` | QA y preparación de lanzamiento | 1–6 |

Los nombres son orientativos; el agente deberá elegir ramas nuevas sin colisiones. No integrar varias fases en un PR sin autorización expresa.

## 17. Registro de avance

| Fecha | Hito | Estado | Evidencia |
| --- | --- | --- | --- |
| 2026-10-28 | Modelo 6 gratuitas/42 con licencia, progreso personal, permisos explícitos y contratación central | APROBADO / DISEÑO | decisiones de producto |
| 2026-10-28 | Inspección de rutas, publicación editorial, lector, catálogo y licencias | CODE inspeccionado, sin ejecutar | archivos enumerados en §2 |
| 2026-10-28 | Plan maestro y estructura `plans/` | DOCUMENTADO, pendiente de revisión/merge | PR documental de este checkpoint |
| — | Fases 0–7 | NO INICIADAS | sin pruebas ni código nuevo |

**Próxima acción autorizable:** revisar este plan y aprobar **Fase 0** como checkpoint separado. Ninguna fase de implementación ni despliegue está autorizada por la creación de este documento.
