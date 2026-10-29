# MI VECIDYA + MINIWEB PREMIUM V2 — PLAN MAESTRO V1

**ID:** APP-MINI-PLAN-V1 · **Fecha:** 2026-10-28 · **Estado:** planificación documental, NO implementado · **Repositorio:** `hola675/Vecidya` · **Producto:** `vecidya-platform/`.

**Alcance de este checkpoint:** únicamente este plan en `plans/`. No cambia aplicación, D1, licencias, CRM, producción ni configuración remota. No autoriza merge ni deploy.

> **Evidencia:** `APROBADO` = decisión explícita del usuario; `CODE` = inspección estática de `main`; `DOC` = documentación del repositorio no revalidada en ejecución; `PROPUESTA` = diseño pendiente de validación; `TEST` = prueba efectivamente ejecutada (ninguna nueva). **Marcas:** `[x]` documentado/comprobado dentro de su alcance, `[~]` parcial o pendiente de decisión, `[ ]` no implementado, `[!]` bloqueo. Ningún `[x]` documental acredita software terminado.

## 0. Objetivo y principios

**APROBADO:** Convertir Mi Vecidya en una aplicación coherente, accesible y fácil para personas sin experiencia tecnológica, y MiniWeb en un constructor visual premium de plantillas y secciones personalizables. Complejidad interna, simplicidad externa. Permitir crear, editar, publicar y mantener periódicamente una página sin programar.

**APROBADO:** Vecidya gestiona presencia digital, perfiles, MiniWeb, medios, publicación y configuración de su aplicación. GHL conserva sus funciones CRM; no duplicar CRM, automatizaciones ni contactos de GHL. Usar **licencia**, no membresía. Sin datos comerciales inventados.

**PROPUESTA:** Objetivo WCAG 2.2 AA, enfoque responsive diferenciado por superficie según DEC-17 (§36), SSR, rendimiento medido, componentes semánticos, teclado, movimiento reducido, contraste verificable, privacidad, autorización server-side por organización, progresión de divulgación y diseño consistente por tokens. Evitar HTML/CSS/JS arbitrarios de usuarios.

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

**Corrección aprobada (DEC-08):** la propuesta anterior de publicaciones secundarias amparadas sin cupos queda sustituida. Una o varias licencias activas Cuadra/Barrio/Ciudad conceden un único bloque base de 3 MiniWeb; solo Cuadras adicionales de ampliación suman otros bloques de 3. Barrio/Ciudad incluyen una sola vez el beneficio Cuadra y conceden CRM exclusivamente a su organización asignada. El catálogo histórico requiere conciliación. La atribución de plantillas avanzadas se resolvió en DEC-10 (compartidas por titular) y la suspensión/expiración en DEC-09 (congelación pública y desactivación administrativa).

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
7. La matriz de plantillas premium DEC-06 sigue vigente y DEC-10 aprueba compartir el nivel visual máximo entre organizaciones del titular, sin compartir CRM.

**Bloqueos antes de implementar:** modelo comercial/operativo de compra de ampliaciones (sin checkout automático actual), tratamiento de sobrecupo por suspensión/expiración, y migración de organizaciones ya publicadas. **Evidencia CODE + propuesta**, sin pruebas ni migraciones.


## 21. Plan ejecutable por fases — decisiones, entregables y criterios de salida (2026-10-29)

**Objetivo:** pasar de auditoría a implementación sin bloquear todo el proyecto por decisiones secundarias. Cada fase entrega un PR acotado, pruebas focalizadas de archivos y contratos afectados, evidencia reproducible y revisión de compatibilidad con el HEAD actualizado. No lanzar suites generales ni editar áreas ajenas. No fusionar ni desplegar sin autorización.

### F0 — Cierre de contratos y compatibilidad
**Entregables:** matriz de decisiones DEC-01–08; inventario de endpoints, tablas, permisos y snapshots; contrato de cupos por cuenta; política de referencias de medios; matriz de riesgos y compatibilidad. **Salida:** ninguna ambigüedad impide implementar el núcleo. Las decisiones comerciales aún abiertas se aíslan detrás de reglas conservadoras y no se publican como hechos.

### F1 — Mi Vecidya: navegación y experiencia
**Entregables (DEC-17 prevalece: /app solo tableta/escritorio; móvil público sí):** shell tableta/escritorio, selector de organización con contexto persistente, panel de estado, rutas de MiniWeb y negocio, vacíos/errores/carga accesibles. **Salida:** usuario cambia de organización sin fuga de datos y encuentra edición/publicación en máximo dos pasos de navegación. Pruebas focales de rutas, permisos y componentes.

### F2A — Licencias y capacidad MiniWeb
**Contrato aprobado:** bloque base único de 3 MiniWeb si existe al menos una licencia activa Cuadra/Barrio/Ciudad; Barrio y Ciudad no suman bloques; solo Cuadras de ampliación explícitas añaden 3 cada una. CRM Barrio/Ciudad exclusivo de la organización asignada.
**Diseño propuesto:** conservar organization_license; añadir registro de ampliaciones ligado a billing_account, estado y fechas; resolver capacidad en servidor; registrar titular de cada publicación y ocupación; controlar concurrencia del último cupo; denegar nuevas publicaciones sin cupo sin borrar snapshots previos. **Salida:** matriz 0/3/6/9, aislamiento por cuenta, cambios de titular y carreras validados con tests focales. **Dependencia:** F0, no F1.

### F2B — Modelo MiniWeb V2 y snapshots
**Entregables:** versionado de configuración; módulos con instanceId estable para galerías repetidas; migración reversible de V1; tabla de versiones publicadas inmutables; restauración histórica a borrador; CAS por revisión y versión publicada. **Salida:** V1 sigue leyendo, V2 permite módulos repetidos y publicaciones anteriores no se sobrescriben. Pruebas de migración, concurrencia y restore.

### F3 — Identidad visual
**Entregables:** portada, logo e identidad como elementos independientes; recorte y encuadre responsivo; fallback accesible. **Salida:** cambiar portada no mueve ni altera logo; visual móvil/escritorio validado.

### F4 — Medios, videos y galerías
**Evidencia CODE:** DELETE marca is_active=0 con CAS, no borra R2; ruta pública entrega solo medios referenciados en snapshot actual, aun si están inactivos; cuota suma también inactivos; caché compartida hasta 86400 s.
**Entregables (DEC-15 prevalece):** galerías múltiples por instanceId; subida y validación de archivos; URLs de video externas con proveedores permitidos; orden independiente; referencias históricas; política de retención documentada sin GC físico automático en V2 inicial. **Salida:** borrar del borrador no rompe publicación; restore histórico detecta faltantes; ningún asset de otro tenant es accesible; cuota no se libera ficticiamente.

### F5 — Horarios
**Entregables:** editor semanal claro, días cerrados, validación de intervalos y presentación compacta en perfil público. **Salida:** misma interpretación entre formulario, snapshot y página publicada; casos límite cubiertos.

### F6 — Plantillas y niveles
**Entregables (DEC-18 prevalece):** Base/Pro/Premium solo visuales, con funcionalidad completa en Cuadra, vista previa responsiva y enforcement en servidor. **Salida:** no se habilitan plantillas premium por modificar payload; downgrade mantiene snapshot publicado (DEC-07). **DEC-10 aprobada:** el nivel visual máximo Cuadra/Barrio/Ciudad se comparte entre todas las organizaciones autorizadas del mismo billing_account, aunque no tengan CRM propio. El CRM permanece exclusivamente en su organización licenciada. Validar nivel visual compartido en servidor, sin sumar cupos por Barrio/Ciudad.

### F7 — Editor simple/avanzado
**Entregables:** ordenación de secciones, edición inline, ajustes progresivos, deshacer cambios de borrador y vista previa fiel. **Salida (corregida por DEC-17):** un usuario sin conocimientos técnicos completa un MiniWeb desde tableta/escritorio; guardado y validaciones no alteran publicación.

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


## 24. DEC-09 — Vencimiento, suspensión y desactivación manual de MiniWeb (APROBADO, 2026-10-29)

**Decisión explícita del titular:** cuando la licencia venza o quede suspendida, el MiniWeb ya publicado **permanece visible al público**; el usuario no puede editar ni volver a publicar hasta regularizar su situación. Si no habrá renovación, un **administrador de plataforma Vecidya** puede desactivar posteriormente la publicación mediante una acción administrativa expresa.

### Máquina de estados de publicación (contrato de diseño)
- `draft`: sin publicación pública, contenido editable solo si licencia y permisos efectivos lo permiten.
- `published`: publicación vigente, accesible públicamente, edición/publicación según permisos y licencia.
- `published_frozen`: snapshot público **continúa visible** por vencimiento/suspensión; prohibidos cambios de MiniWeb y republicaciones; conservar borrador, historial y medios. Los cambios de datos de negocio ajenos a MiniWeb mantienen sus reglas de autorización independientes.
- `unpublished_by_admin`: publicación oculta al público por decisión explícita de platform_admin ante no renovación; **no borrar** snapshot, versiones ni archivos. La ruta pública no debe mostrar una página activa; respuesta HTTP y SEO deben definirse y probarse.
- `reactivated`: tras regularización de licencia, se recupera la capacidad de edición y publicación según derechos actuales; no restaurar automáticamente un MiniWeb previamente desactivado por admin sin revisión/autorización administrativa.

### Acción administrativa de desactivación
**Requisitos:** permiso específico `miniweb:publication:deactivate` de platform_admin, organización objetivo, motivo `non_renewal`, confirmación explícita, actor y timestamp, referencia de licencia y versión publicada, registro de auditoría. Operación idempotente, protegida con revisión/CAS y aislamiento por organización. Una desactivación no puede modificar publicaciones de otras organizaciones ni eliminar facturas. La reactivación administrativa requiere permiso separado y validación de licencia/cupo/plantilla; no equivale a restaurar un snapshot histórico en borrador.

### Integración con Servicios y pagos
- Vencimiento/suspensión del contrato y estado de pago son **hechos distintos**: una factura pendiente no desactiva automáticamente el MiniWeb si no existe transición de licencia autorizada.
- El dashboard muestra licencia vencida/suspendida, MiniWeb público congelado y, si procede, desactivación administrativa; conserva cargos, recibos e historial.
- No hacer de la UI de pagos fuente de derechos. El backend consulta el estado efectivo de licencia y la decisión administrativa de publicación.

### Casos de prueba focales obligatorios
1. Vencimiento o suspensión conserva la misma versión pública y bloquea guardar/publicar MiniWeb.
2. Regularización recupera edición/publicación solo si la publicación no fue desactivada por admin.
3. Admin desactiva por no renovación; la URL deja de servir contenido activo sin borrar versiones ni medios.
4. Usuario normal, miembro de organización y soporte sin permiso no pueden desactivar/reactivar.
5. Desactivación repetida es idempotente; carrera entre publicar y desactivar no deja estado inconsistente.
6. Restauración administrativa exige derechos efectivos y no publica un borrador sin acción expresa.
7. La baja de una organización no afecta MiniWeb ni facturas de otras del mismo titular.

**No aprobados ni inventados:** días automáticos de gracia, avisos por plazo fijo, fecha automática de desactivación, borrado definitivo, penalizaciones ni reactivación automática tras desactivación manual. El administrador decide cuándo proceder una vez confirmada la no renovación.

**Estado:** DEC-09 aprobada y documentada. Backend, permisos, UI administrativa, migraciones y pruebas todavía no implementados.


## 25. F0 — Contrato de plantillas en múltiples organizaciones (análisis de decisión, 2026-10-29)

**Estado: análisis histórico de alternativas; opción B aprobada posteriormente en DEC-10.** DEC-06 asigna niveles esenciales/avanzados/premium a Cuadra/Barrio/Ciudad; DEC-08 separa **capacidad de publicación de la cuenta** (3 base +3 por Cuadra extra) del **CRM de cada organización**. Una licencia Barrio/Ciudad de la organización A no debe activar el CRM de B. Falta decidir si el **nivel visual de MiniWeb** es una ventaja compartida del titular o un derecho ligado a cada organización.

### Alternativas sin inventar derechos
- **A — nivel por organización (conservadora):** el MiniWeb de una organización sin Barrio/Ciudad propios usa plantillas esenciales, aunque el titular tenga Barrio/Ciudad para otra organización. La capacidad 3/6/9 sí es común. Pros: evita transferencias implícitas de prestaciones premium; contras: una misma cuenta verá catálogos distintos.
- **B — nivel visual compartido por titular:** todas las organizaciones publicadas con cupo del mismo billing_account acceden al máximo nivel visual de alguna licencia activa del titular. **No** se comparte CRM, automatizaciones, canales ni servicios. Pros: experiencia de diseño coherente; contras: beneficio comercial adicional no aprobado, posible efecto de downgrade sobre varias páginas.
- **C — nivel visual asignado expresamente:** el titular dispone de nivel visual de su licencia, pero una organización secundaria obtiene ese nivel solo si se le asigna un entitlement MiniWeb explícito y auditable, sin CRM. Pros: control granular; contras: nuevo contrato/flujo administrativo y regla comercial por definir.

**Recomendación técnica hasta decisión:** implementar resolver con **dos dimensiones independientes** `publicationCapacity(billingAccountId)` y `templateTier(organizationId, billingAccountId)`, sin codificar que una licencia CRM se propaga entre organizaciones. Para pruebas y diseños no definitivos usar A como comportamiento provisional de menor privilegio; **no** dar por aprobada A ni bloquear F1/F3.

### Reglas comunes a A/B/C
1. Cupos base 3 una sola vez por titular con licencia activa; Cuadra extra +3; no sumar Barrio+Ciudad (DEC-08).
2. CRM, workflows y add-ons vinculados a la organización destino; no se transfieren por compartir titular.
3. El snapshot público premium ya publicado se preserva al reducir licencia (DEC-07) o congelarse por vencimiento (DEC-09).
4. La desactivación por no renovación exige acto explícito de platform_admin (DEC-09).
5. Cualquier nivel visual premium se valida en backend al guardar/publicar y en transacción consistente con licencia/cupo; la vista previa no concede derecho.
6. El titular económico puede pagar varias organizaciones; sus facturas no conceden por sí mismas derechos de edición.
7. Si el titular pierde la licencia que sustentaba el nivel compartido (opción B), las páginas existentes permanecen visibles; nuevas publicaciones requieren reevaluar derechos.

### Pruebas focales a preparar
- Titular con Barrio A + Cuadra B: capacidad 3, CRM Barrio solo A; nivel visual B según alternativa aprobada.
- Titular con Barrio A + Ciudad C: capacidad 3, no 6; CRM por organización.
- Titular con Ciudad A + Cuadra extra: capacidad 6; sin CRM adicional.
- Downgrade/suspensión de A no modifica snapshot público de B; nueva publicación valida nivel efectivo.
- Transferencia de titular y concurrencia entre licencia/cupo/publicación no permiten elevar derechos.
- La desactivación administrativa de una organización no altera otras publicaciones.

**Decisión resuelta en DEC-10 (§26): opción B aprobada; nivel visual compartido por titular, CRM por organización, cupos DEC-08 sin acumulación Barrio/Ciudad.**


## 26. DEC-10 — Plantillas MiniWeb premium compartidas por titular (OPCIÓN B APROBADA, 2026-10-29)

**Decisión explícita:** el titular de facturación puede usar en todas sus organizaciones MiniWeb el **máximo nivel visual de plantillas** que le otorgue cualquiera de sus licencias activas Cuadra/Barrio/Ciudad. Se comparte **solo el nivel de diseño MiniWeb**, no CRM, automatizaciones, contactos, canales, add-ons ni otros servicios. DEC-08 sigue vigente: **un único bloque base de 3 publicaciones**, más +3 por cada licencia Cuadra adicional de capacidad, sin sumar cupos por Barrio+Ciudad.

### Contrato de derechos efectivo
- `billingAccountId` es la frontera para `effectiveMiniWebTemplateTier`: `max(active organization_license.plan_code)` orden `cuadra < barrio < ciudad`, considerando solo licencias efectivas vigentes del mismo titular. No elevar por `pending`, `suspended`, `cancelled` o expiradas.
- `effectivePublicationCapacity` se resuelve **por separado**: 3 si existe al menos una licencia base activa, más 3 por ampliación Cuadra extra activa. Barrio y Ciudad no suman nuevos bloques.
- `effectiveCrmEntitlement(organizationId)` sigue leyendo únicamente la licencia activa de **esa organización**. Nunca inferir CRM por nivel visual compartido ni por ser miembro de una organización del titular.
- El nivel visual compartido se aplica a organizaciones autorizadas de esa cuenta, con cupo/ocupación de publicación verificado y permisos de edición de su organización; **no** permite a un titular editar negocios ajenos solo por ser pagador.
- Para una organización sin licencia propia pero con MiniWeb amparado por el titular, el derecho de diseño deriva del nivel visual compartido; **no** se crea licencia CRM ficticia.
- Si la licencia que aportaba Ciudad/Barrio se suspende, vence o se reduce, se recalcula el máximo nivel. Los snapshots publicados premium siguen visibles sin alterarse (DEC-07/DEC-09); guardar/publicar un diseño que ya excede el nivel efectivo requiere seleccionar plantilla autorizada. Si no queda ninguna licencia activa, toda nueva edición/publicación MiniWeb queda bloqueada.
- Una desactivación administrativa por no renovación (DEC-09) prevalece sobre el nivel visual compartido: no hay reactivación automática al contratar otra licencia.

### Concurrencia, auditoría y migración
- Resolver en servidor al seleccionar plantilla, guardar y publicar; publicar exige validación consistente de `billingAccountId`, licencia efectiva, capacidad, organización y `draftRevision` en el commit. No confiar en datos de sesión o frontend cacheados.
- Registrar en la versión publicada `templateId`, `templateVersion`, `effectiveTierAtPublish` y fuente `billingAccountId` para auditoría, **sin** usar el tier histórico como permiso para nuevas publicaciones.
- Cambios de titular deben reevaluar cupos y tier, no transferir automáticamente licencias ni contenidos; conservar snapshot y señalar sobrecupo si procede. No borrar ni degradar publicaciones existentes automáticamente.
- Las cuentas y organizaciones ya publicadas requieren backfill idempotente del titular/ocupación, sin doble consumo de cupo.

### Matriz focal de aceptación
| Cuenta y licencias activas | Cupos | Plantillas para todas sus organizaciones autorizadas | CRM |
| --- | ---: | --- | --- |
| Solo Cuadra A | 3 | Esenciales | Sin CRM |
| Barrio A + Cuadra B | 3 | Esenciales + avanzadas en A y B | Barrio solo A |
| Ciudad A + Barrio B | 3 | Esenciales + avanzadas + premium en A y B | Ciudad solo A; Barrio solo B |
| Ciudad A + Cuadra extra | 6 | Premium en organizaciones autorizadas del titular | Ciudad solo A |
| Barrio A + Ciudad B + 2 Cuadras extra | 9 | Premium en todas las autorizadas | CRM solo A y B según su licencia |
| Ciudad A suspendida + Barrio B activa | 3 | Avanzadas para nuevos cambios; premium ya publicado se conserva | Barrio solo B |
| Todas las licencias vencidas | 0 disponibles para nueva publicación | Sin nuevas ediciones/publicaciones; snapshots congelados visibles | Sin CRM efectivo |

**No implica:** comprar CRM para organizaciones secundarias, cupos adicionales por subir a Barrio/Ciudad, cambios en precios de licencias, publicación automática, permiso de administrador sobre otras organizaciones ni borrado de diseños al bajar de nivel.

**Estado:** decisión de producto aprobada y documentada; resolver, migraciones, editor y pruebas aún no implementados. Esta decisión **resuelve la alternativa B del §25**.


## 27. F2B — Contrato de migración V1→V2 y publicación histórica (especificación técnica, 2026-10-29)

**Base inspeccionada en rama documental:** `app/features/miniweb/registry.ts` valida la configuración mediante claves exactas `version/templateKey/templateVersion/layoutVariant/modules`; cada módulo acepta `type/moduleVersion/enabled/sortOrder/layoutVariant/settings`, y el esquema actual impide repetir tipos por límite y reglas de validación. `db/queries/business-publication.server.ts` acepta snapshots schema 1–4, normaliza media y branding y conserva `draftRevision` y `publishedVersion`. Este contrato **no** implementa todavía V2.

### Configuración V2 propuesta
```ts
type MiniWebConfigV2 = {
  version: 2;
  templateKey: string;
  templateVersion: number;
  layoutVariant: string;
  modules: Array<{
    instanceId: string; // identidad estable, distinta de type y sortOrder
    type: string;
    moduleVersion: number;
    enabled: boolean;
    sortOrder: number;
    layoutVariant: string;
    settings: unknown; // validador discriminado por type + moduleVersion
  }>;
};
```
**Reglas:** `instanceId` único por documento, inmutable al reordenar; `sortOrder` entero continuo 0..n-1; `type` puede repetirse solo para módulos declarados `repeatable` (galerías de imagen y video); portada/hero conserva unicidad y posición inicial; `settings` sin claves desconocidas ni HTML ejecutable; límites de número de módulos y tamaño del payload por definir con mediciones. No extender V1 cambiando su interpretación.

### Migración de borradores y publicados
1. Crear **lector dual**: V1 y V2; convertir V1 a V2 en memoria para editor sin escribir automáticamente ni modificar publicación.
2. Generar IDs V1 deterministas y estables desde `organizationId` + índice/posición original + tipo, con algoritmo versionado; IDs nuevos V2 aleatorios/únicos. Validar duplicados y colisiones; el ID no concede autorización.
3. Backfill **append-only** del snapshot actualmente publicado en `business_publication_version`, preservando el JSON y schemaVersion originales para auditoría. No reconstruir el histórico inexistente ni declarar que versiones sobrescritas antes del backfill son recuperables.
4. Guardar V2 solo por mutación explícita autorizada, con `draftRevision` CAS y validación server-side de tenant y plantilla; publicar V2 en transacción que compruebe licencia, capacidad, derechos visuales DEC-10 y estado admin DEC-09.
5. Mantener puntero público al snapshot vigente. Nueva publicación crea fila histórica inmutable y mueve puntero atómicamente; error de transacción deja intacta la publicación anterior.
6. Restauración selecciona una versión propia, copia datos a borrador V2 y señala medios faltantes/incompatibilidades; nunca publica automáticamente. Para publicación posterior se revalidan derechos actuales, no los históricos.
7. No eliminar medios de R2 mientras estén referenciados por snapshot público o versiones retenidas; separar desactivación lógica, cuota y GC físico. Definir política de retención antes de activar GC.
8. Rollback: permitir lector legacy y mantener snapshot original; si se despliega escritor V2, el rollback del código no puede asumir que versiones V2 son legibles por el binario V1: usar flag de escritura, compatibilidad de lector y plan de despliegue escalonado.

### Invariantes y casos focales
- V1 original leído sin pérdida; convertir dos veces produce mismos `instanceId`.
- Dos galerías del mismo tipo mantienen IDs y orden al guardar, mover, duplicar y publicar.
- Hero no puede duplicarse ni moverse fuera de la primera posición.
- Publicar y backfill concurrentes no crean dos versiones con mismo número.
- Restauración de versión premium en cuenta rebajada no permite bypass de DEC-07/10.
- Publicación congelada por DEC-09 no admite nuevas mutaciones MiniWeb; admin desactivada no reaparece por migración o restauración.
- Dos cuentas distintas con `organizationId` distinto nunca comparten datos ni activos.
- Snapshot publicado antes de migración conserva el mismo contenido público hasta publicación explícita.
- Un medio referenciado en cualquier versión retenida no puede eliminarse físicamente.
- Errores de backfill, migración o CAS no destruyen datos ni generan cobros.

**Pendientes de diseño con coste/impacto:** límites de videos y medios, retención temporal/cantidad de versiones, catálogo real de plantillas, estrategia HTTP/SEO de MiniWeb desactivado. No inventar cifras ni fechas. **Estado:** especificación documentada; ninguna migración, prueba o despliegue ejecutado.


## 28. F6 — Catálogo visual verificable y matriz de plantillas (2026-10-29)

**Inventario CODE real:** `app/features/miniweb/registry.ts` declara cinco `templateKey`: `vecidya-default` (Esencial, `available`), `services-studio` (Servicios, `planned`), `catalog-store` (Catálogo, `planned`), `gastronomy-table` (Gastronomía, `planned`) y `professional-profile` (Profesional, `planned`). Solo **una** está disponible hoy. Los `layoutVariants` son `standard`; **no** hay variantes premium ya construidas. La validación actual usa `version:1`, `settings:null`, unicidad de tipo y máximo 4096 bytes serializados; V2 requiere contrato nuevo, no relajar silenciosamente el validador V1.

