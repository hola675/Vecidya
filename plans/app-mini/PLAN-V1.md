# MI VECIDYA + MINIWEB PREMIUM V2 — PLAN MAESTRO V1

**ID:** APP-MINI-PLAN-V1 · **Fecha:** 2026-10-28 · **Estado:** planificación documental, NO implementado · **Repositorio:** `hola675/Vecidya` · **Producto:** `vecidya-platform/`.

**Alcance de este checkpoint:** únicamente este plan en `plans/`. No cambia aplicación, D1, licencias, CRM, producción ni configuración remota. No autoriza merge ni deploy.

> **Evidencia:** `APROBADO` = decisión explícita del usuario; `CODE` = inspección estática de `main`; `DOC` = documentación del repositorio no revalidada en ejecución; `PROPUESTA` = diseño pendiente de validación; `TEST` = prueba efectivamente ejecutada (ninguna nueva). **Marcas:** `[x]` documentado/comprobado dentro de su alcance, `[~]` parcial o pendiente de decisión, `[ ]` no implementado, `[!]` bloqueo. Ningún `[x]` documental acredita software terminado.

## 0. Objetivo y principios

**APROBADO:** Convertir Mi Vecidya en una aplicación coherente, accesible y fácil para personas sin experiencia tecnológica, y MiniWeb en un constructor visual premium de plantillas y secciones personalizables. Complejidad interna, simplicidad externa. Permitir crear, editar, publicar y mantener periódicamente una página sin programar.

**APROBADO:** Vecidya gestiona presencia digital, perfiles, MiniWeb, medios, publicación y configuración de su aplicación. GHL conserva sus funciones CRM; no duplicar CRM, automatizaciones ni contactos de GHL. Usar **licencia**, no membresía. Sin datos comerciales inventados.

**PROPUESTA:** Objetivo WCAG 2.2 AA, enfoque mobile-first, SSR, rendimiento medido, componentes semánticos, teclado, movimiento reducido, contraste verificable, privacidad, autorización server-side por organización, progresión de divulgación y diseño consistente por tokens. Evitar HTML/CSS/JS arbitrarios de usuarios.

## 1. Baseline verificado y riesgos

| Fuente | Observación | Nivel |
| --- | --- | --- |
| `app/components/client-area-shell.tsx` | Sidebar actual: Inicio, Mi MiniWeb, Mi negocio, Servicios, Mi CRM, Equipo, Capacitación y Mi cuenta; selector de organización y drawer móvil | CODE |
| `app/routes/app.tsx` | Inicio con progreso de perfil, acciones, estado de servicios y equipo; no atribuirle métricas CRM | CODE |
| `app/routes/miniweb-editor.tsx` | Pestañas Diseño, Secciones, Contenido, Vista previa, Publicar; borrador, publicación, medios, dependencias del perfil | CODE |
| `app/features/miniweb/registry.ts` | Módulos por tipo, `settings: null`, `layoutVariants: ["standard"]`, configuración v1 y límite de 4096 bytes | CODE |
| `app/components/miniweb/templates/default.tsx` | Módulos ordenados y galería que mezcla imágenes/videos; horas como módulo actual | CODE |
| `app/components/public-business-profile-view.tsx` | La portada está dentro del contenedor de identidad que aloja logo; requiere separación estructural | CODE |
| `db/business-hours-rules.ts` | Horario semanal simple: día, cerrado, apertura, cierre; compactación de días consecutivos | CODE |
| `docs/STRUCTURE.md` | Describe checkpoints MiniWeb, permisos, rutas y pruebas históricas; estado local/documentado no equivale a producción | DOC |

**[!] Antes de implementar:** volver a inspeccionar `main` y ramas/PR pertinentes; comparar `fix/miniweb-cover-sections` (un commit exclusivo observado en auditoría previa), evitar rescatar código redundante. Verificar `STATUS.md`, `PROJECT_STATE.md`, `GOVERNANCE.md`, `DATABASE.md`, `TESTING.md` y rutas reales. No usar esta foto estática como certificación dinámica.

## 2. Arquitectura de experiencia de Mi Vecidya

**APROBADO:** mejorar sidebar, Inicio, configuración y navegación general; distinguir navegación global de panel contextual del constructor.

**PROPUESTA — sidebar por objetivos:** Inicio; Presencia digital (Información del negocio, Mi sitio web, Biblioteca multimedia, Publicación); Gestión (Servicios Vecidya, Equipo/permisos, Aprende, acceso CRM externo condicionado a licencia); Configuración; Ayuda. Evitar mostrar destinos sin funcionalidad real. Mantener selector de negocio activo, permisos y rutas previas mediante navegación compatible; no renombrar rutas a ciegas.

**PROPUESTA — configuración por ámbito:**
- **Cuenta (usuario):** identidad, seguridad, sesiones, idioma, accesibilidad y notificaciones solo cuando haya soporte real.
- **Organización/negocio:** datos administrativos, miembros, roles, invitaciones, licencias e integraciones; controles por permisos.
- **Sitio MiniWeb:** plantilla, identidad visual, dominio/slug según capacidad real, navegación, SEO, medios, accesibilidad y publicación.
- **Configuración contextual:** edición cotidiana en la sección seleccionada, no duplicada en Ajustes.

**PROPUESTA — Inicio:** estado real de publicación, tareas accionables, completitud, cambios pendientes, enlaces a página pública, equipo, servicios y Aprende. No inventar visitas, conversiones ni estadísticas.

## 3. Constructor visual MiniWeb: modelo funcional

**APROBADO:** modo Fácil con plantillas, asistente, lenguaje no técnico, ayuda contextual, ejemplos, textos explicativos, edición guiada y publicación sencilla; modo Avanzado para composición y estilos. Misma persistencia y controles de seguridad.

**PROPUESTA — interfaz:** canvas con selección visible; sidebar contextual Página/Secciones/Contenido/Diseño/Multimedia/Ajustes; inspector por sección Contenido/Diseño/Distribución/Avanzado; toolbar Guardar, Deshacer/Rehacer, Vista previa móvil/tableta/escritorio, Publicar. En móvil, panel inferior accesible. Cambios no guardados y bloqueo de navegación; estados vacíos, errores en contexto, recuperación de borradores. Arrastrar opcional con alternativa por botones Mover arriba/abajo.

**APROBADO:** secciones independientes con tamaños y composición únicos; orden editable, combinaciones en dos o más columnas, mezclas de contenido e imagen, paletas, fuentes, estilos y componentes.

**PROPUESTA — motor de composición:** grid semántico de 12 columnas en escritorio, reglas para tablet/móvil, anchuras 12/8/6/4 y combinaciones 40/60, 50/50, 60/40, contenido full-bleed acotado, alineación vertical, espaciado, capas y orden de lectura. Container Queries cuando proceda; no prometer que cualquier combinación será válida. Plantillas por sector como configuraciones iniciales versionadas, no código duplicado.

**PROPUESTA — biblioteca de módulos:** portada; acerca de; servicios; productos; galería de imágenes; galería de videos; horarios V2; ubicación; contacto; FAQ; CTA; equipo, testimonios, artículos y certificaciones solo tras contar con datos, moderación y publicación. Cada módulo define variantes visuales y límites de contenido. Permitir instancias repetidas donde tenga sentido mediante IDs estables (no claves por tipo).

