# VECIDYA APRENDE — PLAN MAESTRO FUNCIONAL Y TÉCNICO V1

**Identificador:** APRENDE-PLAN-V1 · **Fecha:** 2026-10-28 · **Estado:** PLAN CERRADO / FASES 1–6 INTEGRADAS; FASE 7 EN CERTIFICACIÓN TÉCNICA LOCAL, GATES DE LANZAMIENTO ABIERTOS · **Propietario de ejecución:** agente designado por el usuario.
**Repositorio:** `hola675/Vecidya` · **Producto:** `vecidya-platform/` · **Terminología obligatoria:** **licencia**, nunca membresía.  
**Alcance original de planificación:** únicamente documentación en `plans/`. La implementación posterior fue autorizada por el usuario y se ejecuta en checkpoints de aplicación aislados; no implica autorización de deploy ni cambios D1 remotos.

> **Fuente y niveles de certeza.** `APROBADO`: decisiones del usuario en la conversación de diseño. `CODE`: archivos inspeccionados en la rama predeterminada el 2026-10-28. `DOC`: estado descrito en documentos del repositorio, no revalidado por ejecución. `PROPUESTA`: diseño técnico por validar antes de implementarse. No confundir propuesta con función disponible.

## Leyenda inicial y estado de ejecución

**Cómo interpretar las marcas:** `[x]` = completado con evidencia del alcance indicado; `[~]` = documentado, pero pendiente de validación o decisión; `[ ]` = no iniciado; `[!]` = bloqueo que impide activar el siguiente paso. **Documentado no significa implementado, probado ni desplegado.**

**Fuentes de certeza:** `APROBADO` = decisión del usuario; `CODE` = inspección estática de archivos; `DOC` = documentación no revalidada; `PROPUESTA` = criterio por aprobar o comprobar; `TEST` = resultado ejecutado y fechado en §17 o en `docs/TESTING.md`.

**Resumen de avance por alcance, a 2026-10-29:**

| Tramo | Estado | Criterio de cierre |
| --- | --- | --- |
| Definición de producto, límites y 6/42 | [x] Diseño aprobado | §§1,3,19; candidatas editoriales aún por validar |
| Inspección estática de arquitectura y riesgos | [x] Inspección documental realizada | §§2,18,20,23,24,27–29; no equivale a auditoría dinámica |
| Contratos técnicos y matriz de pruebas | [x] Documentación preparada | §§4–16,21–30; propuestas sujetas a verificación |
| Fase 0 — diseño y handoff documental | [x] Plan de implementación cerrado; comprobaciones técnicas diferidas | Las verificaciones pendientes se ejecutan como gates focales de cada PR, no como planificación adicional |
| Fase 1 — identidad editorial y DTOs seguros | [~] Integrada; validación editorial pendiente | PR #183; manifest/DTOs; revisión y aceptación editorial 6/42 pendiente |
| Fase 2 — licencias y grants | [~] Integrada por PR #185 | Worker/D1, aislamiento, owner/admin, revocación, auditoría y privacidad pasan; sin deploy |
| Fase 3 — catálogo, previews y retorno | [x] Integrada por PR #186 | Filtros/etiquetas, retorno allowlisted y activación manual; QA y CI PASS |
| Fase 4 — progreso y favoritos D1 | [x] Integrada por PR #187 | Migración `0032`, progreso personal, favoritos, reset epoch; Worker/D1, QA y CI PASS |
| Fase 5 — sincronización y anonimato | [x] Integrada por PR #190 | Migración `0033`, sync idempotente, importación con consentimiento y cola temporal; Worker/D1 y CI PASS; producción pendiente de revisión de retención |
| Fase 6 — itinerarios y UX | [x] Integrada por PR #193 en `main@3fdc17cc`; sin publicar | Progreso compartido por guía en nueve itinerarios, recomendaciones editoriales, ocultar/restaurar, repaso opcional y QA responsive/teclado |
| Fase 7 — certificación y preparación de lanzamiento | [~] Certificación técnica local parcial | Worker/D1, privacidad de bundle, SEO, 48 guías y cuatro viewports pasan; falta revisión de seguridad independiente, aceptación editorial 6/42, retención, lector de pantalla y zoom 200 %. No habilita despliegue |

**Lectura rápida:** §0 instrucciones; §§1–7 requisitos y contratos; §8 fases; §§9–16 validaciones, decisiones y PR; §17 bitácora; §§18–29 evidencias y decisiones ampliadas; §30 handoff. **En caso de discrepancia, las decisiones posteriores explícitas (§§19,25,27–29) refinan las propuestas anteriores, pero nunca sustituyen una decisión APROBADO sin confirmación del usuario.**

### Dependencias y escalado progresivo

`D0 baseline validado` → `D1 identidad editorial + clasificación 6/42` → `D2 DTO público seguro + guard de cuerpo` → `D3 entitlement real + grants` → `D4 catálogo/preview/retorno` → `D5 progreso D1` → `D6 sync y anónimo` → `D7 itinerarios/UX` → `D8 QA y lanzamiento autorizado`.

**Regla de publicación:** D1 y D2 pueden prepararse internamente, pero **no se activa el modelo 6/42 en una ruta pública hasta que D2 y D3 estén integrados y los tests de filtración pasen**. La persistencia D5 puede desarrollarse en paralelo a D4 después de D3, en PR aislado; D6 depende de D5; D7 integra D4 y D6. D8 depende de todas las anteriores. No desplegar ni migrar D1 remota sin aprobación expresa.

**Escalado seguro:** primero contratos y tests aislados, después D1 local, después integración con licencias reales, luego staging autorizado y por último producción autorizada. Cada salto requiere evidencia del paso anterior, rollback compatible con guard y revisión de privacidad; no confundir avance de documentación con avance de producto.

### Registro de incoherencias detectadas y criterio de lectura

- **Permisos:** decisión final del usuario: exclusivamente el rol organizacional `owner` concede y revoca grants Aprende. `admin` no puede gestionarlos por su rol. No cambia la matriz global de Better Auth.
- **Importación anónima:** §3.2.19 planteaba fusión automática al crear cuenta, mientras §§19,21,25 exigen consentimiento. Se adopta la regla más protectora: **consentimiento explícito antes de toda importación**, tanto cuenta nueva invitada como existente; requiere confirmación de producto antes de implementarse.
- **Sincronización:** §3.2.17 menciona fusionar operaciones independientes, pero §§25 y 29 proponen rechazo de versiones obsoletas por guía. Para V1, **conflicto explícito por versión** es la política provisional; optimizar fusiones independientes solo con pruebas de causalidad.
- **Orden de PR:** §16 describe ocho checkpoints y §30 agrupa cuatro PR de implementación. Son **dos niveles de granularidad**, no calendarios incompatibles: mantener gates D0–D8 aunque se agrupen entregas únicamente con autorización.
- **Cierre:** §17 mantenía «Fases 0–7 no iniciadas», aunque hubo inspección estática. Interpretar Fase 0 como **trabajo documental avanzado sin validación ejecutada**; el estado vigente de Fases 1–7 se registra en la matriz inicial y §17.