### Matriz de catálogo objetivo (PROPUESTA, no activos ya disponibles)
| Key existente | Familia | Estado actual CODE | Tier mínimo objetivo | Primera composición de referencia |
| --- | --- | --- | --- | --- |
| `vecidya-default` | Profesional general | Disponible | Cuadra | Portada, presentación, contacto, ubicación, horarios |
| `services-studio` | Servicios | Planeada | Cuadra | Portada, servicios, beneficios, contacto |
| `catalog-store` | Catálogo | Planeada | Barrio | Portada, productos, galerías, contacto |
| `gastronomy-table` | Gastronomía | Planeada | Barrio | Portada, carta/productos, horarios, ubicación |
| `professional-profile` | Profesional | Planeada | Ciudad | Portada, credenciales, testimonios, contacto |

**Importante:** esta asignación por tier es una **propuesta de producto**, no decisión comercial ya aprobada. DEC-06 solo aprueba jerarquía Cuadra→Barrio→Ciudad; DEC-10 comparte el máximo tier entre organizaciones del titular. La familia de negocio no equivale al tier: más adelante cada familia puede tener variantes esenciales, avanzadas y premium. No anunciar las cuatro plantillas planeadas como disponibles.

### Diseño de registry V2
- Separar `templateFamily`, `templateKey`, `minimumLicenseTier`, `availability`, `version`, `layoutVariants`, `capabilities` y `previewAsset` opcional.
- `availability`: `planned`, `available`, `retired`; una versión `retired` se puede renderizar en snapshot histórico, pero no elegir para nueva publicación.
- Validar tier compartido DEC-10 en servidor para selección, guardado y publicación. El frontend muestra niveles bloqueados y motivo, sin conceder derechos.
- Mantener `vecidya-default` v1 y su render legacy; introducir diseños nuevos por versiones/keys nuevos, sin mutar la apariencia de snapshots publicados.
- Variantes de composición: hero con logo independiente y encuadre; columnas responsivas; tipografía y tokens de color; tarjetas; secciones repetibles. La configuración editable debe ser validada por esquema, no aceptar CSS/JS arbitrarios.
- Cada plantilla debe especificar fallback de imagen, navegación teclado, contraste, responsive, estructura semántica y media accesible.

### Inventario de módulos CODE y ampliación objetivo
**Disponibles:** `hero`, `about`, `contact`, `hours`, `services`, `gallery`, `location`, `products`, `faq`.
**Planeados:** `articles`, `team`, `certifications`, `testimonials`.
**V2 por especificar:** galerías de video repetibles, bloques de contenido flexible, secciones de columnas; no inventar que ya existen. `gallery` actualmente combina imágenes y videos del negocio, sin instancias repetibles.

### Gate de aceptación F6
1. Plantilla Esencial legacy renderiza idéntica en lectura y tras despliegue de registry V2.
2. Tier compartido del titular determina plantillas en organizaciones autorizadas sin compartir CRM.
3. Plantilla `planned` o `retired` no se puede seleccionar ni publicar, aunque se manipule payload.
4. Downgrade conserva snapshot público premium y bloquea nueva publicación premium (DEC-07).
5. Suspensión/vencimiento congela editor/publicación, mantiene web pública (DEC-09).
6. Diseño nuevo conserva portada/logo independientes y navegación accesible en móvil.
7. Tests focales de validador, autorización, renderer y snapshot; no suites generales.

**Estado:** inventario y contrato objetivo documentados; cuatro plantillas siguen `planned`; ninguna implementación ni prueba nueva realizada.


## 29. F7/F1 — Contrato funcional del editor y navegación Mi Vecidya (diseño, 2026-10-29)

**Objetivo:** convertir F1 y F7 en historias implementables sin alterar contratos de licencias, facturación ni publicación. Una única página MiniWeb V2 por organización (DEC-01), con módulos y composición independientes, editor simple por defecto y controles avanzados progresivos.

### F1 — Estructura de navegación y estados
- **Inicio Mi Vecidya:** organización activa, estado del perfil, MiniWeb publicado/borrador/congelado/desactivado, licencia y cupos compartidos del titular, acciones principales y tareas pendientes; no inventar métricas de tráfico.
- **Selector de organización:** cambia el contexto de trabajo sin cambiar automáticamente titular de facturación. La API revalida membresía y permiso para cada recurso; nunca usar solo el ID de URL o estado local como autorización.
- **Navegación objetivo:** `Inicio`, `Mi negocio`, `MiniWeb`, `Servicios y pagos`, `Aprende`, `Soporte`. La disponibilidad de cada entrada depende de permiso real; no duplicar funciones operativas del CRM.
- **Estados visibles:** sin organización, perfil incompleto, sin licencia base, cupos agotados, MiniWeb sin publicar, borrador con cambios, publicado, congelado por vencimiento/suspensión (DEC-09), desactivado por admin y error de carga. Cada estado presenta acción segura y motivo.

### F7 — Superficies del editor
| Zona | Contenido | Comportamiento |
| --- | --- | --- |
| Barra superior | Organización, estado, revisión, Guardar, Vista previa, Publicar | Publicar requiere validación final server-side; no prometer publicación hasta confirmación |
| Panel Secciones | Lista de módulos, añadir, duplicar si repeatable, mover, ocultar, eliminar del borrador | `instanceId` estable; hero no se elimina ni se mueve de primer lugar |
| Lienzo | Render fiel de borrador con selección y guías visuales | Vista escritorio/tableta/móvil; selección no altera datos |
| Inspector Contenido | Texto, imágenes, enlaces, datos de contacto, galerías, video, horarios | Controles tipados, sanitización y propiedad de medios |
| Inspector Diseño | Layout, paleta, tipografía, espacios, fondo, alineación, composición | Solo tokens/variantes permitidos por esquema y tier; no CSS/JS libre |
| Inspector Avanzado | Visibilidad, accesibilidad, SEO permitido, ajustes por dispositivo cuando proceda | No ofrecer controles que el renderer no soporte |
| Panel Historial | Versiones publicadas, fecha, autor, previsualizar, restaurar a borrador | Restaurar no publica ni borra versión actual |

**Modo simple:** preguntas y controles orientados al negocio, con vista previa en vivo, ajustes esenciales y CTA claros. **Modo avanzado:** inspector de composición, módulos, variantes y propiedades tipadas; alternar modo no debe perder datos ni cambiar permisos.

### Acciones y restricciones
1. **Guardar:** persiste borrador únicamente, mediante revisión/CAS; conflicto muestra comparación o recarga segura, nunca sobrescritura silenciosa.
2. **Vista previa:** render aislado de borrador; no expone URLs privadas ni concede permiso de publicación.
3. **Publicar:** pantalla de revisión con cambios, validación de licencia/cupo/tier DEC-08/10, estado DEC-09 y confirmación; snapshot público cambia solo tras commit exitoso.
4. **Deshacer/rehacer:** historial de edición de sesión con límites medidos; no reemplaza historial de versiones publicadas.
5. **Eliminar módulo:** elimina de borrador, no del snapshot público ni del R2 de inmediato. Para galería duplicada, eliminar una instancia no afecta otras.
6. **Cambio de plantilla:** previsualizar mapeo y elementos incompatibles; conservar copia recuperable; bloquear publicación premium no autorizada sin degradar snapshot vigente.
7. **Estado congelado:** permite consultar MiniWeb publicado e historial, pero no guardar, editar ni publicar; la desactivación por no renovación solo aparece en administración con permiso explícito.
8. **Accesibilidad:** acciones mover arriba/abajo además de drag-and-drop; navegación teclado; foco visible; etiquetas; anuncios de error/guardado; controles táctiles adecuados; soporte de zoom y reduced motion.

### F7 — Modelo de interacción responsiva
- **Escritorio:** panel de secciones, lienzo central, inspector lateral; barra de acciones fija sin cubrir contenido.
- **Tableta:** paneles colapsables y lienzo con ancho de vista previa seleccionable.
- **Móvil:** requisito histórico sustituido por DEC-17 (§36): el editor dentro de `/app` está bloqueado en móviles. La previsualización móvil se controla desde tableta/escritorio.
- **Guardado:** mostrar `Sin cambios`, `Cambios sin guardar`, `Guardando`, `Guardado`, `Conflicto`, `Error`; no llamar `Guardado` a un cambio solo local.
- **Salir con cambios:** confirmación accesible; recuperación de borrador solo cuando existe persistencia verificada, no prometer autosave no implementado.

### F1/F7 — Matriz de historias y pruebas focales
| Historia | Criterio de aceptación | Prueba focal |
| --- | --- | --- |
| Cambiar organización | Solo datos del negocio autorizado; permisos y cupos correctos | Aislamiento tenant y navegación |
| Crear MiniWeb | Borrador con hero obligatorio y plantilla permitida | Validación registry |
| Reordenar módulos | IDs estables, hero primero, orden continuo | Ordenación y persistencia |
| Duplicar galería | Dos instancias independientes con medios propios | V2 repeatable |
| Editar identidad | Portada y logo no se pisan; responsive | Componentes F3 |
| Editar horarios | Días/intervalos válidos, zona horaria coherente | Validación F5 |
| Guardar y publicar | Borrador no altera público; CAS y entitlements en commit | API F8 |
| Restaurar versión | Copia a borrador, publicación anterior intacta | Historial F2B |
| Licencia vencida | Publicación visible, controles de edición bloqueados | DEC-09 |
| Sin derecho premium | Vista previa explicativa, publicación rechazada | DEC-07/10 |
| Móvil sin drag | Reordenar y editar mediante botones y panel accesible | UX teclado/táctil |

**Dependencias de implementación:** F1 puede comenzar con rutas y estados tipados sin editar publicaciones; F7 requiere F2B para `instanceId`, F2A/DEC-10 para permisos, F3–F5 para controles reales y F8 para commit. No construir un editor visual que guarde un esquema que el servidor todavía no entiende.

**Estado:** especificación funcional documentada; no hay nuevas pantallas, tests ni despliegue de F1/F7 en este checkpoint.


## 30. DEC-11 — Dirección UX del editor aprobada y contratos F3–F5 (2026-10-29)

**APROBADO por el usuario:** dirección visual y funcional propuesta en §29: editor con barra superior, lista de secciones, lienzo central y panel de propiedades; modos **Simple** y **Avanzado**, previsualización escritorio/tableta/móvil, accesibilidad y diseño responsivo. La aprobación se refiere al **concepto de experiencia**, no a píxeles finales, assets, cambios comerciales ni funcionalidades ya implementadas. Mantener validaciones en servidor, misma fuente de datos entre modos y no confundir vista previa con publicación.

### F3 — Identidad visual y cabecera
- Modelo conceptual: `brand.logoAssetId`, `brand.iconAssetId`, `cover.assetId`, `cover.focalPoint{x,y}`, `cover.overlay`, `brand.colorTokens`; el contrato persistido se decidirá tras revisar tablas/medios actuales, sin duplicar fuente de verdad.
- Logo, icono y portada tienen controles y contenedores **independientes**. Cambiar portada nunca elimina ni desplaza el logo; icono/favicons no sustituyen logo.
- Portada: selección desde biblioteca autorizada, recorte/posición focal con preview móvil y escritorio, fallback sin imagen y texto accesible; sin exigir dimensiones no medidas.
- Identidad: nombre y descripción del perfil como datos estructurados, paleta con contraste comprobable, tipografía de catálogo permitido y CTA configurable solo con destinos seguros.
- El renderer publicado lee exclusivamente snapshot autorizado; edición de identidad en borrador no modifica la página pública hasta publicar. Las modificaciones de perfil fuera de MiniWeb conservan sus reglas existentes.

### F4 — Galerías, imágenes y videos
- Módulos repetibles V2 `gallery` con `instanceId` y modalidad `image`/`video`/mixta validada; cada instancia tiene título opcional, orden, disposición y selección propia de medios. Duplicar una sección **no** duplica archivos físicos ni transfiere propiedad.
- Subida de imagen/video: autorización por organización, tipo MIME real, tamaño/duración y límites a definir por coste/infraestructura, cuarentena/validación según proveedor y estado de procesamiento; nunca mostrar video fallido como publicado.
- Video externo: URL HTTPS y proveedor allowlist configurable, validación de ID canónico, iframe con permisos mínimos y privacidad; YouTube/Vimeo son **candidatos**, no proveedores aprobados automáticamente.
- Separar `assetId` de `instanceId`; referencias históricas y snapshot público se conservan. Eliminar del borrador no ejecuta borrado físico; retención/GC requiere política expresa y pruebas.
- Presentación: carrusel o cuadrícula accesible, texto alternativo en imágenes, subtítulos/transcripción cuando corresponda, control de reproducción, sin autoplay con sonido y carga diferida.

### F5 — Horarios avanzados
- Horario semanal estructurado por día con 0..N intervalos, estado cerrado, intervalos no solapados y zona horaria IANA del negocio.
- Intervalos nocturnos: definir semántica explícita `endsNextDay` o normalización a fecha siguiente; validar cruces con el día posterior y DST. No interpretar `22:00–02:00` como error ni como apertura 20 horas.
- Excepciones fechadas: cierres especiales, festivos, horario excepcional y precedencia sobre semana estándar; distinguir `cerrado` de `sin información`.
- UI simple: horario habitual por día, duplicar a otros días, cerrado y vista previa. UI avanzada: múltiples turnos, nocturnos, excepciones y zona horaria con explicación clara.
- Guardado y publicación: validar intervalos y zona en servidor; snapshot contiene interpretación estable; no inferir «abierto ahora» si faltan datos o zona horaria válida.

### Pruebas focalizadas y puertas de salida
| Área | Aceptación | Evidencia exigida al implementar |
| --- | --- | --- |
| F3 | Logo y portada independientes; fallback; preview móvil | Componentes + snapshot |
| F3 | Paleta/CTA seguros y contrastes accesibles | Validadores + accesibilidad |
| F4 | Dos galerías del mismo tipo independientes | Registry V2 + persistencia |
| F4 | URL externa maliciosa o asset ajeno rechazados | API + autorización |
| F4 | Media histórica no desaparece al editar borrador | Publicación + referencias |
| F5 | Turnos múltiples/nocturnos y excepciones coherentes | Validación + zona/DST |
| F5 | Sin datos no implica cerrado/abierto | Render público |
| F1/F7 | Editor Simple/Avanzado conserva mismo borrador | Estado + CAS |
| F1/F7 | Tableta permite mover secciones sin drag | Accesibilidad |

**Dependencias abiertas:** catálogo visual real y distribución de templates por tier (§28 es propuesta), límites económicos de video, proveedor externo permitido, cuotas/retención de media y versiones, y política de horarios frente a datos legacy. No inventar aprobación para estos puntos. **Estado:** dirección UX aprobada, especificación F3–F5 documentada, implementación/pruebas no iniciadas en este checkpoint.


## 31. F8 — Máquina de estados de publicación y restauración (2026-10-29)

**Contrato de producto:** la página pública se sirve exclusivamente desde el último snapshot publicado y autorizado para visibilidad; el borrador nunca se sirve públicamente. La visibilidad y la capacidad de editar/publicar son dimensiones **independientes** (DEC-07/09/10).

### Estados ortogonales
- **Contenido:** `never_published`, `published` (con versión y snapshot), `draft_dirty` (borrador distinto al publicado); `draft_dirty` puede coexistir con `published`.
- **Derecho de edición:** `editable`, `frozen_expired`, `frozen_suspended`, `frozen_no_base`, `restricted_tier`, `restricted_capacity`; resolver en servidor, no persistir un booleano de frontend como verdad.
- **Visibilidad pública:** `not_published`, `public`, `admin_deactivated`. `admin_deactivated` prevalece incluso si una nueva licencia entra en vigor; solo acción admin separada puede reactivar.
- **Historial:** lista append-only de versiones; `restore` produce nuevo borrador con nueva revisión, nunca modifica visibilidad ni la versión pública por sí mismo.

### Transiciones permitidas
| Acción | Precondiciones | Efecto atómico | No debe hacer |
| --- | --- | --- | --- |
| Guardar borrador | Permiso de edición, licencia efectiva, CAS revisión, módulo/medios propios | Incrementar `draftRevision` | Cambiar snapshot público |
| Primera publicación | Permiso, licencia activa, capacidad disponible, tier compartido, revisión vigente | Reservar cupo + añadir versión 1 + activar puntero público | Duplicar cupo por reintento |
| Republicación | Publicación existente autorizada, tier efectivo, CAS, no admin-deactivated | Añadir versión N+1 + mover puntero | Consumir segundo cupo |
| Restaurar versión | Permiso y acceso a versión de misma organización, licencia que permita editar | Crear borrador y marcar incompatibilidades | Publicar automáticamente |
| Vencimiento/suspensión | Cambio de licencia efectivo | Congelar edición/publicación; conservar público | Borrar contenido o despublicar |
| Downgrade de tier | Nuevo máximo del titular | Bloquear nuevas publicaciones premium incompatibles | Reescribir versión pública |
| Desactivar por no renovación | `platform_admin` con permiso explícito, motivo, confirmación, CAS | Visibilidad `admin_deactivated` + auditoría | Borrar snapshots/medios |
| Reactivar visibilidad | Acción admin separada, licencia regularizada, autorización y auditoría | Volver a `public` si snapshot íntegro | Republicar borrador o alterar versión |

**Idempotencia:** usar identificador de operación y unicidad por publicación/versionado; el mismo request no crea múltiples versiones ni consume dos cupos. **Concurrencia:** publicación, transferencia de titular, suspensión y desactivación compiten bajo transacción/bloqueo consistente; si no puede garantizarse en almacenamiento actual, no habilitar la operación hasta implementar serialización equivalente.

**Decisión operativa aún abierta:** qué hacer cuando el titular tiene más publicaciones ocupadas que cupos efectivos después de transferencias o reducciones. Política provisional segura: conservar visibilidad y bloquear nuevas ocupaciones; no asumir automáticamente derecho de republicación para todos los excedidos.

### Contrato de errores API
- `REVISION_CONFLICT`: borrador cambió; ofrecer recargar/comparar.
- `LICENSE_INACTIVE`: licencia base vencida/suspendida; sitio existente público.
- `TEMPLATE_TIER_DENIED`: plantilla supera nivel compartido vigente.
- `PUBLICATION_CAPACITY_EXCEEDED`: no hay cupo para primera publicación.
- `ADMIN_DEACTIVATED`: publicación desactivada por administración; no reactivar por edición.
- `ASSET_NOT_OWNED` / `ASSET_UNAVAILABLE`: medio ajeno o faltante.
- `PUBLISHED_VERSION_CONFLICT`: publicación cambió durante confirmación.
- `FORBIDDEN`: rol/organización no autorizados; sin revelar datos de otros tenants.

## 32. F9 — Plan de verificación focal y entrega segura (2026-10-29)

### Matriz de pruebas por cambio
| Área tocada | Pruebas obligatorias focales | Evidencia |
| --- | --- | --- |
| Licencias/capacidad | Resolver 0/3/6/9, CRM por organización, tier compartido, concurrencia | Tests de servicio y query |
| Registry V2 | V1→V2, módulos repetibles, IDs estables, hero obligatorio | Tests de validadores |
| Publicación | CAS, idempotencia, atomicidad, estados congelados/admin | Tests API/DB |
| Historial | Backfill idempotente, append-only, restore a borrador | Tests de repositorio |
| Medios | Referencias históricas, autorización, URL externa | Tests de media/seguridad |
| Editor | Guardado, selector organización, modos, responsive y teclado | Tests de componentes |
| Horarios | Intervalos, nocturnos, DST, excepciones | Tests de horario |
| Plantillas | Nivel compartido, downgrade, snapshots legacy | Tests de catálogo/renderer |

**CI focal:** seleccionar solo pruebas de archivos/contratos modificados y sus dependencias inmediatas; typecheck/build únicamente cuando corresponda al cambio y exista presupuesto de ejecución. No modificar workflows globales ni disparar suites generales por defecto. Si una verificación no se ejecuta, marcar `NO EJECUTADA` en vez de inferir éxito.

### Puertas de despliegue
1. **Antes de PR de implementación:** inventario de rutas/queries/schema reales, prueba de reversibilidad, impacto en otros agentes y límites del diff.
2. **Antes de merge:** pruebas focales vinculadas al SHA exacto, revisión de aislamiento tenant, plan de rollback y revisión de migraciones aditivas.
3. **Antes de staging:** migración de lectura dual y backfill idempotente, métricas de errores/latencia, feature flag para escritor V2 y smoke test focal.
4. **Antes de producción:** autorización explícita, verificación de snapshot legacy, control de cupos, permisos admin, restauración y monitoreo.
5. **Tras despliegue:** comprobaciones en URL DEV/staging/producción según fase; nunca declarar éxito basándose solo en comando de deploy. No ejecutar merge/deploy en este checkpoint.

### Riesgos y decisiones que bloquean acciones específicas
- **Comercial:** tier de cuatro plantillas `planned` aprobado en DEC-12 (§34); sigue pendiente su implementación y habilitación real.
- **Coste/almacenamiento:** cuota de videos, transcodificación, retención y GC aún sin valores aprobados; no habilitar subida sin límites operativos.
- **Historial:** número/tiempo de versiones y medios asociados aún no aprobado; evitar borrado físico y cobros automáticos.
- **Capacidad excedida:** DEC-13 (§34) aprueba conservar páginas y bloquear nuevas ocupaciones; republicación de excedidos no queda automáticamente autorizada.
- **SEO/visibilidad:** DEC-14 (§34) fija HTTP 404 neutro y exclusión del sitemap para `admin_deactivated`.

**Criterio de cierre del plan:** contratos y decisiones bloqueantes aprobados, matriz de rutas/tablas/servicios trazable al repo, PRs de implementación ordenados, criterios de aceptación verificables. No equivale a software terminado. **Estado:** F8/F9 especificados; implementación y pruebas aún pendientes.


## 33. F0 — Registro de decisiones finales y política provisional segura (2026-10-29)

**Objetivo:** separar lo aprobado de lo que requiere una decisión del titular antes de activar prestaciones comerciales o operaciones irreversibles. El plan funcional F0–F9 está redactado, pero el cierre de F0 **no** puede certificarse sin resolver estas cuestiones.

| ID | Asunto | Alternativa recomendada para aprobación | Hasta aprobación |
| --- | --- | --- | --- |
| DEC-12 | Distribución de plantillas existentes `planned` | Cuadra: Esencial + Servicios; Barrio: + Catálogo + Gastronomía; Ciudad: + Profesional. Crear después variantes premium por familia, sin afirmar que ya existen. | Solo Esencial `available` |
| DEC-13 | Exceso de publicaciones tras reducción/transferencia | Conservar todos los snapshots públicos; bloquear primeras publicaciones; permitir **solo** republicación de organizaciones que conserven ocupación válida y derecho efectivo, sin ampliar sobrecupo. Exceso requiere conciliación admin auditada. | No borrar ni despublicar; denegar operaciones ambiguas |
| DEC-14 | Sitio desactivado manualmente por admin | Responder HTTP 404 público con página de ausencia neutra, sin mostrar contenido ni causa privada; retirar del sitemap y noindex cuando haya respuesta HTML; reactivar solo admin. | No implementar desactivación pública sin respuesta definida |
| DEC-15 | Retención de versiones y media | Historial sin borrado físico automático durante V2 inicial; introducir cuotas y retención solo tras medir coste y aprobar política de recuperación. | Append-only; sin GC de activos referenciados |
| DEC-16 | Video subido y externo | Activar solo tras medir capacidad/coste, seguridad y política de proveedores; videos externos inicialmente restringidos a allowlist explícita aprobada. | No habilitar fuentes no verificadas ni cuotas inventadas |

**Estado histórico:** estas propuestas fueron aprobadas posteriormente por el usuario; ver §34 (DEC-12–16). La propuesta de no borrar físicamente es un guardarraíl técnico, no una promesa contractual de conservación indefinida. Ninguna política provisional autoriza cobros, nuevos límites comerciales, despublicación automática ni exposición de datos.

### Secuencia de implementación sin bloquear por decisiones pendientes
1. **PR-M1:** shell Mi Vecidya F1, selector de organización, estados solo lectura y permisos; sin cambiar publicación ni facturación.
2. **PR-M2:** schema aditivo F2A de ampliación Cuadra + resolver de cupos/tier compartido, tests focales, sin checkout.
3. **PR-M3:** lector dual y migrador puro MiniWeb V1→V2, `instanceId`, tests focales; no escribir V2 en producción.
4. **PR-M4:** historial append-only, backfill idempotente y publicación atómica con feature flag; pruebas CAS y aislamiento.
5. **PR-M5:** F3–F5 identidad, galerías/videos/horarios por entregas separadas, activar solo lo autorizado y medido.
6. **PR-M6:** F6 catálogo visual con derechos DEC-10, editor F7 simple/avanzado y responsive; integrar con API real.
7. **PR-M7:** F8 restauración y controles de admin, F9 accesibilidad/QA focal, pruebas de despliegue/rollback.