## 4. Portada, imágenes y videos

**APROBADO:** corregir portada para que imagen panorámica, logo y datos de negocio tengan contenedores independientes, sin solapamiento incorrecto. Logo independiente con proporción preservada; portada con recorte/posición focal ajustables.

**APROBADO:** imágenes en contenido y galería adaptables al espacio sin deformación, con posición respecto al texto, tamaños, recorte, foco, composiciones variadas y personalización por sección.

**PROPUESTA — imágenes:** conservar original autorizado, dimensiones, orientación, `alt`, caption, punto focal x/y, `object-fit` contain/cover, relación de aspecto, variantes de entrega responsive, lazy-loading fuera del primer viewport, formatos optimizados y tamaños máximos. Configuración de escritorio/móvil; controles de recorte no destructivos. Verificar políticas R2 y URLs de preview/publicación antes de cambios.

**APROBADO:** separar galerías de imágenes y videos. Ofrecer mosaico, cuadrícula, collage, carrusel y vista ampliada para imágenes; tarjetas, carrusel, reproductor destacado, playlist y pantalla completa para videos.

**PROPUESTA — video:** poster, subtítulos/captions cuando existan, controles nativos o accesibles, carga diferida, límites de tamaño/duración, validación MIME, políticas de origen, reproducción manual por defecto, no autoplay con audio, movimiento reducido y fallback. **[~]** Decidir almacenamiento/transcodificación y si se permiten enlaces externos; no asumir un servicio de streaming contratado.

**PROPUESTA — carruseles:** flechas, paginación, swipe, teclado, foco, anuncio accesible de posición, pausa, no cambio automático por defecto, sin scroll-jacking. Verificar dependencia existente antes de incorporar otra.

## 5. Horarios V2 desde cero

**APROBADO:** retirar **completamente el módulo visual y editor de horarios antiguo** y crear uno nuevo; no reutilizar la UI antigua. **No borrar registros de negocios ni datos históricos sin migración y verificación.**

**PROPUESTA — modelo:** zona horaria IANA por negocio; 7 días independientes; cerrado/abierto; uno o varios intervalos por día; copiado de días laborables con posterior edición individual; descansos; excepciones por fecha (festivos, cierres, ampliaciones); validación de solapes, cruces de medianoche y consistencia; estado «Abierto ahora» solo con zona horaria y reglas fiables. Vista pública compacta, semanal, tarjetas y tabla, configurable por estilo. Separar fuente de horario del componente de presentación.

**[!]** Determinar si el horario alimenta otros consumidores (perfil público, Vecindario, validaciones, snapshot) antes de cambiar contrato o migración.

## 6. Sistema de diseño y personalización

**PROPUESTA:** tokens tipados por tema global, página y sección: fondo, superficie, título, texto, enlaces, botones, acentos, tipografías permitidas, escala tipográfica fluida, ancho, padding, gap, radio, borde, sombra, alineación, animación sutil. Controles por opciones acotadas con contraste automático y previsualización. Combinaciones premium curadas por sector; edición avanzada sin exponer CSS libre.

**PROPUESTA:** identidad visual coherente entre panel y páginas públicas sin imponer el tema de la marca Vecidya a cada negocio. Respetar preferencia de movimiento reducido, orden DOM/visual y tamaños táctiles.

## 7. Contratos backend y seguridad (diseño, no código)

**PROPUESTA:** configuración `MiniWebConfigurationV2` versionada con `schemaVersion`, `templateId/version`, `themeTokens`, `page` (una única página con secciones; sin multipágina en V2), `sections` con `instanceId`, `type`, `variant`, `contentRef`, `layout`, `styleOverrides`, `responsiveOverrides`, `visibility`; JSON validado en servidor con límites de tamaño, profundidad, cantidad de bloques y valores allowlist. No extender el límite de 4096 bytes sin medir D1, snapshot y API.

**PROPUESTA:** datos de contenido estructurados y medios con IDs y permisos; separación entre contenido reutilizable y apariencia; borrador y snapshot público inmutable/versionado; guardado optimista con revisión y conflictos explícitos; autorización por organización y rol en cada endpoint; auditoría de publicación; migración de v1 a v2 compatible, lectura dual temporal y rollback. No ejecutar D1 remota ni romper contratos publicados.

**PROPUESTA:** reutilizar React Router, TypeScript, Cloudflare Workers, D1/Drizzle, R2 y componentes existentes; evaluar bibliotecas accesibles de primitivas/carrusel sin adoptar dependencias automáticamente. Arquitectura de registro de módulos y plantillas en lugar de duplicar páginas.

## 8. Fases, dependencias y entregables

| Fase | Estado | Entregable | Gate focal |
| --- | --- | --- | --- |
| F0 Auditoría y decisiones | [~] | Inventario de rutas, schema, PRs, media, CSS, permisos, dependencias y decisiones abiertas | Matriz CODE/DOC/TEST y contratos aprobados |
| F1 Shell Mi Vecidya | [ ] | Sidebar, Inicio, selector y configuración por ámbitos | Navegación móvil/teclado, cambio de org, guardas |
| F2 Contrato MiniWeb V2 | [ ] | Registry, IDs, validadores, compatibilidad de snapshots y migración local | Tests unitarios schema y aislamiento |
| F3 Portada e identidad | [ ] | Cover independiente, logo, composición responsive y editor focal | E2E portada y capturas 320/390/768/1366 |
| F4 Multimedia | [ ] | Biblioteca, imágenes responsive, galerías separadas, carrusel y video | Upload seguro, preview/público, teclado, rendimiento |
| F5 Horarios V2 | [ ] | Retiro de UI antigua, nuevo modelo y editor semanal/excepciones | Casos de solape, TZ, DST, compatibilidad |
| F6 Diseño y composición | [ ] | Tokens, variantes, grid, posicionamiento y temas | Render SSR, contraste, responsive, persistencia |
| F7 Editor Fácil/Avanzado | [ ] | Inspector, ayudas, asistente, deshacer, estados y previews | Flujo principiante, accesibilidad y guardado |
| F8 Publicación y mantenimiento | [ ] | Revisión, snapshots, historial de versiones y restauración aprobados, actualización periódica | No filtrar borradores, concurrencia y autorización |
| F9 Certificación y release | [ ] | Evidencia focal por superficie, QA de regresión relevante y handoff | Typecheck, build, diff-check, aprobación merge/deploy |

**Dependencias:** F0 → F2; F1 puede avanzar tras F0 con PR aislado; F2 → F3/F4/F5/F6; F3–F6 → F7 → F8 → F9. Evitar migración D1 y frontend incompatible en un mismo corte sin feature gate/rollback.

## 9. Plan de pruebas focalizadas y calidad

**PROPUESTA:** pruebas unitarias de schemas, horarios (DST, medianoche, excepciones), layouts y sanitización; E2E MiniWeb de preview/publicación y aislamiento por organización; pruebas de selector y drawer, foco/teclado, alt/captions, reduced motion, controles de carrusel, carga y errores; capturas de variantes en móvil/tableta/escritorio; tests de snapshots y migración D1 **local**. Por PR: pruebas estrictamente del alcance + typecheck/build/diff-check cuando aplique. No disparar CI general ni tests remotos sin necesidad/autorización; documentar evidencia real sin inventar PASS.