---

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
6. El permiso de colaborador para Aprende estará **desactivado por defecto** en invitaciones. Solo el usuario con rol `owner` de la organización puede concederlo o revocarlo; decisión definitiva aprobada por el usuario. no implica rol admin ni acceso a datos comerciales. Admin sin permiso Aprende no lo hereda automáticamente, salvo que sea propietario.
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
19. Historial anónimo de seis guías: persistencia local de lectura/favoritos cuando el navegador lo permita; al entrar en cualquier cuenta obtenida por invitación, solicitar consentimiento explícito antes de importar o fusionar; Evitar fingerprinting. Al rechazar no transferir datos; limpiar adecuadamente estados privados al salir.
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
| 2026-10-29 | Fase 1: identidad editorial y DTOs | IMPLEMENTADA / aceptación editorial pendiente | PR #183 integrada; 48 guideId, 387 sectionId, revisión 1, clasificación 6/42; tests de catálogo y privacidad ejecutados; gratuidad aún provisional |
| 2026-10-29 | Fase 2: entitlement y grants owner-only | INTEGRADA / no publicada | PR #185 (`main@3154cfe5`); migración `0031`, OpenAPI, grants y guard de artículo; Worker+D1, bundle, typecheck/build/unit y CI PASS; sin D1 remota ni deploy |
| 2026-10-29 | Fase 3: catálogo, preview y retorno | INTEGRADA | PR #186 en `main@9b39ffde`; 1.756 unitarias, QA responsive, typecheck/build/diff-check y CI PASS |
| 2026-10-29 | Fase 4: progreso y favoritos personales | INTEGRADA | PR #187 en `main@67c2d1fa`; `0032`, Worker/D1 E2E, aislamiento, reset epoch, favoritos tras revocación, unitarias, QA, typecheck/build y CI PASS |
| 2026-10-29 | Fase 5: sync, anónimo y offline temporal | INTEGRADA / PRODUCCIÓN PENDIENTE | PR #190 en `main@3d91f15d`; `0033`, cola/consentimiento/logout y POST transaccional; Worker/D1 dos dispositivos, replay/reset, cola 5/5 y tres workflows CI PASS. Sin D1 remota ni deploy; retención de recibos pendiente de revisión legal/operativa |
| 2026-10-29 | Fase 6: itinerarios y UX | INTEGRADA / PR #193; sin publicar | `main@3fdc17cc`; sin nueva migración; progreso de guías compartido en nueve rutas, sugerencia determinista, restauración de recientes y repaso opcional; unitarias 3/3, Worker/D1, QA Playwright responsive/teclado, typecheck/build y diff-check PASS; sin deploy |
| 2026-10-29 | Fase 7: certificación técnica local | PARCIAL; lanzamiento bloqueado | D1 `0000–0033`, FK integrity, entitlement/revocación, bundle de 114 assets/2.074 fragmentos, 81 unitarias, QA pública 48 guías/9 rutas/4 viewports, typecheck/build/Drizzle y CI PR #193 PASS. AccessLint no pudo iniciarse en Windows; lector de pantalla y zoom real pendientes. Revisión editorial 6/42 y retención legal/operativa pendientes; sin deploy ni D1 remota |
| 2026-10-28 | Inspección de rutas, publicación editorial, lector, catálogo y licencias | CODE inspeccionado, sin ejecutar | archivos enumerados en §2 |
| 2026-10-28 | Plan maestro y estructura `plans/` | DOCUMENTADO, pendiente de revisión/merge | PR documental de este checkpoint |
| 2026-10-28 | Fase 0: inspección estática y diseño de contratos (§§18–30) | DOCUMENTACIÓN AVANZADA / VALIDACIÓN PENDIENTE | PR #182; sin pruebas ni código de aplicación |
| — | Fase 7 | EN CURSO — CERTIFICACIÓN LOCAL PARCIAL | Cierre requiere revisión de seguridad independiente, aceptación editorial de 6/42, política legal/operativa de retención, lector de pantalla y zoom 200 %; cualquier despliegue y migración remota conserva autorización específica |

**Siguiente checkpoint:** resolver los gates abiertos de la Fase 7. Antes de producción deben aceptarse editorialmente las seis guías gratuitas y la clasificación 6/42, aprobarse retención/borrado de recibos y completarse las revisiones independientes de seguridad y accesibilidad. La validación de esta rama no implica despliegue ni migración D1 remota.


## 18. Fase 0 — inspección ampliada de licencias, permisos y capacitación (CODE, 2026-10-28)

**Alcance de evidencia:** inspección de archivos fuente, sin ejecución de pruebas ni lectura de datos reales. Este bloque refina las hipótesis de las secciones 2, 4 y 8; no certifica la Fase 0 como terminada.

### 18.1 Hallazgos verificados

| Fuente | Hecho del código | Consecuencia para Aprende |
| --- | --- | --- |
| `db/queries/licensing.server.ts` | `planCodes = cuadra, barrio, ciudad`; `organizationLicenseStatuses = pending, active, suspended, cancelled` | Reutilizar fuente de licencia y exigir `status === active`, no crear estado comercial paralelo |
| `db/queries/licensing.server.ts` | `getOrganizationLicense(database, organizationId)` prioriza licencia no cancelada y conserva cancelada como fallback; `changeOrganizationLicensePlan` cancela fila previa y crea otra activa | El entitlement debe consultar estado vigente y tolerar cambio de fila/plan sin perder progreso |
| `app/routes/api-platform-licensing.ts` | Asignación, cambio, suspensión, reactivación, cancelación y transferencia controladas por `platform_admin` y auditadas; sin checkout automático | No diseñar webhook ni pago automático; el CTA remite al flujo comercial existente |
| `server/auth/authorization.server.ts` | Permisos organizacionales actuales son un conjunto fijo por rol `owner/admin/member`; no existe `learn.full_access` en ese conjunto | **Bloqueo de diseño:** implementar permiso explícito por colaborador sin otorgar rol admin; definir almacenamiento, API y gestión de permisos |
| `app/routes/api-organization-invitations.ts` | Invitaciones actuales aceptan `email` y `role=member|admin`; no tienen campo de permiso Aprende | Extender invitación con valor por defecto falso y aplicación segura al aceptar, o concesión posterior auditada |
| `app/routes/api-organization-members.ts` | Gestión actual permite cambiar rol y retirar miembro, no gestionar permiso Aprende | Añadir acción separada con guardas y auditoría, sin tocar otras autorizaciones |
| `app/routes/api-organization-authorization.ts` | Lista permisos por rol, no excepciones individuales | Exponer permiso efectivo Aprende separado del listado estático por rol; no fingir que el rol lo incluye |
| `app/routes/api-organization-training.ts` | Ya existe `organizationTrainingAssignment` y `organizationTrainingProgress`, vinculados a organización/asignación y usuario | **No reutilizar estas tablas para progreso personal global de Aprende** |
| `app/routes/api-platform-training.ts` | Plataforma puede asignar capacitación y corregir progreso con motivo/auditoría | Mantener capacitación organizacional separada de Aprende; evitar acceso de admins a historial personal de Aprende |

### 18.2 Decisión arquitectónica recomendada

**Separar explícitamente tres dominios:**

1. **Licensing** (existente): única fuente de licencia activa por organización.
2. **Organization access** (existente + extensión focal): relación de usuario con organización y permiso explícito de uso de Aprende. **Propuesta de persistencia:** tabla de grants por `organization_id + user_id` (o `member_id` si garantiza lifecycle correcto), permiso `learn.full_access`, `granted_by`, `granted_at`, `revoked_at`/estado, auditoría; no extender roles globales para un permiso individual. Revisar antes el schema de Better Auth y restricciones de borrado.
3. **Personal learning** (nuevo): progreso y favoritos por `user_id + guide_id`, independientes de `organization_id`. Nunca incluir `organization_id` como parte de la identidad de progreso ni usar `organizationTrainingProgress`.