Cada PR requiere inventario de archivos, alcance acotado, tests focales y evidencias ligadas a SHA; sin merge/deploy automático. El orden puede subdividirse para evitar conflictos con otros agentes.

### Criterios de salida de diseño
- DEC-01–11 aprobadas y reflejadas en contratos; DEC-12–16 resueltas o bloqueadas explícitamente para que no se publiquen prestaciones no autorizadas.
- Migraciones de lectura dual, backfill y rollback con estrategia segura.
- Matriz de pruebas focales de F9 y responsables de datos definidos.
- No confundir **plan maestro funcional documentado** con **implementación terminada**.


## 34. DEC-12–16 — Aprobaciones finales de producto (APROBADAS, 2026-10-29)

**Aprobación explícita del titular:** se aprueban **únicamente** DEC-12, DEC-13, DEC-14, DEC-15 y DEC-16 según el registro del §33. Cualquier otra decisión abierta sigue pendiente; no interpretar silencio como aprobación.

### DEC-12 — Plantillas por licencia (APROBADA)
- **Cuadra:** Esencial (`vecidya-default`) y Servicios (`services-studio`).
- **Barrio:** incluye Cuadra, más Catálogo (`catalog-store`) y Gastronomía (`gastronomy-table`).
- **Ciudad:** incluye Barrio y Profesional (`professional-profile`).
- Esta matriz define **derechos objetivo**, no disponibilidad inmediata: en el código inspeccionado solo Esencial está `available`; las otras cuatro están `planned` hasta que se implementen, validen y habiliten. DEC-10 comparte el nivel visual máximo entre organizaciones del mismo titular, sin compartir CRM.
- No inventar variantes adicionales, precios ni cupos por la aprobación.

### DEC-13 — Sobrecupo y conciliación (APROBADA)
- Si una reducción/transferencia deja más publicaciones existentes que capacidad efectiva, **conservar los snapshots públicos** y no despublicar automáticamente.
- **Bloquear nuevas ocupaciones** mientras no exista capacidad libre. Resolver el exceso por conciliación administrativa explícita, auditada, con comprobación de titularidad y concurrencia; no borrar medios ni versiones.
- Esta decisión no concede por sí sola derecho ilimitado a republicar sitios excedidos: operaciones ambiguas deben denegarse hasta contar con reglas y autorización aplicables. La expiración total congela edición/publicación según DEC-09.

### DEC-14 — Página desactivada (APROBADA)
- Cuando `platform_admin` desactive expresamente por no renovación (DEC-09), responder **HTTP 404** con una página neutra de no disponibilidad, sin contenido del negocio ni explicación privada.
- Retirar URL del sitemap; la respuesta HTML puede incluir `noindex` como defensa adicional. No redirigir a otro negocio, no filtrar datos de cuenta, no confundir con caída de infraestructura.
- Reactivación requiere acción administrativa separada y auditada; la renovación no reactiva automáticamente.

### DEC-15 — Retención inicial (APROBADA)
- Durante la primera etapa de V2, **no borrar automáticamente versiones históricas ni archivos referenciados** por snapshots publicados o versiones retenidas.
- Medir volumen y costes antes de proponer límites de retención. Esta política no implica retención contractual indefinida, subida ilimitada, ni exención de restricciones legales de eliminación de datos.
- Registrar referencias de medios y bloquear GC destructivo hasta contar con un mecanismo de retención verificable y una política posterior aprobada.

### DEC-16 — Activación controlada de videos (APROBADA)
- Las **subidas de video** y las **fuentes externas** se habilitarán solo tras verificar capacidad, costes, límites de tamaño/duración, validación y seguridad, y proveedores explícitamente permitidos.
- No interpretar YouTube/Vimeo como aprobados por defecto; permanecen candidatos hasta decisión técnica documentada.
- Hasta pasar ese gate, el editor no prometerá una función de video disponible ni aceptará URL/proveedor arbitrario.

### Checklist de coherencia
- F2A: DEC-08/10/13 → cupos compartidos, tier visual compartido y exceso sin borrado.
- F2B/F8: DEC-09/14/15 → congelación, desactivación 404 y versiones retenidas.
- F4: DEC-16 → videos detrás de gate de coste/seguridad.
- F6: DEC-06/10/12 → catálogo progresivo aprobado, habilitación según estado real.
- F9: pruebas focales para los cinco contratos, sin suites generales ni cambios de CI ajenos.

**Estado de cierre:** DEC-01–16 aprobadas según sus respectivos alcances. La aprobación de estas decisiones **no** implica que el plan completo esté implementado ni que se hayan verificado límites de infraestructura o datos actuales. Próxima fase: inventario de rutas, servicios, esquemas y pruebas existentes para PR-M1, luego implementación focal sin merge/deploy no autorizado.


## 35. Puerta de entrada PR-M1 — navegación y estado de solo lectura (2026-10-29)

**Alcance permitido del primer PR de código:** implementar únicamente la estructura Mi Vecidya y el selector de organización, con estados MiniWeb **solo lectura**, sin modificar schema, pagos, licencias, publicaciones, media ni código de agentes ajenos. No declarar nombres de rutas existentes sin inspeccionarlos.

**Preflight obligatorio antes de editar:** leer `AGENTS.md` y gobernanza; inspeccionar rutas `app/routes`, loaders/autenticación, selector/contexto de organización, componentes y tests existentes; confirmar rama de trabajo, HEAD y archivos tocados por otros agentes. Crear rama de implementación independiente de esta rama documental y del PR #184, para no mezclar diseño con código.

**Entregables acotados:** shell de navegación, organización activa accesible, estado publicado/borrador/congelado/desactivado **derivado de API autorizada**, estados vacíos/error/carga, accesibilidad móvil y teclado. Si un estado no está respaldado por backend real, marcarlo como no disponible; no simular licencia ni cupos como efectivos.

**Criterios focales:** usuario sin organización; selector entre dos organizaciones autorizadas; rechazo de organización ajena; cambio de organización sin filtración de estado anterior; estado no disponible cuando API no informa; navegación móvil/teclado. Ejecutar únicamente tests relacionados con componentes/rutas alterados y typecheck focal cuando aplique; registrar comando y SHA.

**No incluido:** editor F7, escritor V2, ampliaciones Cuadra, pago, publicación, restore, video, nueva plantilla, cambios CI globales, merge o despliegue. Si el preflight encuentra conflictos de otros agentes, pausar el archivo conflictivo y continuar con tareas independientes.


## 36. DEC-17 — Política de dispositivos por superficie (APROBADA, 2026-10-29)

**Instrucción explícita del titular:** las aplicaciones **`/app` (Mi Vecidya)** y **`/internal` (administración interna)** son exclusivamente para **tableta y escritorio**. Su uso desde **móviles debe estar bloqueado**. En cambio, las **MiniWeb públicas** deben funcionar en **móvil, tableta y escritorio**.

### Alcance y precedencia
- **`/app` y `/internal`:** no ofrecer ni ejecutar interfaces operativas móviles. En móviles, mostrar una pantalla informativa de acceso no disponible que indique utilizar tableta o escritorio; sin navegación, formularios, acciones, editor ni información privada del panel.
- **MiniWeb público:** experiencia responsive completa en los tres tipos de dispositivo, incluyendo navegación, galerías, contacto, horarios, accesibilidad y rendimiento móvil.
- **Editor F7:** forma parte de `/app`; por tanto, **solo tableta y escritorio**. Se anulan los requisitos anteriores de editar, reordenar o publicar desde móvil en §29–30. Las vistas previas **simulan** móvil, tableta y escritorio, pero la vista previa móvil se controla desde un editor en tableta/escritorio.
- **API y seguridad:** el bloqueo visual por tamaño de pantalla no sustituye autorización, autenticación ni controles de tenant. No confiar en el user-agent como frontera de seguridad; evitar acceso a funciones operativas desde el frontend móvil y mantener permisos de servidor para todas las mutaciones.
- **Detección:** definir e implementar una regla consistente y comprobable para móvil vs tableta (ancho efectivo/capacidad de interfaz) sin bloquear accidentalmente tabletas en orientación vertical ni escritorios con ventana estrecha; la regla exacta se validará antes de codificar.
- **No extender el bloqueo** a páginas públicas como `/`, `/servicios`, `/vecindario`, `/vecindario/[slug]` ni a las MiniWeb públicas.

### Actualizaciones de aceptación
| Superficie | Móvil | Tableta | Escritorio |
| --- | --- | --- | --- |
| `/app` Mi Vecidya | **Bloqueado** | Permitido | Permitido |
| `/internal` | **Bloqueado** | Permitido | Permitido |
| Editor MiniWeb dentro de `/app` | **Bloqueado** | Permitido | Permitido |
| MiniWeb pública | **Permitido** | Permitido | Permitido |

**Pruebas focales:** acceso móvil a `/app` y `/internal` muestra bloqueo sin exponer datos; tableta vertical/horizontal y escritorio acceden con permisos válidos; editor puede previsualizar MiniWeb en móvil desde tableta/escritorio; MiniWeb pública se renderiza y utiliza correctamente en móvil/tableta/escritorio; rutas públicas ajenas no sufren regresiones.

**Estado:** política aprobada y documentada; no se ha implementado ni probado todavía el bloqueo.


## 37. F1/F6/F7 — Blueprint visual por superficie y plantilla (2026-10-29)

**Naturaleza:** propuesta de diseño detallada, NO mockups finales aprobados ni código. DEC-17 prevalece sobre cualquier mención histórica de `mobile-first` en este plan: `/app` y `/internal` son para **tableta y escritorio exclusivamente**; las MiniWeb públicas sí son responsive en móvil, tableta y escritorio.

### Sistema de experiencia compartido
- **App / Internal:** ancho útil para tabletas, navegación lateral colapsable, encabezado contextual, tarjetas de estado, paneles de trabajo y formularios con etiquetas visibles; densidad moderada y jerarquía clara. En móvil, reemplazar la experiencia por aviso neutro sin acciones operativas.
- **MiniWeb público:** navegación de pocas opciones, CTA principal inequívoco, secciones ordenadas y lectura rápida; prioridad a contenido real del negocio, imágenes optimizadas, contacto accesible y rendimiento móvil.
- **Editor F7 (solo app):** escritorio con tres áreas (secciones / lienzo / inspector); tableta con paneles colapsables o pestañas, sin exigir drag-and-drop. El selector de preview móvil no habilita edición desde un teléfono.
- **Tokens propuestos:** familias de espaciado, radios, tipografía, color semántico, estados de foco y elevación; mantener consistencia con tokens reales del repositorio, sin introducir otro design system antes de inventariar el existente.

### F1 — Inventario de pantallas objetivo
| Pantalla | Bloques principales | Acción primaria | Estados obligatorios |
| --- | --- | --- | --- |
| Inicio | organización activa, resumen perfil, MiniWeb, licencia/cupos, tareas | Continuar configuración / Editar MiniWeb | sin organización, sin licencia, publicado, borrador, congelado |
| Mi negocio | identidad, categoría, descripción, contacto, ubicación, horarios | Guardar datos del negocio | incompleto, válido, error de guardado, sin permiso |
| MiniWeb | plantilla, estado público, borrador, acceso editor, historial | Editar / Revisar publicación | nunca publicado, publicado, desactivado, cambios sin publicar |
| Biblioteca | activos por tipo, búsqueda, uso en secciones, cuota real | Seleccionar / Subir si autorizado | vacío, procesando, fallido, sin cuota, no autorizado |
| Configuración | cuenta, organización, permisos, integraciones según soporte | Guardar configuración | sin permiso, validación, error, éxito confirmado |
| Aprende/Soporte | contenidos y ayuda contextual existentes | Consultar recurso | sin contenido, carga, error |

**Regla de UX:** el selector de organización es visible y mantiene contexto; toda pantalla revalida permiso y titularidad en servidor. No mostrar cifras de consumo/cupos que el backend no pueda justificar.

### F6 — Identidad visual de las cinco plantillas
| Clave real | Nombre / nivel mínimo DEC-12 | Composición visual objetivo | Componentes destacados |
| --- | --- | --- | --- |
| `vecidya-default` | Esencial / Cuadra | Cabecera limpia, hero informativo, secciones en flujo vertical | identidad, servicios breves, horario, contacto |
| `services-studio` | Servicios / Cuadra | Hero con propuesta de valor, tarjetas de servicios y CTA visible | servicios, galería de trabajos, FAQ, contacto |
| `catalog-store` | Catálogo / Barrio | Portada de catálogo, cuadrícula de productos, categorías visuales | productos, galería, disponibilidad sin checkout inventado |
| `gastronomy-table` | Gastronomía / Barrio | Imagen editorial, menú/secciones, horarios y ubicación destacados | productos/menú, fotos, horario, ubicación |
| `professional-profile` | Profesional / Ciudad | Presentación de credenciales, servicios, trayectoria y contacto | about, servicios, certificaciones solo cuando módulo esté disponible |

**Importante:** las cinco composiciones son objetivos de diseño; actualmente solo `vecidya-default` está disponible. No mostrar certificaciones, testimonios o equipo como funcionales mientras sus módulos sigan `planned`. Ninguna plantilla debe suponer checkout, reservas o CRM nativos no existentes.

### Contratos visuales por tamaño
- **MiniWeb móvil:** contenido en una columna salvo galerías que admitan 2 columnas legibles; navegación compacta accesible, CTA visible sin tapar contenido, imágenes adaptativas, controles táctiles y foco.
- **MiniWeb tableta:** composiciones de una/dos columnas según contenido, medios con proporciones estables, navegación legible.
- **MiniWeb escritorio:** secciones con anchura máxima, rejillas y espacios generosos, sin líneas de texto excesivamente largas.
- **Editor tableta:** panel de secciones e inspector alternables, lienzo sin reducción ilegible, controles de orden por botones; no usar viewport de teléfono como modo de trabajo.
- **Bloqueo app/internal móvil:** pantalla de acceso no disponible, sin contenido operativo. Determinación técnica por validar para no confundir tableta vertical con teléfono grande ni escritorio estrecho.

### Entregables que faltan para cerrar diseño visual
1. Auditoría del sistema de diseño actual y componentes reutilizables del repositorio.
2. Wireframes revisables para las seis pantallas de F1 y los estados vacíos/bloqueados.
3. Diseños de las cinco plantillas con variantes móvil/tableta/escritorio y controles de accesibilidad.
4. Matriz final componente ↔ módulo V2 ↔ tier ↔ permiso ↔ API, sin prometer módulos `planned`.
5. Aprobación visual explícita antes de construir el catálogo nuevo; DEC-11 aprueba el **concepto del editor**, no estas composiciones de plantilla.

**Estado:** blueprint propuesto y documentado, sin renders, tests, implementación ni despliegue.


## 38. DEC-18 — MiniWeb completo en Cuadra; licencias diferencian exclusivamente plantillas visuales (APROBADO, 2026-10-29)

**Aclaración explícita del titular y prioridad sobre cualquier tabla anterior que sugiera restricciones de secciones por tier:** **Cuadra ($39/mes) es el producto MiniWeb completo**, no un constructor recortado. **Barrio ($59/mes) y Ciudad ($89/mes) amplían el catálogo y la calidad de las plantillas/variantes visuales**, no desbloquean secciones, módulos o herramientas funcionales del constructor. Esta decisión preserva el valor principal de Cuadra para negocios que no contratan CRM.

### Matriz de derechos de MiniWeb
| Función o recurso | Cuadra | Barrio | Ciudad |
| --- | --- | --- | --- |
| Editor Simple y Avanzado, personalización de contenido y diseño soportada por la plantilla | Sí | Sí | Sí |
| Módulos y secciones soportados por MiniWeb V2 (hero, servicios, productos, galería, horarios, contacto, FAQ, etc.) | Sí | Sí | Sí |
| Múltiples galerías, videos, horarios avanzados, historial y restauración **cuando cada función esté implementada y habilitada** | Sí | Sí | Sí |
| Plantillas Cuadra | Sí | Sí | Sí |
| Plantillas Barrio y variantes **Pro** de plantillas Cuadra | No | Sí | Sí |
| Plantillas Ciudad y variantes **Premium** de plantillas de niveles anteriores | No | No | Sí |
| Capacidad de publicaciones | Bloque base compartido de 3 por titular, ampliable solo con Cuadras adicionales según DEC-08 | Mismo bloque, no suma cupos | Mismo bloque, no suma cupos |
| CRM/automatizaciones GHL | No implícito | Solo si lo concede licencia por organización | Solo si lo concede licencia por organización |

**Definiciones:** `templateTier = cuadra | barrio | ciudad` (orden creciente); `templateVariantTier = base | pro | premium` para variantes cuando existan. El catálogo puede ofrecer varias familias y estilos en cada tier. El acceso se resuelve por el **tier mínimo exigido por la plantilla/variante**, no por tipos de módulos. Pro corresponde como mínimo a Barrio; Premium como mínimo a Ciudad. Las familias de negocio (servicios, catálogo, gastronomía, profesional) **no** determinan por sí solas un nivel ni limitan funcionalidades.

### Efectos sobre decisiones y diseños anteriores
- **DEC-12** se conserva como **asignación inicial de las cinco claves actuales**: Esencial y Servicios → Cuadra; Catálogo y Gastronomía → Barrio; Profesional → Ciudad. **No** implica que solo Barrio pueda utilizar productos, ni que solo Ciudad pueda mostrar credenciales: las secciones disponibles son comunes a todas las licencias una vez implementadas.
- El catálogo futuro puede añadir **plantillas Cuadra para cualquier giro** (incluyendo catálogo, gastronomía y profesionales) y variantes Pro/Premium de una misma plantilla base. No confundir tipo de negocio con nivel visual.
- **DEC-10** sigue vigente: el mayor nivel visual activo del titular se comparte entre organizaciones autorizadas; CRM, servicios y otros derechos siguen por organización.
- **DEC-07/09/13/15/16/17** siguen vigentes: downgrade conserva snapshot publicado; vencimiento congela edición; exceso de cupos no despublica; media histórica protegida; videos detrás de gate técnico; editor en /app solo tableta/escritorio y MiniWeb público responsive.
- **No bloquear módulos en el servidor por tier visual.** La autorización de módulos depende de permisos, validación del esquema, seguridad y disponibilidad real de la función; los tiers solo se aplican al `templateKey`/`layoutVariant` o identificador estable de variante.
- **No confundir funcionalidad completa con recursos ilimitados:** límites técnicos objetivos de medios, almacenamiento y abuso deben ser consistentes y justificables; no inventar topes comerciales por tier ni activar videos sin controles aprobados.

### Contrato de validación y pruebas focales
1. Cuadra puede crear/publicar una MiniWeb con todas las secciones V2 disponibles, incluyendo productos, servicios, FAQ y galerías, usando una plantilla Cuadra.
2. Cuadra no puede publicar una plantilla Barrio/Ciudad ni variante Pro/Premium sin derecho visual vigente.
3. Barrio puede usar todas las secciones y plantillas Cuadra/Barrio, incluidas variantes Pro, pero no Ciudad/Premium.
4. Ciudad puede usar todo el catálogo, sin adquirir módulos adicionales para el constructor.
5. Upgrade/downgrade y multi-organización respetan DEC-07/10; no reescribir snapshots públicos ni conceder CRM a otras organizaciones.
6. El catálogo explica visualmente la diferencia de **calidad/estilo de plantillas**, nunca una supuesta falta de secciones en Cuadra.
7. La disponibilidad `planned` sigue bloqueando uso real hasta implementación, independientemente de tier.

**Estado:** política comercial y funcional **aprobada y documentada**. Las plantillas Pro/Premium futuras son un diseño de catálogo, **no** plantillas existentes ni entregadas. No se modificó código, precios, tests ni producción.


## 39. F6 — Estrategia de catálogo visual por familias y niveles (PROPUESTA, 2026-10-29)

**Deriva de DEC-18 aprobada:** mismo constructor completo y módulos para Cuadra, Barrio y Ciudad; únicamente varía el acceso a plantillas/variantes visuales. **Este apartado propone criterios de calidad y organización; no modifica derechos ni se considera aprobado por silencio.**

### Ejes independientes
1. **Familia de negocio:** general, servicios, comercio/catálogo, gastronomía, profesional; categorías de descubrimiento, nunca permisos de sección.
2. **Nivel visual mínimo:** `cuadra`, `barrio`, `ciudad`; orden creciente, resuelto con DEC-10 por titular.
3. **Variante de diseño:** `base`, `pro`, `premium` cuando exista y tenga renderer real. No generar variantes nominales que solo cambien color.
4. **Estilo editorial:** minimalista, cálido, audaz, clásico, etc., como etiquetas de búsqueda, no nueva jerarquía comercial.

### Diferenciación tangible sin bloquear funciones
| Nivel | Valor visual propuesto | No restringir |
| --- | --- | --- |
| Cuadra | Diseño profesional, identidad personalizable, rejillas y secciones bien compuestas, responsive completo | Productos, galerías, videos habilitados, FAQ, horarios, historial, SEO básico, controles del editor |
| Barrio | Composiciones editoriales más variadas, jerarquías sofisticadas, tratamientos visuales de medios, variantes Pro por familia | Ningún módulo funcional |
| Ciudad | Dirección artística distintiva, composiciones premium, sistemas visuales de marca más ricos y motion accesible si se soporta | Ningún módulo funcional |

**Principio de calidad:** Cuadra nunca debe parecer una demo. Barrio/Ciudad no deben ser solo cambios de color, fuentes o un par de adornos. No prometer animaciones, efectos o layouts que el renderer aún no implemente. Cada variante premium requiere diferencia perceptible, accesibilidad, rendimiento y compatibilidad con contenidos reales.

### Catálogo y flujo de selección
- Mostrar primero **familia de negocio** y después todas las plantillas compatibles, etiquetadas por `Cuadra`, `Barrio`, `Ciudad`; permitir filtrar por estilo y nivel.
- Ofrecer preview móvil/tableta/escritorio a todos los usuarios desde el editor de tableta/escritorio; preview no concede derecho de publicación.
- Plantillas superiores pueden visualizarse con etiqueta de nivel y CTA informativo de mejora; nunca ocultar que Cuadra puede construir el mismo contenido.
- Al cambiar de plantilla, preservar módulos/datos; informar incompatibilidades visuales y no borrar contenido. Los diseños premium no pueden depender de secciones exclusivas.
- Proponer al menos una plantilla Cuadra por familia antes de afirmar que cada sector está cubierto; las cinco claves actuales son punto de partida, no catálogo completo.
- Alinear marketing: `Cuadra = MiniWeb completo`, `Barrio = más variedad de diseño profesional`, `Ciudad = diseño premium`; otras ventajas de licencias (CRM por organización) se comunican por separado.

### Reglas de producto y medición
- No confundir **calidad visual** con **precio de alojamiento, velocidad, SEO o accesibilidad**: los tres niveles deben cumplir mínimos técnicos equivalentes.
- Medir elección de plantilla, finalización de publicación, cambios de plantilla, upgrade motivado por diseño y satisfacción; evitar métricas inventadas.
- No multiplicar variantes antes de tener ejemplos reales y pruebas con negocios distintos; priorizar calidad y reutilización de componentes.
- Criterio de aceptación: mismo contenido y conjunto de módulos puede representarse en Cuadra/Barrio/Ciudad, con distinto layout, sin pérdida de datos y sin habilitar derechos CRM.

**Estado:** estrategia de catálogo propuesta; sin mockups finales, tests, implementación ni despliegue.


## 40. F6 — Prueba de diferenciación visual: una familia, tres niveles (diseño de referencia, 2026-10-29)

**Objetivo:** comprobar que Cuadra ($39), Barrio ($59) y Ciudad ($89) se distinguen por diseño sin restringir contenido ni módulos (DEC-18). **Propuesta de prototipo:** familia `servicios locales`, elegida solo para comparar tres presentaciones del **mismo negocio y los mismos datos**; no se aprueba automáticamente una nueva plantilla ni un nombre comercial.

### Dataset único de comparación (ficticio; no publicar como negocio real)
- Nombre de ejemplo: `Estudio Norte`, categoría `Servicios locales`.
- Mismos campos en los tres diseños: logo, portada, descripción, 4 servicios, 6 fotos, horarios, ubicación, contacto, 4 preguntas frecuentes y CTA de contacto.
- Mismos derechos: editar, ordenar, añadir secciones y galerías, personalizar identidad, previsualizar y publicar si la licencia/estado lo permiten.
- Medir diferencias de presentación sin agregar ni retirar contenido entre versiones.