**Rendimiento:** presupuesto a definir con mediciones: LCP, CLS, INP, peso de imagen/video, carga diferida y tamaño del bundle. **Accesibilidad:** objetivo WCAG 2.2 AA, evaluación automatizada + revisión manual de flujos críticos. No afirmar conformidad sin auditoría.

## 10. Decisiones confirmadas y cuestiones técnicas pendientes

**Confirmación explícita del usuario — 2026-10-28 (APROBADO):**

| ID | Decisión vinculante | Implicación para implementación |
| --- | --- | --- |
| DEC-01 | **MiniWeb V2 será de una sola página**, compuesta por secciones | Un único documento público por negocio; no crear rutas multipágina, menús de páginas ni contratos `pages[]` en V2 |
| DEC-02 | **Videos subidos a Vecidya y enlaces externos** | Dos orígenes de medios con validación, autorización, reproductor y tratamiento de privacidad diferenciados; evaluar YouTube/Vimeo como proveedores permitidos, no aprobados individualmente aún |
| DEC-03 | **Múltiples galerías de imágenes y de videos** en una misma página | Secciones con `instanceId` estable; no indexar solo por tipo; orden, contenido y diseño independientes |
| DEC-04 | **Distribución progresiva de plantillas por licencia: Cuadra → Barrio → Ciudad** | Cuadra: catálogo esencial; Barrio: catálogo esencial + diseños avanzados; Ciudad: catálogo anterior + catálogo completo. Resolver entitlement en servidor por organización/licencia; conservar página pública publicada ante downgrade y exigir plantilla autorizada para nuevos cambios de diseño/publicaciones (DEC-07) |
| DEC-05 | **Historial de versiones y restauración** | Snapshot inmutable por publicación, metadatos autor/fecha/revisión, restauración como **nuevo borrador** y publicación posterior explícita; autorización, retención y cuota por definir |

**Reglas obligatorias derivadas:** nunca autorizar plantillas únicamente desde el frontend; no exponer borradores ni archivos privados en snapshots públicos; la restauración no sobrescribe automáticamente una publicación ni permite acceso entre organizaciones; los enlaces externos deben usar allowlist y protección frente a URLs maliciosas; las subidas deben validar tipo/tamaño y permisos en servidor.

**[~] Cuestiones de diseño pendientes de evidencia y/o decisión:**
1. Horarios V2: confirmar alcance inicial de turnos nocturnos, excepciones y zona horaria; propuesta: incluirlos.
2. Videos: definir límites por licencia, tamaño, duración, almacenamiento/transcodificación y proveedores externos concretos tras revisar infraestructura/costes.
3. Plantillas: **jerarquía progresiva aprobada** Cuadra (esenciales), Barrio (+ avanzadas), Ciudad (+ catálogo completo). Pendiente catalogar IDs y diseños concretos, verificar el contrato comercial vigente y aplicar DEC-07 al downgrade y definir por separado expiración/suspensión. No inventar precios, cupos ni nuevas prestaciones comerciales.
4. Historial: definir cantidad/retención de versiones y permisos de restauración, con costes y auditoría.
5. Medios: definir cuota operativa por negocio y política de borrado/retención según R2 y licencias.

**No bloquean la documentación:** estas cuestiones se resolverán en F0 y antes de las migraciones o controles comerciales afectados; no inferir respuestas del silencio del usuario.

### DEC-06 — Catálogo progresivo de plantillas (APROBADO, 2026-10-28)

- **Cuadra:** acceso al conjunto base de plantillas esenciales.
- **Barrio:** acceso acumulativo a Cuadra y a plantillas de composición avanzada.
- **Ciudad:** acceso acumulativo a Cuadra, Barrio y el catálogo premium completo.
- **No regresión:** una licencia superior incluye las plantillas de niveles inferiores; las capacidades de contenido, almacenamiento, dominios y medios **no** quedan diferenciadas automáticamente por esta decisión.
- **Backend propuesto:** catálogo versionado con `templateId`, `version`, `minimumLicenseTier` y estado; entitlement efectivo resuelto en servidor a partir de la licencia real de la organización, no de un parámetro cliente. Validar al seleccionar, guardar y publicar; no revelar borradores ni activos ajenos.
- **Frontend propuesto:** mostrar plantillas disponibles y bloqueadas con explicaciones claras de la licencia necesaria; no ocultar de forma engañosa plantillas ya utilizadas. Previsualización segura sin habilitar publicación no autorizada.
- **Compatibilidad:** conservar el render de páginas ya publicadas si cambia el entitlement hasta que se apruebe una política de transición; nunca degradar silenciosamente la apariencia, eliminar contenido ni despublicar automáticamente.
- **Pendiente F0:** mapear nombres/IDs reales y condiciones comerciales de Cuadra/Barrio/Ciudad; decidir política de expiración/suspensión y disponibilidad de preview; downgrade resuelto en DEC-07; verificar que el modelo de licencias permite jerarquía acumulativa. **Esta decisión no autoriza migraciones ni cambios de precio.**

### DEC-07 — Política de reducción de licencia (APROBADO, 2026-10-28)

**Decisión:** si una organización reduce su licencia (por ejemplo, de Ciudad a Cuadra), **la página pública ya publicada conserva su diseño y contenido sin degradación automática**. Para efectuar **nuevos cambios de diseño o nuevas publicaciones**, el negocio debe elegir una plantilla autorizada por su licencia efectiva. No despublicar ni sustituir automáticamente la plantilla premium anterior.

**Reglas funcionales y de seguridad:**
1. **Lectura pública:** el snapshot publicado permanece renderizable aunque su `templateId` ya no esté autorizado para nuevas publicaciones; esto no concede acceso al editor premium.
2. **Borrador y edición:** conservar contenido, medios y versiones históricas. Permitir consultar el estado del sitio y preparar la migración de diseño sin destruir datos; bloquear guardar/aplicar cambios de diseño premium y cualquier nueva publicación mientras el borrador use una plantilla no autorizada. No confundir edición de datos del negocio con una publicación MiniWeb.
3. **Nueva publicación:** resolver en backend el nivel de licencia **efectivo** de la organización al momento de publicar; validar la plantilla de destino y su estado `available`. Si no está autorizada, rechazar la publicación con error comprensible y acción guiada «Elegir plantilla disponible». La validación del frontend es solo ayuda.
4. **Restauración:** recuperar una versión histórica como borrador, **sin publicar automáticamente**. Si la versión restaurada usa una plantilla superior, conservar su contenido y exigir cambiar a una plantilla permitida antes de publicar.
5. **Cambio de plantilla:** proponer mapeo de secciones y contenidos compatibles, vista previa y confirmación explícita. No eliminar contenido incompatible de forma silenciosa; conservar copia recuperable.
6. **Aislamiento y auditoría:** verificar sesión, organización, rol/permiso, licencia efectiva, pertenencia de recursos y concurrencia; auditar cambios de licencia, intentos de publicación denegados y publicaciones/restauraciones efectivas según política vigente.
7. **Pruebas focalizadas obligatorias:** downgrade Ciudad→Cuadra con página publicada premium inalterada; rechazo de nueva publicación premium; cambio a Esencial y publicación autorizada; restauración de versión premium sin bypass; aislamiento tenant; carreras entre cambio de licencia y publicación; no regresión de página pública.