**Consulta efectiva:** recorrer organizaciones donde el usuario tiene relación activa; unir licencia **de la misma organización** en estado `active`; aceptar `owner` o grant vigente de Aprende para ese usuario. No derivar autorización del `billing_account.owner_user_id`: el propietario de facturación no es necesariamente el propietario de la organización ni su colaborador autorizado.

**Revocación:** al quitar miembro, grant o licencia, el próximo acceso al contenido debe consultar el estado real. Diseñar invalidación si se introduce caché. Al cambiar de plan se mantiene el derecho mientras exista una licencia vigente activa. La gestión de grants debe auditar actor, organización, destinatario, acción y fecha, sin registrar lecturas individuales.

**Invitaciones:** no confiar en un checkbox client-side. Si se concede permiso durante la invitación, persistir intención autorizada y aplicar grant **solo después de aceptación válida**, verificando que el usuario aceptante coincide con el invitado y que la organización sigue siendo la correcta. Alternativa más sencilla para V1: invitación sin permiso y concesión explícita tras aceptar; **requiere decisión UX** porque la propuesta aprobada exige desactivado por defecto, no necesariamente concesión dentro del formulario de invitación.

### 18.3 Dependencias concretas aún por inspeccionar

- `db/schema/auth.ts`, `db/schema/licensing.ts` y migraciones vigentes: claves, foreign keys, borrado de miembros, ownership, unicidad de licencia y estrategia de índices.
- `server/auth/session.server.ts`: cómo consultar todas las relaciones activas del usuario sin depender de organización seleccionada.
- `db/queries/organization.server.ts` y configuración Better Auth: invitaciones aceptadas, roles, membresías retiradas y persistencia.
- `db/queries/platform-training.server.ts`: límites exactos del módulo de capacitación y eventual reutilización de componentes **solo de UI**, no de datos.
- `app/routes/license-detail.tsx` y flujos de contacto: CTA comercial real y retorno a guía sin prometer activación instantánea.
- Tests de licencias, autorización, invitaciones y capacitación: seleccionar regresiones focalizadas; no correr batería general.
- Política de eliminación/exportación de datos personales y retención de grants/auditoría.

### 18.4 Criterios adicionales para Fase 0

- [ ] Identificar tablas/índices y constraints reales para grants.
- [ ] Validar si el owner de Better Auth puede transferirse y cómo se detecta owner actual.
- [ ] Confirmar cómo se resuelven **todas** las organizaciones activas de una cuenta.
- [ ] Elegir persistencia del permiso explícito y transición de invitación.
- [ ] Verificar semántica exacta de licencia activa y cambios de plan.
- [ ] Confirmar que capacitación organizacional y Aprende personal nunca comparten progreso.
- [ ] Registrar pruebas focalizadas existentes y estrategia de rollout sin tocar producción.

**Estado:** Fase 0 EN PROGRESO (inspección documental de código); implementación F1–F7 NO INICIADA.


## 19. Decisión definitiva: altas exclusivamente por invitación

**APROBADO por el usuario.** Vecidya no permite registro público de cuentas. Aprende no crea cuentas, organizaciones, licencias ni permisos por sí mismo. Toda cuenta autenticada se origina en una invitación válida gestionada por el flujo existente de Better Auth y Vecidya.

- Visitantes anónimos: acceso completo a las seis guías gratuitas; progreso y favoritos únicamente locales cuando el navegador lo permita.
- Usuarios con cuenta creada por invitación: progreso personal sincronizable; no desbloquean las 42 guías por el mero registro.
- Propietarios de organización con licencia activa o miembros con permiso explícito de Aprende y licencia activa de esa misma organización: acceso a las 48 guías.
- Prohibido introducir botón de registro público, alta personal independiente, excepción al control de invitaciones o checkout automático.
- Si un visitante anónimo desea sincronización, explicar que necesita una invitación de Vecidya; no prometer alta inmediata.
- En la aceptación de invitación, fusionar progreso anónimo con consentimiento si se entra a una cuenta existente; no otorgar licencia ni permiso Aprende implícitamente.

**Ajuste al alcance de Fase 0:** se elimina cualquier propuesta de registro personal público. Verificar la conservación del guard de invitación de `server/auth.server.ts` mediante prueba focalizada. No hay implementación autorizada.


## 20. Fase 0: invitaciones, permisos y diseño D1 (propuesta)

Inspección estática: `api-organization-invitations.ts` acepta correo y rol member/admin; `invitation.tsx` exige sesión, correo verificado e invitación válida antes de aceptar; `api-organization-members.ts` permite cambiar rol o retirar miembros; `auth-plugins.server.ts` limpia la organización activa de sesiones al retirar miembro. Ninguna de estas rutas concede permiso Aprende. Las cuentas continúan siendo exclusivamente por invitación.

**Diseño recomendado:** crear una tabla `organization_learn_permission` con `member_id` como clave única y FK a `member.id` con eliminación en cascada, `enabled`, `granted_by`, `granted_at`, `revoked_by`, `revoked_at`, `updated_at`. Usar auditoría de plataforma para concesión y revocación. Confirmar compatibilidad con migraciones y claves actuales antes de fijar esquema. El permiso nace desactivado: invitación, aceptación y cambio de rol no lo conceden. La concesión se hace después de aceptar la invitación, por propietario o gestor autorizado, comprobando la organización del miembro. Una nueva invitación tras una baja no debe restaurar permisos anteriores.

**Consultas:** para contenido protegido, comprobar sesión, membresía actual, estado de organización, licencia activa de la misma organización y rol owner o permiso explícito. Consultar todas las organizaciones del usuario; no solo la seleccionada en sesión. El progreso y favoritos siguen vinculados a `user.id`, nunca a una organización.

**Pruebas propuestas:** invitaciones pendientes/canceladas/expiradas no conceden acceso; aceptación sin grant tampoco; concesión/revocación auditadas; eliminación del miembro invalida grant; reinvitación no restaura permiso; cambio de rol no lo concede; organización suspendida no habilita; varias organizaciones se evalúan sin mezclar permisos y licencias; registro sin invitación sigue prohibido.

**Migraciones futuras:** aditivas, con índice único y FK comprobadas en D1 local; identificar número real de migración y rollback antes de escribir SQL. Sin migraciones remotas ni deploy.

**Estado:** documentación; Fase 0 en progreso. No se ha implementado código.


## 21. Fase 0 — contrato de progreso personal, sincronización y revisiones (propuesta técnica)

**Evidencia CODE:** `app/content/learn.ts` define guías por `slug`, con `sections` sin ID estable; `app/routes/learn-article.tsx` genera anclas `section-${index+1}` y su loader devuelve el artículo completo; `app/content/learn-publication.ts` filtra publicación por `editorialDraft`, sin licencia; `db/client.server.ts` usa Drizzle con Cloudflare D1. Ninguna de estas fuentes implementa el progreso personal propuesto.

**Contrato editorial:** agregar a cada guía un `guideId` inmutable (o usar slug como identidad solo si se garantiza alias/migración ante renombres), `contentRevision` semántica y a cada sección `sectionId` estable, independiente del título y posición. Validar IDs únicos por guía, orden explícito, y manifest de revisiones para mapear secciones equivalentes. El progreso solo considera secciones activas de la revisión vigente; una sección nueva significativa comienza sin marcar. Nunca inferir completado por scroll. Un cambio editorial no debe marcar una sección nueva automáticamente.