| Dimensión | Cuadra · Base | Barrio · Pro | Ciudad · Premium |
| --- | --- | --- | --- |
| Hero | Imagen + texto y CTA claros; composición estable | Hero asimétrico con capas y tipografía editorial | Hero de dirección artística más distintiva, composición inmersiva sin ocultar CTA |
| Servicios | Tarjetas uniformes y legibles | Rejilla modular con jerarquía visual | Composición editorial variable, manteniendo orden y accesibilidad |
| Galería | Cuadrícula responsiva | Composición mixta con énfasis visual | Secuencia narrativa con formatos destacados y navegación accesible |
| Identidad | Tokens de marca y fuentes seguras | Combinaciones tipográficas/espaciado más expresivas | Sistema visual cohesivo y refinado, no efectos decorativos gratuitos |
| Horarios, FAQ, contacto | Completos y visibles | Igualmente completos, distinta presentación | Igualmente completos, distinta presentación |
| Responsive | Móvil, tableta y escritorio | Móvil, tableta y escritorio | Móvil, tableta y escritorio |
| Accesibilidad, SEO, rendimiento | Requisitos comunes | Requisitos comunes | Requisitos comunes |

### Reglas del experimento visual
1. Comparar las tres versiones lado a lado con contenido idéntico; no introducir ventajas funcionales disfrazadas de estilo.
2. Evaluar lectura en móvil (MiniWeb público), tableta y escritorio; editor solo tableta/escritorio según DEC-17.
3. Comprobar que cada composición es realizable mediante tokens/variantes tipadas del renderer V2, sin HTML/CSS/JS arbitrarios.
4. No asumir que `services-studio` ya implementa las tres versiones; las variantes Pro/Premium requieren diseño, renderer y tests propios.
5. Someter las tres propuestas a revisión visual antes de producir el catálogo; las referencias externas o imágenes de inspiración no son diseños entregados.
6. No mezclar la diferenciación de plantillas con derechos CRM, límites de cupos o cobros nuevos.

### Criterios de aceptación visual propuestos
- Cuadra se percibe como sitio terminado, profesional y apto para vender servicios, no como prueba gratuita.
- Barrio ofrece diferencia de composición evidente sin depender de módulos exclusivos.
- Ciudad ofrece identidad visual superior reconocible incluso con el mismo contenido.
- Ninguna versión pierde información, rompe navegación móvil o empeora contraste/teclado.
- Cambiar de Cuadra a Barrio/Ciudad mantiene datos y referencias de medios; cambiar a un tier inferior conserva snapshot público histórico según DEC-07 hasta nueva publicación válida.

### Entregables siguientes
- Wireframes comparativos de la misma página en tres niveles.
- Inventario de tokens/componentes reales y su correspondencia con cada composición.
- Especificación `templateFamily + templateKey + variantKey + minimumTemplateTier`, diferenciada del esquema V1 y de los módulos.
- Matriz de casos de prueba focales para preview, cambios de variante, permisos y compatibilidad de snapshots.

**Estado:** prueba de diferenciación documentada como propuesta. No se han generado mockups finales, ni implementado variantes, ni ejecutado tests/deploy.


## 41. F6 — Contrato del motor de plantillas y variantes tras DEC-18 (CODE + DISEÑO, 2026-10-29)

**Inspección CODE de la rama documental:** `app/features/miniweb/registry.ts` y `app/components/miniweb/templates/default.tsx`. El registro actual define cinco claves (solo `vecidya-default` disponible), `layoutVariants: ["standard"]`, un único `MiniWebConfiguration.version=1`, `settings:null`, máximo 4096 bytes y módulos únicos por tipo. El renderer `DefaultMiniWebTemplate` usa un mapa de renderers por tipo, `id=miniweb-section-${type}` y `key=type`. Estos hechos impiden galerías repetibles y variantes visuales genuinas sin migración; **no se han modificado esos archivos**.

### Separación obligatoria del contrato V2
- `family`: categoría de búsqueda del negocio (`services`, `catalog`, `gastronomy`, `professional`, y otras solo tras catálogo aprobado), **no** permiso comercial.
- `templateKey` y `templateVersion`: identifican una composición visual y su renderer compatible, nunca el conjunto de módulos autorizados.
- `variantKey`: identifica composición concreta dentro de la plantilla; el registro define `minimumTemplateTier: cuadra | barrio | ciudad` por plantilla o variante, sin usar `module.type` como restricción de tier.
- `module.instanceId`: identidad estable de instancia; `type`, `enabled`, `sortOrder`, `layoutVariant`, `settings` validados por esquema y disponibilidad técnica. Hero único y primero; módulos repetibles según definición de módulo, no por licencia.
- `supportedModules` puede describir **compatibilidad técnica del renderer**, pero una plantilla premium no puede reservar una funcionalidad exclusiva: cada función habilitada del constructor debe tener una presentación utilizable en Cuadra.
- **Derechos visuales:** resolver `effectiveMiniWebTemplateTier(billingAccountId)` según DEC-10; comparar nivel mínimo de plantilla/variante al **guardar cambios de diseño** y al **publicar**. Conservar snapshot histórico si el nivel baja (DEC-07).
- **Disponibilidad:** `planned` no es publicable aunque el titular tenga Ciudad; el editor solo presenta como disponibles variantes con renderer y tests reales.

### Riesgos de implementación detectados
1. El renderer actual fija IDs y keys por **tipo**; para galerías repetibles migrar a `instanceId`, garantizando anclas HTML únicas y accesibles.
2. El validador actual rechaza tipos repetidos y propiedades nuevas; introducir **lector dual V1/V2** y validador V2 separado antes de escribir V2.
3. `settings:null` y `standard` no soportan composiciones Pro/Premium: definir settings tipados por módulo y tokens de layout, sin HTML/CSS/JS arbitrario.
4. No permitir que `supportedModules` del registro o una UI premium conviertan inadvertidamente productos, FAQ, horarios o galerías en funciones exclusivas de Barrio/Ciudad.
5. La plantilla Esencial actual debe continuar sirviendo snapshots legacy sin modificación destructiva; migración de borradores explícita, no automática en lectura.

### Contrato de prueba comparativa
- Mismo negocio ficticio y **mismos datos** en Cuadra/Barrio/Ciudad (§40).
- Las tres composiciones incluyen los mismos módulos habilitados, con IDs estables y presentación accesible.
- El cambio de plantilla no borra datos; se valida el tier mínimo por titular, no por organización individual ni por módulo.
- Pruebas focales de V1 legacy, validador V2, repetición de galería, anclas únicas, downgrade, snapshots, preview y render móvil público.
- Antes de codificar: inspeccionar pruebas actuales, schema de publicación y rutas de edición en `main` actualizado, evitar conflictos con otros agentes.

**Estado:** contrato de arquitectura propuesto con base en código inspeccionado; sin prototipos gráficos, cambios de aplicación, tests, merge ni deploy.


## 42. F6 — Especificación de composición Base / Pro / Premium (PROPUESTA, 2026-10-29)

**Alcance:** un mismo negocio de servicios locales y exactamente el mismo contenido en tres niveles visuales (§40). Este documento es especificación de layout para revisión, no mockup aprobado ni código.

### Invariantes compartidos
- Secciones disponibles: hero, acerca, servicios, productos, galería, horarios, ubicación, FAQ y contacto, más otras cuando estén técnicamente disponibles. Cada sección se puede habilitar, ocultar o reordenar con las mismas reglas en los tres tiers; no hay funciones reservadas por plan.
- Contenido semántico y fuentes de datos idénticos. Plantilla y variante solo modifican presentación, jerarquía, tipografía, espaciado, disposición y transiciones permitidas.
- CTA de contacto identificable, encabezados jerárquicos, enlaces accesibles, foco visible, contraste adecuado, carga diferida de medios y respeto de `prefers-reduced-motion`.
- MiniWeb pública responsiva en móvil/tableta/escritorio; edición únicamente en tableta/escritorio (DEC-17).

### Cuadra / Base — `services-studio:base` (conceptual)
- **Hero:** bloque dividido de dos columnas en escritorio (texto 55% / foto 45%); una columna en móvil, texto y CTA antes de la imagen si el contenido lo permite.
- **Servicios:** tarjetas uniformes, rejilla de hasta tres columnas en escritorio, dos en tableta si cabe, una en móvil.
- **Galería:** cuadrícula homogénea de miniaturas con proporción consistente; detalle accesible cuando exista soporte real.
- **FAQ/contacto:** acordeón o lista semántica sin depender de JavaScript para mostrar contenido esencial; contacto visible al final.
- **Identidad:** colores de marca controlados, tipografía clara, márgenes y radios consistentes. Debe sentirse profesional y terminado, nunca demo.

### Barrio / Pro — `services-studio:pro` (conceptual)
- **Hero:** composición asimétrica con imagen dominante y panel de contenido; el orden de lectura DOM sigue siendo lógico.
- **Servicios:** rejilla editorial de tarjetas con tamaños alternados, sin dar mayor importancia a servicios por su posición arbitraria.
- **Galería:** mosaico con una imagen destacada y miniaturas secundarias; preserva todos los activos y textos alternativos.
- **FAQ/contacto:** composición a dos zonas en escritorio, con contacto destacado sin ocultar FAQ.
- **Identidad:** escalas tipográficas y espaciado más expresivos, sin introducir contenido ni secciones exclusivas.

### Ciudad / Premium — `services-studio:premium` (conceptual)
- **Hero:** composición editorial inmersiva con fotografía protagonista, texto de alto contraste y CTA permanente; evitar texto ilegible sobre medios.
- **Servicios:** narrativa visual con bloques alternados y tratamientos tipográficos distintivos; no transformar datos en imágenes de texto.
- **Galería:** secuencia editorial con ritmos y tamaños diferenciados, navegación y orden accesibles.
- **FAQ/contacto:** cierre de página con CTA fuerte y datos completos; FAQ sigue visible y utilizable.
- **Identidad:** sistema de marca coherente de mayor sofisticación; microtransiciones opcionales y reducidas cuando el usuario lo prefiera, sin penalizar rendimiento.

### Wireframes textuales del mismo contenido (orden ilustrativo)
```text
CUADRA · BASE (desktop)           BARRIO · PRO (desktop)           CIUDAD · PREMIUM (desktop)
┌──────────────────────────┐      ┌──────────────────────────┐      ┌──────────────────────────┐
│ Logo          Contacto   │      │ Logo  Servicios Contacto│      │ Logo   Navegación    CTA│
├──────────────┬───────────┤      ├──────────┬───────────────┤      ├──────────────────────────┤
│ Título       │ Foto      │      │ Foto     │ Título        │      │   Imagen editorial      │
│ Texto + CTA  │           │      │ grande   │ Texto + CTA   │      │   Título / CTA legible  │
├──────────────┴───────────┤      ├──────────┴───────────────┤      ├──────────────────────────┤
│ Servicio 1 │ 2 │ 3 │ 4   │      │ Servicio 1 grande │ 2,3,4│      │ Servicios en bloques    │
├──────────────────────────┤      ├──────────────────────────┤      │ alternados / narrativos │
│ Galería uniforme         │      │ Galería mosaico          │      ├──────────────────────────┤
├──────────────────────────┤      ├──────────────────────────┤      │ Galería editorial       │
│ Horario / Ubicación      │      │ Horario / Ubicación      │      │ Horario / Ubicación     │
│ FAQ / Contacto           │      │ FAQ / Contacto destacado│      │ FAQ / Contacto / CTA    │
└──────────────────────────┘      └──────────────────────────┘      └──────────────────────────┘
```
**Nota:** los wireframes son esquemáticos y no especifican medidas finales; el orden de servicios y módulos lo determina el usuario, no el nivel de licencia. No se fija un orden distinto en el DOM por tier.

### Tokens de composición propuestos (sujetos a auditoría del CSS existente)
- `density`: `comfortable | editorial | immersive`.
- `heroComposition`: `split | asymmetric | immersive`.
- `serviceLayout`: `uniform-grid | editorial-grid | narrative`.
- `galleryLayout`: `uniform-grid | mosaic | editorial-sequence`.
- `typographyPreset`: claves cerradas auditadas, no fuentes arbitrarias ni CSS del usuario.
- `motionPreset`: `none | subtle` (optativo, accesible); no requiere animaciones para distinguir niveles.

Estos son **valores de diseño**, no un esquema de base de datos aprobado. El motor debe mapear `templateKey + variantKey` a presets tipados y versionados; no persistir estilos arbitrarios.

### Revisión pendiente antes de implementación
1. Inventariar estilos y tokens actuales para elegir nombres compatibles.
2. Diseñar versión tablet y móvil de cada composición, con la misma información y orden lógico.
3. Validar visualmente las diferencias con un negocio de gastronomía y otro de catálogo para evitar sesgo de servicios.
4. Revisar accesibilidad, peso de medios, datos ausentes y textos largos en cada variante.
5. Aprobar diseños y luego implementar un renderer compartido con variantes, sin duplicar funcionalidades.

**Estado:** tres composiciones especificadas como propuesta; sin mockups gráficos, cambios de código, tests o despliegues.


## 43. F6/F7 — Auditoría focal de componentes existentes y ruta de prototipado (2026-10-29)

**Evidencia:** lectura directa en la rama `docs/app-mini-master-plan-v1` de `app/features/miniweb/registry.ts`, `app/components/miniweb/templates/default.tsx`, `app/components/miniweb/modules/hero.tsx`, `app/components/miniweb/modules/offerings.tsx` y `app/routes/miniweb-editor.tsx`. No se localizaron estilos en la ruta supuesta `app/styles/app.css`; **no se ha inventariado todavía el CSS real**, por lo que los tokens de §42 siguen propuestos.

### Hallazgos verificables
- `HeroModule` delega en `PublicBusinessHeader`, con logo y cover; las tres variantes pueden reutilizar el origen de datos, pero requieren variantes de composición del header, no tres modelos de negocio.
- `OfferingsModule` filtra `isActive` y `kind`, presenta título/descripción, imagen y precio textual opcional; actualmente usa `miniweb-content-list` y `miniweb-content-list__items`. Las rejillas Base/Pro/Premium deben modificar solo presentación, no filtrado de servicios/productos.
- `DefaultMiniWebTemplate` selecciona renderers por tipo y utiliza clases `miniweb-template__module--${type}`; es punto de extensión para presets tipados, con cuidado de no romper la plantilla Esencial.
- `miniweb-editor.tsx` ya separa las fuentes de edición: identidad/horarios/ubicación en Mi negocio, servicios/productos/FAQ/medios en MiniWeb; artículos/equipo/certificaciones/testimonios se identifican como futuros. El nuevo diseño no debe presentarlos como implementados.
- La ruta de editor lee datos consistentes y exige permiso `business-profile:read` antes de exponer datos; el nuevo catálogo debe preservar validación y autorización en servidor, no solo ocultar botones.

### Secuencia de implementación recomendada (sin ejecutar)
**PR-D1 — auditoría de estilos y prototipo aislado:** localizar CSS/tokens reales; crear prototipo de la misma página Base/Pro/Premium con datos ficticios sin conectarlo a publicación. Revisar en móvil público, tableta y escritorio, contraste, texto largo y ausencia de medios. Sin cambios de DB/licencias.

**PR-M2 — contrato de variantes y permisos:** registro tipado de `templateKey`/`variantKey`/`minimumTemplateTier`; resolución del nivel efectivo por titular (DEC-10), comprobación server-side al guardar/publicar, `planned` inaccesible. Pruebas focales de tiers y multi-organización.

**PR-M3 — compatibilidad y renderer:** lector dual V1/V2, IDs estables de módulos repetibles, renderer compartido de composición, sin alterar snapshots existentes. Pruebas focales de V1, anclas únicas, render y datos preservados.

**PR-M4 — catálogo visual:** selección por familia + nivel + estilo, previews y cambio de plantilla reversible; etiquetas claras de mejora, sin bloqueo de secciones Cuadra. Pruebas focales de preview, cambio y downgrade.

**Dependencias:** validar la secuencia frente a PR-M1 y otros agentes antes de crear ramas; no reutilizar nombres PR-M2/M3 si ya están ocupados. No ejecutar suites globales ni cambios de CI.

### Puerta de aceptación del prototipo
- Cuadra Base luce terminada y comercializable con el mismo contenido que Pro/Premium.
- Pro y Premium difieren por composición visible, no por contenido, módulos o rendimiento inferior en Cuadra.
- Los tres niveles respetan diseño responsive público y no requieren edición móvil de `/app`.
- Se verifica visualmente el sistema real de estilos antes de fijar tokens.
- Aprobación de prototipo antes de incorporar diseños nuevos al registro de plantillas disponibles.

**Estado:** auditoría focal y ruta de implementación documentadas; sin modificación de aplicación, mockups gráficos, pruebas, merge ni deploy.


## 44. F6 — Inventario CSS verificado y especificación responsive para prototipo (2026-10-29)

**Hallazgo corregido de §43:** el CSS principal **sí existe** en `vecidya-platform/app/app.css` (no `app/styles/app.css`). La carpeta `app/styles/` contiene `cookie-consent.css`, `diagnostic-admin.css` y `vecidya-polish.css`. Se inspeccionó directamente `app/app.css` en la rama documental, sin modificarlo.

### Tokens reales ya disponibles en `app.css`
- **Marca/semánticos:** `--ink:#142b4a`, `--muted:#617188`, `--line:#e1e8f1`, `--surface:#ffffff`, `--canvas:#f7f9fc`, `--blue:#155fc5`, `--blue-dark:#104c9d`, `--orange:#bf4700`, `--success:#13795b`.
- **Espaciado:** `--space-1:0.5rem`, `--space-2:0.75rem`, `--space-3:1rem`, `--space-4:1.5rem`, `--space-5:2rem`.
- **Radios:** `--radius-sm:0.75rem`, `--radius-md:1.25rem`, `--radius-lg:1.75rem`; `--shadow` compartido.
- **Tipografía:** `--font-sans:Arial, Helvetica, sans-serif`, `--text-meta:0.875rem`, `--text-label:0.8125rem`, `--content-reading:68ch`.
- **Accesibilidad ya implementada:** reglas `:focus-visible` para controles y enlaces; `.skip-link` visible al foco. El diseño nuevo debe conservarlas.
- **Clases reales reutilizables:** `.miniweb-template__sections`, `.miniweb-template__module--hero`, `.miniweb-content-list__items`, `.miniweb-gallery__grid`, `.miniweb-editor__workspace`, `.miniweb-editor__tabs`, `.miniweb-editor__preview`, `.app-shell`, `.organization-switcher`. La existencia de clase no demuestra por sí sola compatibilidad con V2.

### Estrategia de estilo
1. Reutilizar tokens y componentes globales; **no duplicar** un design system ni redefinir `:root` para cada plantilla.
2. Añadir un ámbito visual por plantilla/variante (p. ej. `data-miniweb-template` + `data-miniweb-variant`), y custom properties locales de composición; nunca modificar `.app-shell` para obtener estilos públicos.
3. Definir presets cerrados y auditables: `split/uniform-grid` para Cuadra, `asymmetric/editorial-grid` para Barrio, `immersive/narrative` para Ciudad. No permitir CSS arbitrario persistido por usuario.
4. Preservar el comportamiento actual de `vecidya-default:standard` y snapshots V1. La composición nueva debe ser opt-in y estar detrás de registro `available` únicamente tras renderer y pruebas.
5. CSS responsive de MiniWeb público independiente de DEC-17 (bloqueo de app/internal). No asumir que una media query de anchura por sí sola identifica teléfonos de forma segura.

### Matriz de layout del prototipo (valores orientativos, no breakpoints técnicos aprobados)
| Vista pública | Base Cuadra | Pro Barrio | Premium Ciudad |
| --- | --- | --- | --- |
| Móvil | Hero apilado, servicios 1 col., galería legible | Hero apilado con jerarquía editorial, mosaico simplificado | Hero editorial accesible sin superposición ilegible, narrativa apilada |
| Tableta | Hero 2 col. solo si cabe, servicios 2 col. | Asimetría moderada, rejilla 2 col. | Composición editorial equilibrada, CTA visible |
| Escritorio | Hero dividido, tarjetas uniformes hasta 3 col. | Hero asimétrico, rejilla editorial | Hero inmersivo, narrativa visual y galería editorial |

### Casos de revisión antes de CSS definitivo
- Fotos faltantes, logos muy anchos, títulos largos, servicios sin imágenes, galería de 1 elemento, horarios extensos y FAQ extensa.
- Orden DOM lógico y navegación teclado; contraste sobre fotografía; `prefers-reduced-motion`; imágenes adaptativas.
- Comparar los tres niveles con datos idénticos; la diferencia debe ser estética y compositiva, nunca de acceso a secciones.
- Medir visualmente tableta vertical y escritorio estrecho; la política de acceso `/app` no se deriva de estas reglas de diseño público.

**Estado:** inventario inicial del CSS real confirmado y contrato responsive propuesto; pendientes inspección focal de reglas MiniWeb específicas, prototipos gráficos, pruebas y aprobación visual. Sin cambios de código, merge ni despliegue.


## 45. F6 — Prototipo HTML comparativo entregado (2026-10-29)

**Artefacto creado:** `plans/app-mini/prototypes/miniweb-tiers-comparison.html` en la rama documental `docs/app-mini-master-plan-v1` (commit `30e12e07cb07c5c3bdd9b76ff7aa98224d9673fe`).

- Documento HTML autocontenido con CSS y JS mínimo para alternar entre Cuadra Base, Barrio Pro y Ciudad Premium mediante botones accesibles `aria-pressed`.
- El contenido ficticio `Estudio Norte` es idéntico en los tres estados: portada, cuatro servicios, seis marcadores visuales de galería, horario, ubicación, FAQ y contacto.
- Base: hero dividido y rejilla uniforme; Pro: hero asimétrico y galería mosaico; Premium: hero editorial, tipografía y composición narrativa. Los tres mantienen los mismos datos y módulos.
- Responsive público mediante reglas de diseño móvil/tableta/escritorio; soporte de foco visible, salto al contenido y preferencia de movimiento reducido.
- Marcadores gráficos CSS sin fotografías externas; **no confundir con renders de producción, assets finales ni UI conectada al CMS**.
- No se ha validado visualmente en navegador ni ejecutado test automatizado; se requiere revisión humana en tamaños y dispositivos reales antes de aprobar composición.
- No incluye motor de plantillas V2, entitlements, APIs, persistencia, publicación, CMS ni CRM; no cambia código de `vecidya-platform`.

**Próxima puerta:** revisar el HTML visualmente y comparar si Barrio/Ciudad ofrecen valor perceptible frente a Cuadra. Si se aprueba la dirección, convertir el prototipo en componentes tipados reutilizables y pruebas focales, manteniendo snapshots legacy.


## 46. F6 — Puerta de revisión visual y accesibilidad del prototipo (2026-10-29)

**Artefacto bajo revisión:** `plans/app-mini/prototypes/miniweb-tiers-comparison.html`. Se completaron cuatro respuestas FAQ del dataset de ejemplo en commit `88ae3598924e4d44caf93742d860c0653562527a`; siguen siendo contenido ficticio, no datos de clientes.

### Checklist focal para revisión manual en navegador
| Caso | Qué verificar | Criterio de aceptación |
| --- | --- | --- |
| Alternar Base/Pro/Premium | Botones del selector y `aria-pressed` | Cambia solo la presentación, no el texto ni la cantidad de secciones |
| Cuadra en móvil | Hero, tarjetas, galería, CTA, contacto | Sin scroll horizontal ni información oculta; aspecto comercial completo |
| Barrio en móvil | Hero asimétrico que se apila, mosaico simplificado | Orden de lectura coherente y tarjetas legibles |
| Ciudad en móvil | Hero editorial y contraste sobre fondos | CTA legible, texto no superpuesto, jerarquía preservada |
| Tableta vertical | Rejillas y composición de hero | Sin columnas demasiado estrechas; MiniWeb pública usable |
| Escritorio | Diferencia de composición entre niveles | Pro y Premium perceptiblemente distintos, no solo color |
| Teclado | Tab/Enter/Espacio, foco y salto al contenido | Todas las acciones alcanzables sin ratón |
| Texto largo y sin imágenes | Simular datos ausentes y descripciones extensas | Sin desbordamiento ni secciones vacías engañosas |
| Movimiento reducido | Preferencia del sistema | Sin movimiento obligatorio |
| Contenido idéntico | Comparar cuatro servicios, seis imágenes ficticias, cuatro FAQ, horarios, ubicación y contacto | Ningún tier añade o elimina capacidades |
| Enlace de contacto | Destino `#contacto` | Navegación interna funciona; no simula envío real |
| Semántica de galería | Seis marcadores visuales de prueba | Antes de producción reemplazar por imágenes reales con `alt` apropiado |

### Diferencias entre prototipo y producto
- Los marcadores visuales CSS no prueban optimización de imágenes, formatos, ratios reales ni focal point.
- La sección FAQ del prototipo es texto estático, **no** un componente conectado al CMS.
- Los botones de nivel son solo selector de preview, **no** validan licencias.
- El prototipo no incluye aún todos los módulos V2: la prueba de paridad completa de secciones corresponde al renderer posterior.
- Los breakpoints del HTML son de demostración; la política DEC-17 de bloquear `/app`/`/internal` móvil es una implementación separada.
- La revisión manual y pruebas de navegador **siguen pendientes**; no afirmar WCAG, rendimiento ni aceptación visual hasta medirlos.