**Alcance preciso:** «nuevos cambios de diseño o publicación» no significa borrar, ocultar ni bloquear la visualización de contenido existente. Las actualizaciones de datos de perfil independientes de la publicación MiniWeb deben seguir sus permisos propios. **[~]** F0 debe concretar si hay un modo de edición de contenido sin republicación y el tratamiento de expiración/suspensión por causas distintas del downgrade; esta decisión no define esas políticas.

**Estado:** `APROBADO` como contrato de producto; `[ ]` backend/frontend/tests no implementados. No ejecutar migraciones ni cambios comerciales sin checkpoint aprobado.

## 11. Gobernanza y handoff

- Revisar `AGENTS.md`, `docs/GOVERNANCE.md`, `STATUS.md`, `PROJECT_STATE.md`, `ROADMAP.md`, `ARCHITECTURE.md`, `DATABASE.md`, `TESTING.md` antes de ejecutar.
- Trabajar en ramas/worktrees aislados por checkpoint `feat/app-mini-<checkpoint>`; verificar `git status`, `git branch -vv`, `git fetch origin`. No tocar otros agentes.
- Cada PR: alcance pequeño, tests focalizados, typecheck/build si hay código, documentación canónica reconciliada, commit y revisión. Sin merge ni deploy sin aprobación explícita.
- Actualizar el avance **en este documento**, sin crear informes de fase dispersos. No confundir `DOC` con `TEST`.

## 13. F0 — contraste comercial y registro de plantillas (CODE / DOC / PROPUESTA)

**CODE (inspección estática 2026-10-28):**
- `app/routes/licenses.tsx`: la tabla comparativa declara «MiniWeb y Vecindario» **incluidos en Cuadra, Barrio y Ciudad**; no distingue plantillas. La activación se coordina por contacto, sin checkout automático.
- `app/features/miniweb/registry.ts`: `vecidya-default` («Esencial») está `available`; `services-studio`, `catalog-store`, `gastronomy-table` y `professional-profile` están `planned`. Sus `layoutVariants` son `standard`; el registro no contiene `minimumLicenseTier`.
- `docs/PROJECT_STATE.md` (DOC): informa de un release 0.9.0 y cambios de plataforma recientes; antes de implementar, actualizar el baseline de `main` y revisar la migración `0030` y permisos de `platform_admin`. Este plan no acredita una nueva prueba HTTP ni validación de producción.

**Conclusión:** DEC-06 es una decisión **nueva de producto**, no una prestación existente. La comunicación comercial debe seguir siendo veraz: MiniWeb sigue incluido en las tres licencias, mientras la **amplitud del catálogo de plantillas** será progresiva cuando se implemente y publique la diferenciación. No alterar por inferencia el alcance CRM de las licencias.

**PROPUESTA — contrato del catálogo:**
- `TemplateTier = "cuadra" | "barrio" | "ciudad"`; relación de inclusión acumulativa, validada contra licencias reales del backend, sin confiar en claims del navegador.
- Cada plantilla tiene ID estable, versión, categoría, miniatura, variantes, requisitos de módulos, estado `planned|available|retired` y nivel mínimo; solo `available` se puede seleccionar/publicar.
- La plantilla Esencial existente permanece como base de compatibilidad de Cuadra; **no** asignar las cuatro familias planificadas a niveles específicos sin una decisión editorial y pruebas visuales.
- Resolver entitlement para selección, guardado, preview privado y publicación; preservar el snapshot público anterior ante downgrade y exigir selección de plantilla permitida antes de una nueva publicación (**DEC-07 aprobado**).
- Sin catálogo comercial actualizado y pruebas de autorización, no habilitar restricciones nuevas en producción. Las páginas existentes no se migran ni degradan silenciosamente.

**[!] Gate comercial F0:** reconciliar `app/content/commercial-detail.ts`, `docs/business/VECIDYA_PRODUCT_CATALOG.md`, páginas de licencias y texto de la interfaz con el catálogo real, sin cambiar precios ni promesas CRM. Solicitar aprobación explícita de la redacción comercial antes de publicar.

**[~] Gate técnico F0:** inspeccionar cómo se resuelve hoy la licencia efectiva, expiración y cambio de nivel, así como snapshot, API y cache; después definir pruebas de permisos para Cuadra/Barrio/Ciudad, sin suponer jerarquía implementada.

## 14. Handoff de siguiente checkpoint

1. Auditar licencias/entitlements, media R2 y snapshots actuales en el HEAD de implementación; listar contratos, rutas y pruebas focales.
2. Proponer matriz concreta de plantillas; implementar DEC-07 solo tras auditar licencia efectiva, snapshots y rutas de publicación.
3. Aislar PR de contrato/registro antes de introducir UI de plantillas bloqueadas.
4. No iniciar cambios de producción, D1 remota, merge o deploy sin autorización.

## 15. F0 — hallazgos de contratos existentes y migración segura (CODE)

**Inspección estática adicional 2026-10-28, sin pruebas nuevas:**
- `app/content/commercial-detail.ts` declara expresamente que su catálogo es **comunicación comercial, no fuente de entitlements técnicos**. Cuadra incluye MiniWeb; Barrio hereda Cuadra; Ciudad hereda Barrio. El control técnico de plantillas debe leer el servicio real de licencias, no este archivo.
- `app/routes/miniweb-editor.tsx` usa `requireOrganizationPermission(..., "business-profile:read")`, devuelve `canEdit/canPublish` según rol `owner|admin`, carga borrador, `draftRevision`, `publishedConfiguration`, media, horarios y snapshot. Es un indicador del modelo de permisos actual, **no** certifica las acciones de escritura; auditar sus endpoints por separado.
- `app/features/miniweb/registry.ts`: configuración v1 con `modules[]` identificados por `type`, `settings:null`, una sola variante `standard` y máximo 4096 bytes. La validación de plantillas actualmente comprueba `available` y versión, pero **no** un nivel de licencia.
- `db/schema/miniweb.ts`: `miniweb_site` es único por organización; `miniweb_module` tiene índice único `(miniweb_site_id,module_type)`, incompatible con múltiples instancias del mismo tipo. `business_media_asset` ya está ligado a organización y R2 mediante `object_key`, con `purpose`, `media_type`, `content_type`, `size_bytes`, `alt_text`, `is_active`.

**Impactos y secuencia recomendada:**
1. **Múltiples galerías:** migrar el identificador de módulo desde `type` a `instanceId`, mantener `type` como categoría y retirar el índice único por tipo solo tras introducir la nueva restricción por instancia; migración local con backfill estable y rollback/compatibilidad de snapshots v1.
2. **Videos externos:** modelar un origen `uploaded|external` con URL normalizada y allowlist de proveedores; no confundir `object_key` de R2 con URLs de terceros ni almacenar credenciales en snapshots.
3. **Plantillas por licencia:** resolver entitlement desde el sistema operativo de licencias y añadir validación de plantilla al guardado/publicación; mantener el render de snapshots históricos en modo lectura aun si la plantilla deja de estar habilitada para nuevas publicaciones.
4. **Historial:** el snapshot publicado actual y `draftRevision` **no demuestran** que exista un historial recuperable de versiones. Diseñar registro inmutable con organización, autor, fecha, versión, hash y operación de restauración a borrador; confirmar retención y coste antes de migrar.
5. **Seguridad:** distinguir guardas de lectura del editor de permisos de edición/publicación; revisar endpoints y transacciones contra cambios concurrentes de licencia, publicación y medios.
6. **No romper datos existentes:** migraciones aditivas y pruebas de v1→v2 en D1 local; no cambiar índice ni serialización pública hasta que el lector dual y las pruebas focales funcionen.