**Tablas D1 propuestas, NO creadas:**
- `learn_guide_progress`: `user_id`, `guide_id`, `revision_seen`, `last_section_id`, `updated_at`; UNIQUE `(user_id,guide_id)`; FK de usuario con cascada.
- `learn_section_progress`: `user_id`, `guide_id`, `section_id`, `completed`, `updated_at`, `logical_version`; UNIQUE `(user_id,guide_id,section_id)`. No usar posición ni heading como clave.
- `learn_favorite`: `user_id`, `guide_id`, `is_favorite`, `updated_at`; UNIQUE `(user_id,guide_id)`. Admitir favoritos de guías bloqueadas por licencia.
- `learn_recent_visibility`: `user_id`, `guide_id`, `hidden_at` y última lectura; ocultar recientes no borra progreso.
- `learn_recommendation_dismissal`: `user_id`, `guide_id`, `dismissed_at` y revocación; reversible.
- `learn_sync_operation`: `user_id`, `operation_id`, `device_id`, `guide_id`, `operation_type`, `base_version`, `server_version`, `created_at`; UNIQUE `(user_id,operation_id)`; índice por usuario/guía/versión; retención limitada con ventana de reintentos definida. **No guardar cuerpos protegidos**.

**Semántica de sincronización:** operaciones explícitas `section_check`, `section_uncheck`, `guide_mark_all`, `guide_reset`, `favorite_set`, `recent_hide`, `recommendation_dismiss` y reversión. Identificador idempotente por operación, versión monotónica asignada en servidor por guía y usuario, precondición `base_version`, y respuesta de conflicto con snapshot autorizado de progreso. Reset crea barrera de versión: operaciones antiguas no reviven checks. No aplicar unión OR de checks, ni ordenar por reloj del dispositivo. Reintentos del mismo `operation_id` devuelven el resultado ya registrado. Operaciones con versión obsoleta se rechazan o reconcilian solo mediante política determinista documentada y testeada.

**Anonimato y sesión:** las seis guías gratuitas permiten progreso local; ningún dato anónimo entra en D1 sin una cuenta obtenida por invitación. Tras iniciar sesión, ofrecer importación consentida y revisión de conflictos para una cuenta existente. No mostrar botón de registro público. La cola offline conserva solo operaciones de progreso y favoritos, no contenido completo protegido. Revalidar licencia al solicitar cuerpo protegido; el progreso ya almacenado permanece si se suspende licencia.

**Privacidad y control:** todas las consultas D1 de progreso se limitan al `session.user.id` del servidor, nunca a un `userId` suministrado por cliente; validar slugs, IDs, tamaños y operaciones; aplicar CSRF y límites de carga. El resumen público de las 48 guías no debe incluir `sections`, bloques, respuestas ni otros cuerpos protegidos en SSR, loader, hydration, búsquedas o caché.

**Pruebas focalizadas adicionales:** dos dispositivos con check/uncheck; reset contra cola atrasada; reintento idempotente; revisión editorial con sección nueva; renombre de sección; borrado editorial; favorito en guía bloqueada; importación anónima con consentimiento; intento de escribir progreso ajeno; caducidad de licencia durante lectura; inspección de payload público sin contenido protegido.

**Decisiones técnicas antes de migrar:** política de conflicto exacta, retención de operaciones, tratamiento de guía retirada, almacenamiento de alias de slug, y si versiones por guía bastan o se requieren versiones por agregado. Primero pruebas de contrato; después migraciones aditivas D1 local; ninguna modificación remota sin autorización.

**Estado:** diseño documental de Fase 0, no implementación.


## 22. Fase 0 — contrato de seguridad: catálogo público y cuerpos protegidos

**Código inspeccionado:** `app/routes/knowledge.tsx`, `app/routes/learn-article.tsx`, `app/content/learn-publication.ts`, `app/routes/sitemap.ts`, `app/routes.ts`. Inspección estática, sin ejecución.

**Hallazgos:**
- `knowledge.tsx` filtra búsquedas contra título, extracto **y cuerpo completo** (secciones, párrafos y bloques), aunque devuelve solo campos resumidos. Cuando se protejan 42 guías, esto podría convertirse en un canal de inferencia del contenido protegido si no se separan índices.
- `learn-article.tsx` entrega `{article,readingMinutes}` desde el loader, con todas las secciones; `meta` usa título e introducción. Hoy no comprueba licencias, porque Aprende V1 todavía no está implementado.
- `learn-publication.ts` devuelve objetos `LearnArticle` completos para publicaciones; filtra borradores pero no derechos de acceso. No debe reutilizarse como DTO público sin proyección explícita.
- `sitemap.ts` lista rutas de todas las guías publicadas mediante `getPublicLearnArticles`; una URL de preview pública puede aparecer en sitemap sin que el cuerpo protegido sea accesible.

**Contrato propuesto:**
1. `PublicGuideSummary`: `slug`, `category`, `title`, `excerpt`, `image`, `imageAlt`, `isFree`, `estimatedMinutes`, `publicationState`; solo campos aprobados editorialmente como públicos. Nunca `sections`, `blocks`, respuestas, textos internos ni estructura protegida. Evitar `...article` y usar allowlist.
2. `PublicGuidePreview`: campos del resumen más `intro` y texto de muestra explícitamente aprobado para publicación; no derivar automáticamente de secciones protegidas. El estado de acceso para visitantes no debe exponer datos de usuario.
3. `AuthorizedGuideBody`: cuerpo completo con `sectionId` estable y `contentRevision`, solo tras evaluación de `guide.isFree || hasLearnEntitlement(session.user.id)` en el servidor para esa petición. Guía retirada/borrador: 404, salvo flujo editorial explícito fuera de alcance.
4. `GET /aprende`: búsqueda pública solo sobre campos del `PublicGuideSummary` y taxonomía pública. No buscar en cuerpos protegidos ni permitir deducir coincidencias privadas mediante conteos o ranking. Índice de búsqueda completo solo si existe autorización y se filtra su salida de forma segura; V1 puede limitarse a índice público para todos.
5. `GET /aprende/:slug`: misma URL para guía gratuita, preview protegida y cuerpo autorizado. La carga inicial determina estado en servidor. No enviar cuerpo protegido en loader, SSR, hidratación, `defer`, prefetch, meta, JSON-LD, logs ni datos de error de la vista bloqueada. No basta con ocultar el DOM por CSS.
6. `sitemap.xml`: mantener solo rutas de guías publicadas con preview apta para indexación. No incluir rutas de API privadas ni borradores. Las 42 previews pueden indexarse si su contenido público es suficientemente útil y aprobado.
7. **Caché:** previews y resúmenes son públicos y pueden usar caché compartida con política explícita. Respuestas con cuerpo autorizado: `Cache-Control: private, no-store`; `Vary: Cookie` si aplica; no almacenar en caché compartida ni Service Worker. Al revocar licencia/permiso, siguiente solicitud de cuerpo debe reevaluar derechos.
8. **Separación de contenido:** en módulos de servidor puede existir el corpus completo, pero nunca serializarlo accidentalmente. Evaluar importación y bundling para que el corpus protegido no quede embebido en JS público; prueba de artefactos de build.
9. **CTAs:** guía bloqueada muestra valor de la licencia Cuadra/Barrio/Ciudad, con navegación a información comercial; sin checkout automático ni alta pública. Cuenta solo por invitación.