### Decisión de continuación
No activar plantillas Pro/Premium en producción antes de: (1) aprobación visual de las tres composiciones; (2) contrato tipado de variantes y derechos; (3) compatibilidad de snapshots V1/V2; (4) pruebas focales y revisión de accesibilidad. Continuar con catálogo y componentes sin tocar pagos/CRM ni PRs ajenos.

**Estado:** checklist y límites del prototipo documentados; revisión manual pendiente.


## 47. F6 — Revisión estática del prototipo y bloqueo de validación real (2026-10-29)

**Alcance comprobado:** el PR #184 sigue abierto contra `main` y su rama contiene el prototipo HTML; se recuperó su fuente por GitHub. Se detectó Chromium y la biblioteca Playwright en el entorno de revisión, pero la descarga directa del HTML a ese entorno falló por conectividad; **no se ejecutó ninguna prueba de navegador contra el artefacto real**. No confundir disponibilidad del navegador con prueba realizada.

### Hallazgos de revisión de fuente
1. El selector Base/Pro/Premium actualiza `data-tier` y `aria-pressed` sin sustituir el contenido DOM; la paridad entre niveles está resuelta **en el diseño del prototipo**, no en el motor V2.
2. El prototipo usa CSS autocontenido, marcadores de fotografía, enlaces internos y datos ficticios. No hay peticiones a API ni escrituras en la base de datos.
3. Los cuatro servicios y seis marcadores visuales son compartidos; las cuatro preguntas FAQ se incorporaron al mismo HTML. La galería está representada por `div role=img`, no por archivos de medios reales.
4. La sección de contacto es demostrativa, sin envío de formulario ni integración CRM. El prototipo no demuestra disponibilidad ni licenciamiento.
5. Se identificaron riesgos para la revisión posterior: altura del hero premium en móvil, texto largo en tarjetas asimétricas, lectura del color de acento premium, orden semántico de FAQ, ausencia de medios y navegación de teclado en todos los tamaños.

### Validación focal pendiente (no ejecutada)
- Abrir el archivo **real** en Chromium/Playwright en un entorno con acceso al contenido, capturar 390×844, 768×1024 y 1440×900 para cada `data-tier` (9 capturas).
- Comprobar `scrollWidth <= innerWidth`, visibilidad del CTA, foco y estado `aria-pressed` tras cada cambio, cuatro servicios y cuatro preguntas en los tres tiers.
- Revisar capturas y consola, corregir solo problemas observados en `plans/app-mini/prototypes/miniweb-tiers-comparison.html`; evitar cambios en app/CI.
- Registrar evidencia concreta de PASS/FAIL y no aprobar el prototipo únicamente por revisión estática.

**Estado:** revisión de fuente efectuada; prueba visual automatizada **bloqueada por transferencia del artefacto al navegador**, sin falsos PASS. PR #184 continúa abierto y sin merge/deploy.


## 47. F6 — Paridad de contenido y semántica del prototipo (2026-10-29)

**Corrección aplicada al prototipo HTML aislado:** commit `4a991202ce5d5f857f7e8eb5a6497d5d85471287` en `plans/app-mini/prototypes/miniweb-tiers-comparison.html`.

Se comprobó por lectura del código que la comparación anterior omitía una sección «Acerca de» y combinaba FAQ con contacto. El prototipo ahora incluye secciones independientes de **hero, acerca del negocio, cuatro servicios, galería de seis marcadores, cuatro preguntas frecuentes, horarios/ubicación y contacto**. Los tres niveles comparten un solo DOM; el selector cambia `data-tier`, por lo que el contenido no se duplica ni se omite según nivel.

**Revisión focal aún requerida:** abrir el HTML en navegador y validar responsive, foco, lectura con teclado, contraste, enlaces internos y comportamiento con textos extensos. La inspección del código no equivale a prueba visual ni a auditoría WCAG. Los medios son marcadores de posición; no se ha validado un negocio real ni el motor V2.

**Siguiente paso de implementación:** una vez aprobada la composición, convertir la maqueta en componentes React/CSS aislados con datos tipados; mantener el registro `available` y los permisos sin cambios hasta pasar pruebas focales y revisión visual.


## 48. F6 — Endurecimiento focal del prototipo y diagnóstico del navegador (2026-10-29)

**Cambio real:** `plans/app-mini/prototypes/miniweb-tiers-comparison.html`, commit `1543b494151aa50b3d1ca5a2e0f84fe7f2251f09`.

- Se aplicó `minmax(0,...)` a columnas de hero Base/Pro para tolerar contenido largo sin forzar anchura.
- Se aplicó `overflow-wrap:anywhere` a copy del hero, tarjetas de servicios, preguntas y marca para contener cadenas sin espacios.
- El destino del enlace de salto `#preview` ahora admite foco programático mediante `tabindex="-1"`.
- Se elevó el contraste del eyebrow Premium sobre fondo oscuro.
- Estos son ajustes estáticos preventivos; **no** equivalen a validación visual ni a certificación WCAG.

**Diagnóstico reproducido del entorno de prueba:** Playwright Python instalado, pero su navegador Chromium gestionado no está descargado. El Chromium del sistema `/usr/bin/chromium` **sí inicia** con `executable_path` y `--no-sandbox`. La descarga HTTPS directa de `raw.githubusercontent.com` desde el contenedor sigue fallando por conectividad, mientras la lectura del archivo desde el conector GitHub sí funciona. El bloqueo actual es **trasladar el contenido exacto del artefacto al contenedor**, no ejecutar Chromium.

**Ruta siguiente:** usar un canal autorizado para disponer de la versión exacta del HTML en el entorno local y ejecutar una matriz focal 3×3; comparar capturas, DOM y overflow, y registrar PASS/FAIL. No sustituir el artefacto real por una reconstrucción aproximada para declarar tests aprobados.

**Estado:** correcciones CSS/semánticas aplicadas en rama documental; navegador del sistema comprobado, pruebas del artefacto aún pendientes. No se modificaron `vecidya-platform`, CI, licencias ni despliegue.


## 49. F6 — Harness focal Playwright versionado para comparar los tres niveles (2026-10-29)

**Archivo nuevo:** `plans/app-mini/prototypes/test-miniweb-tiers.mjs`, commit `6bf576fea58f283d79b47ad561dbbb28cda3ad7d`. La prueba trabaja contra el archivo local `miniweb-tiers-comparison.html` del mismo directorio, sin red ni publicación.

**Cobertura:** matriz 3×3 para Base/Pro/Premium en 390×844, 768×1024 y 1440×900; selector y `aria-pressed`, ausencia de scroll horizontal, CTA visible, contenido textual invariante, cuatro servicios, cuatro FAQ, seis marcadores visuales y errores JS. Guarda nueve capturas `screenshots/{mobile,tablet,desktop}-{base,pro,premium}.png` y termina con código 1 ante fallos.

**Ejecución:** desde el directorio del prototipo, en un entorno que ya tenga `playwright` y Chromium accesible: `node test-miniweb-tiers.mjs`. Si el navegador gestionado por Playwright no está instalado, requiere configurar su instalación en el entorno de pruebas; no cambiar CI ni añadir dependencias al producto para este experimento. El directorio `screenshots/` es salida de prueba y **no** debe añadirse al commit salvo revisión expresa.

**Precisión del estado:** el harness está **creado, no ejecutado**. Sigue pendiente la transferencia del HTML exacto al navegador de prueba y una revisión visual de capturas; no se declara PASS, WCAG ni aceptación de diseño. El PR #184 sigue abierto y no se modificó `vecidya-platform`.


## 50. F6 — Corrección de layout Pro y harness ejecutable con Chromium del sistema (2026-10-29)

**Cambios versionados:**
- `plans/app-mini/prototypes/miniweb-tiers-comparison.html`, commit `9197c369533b1c5c04173337683a626ad6edff80`: en el breakpoint `max-width:800px` la variante Pro fuerza una única columna y orden de lectura texto→imagen, evitando depender de la posición explícita desktop.
- `plans/app-mini/prototypes/test-miniweb-tiers.mjs`, commit `282fc8d63b59f2cb61fa1806539295644e2fa14b`: `pathToFileURL` para abrir archivos locales en distintas plataformas y `CHROMIUM_PATH` opcional para usar Chromium del sistema sin instalar un navegador Playwright gestionado.

**Comprobación del entorno:** Chromium del sistema `/usr/bin/chromium` abrió una página HTML de prueba con Playwright Python. Esta comprobación demuestra que el navegador puede arrancar; **no demuestra que el prototipo haya pasado la matriz**.

**Bloqueo de la matriz real:** el HTML del PR es legible desde el conector GitHub, pero `curl` desde el contenedor no resuelve `raw.githubusercontent.com`; todavía no se dispone de una copia verificada del artefacto exacto en el contenedor para ejecutar los nueve escenarios. No inventar PASS ni capturas. El harness JavaScript también requiere que el módulo `playwright` esté instalado en el entorno Node que lo ejecute.

**Siguiente paso concreto:** facilitar la transferencia autorizada del archivo exacto a la carpeta local del test (o ejecutar el test desde un checkout de la rama en un equipo con acceso al repositorio). Ejecutar `CHROMIUM_PATH=/usr/bin/chromium node test-miniweb-tiers.mjs` donde corresponda, revisar nueve capturas y corregir únicamente fallos reproducibles. No tocar CI, producto, CRM ni despliegue.


## 51. F6/F7 — Contrato tipado V2 y secuencia de implementación (2026-10-29)

**Artefacto creado:** `plans/app-mini/CONTRATO-VARIANTES-V2.md` (commit `6a9f2f3e541a27fd5a18d73ece940b4ea92c610f`). Se revisaron nuevamente `app/features/miniweb/registry.ts` y `app/components/miniweb/templates/default.tsx` antes de redactarlo.

**Hallazgos verificados:** el V1 valida `layoutVariant:standard`, configura un solo módulo por tipo y usa `settings:null`; solo `vecidya-default` está disponible; el renderer asigna IDs DOM por tipo, incompatibles con galerías repetidas. El contrato propone `version:2`, `variantKey`, `instanceId` estable y composición visual tipada.

**Reglas innegociables:** licencia visual del propietario compartida entre organizaciones (DEC-10); Cuadra sin limitación de secciones (DEC-18); downgrade conserva publicación premium y bloquea republish incompatible (DEC-07); capacidad y CRM independientes; lector dual V1/V2 y snapshots no destructivos.

**Plan de PRs focales:** V2-A registro/tipos; V2-B lector dual; V2-C autorización servidor; V2-D renderer e instancias repetibles; V2-E editor; V2-F QA visual. El contrato **no es implementación** y la prueba Playwright del prototipo sigue sin ejecutarse por bloqueo de transferencia del archivo al entorno de navegador. No declarar aprobación visual, tests PASS ni código de producción listo.


## 52. F6/F7 — Reconciliación obligatoria con gobierno del repositorio (2026-10-29)

**Fuentes inspeccionadas en GitHub:** `AGENTS.md`, `vecidya-platform/docs/GOVERNANCE.md`, `STATUS.md`, `PROJECT_STATE.md`, `ROADMAP.md` y registro V1.

### Hallazgo y corrección de rumbo

El repositorio exige que **cada checkpoint de implementación** parta de `origin/main` actualizado, en rama/worktree independiente `feat/app-mini-<checkpoint>`, con validación focal, `typecheck`, `build`, `git diff --check`, reconciliación de documentos canónicos y PR propio. El PR #184 es documental y **no** debe utilizarse como base para cambios de aplicación ni para merge/deploy implícitos.

El código vigente y la documentación canónica reportan producción 0.9.0 con MiniWeb/editor ya existente; la propuesta V2 no reemplaza ni desautoriza ese estado. Las decisiones de producto DEC-17/18 son objetivos de cambio futuro y no prueba de que la app móvil ya esté bloqueada o las variantes Premium activas.

**Deuda documental identificada:** `AGENTS.md` y `GOVERNANCE.md` limitan a 20 los Markdown canónicos (16 en el corte documentado). Los documentos `plans/app-mini/PLAN-V1.md`, `SERVICIOS-PAGOS-PLAN-V1.md` y `CONTRATO-VARIANTES-V2.md` creados en la rama documental requieren conciliación con ese techo y con el índice canónico antes de integración. No añadir más Markdown sueltos ni presentar el PR #184 como listo para merge.

### Gate de V2-A

1. Resolver gobernanza documental de #184: consolidar material de planificación en el documento canónico que corresponda o solicitar excepción explícita; preservar decisiones aprobadas.
2. Revisar `origin/main` actual y rama/worktree limpios, confirmar que `ROADMAP.md` autoriza el checkpoint concreto V2-A y que no colisiona con otro agente.
3. Implementar únicamente registro/tipos puros de variantes en rama propia, sin habilitar plantillas, sin editar licencias/CRM ni modificar snapshots V1.
4. Ejecutar pruebas focales + typecheck + build + diff-check antes de commit/PR; registrar resultados en `TESTING.md`, estado en `STATUS.md` y trabajo futuro en `ROADMAP.md` según corresponda.
5. No fusionar ni desplegar sin autorización separada.

**Estado real:** contrato de variantes propuesto y prototipo documental disponibles; **V2-A no iniciado**. La matriz visual Playwright sigue sin evidencia de ejecución.

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


## 53. Consolidación ejecutiva del plan maestro — corte verificable (2026-10-29)

**Propósito:** convertir los apartados 0–52 y el plan de Servicios/Pagos en una ruta única de ejecución sin reabrir decisiones aprobadas. Este apartado no declara completados componentes no publicados ni sustituye los contratos detallados anteriores.

### 53.1 Baseline y trazabilidad de implementación

- **Producción:** MiniWeb V1 y Mi Vecidya existentes; MiniWeb V2 aún no integrado ni desplegado.
- **PR #184:** plan documental abierto en borrador; requiere conciliación con gobernanza y validación visual.
- **PR #188 V2-A:** registro y tipos de variantes, CI certificado, listo para revisión, no fusionado.
- **PR #189 V2-B:** lector dual V1/V2, CI certificado, listo para revisión, no fusionado.
- **PR #191 V2-C:** política pura de derechos visuales, CI certificado, listo para revisión, no fusionado.
- **PR #194 (rama técnica denominada V2-D):** lector de licencias D1 por cuenta de facturación, cinco tests focales escritos; CI del último SHA pendiente de certificación en este corte, PR borrador. **Conflicto de nombre:** el contrato del §51 llama V2-D al renderer. Renombrar el siguiente checkpoint de renderer como **V2-E** en la ejecución, sin reescribir retrospectivamente los PR existentes; desplazar los siguientes checkpoints a V2-F (editor) y V2-G (QA visual). Los IDs F0–F9 de fases de producto permanecen intactos.
- Ningún PR de esta lista ha sido fusionado. Un PASS de CI no prueba integración entre PR ni despliegue.

### 53.2 Decisiones congeladas y alcance

**APROBADO:** DEC-06–18 y DEC-BILL-01 en sus apartados respectivos, especialmente DEC-08 (capacidad inicial 3 y ampliación solo Cuadra), DEC-10 (máximo nivel visual por titular), DEC-12 (cinco claves objetivo, cuatro aún planned), DEC-17 (app/internal sin móvil), DEC-18 (funcionalidad MiniWeb completa en Cuadra). Los precios de licencia son USD 39/59/89 por mes. El recargo GHL aprobado es **coste nativo verificable × 1,20** y no se aplica automáticamente a licencias, honorarios propios u otros proveedores.

**LÍMITE ARQUITECTÓNICO:** Vecidya administra identidad, organizaciones, licencias, MiniWeb, derechos, catálogo y facturación propia; GHL opera CRM y servicios externos contratados. Nunca derivar permisos de edición/publicación de membresía de GHL ni duplicar pipelines, contactos o cobros de GHL como fuente de verdad.

### 53.3 Secuencia ejecutable y puertas de salida

| Orden | Checkpoint | Entrega verificable | Gate focal mínimo |
| --- | --- | --- | --- |
| 0 | F0 cierre | Plan reconciliado con docs canónicos; inventario de dependencias y decisiones pendientes | diff-check documental y aprobación de dirección visual |
| 1 | V2-A/B/C | Tipos, reader V1/V2 y política visual pura | CI del SHA exacto y revisión de contratos |
| 2 | V2-D licencias | Lector D1 server-only, cuenta exacta y solo status active | aislamiento entre cuentas, estados, typecheck/build |
| 3 | V2-E renderer | Instancias repetibles por instanceId, hero único, variantes con contenido equivalente | dos galerías, DOM IDs únicos, V1 intacto |
| 4 | F2A/F2B | Cupos por titular, ampliaciones Cuadra separadas, borradores y snapshots V2 inmutables | concurrencia, downgrade, sobregiro y migración no destructiva |
| 5 | F1/F3/F4/F5/F7 | Navegación Mi Vecidya, identidad, medios/galerías, horarios y editor simple/avanzado | permisos, tablet/desktop, guard móvil, accesibilidad y autosave seguro |
| 6 | F6 | Cinco familias de plantillas, con variantes realmente renderizadas y valor visual tangible | misma funcionalidad en todos los tiers; matriz visual 3×3 por familia habilitada |
| 7 | F8 | Publicación, rollback/restauración, historial y controles admin | CAS, idempotencia, 404 desactivado, congelación y recuperación |
| 8 | F9 | QA integral focal por cambio, observabilidad, seguridad y release | matriz de aceptación, rollback ensayado, aprobación explícita de despliegue |

**Regla de ejecución:** checkpoints pequeños desde main actualizado, PR aislado, pruebas focalizadas y typecheck/build cuando corresponda; no modificar CI general ni mezclar trabajo de otros agentes. No fusionar ni desplegar sin autorización independiente.

### 53.4 Servicios y pagos: carril coordinado, no bloqueo del motor visual

El plan `SERVICIOS-PAGOS-PLAN-V1.md` mantiene su propia secuencia **B0→B7**. Se comparte `billing_account`, organizaciones y control de acceso, pero **la ejecución de MiniWeb V2 no espera al checkout automático**. Los servicios económicos solo se publicarán o cobrarán tras tarifas GHL verificadas y versionadas, políticas de impuestos/redondeo, conciliación y autorización del titular. No afirmar que existen facturas, pasarela, cobros o consumos integrados cuando solo hay diseño.

**Propuesta operativa (no decisión comercial nueva):** primera entrega técnica de Mi Vecidya/MiniWeb V2 con licencias administradas; activar pagos automáticos en release separado tras su certificación. Si se exige cobro automático en el primer release, replanificar la ruta crítica B1–B7 y sus pruebas antes de aprobar fecha.

### 53.5 Pendientes para declarar PLAN CERRADO

1. **Aprobación visual:** ejecutar el HTML real `prototypes/miniweb-tiers-comparison.html` en Playwright, 390×844, 768×1024 y 1440×900 × tres tiers; revisar nueve capturas, contraste, teclado, overflow, textos largos y equivalencia de módulos. La existencia del harness no constituye PASS.
2. **Catálogo real:** diseñar y aceptar visualmente cinco familias y sus variantes Base/Pro/Premium antes de anunciar disponibilidad. Solo Esencial está `available` en el baseline inspeccionado.
3. **Especificación de interfaces:** cerrar pantallas, estados vacíos/error/carga, permisos por rol y comportamiento de edición tableta/escritorio; no confundir prototipos con componentes productivos.
4. **Contratos transversales:** definir explícitamente fuente autoritativa D1 de derechos, chequeos de autorización server-side, versionado de snapshots, cuotas y concurrencia, reglas de restauración y fallos seguros.
5. **Economía:** validar tarifas GHL actuales por región, impuestos, costes variables, moneda, PSP, conciliación y reglas de activación; las cifras ilustrativas del plan comercial no son precios cobrables aprobados.
6. **Gobernanza documental:** consolidar #184 con índice y límite de Markdown canónicos (máximo 20 o excepción explícita), actualizar STATUS/ROADMAP/TESTING y eliminar contradicciones de secuencia antes del merge.
7. **Release:** definir responsables de aceptación, evidencia focal por checkpoint, métricas, procedimiento de rollback, checklist de privacidad/seguridad y autorización explícita para producción.

**Criterio de cierre del plan:** los siete puntos anteriores deben quedar con decisión o evidencia verificable y sin contradicciones. **Estado a este corte: PLAN MAESTRO CONSOLIDADO, AÚN NO CERRADO.** No inventar porcentaje de avance global: diseño documental, código aislado y producto entregado tienen denominadores distintos.


## 54. Matriz de aceptación funcional y dependencias críticas (2026-10-29)

**Estado:** especificación ejecutable propuesta; no equivale a pruebas ejecutadas ni a aprobación visual. Esta matriz concreta el §53 sin modificar decisiones aprobadas.

### 54.1 Criterios de aceptación por superficie

| Superficie | Escenario verificable | Criterio de salida | Dependencia |
| --- | --- | --- | --- |
| Mi Vecidya /app | Usuario con varias organizaciones | Cambio de organización no filtra datos ajenos ni cambia titular de facturación | Autorización Better Auth y D1 |
| Mi Vecidya /app | Teléfono | Mostrar aviso no operativo, sin formularios ni acciones de administración; no bloquear MiniWeb público | DEC-17 |
| Mi Vecidya /app | Tableta/escritorio | Navegación, estados vacío/carga/error y foco por teclado utilizables | F1, diseño visual |
| Editor MiniWeb | Configuración V1 publicada | Lectura/render idénticos, sin migración ni sobrescritura automática | V2-B |
| Editor MiniWeb | Dos galerías | Instancias, orden e IDs DOM independientes, con hero único primero | V2-E |
| Editor MiniWeb | Cambio de variante | El contenido y todos los módulos siguen disponibles en Cuadra/Barrio/Ciudad | DEC-18, F6 |
| Editor MiniWeb | Usuario sin permiso o licencia | Servidor rechaza guardado/publicación aunque se manipule el cliente | V2-C/D, permisos |
| Editor MiniWeb | Licencia reducida | Mantiene publicación histórica, pero deniega republish con variante no autorizada | DEC-07 |
| MiniWeb público | Tres anchos de pantalla | Sin desbordamiento horizontal, CTA y contacto legibles, foco y semántica conservados | F6, F9 |
| MiniWeb público | Desactivación administrativa | HTTP 404 neutro, noindex y exclusión de sitemap, sin filtrar causa privada | DEC-14 |
| Publicador | Dos escritores concurrentes | Solo una revisión válida se publica; el conflicto no destruye snapshot | F8, CAS |
| Historial | Restauración de versión anterior | Crea borrador nuevo; conserva historial y exige licencia vigente al republicar | F2B, F8 |
| Capacidad | Primeras tres publicaciones del titular | Permitidas con al menos una licencia activa y autorización organizacional | DEC-08 |
| Capacidad | Cuarta publicación sin ampliación | Denegada en servidor; Barrio/Ciudad no suman cupos | DEC-08 |
| Capacidad | Cuadra adicional vigente | Suma exactamente tres plazas al mismo titular, sin nueva licencia CRM implícita | F2A |
| Servicios/Pagos | Miembro de organización no delegado | No puede consultar importes ni medios de pago de otra organización | B2, permisos |
| Servicios/Pagos | Consumo GHL fraccionario | Multiplica coste verificado ×1,20 con precisión decimal; redondea al nivel de línea | DEC-BILL-01, B1 |
| Servicios/Pagos | Tarifa no verificada | No publica precio ni genera cargo automático; muestra pendiente de cotización | B1, B7 |
| Servicios/Pagos | Suscripción IA compartida | No duplica cuota al habilitar voz y conversación | B0–B4 |

### 54.2 Orden de dependencias y aislamiento de agentes

1. **Base estable:** revisar y fusionar PRs certificados solo con autorización; resolver conflictos con main por orden A→B→C→D, revalidando SHA resultante si hay rebase. No considerar los cuatro PR como integrados antes de hacerlo.
2. **Núcleo MiniWeb:** V2-E renderer y F2A/F2B modelo/capacidad, con ramas separadas y contratos compartidos revisados antes de tocar el publicador.
3. **Experiencia:** F1/F3/F4/F5/F7 pueden desarrollarse en paralelo por superficies y módulos, pero deben consumir contratos versionados y no modificar las mismas rutas simultáneamente.
4. **Catálogo:** F6 requiere evidencia visual real, variantes renderizadas y contenido equivalente; ninguna plantilla `planned` se presenta como `available` sin aceptación.
5. **Publicación y entrega:** F8 solo tras autorización/capacidad y snapshots; F9 exige pruebas focales, integración y procedimiento de rollback.
6. **Economía:** B1→B7 corre en carril independiente. No introducir migraciones de cobro ni habilitar pagos en la entrega MiniWeb por accidente.