**Gate F0 pendiente:** localizar rutas de escritura/publicación, queries de snapshots, tablas de licencia efectiva y API de media; ejecutar pruebas focales únicamente cuando se implemente el checkpoint correspondiente. Estos hallazgos son `CODE` por lectura, **no `TEST`**.

## 16. F0 — concurrencia de publicación, cuotas y compatibilidad (CODE)

**CODE inspeccionado en `db/queries/business-publication.server.ts`:**
- `BUSINESS_PUBLICATION_SCHEMA_VERSION = 4`; el parser trata snapshots heredados y distingue medios/branding por versión. V2 deberá mantener lectura de snapshots anteriores y definir una versión nueva sin reinterpretar JSON histórico.
- `readConsistentBusinessDraftState` compara revisiones antes/después de cargar; `commitBusinessDraftMutation` usa revisión esperada y token de escritura para detectar conflictos `409`.
- `publishBusinessPublicationForOrganization` construye un snapshot y actualiza `business_profile_publication.snapshot_json`, incrementando `published_version` y registrando auditoría cuando recibe actor. El campo se **sobrescribe**: la versión numérica y la auditoría no constituyen por sí mismas un historial restaurable.
- El publish hace compare-and-swap sobre `draft_revision` y `published_version`; **no se observa en esta función** una comprobación de licencia efectiva/plantilla. No afirmar ausencia global sin auditar las rutas invocadoras.
- El esquema de snapshots contiene perfil, horarios, configuración, contenido, medios e identidad; la restauración debe coordinar todas estas dependencias y no solo `configuration`.

**CODE inspeccionado en `db/queries/business-media.server.ts`:** límite por archivo `MAX_BUSINESS_MEDIA_BYTES = 32 MiB` y almacenamiento activo por organización `MAX_BUSINESS_MEDIA_STORAGE_BYTES = 100 MiB`. Son límites técnicos actuales, **no** cuotas comerciales aprobadas por licencia. No prometer que soportan videos largos; estudiar duración, procesamiento, coste y entrega antes de ampliar.

**Riesgo crítico DEC-07:** el control de licencia para guardar/publicar no debe evaluarse solo al cargar el editor. La licencia puede cambiar entre lectura, validación y commit; diseñar un chequeo vinculado a la mutación, con consistencia transaccional o bloqueo verificable, y pruebas de carrera downgrade↔publish. Un snapshot público histórico debe seguir siendo legible aunque el catálogo actual marque la plantilla `retired`.

**Plan focal F2/F8:**
1. Extraer función de entitlement tenant-scoped y contrato de decisión `canSelect/canSaveDesign/canPublish`; distinguir lectura pública y restauración.
2. Guardar cada publicación en una tabla de historial inmutable **en la misma transacción/batch consistente** que cambia el snapshot actual, con versión, actor, hash, fecha y organización; confirmar el comportamiento real de `batch` y pruebas de fallos antes de afirmar atomicidad.
3. Restaurar una versión como nuevo borrador bajo control de revisión, conservar datos/medios y no publicar sin nueva acción autorizada.
4. Probar snapshot v1/v2/3/4, versión V2 futura, downgrade y publicación concurrente, historial, restauración, medios ausentes y aislamiento entre organizaciones.
5. Auditar rutas API de escritura y publicación por su nombre real en el árbol; las rutas tentativas no fueron encontradas por path y **no** se presume que no existan.

**Evidencia:** lectura estática CODE; no se ejecutaron tests, CI, migraciones ni despliegue.

## 17. F0 — rutas reales, autorización y licencias multi-organización (CODE / DOC)

**CODE verificado en `app/routes.ts`:**
- `/api/organizations/:organizationId/miniweb-config` → `app/routes/api-miniweb-config.ts` (GET, POST save/publish).
- `/api/organizations/:organizationId/business-media` → `api-organization-business-media.ts` y `.../:assetId` → `api-organization-business-media-asset.ts`.
- `/media/business/:slug/:assetId` → `api-public-business-media.ts`.
- `/api/platform/organizations/:organizationId/license` → `api-platform-licensing.ts`; administración interna de licencias también disponible.

**CODE en endpoints inspeccionados:**
- `api-miniweb-config.ts`: comprueba organización activa y permisos `business-profile:read` (GET), `business-profile:update` (save), `business-profile:publish` (publish). Llama a `saveMiniWebConfigurationForOrganization` y `publishBusinessPublicationForOrganization`; **en el código inspeccionado no aparece consulta de licencia efectiva en la ruta**. El control de entitlement V2 debe cubrir ambos intents y la mutación subyacente, no solo el editor.
- `api-organization-business-media.ts`: upload requiere permiso `business-profile:update`, revisiones CAS y registro tenant-scoped. Auditar por separado borrado/lectura pública y referencias R2 antes de diseñar nuevas galerías.
- `api-platform-licensing.ts`: `getOrganizationLicense(database, organizationId)` ofrece un punto de lectura para la licencia de la organización; los cambios requieren `organization:license:update` de plataforma y comparan `currentLicenseId` en operaciones. Revisar implementación/estados/fechas antes de decidir entitlement; **no importar directamente una ruta de administración como dependencia del editor**.
- `app/content/commercial-detail.ts` no es una fuente técnica de permisos.

**Corrección aprobada (DEC-08):** la propuesta anterior de publicaciones secundarias amparadas sin cupos queda sustituida. Una o varias licencias activas Cuadra/Barrio/Ciudad conceden un único bloque base de 3 MiniWeb; solo Cuadras adicionales de ampliación suman otros bloques de 3. Barrio/Ciudad incluyen una sola vez el beneficio Cuadra y conceden CRM exclusivamente a su organización asignada. El catálogo histórico requiere conciliación. La atribución de plantillas avanzadas a otras organizaciones y la suspensión/expiración siguen pendientes.

**Cierre parcial:** el inventario de rutas ya está localizado. Pendientes inspeccionar `getOrganizationLicense`, estados efectivos, acceso público a medios, baja de activos, y transacciones; no afirmar implementación ni tests.

## 18. DEC-08 — Cupos base únicos y ampliación exclusiva mediante Cuadra (CORREGIDO Y APROBADO, 2026-10-29)