**Pruebas focalizadas de seguridad:**
- `LEAK-01`: visitante anónimo recibe resumen y preview, pero ningún texto exclusivo del cuerpo de una de las 42 guías en HTML, JSON, SSR/hidratación o bundle cliente.
- `LEAK-02`: búsqueda por frase exclusiva de sección protegida no devuelve esa guía ni modifica conteos de resultados.
- `LEAK-03`: guía gratuita sí entrega cuerpo completo anónimamente.
- `LEAK-04`: licencia suspendida, organización suspendida, miembro retirado o permiso revocado dejan de obtener cuerpo desde siguiente solicitud.
- `LEAK-05`: caché pública no comparte respuestas autorizadas entre usuarios; verificar cabeceras y caché de borde.
- `LEAK-06`: sitemap, meta, JSON-LD, sugerencias, relacionados y errores no incluyen contenido protegido.
- `LEAK-07`: prefetch y navegación cliente no evaden autorización.
- `LEAK-08`: cambio de organización activa no mezcla derechos entre organizaciones.

**Secuencia de implementación futura:** primero DTOs con allowlist y tests de no filtración; después entitlement; luego loader de lectura y búsqueda; finalmente UX. No abrir las 42 guías a través del loader antiguo durante migración.

**Estado:** Fase 0 documentada parcialmente; sin implementación ni despliegue.


## 23. Fase 0 — inventario real de migraciones y pruebas focalizadas

**Inspección del repositorio (solo lectura):**
- Directorio `vecidya-platform/db/migrations/`: secuencia existente desde `0000_init_platform_meta.sql` hasta `0030_business-profile-tiktok-youtube.sql`, con `meta/_journal.json`. **No reservar aún `0031`** sin verificar HEAD de la rama de implementación y contenido del journal: puede haber migraciones concurrentes.
- `tests/unit/learn/`: `learn-curriculum.test.ts`, `learn-management-03.test.ts`, `learn-publication-boundary.test.ts`; también `tests/unit/learn-content.test.ts` y `learn-catalog-integrity.test.ts`.
- `tests/unit/invitations/`: `invitation-rules.test.ts`, `team-labels.test.ts`; `tests/unit/auth/`: `authorization-harness-diagnostics.test.ts`, `organization-http-surface.test.ts`.
- `tests/unit/licensing/calculator.test.ts`, `tests/ci/licensing-contract.test.mjs`, `tests/e2e/aprende-public-qa-check.mjs`.
- `package.json` incluye `test:e2e:aprende-public`, `test:unit`, `typecheck` y `build`. **La existencia de scripts no prueba que pasen.** No se ejecutó ninguno durante esta revisión.

**Política de ejecución aprobada:** usar solo pruebas focalizadas de archivos modificados, sin lanzar toda la suite ni CI general en cada iteración; `typecheck` y `build` cuando la modificación los justifique. Mantener cambios fuera de GHL/CRM. Antes de modificar el esquema, verificar scripts reales de migración, journal y mecanismos de rollback sobre D1 local aislada. No modificar D1 remota ni producción.

**Secuencia de trabajo recomendada para agente de implementación:**
1. Congelar contratos y tests focalizados del catálogo público y privacidad de payloads (LEAK-01..08); preservar comportamiento existente de guías gratuitas.
2. Definir esquema D1 aditivo de grants, progreso y operaciones, con claves foráneas, índices, borrado y migración local verificada; evitar acoplarse a tablas de formación organizacional.
3. Crear consulta de entitlement con tests focalizados de licencia, membresía, rol y organización suspendida; sin alterar el sistema general de permisos.
4. Migrar loader de catálogo y lectura a DTO públicos y cuerpo autorizado, con tests de SSR/hidratación y build.
5. Implementar progreso y sincronización con tests de concurrencia, reset e idempotencia.
6. Integrar UI, itinerarios y accesibilidad; ejecutar QA focalizada Aprende.
7. Entregar evidencias por commit/PR y checklist para autorización explícita de merge/deploy.

**Condiciones de aceptación de Fase 0:** esquema y journal revisados; tests existentes leídos (no solo inventariados); contrato de endpoints y autorización cerrado; estrategia de conflictos definida; amenazas de filtración cubiertas por tests; lista de rutas/archivos impactados y plan de rollback. Hasta entonces Fase 0 continúa abierta.

**Estado:** inventario confirmado; pruebas no ejecutadas; ninguna migración ni código modificado.


## 24. Fase 0 — lectura del journal y contratos de pruebas existentes

**Fuentes inspeccionadas:** `db/migrations/meta/_journal.json`, `tests/unit/learn/learn-publication-boundary.test.ts`, `tests/unit/invitations/invitation-rules.test.ts`, `tests/unit/auth/organization-http-surface.test.ts`, `tests/e2e/aprende-public-qa-check.mjs`. Revisión estática; no se ejecutaron tests.

**Journal:** `version: 7`, `dialect: sqlite`, 31 entradas indexadas 0..30, última `0030_business-profile-tiktok-youtube`. El futuro agente debe volver a consultar el HEAD antes de reservar nombre de migración y no tocar D1 remota.

**Incompatibilidad de pruebas a resolver durante implementación:** la suite editorial actual comprueba que las 48 guías estén publicadas y sean accesibles; eso debe preservarse **como 48 URLs de preview**, pero no como 48 cuerpos completos anónimos. El E2E público exige 48 enlaces, 48 HTTP 200, sitemap con 48 URLs, seis temas y nueve itinerarios; esas expectativas son compatibles con previews públicas, pero cualquier aserción de cuerpo completo de las 42 guías protegidas debe actualizarse expresamente. No relajar la comprobación de 48 publicaciones ni convertir 42 URLs en 404. Diferenciar claramente `published` de `freeFullAccess`.

**Pruebas de invitación:** `invitation-rules.test.ts` verifica invitación pendiente, cancelada, rechazada, expirada, correo incorrecto, correo sin verificar y aceptación; `organization-http-surface.test.ts` bloquea por defecto endpoints del plugin Organization fuera de allowlist. El nuevo grant Aprende deberá exponerse por una ruta propia con controles de autorización, sin ampliar la allowlist general del plugin ni abrir registro público.

**Adaptación focal recomendada:**
1. Conservar `learn-publication-boundary.test.ts` para publicación editorial y añadir test de proyección pública que compruebe ausencia de `sections` y `blocks`.
2. Ajustar `aprende-public-qa-check.mjs` para exigir 48 previews 200, 6 cuerpos gratuitos completos y 42 previews sin texto protegido, incluyendo SSR/hidratación; conservar conteos, sitemap, responsive y borradores.
3. Añadir tests aislados para el guard de registro por invitación, y para concesión/revocación de Aprende sin depender de rol admin.
4. No ejecutar `test:unit` general ni toda la batería E2E como condición de cada cambio. Ejecutar archivos afectados y, al cierre, solo las pruebas focalizadas acordadas.

**Riesgo concreto:** si se reutiliza `getPublicLearnArticles` como respuesta JSON pública, se serializan objetos con secciones. Separar función editorial de funciones de DTO público; no cambiar la semántica editorial de publicación.

**Pendiente de Fase 0:** revisar scripts de migración/rollback, tablas auth reales y prueba de seguridad de artefactos build; cerrar contrato de concurrencia para sync. No hay implementación autorizada.


## 25. Contrato de concurrencia y migraciones D1 (propuesta)

**Fuentes inspeccionadas:** `drizzle.config.ts`, `db/migrations/meta/_journal.json`, `db/migrations/0020_platform-admin-training.sql`, `db/migrations/0029_organization-license-single-current.sql` y `tests/e2e/test-safety.mjs`. Drizzle usa SQLite; el journal contiene 31 migraciones hasta `0030`. Los tests locales restringen el destino a loopback; los remotos requieren staging explícito y rechazan producción.