### 54.3 Decisiones que sí requieren aprobación humana

- **VIS-01:** aprobar o corregir las composiciones Base/Pro/Premium tras revisar las nueve capturas reales; sin esta aceptación no se declara finalizado F6.
- **REL-01:** decidir si el primer lanzamiento incluye únicamente licencias administradas o también checkout/cobro automático. **Propuesta por defecto:** pagos automáticos en una segunda entrega, sin considerarlo aprobado por silencio.
- **COM-01:** aprobar tarifas GHL por región/moneda y términos de venta antes de publicarlas o cobrarlas; cifras ilustrativas no bastan.
- **GOV-01:** resolver la incorporación del plan documental al límite de Markdown canónicos (consolidación o excepción).
- **OPS-01:** designar responsable de aceptación visual, revisión de seguridad y autorización de despliegue; no asumir que el agente puede aprobarse a sí mismo.

### 54.4 Condiciones para cerrar F0 sin confundirlo con entregar F9

**F0 se considera definido** cuando existen contratos coherentes de datos/permisos, matriz de aceptación trazable, dependencias y secuencia sin conflictos, inventario de decisiones pendientes y gobernanza documental reconciliada. La aceptación visual final puede seguir siendo un gate de F6 y las tarifas reales un gate de B1/B7, siempre que estén explícitamente marcadas como tales.

**F9 se considera entregado** solo con componentes integrados, pruebas y evidencia de producción aprobada. No usar “plan cerrado” como sinónimo de “producto terminado”.

**Estado a este corte:** matriz de aceptación documentada; aprobaciones VIS-01, REL-01, COM-01, GOV-01 y OPS-01 pendientes. V2-D obtuvo CI SUCCESS y PR #194 listo para revisión, sin merge.


## 55. Contrato de pantallas Mi Vecidya y editor (especificación F1/F7, 2026-10-29)

**Naturaleza:** alcance y aceptación de producto; los componentes V2 aquí descritos son objetivos, no pantallas ya implementadas. Reutilizar rutas y permisos reales tras contraste con main actualizado; no crear endpoints basándose únicamente en esta tabla.

| Pantalla / estado | Datos mínimos | Acción principal | Estado vacío/error | Control servidor |
| --- | --- | --- | --- | --- |
| Inicio Mi Vecidya | Organización activa, MiniWeb, licencia, capacidad y próximos pasos | Continuar configuración | Sin organización: onboarding; error: reintento | Sesión y organización autorizada |
| Selector de organizaciones | Lista de organizaciones accesibles y rol | Cambiar contexto | Sin acceso: no exponer datos de terceros | Revalidar cada operación; selector no concede permisos |
| Mi negocio | Identidad, categoría, dirección, contacto, horarios | Guardar perfil | Campos incompletos con guía; validación explícita | business-profile:update |
| MiniWeb resumen | URL pública, borrador, versión publicada, estado, variante, cuota | Abrir editor / publicar | Sin publicación: vista previa y guía | Lectura de licencia/capacidad por titular |
| Editor simple | Secciones, contenido, portada, orden y vista previa | Guardar borrador | Módulo sin contenido: placeholder no publicable cuando obligatorio | Guardado autenticado, validación V2 |
| Editor avanzado | Instancias repetibles, composición, variantes, SEO y ajustes permitidos | Configurar y previsualizar | Variante no disponible: explicar licencia, no ocultar contenido | Entitlement visual efectivo y validación de variante |
| Historial | Versiones inmutables, fecha, actor y estado | Restaurar a borrador | Sin versiones: estado inicial; conflicto: recargar | Organización autorizada; CAS y auditoría |
| Licencias y capacidad | Planes activos del titular, publicaciones ocupadas y ampliaciones | Consultar detalle / solicitar ampliación | Sin licencia: explicar bloqueo sin crear derecho | Cuenta facturación real, no membresía |
| Servicios y pagos | Suscripciones, consumos, facturas y movimientos **solo cuando existan** | Ver detalle o solicitar servicio | Sin PSP: indicar pago no habilitado, nunca simular cobro | Permiso económico explícito |

**Estados globales:** loading, vacío, error recuperable, sin permiso, conflicto de revisión, suspensión de edición, sin licencia, licencia insuficiente, desactivación admin, servicio externo no disponible. Toda operación mutante debe ofrecer resultado inequívoco y no depender exclusivamente de estado visual.

**Dispositivos:** /app e /internal bloquean acciones en móvil; editor escritorio con secciones/lienzo/inspector y tableta con paneles secuenciales. La vista previa móvil es una simulación en dispositivo permitido; la MiniWeb pública permanece responsive.

**Navegación:** Inicio → Mi negocio → MiniWeb (resumen, editor, historial) → Licencias/capacidad → Servicios/pagos; solo mostrar accesos autorizados. La ocultación de navegación nunca reemplaza el control servidor.

### 55.1 Criterios de diseño pendientes de aprobación

- Jerarquía final, densidad, iconografía, composición y estados de pantallas privadas.
- Microcopy de bloqueos por licencia y cuotas, con acciones de resolución no engañosas.
- Aceptación visual de variantes por familia, incluyendo ausencia de imágenes, textos largos y negocios de distinta categoría.
- Definir propietario de la aprobación visual; no declarar aprobado por inclusión en el plan.

## 56. Matriz de plantillas por familia y entregables reales (F6, 2026-10-29)

**Invariante DEC-18:** todas las familias y todos los niveles visuales usan el mismo conjunto de módulos técnicamente disponibles. Ninguna familia ni tier reserva productos, servicios, FAQ, horarios, galerías o medios por precio.

| Familia | Template key | Baseline confirmado | Objetivo Base | Objetivo Pro | Objetivo Premium |
| --- | --- | --- | --- | --- | --- |
| General / Esencial | `vecidya-default` | available, variante legacy standard | Composición base accesible | Dirección editorial distinta | Composición premium distinta |
| Servicios | `services-studio` | planned | Hero dividido, servicios en tarjetas | Hero asimétrico, mosaico | Hero editorial, narrativa de contenido |
| Comercio / Catálogo | `catalog-store` | planned | Fichas claras y filtros solo si están implementados para todos | Rejilla editorial y énfasis de producto | Composición de catálogo premium |
| Gastronomía | `gastronomy-table` | planned | Menú, horarios, ubicación y CTA claros | Jerarquía gastronómica editorial | Fotografía y narrativa premium |
| Profesional | `professional-profile` | planned | Presentación, servicios, confianza y contacto | Perfil editorial | Dirección de marca premium |

**La distribución de claves por licencia del DEC-12 es un objetivo histórico que debe leerse junto a DEC-18:** si se mantiene un acceso exclusivo a ciertas familias por plan, entraría en tensión con el principio de funcionalidades iguales y la disponibilidad de diseños adecuados para cada sector en Cuadra. **No cambiar silenciosamente la matriz aprobada**: registrar para decisión si cada familia debe tener Base accesible desde Cuadra y reservar solo variantes Pro/Premium a Barrio/Ciudad. Hasta entonces, no anunciar disponibilidad de plantillas planned.

### 56.1 Definition of Done por variante visual

1. Existe renderer real versionado, no solo entrada de catálogo.
2. Mantiene exactamente las mismas secciones y acciones que Base; sin capacidades de pago implícitas.
3. Tiene composición distintiva perceptible más allá de color/fuente.
4. Soporta móvil 390px, tableta 768px y escritorio 1440px; sin scroll horizontal ni CTA oculto.
5. Funciona con texto largo, medios faltantes, varias galerías y orden variable de módulos.
6. Cumple navegación de teclado, foco visible, semántica y movimiento reducido.
7. Pruebas focales y capturas reales revisadas, sin afirmar certificación WCAG no realizada.
8. Estado `available` solo tras aceptación y compatibilidad con snapshots V1/V2.

### 56.2 Gate de decisión sobre acceso por familia

**CAT-01 (pendiente de aprobación):** opción recomendada: **cada una de las cinco familias dispone de Base para Cuadra; Barrio desbloquea Pro y Ciudad Premium en todas las familias**. Se mantiene el catálogo progresivo de implementaciones, pero no se interpreta como prohibición funcional por sector. Requiere ajustar explícitamente DEC-12, el registry y los mensajes comerciales una vez aprobado. Hasta entonces prevalece DEC-12 sin inventar permisos nuevos.

## 57. Backlog de integración por dependencias y evidencias (2026-10-29)

| Bloque | Trabajo mínimo antes de integración | Evidencia obligatoria | Exclusiones |
| --- | --- | --- | --- |
| Contratos V2-A/B/C/D | Revisar cambios aislados, resolver imports y permisos, revalidar SHA tras rebase | CI exacto + tests focales + typecheck/build | Merge automático |
| Renderer V2-E | Render por instanceId, V1 sin regresión, hero único, repetibles | 2 galerías, IDs únicos, snapshot fixture V1 | Cambios a GHL |
| Datos F2B | Snapshot V2, CAS, restauración no destructiva | Conflicto concurrente, rollback, integridad | Migrar histórico destructivamente |
| Cupos F2A | Ledger de publicaciones y ampliaciones Cuadra | 3 iniciales, +3 por Cuadra, traslado y sobrecupo | Reusar license CRM como cupo extra |
| App F1/F7 | Navegación, permisos, editor y preview | Tablet/desktop, móvil bloqueado, sin acceso cruzado | Rehacer auth |
| Visual F3/F4/F5/F6 | Identidad, galerías, horarios, variantes | Matriz visual real y regresión focal | Activar módulos inexistentes |
| Publicación F8 | Validación de licencia, cuota y versión, admin deactivate | CAS, idempotencia, 404 y sitemap | Deploy sin autorización |
| QA F9 | Matriz de regresión acotada, métricas, reversión | Informe por SHA y entorno, aceptación responsable | Certificar solo por diseño |

**Riesgos abiertos:** divergencia DEC-12/DEC-18 (CAT-01), tarifas no verificadas (COM-01), aceptación visual (VIS-01), gobernanza documental (GOV-01), alcance de pagos (REL-01). No establecer fecha de lanzamiento sin resolver la ruta crítica y capacidad de ejecución.


## 58. Auditoría de huecos y contradicciones — registro para resolución (2026-10-29)

**Método:** contraste documental de §21, §34, §37–57, `CONTRATO-VARIANTES-V2.md` y `SERVICIOS-PAGOS-PLAN-V1.md`. Esta revisión identifica inconsistencias verificables dentro de la planificación; **no certifica** el estado del código de main ni reemplaza pruebas. Cada hueco conserva ID, gravedad, dueño funcional y cierre exigido.

### 58.1 Hallazgos priorizados

| ID | Severidad | Hueco / evidencia documental | Resolución propuesta y gate |
| --- | --- | --- | --- |
| GAP-01 | Bloqueante | §21 F1 promete shell móvil/escritorio y F7 completar editor desde móvil, mientras DEC-17 (§36) bloquea /app y /internal en móvil | **Corregir interpretación:** DEC-17 prevalece; editor solo tableta/escritorio y MiniWeb público móvil. Tests de guard por superficie y viewport |
| GAP-02 | Bloqueante | DEC-12 (§34) reserva claves de familias a Barrio/Ciudad, DEC-18 (§38) exige MiniWeb completo desde Cuadra y §56 propone Base por familia | **CAT-01:** solicitar aprobación explícita para Base en cinco familias desde Cuadra, Pro Barrio, Premium Ciudad. Hasta aprobación, mantener DEC-12 y no anunciar familias planned |
| GAP-03 | Alto | §51 y `CONTRATO-VARIANTES-V2.md` llaman V2-D al renderer; PR #194 es lector D1 | Mantener PR #194 como V2-D y usar V2-E renderer, V2-F editor, V2-G QA; sincronizar contrato antes de integración |
| GAP-04 | Alto | §21 F4 propone retención/GC y §34 DEC-15 prohíbe borrado físico automático en V2 inicial | DEC-15 prevalece: historial append-only y medios referenciados preservados; GC solo fase posterior con política aprobada y test restore |
| GAP-05 | Alto | §21 F6 describe niveles como Cuadra esencial/Barrio avanzado/Ciudad completo; DEC-18 exige funcionalidad igual | Reescribir en ejecución como Base/Pro/Premium **solo visual**, con misma matriz de módulos en todos los tiers |
| GAP-06 | Alto | §21 F2A menciona organizaciones autorizadas sin licencia CRM; faltan reglas exactas de autorización de MiniWeb por organización | Especificar permiso de organización + derecho visual por billing_account + cuota independiente; probar owner/delegado, membresía revocada y cross-tenant |
| GAP-07 | Alto | El reader V2-D obtiene licencias D1 pero no hay ruta integrada que demuestre autorización del solicitante antes de consultar titular | Crear integración server-side que resuelva titular desde sesión/organización autorizada; nunca aceptar billingAccountId del cliente sin verificación |
| GAP-08 | Alto | Capacidad +3 por Cuadra adicional definida, pero ledger, transferencias y reserva concurrente no implementados | Contrato de ocupación atómica y ampliación explícita, pruebas 0/3/6/9, sobrecupo y transferencias |
| GAP-09 | Alto | Modelo V2 permite instancias repetibles, pero V1 indexa por tipo e IDs DOM por tipo | Renderer y writer versionados con instanceId estable, hero único, dos galerías y compatibilidad de snapshots |
| GAP-10 | Alto | Restauración/historial definidos, pero límites de tamaño, referencias R2 y fallo parcial no están cerrados | Presupuesto medido de configuración y medios; transacción/CAS, referencias y restauración con archivos ausentes |
| GAP-11 | Alto | §45–50 dispone de prototipo y harness pero sin nueve capturas del artefacto real | Ejecutar Playwright sobre HTML exacto; revisar visualmente 3×3 y accesibilidad antes de aprobar VIS-01 |
| GAP-12 | Alto | Cinco familias descritas, cuatro planned; no hay diseño final ni renderer real para todas | Inventario por familia, variante, fixture, estado y aceptación; no cambiar a available sin prueba |
| GAP-13 | Alto | Servicios/pagos describe entidades y tarifas de referencia, pero no PSP, jurisdicción, impuesto ni contrato de impago | PAY-01/BILL-02 y COM-01 con responsables; ningún cobro o tarifa pública sin aprobación |
| GAP-14 | Alto | PR #184 contiene tres Markdown nuevos; gobierno limita número de documentos canónicos | Consolidar o aprobar excepción GOV-01; actualizar índice y canónicos sin duplicar fuentes de verdad |
| GAP-15 | Medio | §21 F9 y §53/54 exigen pruebas, pero faltan responsables, calendario de integración y rollback probado | OPS-01, evidencias por SHA/entorno, runbook de reversión y aceptación explícita |
| GAP-16 | Medio | UX de pantalla comercial mezcla importes estimados y reales sin definición de frescura | Mostrar fuente, timestamp, estado estimado/conciliado, moneda y periodo; pruebas de ausencia de datos |
| GAP-17 | Medio | Decisión de vídeos condiciona activación a costes/seguridad; catálogo visual podría sugerir soporte inmediato | Feature flag apagado hasta evaluación de capacidad, proveedor, abuso, privacidad y límites; fallback sin vídeo |
| GAP-18 | Medio | Varias secciones históricas de PLAN-V1 conservan redacción previa a DEC-17/18 | Añadir nota de precedencia y limpiar contradicciones en revisión editorial final; no borrar historia de decisiones |

### 58.2 Regla de precedencia para agentes

1. Las decisiones **explícitamente aprobadas y posteriores** prevalecen sobre propuestas y texto histórico (DEC-17 sobre §21 F1/F7; DEC-18 sobre §21 F6).
2. Una propuesta nueva (CAT-01, REL-01, PAY-01) **no sustituye** una decisión aprobada sin aprobación del titular.
3. El código real, los PR y la CI del SHA exacto determinan qué está implementado/probado; la documentación no lo certifica.
4. Las reglas de seguridad de cierre seguro prevalecen ante ausencia de permisos, tarifa, licencia, capacidad o versión.

### 58.3 Plan de resolución sin bloquear trabajo seguro

- **Ronda R1 — corrección documental sin nuevas decisiones:** GAP-01, 03, 04, 05, 18. Unificar contrato y notas de precedencia; mantener histórico trazable.
- **Ronda R2 — contratos técnicos:** GAP-06, 07, 08, 09, 10, 16, 17. Resolver mediante PRs focales y pruebas de autorización, CAS, instancias y recursos.
- **Ronda R3 — evidencia visual y comercial:** GAP-02, 11, 12, 13. CAT-01, VIS-01, COM-01, PAY-01 y BILL-02 requieren aprobación o evidencia.
- **Ronda R4 — gobernanza y release:** GAP-14, 15. Conciliar canónicos, roles, gates y rollback.

**Cierre de hueco:** registrar `OPEN → SPECIFIED → IMPLEMENTED → VERIFIED → CLOSED`, responsable, PR/SHA, test focal y evidencia de aceptación. Un hueco documentado no se considera solucionado; ningún cierre se infiere de una ejecución CI no relacionada.

**Resultado:** 18 huecos registrados; cinco contradicciones documentales priorizadas en R1, y el resto con gate explícito. El plan sigue **en consolidación**, no certificado como cerrado.


## 59. R2 — contratos técnicos para cerrar GAP-06 a GAP-10 (2026-10-29)

**Estado:** contratos propuestos para implementación, no pruebas ejecutadas ni código fusionado. La inspección documental previa identifica las entidades `billing_account`, `organization_license`, snapshots V1, CAS y R2; antes de escribir migraciones o rutas debe verificarse cada nombre y relación contra `main` actualizado.

### 59.1 GAP-06/07 — identidad, organización y derechos en servidor

**Secuencia obligatoria en cada operación de lectura sensible, guardado o publicación:**
1. Validar sesión autenticada; obtener `userId` exclusivamente del proveedor de autenticación.
2. Resolver `organizationId` de ruta/selección y comprobar permiso específico del usuario sobre esa organización **en servidor**. Un selector no otorga autorización.
3. Resolver el `billingAccountId` canónico desde la organización y sus relaciones persistidas, nunca de un campo de formulario o query param. Comprobar asociación y titularidad vigentes, incluyendo revocaciones/transferencias.
4. Consultar licencias D1 de esa cuenta y evaluar el tier visual máximo activo, separado de los permisos CRM de cada organización.
5. Para guardado: comprobar permiso de edición, estado de suspensión, esquema y revisión del borrador. Para publicación: comprobar además variante, cuota y estado de publicación en una operación transaccional/atómica apropiada.
6. Denegar de forma segura si faltan relaciones, la sesión expiró, hay desajuste de titular, licencia desconocida o cambio concurrente. Registrar auditoría sin filtrar información de terceros.

**Invariante:** derecho visual compartido entre organizaciones de un titular **no** implica que un miembro de una organización pueda acceder a otra. Tampoco concede permisos económicos de facturación.

**Pruebas focales mínimas:** usuario sin sesión; usuario con rol de solo lectura; usuario miembro de A que solicita B; owner con dos organizaciones; cambio de organización tras revocación; billingAccountId falsificado; licencia de otro titular; licencia pending/suspended/cancelled; suspensión con público online.

### 59.2 GAP-08 — cupos y ocupación atómica

**Modelo lógico:** `baseCapacity = hasAnyActiveLicense ? 3 : 0`; `extraCapacity = 3 × count(activeExplicitCuadraAddOns)`; `effectiveCapacity = baseCapacity + extraCapacity`. Las Cuadras adicionales son productos de capacidad explícitos y **no** se deducen del número de licencias CRM Cuadra. Barrio/Ciudad no añaden bloques.

**Ocupación:** cuenta cada publicación pública única del titular según el contrato de estado aprobado; una republicación de la misma organización no debe consumir una plaza nueva. Definir identificador estable de ocupación y titular al momento de la operación. No usar `COUNT` seguido de `INSERT` independiente sin protección de concurrencia.

**Contrato transaccional:** reservar o reutilizar plaza de forma atómica con publicación, validar titular/estado/capacidad y registrar evento auditable. En conflicto concurrente devolver respuesta recuperable sin doble ocupación ni sobrescribir snapshots. Transferencia o downgrade conserva sitios históricos, bloquea nuevas ocupaciones cuando exceden capacidad y requiere conciliación administrativa.

**Pruebas focales:** 0 licencias→0 plazas; Cuadra→3; Barrio→3; Ciudad→3; Cuadra+Barrio→3; Cuadra extra→6; dos extras→9; dos solicitudes compitiendo por última plaza; republish no ocupa nueva plaza; reducción y transferencia sin borrado.

### 59.3 GAP-09 — configuración V2 e instancias

**Esquema lógico de configuración:** `version:2`, `templateKey`, `variantKey`, `templateVersion`, `modules: [{instanceId,type,enabled,sortOrder,layoutVariant,settings}]`. Los campos definitivos y tipos deben alinearse con el lector dual V2-B y el registry V2-A al integrar PRs.

**Invariantes:** `instanceId` único y estable, orden determinista, hero único y primero, módulos repetibles solo si su definición lo admite, IDs DOM basados en instanceId y no en type. El renderer puede variar presentación por tier pero no quitar módulos funcionales. La lectura de V1 es no destructiva y mantiene apariencia legacy.

**Pruebas focales:** dos galerías con distinto orden y medios, IDs DOM sin colisión, módulo desconocido rechazado, duplicación de instanceId rechazada, hero ausente o duplicado rechazado, V1 fixture visual/semántico preservado.

### 59.4 GAP-10 — snapshots, CAS y medios históricos

**Persistencia:** separar borrador editable, snapshot publicado inmutable y referencias de medios de cada versión. Una restauración crea nuevo borrador con origen auditado; nunca sobrescribe el snapshot histórico. Publicación comprueba revisión de borrador y versión vigente mediante CAS o transacción equivalente.

**Medios:** mantener assets referenciados por cualquier snapshot histórico recuperable. Desactivar un medio en borrador no lo elimina físicamente ni invalida publicaciones. Antes de publicar/restaurar validar propiedad, tipo, tamaño y existencia del asset; no servir medios de otros titulares. Respetar DEC-15: sin borrado físico automático en V2 inicial.

**Límites:** no fijar tamaño máximo V2 por intuición. Medir payloads reales con galerías múltiples, definir umbrales por campo/configuración/publicación y error explícito antes de habilitar writer. Registrar métricas de almacenamiento y coste.

**Pruebas focales:** doble publish concurrente, restore→nuevo borrador, snapshot inmutable, medio eliminado del borrador aún visible en versión publicada, medio faltante al restaurar, asset de otro titular denegado, fallo parcial sin versión huérfana.

### 59.5 Gates y propiedad

| Hueco | Estado tras este apartado | Dueño propuesto | Evidencia requerida para VERIFIED |
| --- | --- | --- | --- |
| GAP-06 | SPECIFIED | Autorización / Mi Vecidya | Tests server-side de rol, org y revocación |
| GAP-07 | SPECIFIED | Licencias / MiniWeb | Ruta real conectada a D1 y tests cross-tenant |
| GAP-08 | SPECIFIED | Datos / Publicación | Reserva atómica, pruebas de carrera y conciliación |
| GAP-09 | SPECIFIED | Renderer / Editor | Dos galerías, IDs únicos y compatibilidad V1 |
| GAP-10 | SPECIFIED | Publicación / Medios | CAS, restore, referencias históricas y pruebas de fallo |

**No cambiar a IMPLEMENTED sin PR real, ni a VERIFIED sin tests del SHA correspondiente.** Si D1 no ofrece la atomicidad requerida para una operación concreta, diseñar la secuencia compatible con el runtime antes de implementar, en lugar de afirmar transacciones no comprobadas.


## 60. R3 — cierre de especificación visual y comercial (2026-10-29)

**Alcance:** convertir GAP-02, GAP-11, GAP-12 y GAP-13 en verificaciones y decisiones ejecutables. Ninguna captura, tarifa o aprobación se presume realizada.

### 60.1 GAP-02 / CAT-01 — contrato de acceso visual pendiente

**Recomendación para aprobación:** las cinco familias sectoriales ofrecen una variante Base accesible con Cuadra; Barrio añade Pro y Ciudad añade Premium para esas mismas familias. Las tres licencias comparten idénticos módulos, campos, galerías, horarios, contactos, SEO y capacidades de publicación; el nivel superior solo altera composición, densidad, ritmo visual, animación permitida y dirección de arte. El tier visual máximo activo se comparte entre organizaciones autorizadas del mismo titular de facturación; no se comparte el CRM ni la membresía.

**Conflicto pendiente:** DEC-12 asigna algunas familias por plan; esta propuesta cambiaría esa distribución. Hasta aprobación expresa de CAT-01, no modificar el registro de plantillas ni prometer las cinco familias en Cuadra. Tras aprobar: enmendar DEC-12, textos comerciales, matriz de entitlements, fixtures y tests; no basta cambiar etiquetas.