- Publicar requiere licencia activa y cupo. El titular obtiene **un único bloque base de 3 MiniWeb** al disponer de al menos una licencia activa Cuadra, Barrio o Ciudad.
- **Barrio y Ciudad NO acumulan cupos:** tener ambas mantiene el bloque base de 3. Cada una habilita CRM solo para su organización asignada.
- **Solo las licencias Cuadra adicionales adquiridas para ampliar capacidad** añaden bloques de 3 MiniWeb. No sumar automáticamente una Cuadra ya utilizada como licencia base ni convertir Barrio/Ciudad en bloques adicionales.
- Ejemplos inequívocos: 1 Cuadra = 3; 1 Barrio = 3; 1 Ciudad = 3; Barrio + Ciudad = 3; Barrio + Ciudad + 1 Cuadra adicional = 6; Barrio + Ciudad + 2 Cuadra adicionales = 9. Más de 6 requiere otra Cuadra adicional.
- El control técnico debe distinguir **bloque base ya concedido** de **Cuadras de ampliación**, para impedir doble cómputo. CRM y cupos se resuelven separadamente; ninguna organización hereda CRM ajeno.
- Pendientes de diseño: cómo registrar y clasificar una Cuadra base frente a Cuadra de ampliación cuando cambian licencias; plantillas premium en organizaciones sin CRM propio; suspensión/expiración, exceso de cupos y transferencias.
- Pruebas focales: Barrio + Ciudad = 3; Barrio + Ciudad + Cuadra adicional = 6; no duplicación al cambiar licencias; publicación concurrente sobre último cupo; aislamiento por titular.
- **Estado:** decisión aprobada; sin implementación ni tests.

## 19. F0 — compatibilidad del esquema de licencias y propuesta de capacidad (CODE / DISEÑO)

**CODE verificado** en `db/schema/licensing.ts` y `db/queries/licensing.server.ts`:
- `billing_account` tiene un `owner_user_id` único. La frontera económica es el titular de facturación, **no** las membresías de Better Auth.
- `organization_license` vincula cada licencia a una organización y tiene un índice único parcial para una licencia no cancelada por organización. No modela directamente la compra de varias Cuadras de ampliación sin crear organizaciones ficticias o alterar la semántica de CRM.
- Estados disponibles: `pending`, `active`, `suspended`, `cancelled`. Existen `activated_at` y `ends_at`; comprobar ambos al definir licencia efectiva, no usar solo el texto de estado.
- `getLicenseLinesForBillingAccount` lista licencias del mismo `billing_account` y no deriva derechos de `member`.
- `api-platform-licensing.ts` opera asignación, cambio, cancelación, suspensión, reactivación y transferencia mediante `platform_admin`; no existe checkout autoservicio en esta ruta.

**Propuesta técnica F2, no implementada:**
1. Mantener `organization_license` para la licencia y CRM de cada organización, sin romper su unicidad ni la auditoría.
2. Añadir entidad explícita de **Cuadra de ampliación de capacidad** vinculada a `billing_account`, con identificador, estado efectivo, fechas, referencia contractual y auditoría. No representar la ampliación como licencia CRM de una organización ficticia.
3. Resolver `baseSlots = 3` cuando el titular tenga al menos una licencia Cuadra/Barrio/Ciudad efectiva; en caso contrario `baseSlots = 0`. Resolver `extraSlots = 3 × ampliaciones Cuadra efectivas`; total = base + extra. La Cuadra base **no se cuenta otra vez** como ampliación. Validar también los estados de las ampliaciones.
4. Registrar asignación de cada MiniWeb publicado a la cuenta titular y consumir un cupo por organización; definir explícitamente transferencias de titular, downgrade y sobrecupo antes de migrar.
5. El servidor debe verificar capacidad al publicar, con prueba de carrera sobre el último cupo; no basta un contador en UI ni una consulta separada sin protección contra concurrencia.
6. El CRM Barrio/Ciudad se autoriza **por licencia de la organización destino**, nunca por cupos disponibles del titular.
7. La matriz de plantillas premium DEC-06 sigue vigente como objetivo, pero la atribución de plantillas a organizaciones sin licencia Barrio/Ciudad propia permanece pendiente de decisión.

**Bloqueos antes de implementar:** modelo comercial/operativo de compra de ampliaciones (sin checkout automático actual), tratamiento de sobrecupo por suspensión/expiración, y migración de organizaciones ya publicadas. **Evidencia CODE + propuesta**, sin pruebas ni migraciones.


## 21. Plan ejecutable por fases — decisiones, entregables y criterios de salida (2026-10-29)

**Objetivo:** pasar de auditoría a implementación sin bloquear todo el proyecto por decisiones secundarias. Cada fase entrega un PR acotado, pruebas focalizadas de archivos y contratos afectados, evidencia reproducible y revisión de compatibilidad con el HEAD actualizado. No lanzar suites generales ni editar áreas ajenas. No fusionar ni desplegar sin autorización.

### F0 — Cierre de contratos y compatibilidad
**Entregables:** matriz de decisiones DEC-01–08; inventario de endpoints, tablas, permisos y snapshots; contrato de cupos por cuenta; política de referencias de medios; matriz de riesgos y compatibilidad. **Salida:** ninguna ambigüedad impide implementar el núcleo. Las decisiones comerciales aún abiertas se aíslan detrás de reglas conservadoras y no se publican como hechos.

### F1 — Mi Vecidya: navegación y experiencia
**Entregables:** shell móvil/escritorio, selector de organización con contexto persistente, panel de estado, rutas de MiniWeb y negocio, vacíos/errores/carga accesibles. **Salida:** usuario cambia de organización sin fuga de datos y encuentra edición/publicación en máximo dos pasos de navegación. Pruebas focales de rutas, permisos y componentes.

### F2A — Licencias y capacidad MiniWeb
**Contrato aprobado:** bloque base único de 3 MiniWeb si existe al menos una licencia activa Cuadra/Barrio/Ciudad; Barrio y Ciudad no suman bloques; solo Cuadras de ampliación explícitas añaden 3 cada una. CRM Barrio/Ciudad exclusivo de la organización asignada.
**Diseño propuesto:** conservar organization_license; añadir registro de ampliaciones ligado a billing_account, estado y fechas; resolver capacidad en servidor; registrar titular de cada publicación y ocupación; controlar concurrencia del último cupo; denegar nuevas publicaciones sin cupo sin borrar snapshots previos. **Salida:** matriz 0/3/6/9, aislamiento por cuenta, cambios de titular y carreras validados con tests focales. **Dependencia:** F0, no F1.

### F2B — Modelo MiniWeb V2 y snapshots
**Entregables:** versionado de configuración; módulos con instanceId estable para galerías repetidas; migración reversible de V1; tabla de versiones publicadas inmutables; restauración histórica a borrador; CAS por revisión y versión publicada. **Salida:** V1 sigue leyendo, V2 permite módulos repetidos y publicaciones anteriores no se sobrescriben. Pruebas de migración, concurrencia y restore.

### F3 — Identidad visual
**Entregables:** portada, logo e identidad como elementos independientes; recorte y encuadre responsivo; fallback accesible. **Salida:** cambiar portada no mueve ni altera logo; visual móvil/escritorio validado.

### F4 — Medios, videos y galerías
**Evidencia CODE:** DELETE marca is_active=0 con CAS, no borra R2; ruta pública entrega solo medios referenciados en snapshot actual, aun si están inactivos; cuota suma también inactivos; caché compartida hasta 86400 s.
**Entregables:** galerías múltiples por instanceId; subida y validación de archivos; URLs de video externas con proveedores permitidos; orden independiente; referencias históricas; política de retención y GC seguro. **Salida:** borrar del borrador no rompe publicación; restore histórico detecta faltantes; ningún asset de otro tenant es accesible; cuota no se libera ficticiamente.

### F5 — Horarios
**Entregables:** editor semanal claro, días cerrados, validación de intervalos y presentación compacta en perfil público. **Salida:** misma interpretación entre formulario, snapshot y página publicada; casos límite cubiertos.