**Sincronización personal V1:** versión monotónica `server_version` por usuario y guía, más `reset_epoch` que cambia al restablecer progreso. Cada operación aporta `operation_id` idempotente, `base_version` y `base_reset_epoch`. El servidor valida sesión y propiedad; una operación repetida devuelve el resultado original sin volver a aplicarse. Si la versión base está obsoleta, responde conflicto y snapshot autorizado; si la época difiere, nunca revive checks anteriores al reset. No usar reloj local, unión OR ni last-write-wins silencioso. El reset incrementa versión y época atómicamente. Importación anónima requiere consentimiento y detección de conflictos.

**Ajuste de esquema propuesto:** incluir `server_version` y `reset_epoch` en `learn_guide_progress`, y versiones base/resultantes y recibo idempotente en `learn_sync_operation` con UNIQUE `(user_id, operation_id)`. Evaluar consolidación de preferencias secundarias para evitar tablas innecesarias. Retención de recibos y ventana máxima de reintentos deben definirse juntas; tras purga, rechazar operaciones de versión antigua.

**Migración:** revisar HEAD y journal antes de elegir numeración; generar SQL aditivo Drizzle, verificar FK e índices, aplicar solo en D1 local aislada y ejecutar pruebas focalizadas. Rollback de código sin DROP de datos personales. Separar expansión de esquema, activación de endpoints y exposición de interfaz. Sin D1 remota, merge ni despliegue sin autorización.

**Casos de prueba:** doble dispositivo, reset contra operación atrasada, duplicado de operación, purga de recibos, importación con conflicto, licencia caducada con progreso conservado, eliminación de cuenta y bloqueo de producción en E2E.

**Estado:** diseño documental; implementación pendiente.


## 26. Puerta de salida de Fase 0 y entrega controlada al agente implementador

**Alcance cerrado para V1:** 48 guías publicadas, seis completas anónimas, 42 con preview pública y cuerpo sujeto a licencia activa Cuadra/Barrio/Ciudad; nueve itinerarios, seis categorías, cuentas exclusivamente por invitación, permiso Aprende individual explícito para colaboradores, progreso/favoritos personales, sincronización segura y separación estricta de GHL/CRM.

**Matriz de aceptación previa al desarrollo:**
| ID | Criterio verificable | Evidencia exigida |
| --- | --- | --- |
| F0-01 | Registro público bloqueado y aceptación de invitación sin acceso automático a guías protegidas | Test focal de auth e invitaciones |
| F0-02 | Licencia, membresía y grant de la misma organización; búsqueda entre todas las organizaciones del usuario | Tests de entitlement, revocación y multi-organización |
| F0-03 | 48 previews públicas, seis cuerpos gratuitos y 42 cuerpos protegidos | Tests de catálogo, loader, SSR y JSON |
| F0-04 | Búsqueda, sitemap, meta, hydration, prefetch y bundle sin filtración | Tests LEAK-01..08 y revisión de artefactos |
| F0-05 | Progreso personal persiste tras caducidad o salida de organización | Tests de aislamiento por usuario |
| F0-06 | Reset, reintentos, dos dispositivos y conflictos no reviven checks antiguos | Tests de concurrencia e idempotencia |
| F0-07 | D1 aditiva local, claves foráneas e índices correctos; sin migración remota | SQL revisado y pruebas D1 local |
| F0-08 | Itinerarios, responsive y accesibilidad sin regresiones relevantes | QA focalizada Aprende |

**Instrucción para el agente de código:** crear una rama de implementación independiente desde el HEAD autorizado; no desarrollar sobre el PR documental ni mezclar cambios ajenos. Antes de cada bloque, comprobar estado Git y archivos impactados. Realizar cambios mínimos, tests focalizados únicamente para lo modificado y registrar evidencia de comando, resultado y SHA. No ejecutar suites generales de CI por defecto. No modificar GHL/CRM, autorización global de Better Auth, infraestructura remota ni licencias existentes fuera de las integraciones estrictamente necesarias. Mantener la prohibición de registro público. No hacer merge, deploy ni migración remota sin autorización expresa.

**Orden de entregas pequeñas:** (A) manifest editorial con IDs y DTOs públicos + pruebas de no filtración; (B) esquema D1 y grants + pruebas locales; (C) servicio de entitlement + tests multi-organización; (D) loaders seguros + QA pública; (E) progreso, sync e importación + pruebas de conflicto; (F) interfaz, itinerarios y accesibilidad + QA focal. Cada entrega debe poder revisarse en PR sin activar parcialmente contenido protegido.

**Decisiones aún abiertas antes de ejecutar:** (1) formato final de IDs editoriales y alias de slug; (2) retención de recibos sync y política de purga; (3) política de organizaciones sin fila de lifecycle; (4) autorizados a conceder grants Aprende; (5) consolidación de tablas secundarias de preferencias; (6) estrategia de publicación atómica para no exponer las 42 guías durante el cambio. Resolver cada una contra código y pruebas antes del bloque correspondiente, sin inventar comportamientos.

**Evaluación de estado:** el plan documental de Fase 0 tiene criterios de salida definidos, pero **Fase 0 no se declara técnicamente aprobada**: faltan pruebas ejecutadas y validación de las decisiones abiertas. No hay autorización de implementación, merge ni despliegue.


## 27. Identidad editorial estable y publicación segura (decisión técnica propuesta)

**Evidencia estática:** `app/content/learn.ts` define `LearnArticle` con `slug`, `category`, `title`, `intro`, `excerpt`, `enPocasPalabras`, `relatedSlugs`, `cta` y `sections` sin identificador propio; cada sección tiene `heading`, párrafos, viñetas y bloques, sin `sectionId`. Los tests `learn-curriculum.test.ts` y `learn-content.test.ts` comprueban 48 guías, slugs únicos, estructura editorial y contenido concreto. Cambiar slug o títulos sin migración rompería referencias o pruebas.

**Identidad propuesta:**
- Añadir `guideId` opaco, inmutable y no derivado de título ni posición; el slug es ruta pública editable, no clave de progreso. Para las 48 guías actuales, asignar IDs una sola vez en manifiesto editorial versionado, sin reordenar ni modificar texto.
- Añadir `sectionId` estable por guía; no usar índice de array ni texto de heading como identidad. Reordenar o editar una sección conserva su ID; dividir o fusionar secciones requiere mapa editorial explícito de equivalencias y política de progreso.
- Añadir `contentRevision` entero positivo por guía; incrementar cuando cambie contenido semántico o la estructura de secciones. Cambios cosméticos no deben borrar checks. Un `revision_seen` anterior activa aviso de actualización y no marca automáticamente nuevas secciones como completas.
- Mantener `slugAliases` como mapa explícito opcional de antiguas URLs a slug canónico, con redirección segura y sin crear nuevas identidades D1. Validar que aliases y slugs no colisionen.
- Construir una única fuente editorial de clasificación `freeFullAccess`: exactamente seis `guideId`, uno por categoría; el resto de las 48 guías conserva preview pública y cuerpo protegido. No inferir gratuidad de orden, categoría o invitación.

**Publicación segura:** primero introducir IDs, revisiones y DTOs allowlist con pruebas; después activar guard server-side para cuerpos y comprobar que las 42 guías nunca aparecen completas en SSR, loader, búsqueda o bundle cliente. Publicar la nueva experiencia solo después de que el guard esté operativo. Mantener 48 URLs públicas, seis cuerpos gratuitos y nueve itinerarios. Un rollback de interfaz no puede reactivar el loader antiguo que serializa cuerpos protegidos: el rollback debe conservar el guard.

**Pruebas focalizadas nuevas:** unicidad de 48 `guideId`, `sectionId` por guía, revisiones válidas, seis gratuitas por categoría, ausencia de aliases duplicados, invariancia de progreso tras reordenamiento y cambio de slug, revisiones con nuevas secciones, no filtración de cuerpos en respuestas y artefactos cliente.