### 60.2 GAP-11 — protocolo de validación visual 3×3

**Entrada:** HTML exacto versionado de `plans/app-mini/prototypes/miniweb-tiers-comparison.html`, script `test-miniweb-tiers.mjs`, fixtures iguales de servicios, galerías, FAQ, horarios y contacto. No sustituir por una maqueta reconstruida.

**Matriz:** Base, Pro y Premium × 390×844, 768×1024 y 1440×900. Cada una de las nueve capturas debe registrar SHA, viewport, nombre de variante y ruta del artefacto.

**Verificación automática focal:** errores JS, ancho de documento versus viewport, enlaces/CTA visibles, landmarks y encabezados, paridad de módulos, nombres accesibles, navegación por teclado básica, reducción de movimiento y ausencia de contenido truncado. **Revisión humana:** jerarquía, legibilidad, contraste perceptual, calidad de composición, diferenciación real de tiers, imágenes faltantes y textos largos.

**Gate VIS-01:** resultado PASS/FAIL por cada captura, incidencias con prioridad y aprobación explícita del responsable. Si falla una variante, no se certifica la familia. El harness existente no equivale a nueve pruebas ejecutadas.

### 60.3 GAP-12 — inventario de cinco familias y estados

| Familia | Clave | Estado inicial | Fixture exigido | Entrega para declarar available |
| --- | --- | --- | --- | --- |
| General | `vecidya-default` | available legacy | negocio local mixto, horarios, FAQ, contacto | V1 sin regresión + tres variantes V2 aprobadas |
| Servicios | `services-studio` | planned | servicios con descripción larga, CTA y galería | renderer real + 3×3 + prueba de contenido |
| Comercio | `catalog-store` | planned | catálogo amplio y productos sin foto | renderer real + 3×3 + ausencia de exclusión funcional |
| Gastronomía | `gastronomy-table` | planned | menú, horarios partidos, ubicación y medios | renderer real + 3×3 + accesibilidad |
| Profesional | `professional-profile` | planned | perfil, credenciales, servicios y agenda/contacto | renderer real + 3×3 + SEO y responsive |

**Política de disponibilidad:** `planned` → `implemented` (renderer y fixtures) → `verified` (pruebas) → `approved` (aceptación) → `available` (registro habilitado). No saltar etapas por disponer de un prototipo HTML.

### 60.4 GAP-13 — decisiones económicas y de pagos

**Sin aprobación todavía:** REL-01 (primera entrega con o sin pagos automáticos), COM-01 (tarifas oficiales regionales y condiciones), PAY-01 (PSP y jurisdicción), BILL-02 (prorrateo, impago, cancelación, devolución y cambio de titular).

**Reglas ya aprobadas que no se reabren:** Cuadra/Barrio/Ciudad USD 39/59/89 mensuales y recargo GHL exactamente 20% sobre coste base verificado. Una tarifa ilustrativa no es un precio publicable ni cobrable. Ningún cargo se activa a partir de un mockup.

**Gate comercial:** catálogo versionado con fuente y fecha, matriz de impuestos/monedas, contrato aceptado, controles de acceso económico, simulación de factura y conciliación con datos de prueba, aprobación del responsable y rollback. El alcance de release determina si B6 es bloqueante para la primera entrega.

### 60.5 Estado de los cuatro huecos

| Hueco | Estado | Motivo |
| --- | --- | --- |
| GAP-02 | SPECIFIED, decisión CAT-01 pendiente | Conflicto DEC-12/DEC-18 no aprobado |
| GAP-11 | SPECIFIED, ejecución pendiente | Harness existe, nueve capturas sin certificar |
| GAP-12 | SPECIFIED, implementación pendiente | Cuatro familias planned |
| GAP-13 | SPECIFIED, aprobación pendiente | REL-01, COM-01, PAY-01 y BILL-02 abiertos |

**Próximo trabajo seguro:** R4 gobernanza/release y conciliación editorial de contradicciones históricas; luego ejecutar pruebas visuales reales y registrar decisiones humanas. No marcar estos huecos VERIFIED por especificarlos.


## 61. R4 — gobernanza documental, integración y release seguro (2026-10-29)

**Estado:** especificación de cierre; no se ha ejecutado merge, deploy, migración ni rollback. La aprobación de responsables es humana y no se infiere del éxito de CI.

### 61.1 GAP-14 — canon documental y trazabilidad

**Fuente de verdad por dominio:**
- `PLAN-V1.md`: decisiones de producto, fases, matriz de aceptación y registro de huecos.
- `CONTRATO-VARIANTES-V2.md`: esquema de variantes y secuencia de checkpoints; su adenda §6 prevalece sobre nombres históricos.
- `SERVICIOS-PAGOS-PLAN-V1.md`: SKU, precio proveedor, markup y ciclo económico.
- `STATUS.md`, `PROJECT_STATE.md`, `ROADMAP.md` y `TESTING.md` del repositorio: estado operacional, release y evidencia de pruebas según su ubicación canónica real en main.

**Acción requerida antes de merge:** inventariar todos los Markdown canónicos y su límite de 20; decidir GOV-01 (consolidar estos tres documentos en menos archivos o aprobar excepción explícita), actualizar índice y enlaces sin duplicar políticas. No borrar documentos de otras áreas para hacer espacio.

**Control editorial:** cada decisión con ID, fecha, estado (aprobada/propuesta/sustituida), origen, efectos y pruebas. Cuando texto histórico contradiga DEC-17/18, marcarlo `HISTÓRICO / SUPERADO` o añadir referencia de precedencia; no eliminar rastros de decisiones. Comprobar links relativos, encabezados, IDs duplicados y tablas Markdown mediante chequeo focal del diff.

### 61.2 GAP-15 — responsabilidad, integración y operación

| Rol de aceptación | Responsabilidad | Estado |
| --- | --- | --- |
| Product owner | Aprobar CAT-01, REL-01 y alcance de entrega | Pendiente de designación/confirmación |
| Diseño UX/UI | Aprobar VIS-01 y matriz de capturas | Pendiente |
| Seguridad / datos | Aprobar aislamiento multi-tenant, R2, migraciones y rollback | Pendiente |
| Comercial / finanzas | Aprobar COM-01, PAY-01, BILL-02 y catálogo | Pendiente |
| Responsable técnico de release | Autorizar integración y despliegue, verificar observabilidad y reversión | Pendiente |

**Checklist por PR:** branch aislado desde main vigente; diff acotado; sin cambios accidentales de otros agentes; contratos compatibles; tests focalizados de módulos afectados; typecheck/build cuando aplique; CI del SHA exacto; descripción de migraciones, riesgos, feature flags y rollback; aprobación explícita para merge.

**Secuencia de integración propuesta:** V2-A → V2-B → V2-C → V2-D, revalidando tras cada integración; V2-E renderer; F2A/F2B; F1/F3/F4/F5/F7; F6; F8; F9. No asumir que los PRs aislados ya forman un conjunto coherente.

### 61.3 Runbook mínimo de lanzamiento y reversión

**Preflight:** confirmar rama y SHA, backup/export de D1 y referencias R2 según herramientas realmente disponibles, inventario de migraciones aditivas, feature flags V2 apagados, secretos y bindings, rutas V1, permisos de rollback y estado de Workers. Verificar salud HTTP del entorno destino, no solo build local.

**Despliegue controlado:** aplicar migraciones aprobadas en orden y con compatibilidad V1; desplegar versión inactiva o gated; verificar lectura V1, aislamiento multi-tenant, guardado de borrador, licencia/cupo, publicación V2 en cuenta de prueba, medios, 404 admin, noindex y sitemap. Activar progresivamente solo tras evidencia y aprobación.

**Observabilidad:** registrar errores por ruta, fallos de autorización, CAS/conflictos, cuotas, variantes inválidas, latencia, tamaño de snapshots, fallos de R2 y resultados de publicación. No incluir PII, tokens ni contenido privado en logs.

**Reversión:** apagar feature flag V2 y regresar al último Worker conocido bueno; preservar migraciones aditivas y snapshots nuevos, sin DROP destructivo ni restauración que borre datos de usuarios. Validar que V1 sigue sirviendo sitios históricos y que no quedan publicaciones huérfanas. Si la migración no es reversible, documentar rollback lógico/forward-fix antes de producción.

**Stop conditions:** fuga cross-tenant, cobro duplicado, corrupción de snapshot, borrado de medios históricos, variante sin derecho, sobrecupo por carrera o regresión de V1: detener activación, preservar evidencia, revertir tráfico V2 y abrir incidente.

### 61.4 Gate de cierre

| Hueco | Estado tras R4 | Para VERIFIED |
| --- | --- | --- |
| GAP-14 | SPECIFIED | Conteo real de Markdown, decisión GOV-01, índice y validación focal |
| GAP-15 | SPECIFIED | Responsables designados, simulacro de rollback y evidencia HTTP por SHA |

**Pendiente:** inventario real de Markdown, reconciliación editorial y designación humana. R4 completa la especificación, **no** la verificación de los huecos.


## 62. Verificación focal de gobernanza en main — GAP-14 (2026-10-29)

**Evidencia GIT/CODE:** inspección de árbol GitHub `main` recursivo completo (`truncated=false`): **102 archivos .md en total**, de los cuales **17** están bajo `vecidya-platform/docs/` y **2** bajo `plans/`. **No interpretar 102 como documentos canónicos**: incluye instrucciones, dependencias y material no canónico. `vecidya-platform/docs/GOVERNANCE.md` declara **máximo 20 Markdown activos**, baseline histórico de **16** y excepción OPS-001. La lista exacta de canónicos y su actualización temporal deben reconciliarse antes de inferir cupos libres.

**Consecuencia:** el PR documental añade tres Markdown en `plans/app-mini/`; **no está demostrado** que los tres sean canónicos autorizados ni que quepan en el límite. La política exige consolidación en un documento existente o autorización expresa por nuevo canónico. **GOV-01 sigue OPEN para aprobación**, aunque GAP-14 ya tiene inventario inicial verificable.

**Ruta recomendada sin tocar otros agentes:** (1) comparar tabla de canónicos de GOVERNANCE con árbol actual; (2) seleccionar un solo documento canónico para plan maestro y absorber contrato y plan económico como secciones o anexos, preservando enlaces; (3) actualizar índices y rutas en el mismo PR; (4) comprobar diffs y referencias; (5) solicitar aprobación si se necesita excepción. No borrar los tres archivos antes de decidir cómo preservar el historial y las referencias.


## 63. Cierre editorial F0 — inventario canónico y decisiones sin ambigüedad (2026-10-29)

**Inspección verificada:** `vecidya-platform/docs/GOVERNANCE.md` en main enumera **16** documentos canónicos concretos, con tope de **20** y autorización previa para nuevos documentos. El árbol completo main tiene 102 Markdown de cualquier tipo, no 102 canónicos. Los tres Markdown del PR #184 elevarían nominalmente a **19** si todos se aprobaran como canónicos; estar por debajo del límite **no equivale a tener autorización**. La regla prioritaria es consolidar cuando un documento existente pueda alojar el contenido.

### 63.1 Resolución recomendada de GOV-01

- **Opción preferida:** integrar el plan de producto y ejecución en `vecidya-platform/docs/ROADMAP.md` (solo trabajo futuro) y la parte comercial en `vecidya-platform/docs/business/VECIDYA_PRODUCT_CATALOG.md`; derivar arquitectura técnica en `ARCHITECTURE.md` y modelo en `DATABASE.md`. Mantener el histórico detallado del PR como referencia no canónica o archivo de trabajo temporal hasta que las referencias y el contenido único se hayan preservado. Esta opción requiere partición editorial para evitar que ROADMAP mezcle decisiones ya realizadas con trabajo futuro.
- **Alternativa:** solicitar autorización expresa para un único documento canónico de plan maestro y consolidar allí los otros dos Markdown, actualizando GOVERNANCE e índices. No aprobar tres documentos independientes por silencio.
- **Bloqueo real:** elegir opción, reconciliar contenido sin pérdida y revisar diff. **GAP-14 permanece SPECIFIED**.

### 63.2 Correcciones de contradicciones aplicadas

En §21 F1/F7 se eliminó la instrucción ejecutable de editor móvil; F6 ahora diferencia niveles **solo visuales**; F4 deja explícito que no hay GC físico automático inicial. Las decisiones DEC-17/18/15 prevalecen. Estas cuatro sustituciones son **DOC** y no implican cambios de interfaz, código o tests.

### 63.3 Matriz de decisiones finales

| ID | Situación | Qué se necesita para cerrar |
| --- | --- | --- |
| CAT-01 | Propuesta, no aprobada | Acceso Base a las cinco familias desde Cuadra |
| VIS-01 | Pendiente de evidencia | Nueve capturas reales y aprobación de dirección visual |
| REL-01 | Propuesta, no aprobada | Definir si B6 pagos automáticos es requisito del primer release |
| COM-01 | Pendiente de evidencia | Tarifas GHL verificadas y aprobadas por región y vigencia |
| PAY-01 | Sin decisión | PSP, jurisdicción fiscal, liquidación y disputas |
| BILL-02 | Sin decisión | Prorrateo, impago, reembolsos y transferencias |
| GOV-01 | Sin decisión | Consolidación canónica o autorización de un nuevo documento |
| OPS-01 | Sin responsables confirmados | Product owner, diseño, seguridad, finanzas y release |

**Regla de avance:** no bloquear V2-E, F2A y F2B por PAY-01/BILL-02 si no activan cobros; sí bloquear publicación de tarifas o pagos reales. No bloquear las pruebas del prototipo por CAT-01; sí bloquear el cambio de permisos de plantillas hasta aprobación.

### 63.4 Estado honesto del cierre F0

- **Definido documentalmente:** fronteras Vecidya/GHL, secuencia, contratos técnicos, aceptación, auditoría de 18 huecos y correcciones de F1/F4/F6/F7.
- **Pendiente para F0 cerrado:** gobernanza GOV-01 y revisión de consistencia final de documentos/PR.
- **Pendiente para entregas posteriores:** ejecución visual VIS-01, decisiones comerciales, integración V2 y pruebas reales.
- **No ejecutado en este checkpoint:** pruebas de navegador, typecheck/build, merge, deploy y cobros. Solo cambios documentales en PR #184.


## 64. Plan de migración documental sin pérdida y mapa de reconciliación (2026-10-29)

**Hallazgo verificado:** `vecidya-platform/docs/ROADMAP.md` en main ya contiene planificación de Mi Vecidya/MiniWeb, y es extenso; añadir sin más ~210 k caracteres de PLAN-V1 generaría duplicación y dificultaría mantener una sola fuente de verdad. La gobernanza exige documentos por responsabilidad, no un nuevo documento por auditoría. Por ello **no se copió ni eliminó contenido en este checkpoint**.

### 64.1 Mapa de destino y reglas de preservación

| Contenido fuente del PR #184 | Destino canónico recomendado | Condición antes de trasladar |
| --- | --- | --- |
| Objetivos F0–F9, dependencias, backlog y gates | `docs/ROADMAP.md` | Fusionar con iniciativas APP-MINI ya existentes, deduplicar por ID |
| Estado real de PRs, deuda GAP y bloqueos | `docs/STATUS.md` | Contrastar HEAD/CI y no marcar PASS de producto por PASS de PR |
| Arquitectura Vecidya/GHL, separación reader/entitlement, CAS | `docs/ARCHITECTURE.md` | Mantener invariantes y referencias al código real |
| Cuotas, ledger, snapshots, titular y migraciones | `docs/DATABASE.md` | No afirmar esquema implementado antes de migración |
| Matriz de pruebas focales, visual 3×3 y regresión | `docs/TESTING.md` | Distinguir tests escritos, ejecutados y pendientes |
| Claves, familias, variantes y acceso por plan | `docs/business/VECIDYA_PRODUCT_CATALOG.md` | No aplicar CAT-01 sin aprobación |
| Tarifas GHL, markup 20%, B0–B7 | `docs/business/VECIDYA_PRODUCT_CATALOG.md` y `docs/ROADMAP.md` | Tarifas de referencia no publicables; versión y fuente |
| Rutas de Mi Vecidya, dispositivos y navegación | `docs/STRUCTURE.md` para rutas reales; `docs/ROADMAP.md` para propuestas | No presentar rutas futuras como existentes |
| Prototipo HTML y harness de nueve capturas | Artefactos de prueba no canónicos dentro de `plans/app-mini/prototypes/` hasta reubicación aprobada | Conservar fixtures y rutas; no atribuir PASS sin ejecución |
| Historial de decisiones, pendientes y conflictos | `docs/ROADMAP.md` y referencias de commit/PR | Conservar ID, fecha, estado, razón y enlace al origen |

### 64.2 Algoritmo editorial de conciliación

1. Congelar una tabla de trazabilidad `ID → sección fuente → documento destino → evidencia → estado` antes de mover contenido.
2. Inspeccionar en main los apartados existentes de ROADMAP, STATUS, ARCHITECTURE, DATABASE, TESTING y catálogo; **no sobrescribir trabajo concurrente**.
3. Integrar solo contenido único, preferiblemente como cambios pequeños por documento y PR. Mantener una sola definición vigente por decisión, enlazando antecedentes históricos.
4. Actualizar enlaces relativos y el índice de `vecidya-platform/README.md`. Revisar referencias a `plans/app-mini/` antes de eliminar o mover.
5. Verificar diff, encabezados, links locales, recuento canónico y cambios concurrentes. Mantener los archivos fuente hasta demostrar preservación completa.
6. Solicitar aprobación GOV-01 para la estrategia definitiva; no hacer merge de tres documentos nuevos por silencio.

### 64.3 Puerta de salida documental

**PASS** solo si cada DEC/GAP/Fase/B-checkpoint tiene destino trazable, no quedan contradicciones vigentes, el índice enlaza al destino, los canónicos cumplen política y la documentación de estado refleja los PR reales. **FAIL** si hay decisiones perdidas, doble política activa, rutas rotas o se atribuye implementación a documentación.

**Estado:** mapeo especificado; conciliación material pendiente. GOV-01 no aprobado; GAP-14 sigue SPECIFIED. Se preserva el contenido íntegro de #184 para evitar pérdida irreversible.


## 65. Auditoría cruzada con canónicos main: reutilización obligatoria y deuda real (2026-10-29)

**Fuentes inspeccionadas en main:** `vecidya-platform/docs/STATUS.md`, `ARCHITECTURE.md`, `DATABASE.md`, `TESTING.md`, `business/VECIDYA_PRODUCT_CATALOG.md`. Evidencia **DOC**, no nueva ejecución de pruebas ni inspección exhaustiva de código. Estos documentos son voluminosos y describen varios releases; cualquier implementación debe contrastar su afirmación con fuente y SHA actuales.

### 65.1 Capacidades V1 existentes que V2 debe preservar