### F6 — Plantillas y niveles
**Entregables:** Cuadra esencial, Barrio avanzado, Ciudad completo, vista previa responsiva y enforcement en servidor. **Salida:** no se habilitan plantillas premium por modificar payload; downgrade mantiene snapshot publicado (DEC-07). **Decisión pendiente aislada:** organización sin CRM propio no hereda automáticamente plantillas Barrio/Ciudad; hasta resolverlo, solo catálogo esencial para nuevas publicaciones de esa organización como propuesta conservadora, sin afirmar aprobación comercial.

### F7 — Editor simple/avanzado
**Entregables:** ordenación de secciones, edición inline, ajustes progresivos, deshacer cambios de borrador y vista previa fiel. **Salida:** un usuario sin conocimientos técnicos completa un MiniWeb desde móvil; guardado y validaciones no alteran publicación.

### F8 — Publicación, historial y restauración
**Entregables:** revisión final, validación de licencia/cupo/plantilla, publicación atómica, historial de versiones, restore a borrador y republicación explícita. **Salida:** ningún cambio de borrador altera página pública; concurrencia de cupos y versiones rechaza operaciones conflictivas; rollback operativo documentado.

### F9 — QA y preparación de entrega
**Entregables:** pruebas focales acumuladas por contratos afectados, accesibilidad teclado/móvil, seguridad multi-tenant, migración y reversión, observabilidad y checklist de despliegue. **Salida:** evidencias ligadas a SHA y aprobación explícita antes de merge/deploy.

### Reglas para evitar huecos
- **Propietario de dato:** billing_account gobierna cupos; organization gobierna contenido; organization_license gobierna CRM; publicación conserva snapshot y referencias.
- **Cambios de licencia:** expiración, suspensión, transferencia y exceso de cupos requieren una política expresa; mientras tanto, proteger lo ya publicado y bloquear nuevas publicaciones cuando no exista capacidad, sin borrados automáticos.
- **Compatibilidad:** todo cambio de esquema debe tener estrategia de lectura V1, backfill, verificación y reversión.
- **Carreras:** proteger en servidor publicación, asignación de cupos, cambios de licencia y restore; no confiar en UI.
- **Concurrencia de agentes:** comprobar HEAD/PR antes de tocar archivos, commits pequeños y no modificar código fuera de fase.
- **Criterio de avance:** si falta una decisión no esencial, documentar supuesto conservador reversible y continuar las fases independientes; si afecta facturación, permisos o borrado irreversible, no implementarla como regla definitiva sin aprobación.

## 22. F2A/F2B — especificación de implementación y pruebas focales (diseño, 2026-10-29)

### F2A. Separación de licencias CRM y ampliaciones Cuadra

**CODE:** `db/schema/licensing.ts` contiene `billing_account` (titular único), `organization_license` (organización, plan, estado y fechas) y unicidad parcial de licencia no cancelada por organización. `db/queries/licensing.server.ts` dispone de lectura por cuenta y por organización. La API de licencias es de administración de plataforma.

**Diseño para PR F2A-1 (migración aditiva):** crear `billing_miniweb_capacity_extension` con `id`, `billing_account_id`, `kind='cuadra_extra'`, `status`, `starts_at`, `ends_at`, `created_at`, `updated_at`, referencia externa de compra opcional y metadatos de auditoría. El registro de ampliación no se asigna a una organización y no concede CRM. Mantener intacto `organization_license`. No crear licencia ficticia de organización.

**Diseño para PR F2A-2 (resolver):** servicio puro y consulta DB que calculan `hasBase = existe licencia Cuadra/Barrio/Ciudad efectiva para billing_account`, `base = hasBase ? 3 : 0`, `extra = 3 × ampliaciones Cuadra efectivas`. Una Cuadra base dentro de `organization_license` nunca cuenta también como extensión. La extensión solo es utilizable si existe base efectiva, salvo decisión comercial posterior. Rechazar estados `pending`, `suspended`, `cancelled` y fechas fuera de vigencia. El CRM se sigue resolviendo por licencia activa de la organización objetivo.

**Diseño para PR F2A-3 (ocupación y publicación):** introducir asociación verificable de organización publicada con cuenta de facturación, más una reserva/ocupación única por organización. La primera publicación ocupa un cupo; republicar la misma organización no consume otro. Una nueva publicación de otra organización debe verificar disponibilidad y reservar en la misma operación serializable/atómica que el cambio de publicación. Resolver cambios de titular con operación administrativa auditada. Prohibir inferir titular de membresía.

**Política provisional operativa no comercial:** si hay menos capacidad que publicaciones existentes, no eliminar ni despublicar snapshots automáticamente; bloquear **nuevas ocupaciones** y registrar exceso para resolución administrativa. El comportamiento de republicación de organizaciones excedidas queda sujeto a decisión expresa; no convertir la propuesta en derecho contractual.

**Pruebas F2A exclusivamente focales:** ninguna licencia=0; solo Barrio=3; Barrio+Ciudad=3; solo Ciudad=3; solo Cuadra=3; Barrio+Ciudad+1 extensión Cuadra=6; +2 extensiones=9; ampliación suspendida no cuenta; CRM de Barrio no se filtra a otra organización; miembros de cuentas ajenas no suman cupos; dos publicaciones simultáneas con un cupo libre no pueden ambas ocuparlo; republicar no consume cupo.

### F2B. Contrato MiniWeb y versiones inmutables

**CODE:** `app/features/miniweb/registry.ts` usa módulos por `type`, catálogo Esencial disponible y familias adicionales `planned`. `db/queries/business-publication.server.ts` declara `BUSINESS_PUBLICATION_SCHEMA_VERSION=4`, acepta snapshots legacy 1–4 y normaliza medios y branding. El snapshot actual debe mantenerse legible.

**Diseño para PR F2B-1 (configuración):** formato V2 con `instanceId` estable por módulo, `type`, `moduleVersion`, `enabled`, `sortOrder`, `layoutVariant`, `settings` validado; eliminar unicidad por `moduleType` solo después de migración compatible. Migración V1→V2 genera IDs deterministas para módulos existentes; galerías nuevas usan IDs únicos. No cambiar el significado de datos legacy.

**Diseño para PR F2B-2 (historial):** tabla append-only `business_publication_version` con `organization_id`, `version`, `schema_version`, `snapshot_json`, `published_at`, `actor_user_id`, hash/checksum opcional; índice único `(organization_id, version)`. Publicar agrega nueva versión y actualiza puntero actual con CAS en una operación atómica. Nunca sobrescribir filas históricas. Backfill del snapshot actual como versión inicial histórica sin duplicar si se repite.

**Diseño para PR F2B-3 (restauración):** restaurar copia del snapshot elegido a **nuevo borrador**, verificando propiedad de medios, integridad de IDs, vigencia de plantilla y esquema; no modificar publicación pública hasta una acción explícita de publicar. Proteger conflictos de revisión y versiones. Medios históricos desactivados pueden ser públicos si el snapshot actual los referencia; no hacer GC de R2 mientras los referencie cualquier versión retenida.

**Pruebas F2B focales:** parseo de snapshots v1–v4; migración idempotente; dos galerías del mismo tipo con `instanceId` distintos; publicación append-only; CAS conflictivo; restaurar sin publicar; medios históricos inactivos; aislamiento tenant.