**Pendiente:** el agente de implementación debe generar y revisar el manifiesto completo de IDs con el equipo editorial antes de congelarlo; no inventar equivalencias de secciones. Esta sección no cambia todavía contenido ni código.


## 28. Política de concesión y ciclo de vida de organizaciones (propuesta de cierre)

**Código inspeccionado:** `server/auth/authorization.server.ts`, `server/auth/session.server.ts`, `db/queries/organization.server.ts`, `db/queries/licensing.server.ts`, `db/schema/licensing.ts` y `app/routes/api-organization-authorization.ts`.

**Hallazgos:** la matriz global de permisos actual permite a owner/admin gestionar miembros, pero no define `learn.full_access`. `requireMembership` y `getActiveOrganization` rechazan explícitamente lifecycle `suspended`, aunque toleran ausencia de fila. Las licencias usan estados pending/active/suspended/cancelled y el billing owner no demuestra titularidad de una organización. La consulta de membresías permite buscar todas las organizaciones del usuario.

**Política específica Aprende propuesta (sin alterar autorización global):**
1. Acceso a cuerpo protegido para un usuario invitado y autenticado si existe **alguna** organización donde coincidan: membresía actual, lifecycle `active`, licencia Cuadra/Barrio/Ciudad con estado `active` y vigencia temporal, y rol `owner` o grant Aprende explícito asociado a la membresía actual. `admin` sin grant no basta. No usar `activeOrganizationId` como límite.
2. Para Aprende, lifecycle inexistente, pendiente, invitado o suspendido **no** satisface entitlement (fail closed). Antes de activar, auditar organizaciones antiguas sin fila y resolver migración de datos sin conceder permisos implícitos.
3. Solo `owner` de la organización podrá crear/revocar grant Aprende de colaboradores en V1. No basta ser propietario de `billing_account`. El grant se vincula a `member.id`, default denegado y cascada al retirar miembro; al reinvitar se necesita un grant nuevo.
4. Endpoint propio de administración de grants, con sesión, comprobación de owner en organización indicada, validación de destino miembro de esa misma organización, protección CSRF según patrón existente, auditoría y respuesta sin datos de otras organizaciones. No ampliar allowlist de Better Auth ni habilitar signup público.
5. Revocación de grant, salida de organización, suspensión o caducidad de licencia: bloquear inmediatamente nuevos cuerpos protegidos y respuestas cacheadas; mantener progreso/favoritos personales y vistas previas públicas.

**Pruebas focalizadas:** owner con licencia activa; admin sin grant; admin/member con grant; invitado no aceptado; grant de otra organización; usuario multi-org con solo una elegible; cambio de organización activa; lifecycle ausente/pendiente/suspendido; licencia expirada/suspendida; grant eliminado; miembro retirado y reinvitado; owner billing distinto de owner organizacional; revocación sin caché compartida.

**Pendiente de validación:** verificar si existen organizaciones legacy sin lifecycle y cómo regularizarlas; confirmar el patrón CSRF/auditoría de rutas actuales; definir retención de recibos sync. Esta es una política documental propuesta, no código aplicado.


## 29. Decisiones pendientes: ciclo de vida, sincronización y permisos

**Evidencia inspeccionada:** `db/schema/auth.ts` define `platformOrganizationLifecycle` con estados `pending_owner`, `owner_invited`, `active` y `suspended`. `server/auth/session.server.ts` bloquea `suspended`, pero no exige fila de lifecycle. `app/routes/api-organization-members.ts` valida la organización y el miembro objetivo en operaciones de roles y eliminación.

**Política Aprende propuesta:** únicamente organizaciones con lifecycle `active` explícito, licencia vigente y membresía actual pueden aportar entitlement. No alterar la autorización global existente. Antes de habilitar, contar organizaciones sin lifecycle y por estado mediante diagnóstico solo lectura; no asumir que existen registros legacy ni activarlos en bloque. La regularización debe ser administrativa y auditable.

**Concesión de acceso:** solo el rol `owner` organizacional podrá conceder o revocar grants Aprende en V1; `admin` no obtiene ese poder automáticamente. El endpoint propio validará actor, destino por `member.id` en la misma organización, CSRF/Origin según los patrones reales y auditoría. La revocación o retirada de membresía bloquea inmediatamente cuerpos protegidos, preservando progreso personal.

**Sincronización propuesta:** retención de recibos idempotentes durante 90 días y reintentos automáticos del cliente hasta 30 días, pendientes de revisión de privacidad y costo. Cada operación verifica `base_version` y `base_reset_epoch` en transacción; el reset crea una barrera contra operaciones atrasadas. Duplicados con recibo vigente reciben ack anterior; sin recibo y con versión obsoleta, conflicto y resync. No se debe afirmar deduplicación perpetua tras purga. Preferir operaciones de estado explícitas, no incrementos ciegos.

**Pruebas focalizadas antes de activar:** lifecycle ausente/pendiente/activo/suspendido; licencia vencida; owner/admin/member; grant entre organizaciones; reinvitación; doble dispositivo; duplicado y purga; reset atrasado; CSRF y acceso de otras organizaciones. No ejecutar suite general, migraciones remotas ni despliegues en esta fase documental.

**Pendiente de validación:** datos reales sobre lifecycle legacy, política definitiva de retención y controles CSRF existentes. Ninguna prueba ejecutada.


## 30. Handoff de Fase 0: orden de ejecución y puntos de control

**Resultado documental:** las secciones 20–29 describen contratos para autorización, catálogo público, progreso personal, sincronización, migraciones y decisiones pendientes. Este handoff no equivale a certificación técnica: no se han ejecutado pruebas ni aplicado cambios de aplicación.

**Primer PR de implementación recomendado (solo editorial y seguridad pública):**
1. Congelar manifiesto de 48 guías con IDs inmutables y secciones estables, manteniendo texto y slugs actuales; registrar revisiones.
2. Definir funciones de proyección allowlist `PublicGuideSummary` y `PublicGuidePreview` que no incluyan secciones, bloques ni resúmenes derivados del cuerpo protegido.
3. Mantener las seis guías completas gratuitas y convertir las otras 42 en previews públicas seguras; la ruta de cuerpo completo requiere entitlement verificado en servidor.
4. Aislar búsquedas, metadatos, sitemap, loaders, hidratación y prefetched data de contenido protegido; revisar también bundles compilados para no incluir el catálogo completo en cliente.
5. Adaptar exclusivamente tests focalizados de publicación, currículo y QA pública, más los tests LEAK-01..08. Conservar 48 URLs públicas, seis categorías y nueve itinerarios.

**Bloqueos de salida:** no habilitar el nuevo modelo de acceso hasta contar con guard de licencia y grant, pruebas de no filtración y revisión de contenido serializado. Evitar una transición en la que el loader antiguo siga devolviendo las 42 guías completas. Un rollback deberá conservar los guards.

**Segundo PR recomendado:** permisos por membresía y licencia con D1 aditiva local; diagnóstico de lifecycle faltante; pruebas de owner, colaboradores, organizaciones múltiples, revocación y licencia expirada. No tocar la matriz global de Better Auth.

**Tercer PR recomendado:** progreso personal, favoritos, reset y sync, con tests de concurrencia e idempotencia; importar progreso anónimo solo con consentimiento.

**Cuarto PR recomendado:** interfaz móvil, itinerarios, recomendaciones y accesibilidad; validación focal final.