| Área | Evidencia documental main | Obligación V2 |
| --- | --- | --- |
| Editor guiado | ARCHITECTURE: /app/miniweb con cinco pasos, borrador y bloqueo de navegación por cambios sin guardar | Extender experiencia, no crear segundo editor paralelo |
| Perfil de negocio | ARCHITECTURE/STATUS: /app/business-profile y datos maestros separados del borrador MiniWeb | Reutilizar entidad y guardas, no duplicar perfil |
| Publicador | ARCHITECTURE: publicación explícita de snapshot, lectura pública separada del borrador | Extender versionado sin romper snapshots publicados |
| Concurrencia | DATABASE: migración 0023 con token de revisión CAS | Reutilizar y ampliar CAS; no asumir que protege ya cupos globales |
| Ofertas y FAQ | DATABASE: migración 0024 con business_offering/business_faq tenant-scoped | Renderizar contenido existente en todos los tiers |
| Medios | ARCHITECTURE: gallery, cover, logo, icon y offering.imageAssetId; snapshot v4 y migración 0028 | Reutilizar ownership/validación; ampliar instancias y referencias históricas |
| Cabecera pública | ARCHITECTURE: MiniWebSiteHeader/Footer y MiniWebRenderer | Integrar variantes sin duplicar cabecera ni enlaces de preview |
| Administración | STATUS: /app/platform/* opera servicios, licencias y MiniWeb con guards y auditoría | Reutilizar roles platform_admin; no relajar permisos de cliente |
| Pruebas existentes | TESTING: miniweb-core-check.mjs y pruebas de perfil, con evidencias de releases anteriores | Ejecutar solo subconjuntos focales pertinentes y añadir casos V2; no atribuir PASS histórico al nuevo SHA |

### 65.2 Huecos nuevos de integración descubiertos

| ID | Severidad | Riesgo | Gate de remediación |
| --- | --- | --- | --- |
| GAP-19 | Alto | Duplicar editor o modelos de negocio ya presentes | Mapa de componentes/rutas reales antes de F1/F7 |
| GAP-20 | Alto | Confundir CAS del borrador (migración 0023) con reserva atómica de cupo por billing_account | Contrato separado de ocupación con prueba de última plaza |
| GAP-21 | Alto | Introducir un nuevo snapshot V2 sin compatibilidad explícita con snapshot público v4 | Fixtures v4 y V2, lectura dual, publicación sin migración destructiva |
| GAP-22 | Medio | Rediseñar medios sin considerar ownership y oferta imageAssetId existentes | Tests de referencias de logo/cover/gallery/offering, restauración histórica |
| GAP-23 | Medio | Interpretar documentación histórica de pruebas como PASS de V2 | Matriz por SHA, comando, entorno y resultado nuevo |

**Estado:** GAP-19 a GAP-23 = OPEN, pendientes de inspección CODE y pruebas focales. Se amplía el inventario total de huecos de **18 a 23**; no se alteran los estados de GAP-01 a GAP-18.

### 65.3 Regla de implementación de V2 sobre V1

**Extender, no duplicar:** usar contratos existentes de perfil, guardas, medias y snapshots como base; V2 introduce composición por `instanceId`, variantes visuales, cupos por titular y versionado compatible. No crear un CRM paralelo ni un segundo sistema de facturación. Antes de abrir PR de renderer/editor, producir tabla `ruta/archivo V1 → contrato a preservar → cambio V2 → test focal` a partir de CODE actual.

**No deducir de esta auditoría:** que los 23 huecos sean bugs en producción, que la migración 0023 resuelva cupos, que el snapshot v4 ya soporte instancias repetidas, o que el frontend V2 esté publicado. Son riesgos y dependencias de integración, no fallos ejecutados.

### 65.4 Próximo gate

1. Contrastar componentes y rutas con CODE de main actualizado.
2. Resolver GAP-19–23 en PRs pequeños, preservando compatibilidad V1 y pruebas existentes afectadas.
3. Reconciliar únicamente contenido nuevo en canónicos; no copiar los ~210 k caracteres del plan en ROADMAP.
4. Registrar aceptación humana de CAT-01, GOV-01 y alcance REL-01 antes de modificar derechos o pagos.


## 66. DEC-19 — MiniWeb V2 nuevo desde cero con migración selectiva de legado (2026-10-29; decisión del usuario)

**Decisión aprobada:** MiniWeb V2 es un sistema completo nuevo: **todas las secciones, su estructura, UI, composición, configuración y contrato de publicación se diseñan de cero** conforme a las políticas vigentes y a las variantes visuales Cuadra (Base), Barrio (Pro) y Ciudad (Premium). Reutilizar V1 significa aprovechar capacidades, datos o infraestructura *solo cuando sean útiles y compatibles*, nunca trasladar fielmente las secciones ni conservar su estructura por inercia.

### 66.1 Reutilización por frontera

| Elemento V1 | Política V2 |
| --- | --- |
| Componentes visuales de secciones, layouts y templates | **No copiar como secciones V2**; reconstruir diseño y esquema |
| Datos maestros del negocio, identidad, medios y ofertas | Candidatos a importación/mapeo explícito y validado, sin vinculación permanente obligatoria |
| Autenticación, tenant guards, permisos, almacenamiento de medios, utilidades seguras y CAS | Reutilización interna selectiva, tras inspección CODE y pruebas focales |
| Snapshots V1 y URLs públicas actuales | Mantener lectura/servicio legado; permitir edición/migración V2 sin alterar el snapshot histórico |
| Familias antiguas | Fuente de contenido/mapeo para conversión, **no** plantilla V2 disfrazada |
| **Horario V1: sección, datos, lógica y vínculo** | **EXCLUIDOS TOTALMENTE de la nueva sección Horario V2**: no importar, no leer como fallback, no sincronizar, no enlazar ni compartir modelo. Horario V2 se crea de cero, con datos nuevos introducidos explícitamente por el usuario |

### 66.2 Adaptación posterior de publicaciones existentes

**Flujo objetivo:** `sitio V1 publicado` → `Crear versión V2 desde publicación` → `seleccionar familia y tier visual autorizado` → `importación selectiva de contenido permitido` → `resolver campos incompatibles` → `editar nuevas secciones V2` → `previsualizar` → `publicar V2 de manera explícita`.

- La conversión crea un **borrador V2 independiente**, con `sourcePublicationId`, `migrationVersion`, reporte de campos importados/omitidos y provenance para auditoría; **no** modifica la publicación V1 ni actualiza silenciosamente el sitio público.
- Cada sección V2 posee identificadores y schema propios, sin dependencia de estructura DOM, IDs o clases CSS de V1. Un adaptador de una sola ejecución puede leer contenidos V1 **excepto horario** y producir datos V2 normalizados. El render V2 nunca depende del renderer V1.
- La publicación explícita cambia la versión activa mediante control de revisión/CAS; conservar snapshots anteriores y capacidad de recuperación. Un downgrade o falta de licencia no provoca conversión ni despublicación automática.
- La importación selectiva debe respetar titularidad tenant, permisos de medios, derechos de publicación, cupo y contenido publicado; registrar conflictos sin sobreescribir trabajo del usuario.
- **Horario V2:** estado inicial vacío o pendiente de configuración, sin valores precargados, sin sugerencias provenientes del horario V1 y sin vínculo de sincronización; su guardado y validación son nuevos. V1 sigue mostrando sus propios horarios en publicaciones históricas mientras no se publique V2, pero esos horarios nunca alimentan V2.

### 66.3 Plan técnico por checkpoints

1. **V2-SCHEMA:** diseñar desde cero catálogo de secciones y campos V2, independientes de V1; definición de capacidades iguales en Base/Pro/Premium, solo composición visual distinta.
2. **V2-HOURS:** nueva sección Horario con su propia persistencia, validación, editor y renderer; pruebas que demuestren ausencia de lectura/importación/vínculo con horarios V1.
3. **V2-ADAPTER:** inventario campo por campo de datos V1 elegibles; conversor opt-in y reporte, con blacklist absoluta de horario.
4. **V2-EDITOR:** nuevo editor de secciones V2, reutilizando únicamente shell, autenticación y servicios seguros pertinentes; no reutilizar formularios visuales de secciones V1.
5. **V2-RENDER:** cinco familias nuevas, tres variantes visuales cada una, renderer aislado de V1; pruebas 3×3 por familia, paridad funcional y accesibilidad.
6. **V2-PUBLISH:** publicación explícita, compatibilidad de snapshots y rollback lógico; pruebas focales de V1 sin regresión, CAS, ownership y cuota.
7. **V2-MIGRATE-UI:** acción de convertir una publicación antigua desde su edición, con previsualización y confirmación; no migración masiva automática.

### 66.4 Criterios de aceptación obligatorios

- **AC-19A:** ningún componente de sección V1 se registra como sección V2 sin rediseño y nuevo contrato.
- **AC-19B:** un sitio V1 permanece visual y funcionalmente intacto hasta que su titular confirme publicar V2.
- **AC-19C:** el adaptador migra únicamente contenido permitido, con reporte y reversibilidad; no duplica contactos, CRM ni entidades de negocio.
- **AC-19D:** horario V2 comienza sin datos heredados y funciona sin consultas al horario V1. Test de no importación incluso si V1 contiene horarios válidos.
- **AC-19E:** Cuadra/Barrio/Ciudad ofrecen las mismas secciones y capacidades V2, diferenciadas únicamente por diseño visual y entitlements aprobados.
- **AC-19F:** el usuario puede elegir una familia nueva al convertir V1, editar el resultado y publicar una nueva versión sin perder su historial.

**Precedencia:** DEC-19 sustituye cualquier instrucción anterior de «reutilizar secciones V1», «extender el editor de secciones existente» o «preservar la sección Horarios V1 en V2». Mantener compatibilidad pública V1 no significa vincular su horario a V2. **GAP-19 cambia de OPEN a SPECIFIED por decisión; implementación y pruebas siguen pendientes.** GAP-21/22 permanecen abiertos hasta diseñar el adaptador y verificar el código.


## 67. Primer checkpoint CODE de DEC-19 — PR #197 (2026-10-29)

**Implementación creada en rama independiente desde main:** `feat/miniweb-v2-section-contract-hours-isolation`, PR [#197](https://github.com/hola675/Vecidya/pull/197) **draft**.

**Archivos nuevos:** `app/features/miniweb-v2/sections.ts` (tipos de 12 secciones V2, cinco familias, tres variantes visuales, borrador V2 y nuevo horario vacío con validación), `app/features/miniweb-v2/migrate.ts` (importación voluntaria de campos publicados permitidos y exclusión absoluta de horarios), `tests/unit/miniweb/v2-sections.test.ts` (cuatro tests focales).

**Alcance real:** código puro inicial; no UI, no ruta, no D1, no renderer, no publicación, no migración automática, no cambio del horario legado en producción. Las pruebas están escritas, **no se declara RAN/PASS** sin ejecución de CI o local sobre SHA del PR.

**Trazabilidad:** DEC-19/AC-19C y AC-19D tienen primera implementación parcial; GAP-19 pasa de SPECIFIED a PARTIAL CODE, pendiente de UI y prueba; GAP-21/22 siguen OPEN. Próximos PRs: modelo persistente de Horario V2 separado, pruebas de ausencia de consultas a V1, renderer de secciones nuevas, editor y conversión desde publicación.


## 68. Corrección de alcance — PLANIFICACIÓN EXCLUSIVA (2026-10-29)

**Instrucción explícita del responsable:** el alcance de este trabajo es **crear, cerrar y entregar el plan**, no implementar MiniWeb V2. La creación previa de archivos ejecutables fue una desviación. Desde este checkpoint, no se crearán ni editarán archivos de aplicación, migraciones, tests o CI en nombre de esta tarea. El plan puede especificar contratos, pruebas, fases, dependencias y criterios de aceptación para que otros agentes los implementen posteriormente.

**Alcance aprobado de planificación:** catálogo y diseño de secciones V2 completamente nuevas; cinco familias × variantes visuales Base/Pro/Premium para Cuadra/Barrio/Ciudad; funcionalidades comunes; horario nuevo independiente sin lecturas/importaciones/sincronización V1; conversión opt-in de contenido publicado V1 excluyendo horario; arquitectura objetivo, datos, publicación, rollback, seguridad, cuotas, precios, accesibilidad, pruebas focalizadas propuestas, fases, responsables y decisiones humanas.

**Estado honesto:** los archivos de código introducidos en PR #184 durante la desviación son prototipos no certificados y **no constituyen una implementación autorizada**. Deben excluirse del PR de planificación y dejarse a cargo del equipo de implementación en un trabajo futuro autorizado. No declarar cierre técnico, PASS, despliegue ni disponibilidad del producto por existir documentación o prototipos.

**Cierre del plan:** cada hueco se clasifica como (A) resuelto por decisión y contrato, (B) decisión humana pendiente con dueño y fecha, o (C) investigación técnica delegada con criterio de salida. Un plan puede quedar listo para ejecución sin que el código esté implementado. El cierre de planificación requiere matriz de trazabilidad, contratos por sección, dependencias, secuencia de fases, estimaciones relativas, gates de calidad, decisiones y riesgos residuales. Ninguna tarea de implementación se ejecuta desde esta conversación.


## 69. Catálogo contractual de secciones MiniWeb V2 — diseño nuevo desde cero

**Estado: SPECIFIED FOR IMPLEMENTATION, no código.** Cada sección V2 tiene contrato propio, independiente de componentes y modelos visuales V1. Todas las secciones están disponibles funcionalmente en Cuadra/Barrio/Ciudad; las variantes Base/Pro/Premium modifican solo presentación. Las cinco familias comparten catálogo y editor; su diferencia es composición, orden inicial y lenguaje visual, nunca bloqueo funcional.

| ID | Sección V2 | Datos editables mínimos | Reglas y criterio de aceptación |
|---|---|---|---|
| S01 | Portada / Hero | título, subtítulo, CTA, imagen y alt | CTA con destino válido; imagen opcional; diseño responsive |
| S02 | Sobre el negocio | titular, descripción, bloques narrativos, imágenes | texto sanitizado; bloques ordenables |
| S03 | Servicios | elementos con título, descripción, imagen, CTA y orden | vacíos no se publican; no crear entidades CRM duplicadas |
| S04 | Productos / catálogo | elementos, categoría, imagen, descripción, CTA | sin pagos implícitos ni disponibilidad inventada |
| S05 | Galería | media, alt, orden, pie | solo media autorizada al negocio; tamaños optimizados |
| S06 | Contacto | teléfono, email, enlaces, CTA | validar URL/esquemas; no exponer datos privados |
| S07 | Ubicación / cobertura | dirección pública opcional, ciudad, zona, mapa opt-in | no revelar domicilio sin consentimiento |
| S08 | Preguntas frecuentes | pares pregunta-respuesta, orden | respuestas visibles sin JS; contenido seguro |
| S09 | Equipo | perfiles, rol, descripción, fotografía, consentimiento | no publicar información personal sin permiso |
| S10 | Certificaciones | entidad emisora, título, fecha, documento/imagen opcional | sin badges falsos ni verificación no acreditada |
| S11 | Testimonios | texto, autor público consentido, contexto | moderación y retiro; sin ratings fabricados |
| S12 | Horario V2 | zona horaria IANA, siete días, cierres, intervalos, excepciones fechadas, nota | **vacío de origen**, sin importación/consulta/sync/fallback de horarios V1 |

### 69.1 Contrato común de cada instancia

Cada instancia contiene identificador propio V2, tipo de sección, versión de esquema, estado borrador/publicable, posición, visibilidad, contenido tipado y metadatos de edición. Identificadores estables y sin colisiones; orden explícito; validación por tipo; sanitización y permisos de media. El renderer ignora instancias desconocidas sin romper la página y registra el problema para diagnóstico; el editor no elimina contenido desconocido silenciosamente. Una sección sin datos obligatorios no puede publicarse como completa.

### 69.2 Horario V2 — contrato de cero absoluto

- No reutilizar tablas, queries, formularios, componentes, valores predeterminados basados en V1 ni adaptadores de horario legado.
- Persistencia V2 independiente y tenant-scoped; cada negocio crea sus propios siete días, zona horaria y excepciones. Estado inicial: **sin configurar**; el editor puede ofrecer siete días cerrados como estructura vacía, no como dato importado.
- Día cerrado no admite intervalos; día abierto exige al menos uno. Formato 24 h; inicio anterior a fin; intervalos no superpuestos, incluso si se introducen desordenados. Turnos nocturnos requieren regla explícita de partición o soporte de cruce de día antes de implementación.
- Excepciones fechadas tienen prioridad sobre horario semanal; definir precedencia de cierres, festivos y apertura especial. Render público debe mostrar zona horaria y aclarar que el horario puede variar; no inferir «abierto ahora» sin motor de zona horaria probado.
- AC-HV2-01: negocio nuevo sin V1 guarda y publica horario V2. AC-HV2-02: negocio con horario V1 válido inicia V2 vacío. AC-HV2-03: modificar V1 después no modifica V2. AC-HV2-04: publicar V2 no modifica snapshot V1. AC-HV2-05: horarios superpuestos, zona inválida, días duplicados y excepciones contradictorias fallan validación focal.

### 69.3 Matriz de familias y variantes

| Familia | Composición editorial inicial sugerida | Base/Pro/Premium |
|---|---|---|
| Vecidya Default | portada, sobre, servicios, contacto, ubicación, horario | mismas secciones; distinta jerarquía y tratamiento visual |
| Services Studio | portada, servicios, testimonios, FAQ, contacto, horario | mismas funciones; estética orientada a servicios |
| Catalog Store | portada, productos, galería, FAQ, contacto, horario | mismas funciones; estética de catálogo |
| Gastronomy Table | portada, productos, galería, horario, ubicación, contacto | mismas funciones; estética gastronómica |
| Professional Profile | portada, sobre, certificaciones, equipo, testimonios, contacto | mismas funciones; estética profesional |

Las composiciones son **valores iniciales editables**, no restricciones. Cualquier familia puede añadir, quitar u ordenar cualquiera de las doce secciones. La matriz definitiva de variantes visuales queda sujeta a VIS-01/CAT-01; no introducir capacidades funcionales premium.

### 69.4 Gates de planificación para delegación

**GATE-SCHEMA:** especificación de contenido tipado y evolución de versión para S01–S12. **GATE-HOURS:** aislamiento demostrable V1/V2 y decisiones de nocturnidad/excepciones. **GATE-EDITOR:** estados vacío, error, guardado, preview y accesibilidad. **GATE-RENDER:** matriz cinco familias × tres variantes × tres viewports, sin diferencias funcionales. **GATE-PUBLISH:** preview/publicación explícita, CAS, tenant ownership, snapshot inmutable y rollback. **GATE-MIGRATE:** consentimiento por publicación, importación selectiva documentada, reporte, exclusión absoluta de horario. Todos son criterios para futuros agentes, **no tests ejecutados**.

### 69.5 Huecos abiertos de esta sección

- **B / Producto:** CAT-01 y VIS-01 (dueño: responsable Vecidya); decidir catálogo visual y elegibilidad exacta antes de congelar diseños.
- **B / Producto:** definir política de turnos nocturnos, excepciones y «abierto ahora» (dueño: responsable Vecidya); bloquear GATE-HOURS hasta resolución.
- **C / Ingeniería futura:** elección de tablas, transacciones, snapshots y API sin reutilizar horario V1 (dueño: agente de implementación); salida: diseño D1 revisado, no implementación en este PR.
- **C / Seguridad futura:** política de consentimiento para equipo/testimonios y retención de medios (dueño: implementación + negocio); salida: especificación de autorización y retirada.


## 70. Cierre de huecos de diseño — decisiones propuestas para ratificación

**Naturaleza:** decisiones de planificación recomendadas, no aprobaciones humanas ni implementación. Sustituyen ambigüedades técnicas de §69; prevalecen las decisiones comerciales y de gobierno aún pendientes.

### 70.1 Horarios nocturnos, festivos y excepciones (SPECIFIED)

1. El día de la semana se interpreta en la zona IANA del negocio, nunca la del navegador. Formato 24 horas; intervalo normal [inicio, fin), sin incluir el extremo final.
2. Los turnos que cruzan medianoche se representan con **intervalos partidos entre dos fechas locales**: por ejemplo lunes 22:00–martes 02:00 se almacena como lunes 22:00–24:00 y martes 00:00–02:00. **24:00** es un marcador de fin exclusivo, no una hora de inicio válida. El editor puede aceptar un turno nocturno y proponer el reparto, pero requiere confirmación explícita del usuario.
3. Las excepciones tienen fecha local y tipo **cerrado**, **horario especial** o **nota informativa**. Precedencia: excepción cerrada > horario especial > horario semanal; la nota no cambia disponibilidad. Una fecha admite como máximo una excepción operativa; duplicados contradictorios se rechazan. Los festivos no se importan automáticamente: el usuario crea o confirma cada excepción.
4. Un cierre excepcional de martes afecta el tramo que cae en martes incluso si procede de un turno iniciado el lunes. Los intervalos de fecha local se normalizan antes de aplicar precedencia. Cambio DST: se resuelve mediante zona IANA y fecha real; intervalos ambiguos/no existentes se muestran para corrección, nunca se desplazan silenciosamente.
5. «Abierto ahora» **no es requisito de primera entrega**. Se publica horario declarado con zona horaria y aviso de posibles cambios; se habilitará indicador en fase posterior solo con motor probado en DST, medianoche, excepciones y latencia.
6. Estado inicial V2: sin configurar. Ninguna lectura/importación/sugerencia desde horario V1. Si el horario no está configurado, la sección pública se oculta; no inventar «cerrado».
7. Criterios HV2-06–12: turnos nocturnos, límites 00:00/24:00, festivo cerrado, horario especial, DST, excepciones contradictorias y ausencia de inferencia de «abierto ahora» deben contar con casos focales de aceptación.

### 70.2 Editor V2 y publicación (SPECIFIED)

**Flujo de edición:** crear borrador V2 → elegir familia y variante visual permitida → editar instancias S01–S12 → validación por sección → guardar revisión con control de versión CAS → previsualizar snapshot exacto → confirmar publicación → activar nueva versión inmutable → poder revertir a snapshot anterior. «Guardar» nunca significa «publicar». La vista previa se vincula a revisión concreta, no al estado mutable del editor. En caso de conflicto CAS, se preservan ambas versiones y se solicita resolución explícita.

**Estados:** EMPTY, DRAFT, INVALID, READY, PUBLISHING, PUBLISHED, SUPERSEDED, ARCHIVED. Las transiciones y errores tienen mensajes accesibles. El renderer público no accede a borradores ni a credenciales; sirve únicamente snapshot publicado autorizado. La publicación verifica ownership, organización activa, cupo/licencia y versión CAS en servidor, no solo en UI. Las secciones desconocidas se registran como incidencia y no invalidan una publicación V1 existente.

**Aceptación:** editar sin publicar no cambia URL pública; preview y publicación muestran el mismo snapshot; conflicto concurrente no pierde cambios; rollback restaura contenido anterior sin borrar historial; ninguna organización lee/edita/publica otra; al perder licencia se aplica política de visibilidad explícita sin borrado físico automático.

### 70.3 Conversión voluntaria de publicación V1 (SPECIFIED)

Solo se ofrece desde una publicación V1 que pertenece al usuario autorizado. Pantalla de consentimiento informa qué se copiará, qué no y que la publicación original no cambiará. Se elige familia y variante V2; se crea **un borrador nuevo**, no se sobrescribe el V1. Se copia selectivamente identidad pública, textos, contacto público, localización autorizada, medios autorizados y oferta compatible, con mapeo explícito por campo y reporte de omitidos. No se copian horarios V1 bajo ningún nombre, ni datos CRM privados, credenciales, IDs de secciones, estilos ni componentes V1. No se duplican entidades de negocio ni contactos. El borrador conserva ID de procedencia solo para auditoría de conversión, nunca como fuente dinámica de contenido.

**Gates:** consentimiento verificable; mapeo versionado; permisos/medios; idempotencia mediante solicitud identificada; no publicar automáticamente; V1 intacto hasta publicación explícita V2; rollback lógico disponible; pruebas con V1 que tenga horario válido demuestran V2 vacío y ausencia de consultas al horario antiguo.

### 70.4 Matriz visual de diseño (SPECIFIED, pendiente VIS-01)

Las cinco familias comparten las doce secciones y acciones. **Base**: jerarquía tipográfica y bloques simples, navegación y CTAs accesibles. **Pro**: composición editorial avanzada, tarjetas y galería con mayor riqueza visual, sin funcionalidades adicionales. **Premium**: dirección de arte y ritmo visual más distintivos, composiciones de portada y transiciones opcionales respetando reduced-motion, sin funciones adicionales. Las 15 combinaciones (5 familias × 3 variantes) se validan en móvil, tableta y escritorio, además de estados vacío, error y contenido extenso. La aprobación VIS-01 requiere capturas reales y acta de aceptación; las definiciones aquí son criterios para diseñarlas, **no aceptación de capturas inexistentes**.

### 70.5 Fases, responsables y salida (SPECIFIED)

| Fase | Responsable propuesto | Dependencias | Entregable futuro / gate |
|---|---|---|---|
| P0 Contratos | Arquitectura + producto | CAT-01, decisión nocturnidad | esquemas S01–S12 y reglas de compatibilidad revisadas |
| P1 Dominio y persistencia V2 | Backend + seguridad | P0 | D1 aislado, tenancy, CAS, snapshot, pruebas de aislamiento |
| P2 Editor nuevo | Frontend + accesibilidad | P0, P1 | edición completa, validación, preview y estados |
| P3 Renderer y familias | Diseño + frontend | P0, VIS-01 | 15 variantes y matriz responsive sin paridad funcional rota |
| P4 Publicación y rollback | Backend + QA | P1–P3 | snapshot inmutable, ownership, cuotas, rollback |
| P5 Conversión opt-in | Backend + frontend + QA | P1–P4 | mapeo consentido, auditoría, V1 intacto y horario V2 vacío |
| P6 Servicios, pagos y lanzamiento | Producto + finanzas + operaciones | COM-01, PAY-01, BILL-02, REL-01, OPS-01 | política comercial aprobada y release autorizado |

Cada fase exige revisión de seguridad, pruebas focales en archivos tocados y evidencia asociada al SHA; no ejecutar suites generales ni modificar CI global por defecto. El responsable humano aprueba decisiones comerciales y despliegue; los agentes no se autoaprueban. No hay estimaciones calendario fiables hasta asignar equipo y capacidad.

### 70.6 Registro de decisiones aún humanas

- **CAT-01:** confirmar cinco familias disponibles en los tres niveles, con paridad funcional (recomendado: sí).
- **VIS-01:** aceptar las composiciones visuales reales, una vez presentadas.
- **REL-01:** lanzar inicialmente con licencias administradas y checkout automático después (recomendado).
- **COM-01/PAY-01/BILL-02:** moneda, tarifas GHL regionales, PSP, jurisdicción, impuestos, impago y condiciones contractuales; sin cifras o cobros públicos antes de aprobación.
- **GOV-01:** consolidar documentos canónicos o aprobar excepción; recomendación: consolidación con índice y referencias, sin duplicar fuentes.
- **OPS-01:** nombrar responsables humanos de diseño, seguridad y release.
- **HV2-PRODUCT:** ratificar partición de turnos nocturnos, excepciones por fecha y no mostrar «abierto ahora» en primera entrega.

**Resultado:** los cinco huecos de diseño enumerados al final de §69 quedan **SPECIFIED** como contratos y propuesta de secuencia. Las aprobaciones listadas siguen **PENDING HUMAN**, nunca CLOSED por silencio. El proyecto sigue en estado de planificación, no implementación.


## 71. Acta de decisiones aprobadas por el responsable — 2026-10-29

**Fuente de autoridad:** aprobación explícita del responsable del proyecto en esta conversación: `familias=yes; horario=yes; lanzamiento=manual; pagos=pending`. Este acta **prevalece sobre las menciones de pendiente o recomendado** para las cuatro decisiones concretas aprobadas en §§54, 56, 69 y 70. No supone aprobación de otras decisiones ni autorización de implementación, merge o despliegue.

| Decisión | Estado vinculante | Alcance aprobado |
|---|---|---|
| **CAT-01** | **APPROVED** | Las cinco familias `vecidya-default`, `services-studio`, `catalog-store`, `gastronomy-table`, `professional-profile` están disponibles en Cuadra, Barrio y Ciudad; todas ofrecen las mismas secciones y funcionalidades. Base/Pro/Premium solo alteran presentación. |
| **HV2-PRODUCT** | **APPROVED** | Horario V2 creado desde cero, sin leer/importar/sincronizar V1. Se aprueba el contrato de §70.1: turnos nocturnos partidos por fecha local, excepciones fechadas con precedencia, zona IANA, sin indicador «abierto ahora» en primera entrega. |
| **REL-01** | **APPROVED** | Primer lanzamiento con **licencias administradas**; checkout y cobro automático quedan para una entrega posterior sujeta a aprobación específica. |
| **COM-01 / PAY-01 / BILL-02** | **PENDING HUMAN — ratificado** | No se eligen todavía PSP, jurisdicción, tratamiento fiscal, moneda/tarifas GHL regionales, impagos ni condiciones contractuales. No publicar precios regionales no aprobados ni activar cobros automáticos. |

### 71.1 Efectos inmediatos sobre la planificación

- **P0:** CAT-01 y HV2-PRODUCT dejan de bloquear el cierre de contratos; mantener las revisiones técnicas de arquitectura, seguridad y aceptación.
- **P3:** se pueden diseñar las quince combinaciones visuales sin bloquear funciones por nivel; **VIS-01 sigue pendiente** de revisión y aceptación de diseños reales.
- **P6:** dividir en **P6A — lanzamiento con licencias administradas** y **P6B — automatización de checkout/cobro**. P6A no depende de tener un PSP elegido, pero sí de la política operativa, comercial y legal aplicable a licencias administradas y de OPS-01. P6B permanece bloqueada por COM-01/PAY-01/BILL-02 y aprobación expresa.
- La documentación histórica que presenta CAT-01, HV2-PRODUCT o REL-01 como «pendiente» refleja el estado anterior a este acta; **no reabrirlas sin una nueva decisión explícita**.

### 71.2 Pendientes que NO se consideran aprobados

**VIS-01** (aceptación visual real), **COM-01** (tarifas, regiones, monedas y términos), **PAY-01** (proveedor y flujo de pagos), **BILL-02** (facturación, impuestos e impago), **GOV-01** (gobierno documental) y **OPS-01** (responsables de diseño, seguridad y autorización de release). Las decisiones sobre permisos, retención y consentimiento también requieren sus revisiones correspondientes. Ninguna se infiere por silencio.

**Estado del proyecto:** decisiones de producto anteriores aprobadas; el PR #184 continúa siendo **exclusivamente de planificación**. No ejecutar código, migraciones, pruebas ni despliegues como consecuencia de este acta.