### Orden de PR y puertas de salida

1. **F2A-1** migración aditiva + rollback documentado → revisión de esquema.
2. **F2A-2** resolver puro + tests de matriz → verificación de derechos.
3. **F2A-3** ocupación atómica + tests de carreras → habilitar control en publicación, no solo UI.
4. **F2B-1** contrato V2 + lector V1 → compatibilidad.
5. **F2B-2** historial append-only + backfill idempotente → integridad.
6. **F2B-3** restauración a borrador + medios retenidos → seguridad.

**Sin bloquear fases visuales:** F1 y F3 pueden implementarse en paralelo sin depender de compra de ampliaciones. F6/F8 no se dan por terminadas hasta conectar el resolver de derechos y la publicación atómica. Todo diseño pendiente de decisión comercial queda identificado como propuesta, no como requisito aprobado.


## 23. Cierre de diseño transversal Mi Vecidya ↔ MiniWeb ↔ Servicios y pagos (2026-10-29)

**Checkpoint:** el plan funcional F0–F9 existe, pero **no está cerrado como especificación lista para implementar íntegramente**; no hay migraciones, componentes ni pruebas nuevas de estas fases. El módulo de pagos B0–B8 se diseña en `SERVICIOS-PAGOS-PLAN-V1.md` y no sustituye las fases MiniWeb.

### Contrato de integración común (propuesta)
1. **Identidad:** `user` inicia sesión; `billing_account` define titular económico; `organization` define negocio y aislamiento de contenido; `organization_license` define CRM por organización; `billing_miniweb_capacity_extension` define capacidad Cuadra adicional; `organization_subscription` representa add-ons y servicios; ninguna tabla sustituye otra.
2. **Lectura de derechos:** resolver central `effectiveEntitlements(billingAccountId, organizationId, at)` devuelve cupos base, ampliaciones, ocupaciones, licencia CRM de la organización, nivel de plantilla autorizado, complementos activos y estados. Debe basarse en **activación efectiva**, no en pedido, pago aislado o simple asignación administrativa.
3. **Publicación:** verifica en servidor permisos, licencia/capacidad, plantilla y revisión de borrador en el momento de la operación; registra ocupación y versión histórica de forma atómica. No deducir derechos de la UI ni de un recibo de pago.
4. **Facturación:** suscripciones, facturas y pagos son hechos económicos distintos de derechos de uso y activación GHL. El dashboard muestra los tres estados por separado: contratado, activado y pagado.
5. **Conservación:** baja, impago o downgrade no destruyen automáticamente borradores, snapshots, medios ni facturas; acciones destructivas requieren política y auditoría. La publicación existente en downgrade conserva DEC-07.
6. **Administración:** gestión interna Vecidya asigna contratos y servicios, verifica activación externa y registra cambios; Mi Vecidya muestra únicamente datos autorizados. El CRM externo sigue gestionando conversaciones y operaciones CRM.

### Puertas de cierre de diseño F0
| Tema | Situación | Salida exigida |
| --- | --- | --- |
| Capacidad 3/6/9 | DEC-08 aprobada | Migración de organizaciones publicadas y asignación de titular sin duplicar Cuadras |
| Plantillas Cuadra/Barrio/Ciudad | DEC-06 aprobada en niveles | IDs y variantes reales, licencia efectiva de organización secundaria |
| Downgrade | DEC-07 aprobada | Validación transaccional contra cambios concurrentes de licencia |
| Suspensión/expiración | Pendiente decisión comercial | Política expresa de visualización, edición, publicación, recuperación y sobrecupo |
| Multimedia histórica | CODE auditado | Retención, referencias a snapshots, GC y cuotas verificables |
| Videos externos | Función aprobada | Lista de proveedores, seguridad de URL, embebido y privacidad |
| Horarios | UX propuesta | Zona horaria, intervalos, excepciones, migración de reglas existentes |
| Editor premium | Alcance funcional aprobado | Esquemas de settings, tokens, módulos, versiones y catálogo concreto |
| B0–B8 pagos | Plan separado iniciado | Reutilizar billing_account y org, nunca acoplar publicación a UI de cobro |
| QA | No ejecutado | Tests focales por contrato y evidencia vinculada a SHA |

**Orden de trabajo priorizado:** cerrar decisiones de F0 que afecten derechos y retención; especificar modelo MiniWeb V2 y migraciones F2B; cerrar matriz de plantillas y estados; terminar F1/F3/F4/F5/F6/F7/F8 como historias verificables; después avanzar B1–B8 sin duplicar la capa de derechos. F1 y F3 pueden avanzar en paralelo cuando no toquen contratos aún abiertos.

**No asumir aprobación por silencio:** para suspensiones, expiración, transferencia de titular, borrado histórico o acceso premium de organizaciones secundarias, preparar alternativas y solicitar decisión antes de implementar una política irreversible. Ninguna de estas pendientes impide seguir diseñando UI y contratos seguros.

## 12. Registro de avance

- **2026-10-29 — [x] F0 esquema de licencias CODE:** cuenta de facturación única por titular, licencia actual por organización, estados y API admin; propuesta de Cuadra de ampliación separada, sin implementación.
- **2026-10-29 — [x] DEC-08 corregida:** Barrio/Ciudad no acumulan cupos; bloque base único de 3 y ampliaciones exclusivamente por Cuadras adicionales. Sin código, tests, merge ni deploy.
- **2026-10-29 — [x] F0 rutas CODE:** identificadas rutas reales y permisos save/publish, punto de lectura de licencia y tensión multi-organización del catálogo; pendiente decidir nivel de plantillas de organizaciones secundarias. Sin ejecución.
- **2026-10-29 — [x] F0 publicación y cuotas CODE:** snapshot schema 4, CAS por revisión/token, sobrescritura de publicación, cuotas técnicas 32 MiB/100 MiB; pendiente inventario de rutas y licencia efectiva. Sin ejecución.
- **2026-10-28 — [x] F0 contratos CODE:** inspección de oferta comercial, loader del editor, configuración v1 y schema D1; identificada incompatibilidad del índice único por tipo con galerías múltiples. Sin ejecución ni migraciones.
- **2026-10-28 — [x] DEC-07:** downgrade aprobado: conservar snapshot público y exigir plantilla autorizada antes de nuevos cambios de diseño/publicación; reglas y pruebas focales especificadas. Sin código, merge ni deploy.
- **2026-10-28 — [x] F0 documental parcial:** contraste CODE de `licenses.tsx` y `registry.ts`; identificada deuda de alineación comercial, sin pruebas ni implementación.
- **2026-10-28 — [x] DEC-06:** distribución progresiva Cuadra → Barrio → Ciudad confirmada, matriz conceptual y controles server-side definidos; catálogo específico y política de downgrade pendientes.
- **2026-10-28 — [x] DECISIONES:** DEC-01–DEC-05 confirmadas e incorporadas al contrato funcional; pendientes operativos documentados. Sin merge ni deploy.
- **2026-10-28 — [x] DOCUMENTACIÓN:** consolidación inicial de requisitos aprobados, inspección estática y propuestas en plan único. **[ ] CÓDIGO:** ninguna fase implementada por este checkpoint. **[ ] TEST:** ninguna prueba nueva ejecutada. **[ ] PRODUCCIÓN:** sin cambios.