**Evidencia mínima por PR:** archivos cambiados, SHA base y final, tests focales exactos y sus resultados, hallazgos de seguridad, cambios D1 locales, pendientes y decisión explícita de listo/no listo. Ningún PR debe hacer merge, deploy o modificar D1 remota sin autorización.

**Próxima acción autorizable:** iniciar PR de implementación 1 en rama separada tras autorización explícita. El diseño documental se considera cerrado, sin certificar aún el producto.


## 31. Acta de cierre del plan y transferencia al implementador (2026-10-28)

**Decisión de producto confirmada por el usuario:** exclusivamente el rol `owner` de una organización puede conceder y revocar el permiso Aprende de sus colaboradores. No basta `admin`, ni ser titular de `billing_account`, ni seleccionar la organización activa. La verificación debe utilizar membresía organizacional real del actor y del destinatario en la misma organización. El propietario puede leer guías protegidas con licencia activa sin necesitar grant propio. Esta decisión sustituye formulaciones anteriores de «propietario o gestor autorizado».

**Estado del plan:** `PLAN V1 CERRADO PARA IMPLEMENTACIÓN` significa requisitos, dependencias, contratos y alcance definidos; no equivale a producto publicado. Las fases 1–6 están integradas en `main@3fdc17cc`; la Fase 7 tiene certificación técnica local parcial, con gates editoriales, legales, de seguridad independiente y aceptación accesible aún abiertos. El detalle de evidencia y límites está en §17 y `docs/TESTING.md`.

### Matriz final de asuntos antes llamados bloqueos

| ID | Resolución documental | Estado del plan | Gate técnico que queda para implementación |
| --- | --- | --- | --- |
| B1 owner concede/revoca | **APROBADO**: exclusivamente `owner`; `admin` no concede | [x] decisión cerrada | Test focal de actor owner/admin/member y auditoría de cambios en PR entitlement |
| B2 lifecycle legacy | **DEFINIDO**: fail-closed sin fila `active`; sin regularización automática | [x] política cerrada | Diagnóstico de datos solo lectura autorizado; tratamiento individual de excepciones antes de activar entitlement |
| B3 CSRF y autorización | **DEFINIDO**: endpoint propio con control de sesión, Origin/CSRF, actor, destino y auditoría | [x] requisitos cerrados | Verificar patrón real del stack e implementar/testear endpoint en PR entitlement |
| B4 seis guías gratuitas | **SELECCIÓN PROVISIONAL FIJADA**: seis slugs, uno por categoría, con IDs inmutables al implementar | [~] aceptación editorial de contenido pendiente | Revisión focal de texto/fuentes y confirmación editorial antes de publicar gratuidad |
| B5 retención y privacidad | **PROPUESTA BASE**: recibos 90 días, reintentos automáticos 30 días; no se aprueba retención legal sin revisión | [~] revisión legal/operativa pendiente | Medir costos, revisar aviso y borrado/exportación antes de migración y sincronización |
| B6 conflictos de sync | **CONTRATO PROPUESTO**: versión/epoch, barrera de reset, ack idempotente y conflicto explícito | [x] diseño de prueba preparado | Implementar y probar concurrencia/duplicados/purga en PR sync |
| B7 legado y copy comercial | **DEFINIDO**: no checkout; activación manual; no inventar créditos heredados | [x] límites fijados | Inspección de datos legacy y revisión de copy en PR catálogo |
| B8 publicación | **DEFINIDO**: flags/rollback, staging y producción con aprobación expresa | [x] gates fijados | Ejecutar QA focal, revisar rollback y solicitar autorización específica de merge/deploy |

**Hallazgo de código adicional (inspección estática):** `server/auth/authorization.server.ts` permite `member:invite` y `member:role:update` a `owner/admin`; esto **no** autoriza a reutilizar tales permisos para grants Aprende. `db/queries/licensing.server.ts` distingue licencias `pending/active/suspended/cancelled`; el entitlement debe exigir `active` y comprobar fechas de vigencia. El estado `active` de la licencia no se infiere de `billing_account.ownerUserId`. No se han ejecutado tests ni consultas a D1 real.

### Contrato de ejecución para un agente con pensamiento medio

1. **No reabrir el plan completo.** Leer primero la leyenda, §3, §§19,25,27–31 y luego el checkpoint concreto de §8; inspeccionar los archivos fuente pertinentes en HEAD. Si aparece una contradicción material, registrarla y detener únicamente la operación afectada.
2. **Una unidad verificable por vez:** seleccionar un checkpoint D0–D8, enumerar rutas/tablas y tests focales, implementar cambio mínimo, ejecutar solamente pruebas focales pertinentes más `typecheck` y `build` cuando proceda, inspeccionar diff y registrar evidencia SHA.
3. **Dependencias obligatorias:** identidad editorial → DTO/guard sin fugas → entitlement → experiencia pública; progreso personal después de identidad y guard; sincronización después de progreso; UX avanzada después de catálogo y sync; certificación después de todas. Se permite desarrollo paralelo solo en ramas aisladas sin activar superficie insegura.
4. **No crear cuentas públicas:** invitación obligatoria. Seis guías gratuitas completas para visitantes; 42 cuerpos protegidos para propietarios o colaboradores expresamente habilitados en organización con licencia activa. Consentimiento explícito antes de importar progreso anónimo.
5. **Seguridad por defecto:** ninguna ruta, loader, bundle, búsqueda, caché, sitemap ni prefetch revela cuerpo protegido; cada solicitud de cuerpo revalida acceso. Si falta lifecycle o grant, denegar cuerpo y mantener preview pública.
6. **Pruebas focalizadas, nunca suite general por inercia.** No tocar GHL/CRM ni cambios ajenos. D1 local aislada para pruebas; staging, merge, migración remota y producción requieren autorizaciones específicas.
7. **Cierre de cada checkpoint:** actualizar marcas solo con pruebas realmente ejecutadas, commit, PR y evidencia; una prueba no ejecutada nunca se marca `[x]`. No añadir nuevas secciones al plan por rutina: usar §17 para progreso de implementación.

### Checklist de entrega documental

- [x] Alcance funcional, 48 guías, seis gratuitas, 42 licenciadas, nueve itinerarios y seis categorías definidos.
- [x] Política de cuentas exclusivamente por invitación y owner como único gestor de permisos Aprende confirmadas.
- [x] Dependencias, escalado progresivo, orden de PR y límites de seguridad documentados.
- [x] Contratos propuestos de D1, progreso, revisión editorial, sincronización y pruebas focales descritos.
- [x] Riesgos de filtración pública, organizaciones múltiples, revocación y datos personales identificados.
- [x] Distinción explícita entre cierre de planificación y certificación de software.
- [ ] Validación editorial definitiva de las seis guías (gate de implementación).
- [ ] Diagnóstico de lifecycle/datos legacy, comprobación CSRF y pruebas de entitlement (gate de implementación).
- [ ] Revisión de retención/privacidad y pruebas de sincronización (gate de implementación).
- [~] Fases 1–6 implementadas e integradas; certificación técnica local parcial de Fase 7. Faltan los gates de revisión editorial, legal/operativa, seguridad independiente y accesibilidad manual; el lanzamiento no está autorizado por haber pasado pruebas locales.

**Resultado:** no se requieren nuevas rondas generales de planificación para comenzar el PR 1. Los pendientes son comprobaciones acotadas y decisiones operativas vinculadas al PR que las necesite. Cualquier decisión editorial/legal no demostrada se mantiene visible, sin fingir que está aprobada. El plan de la aplicación de usuario se tratará por separado en otro chat; no forma parte de este alcance.
